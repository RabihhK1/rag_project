"""
Document structure enhancement.

Purpose:
- Restore document hierarchy after PDF parsing.
- Detect titles and sections.
- Add useful metadata for later merging/chunking.

This module does NOT:
- parse PDFs
- chunk documents
- create embeddings
- access Weaviate
"""


from typing import List

from langchain_core.documents import Document

from .logger import logger



class StructureEnhancer:
    """
    Restores logical structure from parsed PDF elements.
    """


    def __init__(self):
        pass



    def enhance(
        self,
        documents: List[Document]
    ) -> List[Document]:

        logger.info(
            f"Enhancing structure of {len(documents)} documents"
        )


        enhanced = []


        current_section = None


        for doc in documents:


            text = doc.page_content.strip()


            if not text:
                continue



            metadata = doc.metadata.copy()



            category = metadata.get(
                "category",
                ""
            )



            # -----------------------------
            # Detect titles
            # -----------------------------

            if category == "Title":

                current_section = text


                metadata["section_title"] = (
                    current_section
                )



            else:

                if current_section:

                    metadata["section_title"] = (
                        current_section
                    )



            # -----------------------------
            # Add hierarchy information
            # -----------------------------

            metadata["element_type"] = (
                category
            )


            enhanced.append(

                Document(

                    page_content=text,

                    metadata=metadata

                )

            )



        logger.info(
            f"Structure enhancement completed: {len(enhanced)} documents"
        )


        return enhanced