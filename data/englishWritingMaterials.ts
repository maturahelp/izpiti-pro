/**
 * Учебни материали за писмената част на ДЗИ по английски език (ниво B2).
 *
 * Форматът на задачите следва реалните изпити 2022–2025 (data/official_dzi_english_dataset.json):
 *  - задача 44: официално писмо, 120–130 думи, три подточки, подпис с даденото име
 *    (под 65 думи или изцяло извън темата = 0 точки);
 *  - задача 45: есе „expressing your opinion“, 200–220 думи, три подточки
 *    (под 110 думи или изцяло извън темата = 0 точки).
 *
 * Самите материали са на английски; описанията и UI копито са на български.
 */

export interface EnglishPhraseGroup {
  label: string
  phrases: string[]
  note?: string
}

export interface EnglishWritingTable {
  headers: string[]
  rows: string[][]
}

export interface EnglishWritingCallout {
  tone: 'info' | 'warning' | 'success'
  title?: string
  text: string
}

export interface EnglishModelParagraph {
  /** Текстът на абзаца от моделния отговор. */
  text: string
  /** Кратка анотация какво прави този абзац. */
  note?: string
}

export interface EnglishModelAnswer {
  /** Напр. „DZI 2025, Task 44“. */
  taskLabel: string
  /** Условието на задачата, както е в изпита. */
  prompt: string[]
  /** Указанието за подпис (само при писмо). */
  signature?: string
  salutation?: string
  paragraphs: EnglishModelParagraph[]
  closing?: string[]
  /** Брой думи в основния текст (без обръщение, завършек и подпис). */
  wordCount: number
}

export interface EnglishWritingSection {
  title: string
  lead?: string
  paragraphs?: string[]
  bullets?: string[]
  numbered?: string[]
  phraseGroups?: EnglishPhraseGroup[]
  table?: EnglishWritingTable
  callout?: EnglishWritingCallout
  modelAnswer?: EnglishModelAnswer
}

export interface EnglishWritingMaterial {
  /** Стабилен идентификатор; за старите 4 материала съвпада с името на предишния файл в public/. */
  id: string
  /** Заглавието на английски. „Essay Structure Format“ се ползва от lib/free-content.ts за безплатния материал. */
  title: string
  /** Кратко описание на български за картата в списъка. */
  description: string
  estimatedMinutes: number
  keywords: string[]
  sections: EnglishWritingSection[]
}

export interface EnglishWritingMaterialGroup {
  title: string
  description: string
  items: EnglishWritingMaterial[]
}

const EXAM_RULES_CALLOUT: EnglishWritingCallout = {
  tone: 'warning',
  title: 'Zero-point rules (from the exam paper)',
  text: 'A letter under 65 words, an essay under 110 words, or a text that is completely off topic is awarded 0 points. Indecent language, plagiarism or a text identical to another student\'s also scores 0.',
}

