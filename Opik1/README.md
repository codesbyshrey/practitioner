# Opik1 – Automatic Prompt Optimization for a Multimodal Driving Agent

This project recreates (and heavily comments) the tutorial from  
“Automatic Prompt Optimization for Multimodal Vision Agents: A Self‑Driving Car Example”  
on Towards Data Science (`https://towardsdatascience.com/automatic-prompt-optimization-for-multimodal-vision-agents-a-self-driving-car-example/`).

The goal is:

- Start from a simple **multimodal driving hazard agent** (image + text).
- Use **Opik + opik-optimizer** to automatically improve its system prompt.
- Keep the code and comments **navigable for future you**.

---

## 0. Folder Layout

In `Desktop/ORV2/Opik1` you have:

- `requirements.txt` – Python dependencies for this tutorial.
- `optimize_multimodal.py` – main script that:
  - Loads the driving hazard dataset.
  - Defines an evaluation metric.
  - Defines a baseline ChatPrompt.
  - Runs the HRPO optimizer.
- `README.md` – this walkthrough/tutorial.

You can add notebooks, logs, or screenshots here later if you want.

---

## 1. Environment Setup

### 1.1. Create & activate a virtualenv

From `Desktop/ORV2/Opik1`:

```bash
python -m venv .venv
source .venv/bin/activate  # on macOS / Linux
# .venv\Scripts\activate   # on Windows PowerShell
```

### 1.2. Install dependencies

```bash
pip install -r requirements.txt
```

This pulls in:

- `opik-optimizer` – the automatic prompt optimization toolkit.
- `opik` – handles datasets, evaluation, and the Opik backend.

### 1.3. Configure Opik (one-time)

```bash
opik configure
```

Follow the prompts to:

- Point to an Opik instance (self‑hosted or cloud).
- Set an API key / token so runs can be logged and inspected.

### 1.4. Configure your LLM provider

For the article, the author uses OpenAI models. Example (bash):

```bash
export OPENAI_API_KEY="sk-..."
```

You can swap `"openai/gpt-5.2"` in the script for any **vision-capable** model you actually have access to (e.g. `"openai/gpt-4.1-mini"` or an equivalent via LiteLLM).

---

## 2. What the Script Does (High Level)

Open `optimize_multimodal.py`. It has four main parts:

1. **Dataset loading** – imports a small slice of the driving hazard dataset.
2. **Metric definition** – Levenshtein ratio between model output and human label.
3. **Prompt definition** – baseline system prompt + user template (text + image).
4. **Optimizer configuration + run** – HRPO optimizer searches for better prompts.

You can think of it as:

> _“Given these labeled examples and a baseline prompt, please hill‑climb until the prompt produces outputs closer to the ground truth.”_

---

## 3. Step-by-step Through `optimize_multimodal.py`

### 3.1. Imports

At the top:

- `driving_hazard` – gives you the DHPR driving hazard dataset as an Opik dataset.
- `ChatPrompt` – wraps the system + user messages as an OpenAI-style prompt object.
- `HRPO` – the Hierarchical Reflective Prompt Optimizer algorithm.
- `LevenshteinRatio` / `ScoreResult` – evaluation metric + result container.

### 3.2. Loading the dataset – `load_datasets()`

```python
train = driving_hazard(count=20)
validation = driving_hazard(count=5)
```

- **What’s happening**:
  - `driving_hazard` is a helper that:
    - Downloads the DHPR dataset from Hugging Face (if needed).
    - Wraps it as an Opik dataset you can see in the Opik UI.
  - `count=20` and `count=5` keep the tutorial cheap and fast.
- **How to scale later**:
  - Use `split="train"`, `split="validation"`, `split="test"` and remove `count` or make it larger.
  - More data = more reliable optimization signal (less noise).

### 3.3. Metric – `levenshtein_ratio_metric(...)`

This is how the optimizer knows if a prompt change is “better” or “worse”.

```python
metric_score = metric.score(
    reference=dataset_item["hazard"], 
    output=llm_output
)
```

- `dataset_item["hazard"]` = human-written hazard description.
- `llm_output` = the agent’s answer using the current prompt.
- `LevenshteinRatio` returns a value in \[0.0, 1.0\]:
  - 1.0 → exactly the same text.
  - 0.9 → very similar.
  - 0.3 → pretty far off.

We then wrap it in a `ScoreResult`:

- `value` → the numeric score HRPO optimizes.
- `reason` → human-readable explanation important for HRPO’s reflective analysis.

### 3.4. Prompt – `build_chat_prompt()`

The **system prompt** describes the role:

> _You are an expert driving safety assistant specialized in hazard detection…_

The **user content** is multimodal:

```python
{
  "role": "user",
  "content": [
    {"type": "text", "text": "{question}"},
    {
      "type": "image_url",
      "image_url": {
        "url": "{image}",
      },
    },
  ],
}
```

- `{question}` and `{image}` placeholders will be filled from dataset columns named `question` and `image` for each row.
- The optimizer mutates the **system prompt**; the user template stays stable.

### 3.5. Optimizer – `build_optimizer()`

```python
optimizer = HRPO(
    model="openai/gpt-5.2",
    model_parameters={"temperature": 1.0},
)
```

- HRPO:
  - Looks across examples for systematic failures.
  - Tries to explain _why_ they failed (root causes).
  - Proposes new system prompts that specifically address those failure modes.
- You can:
  - Change `model` to any multimodal model you have.
  - Adjust `temperature` (start with 0.7–1.0 for diversity; lower if you want more stability).

### 3.6. The main loop – `main()`

```python
optimization_result = optimizer.optimize_prompt(
    prompt=prompt,
    dataset=train_dataset,
    validation_dataset=validation_dataset,
    metric=levenshtein_ratio_metric,
    max_trials=10,
)
```

- `prompt` – your starting ChatPrompt.
- `dataset` – training examples the optimizer can “learn from”.
- `validation_dataset` – small hold‑out for before/after comparison.
- `metric` – our Levenshtein-based scoring function.
- `max_trials` – number of optimization loops (try increasing later).

`optimization_result.display()` prints:

- Baseline metric.
- Best metric after optimization.
- The improved prompt text you can paste back into your production agent.

---

## 4. How to Run It

From `Desktop/ORV2/Opik1` with your virtualenv active:

```bash
python optimize_multimodal.py
```

You should see logs like:

- Loading dataset…
- Running optimization…
- A summary at the end with before/after scores and the final prompt.

You can also open your Opik UI to inspect:

- The dataset (`driving_hazard_train_*`).
- The optimization run.
- Per-example failures and scores.

---

## 5. Ideas for Future Extensions

- **Use full dataset splits** instead of small `count` samples.
- **Swap optimizers**:
  - Try meta-prompting or other algorithms from `opik-optimizer`.
- **Add more metrics**:
  - LLM-as-a-judge scoring for nuance (e.g. structure, correctness).
  - Custom rule-checks (e.g. “must mention at least one entity and one action”).
- **Generalize pattern**:
  - Swap `driving_hazard` for your own multimodal dataset, keep:
    - The `load_datasets` skeleton.
    - Metric pattern.
    - HRPO configuration.

This README is meant to sit next to the code so that future you can re-orient quickly, tweak parameters, and reuse the same optimization pattern for other agents and datasets. 

