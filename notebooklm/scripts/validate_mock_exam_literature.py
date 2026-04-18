#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
from pathlib import Path

from bel_textbook_canon import validate_no_placeholders, validate_questions


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[2]
MOCK_EXAMS = ROOT / "generated" / "mock_exams" / "mock_nvo_dzi_exams.json"
SELECTED_DZI = ROOT / "generated" / "selected_dzi_mocks" / "selected_dzi_mocks.json"
COMBINED_EXAM_PRACTICE = ROOT / "generated" / "exam_practice" / "combined_exam_practice.json"
APP_EXAM_PRACTICE = REPO_ROOT / "data" / "mock_exam_practice.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _format_hits(hits: list[tuple[int, list[str]]]) -> str:
    return ", ".join(f"Q{number}: {', '.join(items)}" for number, items in hits)


def validate_exam_questions(exam: dict, exam_track: str, label: str) -> list[str]:
    errors: list[str] = []
    questions = exam.get("questions", [])
    mismatches = validate_questions(questions, exam_track)
    if mismatches:
        errors.append(f"{label}: {exam['title']} -> {_format_hits(mismatches)}")
    placeholders = validate_no_placeholders(questions)
    if placeholders:
        errors.append(f"{label}: {exam['title']} placeholders -> {_format_hits(placeholders)}")
    return errors


def validate_mock_exams(payload: dict) -> list[str]:
    errors: list[str] = []
    for exam in payload.get("nvo_exams", []):
        errors.extend(validate_exam_questions(exam, "nvo", "mock source NVO"))
    for exam in payload.get("dzi_exams", []):
        errors.extend(validate_exam_questions(exam, "dzi", "mock source DZI"))
    return errors


def validate_selected_dzi(payload: dict) -> list[str]:
    errors: list[str] = []
    for exam in payload.get("exams", []):
        errors.extend(validate_exam_questions(exam, "dzi", "selected DZI"))
    return errors


def validate_exam_practice(payload: dict, label: str) -> list[str]:
    errors: list[str] = []
    for exam in payload.get("exams", []):
        exam_type = exam.get("exam_type")
        if exam_type == "nvo_bel":
            errors.extend(validate_exam_questions(exam, "nvo", label))
        elif exam_type == "dzi_bel":
            errors.extend(validate_exam_questions(exam, "dzi", label))
        else:
            errors.append(f"{label}: {exam.get('title', '<untitled>')} has unknown exam_type {exam_type!r}")
    return errors


def main():
    all_errors: list[str] = []
    if MOCK_EXAMS.exists():
        all_errors.extend(validate_mock_exams(load_json(MOCK_EXAMS)))
    if SELECTED_DZI.exists():
        all_errors.extend(validate_selected_dzi(load_json(SELECTED_DZI)))
    if COMBINED_EXAM_PRACTICE.exists():
        all_errors.extend(validate_exam_practice(load_json(COMBINED_EXAM_PRACTICE), "combined exam practice"))
    if APP_EXAM_PRACTICE.exists():
        all_errors.extend(validate_exam_practice(load_json(APP_EXAM_PRACTICE), "app exam practice"))
    if all_errors:
        raise SystemExit("Textbook validation failed:\n" + "\n".join(f"- {line}" for line in all_errors))
    print("All generated mock exams are textbook-valid.")


if __name__ == "__main__":
    main()
