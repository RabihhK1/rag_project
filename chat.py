from ollama import chat
import weaviate
from sentence_transformers import SentenceTransformer


# -----------------------------
# Configuration
# -----------------------------

LLM_MODEL = "qwen2.5:7b"
EMBED_MODEL = "BAAI/bge-small-en-v1.5"

COLLECTION_NAME = "CISControls"


# -----------------------------
# Initialize models
# -----------------------------

print("Loading embedding model...")
embedder = SentenceTransformer(EMBED_MODEL)


print("Connecting to Weaviate...")
client = weaviate.connect_to_local()


print("Ready.\n")


# -----------------------------
# Retrieval
# -----------------------------

def retrieve_documents(query, top_k=5):

    vector = embedder.encode(query).tolist()


    collection = client.collections.get(
        COLLECTION_NAME
    )


    results = collection.query.near_vector(
        near_vector=vector,
        limit=top_k
    )


    documents = []

    for obj in results.objects:
        documents.append(
            obj.properties["text"]
        )


    return documents



# -----------------------------
# Local LLM
# -----------------------------

def ask_llm(question, context):

    prompt = f"""
You are a cybersecurity assistant.

Answer the question using ONLY the context below.

Context:
{context}


Question:
{question}


Answer:
"""


    response = chat(
        model=LLM_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    return response["message"]["content"]



# -----------------------------
# Chat loop
# -----------------------------

while True:

    question = input("\nYou: ")


    if question.lower() in [
        "exit",
        "quit"
    ]:
        break


    docs = retrieve_documents(
        question
    )


    if not docs:
        print(
            "\nAgent: I could not find relevant information."
        )
        continue


    context = "\n\n".join(docs)


    answer = ask_llm(
        question,
        context
    )


    print(
        "\nAgent:",
        answer
    )


client.close()