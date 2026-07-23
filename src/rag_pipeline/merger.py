"""
Advanced document merger.

Purpose:
- Reconstruct meaningful sections after PDF parsing.
- Preserve titles and hierarchy.
- Prepare documents for chunking.

Unstructured splits PDFs into layout elements.
This module rebuilds logical sections.
"""


from typing import List

from langchain_core.documents import Document

from .logger import logger
from . import config



class DocumentMerger:
    """
    Title-aware document merger.

    Rules:

    1. Titles start new sections.
    2. Paragraphs belong to current title.
    3. Tables/lists stay with their section.
    4. Very large sections are flushed.
    """



    def __init__(
        self,
        max_section_chars: int | None = None
    ):

        self.max_section_chars = (
            max_section_chars
            if max_section_chars
            else config.MAX_SECTION_CHARS
        )



    def merge(
        self,
        documents: List[Document]
    ) -> List[Document]:


        logger.info(
            f"Merging {len(documents)} elements"
        )


        merged = []


        current_text = []

        current_metadata = {}

        current_title = None



        def flush():

            """
            Save current section.
            """

            nonlocal current_text
            nonlocal current_metadata


            if not current_text:
                return


            text = "\n\n".join(
                current_text
            )


            merged.append(

                Document(

                    page_content=text,

                    metadata={
                        **current_metadata,
                        "section_title":
                            current_title
                    }

                )

            )


            current_text = []



        for doc in documents:


            text = (
                doc.page_content
                .strip()
            )


            if not text:
                continue



            category = doc.metadata.get(
                "category",
                ""
            )



            # -------------------------
            # New title detected
            # -------------------------

            if category == "Title":


                # Save previous section

                flush()


                current_title = text


                current_metadata = (
                    doc.metadata.copy()
                )


                current_text.append(
                    text
                )


                continue



            # -------------------------
            # Normal content
            # -------------------------

            current_text.append(
                text
            )



            if not current_metadata:

                current_metadata = (
                    doc.metadata.copy()
                )



            # -------------------------
            # Section too large
            # -------------------------

            size = sum(
                len(x)
                for x in current_text
            )


            if size >= self.max_section_chars:

                flush()



        # Save remaining

        flush()



        logger.info(
            f"Created {len(merged)} logical sections"
        )


        return merged