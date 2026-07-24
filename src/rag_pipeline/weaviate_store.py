"""Weaviate Vector Store"""

import weaviate
from weaviate.classes.config import Configure

from .logger import logger
from . import config


class WeaviateStore:
    """
    Stores document chunks and embeddings into Weaviate.
    """

    def __init__(self, collection_name: str | None = None):
        self.collection_name = (
            collection_name if collection_name else config.COLLECTION_NAME
        )
        logger.info("Connecting to Weaviate")
        self.client = weaviate.connect_to_local(
            host=config.WEAVIATE_HOST,
            port=config.WEAVIATE_PORT,
            grpc_port=config.WEAVIATE_GRPC_PORT,
        )
        logger.info("Connected to Weaviate")

    def store(self, documents, vectors):
        logger.info(f"Uploading {len(documents)} vectors")

        if not self.client.collections.exists(self.collection_name):
            self.client.collections.create(
                name=self.collection_name,
                vector_config=Configure.Vectors.self_provided(),
            )

        collection = self.client.collections.get(self.collection_name)

        for doc, vector in zip(documents, vectors):
            collection.data.insert(
                properties={
                    "text": doc.page_content,
                    "metadata": str(doc.metadata),
                },
                vector={"default": vector},
            )

        logger.info("Vector upload completed")

    def close(self):
        if self.client:
            self.client.close()
            logger.info("Weaviate connection closed")
