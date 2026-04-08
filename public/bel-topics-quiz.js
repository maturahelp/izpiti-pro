const state = {
  dataset: null,
  sectionIndex: 0,
  topicIndex: 0,
  shuffledQuestions: null,
  answers: {},
  submitted: false,
};

const LETTERS = ["А", "Б", "В", "Г"];

const elements = {
  topicCount: document.querySelector("#topicCount"),
  questionCount: document.querySelector("#questionCount"),
  focusCount: document.querySelector("#focusCount"),
  sectionSelect: document.querySelector("#sectionSelect"),
  topicSelect: document.querySelector("#topicSelect"),
  currentSection: document.querySelector("#currentSection"),
  currentTopic: document.querySelector("#currentTopic"),
  currentQuestionCount: document.querySelector("#currentQuestionCount"),
  currentFocusState: document.querySelector("#currentFocusState"),
  scoreValue: document.querySelector("#scoreValue"),
  topicHeading: document.querySelector("#topicHeading"),
  questionList: document.querySelector("#questionList"),
  shuffleBtn: document.querySelector("#shuffleBtn"),
  submitBtn: document.querySelector("#submitBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  questionTemplate: document.querySelector("#questionTemplate"),
  optionTemplate: document.querySelector("#optionTemplate"),
};

async function loadDataset() {
  const response = await fetch("bel_topics_question_bank.json");
  if (!response.ok) {
    throw new Error("Не успях да заредя въпросите по темите.");
  }

  state.dataset = await response.json();
  updateOverviewStats();
  renderSectionOptions();
  renderTopicOptions();
  resetTopicState();
  renderTopic();
}

function updateOverviewStats() {
  const topicCount = state.dataset.topic_count || 0;
  const questionCount = state.dataset.question_count || 0;
  const focusCount = (state.dataset.verification_report || []).filter(
    (item) => item.focus_verified
  ).length;

  elements.topicCount.textContent = String(topicCount);
  elements.questionCount.textContent = String(questionCount);
  elements.focusCount.textContent = `${focusCount}/${topicCount}`;
}

function renderSectionOptions() {
  elements.sectionSelect.innerHTML = "";
  state.dataset.sections.forEach((section, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = section.title;
    elements.sectionSelect.append(option);
  });
  elements.sectionSelect.value = String(state.sectionIndex);
}

function renderTopicOptions() {
  elements.topicSelect.innerHTML = "";
  const topics = getCurrentSection().topics;
  topics.forEach((topic, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = topic.title;
    elements.topicSelect.append(option);
  });

  if (state.topicIndex >= topics.length) {
    state.topicIndex = 0;
  }

  elements.topicSelect.value = String(state.topicIndex);
}

function getCurrentSection() {
  return state.dataset.sections[state.sectionIndex];
}

function getCurrentTopic() {
  return getCurrentSection().topics[state.topicIndex];
}

function getVisibleQuestions() {
  return state.shuffledQuestions || getCurrentTopic().questions;
}

function resetTopicState() {
  state.answers = {};
  state.submitted = false;
  state.shuffledQuestions = null;
}

function updateSummary() {
  const section = getCurrentSection();
  const topic = getCurrentTopic();
  const questions = getVisibleQuestions();
  const correct = questions.reduce(
    (sum, question) => sum + (state.answers[question.number] === question.correct_index ? 1 : 0),
    0
  );

  elements.currentSection.textContent = section.title;
  elements.currentTopic.textContent = topic.title;
  elements.currentQuestionCount.textContent = String(topic.question_count);
  elements.currentFocusState.textContent = topic.focus_verified ? "Да" : "Не";
  elements.topicHeading.textContent = topic.title;
  elements.scoreValue.textContent = state.submitted
    ? `${correct} / ${questions.length}`
    : `0 / ${questions.length}`;
}

function renderTopic() {
  const questions = getVisibleQuestions();
  updateSummary();
  elements.questionList.innerHTML = "";

  questions.forEach((question) => {
    const fragment = elements.questionTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".question-card");
    const indexEl = fragment.querySelector(".question-index");
    const textEl = fragment.querySelector(".question-text");
    const optionsEl = fragment.querySelector(".options");
    const feedbackEl = fragment.querySelector(".feedback");

    indexEl.textContent = `Въпрос ${question.number}`;
    textEl.textContent = question.text;

    question.options.forEach((optionText, optionIndex) => {
      const optionFragment = elements.optionTemplate.content.cloneNode(true);
      const optionRow = optionFragment.querySelector(".option-row");
      const input = optionFragment.querySelector("input");
      const letter = optionFragment.querySelector(".option-letter");
      const text = optionFragment.querySelector(".option-text");

      input.type = "radio";
      input.name = `question-${question.number}`;
      input.value = String(optionIndex);
      input.checked = state.answers[question.number] === optionIndex;
      letter.textContent = LETTERS[optionIndex] || String(optionIndex + 1);
      text.textContent = optionText;

      optionRow.classList.toggle("is-selected", input.checked);

      input.addEventListener("change", () => {
        state.answers[question.number] = optionIndex;
        state.submitted = false;
        renderTopic();
      });

      if (state.submitted) {
        const isCorrect = optionIndex === question.correct_index;
        const isSelected = state.answers[question.number] === optionIndex;
        optionRow.classList.toggle("is-correct", isCorrect);
        optionRow.classList.toggle("is-wrong", isSelected && !isCorrect);
      }

      optionsEl.append(optionFragment);
    });

    if (state.submitted) {
      const selected = state.answers[question.number];
      const correct = selected === question.correct_index;
      feedbackEl.hidden = false;
      feedbackEl.classList.toggle("is-correct", correct);
      feedbackEl.classList.toggle("is-wrong", !correct);
      feedbackEl.textContent = correct
        ? `Верен отговор. ${question.explanation}`
        : `Верният отговор е ${LETTERS[question.correct_index]}. ${question.correct_answer} ${question.explanation}`;
    }

    elements.questionList.append(fragment);
  });
}

function shuffleCurrentTopic() {
  const shuffled = [...getCurrentTopic().questions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  state.answers = {};
  state.submitted = false;
  state.shuffledQuestions = shuffled;
  renderTopic();
}

elements.sectionSelect.addEventListener("change", (event) => {
  state.sectionIndex = Number(event.target.value);
  state.topicIndex = 0;
  resetTopicState();
  renderTopicOptions();
  renderTopic();
});

elements.topicSelect.addEventListener("change", (event) => {
  state.topicIndex = Number(event.target.value);
  resetTopicState();
  renderTopic();
});

elements.shuffleBtn.addEventListener("click", () => {
  shuffleCurrentTopic();
});

elements.submitBtn.addEventListener("click", () => {
  state.submitted = true;
  renderTopic();
});

elements.resetBtn.addEventListener("click", () => {
  resetTopicState();
  renderTopic();
});

loadDataset().catch((error) => {
  elements.questionList.innerHTML = `<article class="question-card"><div class="feedback is-wrong" style="display:block;margin:0;">${error.message}</div></article>`;
});
