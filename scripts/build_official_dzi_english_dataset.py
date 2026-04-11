#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import fitz
import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = ROOT / "data" / "official_dzi_english_dataset.json"
TMP_DIR = ROOT / "tmp" / "english_dzi"

CATEGORY_URL = "https://zamatura.eu/maturi-12klas/predmeti/angliiski/maturi/"
ARTICLE_PATH_PREFIX = "/maturi-12klas/predmeti/angliiski/maturi/"

LATIN_OPTION_MAP = str.maketrans(
    {
        "А": "A",
        "В": "B",
        "С": "C",
        "Е": "E",
        "Н": "H",
        "К": "K",
        "М": "M",
        "О": "O",
        "Р": "P",
        "Т": "T",
        "Х": "X",
        "а": "a",
        "с": "c",
        "е": "e",
        "о": "o",
        "р": "p",
        "х": "x",
    }
)

QUESTION_BLOCK_RE = re.compile(r"(?m)^\s*(\d{1,2})\.\s+")
OPTION_RE = re.compile(r"(?m)^\s*([A-DА-Г])\)\s*(.+)$")


@dataclass
class ExamSource:
    title: str
    article_url: str
    pdf_url: str
    year: int
    session_label: str
    level: str | None
    is_makeup: bool
    is_sample: bool

    @property
    def id(self) -> str:
        session_slug = (
            self.session_label.lower()
            .replace("май-юни", "may")
            .replace("август", "aug")
            .replace("юни", "june")
            .replace("септември", "sep")
            .replace("май", "may")
        )
        parts = ["dzi_english", str(self.year), session_slug]
        if self.level:
            parts.append(self.level.lower().replace(".", "_"))
        if self.is_sample:
            parts.append("sample")
        return "_".join(parts)


def normalize_spaces(text: str) -> str:
    return (
        text.replace("\u00a0", " ")
        .replace("\r", "")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
    )


def normalize_option_letter(value: str) -> str:
    return value.translate(LATIN_OPTION_MAP).upper()


def slugify_date(date_text: str) -> tuple[int, str, str]:
    dt = datetime.strptime(date_text, "%d.%m.%Y")
    month_map = {
        5: "май",
        6: "юни",
        8: "август",
        9: "септември",
    }
    return dt.year, dt.date().isoformat(), month_map.get(dt.month, dt.strftime("%m"))


def fetch_html(url: str) -> str:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.text


def collect_exam_sources() -> list[ExamSource]:
    html = fetch_html(CATEGORY_URL)
    soup = BeautifulSoup(html, "html.parser")
    seen: set[str] = set()
    sources: list[ExamSource] = []

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].strip()
        title = " ".join(anchor.get_text(" ", strip=True).split())
        if ARTICLE_PATH_PREFIX not in href or href.rstrip("/") == CATEGORY_URL.rstrip("/"):
            continue
        if href in seen or not title.startswith("Матура по Английски език"):
            continue
        seen.add(href)

        year_match = re.search(r"(\d{2}\.\d{2}\.\d{4}|\b2007\b)", title)
        if not year_match:
            continue

        if year_match.group(1) == "2007":
            year = 2007
            iso_date = "2007-01-01"
            session_label = "примерна" if "примерна" in title.lower() else "пробна"
            is_sample = True
        else:
            year, iso_date, month_name = slugify_date(year_match.group(1))
            session_label = "август" if "поправителна" in title.lower() else month_name
            is_sample = "примерна" in title.lower() or "пробна" in title.lower()

        level_match = re.search(r"\b(B1(?:\.1)?|B2)\b", title, re.I)
        level = level_match.group(1).upper() if level_match else None

        if year >= 2022:
            if level != "B2":
                continue
        elif level is not None:
            continue

        article_html = fetch_html(href)
        article_soup = BeautifulSoup(article_html, "html.parser")
        pdf_url = None
        for pdf_anchor in article_soup.find_all("a", href=True):
            candidate = pdf_anchor["href"].strip()
            if candidate.lower().endswith(".pdf"):
                pdf_url = candidate
                break
        if not pdf_url:
            continue

        sources.append(
            ExamSource(
                title=title,
                article_url=href,
                pdf_url=pdf_url,
                year=year,
                session_label=session_label,
                level=level,
                is_makeup="поправителна" in title.lower(),
                is_sample=is_sample,
            )
        )

    def sort_key(source: ExamSource) -> tuple[int, int, str]:
        order = {"may": 0, "май": 0, "june": 1, "юни": 1, "aug": 2, "август": 2, "sep": 3, "септември": 3}
        return source.year, order.get(source.session_label, 9), source.title

    return sorted(sources, key=sort_key, reverse=True)


def download_pdf(source: ExamSource) -> Path:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    pdf_name = f"{source.id}.pdf"
    pdf_path = TMP_DIR / pdf_name
    if pdf_path.exists():
        return pdf_path
    response = requests.get(source.pdf_url, timeout=120)
    response.raise_for_status()
    pdf_path.write_bytes(response.content)
    return pdf_path


