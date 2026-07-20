import json
from pathlib import Path

from .logger import logger



class EmbeddingExporter:


    def __init__(
        self,
        output_path="output/embeddings/embeddings.json"
    ):

        self.path = Path(output_path)



    def export(
        self,
        documents,
        vectors
    ):


        self.path.parent.mkdir(
            parents=True,
            exist_ok=True
        )


        data=[]


        for doc, vector in zip(
            documents,
            vectors
        ):

            data.append(

                {
                    "text":
                        doc.page_content,

                    "metadata":
                        doc.metadata,

                    "embedding":
                        vector
                }

            )


        with open(
            self.path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                data,
                f,
                indent=2
            )


        logger.info(
            f"Saved embeddings: {self.path}"
        )