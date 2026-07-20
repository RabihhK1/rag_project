from src.rag_pipeline.retriever import Retriever



retriever = Retriever()



try:


    results = retriever.search(

        "What are the requirements for asset inventory?",

        limit=5

    )



    print("\nTOP RESULTS")

    print("="*60)



    for i, document in enumerate(results):


        print(
            f"\nRESULT {i+1}"
        )


        print(
            document.page_content[:700]
        )


        print(
            "\nMETADATA:"
        )


        print(
            document.metadata
        )


        print(
            "-"*60
        )



finally:


    retriever.close()