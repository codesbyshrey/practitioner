"""
TEXT-ONLY AGENT OPTIMIZATION TEMPLATE

Use this script when your agent takes TEXT input and produces TEXT output
(e.g. math QA, summarization, instruction-following, classification with
natural language labels). No images involved.

HOW TO ADAPT FOR YOUR PROJECT:
1. Replace or modify load_datasets() to load YOUR text dataset.
2. In the metric: use YOUR dataset's reference column name (e.g. "answer", "summary").
3. In build_chat_prompt(): use YOUR placeholder names that match dataset columns.
4. In build_optimizer(): set YOUR model name (any LLM).
5. Run: python optimize_text.py

Dataset format expected per row:
- At least one INPUT text field (e.g. "question", "instruction", "input").
- One REFERENCE text field (ground truth to score against, e.g. "answer", "expected").
"""

from typing import Any

from opik_optimizer import ChatPrompt, HRPO
from opik.evaluation.metrics import LevenshteinRatio
from opik.evaluation.metrics.score_result import ScoreResult

# -----------------------------------------------------------------------------
# OPTION A: Use the built-in GSM8K (math) dataset – ready to run as-is.
# If ImportError: gsm8k not in your opik_optimizer version – use OPTION B below.
# -----------------------------------------------------------------------------
from opik_optimizer.datasets import gsm8k


def load_datasets():
    """
    Load training and validation data for the TEXT agent.

    OUT OF THE BOX: Uses GSM8K (grade-school math word problems).
    Each row has "question" and "answer". No images.

    FOR YOUR PROJECT: Replace with your own loader that returns two
    Opik-compatible datasets. Each row should include:
    - An input text field (e.g. "question", "instruction").
    - A reference text field (e.g. "answer", "expected") for the metric.
    """
    # Built-in example: small slices for fast runs
    train = gsm8k(split="train", count=30)
    validation = gsm8k(split="test", count=10)
    return train, validation

    # -------------------------------------------------------------------------
    # OPTION B: Your custom text-only dataset.
    # -------------------------------------------------------------------------
    # Example: list of dicts, then register with Opik:
    #
    # import opik
    #
    # records = [
    #     {"question": "What is 2+2?", "answer": "4"},
    #     {"instruction": "Summarize: ...", "expected": "..."},
    # ]
    # client = opik.Opik()
    # train_ds = client.get_or_create_dataset("my-text-train")
    # train_ds.insert(records[:80])
    # val_ds = client.get_or_create_dataset("my-text-val")
    # val_ds.insert(records[80:])
    # return train_ds, val_ds


def metric(dataset_item: dict[str, Any], llm_output: str) -> ScoreResult:
    """
    Score model output against ground truth.

    ADAPT: Change "answer" to your dataset's reference column name
    (e.g. "expected", "summary", "label"). For exact match you could use
    Equals; LevenshteinRatio gives fuzzy similarity (better for optimizer).
    """
    reference = dataset_item["answer"]  # <-- GSM8K uses "answer"; use YOUR column
    lev = LevenshteinRatio()
    score = lev.score(reference=reference, output=llm_output)
    return ScoreResult(
        value=score.value,
        name=score.name,
        reason=f"Levenshtein ratio(ref, output) = {score.value}.",
    )


def build_chat_prompt() -> ChatPrompt:
    """
    Baseline prompt for the TEXT agent. No image_url blocks.

    ADAPT:
    - System prompt: describe YOUR task (e.g. "Solve the math problem").
    - User content: the key in {question} must match your dataset column
      (e.g. {instruction}, {input}). Single text placeholder is typical.
    """
    system_prompt = """You are a precise math problem solver.
Given a grade-school math word problem, reason step by step and then
give the final numerical answer. Be concise and correct."""

    # Single text placeholder – must match a column name in your dataset
    prompt = ChatPrompt(
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "{question}"},
                ],
            },
        ],
    )
    return prompt


def build_optimizer() -> HRPO:
    """
    HRPO optimizer. ADAPT: Use any text-capable model (no vision required).
    """
    return HRPO(
        model="openai/gpt-4o-mini",  # or gpt-4o, claude-3-5-sonnet, etc.
        model_parameters={"temperature": 0.5},
    )


def main():
    train_ds, val_ds = load_datasets()
    prompt = build_chat_prompt()
    optimizer = build_optimizer()

    result = optimizer.optimize_prompt(
        prompt=prompt,
        dataset=train_ds,
        validation_dataset=val_ds,
        metric=metric,
        max_trials=10,
    )
    result.display()


if __name__ == "__main__":
    main()
