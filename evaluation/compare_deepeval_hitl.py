import json
from pathlib import Path
from datetime import datetime


# ======================================================
# Paths
# ======================================================

BASE_DIR = Path(__file__).parent


BEFORE_FILE = (
    BASE_DIR /
    "deepeval_results.json"
)


AFTER_FILE = (
    BASE_DIR /
    "hitl_deepeval_results.json"
)


OUTPUT_FILE = (
    BASE_DIR /
    "deepeval_hitl_comparison.json"
)



# ======================================================
# Load
# ======================================================

with open(
    BEFORE_FILE,
    "r",
    encoding="utf-8"
) as f:

    before_data = json.load(f)



with open(
    AFTER_FILE,
    "r",
    encoding="utf-8"
) as f:

    after_data = json.load(f)



before_results = before_data["results"]

after_results = after_data["results"]



print(
    f"Before cases: {len(before_results)}"
)

print(
    f"After cases: {len(after_results)}"
)



# ======================================================
# Metrics
# ======================================================

METRICS = [

    "Answer Relevancy",

    "Faithfulness",

    "Contextual Precision",

    "Contextual Recall"

]



# ======================================================
# Compare
# ======================================================

comparison = []



for before, after in zip(
    before_results,
    after_results
):


    item = {


        "id":
            before["id"],


        "question":
            before["question"],


        "metrics":
            {}

    }



    for metric in METRICS:


        # -------------------------
        # BEFORE
        # -------------------------

        before_metric = (
            before
            .get("metrics", {})
            .get(metric, {})
        )


        # -------------------------
        # AFTER
        # -------------------------

        after_metric = (
            after
            .get("hitl_metrics", {})
            .get(metric, {})
        )



        before_score = (
            before_metric
            .get("score")
        )


        after_score = (
            after_metric
            .get("score")
        )


        before_pass = (
            before_metric
            .get("success")
        )


        if before_pass is None:

            before_pass = (
                before_metric
                .get("passed")
            )



        after_pass = (
            after_metric
            .get("success")
        )


        if after_pass is None:

            after_pass = (
                after_metric
                .get("passed")
            )



        item["metrics"][metric] = {


            "before_score":
                before_score,


            "after_score":
                after_score,


            "score_change":
                (
                    after_score - before_score
                    if
                    before_score is not None
                    and
                    after_score is not None
                    else None
                ),


            "before_pass":
                before_pass,


            "after_pass":
                after_pass,


            "status_change":
                (
                    "FIXED"
                    if
                    before_pass is False
                    and
                    after_pass is True

                    else

                    "REGRESSED"
                    if
                    before_pass is True
                    and
                    after_pass is False

                    else

                    "UNCHANGED"
                )

        }



    comparison.append(item)



# ======================================================
# Summary
# ======================================================

summary = {}



for metric in METRICS:


    before_scores=[]
    after_scores=[]


    fixed=0
    regressed=0



    for item in comparison:


        data = (
            item["metrics"][metric]
        )


        if data["before_score"] is not None:

            before_scores.append(
                data["before_score"]
            )


        if data["after_score"] is not None:

            after_scores.append(
                data["after_score"]
            )



        if data["status_change"]=="FIXED":

            fixed+=1


        elif data["status_change"]=="REGRESSED":

            regressed+=1



    summary[metric]={


        "before_average":

            (
                sum(before_scores)
                /
                len(before_scores)
                if before_scores
                else 0
            ),


        "after_average":

            (
                sum(after_scores)
                /
                len(after_scores)
                if after_scores
                else 0
            ),


        "improvement":

            (
                (
                    sum(after_scores)
                    /
                    len(after_scores)
                )
                -
                (
                    sum(before_scores)
                    /
                    len(before_scores)
                )
                if before_scores
                and after_scores
                else 0
            ),


        "fixed_cases":

            fixed,


        "regressed_cases":

            regressed

    }



# ======================================================
# Save
# ======================================================

output = {


    "timestamp":

        str(datetime.now()),


    "before":

        str(BEFORE_FILE),


    "after":

        str(AFTER_FILE),


    "total_cases":

        len(comparison),


    "summary":

        summary,


    "details":

        comparison

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



print("\n")
print("="*80)

print(
    "Comparison completed"
)

print(
    OUTPUT_FILE
)

print("="*80)



# ======================================================
# Console Summary
# ======================================================

print("\nSUMMARY\n")


for metric,data in summary.items():


    print(metric)

    print(
        "Before:",
        round(
            data["before_average"],
            3
        )
    )

    print(
        "After :",
        round(
            data["after_average"],
            3
        )
    )


    print(
        "Change:",
        round(
            data["improvement"],
            3
        )
    )


    print(
        "Fixed:",
        data["fixed_cases"]
    )


    print(
        "Regressed:",
        data["regressed_cases"]
    )


    print("-"*50)