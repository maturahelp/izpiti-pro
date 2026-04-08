#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Export math DZI quizzes to izpiti-pro/public/math-dzi/
Creates:
  - One HTML per category (25 questions each)
  - An index hub page linking all categories
"""

from __future__ import annotations
import json, shutil
from pathlib import Path
from dataclasses import asdict

# Import the question bank
import sys
sys.path.insert(0, str(Path(__file__).parent))
from generate_math_question_bank import QUESTIONS

ROOT       = Path(__file__).resolve().parents[3]
IZPITI_PRO = ROOT / "nvo_pdfs" / "izpiti-pro"
OUT_DIR    = IZPITI_PRO / "public" / "math-dzi"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Category slug map
SLUG = {
    "Рационални и ирационални числа":    "chisla",
    "Квадратни уравнения и неравенства":  "kvadratni",
    "Функции":                            "funkcii",
    "Прогресии":                          "progresii",
    "Тригонометрия":                      "trigonometria",
    "Планиметрия":                        "planimetria",
    "Стереометрия":                       "stereometria",
    "Комбинаторика":                      "kombinatorika",
    "Статистика":                         "statistika",
    "Вероятност":                         "verojatnost",
}

EMOJI = {
    "Рационални и ирационални числа":    "√",
    "Квадратни уравнения и неравенства":  "x²",
    "Функции":                            "f(x)",
    "Прогресии":                          "∑",
    "Тригонометрия":                      "sin",
    "Планиметрия":                        "△",
    "Стереометрия":                       "⬡",
    "Комбинаторика":                      "n!",
    "Статистика":                         "📊",
    "Вероятност":                         "P",
}

QUIZ_HTML = """\
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ДЗИ Математика — {title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  window.MathJax = {{
    tex: {{ inlineMath: [['\\\\(','\\\\)'],['$','$']], displayMath: [['\\\\[','\\\\]'],['$$','$$']] }},
    startup: {{ typeset: false }}
  }};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
<style>
  body{{font-family:'Segoe UI',system-ui,sans-serif}}
  .opt{{transition:background .12s,border-color .12s}}
  .opt:hover{{background:#dbeafe;border-color:#3b82f6}}
  .correct{{background:#dcfce7!important;border-color:#16a34a!important}}
  .wrong{{background:#fee2e2!important;border-color:#dc2626!important}}
  .done{{pointer-events:none}}
</style>
</head>
<body class="bg-gray-50 min-h-screen">
<div class="max-w-2xl mx-auto px-4 py-8">

  <div class="mb-6 flex items-center gap-3">
    <a href="index.html" class="text-sm text-blue-600 hover:underline">← Всички категории</a>
  </div>

  <h1 class="text-2xl font-bold mb-1">ДЗИ Математика</h1>
  <p class="text-blue-700 font-semibold text-lg mb-1">{title}</p>
  <p class="text-gray-400 text-sm mb-6">25 въпроса · Общообразователна подготовка · 12. клас</p>

  <div class="sticky top-0 z-20 bg-white shadow rounded-xl p-3 mb-6 flex gap-6 justify-center text-sm font-medium">
    <span class="text-green-600">✓ <span id="sc-ok">0</span></span>
    <span class="text-red-500">✗ <span id="sc-err">0</span></span>
    <span class="text-gray-500">Отговорени: <span id="sc-done">0</span>/25</span>
  </div>

  <div id="questions"></div>
</div>

<script>
const QS = {questions};
let ok=0,err=0,done=0;
const cont=document.getElementById('questions');

QS.forEach((q,i)=>{{
  const card=document.createElement('div');
  card.className='bg-white rounded-2xl shadow p-6 mb-5';
  card.innerHTML=`
    <div class="flex justify-between mb-3">
      <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">${{q.subtopic}}</span>
      <span class="text-xs text-gray-400">#${{i+1}} · ${{q.difficulty}}</span>
    </div>
    <p class="font-medium mb-4 leading-relaxed">${{q.question_html}}</p>
    <div class="space-y-2" id="o${{i}}"></div>
    <div id="e${{i}}" class="hidden mt-4 p-3 bg-amber-50 rounded-xl text-sm border border-amber-200">
      <strong>Обяснение:</strong> ${{q.explanation}}
    </div>`;
  cont.appendChild(card);

  const od=document.getElementById('o'+i);
  Object.entries(q.options).forEach(([l,t])=>{{
    const b=document.createElement('button');
    b.className='opt w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm flex gap-3 items-start';
    b.innerHTML=`<span class="font-bold text-gray-500 min-w-[1.4rem]">${{l}}</span><span>${{t}}</span>`;
    b.onclick=()=>{{
      if(od.classList.contains('done'))return;
      od.classList.add('done');
      done++;
      if(l===q.correct){{b.classList.add('correct');ok++;document.getElementById('sc-ok').textContent=ok;}}
      else{{
        b.classList.add('wrong');err++;document.getElementById('sc-err').textContent=err;
        [...od.querySelectorAll('button')].forEach(x=>{{
          if(x.querySelector('span').textContent===q.correct)x.classList.add('correct');
        }});
      }}
      document.getElementById('sc-done').textContent=done;
      const exp=document.getElementById('e'+i);
      exp.classList.remove('hidden');
      if(window.MathJax)MathJax.typesetPromise([exp]);
    }};
    od.appendChild(b);
  }});
}});

if(window.MathJax)MathJax.startup.promise.then(()=>MathJax.typesetPromise([cont]));
</script>
</body>
</html>
"""

HUB_HTML = """\
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ДЗИ Математика — Тестове по категории</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
<div class="max-w-2xl mx-auto px-4 py-12">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold mb-2">ДЗИ Математика</h1>
    <p class="text-gray-500">Общообразователна подготовка · 12. клас · 250 въпроса</p>
  </div>

  <div class="grid gap-4">
    {cards}
  </div>

  <p class="text-center text-xs text-gray-400 mt-10">25 въпроса на категория · Кликни за да започнеш</p>
</div>
</body>
</html>
"""

CARD_TMPL = """\
    <a href="{slug}.html" class="block bg-white rounded-2xl shadow hover:shadow-md transition p-5 flex items-center gap-4 group">
      <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600 group-hover:bg-blue-100 transition">{emoji}</div>
      <div>
        <p class="font-semibold text-gray-800">{title}</p>
        <p class="text-sm text-gray-400">25 въпроса · mixed difficulty</p>
      </div>
      <span class="ml-auto text-gray-300 group-hover:text-blue-400 text-xl">→</span>
    </a>"""


def main():
    from collections import defaultdict
    by_cat = defaultdict(list)
    for q in QUESTIONS:
        by_cat[q.subtopic].append(asdict(q))

    cards_html = []

    for cat, qs in by_cat.items():
        slug = SLUG[cat]
        emoji = EMOJI[cat]
        html = QUIZ_HTML.format(
            title=cat,
            questions=json.dumps(qs, ensure_ascii=False)
        )
        path = OUT_DIR / f"{slug}.html"
        path.write_text(html, encoding="utf-8")
        print(f"  ✅ {path.name}  ({len(qs)} въпроса)")

        cards_html.append(CARD_TMPL.format(slug=slug, emoji=emoji, title=cat))

    hub = HUB_HTML.format(cards="\n".join(cards_html))
    (OUT_DIR / "index.html").write_text(hub, encoding="utf-8")
    print(f"  ✅ index.html  (hub)")
    print(f"\n📁 Всичко в: {OUT_DIR}")


if __name__ == "__main__":
    main()