export const englishWritingMaterials: EnglishWritingMaterial[] = [
  // ---------------------------------------------------------------------------
  // 0. Overview of the writing paper
  // ---------------------------------------------------------------------------
  {
    id: 'writing-paper-overview',
    title: 'The Writing Paper: Tasks, Limits and What Is Assessed',
    description: 'Какво точно се иска в задачи 44 и 45, праговете за 0 точки и какво гледат проверителите.',
    estimatedMinutes: 8,
    keywords: ['writing', 'task 44', 'task 45', 'критерии', 'оценяване', 'думи', 'word limit', 'правила'],
    sections: [
      {
        title: 'Two compulsory tasks',
        lead: 'Since 2022 the B2 exam has had a fixed writing section. You must do BOTH tasks; there is no choice of topic.',
        table: {
          headers: ['Task', 'Text type', 'Length', 'Content', '0 points if…'],
          rows: [
            ['44', 'Formal letter', '120–130 words', 'Three prompts (bullet points) that you must all cover. Sign with the name given in the task.', 'under 65 words or completely off topic'],
            ['45', 'Opinion essay', '200–220 words', 'A set topic with three points to consider; you must express and support your own opinion.', 'under 110 words or completely off topic'],
          ],
        },
        callout: EXAM_RULES_CALLOUT,
      },
      {
        title: 'Real tasks from recent exams',
        lead: 'The topics change every year, but the format is identical. Use these to practise under timed conditions.',
        table: {
          headers: ['Year', 'Task 44 – formal letter', 'Task 45 – essay'],
          rows: [
            ['2025', 'To the Head Librarian: library hours are inadequate during exams – explain, propose measures, offer help. Sign: James/Jane Blake.', 'The Future of Work: pros and cons of technology, workplace dynamics, professional skills development.'],
            ['2024', 'To a shop manager: you were wrongly accused of shoplifting – say why you are angry, ask for compensation, say how you will proceed. Sign: John/Jane Smith.', 'A closer link between school and the workplace: how students benefit, how schools should respond, how employers could cooperate.'],
            ['2023', 'To your mayor: a plan to save water, electricity or food – why this resource, what measures, what effect. Sign: John/Jane Smith.', 'What makes a good team leader: personal qualities, interpersonal skills, are leaders born or made?'],
            ['2022', 'To the Parliamentary Media Committee about an advertisement you disapprove of – what it is about, how it is advertised, why you disapprove and how it could be improved. Sign: Bill/Jill Marshal.', 'Do we need classic arts (literature, painting, theatre) in the 21st century and why?'],
          ],
        },
      },
      {
        title: 'What examiners consistently look for',
        lead: 'The exam paper itself only publishes the length and off-topic rules above. The points below describe what a strong B2 answer needs; they are a study checklist, not the official marking scale.',
        bullets: [
          'Task fulfilment: every prompt is covered, in the order given, with enough detail to be convincing.',
          'Length: inside the limit. Too short is penalised heavily; far too long wastes time and invites mistakes.',
          'Organisation: clear paragraphs, one idea per paragraph, logical linking words.',
          'Register: a formal letter stays formal (no contractions, no slang); an essay is neutral to formal.',
          'Vocabulary: a range of B2 words and set phrases used accurately.',
          'Grammar: correct tenses, articles, prepositions and word order; a few complex sentences.',
          'Spelling and punctuation: consistent British or American spelling, commas after linking words, capital letters.',
        ],
      },
      {
        title: 'Time plan for the writing section',
        numbered: [
          'Read both tasks and underline the three prompts in each (2 minutes).',
          'Write the letter first – it is shorter and has a fixed shape (15–20 minutes).',
          'Plan the essay in five lines: one sentence per paragraph (3 minutes).',
          'Write the essay (25–30 minutes).',
          'Count your words and check both texts for tense, article and spelling errors (5 minutes).',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 1. Essay structure (free material – title is referenced in lib/free-content.ts)
  // ---------------------------------------------------------------------------
  {
    id: 'essay-structure-guide',
    title: 'Essay Structure Format',
    description: 'Ръководство за есе „expressing your opinion“: увод, 2–3 основни абзаца, заключение, обем по абзаци и полезни връзки.',
    estimatedMinutes: 12,
    keywords: ['essay', 'есе', 'structure', 'opinion', 'thesis', 'paragraph', 'linking words', 'task 45'],
    sections: [
      {
        title: 'What the task asks for',
        lead: 'Task 45: "Read the task and write an essay (200–220 words), expressing your opinion on the set topic." The topic comes with three points to consider.',
        bullets: [
          'You must give YOUR opinion and support it – this is an opinion essay, not a neutral report.',
          'All three points must appear in the essay, normally in the order given.',
          'Write in continuous paragraphs. Do not use bullet points, headings or numbered lists inside the essay.',
          'Aim for 200–220 words. Under 110 words = 0 points.',
        ],
        callout: EXAM_RULES_CALLOUT,
      },
      {
        title: 'Recommended structure: introduction + 2–3 body paragraphs + conclusion',
        lead: 'Four or five paragraphs are easier to organise, easier to read and easier to mark for "organisation" than one long body paragraph. The usual choice is one body paragraph per prompt.',
        table: {
          headers: ['Paragraph', 'What goes in it', 'Target length'],
          rows: [
            ['Introduction', 'General statement on the topic + why it matters today + a thesis sentence giving your overall opinion.', '35–45 words'],
            ['Body 1', 'First prompt: your view, one reason, one example.', '45–55 words'],
            ['Body 2', 'Second prompt: your view, one reason, one example.', '45–55 words'],
            ['Body 3', 'Third prompt (or merge it with Body 2 if the points overlap).', '40–50 words'],
            ['Conclusion', 'Restate your opinion in different words + a forward-looking final sentence.', '30–40 words'],
            ['Total', '', '200–220 words'],
          ],
        },
      },
      {
        title: 'Introduction',
        bullets: [
          'Open with a general observation that restates the theme in your own words – do not copy the wording of the prompt.',
          'Add one sentence of context: why the question matters now.',
          'End with a thesis sentence that states your opinion and previews the three points without listing them mechanically.',
        ],
        phraseGroups: [
          {
            label: 'Pattern',
            phrases: ['[General observation about the topic] + [why it matters today] + [thesis giving your opinion and hinting at your three points].'],
          },
          {
            label: 'Useful openers',
            phrases: [
              'It is often said that…',
              'In recent years, … has become a major issue.',
              'Few people would deny that…',
              'Nowadays, more and more people…',
            ],
          },
        ],
      },
      {
        title: 'Body paragraphs',
        bullets: [
          'Deal with the prompts in the order they are given – it helps the examiner tick them off.',
          'Start each paragraph with a topic sentence, then develop it with a reason and a concrete example (2–4 sentences).',
          'Use linking words to move between ideas instead of starting every paragraph with "Firstly / Secondly / Thirdly".',
          'Balance is good: if a prompt says "pros and cons", give both sides before stating which outweighs the other.',
        ],
        table: {
          headers: ['Connector', 'Use it for'],
          rows: [
            ['On the one hand… / On the other hand…', 'pros vs cons (always "On THE one hand")'],
            ['Furthermore / Moreover / In addition', 'adding a point'],
            ['In terms of… / Regarding… / As far as … is concerned', 'moving to the next prompt'],
            ['Although / While / Even though', 'contrast inside a point'],
            ['Similarly / Likewise', 'parallel ideas'],
            ['For instance / For example / such as', 'giving an example'],
            ['As a result / Consequently / Therefore', 'cause and effect'],
          ],
        },
      },
      {
        title: 'Expressing your opinion',
        lead: 'The task explicitly requires your opinion, so first-person phrases such as "I think" and "I believe" are correct and expected. The goal is variety, not avoidance: use a different opinion phrase in each paragraph.',
        phraseGroups: [
          {
            label: 'Personal (use 2–3 times)',
            phrases: [
              'In my opinion / In my view, …',
              'I am convinced that…',
              'I would argue that…',
              'From my point of view, …',
              'It seems to me that…',
              'I firmly believe that…',
            ],
          },
          {
            label: 'Impersonal (good for variety)',
            phrases: [
              'It is clear that…',
              'There is no doubt that…',
              'One might argue that…',
              'It could be said that…',
              'It appears that…',
            ],
          },
        ],
        callout: {
          tone: 'info',
          text: 'Avoid the trap of repeating "I think" five times. Use "In my view" in the introduction, an impersonal phrase in a body paragraph and "I am convinced that" in the conclusion, for example.',
        },
      },
      {
        title: 'Conclusion',
        bullets: [
          'Never introduce a new idea here.',
          'Open with "In conclusion", "To sum up", "All things considered" or "Ultimately".',
          'Restate your thesis in different words – do not copy your introduction.',
          'Finish with a broad, forward-looking sentence about what is at stake or what should happen next.',
        ],
      },
      {
        title: 'Common mistakes to avoid',
        bullets: [
          'Writing one 120-word block instead of clear paragraphs.',
          'Using bullet points, headings or numbered lists inside the essay.',
          'Repeating the exact wording of the prompt in the introduction.',
          'Starting the conclusion with the same words as the introduction.',
          'Forgetting one of the three prompts – re-read the task before you write the conclusion.',
          'Going under 110 words (0 points) or far over 220 (more errors, less time for checking).',
          'Switching between British and American spelling (organise / organize) in one text – pick one and keep it.',
        ],
      },
      {
        title: 'Before you hand in',
        numbered: [
          'Count the words. Are you between 200 and 220?',
          'Can you find all three prompts in the text?',
          'Is your opinion clear in the introduction AND the conclusion?',
          'Does every paragraph start with a linking word or a topic sentence?',
          'Check articles (a / the), third-person -s, past tenses and commas after linking words.',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. Model essays
  // ---------------------------------------------------------------------------
  {
    id: 'essay-model-answers',
    title: 'Sample Essays: Annotated Model Answers (Task 45)',
    description: 'Два анотирани моделни отговора на реални теми от ДЗИ 2025 и 2023 – 200–220 думи, пет абзаца, ясно изразено мнение.',
    estimatedMinutes: 15,
    keywords: ['essay', 'есе', 'model answer', 'sample', 'пример', 'task 45', 'future of work', 'team leader'],
    sections: [
      {
        title: 'How to read these samples',
        bullets: [
          'Both essays are 200–220 words long and use the structure introduction + three body paragraphs + conclusion.',
          'Each body paragraph answers exactly one of the three prompts, in the order given.',
          'The notes next to each paragraph show what it does – copy the technique, not the sentences.',
        ],
      },
      {
        title: 'Model essay 1',
        modelAnswer: {
          taskLabel: 'DZI May 2025, Task 45',
          prompt: [
            'Read the task and write an essay (200–220 words), expressing your opinion on the set topic.',
            'The Future of Work. How will workplaces change in the next decade? Consider the following:',
            '• pros and cons of technological advancement;',
            '• workplace dynamics, i.e. the way people interact when they work together;',
            '• professional skills development.',
          ],
          paragraphs: [
            {
              text: 'The way we work has changed more in the last five years than in the previous fifty, and the pace is unlikely to slow down. In my opinion, workplaces in the next decade will be shaped by technology, new forms of teamwork and the need to keep learning.',
              note: 'Introduction: general observation, then a thesis that states the opinion and hints at the three prompts.',
            },
            {
              text: 'On the one hand, technological advancement brings obvious benefits: artificial intelligence can take over repetitive tasks, and remote tools allow people to work from anywhere. On the other hand, some jobs may disappear altogether, and employees who are constantly connected find it hard to switch off.',
              note: 'Prompt 1 – pros and cons. "On the one hand / On the other hand" signals both sides.',
            },
            {
              text: 'Workplace dynamics will change as well. I believe that teams will become more flexible and international, with colleagues communicating mainly online. While this makes cooperation faster, it can also weaken personal relationships, so companies will have to work hard to keep their staff connected as human beings.',
              note: 'Prompt 2 – a personal opinion phrase ("I believe") plus a contrast ("While…").',
            },
            {
              text: 'Consequently, professional skills development will matter more than ever. A degree will no longer be enough: workers will need to update their skills regularly, and the most valuable skills will be those machines cannot copy, such as creativity and empathy.',
              note: 'Prompt 3 – linked to the previous paragraph with "Consequently"; a concrete example ("creativity and empathy").',
            },
            {
              text: 'To sum up, I am convinced that the workplace of 2035 will be more digital and more flexible, but also more demanding. Those who are willing to adapt and keep learning will benefit most from these changes.',
              note: 'Conclusion: restates the opinion in new words and ends with a forward-looking sentence. No new ideas.',
            },
          ],
          wordCount: 218,
        },
      },
      {
        title: 'Model essay 2',
        modelAnswer: {
          taskLabel: 'DZI May 2023, Task 45',
          prompt: [
            'Read the task and write an essay (200–220 words), expressing your opinion on the set topic.',
            'What makes a good team leader? State your opinion and support it with arguments and examples. You should consider the following:',
            '• his/her personal qualities;',
            '• his/her interpersonal skills;',
            '• whether leaders are born or made.',
          ],
          paragraphs: [
            {
              text: 'Every successful team has someone who holds it together, yet people rarely agree on what makes that person a good leader. In my view, a good team leader combines strong personal qualities with excellent interpersonal skills, and most of these can be learned.',
              note: 'Introduction: the thesis already answers all three prompts in one sentence.',
            },
            {
              text: 'First of all, personal qualities matter. A good leader is responsible, honest and calm under pressure. I believe that confidence is also essential, but it should never turn into arrogance: the best leaders admit their mistakes and give credit to others.',
              note: 'Prompt 1 – topic sentence, three adjectives, then a developed point with a contrast.',
            },
            {
              text: 'Interpersonal skills are just as important. Leaders must listen carefully, explain their expectations clearly and resolve conflicts before they damage the team. Moreover, they need to recognise what motivates each person, since a word of praise can be more effective than any instruction.',
              note: 'Prompt 2 – "just as important" links back; "Moreover" adds a second point with an example.',
            },
            {
              text: 'As for whether leaders are born or made, I would argue that they are mostly made. Some people are naturally charismatic, but qualities such as patience and organisation develop through experience. Many of the best leaders I know were once shy team members.',
              note: 'Prompt 3 – "As for…" moves to the last point; a personal example supports the opinion.',
            },
            {
              text: 'In conclusion, a good team leader is someone whose character inspires trust and whose communication brings out the best in others. Although talent helps, leadership is a skill that anyone willing to learn can master.',
              note: 'Conclusion: summarises all three points and ends with a clear final position.',
            },
          ],
          wordCount: 205,
        },
      },
      {
        title: 'Practise with the other real topics',
        lead: 'Plan five sentences (one per paragraph) before you write. Set a timer for 30 minutes.',
        bullets: [
          '2024: Many people say that a closer link should be made between school and the workplace. How would students benefit, how should schools respond, how could employers cooperate?',
          '2022: Do we need classic arts (literature, painting, theatre, etc.) in the 21st century and why? Give specific reasons and examples.',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. Formal letter phrases
  // ---------------------------------------------------------------------------
  {
    id: 'formal-letter-email-useful-phrases',
    title: 'Formal Letter Writing / Email / Useful phrases',
    description: 'Готови фрази за задача 44: обръщение и завършек, повод за писане, оплакване, предложение, молба, край.',
    estimatedMinutes: 12,
    keywords: ['formal letter', 'официално писмо', 'phrases', 'фрази', 'yours faithfully', 'yours sincerely', 'task 44', 'email'],
    sections: [
      {
        title: 'What the task asks for',
        lead: 'Task 44: "Read the task and write a formal letter (120–130 words), including the suggested prompts." The task tells you who you are writing to, gives three prompts and the name to sign with.',
        bullets: [
          'Cover all three prompts – one short paragraph each is the safest layout.',
          'Keep the register formal from the first word to the last: no contractions (I\'m, don\'t), no slang, no exclamation marks.',
          'Sign with the name given in the task (e.g. "Sign your letter with James Blake / Jane Blake") – never with your own name.',
          'Aim for 120–130 words in the body. Under 65 words = 0 points.',
        ],
        callout: EXAM_RULES_CALLOUT,
      },
      {
        title: 'Opening and closing go together',
        lead: 'In British English the closing formula depends on how you opened the letter. This pair is checked in every exam.',
        table: {
          headers: ['You know…', 'Opening', 'Closing'],
          rows: [
            ['No name (a position or an organisation)', 'Dear Sir or Madam, / Dear Sir, / Dear Madam,', 'Yours faithfully,'],
            ['The person\'s surname', 'Dear Mr Smith, / Dear Ms Jones, / Dear Dr Brown,', 'Yours sincerely,'],
          ],
        },
        bullets: [
          'British style: no full stop after Mr / Ms / Dr, a comma (not a colon) after the greeting.',
          '"To whom it may concern" is for references and open letters – not for a letter to a specific person or office.',
          '"Sincerely," on its own and "Regards," are American or e-mail style; avoid them in the exam letter.',
          'Put the given name on its own line under the closing formula: Yours faithfully, / Jane Blake',
        ],
      },
      {
        title: 'Layout in the exam',
        lead: 'No addresses, no date, no subject line – the exam does not ask for them and they would only use up your word count.',
        numbered: [
          'Greeting: Dear Sir or Madam, / Dear Mr Smith,',
          'Paragraph 1: reason for writing (prompt 1 is often included here).',
          'Paragraph 2: prompt 2 – explain, propose, request.',
          'Paragraph 3: prompt 3 – what you expect, offer or intend to do.',
          'Final sentence: I look forward to hearing from you.',
          'Closing: Yours faithfully, / Yours sincerely, + the name from the task.',
        ],
      },
      {
        title: 'Reason for writing',
        phraseGroups: [
          {
            label: 'Opening sentences',
            phrases: [
              'I am writing to express my concern about…',
              'I am writing to complain about…',
              'I am writing with regard to…',
              'I am writing in connection with…',
              'I am writing to enquire about…',
              'I am writing to draw your attention to…',
              'I would like to draw your attention to…',
            ],
          },
          {
            label: 'Referring to previous contact or a source',
            phrases: [
              'With regard to your letter of 12 May, …',
              'With reference to your e-mail, …',
              'Thank you for your letter of 3 June.',
              'Having read your advertisement in…, I would like to…',
              'Further to our telephone conversation, …',
            ],
            note: '"With regard to" (singular) – not "with regards to". "Regards" is only used in "Kind regards".',
          },
        ],
      },
      {
        title: 'Complaining',
        phraseGroups: [
          {
            label: 'Stating the problem',
            phrases: [
              'I wish to complain about the way I was treated…',
              'I am extremely disappointed with…',
              'I was shocked to discover that…',
              'Unfortunately, the service did not meet my expectations.',
              'I was promised…, but in fact…',
              'To make matters worse, …',
            ],
          },
          {
            label: 'Asking for compensation / action',
            phrases: [
              'I believe I am entitled to a full refund / some form of compensation.',
              'I would appreciate a written apology.',
              'I expect this matter to be resolved as soon as possible.',
              'Unless I receive a satisfactory reply within two weeks, I will have no choice but to…',
              'I intend to take the matter further / contact the consumer protection authorities.',
            ],
          },
        ],
      },
      {
        title: 'Suggesting and proposing',
        phraseGroups: [
          {
            label: 'Introducing a proposal',
            phrases: [
              'I would like to propose / suggest that…',
              'One possible solution would be to…',
              'It would be advisable to…',
              'In the light of this, I would advise…',
              'Given the situation, the best solution would be to…',
              'In order to improve…, it is necessary to…',
            ],
          },
          {
            label: 'Explaining the effect',
            phrases: [
              'This would have a positive impact on…',
              'As a result, …',
              'This measure would enable students to…',
              'I am confident that these changes would…',
            ],
          },
        ],
      },
      {
        title: 'Requesting and offering help',
        phraseGroups: [
          {
            label: 'Requests',
            phrases: [
              'I would be grateful if you could…',
              'I would appreciate it if you would…',
              'Could you please provide details of…?',
              'I would appreciate information regarding…',
              'I should also like to point out that…',
            ],
          },
          {
            label: 'Offering assistance',
            phrases: [
              'I would be glad / happy to help by…',
              'I am willing to…',
              'Please do not hesitate to contact me if I can be of any assistance.',
              'I would be delighted to take part in…',
            ],
            note: '"I am willing to help" = I am ready to help. Do not confuse it with "I am writing to complain".',
          },
        ],
      },
      {
        title: 'Ending',
        phraseGroups: [
          {
            label: 'Final sentence',
            phrases: [
              'I look forward to hearing from you.',
              'I look forward to receiving your reply.',
              'Thank you in advance for your assistance.',
              'Should you require any further information, please do not hesitate to contact me.',
              'I trust that this matter will receive your prompt attention.',
            ],
            note: '"Do not hesitate TO contact me" – not "in contacting". "Look forward to" is followed by an -ing form.',
          },
          {
            label: 'Closing formula',
            phrases: ['Yours faithfully, (after Dear Sir or Madam)', 'Yours sincerely, (after Dear Mr Smith)'],
          },
        ],
      },
      {
        title: 'Formal instead of informal',
        table: {
          headers: ['Informal', 'Formal'],
          rows: [
            ["I'm / don't / can't", 'I am / do not / cannot'],
            ['get', 'receive / obtain'],
            ['a lot of', 'a great deal of / a large number of'],
            ['really bad', 'unsatisfactory / unacceptable'],
            ['want', 'would like / wish'],
            ['ask', 'request / enquire'],
            ['fix / sort out', 'resolve / address'],
            ['Thanks!', 'Thank you.'],
            ['Sorry about…', 'I apologise for…'],
          ],
        },
        callout: {
          tone: 'success',
          text: 'Use these set phrases exactly as they are. The exam is not the moment to experiment with new vocabulary or grammar.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. Letter writing – words and expressions by function
  // ---------------------------------------------------------------------------
  {
    id: 'letter-writing-useful-words-and-expressions',
    title: 'Letter Writing Useful Words and Expressions',
    description: 'Изрази по функции за официално писмо (извинение, молба, причини, благодарност), свързващи думи и отделен справочен раздел за неофициално писмо.',
    estimatedMinutes: 12,
    keywords: ['letter', 'писмо', 'expressions', 'изрази', 'apologise', 'linking words', 'informal', 'formal', 'task 44'],
    sections: [
      {
        title: 'How this bank is organised',
        lead: 'The phrases are grouped by what you want to do in the letter. Everything in the formal part follows British conventions (apologise, Yours faithfully), which is what the exam expects.',
        callout: {
          tone: 'info',
          text: 'Since 2022 the DZI writing paper contains ONLY a formal letter (Task 44). The informal section at the end is kept for reference and for other exams; do not use informal phrases in Task 44.',
        },
      },
      {
        title: 'Formal letter: starting',
        phraseGroups: [
          {
            label: 'Salutation',
            phrases: ['Dear Sir or Madam,', 'Dear Sir,', 'Dear Madam,', 'Dear Mr Jenkins,', 'Dear Ms Taylor,'],
            note: 'Ms is the safe title for a woman when you do not know whether she is married.',
          },
          {
            label: 'Opening sentences',
            phrases: [
              'I am writing to inform you that…',
              'I am writing to confirm…',
              'I am writing to request…',
              'I am writing to enquire about…',
              'I am contacting you for the following reason.',
              'Having seen your advertisement in…, I would like to…',
              'I recently read about… and would like to know…',
              'I would be interested in receiving / obtaining…',
            ],
          },
        ],
      },
      {
        title: 'Formal letter: making a request',
        phraseGroups: [
          {
            label: 'Polite requests',
            phrases: [
              'I would be grateful if you could…',
              'I would appreciate it if you could…',
              'Could you please send me…?',
              'Could you possibly let me know…?',
              'I was wondering if you could help me with…',
              'It would be helpful if you could…',
              'I would appreciate your immediate attention to this matter.',
              'Please let me know what action you propose to take.',
            ],
            note: '"I was wondering IF you could…" – a polite, slightly less formal request; still acceptable in a letter.',
          },
        ],
      },
      {
        title: 'Formal letter: complaining and expressing dissatisfaction',
        phraseGroups: [
          {
            label: 'Phrases',
            phrases: [
              'I am writing to express my dissatisfaction with…',
              'I am writing to complain about…',
              'I am not satisfied with…',
              'I was extremely disappointed to find that…',
              'The service was far from satisfactory.',
              'I would like to query the charges, which seem unusually high.',
              'Please note that…',
            ],
          },
        ],
      },
      {
        title: 'Formal letter: apologising',
        phraseGroups: [
          {
            label: 'Phrases',
            phrases: [
              'I would like to apologise for…',
              'I apologise for the delay / the inconvenience.',
              'Please accept my apologies for…',
              'Please accept my sincere apologies. (very formal)',
              'I regret any inconvenience caused.',
              'Once again, I apologise for any inconvenience.',
            ],
            note: 'British spelling: apologise, apologies (noun). Do not mix it with American "apologize" in the same text.',
          },
        ],
      },
      {
        title: 'Formal letter: suggesting, giving reasons, expressing concern',
        phraseGroups: [
          {
            label: 'Making suggestions',
            phrases: [
              'Perhaps it would be a good idea to…',
              'Would it be possible to…?',
              'I would like to suggest that…',
              'May I suggest…?',
            ],
          },
          {
            label: 'Giving reasons',
            phrases: [
              'This is because…',
              'This is due to… (formal)',
              'This is owing to… (formal)',
              'This is as a result of… (formal)',
              'The main reason for this is…',
            ],
          },
          {
            label: 'Expressing concern',
            phrases: [
              'I am writing to express my concern about…',
              'I am rather concerned about…',
              'I was sorry to hear about…',
            ],
          },
        ],
      },
      {
        title: 'Formal letter: thanking and expressing satisfaction',
        phraseGroups: [
          {
            label: 'Thanking',
            phrases: [
              'Thank you for your help.',
              'Thank you for taking this into consideration.',
              'I am extremely grateful for…',
              'I very much appreciate your assistance.',
            ],
          },
          {
            label: 'Expressing satisfaction',
            phrases: [
              'I was delighted to hear that…',
              'I was very pleased to learn that…',
              '… was most enjoyable.',
              'We hope you are happy with this arrangement.',
            ],
          },
        ],
      },
      {
        title: 'Formal letter: closing and signing off',
        phraseGroups: [
          {
            label: 'Closing remarks',
            phrases: [
              'If you require any further information, please do not hesitate to contact me.',
              'If I can help in any way, please let me know.',
              'I look forward to hearing from you.',
              'I look forward to receiving your comments.',
              'I would appreciate a reply at your earliest convenience.',
              'An early reply would be appreciated.',
            ],
          },
          {
            label: 'Signing off',
            phrases: ['Yours faithfully, (after Dear Sir or Madam)', 'Yours sincerely, (after Dear Mr Smith)', 'Kind regards, (semi-formal e-mails only)'],
            note: 'Then the name given in the task on a separate line.',
          },
        ],
      },
      {
        title: 'Linking words for letters and essays',
        table: {
          headers: ['Function', 'Words and phrases'],
          rows: [
            ['Adding', 'Furthermore, Moreover, In addition, What is more, Also'],
            ['Contrasting', 'However, Nevertheless, On the other hand, Although, Whereas'],
            ['Cause and result', 'Therefore, Consequently, As a result, For this reason, Due to'],
            ['Sequencing', 'First of all, Secondly, Then, Finally, In the meantime'],
            ['Giving examples', 'For example, For instance, such as, In particular'],
            ['Concluding', 'In conclusion, To sum up, All things considered, Overall'],
          ],
        },
      },
      {
        title: 'For reference only: informal letters and e-mails',
        callout: {
          tone: 'warning',
          title: 'Not part of the current DZI',
          text: 'The B2 exam (2022 onwards) contains no informal letter or story. These phrases are included only for other exams and for recognising the difference in register.',
        },
        phraseGroups: [
          {
            label: 'Greetings',
            phrases: ['Dear Anna,', 'Hi Tom,', 'Hello Maria,'],
          },
          {
            label: 'Opening',
            phrases: [
              'Sorry I haven\'t written for ages.',
              'Sorry it\'s taken me so long to write.',
              'Thanks for your letter – it was lovely to hear from you.',
              'How are things with you?',
            ],
          },
          {
            label: 'Good news and bad news',
            phrases: [
              'I\'m really glad to hear about…',
              'Great news about your…!',
              'I\'m so sorry to hear about…',
              'I can\'t tell you how sad I was to hear that…',
            ],
          },
          {
            label: 'Introducing points and giving news',
            phrases: [
              'By the way, did you hear about…?',
              'Oh, and another thing – …',
              'Guess what! …',
              'You\'ll never believe what happened…',
              'Listen, did I tell you about…?',
            ],
          },
          {
            label: 'Ending',
            phrases: [
              'Well, I\'d better go now.',
              'Write back soon.',
              'Give my love to your parents.',
              'Take care,',
              'All the best,',
              'Love, / Lots of love,',
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. Sample letters – model answers (replaces the old block-format template)
  // ---------------------------------------------------------------------------
  {
    id: 'sample-letters-block-format',
    title: 'Sample Letters: Annotated Model Answers (Task 44)',
    description: 'Два анотирани моделни отговора на реални задачи 44 от ДЗИ 2025 и 2024 – британска конвенция, без адреси, 120–130 думи, подпис с даденото име.',
    estimatedMinutes: 12,
    keywords: ['sample letter', 'model answer', 'пример', 'официално писмо', 'formal letter', 'task 44', 'library', 'complaint'],
    sections: [
      {
        title: 'The layout at a glance',
        lead: 'This is all the layout the exam needs. No addresses, no date, no subject line.',
        table: {
          headers: ['Line', 'What to write'],
          rows: [
            ['Greeting', 'Dear Sir or Madam,  (or Dear Mr Smith, if the task gives a surname)'],
            ['Paragraph 1', 'Why you are writing (+ prompt 1).'],
            ['Paragraph 2', 'Prompt 2 – details, proposals or requests.'],
            ['Paragraph 3', 'Prompt 3 – what you expect, offer or intend to do, plus a closing sentence.'],
            ['Closing formula', 'Yours faithfully,  (after Dear Sir or Madam)  /  Yours sincerely,  (after Dear Mr Smith)'],
            ['Signature', 'The name given in the task, e.g. Jane Blake'],
          ],
        },
        callout: EXAM_RULES_CALLOUT,
      },
      {
        title: 'Model letter 1: proposal to the Head Librarian',
        modelAnswer: {
          taskLabel: 'DZI May 2025, Task 44',
          prompt: [
            'You are a university student and have observed that the library\'s operating hours in your university are insufficient to meet the needs of students, especially during examination periods. Write a letter to the Head Librarian in which you:',
            '• explain why the current library hours are inadequate;',
            '• propose practical measures to address the issue;',
            '• express willingness and ways to assist.',
          ],
          signature: 'Sign your letter with James Blake / Jane Blake.',
          salutation: 'Dear Sir or Madam,',
          paragraphs: [
            {
              text: 'I am writing to express my concern about the opening hours of the university library, which I believe no longer meet the needs of students.',
              note: 'Reason for writing in one sentence. The Head Librarian\'s name is not given, so the letter opens with "Dear Sir or Madam" and will close with "Yours faithfully".',
            },
            {
              text: 'At present, the library closes at 6 p.m. and remains shut at weekends. During examination periods, when most of us need a quiet place to revise, this is simply inadequate, and many students are forced to study in crowded cafés.',
              note: 'Prompt 1 – explains WHY the hours are inadequate with concrete details (6 p.m., weekends, exam periods).',
            },
            {
              text: 'I would therefore like to propose extending the opening hours until midnight and opening the reading rooms on Saturdays, at least in May and June. A self-service system could keep staffing costs low.',
              note: 'Prompt 2 – "I would therefore like to propose" introduces two practical measures and anticipates an objection (cost).',
            },
            {
              text: 'I would be glad to help by organising a group of student volunteers to supervise the rooms in the evenings. I look forward to hearing from you.',
              note: 'Prompt 3 – willingness ("I would be glad to help") and a concrete way to assist, then the standard final sentence.',
            },
          ],
          closing: ['Yours faithfully,', 'Jane Blake'],
          wordCount: 125,
        },
      },
      {
        title: 'Model letter 2: letter of complaint to a shop manager',
        modelAnswer: {
          taskLabel: 'DZI May 2024, Task 44',
          prompt: [
            'You recently had an unpleasant experience when you were shopping in a department store. One of the assistants wrongly accused you of shoplifting. Although you were able to prove that you had paid for the item in question, you received no apology. Write a letter to the manager of the shop and:',
            '• say why you are angry and what exactly you are disappointed with;',
            '• ask for some kind of compensation for the way you were treated;',
            '• point out how you intend to proceed if you do not receive an official apology.',
          ],
          signature: 'Sign your letter with John Smith / Jane Smith.',
          salutation: 'Dear Sir or Madam,',
          paragraphs: [
            {
              text: 'I am writing to complain about the way I was treated by a member of staff in your department store last Saturday.',
              note: 'Standard complaint opening: "I am writing to complain about…" (NOT "I am willing to complain").',
            },
            {
              text: 'While I was leaving the shop, one of your assistants accused me of shoplifting in front of other customers. Although I immediately showed my receipt and proved that I had paid for the item, I did not receive a single word of apology. I was deeply embarrassed and I am extremely disappointed with such unprofessional behaviour.',
              note: 'Prompt 1 – the facts in the past tense, then the feelings: "deeply embarrassed", "extremely disappointed with". Angry but still formal – no exclamation marks.',
            },
            {
              text: 'In the light of this, I believe I am entitled to some form of compensation, such as a gift voucher, together with a written apology from the store.',
              note: 'Prompt 2 – asks for compensation politely but firmly ("I believe I am entitled to…").',
            },
            {
              text: 'Should I not receive an official apology within two weeks, I intend to take the matter further and contact the consumer protection authorities.',
              note: 'Prompt 3 – a formal conditional ("Should I not receive…") states the next step without threats or rudeness.',
            },
          ],
          closing: ['Yours faithfully,', 'John Smith'],
          wordCount: 129,
        },
      },
      {
        title: 'Checklist used for both letters',
        bullets: [
          'Opening and closing match: Dear Sir or Madam → Yours faithfully.',
          'All three prompts are covered, each in its own paragraph, in the order given.',
          'Body is 120–130 words; no addresses or dates.',
          'Formal register throughout: no contractions, no slang, no exclamation marks.',
          'Signed with the name from the task, on its own line.',
        ],
      },
      {
        title: 'Practise with the other real tasks',
        bullets: [
          '2023: Write a letter to your mayor outlining a plan to save water, electricity or food – explain why you chose this resource, suggest measures to reduce its waste, speculate about the effect. Sign: John Smith / Jane Smith.',
          '2022: Write a formal letter to the Parliamentary Media Committee about an advertisement you do not approve of – what it is about, how the product is advertised, why you disapprove and how it could be improved. Sign: Bill Marshal / Jill Marshal.',
        ],
      },
    ],
  },
]

const materialById = new Map(englishWritingMaterials.map((material) => [material.id, material]))

function pick(id: string): EnglishWritingMaterial {
  const material = materialById.get(id)
  if (!material) throw new Error(`Unknown English writing material: ${id}`)
  return material
}

export const englishWritingMaterialGroups: EnglishWritingMaterialGroup[] = [
  {
    title: 'Writing paper',
    description: 'Формат на задачи 44 и 45, прагове за 0 точки и какво гледат проверителите.',
    items: [pick('writing-paper-overview')],
  },
  {
    title: 'Essay',
    description: 'Структура, аргументиране и анотирани моделни есета по реални теми.',
    items: [pick('essay-structure-guide'), pick('essay-model-answers')],
  },
  {
    title: 'Formal letter',
    description: 'Готови изрази и анотирани моделни писма по реални задачи.',
    items: [
      pick('formal-letter-email-useful-phrases'),
      pick('letter-writing-useful-words-and-expressions'),
      pick('sample-letters-block-format'),
    ],
  },
]

export function buildEnglishWritingSearchText(material: EnglishWritingMaterial): string {
  const sectionText = material.sections
    .flatMap((section) => [
      section.title,
      section.lead ?? '',
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      ...(section.numbered ?? []),
      ...(section.phraseGroups ?? []).flatMap((group) => [group.label, ...group.phrases]),
      ...(section.table?.rows ?? []).flat(),
      section.modelAnswer?.taskLabel ?? '',
    ])
    .join(' ')
  return `${material.title} ${material.description} ${material.keywords.join(' ')} ${sectionText}`.toLowerCase()
}
