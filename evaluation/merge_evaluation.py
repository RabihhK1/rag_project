import json
from datetime import datetime


GOLDEN_FILE = "evaluation/golden_dataset.json"
DEEPEVAL_FILE = "evaluation/deepeval_results.json"
HUMAN_FILE = "evaluation/human_review_dataset.json"

OUTPUT_FILE = "evaluation/final_evaluation.json"


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


golden = load(GOLDEN_FILE)
deepeval = load(DEEPEVAL_FILE)
human = load(HUMAN_FILE)


# Take first 25 golden questions
golden = golden[:25]


# DeepEval has the same 25
deep_results = deepeval["results"]


# Human has only failed 16
human_map = {
    item["id"]: item
    for item in human["items"]
}


merged = []


for i in range(25):

    g = golden[i]
    d = deep_results[i]

    case_id = i + 1


    merged.append({

        "id": case_id,

        "question": g["question"],

        "golden_expected_answer":
            g["expected_answer"],

        "ai_generated_answer":
            d["generated"],

        "retrieved_context":
            d["context"],

        "deepeval_metrics":
            d["metrics"],


        "human_review":
            human_map.get(
                case_id,
                {
                    "human_correction": "",
                    "human_notes": "",
                    "human_approved": None
                }
            )
    })



final = {

    "created": str(datetime.now()),

    "total": len(merged),

    "sources": {
        "golden": "first 25 questions",
        "deepeval": "25 evaluated questions",
        "human_review": "16 failed cases"
    },

    "results": merged
}



with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        final,
        f,
        indent=4,
        ensure_ascii=False
    )


print("Merged successfully")
print("Total:", len(merged))
print("Human reviewed:", len(human_map))