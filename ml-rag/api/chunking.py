import re


WORD_PATTERN = re.compile(r"\S+")


def normalize_text(text: str) -> str:
    cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    return cleaned.strip()


def split_into_paragraphs(text: str) -> list[str]:
    normalized = normalize_text(text)
    if not normalized:
        return []
    return [paragraph.strip() for paragraph in normalized.split("\n\n") if paragraph.strip()]


def chunk_text(text: str, max_words: int = 170, overlap_words: int = 40) -> list[str]:
    paragraphs = split_into_paragraphs(text)
    if not paragraphs:
        return []

    chunks: list[str] = []
    current_words: list[str] = []

    for paragraph in paragraphs:
        words = WORD_PATTERN.findall(paragraph)
        if not words:
            continue

        if len(words) > max_words:
            if current_words:
                chunks.append(" ".join(current_words))
                current_words = []

            start = 0
            while start < len(words):
                end = min(start + max_words, len(words))
                chunks.append(" ".join(words[start:end]))
                if end >= len(words):
                    break
                start = max(end - overlap_words, start + 1)
            continue

        if len(current_words) + len(words) <= max_words:
            current_words.extend(words)
            continue

        if current_words:
            chunks.append(" ".join(current_words))
            current_words = current_words[-overlap_words:] if overlap_words else []

        current_words.extend(words)

    if current_words:
        chunks.append(" ".join(current_words))

    return chunks
