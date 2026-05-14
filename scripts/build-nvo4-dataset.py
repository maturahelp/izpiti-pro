#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal
from urllib.parse import urljoin

import fitz
import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parent.parent
SOURCE_URL = (
    "https://www.mon.bg/obshto-obrazovanie/natsionalno-vanshno-otsenyavane-nvo/"
    "nvo-za-iv-klas/testove-i-verni-otgovori-ot-nvo-za-iv-klas-po-godini/"
)
TMP_DIR = ROOT / "tmp" / "nvo4"
PDF_DIR = TMP_DIR / "pdfs"
PAGE_IMAGE_DIR = ROOT / "public" / "nvo4-page-images"
OFFICIAL_OUTPUT = ROOT / "data" / "official_nvo4_dataset.json"
MOCK_OUTPUT = ROOT / "data" / "mock_nvo4_exam_practice.json"
REPORT_OUTPUT = ROOT / "data" / "nvo4_extraction_report.json"

Subject = Literal["bel", "math"]
Kind = Literal["official", "model", "sample"]

OPTION_LABEL_MAP = {
    "A": "А",
    "А": "А",
    "Б": "Б",
    "B": "Б",
    "В": "В",
    "V": "В",
    "C": "В",
    "Г": "Г",
    "G": "Г",
}

QUESTION_RE = re.compile(r"(?m)^\s*(\d{1,2})\.\s+")
OPTION_RE = re.compile(r"(?m)^\s*([AАБВГ])\)\s*(.*)$")
VISUAL_PROMPT_RE = re.compile(
    r"чертеж|фигур|изображени|таблиц|схем|картин|диаграм|квадрат|окръжност|отсечк|радиус",
    re.I,
)
BOILERPLATE_RE = re.compile(
    r"^(?:\d+|МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО|ИНСТИТУТ ПО ОБРАЗОВАНИЕТО|"
    r"НАЦИОНАЛНО ВЪНШНО ОЦЕНЯВАНЕ|ТЕСТ ПО|ПО БЪЛГАРСКИ ЕЗИК|ПО МАТЕМАТИКА|"
    r"\d{1,2}\s+[а-я]+\s+\d{4}\s+г\.?|КЛЮЧ ЗА ВЕРНИТЕ ОТГОВОРИ|"
    r"ОТГОВОРИ И КРИТЕРИИ ЗА ОЦЕНЯВАНЕ)$",
    re.I,
)


@dataclass
class Source:
    id: str
    year: int
    school_year: str
    subject: Subject
    kind: Kind
    title: str
    source_url: str
    published_at: str | None


def normalize_spaces(text: str) -> str:
    return (
        text.replace("\u00a0", " ")
        .replace("\r", "")
        .replace("І", "IV")
        .replace("–", "–")
    )


def clean_lines(text: str) -> list[str]:
    lines: list[str] = []
    for raw in normalize_spaces(text).splitlines():
        line = re.sub(r"[ \t]+", " ", raw).strip()
        if not line:
            continue
        if BOILERPLATE_RE.match(line):
            continue
        lines.append(line)
    return lines


