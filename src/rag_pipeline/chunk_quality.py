"""
Chunk quality evaluation.
"""


from collections import Counter

from langchain_core.documents import Document

from .logger import logger



class ChunkQualityAnalyzer:



    def analyze(
        self,
        chunks
    ):


        logger.info(
            "Running chunk quality analysis"
        )


        lengths = [

            len(
                c.page_content
            )

            for c in chunks

        ]


        empty = sum(

            1

            for c in chunks

            if not c.page_content.strip()

        )


        duplicates = self.find_duplicates(
            chunks
        )


        logger.info(
            "========== QUALITY REPORT =========="
        )


        logger.info(
            f"Chunks: {len(chunks)}"
        )


        logger.info(
            f"Empty chunks: {empty}"
        )


        logger.info(
            f"Duplicate chunks: {duplicates}"
        )


        logger.info(
            f"Average length: {sum(lengths)/len(lengths):.2f}"
        )


        logger.info(
            "=====================================")



    def find_duplicates(
        self,
        chunks
    ):

        texts = [

            c.page_content

            for c in chunks

        ]


        counter = Counter(texts)


        return sum(

            1

            for value in counter.values()

            if value > 1

        )