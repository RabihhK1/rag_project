import json
from datetime import datetime


GOLDEN_FILE = "evaluation/golden_dataset.json"
DEEPEVAL_FILE = "evaluation/deepeval_results.json"
OUTPUT_FILE = "evaluation/human_review_dataset.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


golden = load_json(GOLDEN_FILE)

deepeval = load_json(DEEPEVAL_FILE)


# first 25 golden questions
golden_25 = golden[:25]


# deepeval results
deepeval_results = deepeval["results"]


# map deepeval by id
deepeval_map = {
    item["id"]: item
    for item in deepeval_results
}


human_items = []


for index, golden_item in enumerate(golden_25, start=1):

    deep_item = deepeval_map.get(index)

    if not deep_item:
        continue


    failed_metrics = {}

    for metric, value in deep_item["metrics"].items():

        if not value["success"]:
            failed_metrics[metric] = value


    # only send failed cases to human review
    if failed_metrics:

        human_items.append({

            "id": index,

            "question": golden_item["question"],

            "expected_answer":
                golden_item["expected_answer"],

            "ai_generated_answer":
                deep_item["generated"],

            "retrieved_context":
                deep_item["context"],

            "failed_metrics":
                failed_metrics,

            "human_correction": "",

            "human_notes": "",

            "human_approved": False
        })


output = {

    "created": str(datetime.now()),

    "source_model":
        deepeval.get("model", ""),

    "total_failed_cases":
        len(human_items),

    "instructions":
        "Review the AI answer. Add correction if needed. Mark approved true after review.",

    "items":
        human_items

}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        indent=4,
        ensure_ascii=False
    )


print(
    f"Created {OUTPUT_FILE}"
)

print(
    f"Human review cases: {len(human_items)}"
)