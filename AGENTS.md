# Repository Guidelines

## Project Structure & Module Organization
Keep all production Python code under `src/agentbazaar/` and mirror that structure inside `tests/`. Group shared utilities in `src/agentbazaar/core/`, agent playbooks in `src/agentbazaar/agents/`, and connector adapters in `src/agentbazaar/integrations/`. Configuration templates live in `configs/`, living documentation in `docs/`, and reusable prompts or transcripts in `assets/`. Example layout:
```
src/
  agentbazaar/
    core/
    agents/
    integrations/
tests/
configs/
scripts/
docs/
assets/
```

## Build, Test, and Development Commands
- `python -m venv .venv` and activate it (`.\.venv\Scripts\activate` on Windows, `source .venv/bin/activate` elsewhere) — create an isolated development environment.
- `python -m pip install -r requirements.txt` — install runtime dependencies; regenerate the lock file whenever pins change.
- `python -m pip install -r requirements-dev.txt` — bring in linting, typing, and tooling dependencies.
- `pytest` or `pytest -n auto` — run the suite; use `-k name` to target a module while iterating.
- `ruff check src tests` — enforce lint and formatting; fix issues with `ruff format`.
- `mypy src` — maintain type coverage for shared components and agent contracts.

## Coding Style & Naming Conventions
Target Python 3.11+, four-space indentation, and descriptive `snake_case` modules and functions. Reserve `CamelCase` for classes and agents (e.g., `SearchAgent`). Shared protocols live in `protocols.py`, and public functions include type hints plus docstrings that capture side effects. Keep configuration defaults inside `configs/defaults.py` and avoid hard-coding credentials in code.

## Testing Guidelines
Author tests with `pytest`, mirroring package paths so `tests/agents/test_<name>.py` exercises `src/agentbazaar/agents/<name>.py`. Use fixtures in `tests/conftest.py` to stub external services. Each agent should include at least one integration test that hits its primary decision path. Run `pytest --cov=agentbazaar --cov-report=term-missing` and keep new code at or above 85% coverage. Add regression tests for any bug fix before merging.

## Commit & Pull Request Guidelines
We follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Summaries stay under 72 characters and the body calls out rationale and follow-up work. PRs must link to the tracking issue, list verification commands, and include screenshots or transcripts when UX or prompt behavior changes. Ensure CI is green before requesting review.

## Security & Configuration Tips
Never commit secrets or API keys; store local overrides in `.env.local` (git-ignored) and document required variables in `.env.example`. Obfuscate or redact user data in recorded conversations before checking them into `assets/`. When adding connectors, validate OAuth flows against sandboxes and gate secrets behind feature flags in `configs/feature_flags.yaml`.