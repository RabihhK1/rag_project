"""
Generator

Responsible for:
1. Loading the local LLM (Ollama)
2. Building the prompt
3. Combining retrieved documents into context
4. Generating the final answer
"""

from langchain_ollama import ChatOllama

from .logger import logger


class Generator:

    def __init__(
        self,
        model_name: str = "qwen2.5:7b",
        temperature: float = 0.0
    ):

        logger.info("Initializing generator")

        self.llm = ChatOllama(
            model=model_name,
            temperature=temperature
        )

        logger.info("Generator ready")


    def generate(
        self,
        question: str,
        documents: list
    ) -> str:

        logger.info("Building context")

        context = "\n\n".join(
            doc.page_content
            for doc in documents
        )

        prompt = f"""
You are a cybersecurity assistant.

You are a cybersecurity assistant.


Answer the question using only the provided context.

Rules:
- Answer in a complete sentence.
- Include the subject being asked about.
- Do not answer with only a short phrase.
- Do not add information that is not in the context.
-When multiple safeguards discuss related topics,
choose the safeguard that directly answers the user's question.

-Prefer the most specific safeguard over general explanations.

-If multiple frequencies are mentioned,
return the frequency that applies to the exact safeguard asked.

-If the answer is partially available in the context, explain using the available information.
-Only say "I could not find the answer in the provided documents." when there is truly no related information.

-Give a concise answer.

Context:
{context}

Question:
{question}

Answer:
"""

        logger.info("Generating response")

        response = self.llm.invoke(prompt)

        logger.info("Response generated")

        return response.content