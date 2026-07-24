"""
Retriever

Responsible for:
1. Loading embedding model
2. Embedding user queries
3. Searching Weaviate
4. Returning LangChain Documents
"""

import ast
import weaviate
from sentence_transformers import SentenceTransformer
from langchain_core.documents import Document

from .logger import logger
from .reranker import Reranker
from . import config


class Retriever:
    def __init__(
        self,
        collection_name: str | None = None,
        model_name: str | None = None,
    ):
        logger.info("Initializing retriever")

        self.collection_name = (
            collection_name if collection_name else config.COLLECTION_NAME
        )
        self.model_name = (
            model_name if model_name else config.EMBEDDING_MODEL
        )

        try:
            self.model = SentenceTransformer(
                self.model_name,
                local_files_only=True,
            )
        except OSError:
            # A new setup can still download the model when it is not cached.
            self.model = SentenceTransformer(self.model_name)
        logger.info(f"Embedding model loaded: {self.model_name}")

        self.client = weaviate.connect_to_local(
            host=config.WEAVIATE_HOST,
            port=config.WEAVIATE_PORT,
            grpc_port=config.WEAVIATE_GRPC_PORT,
        )
        logger.info("Connected to Weaviate")

        self.collection = self.client.collections.get(self.collection_name)
        logger.info(f"Retriever ready (collection={self.collection_name})")
        self.reranker = Reranker()

    def search(
        self,
        query: str,
        limit: int | None = None,
        search_limit: int | None = None,
    ):
        if limit is None:
            limit = config.DEFAULT_TOP_K
        if search_limit is None:
            search_limit = config.DEFAULT_SEARCH_LIMIT

        logger.info(f"Searching: {query}")

        query_vector = self.model.encode(
            query, normalize_embeddings=True
        ).tolist()

        results = self.collection.query.near_vector(
                near_vector=query_vector,
                limit=search_limit,
            return_metadata=["distance"],
            )

        documents = []

        for index, item in enumerate(results.objects, start=1):
            text = item.properties.get("text", "")
            distance = getattr(item.metadata, "distance", 0)
            raw_metadata = item.properties.get("metadata", "{}")

            try:
                metadata = ast.literal_eval(raw_metadata)
            except Exception:
                metadata = {}

            doc_metadata = {
                "source": metadata.get("source"),
                "page_number": metadata.get("page_number"),
                "section_title": metadata.get("section_title"),
                "chunk_id": metadata.get("chunk_id"),
                "distance": distance,
            }

            doc = Document(page_content=text, metadata=doc_metadata)
            documents.append(doc)

            logger.info(
                f"RESULT {index} | "
                f"distance={distance:.4f} | "
                f"page={doc_metadata['page_number']} | "
                f"section={doc_metadata['section_title']}"
            )

        logger.info(
    f"Retrieved {len(documents)} documents before reranking"
)

        documents = self.reranker.rerank(query, documents, top_k=limit)

        logger.info(
            f"Returning {len(documents)} documents after reranking"
        )

        return documents

    def close(self):
        if self.client:
            self.client.close()
            logger.info("Retriever closed")
