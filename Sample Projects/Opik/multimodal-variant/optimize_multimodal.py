"""
Optimize a multimodal (vision + text) driving hazard agent with Opik + opik-optimizer.

This file closely follows the Towards Data Science walkthrough:
https://towardsdatascience.com/automatic-prompt-optimization-for-multimodal-vision-agents-a-self-driving-car-example/

Differences compared to the article:
- More comments and structure so it's easier to revisit later.
- Clear separation of "configuration", "dataset/metrics", "prompt", and "optimizer" sections.
"""

from typing import Any

from opik_optimizer.datasets import driving_hazard
from opik_optimizer import ChatPrompt, HRPO
from opik.evaluation.metrics import LevenshteinRatio
from opik.evaluation.metrics.score_result import ScoreResult


def load_datasets() -> tuple[Any, Any]:
    """
    Load a small training and validation slice of the Driving Hazard dataset.

    The dataset is:
    - DHPR (Driving Hazard Prediction and Reasoning), mapped in opik-optimizer as `driving_hazard`.
    - Multimodal: each row has an image + hazard text + other metadata.

    For the tutorial we keep counts small so runs are fast and cheap.
    In a "real" run, you'd increase these (or use pre-defined splits).
    """
    # A small training sample
    train = driving_hazard(count=20)

    # A small validation / test sample
    # You can also do: validation = driving_hazard(split="test", count=5)
    validation = driving_hazard(count=5)

    return train, validation


def levenshtein_ratio_metric(dataset_item: dict[str, Any], llm_output: str) -> ScoreResult:
    """
    Metric function used by the optimizer to score each model output.

    Why Levenshtein?
    - We don't want strict string equality (too brittle for natural language).
    - Instead, we measure how *similar* the model output is to the ground truth
      (the human-labeled `hazard` field from the dataset).
    - The Levenshtein ratio returns a score between 0.0 and 1.0.
      Higher = "closer" to the human label.
    """
    metric = LevenshteinRatio()

    # dataset_item["hazard"] is the reference text we want the model to match
    metric_score = metric.score(reference=dataset_item["hazard"], output=llm_output)

    # ScoreResult is how Opik expects metrics to be returned:
    # - value: numeric score
    # - name: metric name (for dashboards)
    # - reason: human-readable explanation of the score for this row
    return ScoreResult(
        value=metric_score.value,
        name=metric_score.name,
        reason=(
            "Levenshtein ratio between "
            f"`{dataset_item['hazard']}` and `{llm_output}` "
            f"is `{metric_score.value}`."
        ),
    )


def build_chat_prompt() -> ChatPrompt:
    """
    Construct the baseline ChatPrompt for the driving hazard agent.

    This is the "thing we are optimizing":
    - We start from a human-written system prompt describing the task.
    - The user message includes:
      - {question}: the text question from the dataset.
      - {image}: the URL / image content from the dataset.
    The optimizer will mutate the system prompt to improve scores.
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

    # ChatPrompt is an OpenAI-style chat template:
    # - messages: list of {role, content}
    # - the `{question}` and `{image}` placeholders will be filled
    #   from the dataset row fields with matching names.
    prompt = ChatPrompt(
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "{question}"},
                    {
                        "type": "image_url",
                        "image_url": {
                            # The optimizer / Opik will map `{image}` from the dataset
                            # into whatever the target model expects as an image URL.
                            "url": "{image}",
                        },
                    },
                ],
            },
        ],
    )

    return prompt


def build_optimizer() -> HRPO:
    """
    Configure the Hierarchical Reflective Prompt Optimizer (HRPO).

    This optimizer:
    - Looks at failures across the dataset.
    - Tries to infer *why* the prompt failed (root-cause analysis).
    - Proposes new candidate prompts that better fit the dataset.

    You can change:
    - model: any vision-capable LLM you have access to.
    - model_parameters: temperature, etc.
    """
    optimizer = HRPO(
        # This is from the article. Replace with a model name you have:
        # e.g. "openai/gpt-4.1-mini" or your provider's multimodal model.
        model="openai/gpt-5.2",
        model_parameters={
            "temperature": 1.0,
        },
    )
    return optimizer


def main() -> None:
    """
    End-to-end execution entrypoint:
    1. Load datasets (train + validation).
    2. Build the base prompt.
    3. Build the optimizer.
    4. Run optimize_prompt.
    5. Show results in the terminal.

    Prerequisites before running:
    - `opik configure` has been run once (stores Opik credentials).
    - Environment variable for your LLM provider (e.g. OPENAI_API_KEY) is set.
    """
    print("Loading datasets...")
    train_dataset, validation_dataset = load_datasets()

    print("Building base ChatPrompt...")
    prompt = build_chat_prompt()

    print("Configuring HRPO optimizer...")
    optimizer = build_optimizer()

    print("Running optimization...")
    optimization_result = optimizer.optimize_prompt(
        prompt=prompt,
        dataset=train_dataset,
        validation_dataset=validation_dataset,
        metric=levenshtein_ratio_metric,
        max_trials=10,  # number of optimization rounds; increase for more thorough search
    )

    print("Optimization complete. Displaying summary:\n")
    optimization_result.display()


if __name__ == "__main__":
    main()

