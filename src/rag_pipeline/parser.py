"""
PDF Parser module.

Responsible only for:
- validating PDF input
- extracting structured elements
- returning LangChain Documents

It does NOT save files.
Exporting is handled separately.
"""


from pathlib import Path
from collections import Counter
from typing import List

from langchain_core.documents import Document
from langchain_unstructured import UnstructuredLoader

from . import config
from .logger import logger



class PDFParser:
    """
    Production PDF parser using Unstructured.

    Supports:
    - text extraction
    - tables
    - titles
    - images
    - layout detection
    """

    def __init__(
        self,
        pdf_path: Path | None = None,
        strategy: str | None = None
    ):

        self.pdf_path = (
            pdf_path 
            if pdf_path 
            else config.PDF_PATH
        )

        self.strategy = (
            strategy
            if strategy
            else config.PARSER_STRATEGY
        )

        self.validate()


    # -----------------------------------------
    # Validation
    # -----------------------------------------

    def validate(self):
        """
        Validate input document.
        """

        if not self.pdf_path.exists():
            raise FileNotFoundError(
                f"PDF not found: {self.pdf_path}"
            )


        if self.pdf_path.suffix.lower() != ".pdf":
            raise ValueError(
                "Input file must be PDF"
            )


    # -----------------------------------------
    # Parsing
    # -----------------------------------------

    def parse(self) -> List[Document]:
        """
        Extract document elements.

        Returns:
            List of LangChain Document objects
        """


        logger.info(
            f"Parsing started: {self.pdf_path.name}"
        )


        loader = UnstructuredLoader(
            file_path=str(self.pdf_path),
            strategy=self.strategy
        )


        documents = loader.load()


        logger.info(
            f"Extracted {len(documents)} elements"
        )


        self.generate_report(
            documents
        )


        return documents



    # -----------------------------------------
    # Quality Report
    # -----------------------------------------

    def generate_report(
        self,
        documents: List[Document]
    ):
        """
        Generate extraction statistics.
        """


        categories = Counter(
            doc.metadata.get(
                "category",
                "Unknown"
            )
            for doc in documents
        )


        empty_count = sum(
            1
            for doc in documents
            if not doc.page_content.strip()
        )


        total_chars = sum(
            len(doc.page_content)
            for doc in documents
        )


        avg_chars = (
            total_chars / len(documents)
            if documents
            else 0
        )


        logger.info(
            "========== PARSER REPORT =========="
        )


        logger.info(
            f"Elements: {len(documents)}"
        )


        logger.info(
            f"Empty elements: {empty_count}"
        )


        logger.info(
            f"Average characters: {avg_chars:.2f}"
        )


        logger.info(
            f"Categories: {dict(categories)}"
        )


        logger.info(
            "===================================="
        )



# -----------------------------------------
# Convenience function
# -----------------------------------------

def parse_pdf(
    pdf_path: Path | None = None
):
    """
    Simple parser interface.
    """

    parser = PDFParser(
        pdf_path
    )

    return parser.parse()