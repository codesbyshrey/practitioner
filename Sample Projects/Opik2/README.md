# Opik2 – Reusable Agent Optimization Starter Kit

This folder is a **copy-paste template** for new prompt-optimization projects. It contains:

- **Vision/multimodal agents** → `optimize_vision.py`
- **Text-only agents** → `optimize_text.py`
- **This README** → instructions for both patterns

**How to use:** Copy the entire `Opik2` folder to a new project directory (e.g. `MyProject/`), then follow the adaptation steps below for your dataset and agent.

---

## Quick start (one-time setup)

Do this once per machine (or per venv):

1. **Create and activate a virtualenv**
   ```bash
   cd /path/to/Opik2
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Opik**
   ```bash
   opik configure
   ```
   Use your Opik instance URL and API key so runs are logged.

4. **Set LLM API key**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```
   (Or the env var for your provider if you switch the model in the script.)

---

# Part A: Vision / multimodal agents

**When to use:** Your agent takes **image(s) + text** and outputs text (e.g. image QA, hazard detection, diagram understanding, OCR + reasoning).

**Script:** `optimize_vision.py`

---

## A.1. What the script does

1. Loads a **multimodal dataset** (each row = image + text input + reference text output).
2. Defines a **metric** (e.g. Levenshtein ratio between model output and reference).
3. Builds a **ChatPrompt** with a **system** message and a **user** message containing:
   - `{question}` (or your column name) – text
   - `{image}` (or your column name) – image URL or content
4. Runs **HRPO** to iteratively improve the **system prompt** so outputs score higher on the metric.

---

## A.2. Dataset format (vision)

Each row in your dataset should have:

| Purpose        | Column name (example) | Description                          |
|----------------|------------------------|--------------------------------------|
| Text input     | `question`             | Instruction or question for the model |
| Image input    | `image`                | Image URL or content the model accepts |
| Ground truth   | `hazard` or `answer`   | Reference text used to score output   |

You can use different names; just use the **same names** in the metric and in the ChatPrompt placeholders (e.g. `{question}`, `{image}`).

**Out of the box:** `optimize_vision.py` uses the built-in `driving_hazard` dataset (DHPR). No changes needed to run it.

---

## A.3. What to change for YOUR vision dataset

1. **`load_datasets()`**
   - Replace the `driving_hazard(...)` calls with your own loader.
   - Return two Opik-compatible datasets (train, validation).
   - If you use Hugging Face: load the HF dataset, map rows to dicts with keys `question`, `image`, and your reference key; then use the Opik client to `get_or_create_dataset` and `insert(records)` (see Opik docs).

2. **`metric()`**
   - Change `dataset_item["hazard"]` to your reference column (e.g. `dataset_item["answer"]`).

3. **`build_chat_prompt()`**
   - Rewrite the **system prompt** for your task.
   - In the **user** message, keep `{question}` and `{image}` only if your columns are named that; otherwise use `{your_input_text}` and `{your_image}` to match your dataset.

4. **`build_optimizer()`**
   - Set `model` to a **vision-capable** model (e.g. `openai/gpt-4o`, `openai/gpt-4.1-mini`).

5. **Run**
   ```bash
   python optimize_vision.py
   ```

---

## A.4. Vision checklist (new project)

- [ ] Copy `Opik2` folder to new project directory.
- [ ] In `optimize_vision.py`: implement or replace `load_datasets()` with your multimodal data.
- [ ] In `optimize_vision.py`: set metric reference column and (optional) prompt placeholders.
- [ ] In `optimize_vision.py`: set system prompt and model name.
- [ ] Run `python optimize_vision.py` and check Opik UI for runs and scores.

---

# Part B: Text-only agents

**When to use:** Your agent takes **text only** (e.g. question, instruction) and outputs text. No images.

**Script:** `optimize_text.py`

---

## B.1. What the script does

1. Loads a **text dataset** (each row = input text + reference text output).
2. Defines a **metric** (e.g. Levenshtein ratio between model output and reference).
3. Builds a **ChatPrompt** with **system** + **user** messages; user message has only **text** placeholders (e.g. `{question}`).
4. Runs **HRPO** to improve the **system prompt** so outputs score higher.

---

## B.2. Dataset format (text)

Each row should have:

| Purpose      | Column name (example) | Description                    |
|-------------|------------------------|--------------------------------|
| Input text  | `question`             | Instruction or question        |
| Ground truth| `answer`               | Reference text for scoring     |

**Out of the box:** `optimize_text.py` uses the built-in **GSM8K** dataset (math word problems). If your `opik_optimizer` install doesn’t include `gsm8k`, use the custom-dataset pattern in the script comments and in B.3 (list of dicts + Opik client `get_or_create_dataset` + `insert`).

---

## B.3. What to change for YOUR text dataset

1. **`load_datasets()`**
   - Replace `gsm8k(...)` with your own loader.
   - Return two Opik-compatible datasets. For custom data: build a list of dicts (e.g. `[{"question": "...", "answer": "..."}]`), then use the Opik client to create datasets and `insert(records)` (see Opik docs for exact API).

2. **`metric()`**
   - Change `dataset_item["answer"]` to your reference column (e.g. `dataset_item["expected"]`).

3. **`build_chat_prompt()`**
   - Rewrite the **system prompt** for your task.
   - In the **user** message, use a placeholder that matches your input column (e.g. `{question}`, `{instruction}`, `{input}`).

4. **`build_optimizer()`**
   - Set `model` to any **text** LLM (e.g. `openai/gpt-4o-mini`, `openai/gpt-4o`). No vision required.

5. **Run**
   ```bash
   python optimize_text.py
   ```

---

## B.4. Text-only checklist (new project)

- [ ] Copy `Opik2` folder to new project directory.
- [ ] In `optimize_text.py`: implement or replace `load_datasets()` with your text data.
- [ ] In `optimize_text.py`: set metric reference column and user placeholder to match your columns.
- [ ] In `optimize_text.py`: set system prompt and model name.
- [ ] Run `python optimize_text.py` and check Opik UI.

---

# Summary

| Agent type   | Script              | Dataset example   | Placeholders in prompt   | Model type   |
|-------------|---------------------|-------------------|---------------------------|-------------|
| Vision      | `optimize_vision.py`| driving_hazard    | `{question}`, `{image}`   | Vision LLM  |
| Text-only   | `optimize_text.py`  | gsm8k             | `{question}`              | Any LLM     |

Copy **Opik2** to a new folder for each project and adapt the one script (vision or text) that fits your agent. Keep this README in the copied folder so you always have the adaptation steps and checklists in one place.
