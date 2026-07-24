"""
Generator

Responsible for:
1. Loading the local LLM (Ollama)
2. Building the prompt
3. Combining retrieved documents into context
4. Generating the final answer
5. Streaming generated tokens for SSE
"""

from langchain_ollama import ChatOllama

from .logger import logger
from . import config



class Generator:


    def __init__(
        self,
        model_name: str | None = None,
        temperature: float | None = None
    ):
        self.model_name = (
            model_name if model_name else config.LLM_MODEL
        )
        self.temperature = (
            temperature
            if temperature is not None
            else config.LLM_TEMPERATURE
        )


        logger.info(
            "Initializing generator"
        )


        self.llm = ChatOllama(

            model=self.model_name,

            temperature=self.temperature,

            streaming=True

        )


        logger.info(
            "Generator ready"
        )




    def _build_prompt(
        self,
        question: str,
        documents: list
    ) -> str:


        logger.info(
            "Building context"
        )


        context = "\n\n".join(

            f"[{index}] {doc.page_content}"

            for index, doc in enumerate(documents, start=1)

        )



        prompt = f"""
You are a cybersecurity assistant.

Answer the question using only the provided context.

Rules:
- Answer in a complete sentence.
- Include the subject being asked about.
- Do not answer with only a short phrase.
- Do not add information that is not in the context.
- When multiple safeguards discuss related topics,
choose the safeguard that directly answers the user's question.
- Prefer the most specific safeguard over general explanations.
- If multiple frequencies are mentioned,
return the frequency that applies to the exact safeguard asked.
- If the answer is partially available in the context, explain using the available information.
- Only say "I could not find the answer in the provided documents." when there is truly no related information.
- Give a concise answer.
- Cite factual statements using the matching bracketed source number, for example [1].
- Use only source numbers that appear in the context and include at least one citation when you answer from the context.


Context:

{context}


Question:

{question}


Answer:
"""


        return prompt






    # ==========================
    # Normal Generation
    # Keeps old pipeline working
    # ==========================

    def generate(
        self,
        question: str,
        documents: list
    ) -> str:


        prompt = self._build_prompt(

            question,

            documents

        )


        logger.info(
            "Generating response"
        )



        response = self.llm.invoke(

            prompt

        )



        logger.info(
            "Response generated"
        )



        return response.content






    # ==========================
    # Streaming Generation
    # Used by SSE
    # ==========================

    def stream_generate(
        self,
        question: str,
        documents: list
    ):


        prompt = self._build_prompt(

            question,

            documents

        )


        logger.info(
            "Starting streaming response"
        )



        for chunk in self.llm.stream(

            prompt

        ):


            if chunk.content:


                yield chunk.content



        logger.info(
            "Streaming completed"
        )
