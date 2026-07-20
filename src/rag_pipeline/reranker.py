from sentence_transformers import CrossEncoder

from .logger import logger



class Reranker:


    def __init__(
        self,
        model_name="BAAI/bge-reranker-base"
    ):


        logger.info(
            "Loading reranker model"
        )


        self.model = CrossEncoder(
            model_name
        )


        logger.info(
            "Reranker ready"
        )



    def rerank(
        self,
        query,
        documents,
        top_k=5
    ):


        pairs = []


        for doc in documents:


            section = doc.metadata.get(
                "section_title",
                ""
            )


            page = doc.metadata.get(
                "page_number",
                ""
            )


            text = (

                f"Section: {section}\n"

                f"Page: {page}\n"

                f"Content:\n"

                f"{doc.page_content}"

            )


            pairs.append(

                [
                    query,
                    text
                ]

            )



        scores = self.model.predict(
            pairs
        )



        ranked = sorted(

            zip(
                documents,
                scores
            ),

            key=lambda x: x[1],

            reverse=True

        )



        results = []



        for doc, score in ranked[:top_k]:


            doc.metadata["rerank_score"] = float(score)


            results.append(
                doc
            )



        return results