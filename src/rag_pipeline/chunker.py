"""
Chunking module for RAG pipeline.

Converts cleaned documents into
retrieval optimized chunks.
"""


from typing import List

from langchain_core.documents import Document

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)


from . import config
from .logger import logger



class DocumentChunker:
    """
    Production document chunker.

    Uses recursive splitting while
    preserving metadata.
    """



    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None
    ):


        self.chunk_size = (
            chunk_size
            if chunk_size
            else config.CHUNK_SIZE
        )


        self.chunk_overlap = (
            chunk_overlap
            if chunk_overlap
            else config.CHUNK_OVERLAP
        )


        self.splitter = (
            RecursiveCharacterTextSplitter(

                chunk_size=self.chunk_size,

                chunk_overlap=self.chunk_overlap,

                separators=[
                    "\n\n",
                    "\n",
                    ". ",
                    " ",
                    ""
                ]

            )
        )



    def chunk(
        self,
        documents: List[Document]
    ) -> List[Document]:
        """
        Split documents into chunks.
        """


        logger.info(
            f"Chunking {len(documents)} documents"
        )


        chunks = (
            self.splitter.split_documents(
                documents
            )
        )


        self.add_chunk_metadata(
            chunks
        )


        logger.info(
            f"Created {len(chunks)} chunks"
        )


        self.report(
            chunks
        )


        return chunks



    def add_chunk_metadata(
        self,
        chunks
    ):

        for idx, chunk in enumerate(chunks):

            chunk.metadata[
                "chunk_id"
            ] = idx



    def report(
        self,
        chunks
    ):


        lengths = [

            len(chunk.page_content)

            for chunk in chunks

        ]


        average = (

            sum(lengths)
            /
            len(lengths)

        )


        logger.info(
            "========== CHUNK REPORT =========="
        )


        logger.info(
            f"Chunks: {len(chunks)}"
        )


        logger.info(
            f"Average size: {average:.2f} chars"
        )


        logger.info(
            f"Smallest: {min(lengths)}"
        )


        logger.info(
            f"Largest: {max(lengths)}"
        )


        logger.info(
            "=================================="
        )