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



    async def ask(
        self,
        question: str,
        conversation_id: str | None = None
    ):


        # ==========================
        # Create conversation
        # ==========================

        if not conversation_id:


            conversation_id = str(
                uuid4()
            )


            await conversations_collection.insert_one(

                {

                    "conversation_id": conversation_id,

                    "title": question[:40],

                    "created_at":
                        datetime.now(timezone.utc),

                    "updated_at":
                        datetime.now(timezone.utc)

                }

            )



        # ==========================
        # Save user message
        # ==========================

        await messages_collection.insert_one(

            {

                "conversation_id": conversation_id,

                "role": "user",

                "content": question,

                "created_at":
                    datetime.now(timezone.utc)

            }

        )



        # ==========================
        # RAG Pipeline
        # ==========================

        documents = self.retriever.search(

            question,

            limit=5

        )



        answer = self.generator.generate(

            question,

            documents

        )



        # ==========================
        # Prepare sources
        # ==========================

        sources = []


        for doc in documents:


            sources.append(

                {

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

                }

            )



        # ==========================
        # Save assistant message
        # ==========================

        await messages_collection.insert_one(

            {

                "conversation_id": conversation_id,

                "role": "assistant",

                "content": answer,

                "sources": sources,

                "created_at":
                    datetime.now(timezone.utc)

            }

        )



        # ==========================
        # Update conversation timestamp
        # ==========================

        await conversations_collection.update_one(

            {

                "conversation_id": conversation_id

            },


            {

                "$set":

                {

                    "updated_at":
                        datetime.now(timezone.utc)

                }

            }

        )



        return {


            "conversation_id":
                conversation_id,


            "answer":
                answer,


            "sources":
                sources

        }