def extract_pages(pdf_path: Path) -> list[str]:
    doc = fitz.open(pdf_path)
    return [normalize_spaces(page.get_text("text")) for page in doc]


def find_key_page_index(pages: list[str]) -> int:
    for index, text in enumerate(pages):
        if "Ключ с верните отговори" in text:
            return index
    half = len(pages) // 2
    for index in range(half, len(pages)):
        text = pages[index]
        if "Верен отговор" in text or "Възможни отговори:" in text or "ВЪЗМОЖНИ ВАРИАНТИ" in text:
            return index
    return len(pages)


def strip_page_numbers(text: str) -> str:
    lines = [line.rstrip() for line in text.splitlines()]
    kept: list[str] = []
    for line in lines:
        if re.fullmatch(r"\s*\d+\s*", line):
            continue
        kept.append(line)
    return "\n".join(kept)


def collapse_context(text: str) -> str:
    text = strip_page_numbers(text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def find_question_starts(text: str, max_question: int) -> dict[int, int]:
    starts: dict[int, int] = {}
    for match in QUESTION_BLOCK_RE.finditer(text):
        number = int(match.group(1))
        if 1 <= number <= max_question and number not in starts:
            starts[number] = match.start()
    return starts


def trim_after_markers(text: str) -> str:
    marker_patterns = [
        r"(?m)^\s*Directions:\s*",
        r"(?m)^\s*Task(?:\s+[A-Za-z0-9]+)?\s*$",
        r"(?m)^\s*PART\s+[A-ZА-Я]+:",
        r"(?m)^\s*PART\s+FOUR:\s+WRITING",
        r"(?m)^\s*WRITING\s*$",
        r"(?m)^\s*Section\s+[A-Za-z]+:",
        r"(?m)^\s*Внимание:",
        r"(?m)^\s*Писмен текст",
        r"(?m)^\s*Критерии за оценяване",
        r"(?m)^\s*МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО",
        r"(?m)^\s*МОДУЛ\s+\d+",
    ]
    end_positions = [re.search(pattern, text).start() for pattern in marker_patterns if re.search(pattern, text)]
    if end_positions:
        text = text[: min(end_positions)]
    return text.strip()


def split_question_and_options(block: str) -> tuple[str, dict[str, str] | None]:
    option_matches = list(OPTION_RE.finditer(block))
    if not option_matches:
        return trim_after_markers(block), None

    question_text = block[: option_matches[0].start()].strip()
    options: dict[str, str] = {}
    for idx, match in enumerate(option_matches):
        label = normalize_option_letter(match.group(1))
        start = match.start(2)
        end = option_matches[idx + 1].start() if idx + 1 < len(option_matches) else len(block)
        value = trim_after_markers(block[start:end])
        value = re.sub(r"\s*\n\s*", " ", value).strip()
        options[label] = value

    question_text = re.sub(r"\s*\n\s*", " ", question_text).strip()
    return question_text, options


def extract_mc_answers(key_text: str) -> dict[int, str]:
    answers: dict[int, str] = {}
    for number_str, answer in re.findall(r"(\d{1,2})\.\s*([A-DА-Г])\b", key_text):
        number = int(number_str)
        if number not in answers:
            answers[number] = normalize_option_letter(answer)
    return answers


def extract_open_answer_block(key_text: str, number: int, question_text: str) -> str:
    start_match = re.search(rf"(?m)^\s*{number}\.\s+", key_text)
    if not start_match:
        return ""
    next_match = re.search(rf"(?m)^\s*{number + 1}\.\s+", key_text[start_match.end():])
    end = start_match.end() + next_match.start() if next_match else len(key_text)
    answer = key_text[start_match.end():end].strip()
    answer = re.split(r"(?im)^\s*Критерии за оценяване|^\s*При предадени|^\s*Mind that", answer)[0].strip()
    lines = [line.strip() for line in answer.splitlines() if line.strip()]
    cleaned_lines: list[str] = []
    normalized_question = re.sub(r"\s+", " ", question_text).strip().lower()
    for line in lines:
        normalized_line = re.sub(r"\s+", " ", line).strip().lower()
        if normalized_line == normalized_question:
            continue
        if normalized_question:
            prefix_len = min(40, len(normalized_line), len(normalized_question))
            if prefix_len >= 12 and (
                normalized_question.startswith(normalized_line[:prefix_len])
                or normalized_line.startswith(normalized_question[:prefix_len])
            ):
                continue
        if line.endswith("?") and not cleaned_lines:
            continue
        if "____" in line:
            continue
        if line.startswith("(use a ") or line.startswith("(use an "):
            continue
        cleaned_lines.append(line)
    answer = "\n".join(cleaned_lines).strip()
    answer = re.sub(r"\s+\(=\s*[\d.,]+\s*p\.\)", "", answer)
    answer = re.sub(r"\(\s*[\d.,]+\s*[тp]\.?\)", "", answer, flags=re.I)
    answer = re.sub(r"\s{2,}", " ", answer)
    return answer.strip()


def extract_writing_tasks(exam_text: str, start_number: int) -> list[dict]:
    writing_match = re.search(r"(?is)\bPART FOUR: WRITING\b|\bWRITING\b", exam_text)
    if not writing_match:
        return []

    writing_text = exam_text[writing_match.start():].strip()
    criteria_match = re.search(r"(?is)Критерии за оценяване.*$", writing_text)
    criteria_text = criteria_match.group(0).strip() if criteria_match else ""

    prompts = list(re.finditer(r"(?m)^\s*(1|2)\.\s+", writing_text))
    if not prompts:
        return []

    tasks: list[dict] = []
    for idx, match in enumerate(prompts):
        prompt_number = start_number + idx
        start = match.end()
        end = prompts[idx + 1].start() if idx + 1 < len(prompts) else len(writing_text)
        prompt = writing_text[start:end].strip()
        prompt = re.split(r"(?im)^\s*Mind that|^\s*При непристоен|^\s*При предадени", prompt)[0].strip()
        prompt = re.sub(r"\n{3,}", "\n\n", prompt)
        tasks.append(
            {
                "number": prompt_number,
                "type": "open_response",
                "section": "writing",
                "question": prompt,
                "answer_guide": criteria_text or "Свободен писмен отговор.",
            }
        )
    return tasks


def infer_section(number: int, max_question: int, level: str | None) -> str:
    if level == "B2":
        if number <= 20:
            return "listening"
        if number <= 36:
            return "reading"
        if number <= 43:
            return "open_reading"
        return "writing"

    if number <= 15:
        return "listening"
    if number <= 30:
        return "reading"
    if number <= 50:
        return "use_of_english"
    if number <= max_question:
        return "sentence_transformations"
    return "writing"


def parse_exam(source: ExamSource, pdf_path: Path) -> dict:
    pages = extract_pages(pdf_path)
    key_page_index = find_key_page_index(pages)
    exam_pages = pages[:key_page_index]
    key_pages = pages[key_page_index:]

    exam_text = collapse_context("\n\n".join(exam_pages))
    key_text = collapse_context("\n\n".join(key_pages))

    mc_answers = extract_mc_answers(key_text)
    max_question = 45 if source.level == "B2" else 60
    starts = find_question_starts(exam_text, max_question)

    questions: list[dict] = []
    ordered_numbers = [number for number in range(1, max_question + 1) if number in starts]
    for idx, number in enumerate(ordered_numbers):
        start = starts[number]
        end = starts[ordered_numbers[idx + 1]] if idx + 1 < len(ordered_numbers) else len(exam_text)
        block = exam_text[start:end]
        block = re.sub(rf"(?m)^\s*{number}\.\s+", "", block, count=1).strip()
        question_text, options = split_question_and_options(block)
        if not question_text and options:
            question_text = f"Избери верния отговор за въпрос {number}."

        question = {
            "number": number,
            "type": "single_choice" if options else "open_response",
            "section": infer_section(number, max_question, source.level),
            "question": question_text,
        }
        if options:
            question["options"] = options
            if number in mc_answers:
                question["correct_option"] = mc_answers[number]
                question["official_answer"] = mc_answers[number]
        else:
            guide = extract_open_answer_block(key_text, number, question_text)
            if guide:
                question["answer_guide"] = guide
                question["official_answer"] = guide
        questions.append(question)

    if source.level != "B2":
        writing_tasks = extract_writing_tasks(exam_text, max_question + 1)
        questions.extend(writing_tasks)

    context_text = exam_text
    if source.level == "B2":
        transcript_chunks: list[str] = []
        for page_text in key_pages:
            if "Task Five" in page_text or "RD:" in page_text or "LW:" in page_text or "There’s a superstition" in page_text:
                transcript_chunks.append(strip_page_numbers(page_text))
        if transcript_chunks:
            context_text = f"{context_text}\n\nLISTENING TRANSCRIPTS\n\n" + "\n\n".join(transcript_chunks)

    return {
        "id": source.id,
        "year": source.year,
        "subject": "Английски език",
        "published_at": source.article_url,
        "source_title": source.title,
        "source_url": source.pdf_url,
        "source_page_url": source.article_url,
        "source_pdf": str(pdf_path.relative_to(ROOT)),
        "level": source.level,
        "session": source.session_label,
        "context_text": context_text,
        "questions": questions,
    }


def build_dataset() -> dict:
    exams = []
    for source in collect_exam_sources():
        pdf_path = download_pdf(source)
        exams.append(parse_exam(source, pdf_path))

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_catalog_url": CATEGORY_URL,
        "counts": {
            "exams": len(exams),
            "questions": sum(len(exam["questions"]) for exam in exams),
        },
        "exams": exams,
    }


def main() -> None:
    dataset = build_dataset()
    OUTPUT_PATH.write_text(json.dumps(dataset, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Exams: {dataset['counts']['exams']}")
    print(f"Questions: {dataset['counts']['questions']}")


if __name__ == "__main__":
    main()
