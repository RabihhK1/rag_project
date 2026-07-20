"""
Document cleaning layer.

Improves parsed documents before chunking.
"""


from typing import List
from langchain_core.documents import Document

from .logger import logger



class DocumentCleaner:


    def __init__(
        self,
        remove_empty=True,
        remove_images=True,
        remove_headers=True
    ):

        self.remove_empty = remove_empty

        self.remove_images = remove_images

        self.remove_headers = remove_headers



    def clean(
        self,
        documents: List[Document]
    ) -> List[Document]:

        logger.info(
            f"Cleaning {len(documents)} documents"
        )


        cleaned = []


        for doc in documents:


            if self.remove_empty:

                if not doc.page_content.strip():

                    continue



            category = doc.metadata.get(
                "category",
                ""
            )


            if self.remove_images:

                if category == "Image":

                    continue



            if self.remove_headers:

                if category == "Header":

                    continue



            doc.metadata = self.clean_metadata(
                doc.metadata
            )


            cleaned.append(doc)



        logger.info(
            f"Remaining documents: {len(cleaned)}"
        )


        return cleaned



    def clean_metadata(
        self,
        metadata
    ):

        allowed = [

            "source",

            "filename",

            "page_number",

            "category",

            "languages"

        ]


        return {

            key:value

            for key,value in metadata.items()

            if key in allowed

        }