# RAG-Based Question Answering System for CIS Critical Security Controls v8

## Overview

This project implements an end-to-end **Retrieval-Augmented Generation (RAG)** system for answering questions about the **CIS Critical Security Controls Version 8** document.

Instead of relying solely on a Large Language Model's internal knowledge, the system retrieves relevant information from the official CIS Controls PDF, reranks the retrieved results, and generates accurate answers grounded in the document.

The project was designed as a complete RAG pipeline, including:

- PDF parsing and preprocessing
- Document reconstruction
- Intelligent chunking
- Embedding generation
- Vector database indexing
- Semantic retrieval
- Cross-encoder reranking
- Local LLM generation
- Automatic evaluation
- Human-in-the-Loop (HITL) evaluation
- Interactive Streamlit chatbot

The objective is to build a reliable question-answering assistant capable of providing document-grounded cybersecurity answers while minimizing hallucinations.

---

# Table of Contents

- Project Overview
- Features
- System Architecture
- Project Structure
- Pipeline Overview
- Technologies Used
- Installation
- Running the Project
- Configuration
- Evaluation
- Human-in-the-Loop Workflow
- Streamlit Chatbot
- Example Questions
- Future Improvements
- License

---

# Features

## Document Processing

- PDF parsing using Unstructured
- Cleaning and normalization
- Structure reconstruction
- Section detection
- Logical document merging

---

## Chunking

- Recursive character-based chunking
- Metadata preservation
- Configurable chunk size
- Configurable overlap

---

## Embeddings

- Local embedding generation
- HuggingFace BAAI embeddings
- Normalized vectors
- Batch processing
- CPU/GPU support

---

## Vector Database

- Weaviate integration
- Self-provided vectors
- Metadata storage
- Fast semantic search

---

## Retrieval

- Semantic vector retrieval
- Configurable retrieval depth
- Metadata-aware documents

---

## Reranking

- Cross-Encoder reranking
- Improved relevance
- Top-K document selection

---

## Generation

- Local LLM using Ollama
- Context-aware prompting
- Grounded answers
- Hallucination reduction

---

## Evaluation

Automatic evaluation using DeepEval:

- Answer Relevancy
- Faithfulness
- Contextual Precision
- Contextual Recall

---

## Human-in-the-Loop

Automatic generation of review datasets for failed answers.

Human reviewers can:

- inspect retrieved context
- review generated answers
- provide corrections
- approve or reject responses

---

## User Interface

Interactive chatbot built with Streamlit.

Features include:

- conversational interface
- chat history
- document-grounded answers
- modern responsive UI

---

# System Architecture

```
                        PDF
                         │
                         ▼
                  PDF Parser
                         │
                         ▼
                 Document Cleaner
                         │
                         ▼
              Structure Enhancement
                         │
                         ▼
                 Document Merger
                         │
                         ▼
                    Chunking
                         │
                         ▼
                  Embeddings
                         │
                         ▼
                   Weaviate DB
                         │
                         ▼
                   Retriever
                         │
                         ▼
                    Reranker
                         │
                         ▼
                   Qwen Generator
                         │
                         ▼
                     Response
```

---

# Project Structure

```
rag_setup/

│
├── data/
│   └── CIS_Controls__v8__Critical_Security_Controls__2023_08.pdf
│
├── output/
│   ├── parsed/
│   ├── chunks/
│   ├── embeddings/
│   └── logs/
│
├── evaluation/
│   ├── golden_dataset.json
│   ├── deepeval_results.json
│   ├── human_review_dataset.json
│   └── hitl_deepeval_results.json
│
├── src/
│   └── rag_pipeline/
│       ├── cleaner.py
│       ├── chunker.py
│       ├── chunk_quality.py
│       ├── config.py
│       ├── embedder.py
│       ├── embedding_exporter.py
│       ├── exporters.py
│       ├── generator.py
│       ├── logger.py
│       ├── merger.py
│       ├── parser.py
│       ├── reranker.py
│       ├── retriever.py
│       ├── structure.py
│       └── weaviate_store.py
│
├── app.py
├── main.py
├── create_hitl_dataset.py
├── hitl_deepeval.py
├── requirements.txt
└── README.md
```

---

# Pipeline Overview

## 1. PDF Parsing

The original CIS Controls PDF is parsed using the Unstructured library.

Each page is converted into document elements such as:

- Titles
- Paragraphs
- Lists
- Tables

---

## 2. Cleaning

Removes:

- empty elements
- unnecessary whitespace
- parser artifacts

while preserving document meaning.

---

## 3. Structure Enhancement

Restores logical document hierarchy.

Adds metadata such as:

- section titles
- element type
- page information

---

## 4. Document Merging

Since PDF parsers split documents into many small elements, this stage reconstructs logical sections by grouping related content under the appropriate title.

