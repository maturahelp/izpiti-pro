#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


NOTEBOOKLM_DIR = Path(__file__).resolve().parents[1]
GENERATED_DIR = NOTEBOOKLM_DIR / "generated"
NVO_SOURCE = GENERATED_DIR / "mock_exams" / "mock_nvo_dzi_exams.json"
DZI_SOURCE = GENERATED_DIR / "selected_dzi_mocks" / "selected_dzi_mocks.json"
OUT_DIR = GENERATED_DIR / "exam_practice"
OUT_JSON = OUT_DIR / "combined_exam_practice.json"
OUT_HTML = OUT_DIR / "index.html"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_nvo(exam: dict) -> dict:
    return {
        "id": exam["id"],
        "exam_type": "nvo_bel",
        "title": exam["title"],
        "source_title": exam.get("context_title", ""),
        "source_text": exam.get("context_text", ""),
        "chart": exam.get("infographic"),
        "questions": exam["questions"],
    }


def normalize_dzi(exam: dict) -> dict:
    return {
        "id": exam["id"],
        "exam_type": "dzi_bel",
        "title": exam["title"],
        "source_title": exam.get("source_title", ""),
        "source_text": exam.get("source_text", ""),
        "chart": exam.get("diagram_summary"),
        "questions": exam["questions"],
    }


def build_payload() -> dict:
    nvo_data = load_json(NVO_SOURCE)
    dzi_data = load_json(DZI_SOURCE)
    exams = [normalize_nvo(exam) for exam in nvo_data["nvo_exams"]] + [normalize_dzi(exam) for exam in dzi_data["exams"]]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "nvo_bel": sum(1 for e in exams if e["exam_type"] == "nvo_bel"),
            "dzi_bel": sum(1 for e in exams if e["exam_type"] == "dzi_bel"),
            "total": len(exams),
        },
        "exams": exams,
    }


