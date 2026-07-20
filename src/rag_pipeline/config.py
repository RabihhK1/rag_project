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
# Embeddings
# --------------------------------------------------

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

# --------------------------------------------------
# Weaviate
# --------------------------------------------------

WEAVIATE_HOST = "http://localhost:8080"

# --------------------------------------------------
# Output Files
# --------------------------------------------------

PARSED_JSON = PARSED_DIR / "cis_controls_parsed.json"

CHUNK_JSON = CHUNK_DIR / "cis_controls_chunks.json"

# Embedding model

EMBEDDING_MODEL = (
    "BAAI/bge-small-en-v1.5"
)