def collapse_text(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", "\n".join(clean_lines(text))).strip()


def detect_subject(label: str, href: str) -> Subject | None:
    haystack = f"{label} {href}".lower()
    href_path = href.lower()
    if (
        "човек" in haystack
        or re.search(r"(?:^|[/_-])cho(?:[/_.-]|$)", href_path)
        or re.search(r"(?:^|[/_-])chp(?:[/_.-]|$)", href_path)
    ):
        return None
    if "мат" in haystack or "math" in haystack:
        return "math"
    if "българ" in haystack or "bel" in haystack:
        return "bel"
    return None


def parse_published_at(text: str) -> str | None:
    match = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", text)
    if not match:
        return None
    day, month, year = match.groups()
    return f"{year}-{month}-{day}"


def source_id(subject: Subject, kind: Kind, year: int) -> str:
    if kind == "official":
        return f"nvo4_{year}_{subject}"
    return f"mock_nvo4_{subject}_{year}_{kind}"


def collect_sources() -> list[Source]:
    response = requests.get(SOURCE_URL, timeout=60)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    sources: list[Source] = []
    current_year: int | None = None
    current_school_year = ""
    current_section_kind: Kind = "official"

    for node in soup.find_all(["h4", "p", "li"]):
        text = " ".join(node.get_text(" ", strip=True).split())
        if not text:
            continue

        school_match = re.search(r"учебната\s+(\d{4})[-/](\d{4})", text, re.I)
        if school_match:
            start, end = school_match.groups()
            current_year = int(end)
            current_school_year = f"{start}-{end}"
            current_section_kind = "sample" if "примерни" in text.lower() else "official"

        for anchor in node.find_all("a", href=True):
            href = anchor["href"].strip()
            if not href.lower().endswith(".pdf"):
                continue
            label = " ".join(anchor.get_text(" ", strip=True).split()) or text
            subject = detect_subject(f"{text} {label}", href)
            if subject is None:
                continue

            kind: Kind
            lower = f"{text} {label} {href}".lower()
            if "модел" in lower or "model" in lower:
                kind = "model"
            elif "пример" in lower or current_section_kind == "sample":
                kind = "sample"
            else:
                kind = "official"

            year = current_year
            model_year = re.search(r"20\d{2}[-_](20\d{2})", lower)
            if kind == "model" and model_year:
                year = int(model_year.group(1))
            if year is None:
                continue

            sources.append(
                Source(
                    id=source_id(subject, kind, year),
                    year=year,
                    school_year=current_school_year,
                    subject=subject,
                    kind=kind,
                    title=label,
                    source_url=urljoin(SOURCE_URL, href),
                    published_at=parse_published_at(text),
                )
            )

    unique: dict[str, Source] = {}
    for source in sources:
        unique[source.id] = source

    return sorted(unique.values(), key=lambda item: (item.kind != "official", -item.year, item.subject))


def download_pdf(source: Source) -> Path:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    path = PDF_DIR / f"{source.id}.pdf"
    if path.exists() and path.stat().st_size > 0:
        return path
    response = requests.get(source.source_url, timeout=120)
    response.raise_for_status()
    path.write_bytes(response.content)
    return path


def find_key_page(pages: list[str]) -> int:
    for index, text in enumerate(pages):
        if re.search(
            r"(?m)^\s*(?:КЛЮЧ(?:\s+ЗА)?|ОТГОВОРИ И КРИТЕРИИ|КРИТЕРИИ ЗА ОЦЕНКА|Критерии за оценяване)",
            text,
        ):
            return index
    return len(pages)


def normalize_label(label: str) -> str:
    return OPTION_LABEL_MAP.get(label.strip(), label.strip())


def split_question_and_options(block: str) -> tuple[str, dict[str, str] | None]:
    block = re.sub(r"^\s*\d{1,2}\.\s*", "", block).strip()
    matches = list(OPTION_RE.finditer(block))
    if len(matches) < 2:
        return collapse_text(block), None

    question = collapse_text(block[: matches[0].start()])
    options: dict[str, str] = {}
    for index, match in enumerate(matches):
        label = normalize_label(match.group(1))
        start = match.start(2)
        end = matches[index + 1].start() if index + 1 < len(matches) else len(block)
        options[label] = collapse_text(block[start:end])
    return question, options


def parse_question_blocks(page_text: str) -> tuple[str, list[tuple[int, str]]]:
    matches = list(QUESTION_RE.finditer(page_text))
    if not matches:
        return collapse_text(page_text), []

    context = collapse_text(page_text[: matches[0].start()])
    blocks: list[tuple[int, str]] = []
    for index, match in enumerate(matches):
        number = int(match.group(1))
        if number < 1 or number > 30:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(page_text)
        blocks.append((number, page_text[match.start() : end].strip()))
    return context, blocks


def parse_answer_key(key_text: str) -> dict[int, dict[str, object]]:
    lines = clean_lines(key_text)
    answers: dict[int, dict[str, object]] = {}
    index = 0
    while index < len(lines):
        line = lines[index]
        match = re.match(r"^(\d{1,2})(?:\.\s*)?(?:([AАБВГ])\)?)?$", line)
        if not match:
            match = re.match(r"^(\d{1,2})\.\s+([AАБВГ])\)?(?:\s+\d+\s*т?\.?)?$", line)
        if not match:
            index += 1
            continue

        number = int(match.group(1))
        same_line_answer = match.group(2) if len(match.groups()) > 1 else None
        index += 1

        collected: list[str] = []
        if same_line_answer:
            collected.append(same_line_answer)

        while index < len(lines):
            current = lines[index]
            if re.match(r"^\d{1,2}(?:\.|\s*$)", current):
                break
            if re.search(r"^(Максимален|Общо|Брой точки|Задача №)", current, re.I):
                index += 1
                continue
            if not re.fullmatch(r"\d+\s*(?:т\.?|точки?)?", current, re.I):
                collected.append(current)
            index += 1

        answer_text = " ".join(collected).strip()
        correct_option = None
        first = collected[0] if collected else ""
        first_letter = re.match(r"^([AАБВГ])\)?$", first)
        if first_letter:
            correct_option = normalize_label(first_letter.group(1))

        if answer_text:
            if number in answers and not correct_option:
                continue
            answers[number] = {
                "correct_option": correct_option,
                "official_answer": answer_text,
            }
    return answers


def render_page_image(doc: fitz.Document, exam_id: str, page_index: int) -> str:
    PAGE_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{exam_id}_p{page_index + 1}.png"
    path = PAGE_IMAGE_DIR / filename
    if not path.exists():
        pix = doc[page_index].get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pix.save(path)
    return f"/nvo4-page-images/{filename}"


def convert_source(source: Source) -> tuple[dict[str, object], dict[str, object]]:
    pdf_path = download_pdf(source)
    doc = fitz.open(pdf_path)
    pages = [normalize_spaces(page.get_text("text")) for page in doc]
    key_start = find_key_page(pages)
    exam_pages = pages[:key_start]
    key_text = "\n".join(pages[key_start:])
    key = parse_answer_key(key_text)

    questions: list[dict[str, object]] = []
    context_parts: list[str] = []
    flags: list[dict[str, object]] = []
    seen_questions: set[int] = set()

    for page_index, page_text in enumerate(exam_pages):
        context, blocks = parse_question_blocks(page_text)
        if context and not questions:
            context_parts.append(context)

        for number, block in blocks:
            if number in seen_questions:
                flags.append({"question": number, "flag": "duplicate_question_number", "page": page_index + 1})
                continue
            seen_questions.add(number)

            question_text, options = split_question_and_options(block)
            is_visual = bool(VISUAL_PROMPT_RE.search(block))
            item_flags: list[str] = []
            if is_visual:
                item_flags.append("visual_prompt_page_snapshot")
            if len(question_text) < 8:
                item_flags.append("short_extracted_question_text")
            if source.subject == "math" and re.search(r"[□■�]|_{2,}", block):
                item_flags.append("possible_formula_or_blank_loss")

            answer = key.get(number, {})
            question_type = "single_choice" if options else "open_response"
            question: dict[str, object] = {
                "number": number,
                "type": question_type,
                "question": question_text or "TODO: Проверете текста на задачата в оригиналния PDF.",
                "section": "nvo4",
                "source_tags": {
                    "source_id": f"{source.id}_q{number:02d}",
                    "official_year": str(source.year),
                    "source_url": source.source_url,
                },
            }
            if options:
                question["options"] = options
            if answer.get("correct_option"):
                question["correct_option"] = answer["correct_option"]
            if question_type == "single_choice" and not answer.get("correct_option"):
                question["official_answer"] = "TODO: Липсва автоматично разчетен ключ от оригиналния PDF."
                question["answer_guide"] = question["official_answer"]
                item_flags.append("missing_answer_key")
            elif answer.get("official_answer"):
                question["official_answer"] = answer["official_answer"]
                question["answer_guide"] = answer["official_answer"]
            else:
                question["official_answer"] = "TODO: Липсва автоматично разчетен ключ от оригиналния PDF."
                question["answer_guide"] = question["official_answer"]
                item_flags.append("missing_answer_key")
            if is_visual:
                question["question_image"] = render_page_image(doc, source.id, page_index)
            if item_flags:
                question["formatting_flags"] = item_flags
                flags.append({"question": number, "flags": item_flags, "page": page_index + 1})
            questions.append(question)

    expected_numbers = list(range(1, max(seen_questions or {0}) + 1))
    missing_numbers = [number for number in expected_numbers if number not in seen_questions]
    if missing_numbers:
        flags.append({"flag": "missing_question_numbers", "questions": missing_numbers})

    if not questions:
        page_image = render_page_image(doc, source.id, 0) if doc.page_count else ""
        questions.append(
            {
                "number": 1,
                "type": "open_response",
                "question": "TODO: Оригиналният PDF не съдържа машинно разчетим текст. Прегледайте страницата от оригинала.",
                "section": "nvo4",
                "official_answer": "TODO: Липсва автоматично разчетен ключ от оригиналния PDF.",
                "answer_guide": "TODO: Липсва автоматично разчетен ключ от оригиналния PDF.",
                "question_image": page_image,
                "formatting_flags": ["pdf_without_extractable_text"],
                "source_tags": {
                    "source_id": f"{source.id}_q01",
                    "official_year": str(source.year),
                    "source_url": source.source_url,
                },
            }
        )
        flags.append({"question": 1, "flags": ["pdf_without_extractable_text"], "page": 1})

    subject_name = "Математика" if source.subject == "math" else "Български език и литература"
    exam_type = f"nvo4_{source.subject}"
    exam = {
        "id": source.id,
        "year": source.year,
        "subject": subject_name,
        "published_at": source.published_at or "",
        "source_url": source.source_url,
        "source_pdf": pdf_path.name,
        "source_title": source.title,
        "exam_type": exam_type,
        "context_text": "\n\n".join(context_parts).strip(),
        "context_images": [],
        "questions": sorted(questions, key=lambda item: int(item["number"])),
    }
    if source.kind != "official":
        exam["title"] = source.title
        exam["source_text"] = exam.pop("context_text")

    report = {
        "source": asdict(source),
        "pages": doc.page_count,
        "key_start_page": key_start + 1 if key_start < len(pages) else None,
        "question_count": len(questions),
        "flags": flags,
    }
    doc.close()
    return exam, report


def main() -> None:
    sources = collect_sources()
    official: list[dict[str, object]] = []
    mock: list[dict[str, object]] = []
    reports: list[dict[str, object]] = []

    for source in sources:
        exam, report = convert_source(source)
        if source.kind == "official":
            official.append(exam)
        else:
            mock.append(exam)
        reports.append(report)

    official.sort(key=lambda item: (-int(item["year"]), str(item["subject"])))
    mock.sort(key=lambda item: (-int(item["year"]), str(item["id"])))

    OFFICIAL_OUTPUT.write_text(json.dumps(official, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MOCK_OUTPUT.write_text(json.dumps({"exams": mock}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_OUTPUT.write_text(
        json.dumps(
            {
                "source_url": SOURCE_URL,
                "official_count": len(official),
                "mock_count": len(mock),
                "sources": [asdict(source) for source in sources],
                "reports": reports,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(official)} official exams, {len(mock)} model/sample exams")


if __name__ == "__main__":
    main()
