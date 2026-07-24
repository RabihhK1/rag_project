import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.database import conversations_collection, messages_collection
from app.services.response_versions import (
    get_root_message_id,
    group_assistant_messages,
)


ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.append(str(ROOT_DIR))

from src.rag_pipeline.generator import Generator
from src.rag_pipeline.retriever import Retriever


class RAGService:
    def __init__(self):
        print("Loading RAG pipeline...")
        self.retriever = Retriever()
        self.generator = Generator()
        print("RAG pipeline ready")

    async def _create_conversation(self, question: str, user_id: str) -> str:
        conversation_id = str(uuid4())
        now = datetime.now(timezone.utc)

        await conversations_collection.insert_one(
            {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "title": question[:40],
                "created_at": now,
                "updated_at": now,
            }
        )

        return conversation_id

    async def _save_user_message(
        self,
        conversation_id: str,
        question: str,
        user_id: str,
    ) -> str:
        message_id = str(uuid4())

        await messages_collection.insert_one(
            {
                "message_id": message_id,
                "conversation_id": conversation_id,
                "user_id": user_id,
                "role": "user",
                "content": question,
                "created_at": datetime.now(timezone.utc),
            }
        )

        return message_id

    def _prepare_sources(self, documents) -> list[dict]:
        return [
            {
                "page": document.metadata.get("page_number"),
                "section": document.metadata.get("section_title"),
                "source": document.metadata.get("source"),
                "score": document.metadata.get("rerank_score"),
                "snippet": " ".join(document.page_content.split())[:320],
            }
            for document in documents
        ]

    async def _save_assistant_message(
        self,
        conversation_id: str,
        answer: str,
        sources: list,
        user_id: str,
        user_message_id: str | None = None,
    ) -> str:
        """Save a normal answer as version 1 of a stable response group."""

        message_id = str(uuid4())
        created_at = datetime.now(timezone.utc)

        await messages_collection.insert_one(
            {
                "message_id": message_id,
                "conversation_id": conversation_id,
                "user_id": user_id,
                "role": "assistant",
                "content": answer,
                "sources": sources,
                "root_message_id": message_id,
                "version_number": 1,
                "is_active_version": True,
                "user_message_id": user_message_id,
                "turn_created_at": created_at,
                "created_at": created_at,
            }
        )

        return message_id

    async def _update_conversation(self, conversation_id: str, user_id: str) -> None:
        await conversations_collection.update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {"$set": {"updated_at": datetime.now(timezone.utc)}},
        )

    async def ask(
        self,
        question: str,
        conversation_id: str | None = None,
        user_id: str = "",
    ) -> dict:
        if not conversation_id:
            conversation_id = await self._create_conversation(question, user_id)
        elif not await conversations_collection.find_one({"conversation_id": conversation_id, "user_id": user_id}):
            raise ValueError("Conversation not found")

        user_message_id = await self._save_user_message(conversation_id, question, user_id)
        documents = self.retriever.search(question, limit=5)
        answer = self.generator.generate(question, documents)
        sources = self._prepare_sources(documents)
        message_id = await self._save_assistant_message(
            conversation_id,
            answer,
            sources,
            user_id,
            user_message_id,
        )
        await self._update_conversation(conversation_id, user_id)

        return {
            "conversation_id": conversation_id,
            "message_id": message_id,
            "root_message_id": message_id,
            "version_number": 1,
            "answer": answer,
            "sources": sources,
        }

    async def ask_stream(
        self,
        question: str,
        conversation_id: str | None = None,
        user_id: str = "",
    ):
        if not conversation_id:
            conversation_id = await self._create_conversation(question, user_id)
        elif not await conversations_collection.find_one({"conversation_id": conversation_id, "user_id": user_id}):
            yield {"type": "error", "content": "Conversation not found."}
            return

        user_message_id = await self._save_user_message(conversation_id, question, user_id)
        documents = self.retriever.search(question, limit=5)
        sources = self._prepare_sources(documents)
        full_answer = ""

        for token in self.generator.stream_generate(question, documents):
            full_answer += token
            yield {"type": "token", "content": token}

        message_id = await self._save_assistant_message(
            conversation_id,
            full_answer,
            sources,
            user_id,
            user_message_id,
        )
        await self._update_conversation(conversation_id, user_id)

        yield {
            "type": "done",
            "conversation_id": conversation_id,
            "message_id": message_id,
            "root_message_id": message_id,
            "version_number": 1,
            "sources": sources,
        }

    async def _get_response_group(
        self,
        message: dict,
        user_id: str,
    ) -> tuple[str, dict, list[dict]]:
        """Resolve a selected version to its v1 root and every sibling."""

        assistant_messages = await messages_collection.find(
            {
                "conversation_id": message["conversation_id"],
                "user_id": user_id,
                "role": "assistant",
            }
        ).to_list(length=None)
        # Keep the mapping explicit; the helper also understands legacy
        # parent_message_id chains produced before root_message_id existed.
        messages_by_id = {
            item["message_id"]: item
            for item in assistant_messages
            if item.get("message_id")
        }
        root_message_id = get_root_message_id(message, messages_by_id)
        groups = group_assistant_messages(assistant_messages)
        versions = groups.get(root_message_id, [message])
        root_message = next(
            (
                item
                for item in versions
                if item.get("message_id") == root_message_id
            ),
            versions[0],
        )

        return root_message_id, root_message, versions

    async def get_response_versions(self, message_id: str, user_id: str) -> dict | None:
        """Return every version for a response group, regardless of selected id."""

        selected_message = await messages_collection.find_one(
            {"message_id": message_id, "role": "assistant", "user_id": user_id}
        )
        if not selected_message:
            return None

        root_message_id, _, versions = await self._get_response_group(selected_message, user_id)
        serialized_versions = []

        for version_number, version in enumerate(versions, start=1):
            serialized_versions.append(
                {
                    key: value
                    for key, value in version.items()
                    if key != "_id"
                }
                | {
                    "root_message_id": root_message_id,
                    "version_number": version_number,
                }
            )

        return {
            "root_message_id": root_message_id,
            "versions": serialized_versions,
        }

    async def regenerate_stream(
        self,
        message_id: str,
        conversation_id: str,
        user_id: str,
    ):
        """Generate a new variant without creating a new conversation turn."""

        selected_message = await messages_collection.find_one(
            {
                "message_id": message_id,
                "conversation_id": conversation_id,
                "user_id": user_id,
                "role": "assistant",
            }
        )
        if not selected_message:
            yield {
                "type": "error",
                "content": "Assistant response not found.",
            }
            return

        root_message_id, root_message, versions = await self._get_response_group(
            selected_message, user_id
        )
        user_message_id = (
            root_message.get("user_message_id")
            or selected_message.get("user_message_id")
        )
        user_message = None

        if user_message_id:
            user_message = await messages_collection.find_one(
                {
                    "message_id": user_message_id,
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "role": "user",
                }
            )

        if not user_message:
            # Legacy answers do not have user_message_id. Always use the
            # original response's timestamp, never a later regenerated one.
            turn_created_at = (
                root_message.get("turn_created_at")
                or root_message.get("created_at")
            )
            user_message = await messages_collection.find_one(
                {
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "role": "user",
                    "created_at": {"$lte": turn_created_at},
                },
                sort=[("created_at", -1)],
            )

        if not user_message:
            yield {
                "type": "error",
                "content": "Could not find the original question for this response.",
            }
            return

        question = user_message["content"]
        user_message_id = user_message["message_id"]
        turn_created_at = (
            root_message.get("turn_created_at")
            or root_message.get("created_at")
            or user_message.get("created_at")
            or datetime.now(timezone.utc)
        )

        # Upgrade legacy v1/v2/v3 records to the flat, stable group shape as
        # they are next regenerated. This also fixes old chained variants.
        for version_number, version in enumerate(versions, start=1):
            fields = {
                "root_message_id": root_message_id,
                "version_number": version_number,
                "user_message_id": user_message_id,
                "turn_created_at": turn_created_at,
            }
            if version.get("message_id") != root_message_id:
                fields["parent_message_id"] = root_message_id

            await messages_collection.update_one(
                {"message_id": version["message_id"], "user_id": user_id},
                {"$set": fields},
            )

        documents = self.retriever.search(question, limit=5)
        sources = self._prepare_sources(documents)
        yield {"type": "sources", "sources": sources}

        full_answer = ""
        for token in self.generator.stream_generate(question, documents):
            full_answer += token
            yield {"type": "token", "content": token}

        new_message_id = str(uuid4())
        next_version_number = len(versions) + 1
        now = datetime.now(timezone.utc)

        await messages_collection.update_many(
            {
                "message_id": {
                    "$in": [version["message_id"] for version in versions]
                },
                "user_id": user_id,
            },
            {"$set": {"is_active_version": False}},
        )
        await messages_collection.insert_one(
            {
                "message_id": new_message_id,
                "conversation_id": conversation_id,
                "user_id": user_id,
                "role": "assistant",
                "content": full_answer,
                "sources": sources,
                "root_message_id": root_message_id,
                # Retained for compatibility with existing records/clients.
                "parent_message_id": root_message_id,
                "version_number": next_version_number,
                "is_active_version": True,
                "user_message_id": user_message_id,
                "turn_created_at": turn_created_at,
                "created_at": now,
            }
        )
        await self._update_conversation(conversation_id, user_id)

        yield {
            "type": "done",
            "conversation_id": conversation_id,
            "message_id": new_message_id,
            "root_message_id": root_message_id,
            "parent_message_id": root_message_id,
            "version_number": next_version_number,
            "sources": sources,
        }

    async def regenerate(
        self,
        message_id: str,
        conversation_id: str,
        user_id: str,
    ) -> dict:
        """Non-streaming wrapper around regenerate_stream."""

        full_answer = ""
        sources = []
        final_event = None

        async for event in self.regenerate_stream(message_id, conversation_id, user_id):
            if event["type"] == "token":
                full_answer += event["content"]
            elif event["type"] == "sources":
                sources = event["sources"]
            elif event["type"] == "error":
                return {"error": event["content"]}
            elif event["type"] == "done":
                final_event = event

        if not final_event:
            return {"error": "Regeneration ended before a response was created."}

        return {
            "conversation_id": conversation_id,
            "message_id": final_event["message_id"],
            "root_message_id": final_event["root_message_id"],
            "parent_message_id": final_event["parent_message_id"],
            "version_number": final_event["version_number"],
            "answer": full_answer,
            "sources": sources,
        }
