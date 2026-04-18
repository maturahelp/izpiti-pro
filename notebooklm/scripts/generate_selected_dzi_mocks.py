#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import random
from datetime import datetime, timezone
from pathlib import Path

from bel_textbook_canon import DZI_ESSAY_PROMPTS, DZI_LIT_WORKS, validate_no_placeholders, validate_questions


ROOT = Path(__file__).resolve().parents[2]
NOTEBOOKLM_DIR = Path(__file__).resolve().parents[1]
SOURCE_JSON = NOTEBOOKLM_DIR / "generated" / "mock_exams" / "selected_dzi_texts_and_charts.json"
OUT_DIR = NOTEBOOKLM_DIR / "generated" / "selected_dzi_mocks"
OUT_JSON = OUT_DIR / "selected_dzi_mocks.json"
OUT_HTML = OUT_DIR / "index.html"
OUT_MD = OUT_DIR / "selected_dzi_mocks.md"


ORTHO = [
    ("препоръка", ["препорака", "препоръкаа", "препоракаа"]),
    ("сътрудничество", ["сатрудничество", "съотрудничество", "сътрудничествоо"]),
    ("обществен", ["общесвен", "обществвен", "обштествен"]),
    ("въображение", ["ваображение", "въображенйе", "въображениее"]),
]


def choice_map(values):
    return {label: value for label, value in zip(["А", "Б", "В", "Г"], values)}


def shuffled(correct, wrong, rnd):
    values = [correct] + wrong[:3]
    rnd.shuffle(values)
    options = choice_map(values)
    correct_option = next(k for k, v in options.items() if v == correct)
    return options, correct_option


def load_sets():
    return json.loads(SOURCE_JSON.read_text(encoding="utf-8"))["selected_sets"]


def unique_values(values, excluded, limit=3):
    seen = set(excluded)
    result = []
    for value in values:
        if value in seen:
            continue
        result.append(value)
        seen.add(value)
        if len(result) == limit:
            break
    return result


