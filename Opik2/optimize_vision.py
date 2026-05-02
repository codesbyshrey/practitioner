"""
VISION / MULTIMODAL AGENT OPTIMIZATION TEMPLATE

Use this script when your agent takes IMAGE + TEXT inputs and produces text output
(e.g. image captioning, visual QA, driving hazard detection, diagram understanding).

HOW TO ADAPT FOR YOUR PROJECT:
1. Replace or modify load_datasets() to load YOUR multimodal dataset.
2. In the metric: use YOUR dataset's reference column name (e.g. "answer", "caption").
3. In build_chat_prompt(): use YOUR placeholder names that match dataset columns.
4. In build_optimizer(): set YOUR model name (must support vision).
5. Run: python optimize_vision.py

Dataset format expected per row:
- At least one TEXT field (e.g. "question", "instruction").
- One IMAGE field (URL or base64) that your model can consume.
- One REFERENCE field (ground truth text to score against, e.g. "hazard", "answer").
"""

from typing import Any

from opik_optimizer import ChatPrompt, HRPO
from opik.evaluation.metrics import LevenshteinRatio
from opik.evaluation.metrics.score_result import ScoreResult

# -----------------------------------------------------------------------------
# OPTION A: Use the built-in driving hazard dataset (ready to run as-is).
# -----------------------------------------------------------------------------
from opik_optimizer.datasets import driving_hazard


def load_datasets():
    """
    Load training and validation data for the VISION agent.

    OUT OF THE BOX: Uses the driving_hazard (DHPR) dataset.
    FOR YOUR PROJECT: Replace with your own loader that returns two Opik-compatible
    datasets. Each row should include:
    - A text field (e.g. "question") that you will inject into the user message.
    - An image field (e.g. "image") that the SDK will pass to the vision model.
    - A reference field (e.g. "hazard", "answer") used by the metric.
    """
    # Built-in example: small slices for fast runs
    train = driving_hazard(count=20)
    validation = driving_hazard(count=5)
    return train, validation

    # -------------------------------------------------------------------------
    # OPTION B: Your custom multimodal dataset.
    # -------------------------------------------------------------------------
    # Example: load from Hugging Face and wrap for Opik, or use opik client:
    #
    # from datasets import load_dataset
    # import opik
    #
    # hf_ds = load_dataset("your-org/your-multimodal-dataset", split="train")
    # records = [
    #     {
    #         "question": row["question"],   # or "instruction", etc.
    #         "image": row["image"],         # PIL or URL; Opik may convert
    #         "hazard": row["answer"],       # ground truth for scoring
    #     }
    #     for row in hf_ds.select(range(100))
    # ]
    # client = opik.Opik()
    # train_ds = client.get_or_create_dataset("my-vision-train")
    # train_ds.insert(records)
    # validation_ds = ...  # same for hold-out set
    # return train_ds, validation_ds


def metric(dataset_item: dict[str, Any], llm_output: str) -> ScoreResult:
    """
    Score model output against ground truth.

    ADAPT: Change "hazard" to whatever your dataset calls the reference column
    (e.g. "answer", "caption", "summary"). Use LevenshteinRatio for fuzzy
    text similarity, or swap in another Opik metric (e.g. LLM-as-a-judge).
    """
    reference = dataset_item["hazard"]  # <-- YOUR reference column name
    lev = LevenshteinRatio()
    score = lev.score(reference=reference, output=llm_output)
    return ScoreResult(
        value=score.value,
        name=score.name,
        reason=f"Levenshtein ratio(ref, output) = {score.value}.",
    )


def build_chat_prompt() -> ChatPrompt:
    """
    Baseline prompt for the VISION agent.

    ADAPT:
    - System prompt: describe YOUR task and desired output style.
    - User content: the keys in {question} and {image} must match your
      dataset column names. Add or remove blocks (e.g. multiple images)
      as your model supports.
    """
    system_prompt = """You are an expert driving safety assistant
specialized in hazard detection. Your task is to analyze dashcam
images and identify potential hazards that a driver should be aware of.

For each image:
1. Carefully examine the visual scene
2. Identify any potential hazards (pedestrians, vehicles,
   road conditions, obstacles, etc.)
3. Assess the urgency and severity of each hazard
4. Provide a clear, specific description of the hazard

Be precise and actionable in your hazard descriptions.
Focus on safety-critical information."""

    # Placeholders {question} and {image} are filled from dataset columns
    # with the same names. Use YOUR column names here.
    prompt = ChatPrompt(
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "{question}"},
                    {
                        "type": "image_url",
                        "image_url": {"url": "{image}"},
                    },
                ],
            },
        ],
    )
    return prompt


def build_optimizer() -> HRPO:
    """
    HRPO optimizer. ADAPT: Set your vision-capable model (e.g. gpt-4o, gpt-4.1-mini).
    """
    return HRPO(
        model="openai/gpt-4o",  # or gpt-4.1-mini, etc.; must support images
        model_parameters={"temperature": 0.7},
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
