import sys
import json
import re
from pathlib import Path
from datetime import datetime


# ======================================================
# Add src path
# ======================================================

sys.path.append(
    str(
        Path(__file__)
        .resolve()
        .parents[1]
        /
        "src"
    )
)


# ======================================================
# Imports
# ======================================================

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


from rag_pipeline.retriever import Retriever
from rag_pipeline.generator import Generator



# ======================================================
# Ollama DeepEval Model
# ======================================================

class OllamaDeepEval(DeepEvalBaseLLM):

    def __init__(self, model="qwen2.5:7b"):

        self.model = model


        self.llm = ChatOllama(

            model=model,

            temperature=0,

            timeout=600,

            num_ctx=8192,

            format="json"

        )



    def load_model(self):

        return self.llm



    def generate(self, prompt: str):

        response = self.llm.invoke(

            [
                (
                    "system",
                    """
You are an evaluation engine.

You MUST output ONLY valid JSON.

No markdown.
No explanations.
No comments.

Follow exactly the JSON schema requested by the user.
"""
                ),

                (
                    "human",
                    prompt
                )

            ]

        )


        return response.content



    async def a_generate(self, prompt: str):


        response = await self.llm.ainvoke(

            [
                (
                    "system",
                    """
You are an evaluation engine.

You MUST output ONLY valid JSON.

No markdown.
No explanations.

Return exactly the requested JSON keys.
"""
                ),

                (
                    "human",
                    prompt
                )

            ]

        )


        return response.content



    def get_model_name(self):

        return self.model





# ======================================================
# Paths
# ======================================================

BASE_DIR = Path(__file__).parent


DATASET_PATH = BASE_DIR / "golden_dataset.json"


JSON_OUTPUT = BASE_DIR / "deepeval_results.json"


TXT_OUTPUT = BASE_DIR / "deepeval_results.txt"





# ======================================================
# Load dataset
# ======================================================


with open(DATASET_PATH, "r", encoding="utf-8") as f:

    dataset = json.load(f)



# ONLY 25 QUESTIONS

dataset = dataset[:25]


print(
    f"Loaded {len(dataset)} questions"
)





# ======================================================
# Initialize
# ======================================================


evaluator_model = OllamaDeepEval()


retriever = Retriever()


generator = Generator()





# ======================================================
# Metrics
# ======================================================


metrics = [

    AnswerRelevancyMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False

    ),


    FaithfulnessMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False

    ),


    ContextualPrecisionMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False

    ),


    ContextualRecallMetric(

        model=evaluator_model,

        threshold=0.7,

        async_mode=False

    )

]





results=[]





try:


    for index,item in enumerate(dataset):


        print("\n")
        print("="*70)

        print(
            f"QUESTION {index+1}/{len(dataset)}"
        )



        question=item["question"]


        expected=item.get(
            "answer",
            item.get(
                "expected_output",
                ""
            )
        )



        # Retrieve

        documents=retriever.search(

            question,

            limit=5

        )


        context=[

            d.page_content

            for d in documents

        ]



        # Generate answer


        answer=generator.generate(

            question,

            documents

        )



        print(question)

        print("\nANSWER:")
        print(answer)




        test_case=LLMTestCase(

            input=question,

            actual_output=answer,

            expected_output=expected,

            retrieval_context=context

        )



        print(
            "Running DeepEval..."
        )



        evaluation=evaluate(

            [

                test_case

            ],

            metrics

        )



        result=evaluation.test_results[0]



        metric_results={}


        for metric in result.metrics_data:


            metric_results[metric.name]={

                "score":metric.score,

                "success":metric.success,

                "reason":metric.reason

            }



        results.append(

            {

                "id":index+1,

                "question":question,

                "expected":expected,

                "generated":answer,

                "context":context,

                "metrics":metric_results

            }

        )



        # SAVE AFTER EVERY QUESTION

        with open(

            JSON_OUTPUT,

            "w",

            encoding="utf-8"

        ) as f:


            json.dump(

                {

                "date":str(datetime.now()),

                "model":"qwen2.5:7b",

                "total":len(results),

                "results":results

                },

                f,

                indent=4,

                ensure_ascii=False

            )



        print(
            f"Finished {index+1}"
        )




finally:


    retriever.close()






# ======================================================
# TXT FILE
# ======================================================


with open(

    TXT_OUTPUT,

    "w",

    encoding="utf-8"

) as f:


    for item in results:


        f.write("\n")

        f.write("="*70)

        f.write("\n")


        f.write(
            f"QUESTION #{item['id']}\n\n"
        )


        f.write(
            item["question"]
            +
            "\n\n"
        )


        f.write(
            "ANSWER:\n"
        )


        f.write(
            item["generated"]
            +
            "\n\n"
        )


        f.write(
            "METRICS:\n"
        )


        for name,m in item["metrics"].items():


            f.write(

                f"{name}: {m['score']} "

                f"PASS={m['success']}\n"

            )



print(
    "\nDONE"
)

print(
    JSON_OUTPUT
)

print(
    TXT_OUTPUT
)