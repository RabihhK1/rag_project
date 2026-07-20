import logging

from . import config


def setup_logger() -> logging.Logger:
    """
    Create and configure the application logger.
    """

    config.LOG_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    logger = logging.getLogger("RAG")

    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%H:%M:%S"
    )

    console_handler = logging.StreamHandler()

    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(
        config.LOG_DIR / "rag.log",
        encoding="utf-8"
    )

    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    logger.addHandler(file_handler)

    return logger


logger = setup_logger()