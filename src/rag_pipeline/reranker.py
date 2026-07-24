from sentence_transformers import CrossEncoder
from .logger import logger
from . import config


class Reranker:
    """
    Cross-encoder reranker for refining retrieval results.

    Improves precision by re-scoring the top documents returned
    from the initial vector search.
    """

    def __init__(self, model_name: str | None = None):
        self.model_name = (
            model_name if model_name else config.RERANKER_MODEL
        )
        logger.info(f"Loading reranker model: {self.model_name}")
        try:
            self.model = CrossEncoder(
                self.model_name,
                local_files_only=True,
            )
        except OSError:
            # A new setup can still download the model when it is not cached.
            self.model = CrossEncoder(self.model_name)
        logger.info("Reranker ready")

    def rerank(self, query, documents, top_k: int | None = None):
        if top_k is None:
            top_k = config.DEFAULT_TOP_K

        if not documents:
            return []

        pairs = []
        for doc in documents:
            section = doc.metadata.get("section_title", "")
            page = doc.metadata.get("page_number", "")
            text = (
                f"Section: {section}\n"
                f"Page: {page}\n"
                f"Content:\n"
                f"{doc.page_content}"
            )
            pairs.append([query, text])

        scores = self.model.predict(pairs)

        ranked = sorted(
            zip(documents, scores), key=lambda x: x[1], reverse=True
        )

        results = []
        for doc, score in ranked[:top_k]:
            doc.metadata["rerank_score"] = float(score)
            results.append(doc)

        return results
