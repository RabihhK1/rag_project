import sys
import json
import re
from pathlib import Path
from datetime import datetime


# =====================================================
# Add src
# =====================================================

sys.path.append(
    str(
        Path(__file__)
        .resolve()
        .parents[1]
        /
        "src"
    )
)



# =====================================================
# Imports
# =====================================================

from deepeval import evaluate

from deepeval.test_case import LLMTestCase

from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualPrecisionMetric,
    ContextualRecallMetric
)

from deepeval.models import DeepEvalBaseLLM

from langchain_ollama import ChatOllama



# =====================================================
# Ollama DeepEval Wrapper
# =====================================================

class OllamaDeepEval(DeepEvalBaseLLM):


    def __init__(
        self,
        model="qwen2.5:7b"
    ):

        self.model = model


        self.llm = ChatOllama(

            model=model,

            temperature=0,

            timeout=600,

            num_ctx=8192,

            # FORCE JSON
            format="json"

        )



    def load_model(self):

        return self.llm



    def clean_json(
        self,
        text
    ):


        """
        Repair common Ollama JSON mistakes
        """


        text = text.strip()


        # remove markdown

        text = re.sub(
            r"```json",
            "",
            text
        )

        text = re.sub(
            r"```",
            "",
            text
        )


        # extract JSON object

        match = re.search(
            r"\{.*\}",
            text,
            re.DOTALL
        )


        if match:

            text = match.group(0)



        # remove trailing commas

        text = re.sub(
            r",\s*([}\]])",
            r"\1",
            text
        )


        return text



    def generate(
        self,
        prompt
    ):


        response = self.llm.invoke(
            prompt
        )


        content = response.content


        try:

            json.loads(content)

            return content


        except:


            fixed = self.clean_json(
                content
            )


            return fixed




    async def a_generate(
        self,
        prompt
    ):


        response = await self.llm.ainvoke(
            prompt
        )


        content = response.content


        try:

            json.loads(content)

            return content


        except:


            return self.clean_json(
                content
            )



    def get_model_name(
        self
    ):

        return self.model




# =====================================================
# Paths
# =====================================================


BASE_DIR = Path(__file__).parent


INPUT_FILE = (
    BASE_DIR /
    "final_evaluation.json"
)


OUTPUT_FILE = (
    BASE_DIR /
    "hitl_deepeval_results.json"
)




# =====================================================
# Load Dataset
# =====================================================


with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)



items = data.get(
    "results",
    []
)



print("="*80)

print(
    f"Loaded HITL cases: {len(items)}"
)

print("="*80)



if not items:

    raise Exception(
        "No results found in JSON"
    )




# =====================================================
# Evaluator Model
# =====================================================


evaluator_model = OllamaDeepEval(
    "qwen2.5:7b"
)




# =====================================================
# Metrics
# =====================================================


metrics = [


    AnswerRelevancyMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False,

        include_reason=True

    ),



    FaithfulnessMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False,

        include_reason=True

    ),



    ContextualPrecisionMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False,

        include_reason=True

    ),



    ContextualRecallMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False,

        include_reason=True

    )


]





# =====================================================
# Evaluation
# =====================================================


results = []



for index,item in enumerate(items):


    print("\n")

    print("="*80)

    print(
        f"Evaluating {index+1}/{len(items)} "
        f"ID={item.get('id')}"
    )


    question = item.get(
        "question",
        ""
    )


    answer = item.get(
        "ai_generated_answer",
        ""
    )


    expected = item.get(
        "golden_expected_answer",
        ""
    )


    context = item.get(
        "retrieved_context",
        []
    )


    human = item.get(
        "human_review",
        {}
    )


    reference = f"""

Expected answer:

{expected}


Human correction:

{human.get("human_correction","")}


Human notes:

{human.get("human_notes","")}

"""



    testcase = LLMTestCase(

        input=question,

        actual_output=answer,

        expected_output=reference,

        retrieval_context=context

    )



    metric_output = {}



    try:


        evaluation = evaluate(

            [

                testcase

            ],

            metrics

        )



        test_result = (
            evaluation
            .test_results[0]
        )



        for metric in test_result.metrics_data:


            metric_output[
                metric.name
            ] = {


                "score":
                    metric.score,


                "passed":
                    metric.success,


                "reason":
                    metric.reason


            }



    except Exception as e:


        print(
            "Metric failed:",
            str(e)
        )


        metric_output["error"] = str(e)




    results.append(

        {


            "id":
                item.get("id"),


            "question":
                question,


            "ai_answer":
                answer,


            "expected":
                expected,


            "failed_before":
                human.get(
                    "failed_metrics",
                    {}
                ),


            "hitl_metrics":
                metric_output


        }

    )



    print(
        "Completed"
    )





# =====================================================
# Save
# =====================================================


output = {


    "timestamp":

        str(datetime.now()),


    "model":

        "qwen2.5:7b",


    "total_cases":

        len(results),


    "results":

        results


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
    "HITL DeepEval finished"
)

print(
    OUTPUT_FILE
)

print("="*80)