def build_filler_questions(item, rnd, lit_main, lit_alt, max_label, min_label):
    chart = item["chart"]
    max_value = max(chart["values"])
    min_value = min(chart["values"])
    value_gap = max_value - min_value
    unit = chart.get("unit", "")
    title = item["title"]
    chart_title = chart["title"]

    q4_options, q4_correct = shuffled(
        "ежедневие",
        ["празник", "случайност", "предимство"],
        rnd,
    )
    q5_options, q5_correct = shuffled(
        "постоянно",
        ["рядко", "случайно", "безразлично"],
        rnd,
    )
    q6_options, q6_correct = shuffled(
        "временен",
        ["устойчив", "непрекъснат", "постоянен"],
        rnd,
    )
    q7_options, q7_correct = shuffled(
        "Думите отварят врати към паметта.",
        [
            "Учениците отвориха вратата на библиотеката.",
            "Вратата на залата остана затворена.",
            "Новата врата е изработена от дърво.",
        ],
        rnd,
    )
    q15_options, q15_correct = shuffled(
        f"Текстът насочва към осъзнато отношение към темата „{title}“.",
        [
            "Текстът представя само биографични факти за автора.",
            "Текстът има за цел да опише историческа битка.",
            "Текстът отрича нуждата от лично мнение.",
        ],
        rnd,
    )
    q23_options, q23_correct = shuffled(
        f"Най-висока стойност има „{max_label}“, а най-ниска - „{min_label}“.",
        [
            f"Най-висока стойност има „{min_label}“, а най-ниска - „{max_label}“.",
            "Всички показатели в инфографиката са напълно равни.",
            "Инфографиката не съдържа сравними количествени данни.",
        ],
        rnd,
    )

    author_options, author_correct = shuffled(
        lit_main.author,
        unique_values((work.author for work in DZI_LIT_WORKS), {lit_main.author}),
        rnd,
    )
    topic_options, topic_correct = shuffled(
        lit_alt.prompt_topic,
        unique_values((work.prompt_topic for work in DZI_LIT_WORKS), {lit_alt.prompt_topic}),
        rnd,
    )
    theme_work_options, theme_work_correct = shuffled(
        lit_main.title,
        unique_values(
            (work.title for work in DZI_LIT_WORKS if work.theme_label != lit_main.theme_label),
            {lit_main.title},
        ),
        rnd,
    )

    return [
        {
            "number": 4,
            "type": "single_choice",
            "question": "Кой израз е синоним на думата „всекидневие“?",
            "options": q4_options,
            "correct_option": q4_correct,
            "answer_guide": q4_options[q4_correct]
        },
        {
            "number": 5,
            "type": "single_choice",
            "question": "Кое е значението на фразеологичното словосъчетание „ден и нощ“?",
            "options": q5_options,
            "correct_option": q5_correct,
            "answer_guide": q5_options[q5_correct]
        },
        {
            "number": 6,
            "type": "single_choice",
            "question": "Коя дума е антоним на прилагателното „постоянен“?",
            "options": q6_options,
            "correct_option": q6_correct,
            "answer_guide": q6_options[q6_correct]
        },
        {
            "number": 7,
            "type": "single_choice",
            "question": "В кое изречение има метафорична употреба?",
            "options": q7_options,
            "correct_option": q7_correct,
            "answer_guide": q7_options[q7_correct]
        },
        {
            "number": 9,
            "type": "open_response",
            "question": "В листа за отговори запишете САМО думата, с която да замените неправилно употребената дума в изречението: Участникът показа висока компетенция по темата.",
            "answer_guide": "компетентност"
        },
        {
            "number": 10,
            "type": "open_response",
            "question": "В листа за отговори запишете правилната членувана форма на думата в скоби: (Победител) в конкурса благодари на журито.",
            "answer_guide": "Победителят"
        },
        {
            "number": 11,
            "type": "open_response",
            "question": "В листа за отговори запишете правилната форма на местоимението в скоби: Поканиха Мария и (аз) на срещата.",
            "answer_guide": "мен"
        },
        {
            "number": 12,
            "type": "open_response",
            "question": "В листа за отговори запишете правилната бройна форма на думата в скоби: В списъка са включени два (доклад).",
            "answer_guide": "доклада"
        },
        {
            "number": 15,
            "type": "single_choice",
            "question": f"Кое твърдение най-точно предава основната насоченост на текста „{title}“?",
            "options": q15_options,
            "correct_option": q15_correct,
            "answer_guide": q15_options[q15_correct]
        },
        {
            "number": 16,
            "type": "open_response",
            "question": f"Запишете един проблем, който текстът „{title}“ поставя пред съвременния човек.",
            "answer_guide": f"Очаква се проблем, свързан с темата „{title}“ и нейното влияние върху всекидневието, общуването или личния избор."
        },
        {
            "number": 17,
            "type": "open_response",
            "question": f"С едно изречение обяснете как инфографиката „{chart_title}“ допълва текста „{title}“.",
            "answer_guide": f"Инфографиката допълва текста чрез данни, според които „{max_label}“ е водещият показател."
        },
        {
            "number": 22,
            "type": "open_response",
            "question": f"Запишете с цифра разликата между най-високата и най-ниската стойност в инфографиката „{chart_title}“.",
            "answer_guide": f"{value_gap}{unit}"
        },
        {
            "number": 23,
            "type": "single_choice",
            "question": f"Кой извод е най-точен според инфографиката „{chart_title}“?",
            "options": q23_options,
            "correct_option": q23_correct,
            "answer_guide": q23_options[q23_correct]
        },
        {
            "number": 24,
            "type": "open_response",
            "question": f"Формулирайте кратко заглавие за общия проблем, представен от текста „{title}“ и инфографиката.",
            "answer_guide": f"Подходящото заглавие трябва да свързва темата „{title}“ с данните за „{max_label}“."
        },
        {
            "number": 31,
            "type": "single_choice",
            "question": f"Кой автор е създал {lit_main.title}?",
            "options": author_options,
            "correct_option": author_correct,
            "answer_guide": author_options[author_correct]
        },
        {
            "number": 33,
            "type": "single_choice",
            "question": f"Коя тема е свързана с {lit_alt.title}?",
            "options": topic_options,
            "correct_option": topic_correct,
            "answer_guide": topic_options[topic_correct]
        },
        {
            "number": 34,
            "type": "single_choice",
            "question": f"Коя творба принадлежи към тематичния кръг „{lit_main.theme_label}“?",
            "options": theme_work_options,
            "correct_option": theme_work_correct,
            "answer_guide": theme_work_options[theme_work_correct]
        },
        {
            "number": 37,
            "type": "open_response",
            "question": f"Запишете една особеност на художествения свят в {lit_main.title}.",
            "answer_guide": f"Очаква се особеност, съобразена с внушението, че {lit_main.core_claim}."
        },
        {
            "number": 38,
            "type": "open_response",
            "question": f"Запишете едно смислово внушение на темата „{lit_alt.theme_label}“ в {lit_alt.title}.",
            "answer_guide": lit_alt.core_claim
        },
    ]


