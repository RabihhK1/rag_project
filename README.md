# 🛡️ CIS Security Assistant - RAG Pipeline

A production-oriented Retrieval-Augmented Generation (RAG) system built for answering cybersecurity questions using the **CIS Critical Security Controls v8** document.

The system combines document intelligence, vector search, reranking, local LLM generation, automated evaluation, and human-in-the-loop validation.

---

# 🚀 Project Overview

This project implements a complete RAG pipeline:

```
PDF Document
      |
      ↓
Document Parsing
      |
      ↓
Cleaning & Structure Restoration
      |
      ↓
Logical Section Merging
      |
      ↓
Semantic Chunking
      |
      ↓
Embedding Generation
      |
      ↓
Weaviate Vector Database
      |
      ↓
Hybrid Retrieval + Reranking
      |
      ↓
Local LLM Generation
      |
      ↓
DeepEval Evaluation
      |
      ↓
Human Feedback Loop
```

The final application provides a cybersecurity assistant capable of answering questions based only on the provided security knowledge base.

---

# ✨ Features

## Document Processing

- PDF extraction using Unstructured
- High-resolution layout parsing
- Text, titles, tables and metadata extraction
- Document cleaning
- Structure restoration
- Logical section reconstruction

---

## Retrieval System

- Local HuggingFace embeddings
- BAAI BGE-small embedding model
- Weaviate vector database
- Semantic similarity search
- Metadata preservation
- Cross-encoder reranking

---

## Generation

- Local LLM inference using Ollama
- Qwen2.5 7B model
- Context-grounded answers
- Prompt-controlled cybersecurity assistant

---

## Evaluation System

Implemented evaluation workflow:

- DeepEval automated testing
- Answer relevancy evaluation
- Faithfulness evaluation
- Contextual precision
- Contextual recall

---

## Human-In-The-Loop (HITL)

The system supports:

- Automatic failure detection
- Human review dataset creation
- Human corrections
- Re-evaluation after improvements
- Before/after metric comparison

---

# 🏗️ Project Structure

```
rag_setup/

│
├── src/
│   └── rag_pipeline/
│       │
│       ├── parser.py
│       ├── cleaner.py
│       ├── structure.py
│       ├── merger.py
│       ├── chunker.py
│       ├── embedder.py
│       ├── weaviate_store.py
│       ├── retriever.py
│       ├── reranker.py
│       └── generator.py
│
├── evaluation/
│   │
│   ├── deepeval_test.py
│   ├── create_hitl_dataset.py
│   ├── hitl_deepeval.py
│   ├── merge_evaluation.py
│   └── compare_deepeval.py
│
├── app.py
├── chat.py
├── main.py
├── pyproject.toml
└── README.md
```

---

# ⚙️ Installation

## 1. Clone repository

```bash
git clone https://github.com/RabihhK1/rag_project.git

cd rag_project
```

---

## 2. Create virtual environment

Using Python:

```bash
python -m venv rag-env
```

Activate:

### Windows

```bash
rag-env\Scripts\activate
```

### Linux/Mac

```bash
source rag-env/bin/activate
```

---

## 3. Install dependencies

Using uv:

```bash
uv sync
```

or:

```bash
pip install -r requirements.txt
```

---

# 🗄️ Running Weaviate

Start Weaviate using Docker:

```bash
docker run -p 8080:8080 -p 50051:50051 \
cr.weaviate.io/semitechnologies/weaviate:1.27.0
```

---

# 📥 Running the RAG Ingestion Pipeline

The ingestion pipeline processes the PDF and stores embeddings.

Run:

```bash
python main.py
```

Pipeline stages:

1. Parse PDF
2. Clean documents
3. Restore structure
4. Merge sections
5. Create chunks
6. Analyze chunk quality
7. Generate embeddings
8. Store vectors in Weaviate

---

# 💬 Running the Assistant

## Terminal Chat

```bash
python chat.py
```

---

## Streamlit Application

```bash
streamlit run app.py
```

The application provides:

- Chat interface
- Retrieved evidence visualization
- CIS security assistant experience

---

# 🧠 Models Used

## Embedding Model

```
BAAI/bge-small-en-v1.5
```

Purpose:

- Convert text chunks into semantic vectors
- Enable similarity search

---

## Reranker Model

```
BAAI/bge-reranker-base
```

Purpose:

- Improve retrieval accuracy
- Select the most relevant documents

---

## Generation Model

```
qwen2.5:7b
```

Running locally using:

```
Ollama
```

---

# 📊 Evaluation Workflow

The evaluation process:

```
Golden Dataset
       |
       ↓
DeepEval Testing
       |
       ↓
Failure Detection
       |
       ↓
Human Review
       |
       ↓
HITL Dataset
       |
       ↓
Re-evaluation
       |
       ↓
Performance Comparison
```

---

# 🛠️ Technologies

- Python
- LangChain
- LangChain Ollama
- LangChain HuggingFace
- Unstructured
- Sentence Transformers
- Weaviate
- Ollama
- Streamlit
- DeepEval
- Docker

---

# 🎯 Future Improvements

Planned improvements:

- Advanced retrieval strategies
- Query rewriting
- Hybrid search
- Production API deployment
- Monitoring dashboard
- Automated regression testing
- Continuous evaluation pipeline

---

# 👨‍💻 Author

Rabih Kiwan

Computer Engineering Student  
AI / Robotics / LLM Applications
