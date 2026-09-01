from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class SupportedIntent:
    id: str
    label: str
    category: str
    high_stakes: bool


def _registry_path() -> Path:
    configured = os.getenv("ISL_INTENT_REGISTRY")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parents[3] / "shared" / "isl_intents.json"


def load_supported_intents() -> tuple[SupportedIntent, ...]:
    path = _registry_path()
    with path.open("r", encoding="utf-8") as registry_file:
        records = json.load(registry_file)

    intents = tuple(SupportedIntent(**record) for record in records)
    if not 30 <= len(intents) <= 50:
        raise RuntimeError("The constrained intent registry must contain 30 to 50 classes.")
    ids = [intent.id for intent in intents]
    if len(ids) != len(set(ids)):
        raise RuntimeError("Intent IDs must be unique and stable.")
    return intents


SUPPORTED_INTENTS = load_supported_intents()
INTENT_BY_ID = {intent.id: intent for intent in SUPPORTED_INTENTS}