def build_exam(item, index, rnd):
    max_label = item["chart"]["labels"][item["chart"]["values"].index(max(item["chart"]["values"]))]
    min_label = item["chart"]["labels"][item["chart"]["values"].index(min(item["chart"]["values"]))]
    lit_main = DZI_LIT_WORKS[index % len(DZI_LIT_WORKS)]
    same_theme = [work for work in DZI_LIT_WORKS if work.theme_label == lit_main.theme_label and work != lit_main]
    lit_alt = same_theme[index % len(same_theme)] if same_theme else DZI_LIT_WORKS[(index + 3) % len(DZI_LIT_WORKS)]
    lit_others = [w for w in DZI_LIT_WORKS if w not in (lit_main, lit_alt)]
    rnd.shuffle(lit_others)

    correct, wrong = ORTHO[index % len(ORTHO)]
    q1_opts, q1_correct = shuffled(correct, wrong, rnd)

    questions = [
        {
            "number": 1,
            "type": "single_choice",
            "question": "В кой ред думата е изписана правилно?",
            "options": q1_opts,
            "correct_option": q1_correct,
            "answer_guide": q1_opts[q1_correct]
        },
        {
            "number": 2,
            "type": "single_choice",
            "question": "В кое изречение НЕ е допусната граматична грешка?",
            "options": {
                "А": "Училището организираха поредица от срещи с писатели.",
                "Б": "Редакторът публикува текста след кратка редакция.",
                "В": "Момичето и брат му отиде по-рано.",
                "Г": "На сцената бяха представените участниците."
            },
            "correct_option": "Б",
            "answer_guide": "Редакторът публикува текста след кратка редакция."
        },
        {
            "number": 3,
            "type": "single_choice",
            "question": "В кое изречение е допусната пунктуационна грешка?",
            "options": {
                "А": "Когато човек чете бавно, той по-лесно открива смисловите връзки.",
                "Б": "Ако желаете, можем да обсъдим темата след часа.",
                "В": "Учениците които участваха в дискусията, бяха убедителни.",
                "Г": "Според автора, макар темата да е трудна, тя е важна."
            },
            "correct_option": "В",
            "answer_guide": "Учениците които участваха в дискусията, бяха убедителни."
        },
        {
            "number": 8,
            "type": "open_response",
            "question": "В листа за отговори запишете правилната за изречението форма на думата, поставена в скоби. Човекът открива вътрешна (опора) в тихите мигове на размисъл.",
            "answer_guide": "опора"
        },
        {
            "number": 13,
            "type": "open_response",
            "question": "В текста са пропуснати САМО ПЕТ препинателни знака. Препишете текста, като ги поставите правилно. Когато остане насаме със себе си човек по-лесно различава кое е важно и кое само шуми около него",
            "answer_guide": "Когато остане насаме със себе си, човек по-лесно различава кое е важно и кое само шуми около него."
        },
        {
            "number": 14,
            "type": "single_choice",
            "question": f"Кое твърдение е вярно според текста „{item['title']}“?",
            "options": {
                "А": "Авторът разглежда проблема само чрез лична биография.",
                "Б": "Текстът защитава тезата, че вътрешната мярка и осмислянето на преживяното имат ценност.",
                "В": "Основната цел е да се представят исторически факти.",
                "Г": "Текстът изцяло отрича съвременния живот."
            },
            "correct_option": "Б",
            "answer_guide": "Текстът защитава тезата, че вътрешната мярка и осмислянето на преживяното имат ценност."
        },
        {
            "number": 18,
            "type": "open_response",
            "question": "Запишете кой елемент от инфографиката е с най-висока стойност.",
            "answer_guide": max_label
        },
        {
            "number": 19,
            "type": "open_response",
            "question": "Запишете кой елемент от инфографиката е с най-ниска стойност.",
            "answer_guide": min_label
        },
        {
            "number": 20,
            "type": "open_response",
            "question": "Като използвате текста и инфографиката, запишете ДВА извода по темата.",
            "answer_guide": "Очакват се два кратки извода, свързани със смисъла на текста и водещите стойности в инфографиката."
        },
        {
            "number": 21,
            "type": "open_response",
            "question": f"В текст до 5 изречения тълкувайте основната идея на текста „{item['title']}“, като се опрете и на данните от инфографиката.",
            "answer_guide": "Очаква се кратък свързан текст с теза и позоваване на данните."
        }
    ]

    for slot, work in zip([25, 26, 27, 28, 29, 30], [lit_main, lit_alt, lit_others[0], lit_others[1], lit_others[2], lit_others[3]]):
        others = [w for w in DZI_LIT_WORKS if w != work]
        rnd.shuffle(others)
        options, correct_option = shuffled(work.title, [x.title for x in others[:3]], rnd)
        questions.append({
            "number": slot,
            "type": "single_choice",
            "question": f"В коя творба е интерпретирана темата за {work.prompt_topic}?",
            "options": options,
            "correct_option": correct_option,
            "answer_guide": options[correct_option]
        })

    questions.extend([
        {
            "number": 32,
            "type": "single_choice",
            "question": f"Кое твърдение съответства на смисловите внушения на {lit_main.title}?",
            "options": {
                "А": lit_main.core_claim,
                "Б": lit_alt.core_claim,
                "В": lit_others[0].core_claim,
                "Г": lit_others[1].core_claim
            },
            "correct_option": "А",
            "answer_guide": lit_main.core_claim
        },
        {
            "number": 35,
            "type": "open_response",
            "question": f"Съпоставете интерпретациите на темата „{lit_main.theme_label}“ в {lit_main.title} и {lit_alt.title} и запишете ЕДНА разлика между тях.",
            "answer_guide": "Очаква се кратко формулирана смислова разлика."
        },
        {
            "number": 36,
            "type": "open_response",
            "question": f"Обяснете накратко ролята на заглавието на {lit_main.title} за смисъла на творбата.",
            "answer_guide": "Очаква се кратко тълкуване на заглавието."
        },
        {
            "number": 39,
            "type": "open_response",
            "question": "Свържете заглавието на всяка творба с нейния автор.",
            "pairs": {
                lit_main.title: lit_main.author,
                lit_alt.title: lit_alt.author,
                lit_others[0].title: lit_others[0].author,
                lit_others[1].title: lit_others[1].author
            },
            "answer_guide": "Очаква се правилно съотнасяне на заглавията към авторите."
        },
        {
            "number": 40,
            "type": "open_response",
            "question": f"В текст до 5 изречения съпоставете интерпретацията на общата тема „{lit_main.theme_label}“ в {lit_main.title} и {lit_alt.title}.",
            "answer_guide": "Очаква се кратък съпоставителен текст."
        },
        {
            "number": 41,
            "type": "open_response",
            "question": f"Напишете аргументативен текст в обем до 4 страници по ЕДНА от следните две теми: Тема за есе: {DZI_ESSAY_PROMPTS[index % len(DZI_ESSAY_PROMPTS)][0]}. Тема за интерпретативно съчинение: {DZI_ESSAY_PROMPTS[index % len(DZI_ESSAY_PROMPTS)][1]}.",
            "answer_guide": "Очаква се цялостен аргументативен текст с теза, аргументи и композиционна завършеност."
        }
    ])

    used = {q["number"] for q in questions}
    for filler in build_filler_questions(item, rnd, lit_main, lit_alt, max_label, min_label):
        if filler["number"] not in used:
            questions.append(filler)

    questions.sort(key=lambda x: x["number"])

    return {
        "id": f"selected_mock_dzi_{index + 1:02d}",
        "exam_type": "dzi_bel",
        "title": f"Примерен ДЗИ БЕЛ #{index + 1}",
        "source_title": item["title"],
        "source_text": item["text"],
        "diagram_summary": item["chart"],
        "questions": questions
    }


