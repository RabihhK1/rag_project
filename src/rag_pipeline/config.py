from pathlib import Path

# --------------------------------------------------
# Project Directories
# --------------------------------------------------

# Project root:
# rag_setup/
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "data"

OUTPUT_DIR = PROJECT_ROOT / "output"

PARSED_DIR = OUTPUT_DIR / "parsed"

CHUNK_DIR = OUTPUT_DIR / "chunks"

EMBEDDING_DIR = OUTPUT_DIR / "embeddings"

LOG_DIR = OUTPUT_DIR / "logs"

# --------------------------------------------------
# Input Files
# --------------------------------------------------

PDF_NAME = "CIS_Controls__v8__Critical_Security_Controls__2023_08.pdf"

PDF_PATH = DATA_DIR / PDF_NAME

# --------------------------------------------------
# Parser
# --------------------------------------------------

PARSER_STRATEGY = "hi_res"

# --------------------------------------------------
# Chunking
# --------------------------------------------------

CHUNK_SIZE = 1000

CHUNK_OVERLAP = 200

# --------------------------------------------------
# Document Merger
# --------------------------------------------------

MAX_SECTION_CHARS = 4000

# --------------------------------------------------
# Embeddings
# --------------------------------------------------

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

EMBEDDING_BATCH_SIZE = 32

# --------------------------------------------------
# Reranker
# --------------------------------------------------

RERANKER_MODEL = "BAAI/bge-reranker-base"

# --------------------------------------------------
# Generation (Local LLM via Ollama)
# --------------------------------------------------

LLM_MODEL = "qwen2.5:7b"

LLM_TEMPERATURE = 0.0

# --------------------------------------------------
# Weaviate
# --------------------------------------------------

WEAVIATE_HOST = "http://localhost:8080"

COLLECTION_NAME = "CISControls"

# Retrieval defaults

DEFAULT_SEARCH_LIMIT = 50

DEFAULT_TOP_K = 5

# --------------------------------------------------
# Output Files
# --------------------------------------------------

PARSED_JSON = PARSED_DIR / "cis_controls_parsed.json"

CHUNK_JSON = CHUNK_DIR / "cis_controls_chunks.json"

EMBEDDING_JSON = EMBEDDING_DIR / "cis_controls_embeddings.json"

LOG_FILE = LOG_DIR / "rag.log"