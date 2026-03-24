import os
import re
from typing import Any

import requests


STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
}


def _tokenize(text: str) -> list[str]:
    return [token for token in re.findall(r"[a-z0-9]+", text.lower()) if token not in STOPWORDS]


def _sentence_split(text: str) -> list[str]:
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text.strip()) if sentence.strip()]


def _extractive_answer(query: str, contexts: list[dict[str, Any]]) -> str:
    query_terms = set(_tokenize(query))
    ranked_sentences: list[tuple[float, str, int]] = []

    for index, context in enumerate(contexts, start=1):
        for sentence in _sentence_split(context["text"]):
            sentence_terms = set(_tokenize(sentence))
            overlap = len(query_terms & sentence_terms)
            if not overlap:
                continue
            density = overlap / max(len(sentence_terms), 1)
            ranked_sentences.append((overlap + density, sentence.strip(), index))

    ranked_sentences.sort(key=lambda item: item[0], reverse=True)

    if not ranked_sentences:
        previews = [f"[{idx}] {context['source']}: {context['preview']}" for idx, context in enumerate(contexts, start=1)]
        return (
            "I could not find a direct sentence-level match for that question, but these retrieved chunks are the most relevant:\n"
            f"{chr(10).join(previews[:3])}"
        )

    selected: list[str] = []
    seen_sentences: set[str] = set()
    for _, sentence, citation in ranked_sentences:
        normalized = sentence.lower()
        if normalized in seen_sentences:
            continue
        seen_sentences.add(normalized)
        selected.append(f"{sentence} [{citation}]")
        if len(selected) == 3:
            break

    return " ".join(selected)


def _openai_answer(query: str, contexts: list[dict[str, Any]]) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("Missing OPENAI_API_KEY")

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    context_blocks = []
    for index, context in enumerate(contexts, start=1):
        context_blocks.append(
            f"[{index}] Source: {context['source']}\nChunk: {context['chunk_id']}\nContent: {context['text']}"
        )

    prompt = (
        "You are answering questions over a retrieval corpus. Use only the supplied context. "
        "If the answer is not present, say that clearly. Cite claims with bracketed source numbers like [1].\n\n"
        f"Question: {query}\n\nContext:\n{chr(10).join(context_blocks)}"
    )

    response = requests.post(
        "https://api.openai.com/v1/responses",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "input": prompt,
        },
        timeout=45,
    )
    response.raise_for_status()
    return response.json().get("output_text", "").strip()


def generate_answer(query: str, contexts: list[dict[str, Any]]) -> tuple[str, str]:
    if not contexts:
        return (
            "I do not have any indexed documents yet. Load the demo corpus or upload markdown, text, or PDF files first.",
            "empty",
        )

    if os.getenv("OPENAI_API_KEY", "").strip():
        try:
            return _openai_answer(query, contexts), "openai"
        except Exception:
            pass

    return _extractive_answer(query, contexts), "extractive"