def build_payload():
    rnd = random.Random(20260402)
    sets = load_sets()
    exams = [build_exam(item, idx, rnd) for idx, item in enumerate(sets)]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": str(SOURCE_JSON),
        "exam_count": len(exams),
        "exams": exams
    }


def validate_payload(payload):
    errors = []
    for exam in payload["exams"]:
        mismatches = validate_questions(exam["questions"], "dzi")
        if mismatches:
            errors.append((exam["title"], mismatches))
        placeholders = validate_no_placeholders(exam["questions"])
        if placeholders:
            errors.append((exam["title"], placeholders))
    if errors:
        lines = ["Generated selected DZI mocks contain textbook-invalid or placeholder content:"]
        for title, mismatches in errors:
            details = ", ".join(f"Q{number}: {', '.join(titles)}" for number, titles in mismatches)
            lines.append(f"- {title}: {details}")
        raise ValueError("\n".join(lines))


def write_markdown(payload):
    lines = ["# Selected DZI Mocks", ""]
    for exam in payload["exams"]:
        lines.append(f"## {exam['title']}")
        lines.append("")
        lines.append(f"- Source title: {exam['source_title']}")
        lines.append(f"- Chart: {json.dumps(exam['diagram_summary'], ensure_ascii=False)}")
        lines.append("")
        for q in exam["questions"]:
            lines.append(f"### {q['number']}. {q['question']}")
            if "options" in q:
                for k, v in q["options"].items():
                    lines.append(f"- {k}: {v}")
            lines.append(f"- Насока: {q['answer_guide']}")
            lines.append("")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")


