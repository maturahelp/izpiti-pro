#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
from pathlib import Path

from bel_textbook_canon import validate_questions


ROOT = Path(__file__).resolve().parents[1]
MOCK_EXAMS = ROOT / "generated" / "mock_exams" / "mock_nvo_dzi_exams.json"
SELECTED_DZI = ROOT / "generated" / "selected_dzi_mocks" / "selected_dzi_mocks.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_mock_exams(payload: dict) -> list[str]:
    errors: list[str] = []
    for exam in payload.get("nvo_exams", []):
        mismatches = validate_questions(exam["questions"], "nvo")
        if mismatches:
            details = ", ".join(f"Q{number}: {', '.join(titles)}" for number, titles in mismatches)
            errors.append(f"{exam['title']} -> {details}")
    for exam in payload.get("dzi_exams", []):
        mismatches = validate_questions(exam["questions"], "dzi")
        if mismatches:
            details = ", ".join(f"Q{number}: {', '.join(titles)}" for number, titles in mismatches)
            errors.append(f"{exam['title']} -> {details}")
    return errors


def validate_selected_dzi(payload: dict) -> list[str]:
    errors: list[str] = []
    for exam in payload.get("exams", []):
        mismatches = validate_questions(exam["questions"], "dzi")
        if mismatches:
            details = ", ".join(f"Q{number}: {', '.join(titles)}" for number, titles in mismatches)
            errors.append(f"{exam['title']} -> {details}")
    return errors


def main():
    all_errors: list[str] = []
    if MOCK_EXAMS.exists():
        all_errors.extend(validate_mock_exams(load_json(MOCK_EXAMS)))
    if SELECTED_DZI.exists():
        all_errors.extend(validate_selected_dzi(load_json(SELECTED_DZI)))
    if all_errors:
        raise SystemExit("Textbook validation failed:\n" + "\n".join(f"- {line}" for line in all_errors))
    print("All generated mock exams are textbook-valid.")


if __name__ == "__main__":
    main()