---

## 5. Chunking

Merged sections are split into retrieval-friendly chunks using a Recursive Character Text Splitter.

Benefits include:

- manageable context size
- improved semantic retrieval
- overlap preservation

---

## 6. Embedding Generation

Each chunk is converted into a dense vector using

```
BAAI/bge-small-en-v1.5
```

Embeddings are normalized for cosine similarity search.

---

## 7. Vector Storage

Embeddings are uploaded into Weaviate.

Each object stores:

- chunk text
- metadata
- embedding vector

---

## 8. Retrieval

For each user query:

1. Generate query embedding
2. Search Weaviate
3. Retrieve nearest vectors

---

## 9. Reranking

Retrieved chunks are reranked using

```
BAAI/bge-reranker-base
```

This improves relevance before generation.

---

## 10. Response Generation

The retrieved context is injected into the prompt.

A locally hosted

```
Qwen2.5 7B
```

model generates the final answer.

The model is instructed to answer only from the retrieved context.

---

# Technologies Used

| Component | Technology |
|------------|------------|
| Programming Language | Python |
| PDF Parsing | Unstructured |
| Framework | LangChain |
| Embeddings | BAAI/bge-small-en-v1.5 |
| Reranker | BAAI/bge-reranker-base |
| Vector Database | Weaviate |
| LLM | Qwen2.5 7B |
| Local LLM Runtime | Ollama |
| Evaluation | DeepEval |
| Interface | Streamlit |

---

# Installation

## Clone the repository

```bash
git clone <repository-url>

cd rag_setup
```

---

## Install dependencies

```bash
pip install -r requirements.txt
```

---

## Install Ollama

Download Ollama:

https://ollama.com

---

## Download the LLM

```bash
ollama pull qwen2.5:7b
```

---

## Start Weaviate

```bash
docker compose up -d
```

Verify Weaviate is running on:

```
http://localhost:8080
```

---

# Running the Project

## Step 1

Place the CIS Controls PDF inside

```
data/
```

---

## Step 2

Run the ingestion pipeline

```bash
python main.py
```

The pipeline performs:

- PDF parsing
- Cleaning
- Structure enhancement
- Section merging
- Chunk generation
- Embedding creation
- Weaviate upload

---

## Step 3

Launch the chatbot

```bash
streamlit run app.py
```

---

# Configuration

Configuration parameters are stored in

```
config.py
```

Examples include:

- embedding model
- chunk size
- overlap
- parser strategy
- output folders
- Weaviate host

---

# Evaluation

The project includes automatic evaluation using DeepEval.

Metrics:

- Answer Relevancy
- Faithfulness
- Contextual Precision
- Contextual Recall

These metrics evaluate how accurately the generated answer matches the retrieved document context.

---

# Human-in-the-Loop Workflow

Automatic evaluation alone cannot capture every failure.

The project therefore includes a Human-in-the-Loop pipeline.

Workflow:

```
Question
      │
      ▼
RAG System
      │
      ▼
DeepEval
      │
      ▼
Failed Cases
      │
      ▼
Human Review Dataset
      │
      ▼
Manual Review
      │
      ▼
Corrected Answers
      │
      ▼
Re-evaluation
```

Reviewers inspect:

- retrieved context
- generated answer
- evaluation metrics

They may:

- approve answers
- correct answers
- provide notes

---

# Streamlit Chatbot

The project includes an interactive chatbot interface.

Features:

- conversational UI
- persistent chat history
- grounded document answers
- local inference
- responsive interface

The chatbot retrieves relevant document chunks before generating each response.

---

# Example Questions

Examples include:

- What are the three Implementation Groups?
- What is Control 6?
- What is Access Control Management?
- Which safeguards require Multi-Factor Authentication?
- How often should vulnerability scans be performed?
- What is a zero-day exploit?
- What are the responsibilities of Implementation Group 2?
- Which safeguards apply to remote network access?

---

# Current Limitations

Although the system performs well, several limitations remain.

These include:

- occasional retrieval of partially relevant chunks
- dependence on embedding quality
- no hybrid keyword/vector search
- no conversation memory
- no automatic query rewriting
- retrieval errors may propagate to generation

These limitations are documented and considered for future work.

---

# Future Improvements

Potential improvements include:

- Hybrid Search (BM25 + Vector Search)
- Metadata filtering
- Query rewriting
- Conversation memory
- Agent-based retrieval
- Incremental indexing
- Automatic HITL feedback integration
- Citation generation
- Confidence estimation
- Multi-document support

---

# License

This project was developed for educational and research purposes.

The CIS Controls document remains the intellectual property of the Center for Internet Security (CIS).

Please refer to the official CIS licensing terms for redistribution and commercial usage.