def write_html(payload):
    html = """<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selected DZI Mocks</title>
  <style>
    :root{--bg:#f6f2ea;--ink:#221d18;--muted:#6e655b;--panel:#fffdf8;--line:#ddd1c3;--accent:#255f67}
    *{box-sizing:border-box} body{margin:0;font-family:Georgia,serif;background:linear-gradient(180deg,#faf8f3,var(--bg));color:var(--ink)}
    .wrap{width:min(1220px,calc(100vw - 28px));margin:0 auto;padding:28px 0 44px}
    .hero,.card{background:var(--panel);border:1px solid var(--line);border-radius:24px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
    .hero{padding:24px;margin-bottom:16px} h1{margin:0 0 8px;font-size:clamp(2rem,4vw,3rem)}
    .sub{color:var(--muted);line-height:1.6}
    .tools{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:16px}
    select{padding:13px 14px;border-radius:16px;border:1px solid var(--line);background:#fff;font:inherit}
    .card{padding:22px}
    .chiprow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .chip{padding:6px 10px;border-radius:999px;background:#eef4f5;color:#1f5057;font-size:.88rem}
    .context{padding:16px;border-radius:16px;background:#f8fbfb;border-left:4px solid #abd0d4;line-height:1.7;margin-bottom:16px}
    .infographic{margin-bottom:16px;padding:16px;border-radius:16px;background:#fbf7ef;border:1px solid #eadfce}
    .barrow{display:grid;grid-template-columns:220px 1fr 56px;gap:10px;align-items:center;margin:8px 0}
    .bar{height:14px;border-radius:999px;background:#e7ddd2;overflow:hidden}
    .fill{height:100%;background:linear-gradient(90deg,#255f67,#4d8d95)}
    .q{padding:12px 0;border-top:1px solid #eee4d8}
    .q:first-of-type{border-top:none}
    .opts{display:grid;gap:6px;margin-top:8px}
    .opt{padding:9px 11px;border:1px solid #ece2d8;border-radius:12px;background:#fff}
    .ans{margin-top:8px;padding:10px 12px;border-radius:12px;background:#eff8f2;border:1px solid #cbe5d2;color:#225c36}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>Selected Mock DZI Exams</h1>
      <p class="sub">Full mock DZI papers generated from the 10 selected text and chart pairs.</p>
    </section>
    <section class="tools">
      <select id="exam"></select>
    </section>
    <section id="root"></section>
  </main>
  <script>
    const examEl=document.getElementById('exam'); const root=document.getElementById('root'); let payload;
    function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
    function fmt(s){return esc(s).replaceAll('\\n\\n','<br><br>').replaceAll('\\n','<br>')}
    function render(){
      const exam=payload.exams[Number(examEl.value||0)];
      const chart=exam.diagram_summary;
      root.innerHTML=`<article class="card">
        <div class="chiprow">
          <span class="chip">${esc(exam.id)}</span>
          <span class="chip">${esc(exam.source_title)}</span>
          <span class="chip">${exam.questions.length} въпроса</span>
        </div>
        <div class="context"><strong>Текст</strong><br>${fmt(exam.source_text)}</div>
        <div class="infographic"><strong>${esc(chart.title)}</strong>${chart.labels.map((label,i)=>`<div class="barrow"><div>${esc(label)}</div><div class="bar"><div class="fill" style="width:${chart.values[i]}%"></div></div><div>${chart.values[i]}${esc(chart.unit)}</div></div>`).join('')}</div>
        ${exam.questions.map(q=>`<div class="q"><div><strong>${q.number}.</strong> ${esc(q.question)}</div>${q.options?`<div class="opts">${Object.entries(q.options).map(([k,v])=>`<div class="opt"><strong>${k}.</strong> ${esc(v)}</div>`).join('')}</div>`:''}${q.pairs?`<div class="opts">${Object.entries(q.pairs).map(([k,v])=>`<div class="opt"><strong>${esc(k)}</strong> -> ${esc(v)}</div>`).join('')}</div>`:''}<div class="ans"><strong>Насока:</strong> ${esc(q.answer_guide)}</div></div>`).join('')}
      </article>`;
    }
    fetch('./selected_dzi_mocks.json').then(r=>r.json()).then(data=>{
      payload=data;
      examEl.innerHTML=payload.exams.map((exam,i)=>`<option value="${i}">${esc(exam.title)} - ${esc(exam.source_title)}</option>`).join('');
      render();
      examEl.addEventListener('change', render);
    });
  </script>
</body>
</html>"""
    OUT_HTML.write_text(html, encoding="utf-8")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = build_payload()
    validate_payload(payload)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(payload)
    write_html(payload)
    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {OUT_HTML}")


if __name__ == "__main__":
    main()
