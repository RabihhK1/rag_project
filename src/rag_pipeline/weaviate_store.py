"""
Weaviate Vector Store

Stores document chunks and embeddings
inside Weaviate.
"""


from typing import List

import weaviate

from langchain_core.documents import Document

from langchain_weaviate import WeaviateVectorStore

from weaviate.classes.config import Configure


from .logger import logger
from . import config



class WeaviateStore:


    def __init__(self):


        logger.info(
            "Connecting to Weaviate"
        )


        self.client = weaviate.connect_to_local()


        logger.info(
            "Connected to Weaviate"
        )



    def store(
    self,
    documents,
    vectors
):


        logger.info(
        f"Uploading {len(documents)} vectors"
    )


        collection_name = "CISControls"


        if not self.client.collections.exists(collection_name):

            self.client.collections.create(

                name=collection_name,

                vector_config=Configure.Vectors.self_provided()

    )


        collection = (
        self.client.collections.get(
            collection_name
        )
    )


        for doc, vector in zip(
        documents,
        vectors
    ):


            collection.data.insert(

    properties={

        "text":
            doc.page_content,

        "metadata":
            str(doc.metadata)

    },


    vector={
        "default": vector
    }

)


    logger.info(
        "Vector upload completed"
    )



    def close(self):

        self.client.close()

        logger.info(
            "Weaviate connection closed"
        )