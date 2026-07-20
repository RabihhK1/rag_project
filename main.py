from src.rag_pipeline.parser import parse_pdf
from src.rag_pipeline.cleaner import DocumentCleaner
from src.rag_pipeline.structure import StructureEnhancer
from src.rag_pipeline.merger import DocumentMerger
from src.rag_pipeline.chunker import DocumentChunker
from src.rag_pipeline.chunk_quality import ChunkQualityAnalyzer
from src.rag_pipeline.exporters import JSONExporter
from src.rag_pipeline.embedder import DocumentEmbedder
from src.rag_pipeline.embedding_exporter import EmbeddingExporter
from src.rag_pipeline.weaviate_store import WeaviateStore


print("="*60)
print("RAG INGESTION PIPELINE")
print("="*60)



# -----------------------------
# 1. Parse PDF
# -----------------------------

documents = parse_pdf()



# -----------------------------
# 2. Clean
# -----------------------------

cleaner = DocumentCleaner()

documents = cleaner.clean(
    documents
)



# -----------------------------
# 3. Restore structure
# -----------------------------

structure = StructureEnhancer()

documents = structure.enhance(
    documents
)



# -----------------------------
# 4. Merge logical sections
# -----------------------------

merger = DocumentMerger(
    max_section_chars=4000
)


documents = merger.merge(
    documents
)



# -----------------------------
# 5. Chunk
# -----------------------------

chunker = DocumentChunker()

chunks = chunker.chunk(
    documents
)



# -----------------------------
# 6. Analyze
# -----------------------------

analyzer = ChunkQualityAnalyzer()

analyzer.analyze(
    chunks
)



# -----------------------------
# 7. Export
# -----------------------------

chunk_exporter = JSONExporter()

chunk_exporter.export(
    chunks
)

embedder = DocumentEmbedder()


chunks, vectors = embedder.embed(
    chunks
)


print(
    "First vector length:",
    len(vectors[0])
)



embedding_exporter = EmbeddingExporter()

embedding_exporter.export(
    chunks,
    vectors
)

# -----------------------------
# 10. Store in Weaviate
# -----------------------------


store = WeaviateStore()


store.store(
    chunks,
    vectors
)


store.close()

print(
    "Pipeline completed"
)