def build_html() -> str:
    return """<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Practice</title>
  <style>
    :root{--bg:#f5f1e8;--ink:#221d18;--muted:#6b635b;--panel:#fffdf8;--line:#ded2c4;--accent:#1f5f67;--good:#1f6a46;--soft:#eef6f7}
    *{box-sizing:border-box}
    body{margin:0;font-family:Georgia,serif;background:linear-gradient(180deg,#faf8f3,var(--bg));color:var(--ink)}
    .wrap{width:min(1260px,calc(100vw - 28px));margin:0 auto;padding:28px 0 48px}
    .hero,.card{background:var(--panel);border:1px solid var(--line);border-radius:24px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
    .hero{padding:24px;margin-bottom:16px}
    h1{margin:0 0 10px;font-size:clamp(2rem,4vw,3rem)}
    .sub{color:var(--muted);line-height:1.6;max-width:80ch}
    .controls{display:grid;grid-template-columns:1fr 220px 220px auto auto;gap:12px;margin-bottom:16px}
    select,button,input[type="search"],textarea{font:inherit}
    select,input[type="search"]{padding:13px 14px;border-radius:16px;border:1px solid var(--line);background:#fff}
    button{padding:13px 14px;border-radius:16px;border:1px solid var(--line);background:#f3fafb;cursor:pointer}
    .card{padding:22px}
    .chiprow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .chip{padding:6px 10px;border-radius:999px;background:var(--soft);color:#1f5057;font-size:.88rem}
    .context{padding:16px;border-radius:16px;background:#f8fbfb;border-left:4px solid #abd0d4;line-height:1.7;margin-bottom:16px}
    .infographic{margin-bottom:16px;padding:16px;border-radius:16px;background:#fbf7ef;border:1px solid #eadfce}
    .barrow{display:grid;grid-template-columns:220px 1fr 56px;gap:10px;align-items:center;margin:8px 0}
    .bar{height:14px;border-radius:999px;background:#e7ddd2;overflow:hidden}
    .fill{height:100%;background:linear-gradient(90deg,#1f5f67,#4a8a92)}
    .q{padding:16px 0;border-top:1px solid #eee4d8}
    .q:first-of-type{border-top:none}
    .qhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .qtype{color:var(--muted);font-size:.9rem}
    .opts{display:grid;gap:8px;margin-top:10px}
    .opt{padding:10px 12px;border:1px solid #ece2d8;border-radius:12px;background:#fff}
    .student{margin-top:12px}
    .student textarea{width:100%;min-height:96px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:#fff}
    .student .mc{display:grid;gap:8px}
    .student label{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#fff}
    .answer-key{margin-top:12px;padding:12px 14px;border-radius:14px;background:#eff8f2;border:1px solid #cce6d3;color:var(--good);display:none}
    .answer-key.show{display:block}
    .result{margin-top:10px;color:#1d4f5c;font-size:.95rem}
    .key-panel{display:none;margin-bottom:16px;padding:16px;border-radius:16px;background:#fcfaf4;border:1px solid #eadfce}
    .key-panel.show{display:block}
    .key-item{padding:8px 0;border-top:1px solid #eee4d8}
    .key-item:first-of-type{border-top:none}
    @media (max-width: 980px){.controls{grid-template-columns:1fr 1fr}.barrow{grid-template-columns:140px 1fr 48px}}
    @media (max-width: 640px){.controls{grid-template-columns:1fr}.qhead{display:block}}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>Exam Practice</h1>
      <p class="sub">Combined practice site with NVO and DZI mocks. Students can fill in answers directly on the page, and each paper includes a built-in answer key.</p>
    </section>
    <section class="controls">
      <select id="examType">
        <option value="">All exam types</option>
        <option value="nvo_bel">NVO BEL</option>
        <option value="dzi_bel">DZI BEL</option>
      </select>
      <input id="search" type="search" placeholder="Search by title or topic">
      <select id="examSelect"></select>
      <button id="toggleKey">Show Answer Key</button>
      <button id="clearAnswers">Clear Answers</button>
    </section>
    <section id="root"></section>
  </main>
  <script>
    const examTypeEl=document.getElementById('examType');
    const searchEl=document.getElementById('search');
    const examSelectEl=document.getElementById('examSelect');
    const root=document.getElementById('root');
    const toggleKeyBtn=document.getElementById('toggleKey');
    const clearAnswersBtn=document.getElementById('clearAnswers');
    let payload; let showKey=false;
    function esc(s){return String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
    function fmt(s){return esc(s||'').replaceAll('\\n\\n','<br><br>').replaceAll('\\n','<br>')}
    function storageKey(examId,q){ return `exam-practice:${examId}:${q}`; }
    function filteredExams(){
      const type=examTypeEl.value; const needle=searchEl.value.trim().toLowerCase();
      return payload.exams.filter(exam=>{
        if(type && exam.exam_type!==type) return false;
        if(!needle) return true;
        return [exam.title, exam.source_title].join(' ').toLowerCase().includes(needle);
      });
    }
    function fillExamSelect(){
      const exams=filteredExams();
      examSelectEl.innerHTML=exams.map((exam,i)=>`<option value="${i}">${esc(exam.title)}${exam.source_title ? ' - ' + esc(exam.source_title) : ''}</option>`).join('');
      if(!exams.length) examSelectEl.innerHTML='<option value="">No exams found</option>';
    }
    function readAnswer(examId, number){ return localStorage.getItem(storageKey(examId,number)) || ''; }
    function writeAnswer(examId, number, value){ localStorage.setItem(storageKey(examId,number), value); }
    function render(){
      const exams=filteredExams();
      const idx=Number(examSelectEl.value||0);
      const exam=exams[idx];
      if(!exam){ root.innerHTML='<article class="card">No exam matches the current filter.</article>'; return; }
      const chart=exam.chart;
      const keyPanel = `<div class="key-panel ${showKey?'show':''}"><strong>Answer Key</strong>${exam.questions.map(q=>`<div class="key-item"><strong>${q.number}.</strong> ${esc(q.answer_guide)}</div>`).join('')}</div>`;
      root.innerHTML=`<article class="card">
        <div class="chiprow">
          <span class="chip">${esc(exam.id)}</span>
          <span class="chip">${esc(exam.exam_type)}</span>
          <span class="chip">${exam.questions.length} въпроса</span>
        </div>
        ${keyPanel}
        <div class="context"><strong>${esc(exam.source_title || 'Текст')}</strong><br>${fmt(exam.source_text)}</div>
        ${chart ? `<div class="infographic"><strong>${esc(chart.title)}</strong>${chart.labels.map((label,i)=>`<div class="barrow"><div>${esc(label)}</div><div class="bar"><div class="fill" style="width:${chart.values[i]}%"></div></div><div>${chart.values[i]}${esc(chart.unit || '%')}</div></div>`).join('')}</div>` : ''}
        ${exam.questions.map(q=>{
          const saved=readAnswer(exam.id,q.number);
          const mc=q.options ? `<div class="student"><div class="mc">${Object.entries(q.options).map(([k,v])=>`<label><input type="radio" name="${exam.id}-${q.number}" value="${esc(k)}" ${saved===k?'checked':''} data-exam="${esc(exam.id)}" data-q="${q.number}"><span><strong>${k}.</strong> ${esc(v)}</span></label>`).join('')}</div></div>` : `<div class="student"><textarea data-exam="${esc(exam.id)}" data-q="${q.number}" placeholder="Въведете своя отговор...">${esc(saved)}</textarea></div>`;
          const result = q.options && saved ? `<div class="result">${saved===q.correct_option ? 'Marked: correct' : 'Marked answer saved'}</div>` : '';
          return `<div class="q">
            <div class="qhead"><div><strong>${q.number}.</strong> ${esc(q.question)}</div><div class="qtype">${esc(q.type)}</div></div>
            ${q.options ? `<div class="opts">${Object.entries(q.options).map(([k,v])=>`<div class="opt"><strong>${k}.</strong> ${esc(v)}</div>`).join('')}</div>`:''}
            ${q.pairs ? `<div class="opts">${Object.entries(q.pairs).map(([k,v])=>`<div class="opt"><strong>${esc(k)}</strong> -> ${esc(v)}</div>`).join('')}</div>`:''}
            ${mc}
            ${result}
            <div class="answer-key ${showKey?'show':''}"><strong>Answer key:</strong> ${esc(q.answer_guide)}</div>
          </div>`;
        }).join('')}
      </article>`;
      root.querySelectorAll('textarea').forEach(el=>el.addEventListener('input',e=>writeAnswer(e.target.dataset.exam,e.target.dataset.q,e.target.value)));
      root.querySelectorAll('input[type="radio"]').forEach(el=>el.addEventListener('change',e=>{ writeAnswer(e.target.dataset.exam,e.target.dataset.q,e.target.value); render(); }));
    }
    toggleKeyBtn.addEventListener('click',()=>{showKey=!showKey; toggleKeyBtn.textContent=showKey?'Hide Answer Key':'Show Answer Key'; render();});
    clearAnswersBtn.addEventListener('click',()=>{
      const exams=filteredExams(); const idx=Number(examSelectEl.value||0); const exam=exams[idx];
      if(!exam) return;
      exam.questions.forEach(q=>localStorage.removeItem(storageKey(exam.id,q.number)));
      render();
    });
    fetch('./combined_exam_practice.json').then(r=>r.json()).then(data=>{
      payload=data;
      fillExamSelect();
      render();
      examTypeEl.addEventListener('change',()=>{fillExamSelect(); render();});
      searchEl.addEventListener('input',()=>{fillExamSelect(); render();});
      examSelectEl.addEventListener('change',render);
    });
  </script>
</body>
</html>"""


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = build_payload()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_HTML.write_text(build_html(), encoding="utf-8")
    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {OUT_HTML}")


if __name__ == "__main__":
    main()
