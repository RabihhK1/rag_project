import sys
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4


ROOT_DIR = Path(__file__).resolve().parents[3]

sys.path.append(str(ROOT_DIR))


from src.rag_pipeline.retriever import Retriever
from src.rag_pipeline.generator import Generator


from app.database import (
    conversations_collection,
    messages_collection
)



class RAGService:


    def __init__(self):

        print("Loading RAG pipeline...")


        self.retriever = Retriever()

        self.generator = Generator()


        print("RAG pipeline ready")





    async def _create_conversation(
        self,
        question: str
    ):


        conversation_id = str(
            uuid4()
        )


        await conversations_collection.insert_one({

            "conversation_id":
                conversation_id,

            "title":
                question[:40],

            "created_at":
                datetime.now(timezone.utc),

            "updated_at":
                datetime.now(timezone.utc)

        })


        return conversation_id






    async def _save_user_message(
        self,
        conversation_id: str,
        question: str
    ):


        message_id = str(
            uuid4()
        )


        await messages_collection.insert_one({

            "message_id":
                message_id,

            "conversation_id":
                conversation_id,

            "role":
                "user",

            "content":
                question,

            "created_at":
                datetime.now(timezone.utc)

        })


        return message_id






    def _prepare_sources(
        self,
        documents
    ):


        sources = []


        for doc in documents:


            sources.append({

                "page":
                    doc.metadata.get(
                        "page_number"
                    ),


                "section":
                    doc.metadata.get(
                        "section_title"
                    ),


                "source":
                    doc.metadata.get(
                        "source"
                    ),


                "score":
                    doc.metadata.get(
                        "rerank_score"
                    )

            })


        return sources






    async def _save_assistant_message(
        self,
        conversation_id: str,
        answer: str,
        sources: list
    ):


        message_id = str(
            uuid4()
        )


        await messages_collection.insert_one({

            "message_id":
                message_id,


            "conversation_id":
                conversation_id,


            "role":
                "assistant",


            "content":
                answer,


            "sources":
                sources,


            "created_at":
                datetime.now(timezone.utc)

        })


        return message_id






    async def _update_conversation(
        self,
        conversation_id: str
    ):


        await conversations_collection.update_one(

            {

                "conversation_id":
                    conversation_id

            },


            {

                "$set":

                {

                    "updated_at":
                        datetime.now(timezone.utc)

                }

            }

        )








    # ==================================
    # Existing normal generation
    # DO NOT REMOVE
    # ==================================

    async def ask(
        self,
        question: str,
        conversation_id: str | None = None
    ):


        if not conversation_id:

            conversation_id = await self._create_conversation(
                question
            )



        await self._save_user_message(

            conversation_id,

            question

        )



        documents = self.retriever.search(

            question,

            limit=5

        )



        answer = self.generator.generate(

            question,

            documents

        )



        sources = self._prepare_sources(

            documents

        )



        message_id = await self._save_assistant_message(

            conversation_id,

            answer,

            sources

        )



        await self._update_conversation(

            conversation_id

        )



        return {


            "conversation_id":
                conversation_id,


            "message_id":
                message_id,


            "answer":
                answer,


            "sources":
                sources

        }







    # ==================================
    # NEW SSE STREAMING GENERATION
    # ==================================

    async def ask_stream(
        self,
        question: str,
        conversation_id: str | None = None
    ):


        if not conversation_id:

            conversation_id = await self._create_conversation(
                question
            )



        await self._save_user_message(

            conversation_id,

            question

        )



        documents = self.retriever.search(

            question,

            limit=5

        )



        sources = self._prepare_sources(

            documents

        )


        full_answer = ""



        for token in self.generator.stream_generate(

            question,

            documents

        ):


            full_answer += token


            yield {

                "type":
                    "token",


                "content":
                    token

            }





        message_id = await self._save_assistant_message(

            conversation_id,

            full_answer,

            sources

        )


        await self._update_conversation(

            conversation_id

        )



        yield {


            "type":
                "done",


            "conversation_id":
                conversation_id,


            "message_id":
                message_id,


            "sources":
                sources

        }