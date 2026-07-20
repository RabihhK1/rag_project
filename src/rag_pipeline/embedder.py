"""
Embedding Stage

Converts document chunks into vector embeddings.

Model:
    BAAI/bge-small-en-v1.5

Features:
    - Local HuggingFace inference
    - GPU/CPU detection
    - Batch processing
    - Normalized embeddings
    - Quality report
    - Logging
"""


from typing import List, Tuple
from collections import Counter

import numpy as np
import torch

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from .logger import logger
from . import config



class DocumentEmbedder:
    """
    Creates embeddings from document chunks.
    """



    def __init__(
        self,
        batch_size: int = 32
    ):

        self.batch_size = batch_size

        self.device = self._get_device()


        logger.info(
            f"Loading embedding model: {config.EMBEDDING_MODEL}"
        )


        logger.info(
            f"Embedding device: {self.device}"
        )


        self.model = HuggingFaceEmbeddings(

            model_name=config.EMBEDDING_MODEL,

            model_kwargs={
                "device": self.device
            },

            encode_kwargs={

                # Important for cosine similarity
                "normalize_embeddings": True,

                "batch_size": self.batch_size
            }
        )



    # --------------------------------------------------
    # Device detection
    # --------------------------------------------------

    def _get_device(self):

        """
        Detect CUDA availability.
        """

        if torch.cuda.is_available():

            gpu_name = torch.cuda.get_device_name(0)

            logger.info(
                f"GPU detected: {gpu_name}"
            )

            return "cuda"


        logger.warning(
            "CUDA unavailable. Using CPU"
        )

        return "cpu"



    # --------------------------------------------------
    # Main embedding function
    # --------------------------------------------------

    def embed(
        self,
        documents: List[Document]
    ) -> Tuple[List[Document], List[List[float]]]:


        logger.info(
            f"Embedding {len(documents)} chunks"
        )


        texts = [
            doc.page_content
            for doc in documents
        ]



        # Generate vectors

        vectors = self.model.embed_documents(
            texts
        )



        self._embedding_report(
            documents,
            vectors
        )


        return documents, vectors



    # --------------------------------------------------
    # Embedding quality report
    # --------------------------------------------------

    def _embedding_report(
        self,
        documents,
        vectors
    ):


        logger.info(
            "========== EMBEDDING REPORT =========="
        )


        total = len(vectors)



        empty_vectors = sum(

            1
            for v in vectors
            if len(v) == 0

        )



        dimensions = (
            len(vectors[0])
            if total > 0
            else 0
        )



        # Calculate vector norms

        norms = [

            np.linalg.norm(v)

            for v in vectors

        ]



        average_norm = (

            sum(norms) / len(norms)

            if norms

            else 0

        )



        # Metadata categories

        categories = Counter(

            doc.metadata.get(
                "category",
                "unknown"
            )

            for doc in documents

        )



        logger.info(
            f"Chunks embedded: {total}"
        )


        logger.info(
            f"Vector dimension: {dimensions}"
        )


        logger.info(
            f"Empty vectors: {empty_vectors}"
        )


        logger.info(
            f"Average vector norm: {average_norm:.4f}"
        )


        logger.info(
            f"Categories: {dict(categories)}"
        )


        logger.info(
            "======================================"
        )