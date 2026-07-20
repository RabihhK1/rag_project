"""
Retrieval Evaluation

Metrics:
- Recall@1
- Recall@3
- Recall@5
- MRR
"""


import sys
from pathlib import Path
import json



sys.path.append(

    str(
        Path(__file__)
        .resolve()
        .parents[1]
        /
        "src"
    )

)



from rag_pipeline.retriever import Retriever




# ----------------------------
# Load golden dataset
# ----------------------------


with open(

    "evaluation/golden_dataset.json",

    "r",

    encoding="utf-8"

) as f:


    dataset = json.load(f)




# ----------------------------
# Relevance check
# ----------------------------


def is_relevant(
    document,
    expected_sections
):


    section = document.metadata.get(
        "section_title",
        ""
    ).lower()


    text = document.page_content.lower()


    combined = section + " " + text



    for expected in expected_sections:


        expected = expected.lower()


        if expected in combined:

            return True


    return False





# ----------------------------
# Evaluation
# ----------------------------


retriever = Retriever()



recall_1 = 0
recall_3 = 0
recall_5 = 0

mrr_total = 0



failed = []



try:


    for item in dataset:


        question = item["question"]


        expected = item.get(

            "relevant_sections",

            []

        )



        results = retriever.search(

            question,

            limit=5

        )



        correct_rank = None



        retrieved = []



        for rank, doc in enumerate(

            results,

            start=1

        ):



            section = doc.metadata.get(

                "section_title",

                ""

            )


            retrieved.append(
                section
            )



            if correct_rank is None:


                if is_relevant(

                    doc,

                    expected

                ):


                    correct_rank = rank





        if correct_rank:



            recall_5 += 1



            if correct_rank <= 3:

                recall_3 += 1



            if correct_rank == 1:

                recall_1 += 1



            mrr_total += (
                1 / correct_rank
            )



        else:


            failed.append(

                {

                    "question":
                        question,

                    "expected":
                        expected,

                    "retrieved":
                        retrieved

                }

            )



finally:


    retriever.close()





# ----------------------------
# Results
# ----------------------------


total = len(dataset)



print("\n")
print("==============================")
print("RETRIEVAL EVALUATION RESULTS")
print("==============================")



print(
    f"Questions tested: {total}"
)



print(

    f"Recall@1: {recall_1}/{total} "

    f"({recall_1/total:.2%})"

)



print(

    f"Recall@3: {recall_3}/{total} "

    f"({recall_3/total:.2%})"

)



print(

    f"Recall@5: {recall_5}/{total} "

    f"({recall_5/total:.2%})"

)



print(

    f"MRR: {mrr_total/total:.4f}"

)



print()

print(

    f"Failed retrievals: {len(failed)}"

)
print("\nFAILED CASES")
print("================")

for item in failed:

    print("\nQUESTION:")
    print(item["question"])

    print("\nEXPECTED:")
    print(item["expected"])

    print("\nRETRIEVED:")
    for r in item["retrieved"]:
        print("-", r)

    print("-"*50)