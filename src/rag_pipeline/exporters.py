"""
Export utilities for the RAG pipeline.

Responsible for converting internal
pipeline objects into persistent formats.
"""


import json
from pathlib import Path
from datetime import datetime
from typing import List, Any

import numpy as np

from langchain_core.documents import Document

from . import config
from .logger import logger



class JSONExporter:
    """
    Export LangChain Documents into JSON.

    Keeps metadata and text together
    for debugging and future processing.
    """


    def __init__(
        self,
        output_path: Path | None = None
    ):

        self.output_path = (
            output_path
            if output_path
            else config.PARSED_JSON
        )


    # -----------------------------------
    # Main export function
    # -----------------------------------

    def export(
        self,
        documents: List[Document]
    ):
        """
        Export documents to JSON.
        """


        logger.info(
            "Starting JSON export"
        )


        data = []


        for idx, doc in enumerate(documents):

            element = {

                "id": idx,

                "text": doc.page_content,

                "metadata": self.clean_metadata(
                    doc.metadata
                )

            }


            data.append(element)



        self.output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )


        output = {

            "pipeline": "RAG ingestion",

            "created_at":
                datetime.now().isoformat(),

            "document_count":
                len(data),

            "documents":
                data

        }


        with open(
            self.output_path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                output,
                f,
                indent=4,
                ensure_ascii=False
            )


        logger.info(
            f"Saved JSON: {self.output_path}"
        )



    # -----------------------------------
    # Metadata cleaning
    # -----------------------------------

    def clean_metadata(
        self,
        obj: Any
    ):
        """
        Convert unsupported objects
        into JSON-safe values.
        """


        if isinstance(
            obj,
            dict
        ):

            return {
                key:
                self.clean_metadata(value)

                for key,value in obj.items()
            }



        elif isinstance(
            obj,
            list
        ):

            return [
                self.clean_metadata(item)
                for item in obj
            ]



        elif isinstance(
            obj,
            tuple
        ):

            return [
                self.clean_metadata(item)
                for item in obj
            ]



        elif isinstance(
            obj,
            np.generic
        ):

            return obj.item()



        else:

            return obj