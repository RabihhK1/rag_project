"""
Data models for the RAG pipeline.

Defines the structure of information
moving between pipeline stages.
"""


from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List



@dataclass
class ParsedElement:
    """
    Represents one element extracted from a document.

    Examples:
    - paragraph
    - title
    - table
    - image
    """

    id: int

    text: str

    category: str

    page_number: Optional[int] = None

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )



@dataclass
class Chunk:
    """
    Represents a retrieval chunk.

    This is what will later be embedded.
    """

    id: int

    text: str

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )



@dataclass
class Embedding:
    """
    Represents vector embedding data.
    """

    chunk_id: int

    vector: List[float]

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )