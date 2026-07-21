import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]

sys.path.append(str(ROOT_DIR))


from src.rag_pipeline.retriever import Retriever
from src.rag_pipeline.generator import Generator

class RAGService:

    def __init__(self):

        print("Loading RAG pipeline...")

        self.retriever = Retriever()

        self.generator = Generator()

        print("RAG pipeline ready")


    def ask(self, question: str):

        documents = self.retriever.search(
            question,
            limit=5
        )

        answer = self.generator.generate(
            question,
            documents
        )


        sources = []

        for doc in documents:

            sources.append(
                {
                    "page": doc.metadata.get("page_number"),
                    "section": doc.metadata.get("section_title"),
                    "source": doc.metadata.get("source"),
                    "score": doc.metadata.get("rerank_score")
                }
            )


        return {
            "answer": answer,
            "sources": sources
        }