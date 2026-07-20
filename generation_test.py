"""
Generation Test

Tests the complete RAG pipeline:
1. Retrieve relevant documents
2. Generate an answer using Qwen
"""

import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parent / "src"
    )
)

from rag_pipeline.retriever import Retriever
from rag_pipeline.generator import Generator


QUESTION = (
    "How frequently should an enterprise review and update "
    "its detailed enterprise asset inventory?"
)


retriever = Retriever()
generator = Generator()


try:

    documents = retriever.search(
        QUESTION,
        limit=5
    )

    answer = generator.generate(
        QUESTION,
        documents
    )

    print("\n")
    print("=" * 80)
    print("QUESTION")
    print("=" * 80)
    print(QUESTION)

    print("\n")
    print("=" * 80)
    print("RETRIEVED DOCUMENTS")
    print("=" * 80)

    for index, doc in enumerate(documents, start=1):

        print(f"\nDocument {index}")

        print(
            f"Section : {doc.metadata.get('section_title')}"
        )

        print(
            f"Page    : {doc.metadata.get('page_number')}"
        )

        print(
            f"Distance: {doc.metadata.get('distance'):.4f}"
        )

        if "rerank_score" in doc.metadata:

            print(
                f"Rerank  : {doc.metadata['rerank_score']:.4f}"
            )

    print("\n")
    print("=" * 80)
    print("GENERATED ANSWER")
    print("=" * 80)

    print(answer)


finally:

    retriever.close()