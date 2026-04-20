'use client'

import Link from 'next/link'
import { useState } from 'react'

type ChoiceQuestion = {
  number: number
  prompt: string
  options: string[]
}

type OpenQuestion = {
  number: number
  prompt: string
}

const taskOnePassage = [
  'The word “scientist” was coined in 1834 by Cambridge University historian and philosopher William Whewell to describe someone who studies the structure and behaviour of the physical and natural world through observation and experiment. You could argue, then, that the first modern scientist was, say, Charles Darwin or Michael Faraday, two iconic figures who were Whewell’s contemporaries. But even if the term didn’t exist before the 1830s, there were people who embodied its principles.',
  'To find the very first scientist, we must travel further back in time. For example, we could go back to the most ancient of the ancient Greeks, Thales of Miletus, who achieved much in both science and mathematics. However, Thales left no written record and may have been, like Homer, a celebrated figure who received credit for many great achievements but who may never have existed at all.',
  'According to Brian Clegg, an award-winning British science writer, a modern scientist must recognise the importance of experiment, embrace mathematics as a fundamental tool, consider information without bias and understand the need to communicate. Many individuals in the 17th century, including Isaac Newton, satisfied most of these requirements. But to find the first scientist with these characteristics, you have to travel to the Renaissance and, of course, Galileo Galilei, who overturned Aristotle’s ideas on motion and began to explain such complex concepts as force, inertia and acceleration. He built one of the first telescopes and used it to study the cosmos. What he saw through the lenses of his device removed Earth from the centre of the universe and put it in its proper place. In all his work, Galileo stressed the need for observation and experimentation. And yet Galileo owes much to another figure born twenty years earlier. His name was William Gilbert, a rather obscure figure in the history of science.',
  'Gilbert graduated from Cambridge University, settled in London and embarked on a successful career as a physician, attending to Queen Elizabeth I. His investigations into the nature of magnetism culminated in the first significant book about physical science published in England, “On the Magnet, Magnetic Bodies, and the Great Magnet of the Earth”. He was the first person to fully explain how a magnetic compass worked and to propose that the Earth was a magnetic planet.',
  'William Gilbert greatly influenced Galileo. The famous Italian read Gilbert’s work, repeated many of his experiments and proclaimed Gilbert the founder of the scientific method.',
  'Many identify Francis Bacon as the father of the scientific method. Bacon certainly popularized the methods and techniques of scientific inquiry, but he was more of a philosopher than an experimenter. William Gilbert and Galileo, by contrast, were hands-on scientists. They designed experiments, carried them out and recorded their results with commitment, which is one of the hallmarks of modern science.',
]

const taskOneQuestions: ChoiceQuestion[] = [
  { number: 26, prompt: 'Ancient Greeks considered Thales of Miletus their first scientist because of the many scientific books he wrote.', options: ['A) True', 'B) False'] },
  { number: 27, prompt: 'According to Brian Clegg, what lies at the core of modern science is experimentation.', options: ['A) True', 'B) False'] },
  { number: 28, prompt: 'Galileo Galilei changed fundamentally man’s perceptions of the nature of motion and the universe.', options: ['A) True', 'B) False'] },
  { number: 29, prompt: 'William Gilbert was a very successful physicist at the court of Queen Elizabeth I.', options: ['A) True', 'B) False'] },
  { number: 30, prompt: 'Francis Bacon was rather a scholar and a philosopher than a scientist.', options: ['A) True', 'B) False'] },
]

const taskTwoPassage = [
  'You’ll be surprised to hear that there was a time when Bobbie was more remarkable for the weakness of his memory than anything else.',
  'In the early days of our acquaintance, if I wanted to dine with Bobbie, I used to post him a letter at the beginning of the week, and then the day before send him a telegram and make a phone-call on the day itself. By doing this I generally managed to get him.',
  'Bobbie wasn’t a fool, though.',
  'One day he fell in love and got married, as if it were the greatest fun in the world. She wasn’t the sort of girl you would have expected Bobbie to be enthusiastic about. She worked for her living; and to a fellow who has never done a hand’s turn in his life, there’s undoubtedly a sort of fascination, a kind of romance, about a girl who works for her living.',
  'Her name was Mary Anthony. She was about five feet six; she had a ton and a half of red-gold hair, grey eyes, and one of those determined chins. She was a hospital nurse.',
  'Bobbie broke the news to me at the club one evening, and next day he introduced me to her. I admired her. Mary and I got along together splendidly. She seemed to think that Bobbie was the greatest thing on earth, judging by the way she looked at him when she thought I wasn’t noticing. And Bobbie seemed to think the same about her. So I decided they had a good chance of being happy.',
  'They took a flat and settled down. Everything seemed to be running along as smoothly as you could want. If this was marriage, I thought, I couldn’t see why some fellows were so frightened of it.',
  'But we now come to the incident of the quiet dinner and it’s just here that love’s young dream hits a snag and things begin to occur.',
  'I happened come across Bobbie in Piccadilly and he asked me to dinner at their flat. When we got there, there was Mrs. Bobbie looking – well, I tell you, it staggered me. Her gold hair was all piled up in waves and crinkles, with a what-d’-you-call-it of diamonds in it. And she was wearing the most perfect dress.',
  '“Here’s old Reggie, dear,” said Bobbie. “I’ve brought him to dinner … What?”',
  'She stared at him as if she had never seen him before. Then she turned scarlet. Then she turned as white as a sheet. Then she gave a little laugh. It was most interesting to watch, but it made me wish I was miles away. Then she recovered herself.',
  '“I am so glad you were able to come, Mr. Pepper,” she said, smiling at me.',
  'After that she was all right. She talked and played us ragtime on the piano, as if she hadn’t a care in the world. However, I knew that she was working hard the whole time to keep herself in hand, and that she would have given everything she possessed to have one good scream, just one. I’ve sat through some pretty thick evenings in my time, but that one surpassed them all by a mile. At the very earliest moment I grabbed my hat and got away.',
  'On the next day I met Bobbie at the club. He started straightway, obviously glad to have someone to talk to.',
  '“Do you know how long I’ve been married?’ he said.',
  'I didn’t exactly. “About a year, isn’t it?”',
  '“Not about a year,” he said sadly. “Exactly a year – yesterday!”',
  '“Yesterday was ...?”',
  '“The anniversary to the wedding. I’d arranged to take Mary to the Savoy, and then on to Covent Garden. I had the ticket for the box in my pocket. Do you know, all through dinner I had a kind of vague idea that there was something I’d forgotten, but I couldn’t think what?”',
  '“Till your wife mentioned it?”',
  'He nodded.',
  '“Women are so easily offended,” he said gloomily. “Reggie, she’s gone! It’s such a little thing to make a fuss about. And she knows that I just can’t remember things. Never could.”',
]

const taskTwoQuestions: ChoiceQuestion[] = [
  { number: 31, prompt: 'Years ago, Bobbie was most known for his ...', options: ['A) remarkable intellect.', 'B) poor memory.', 'C) quick temper.', 'D) lack of common sense.'] },
  { number: 32, prompt: 'The narrator’s attitude to marriage …', options: ['A) is really positive and encouraging.', 'B) is that it is a scaring experience.', 'C) is that it should be based on a romance.', 'D) is not very clear from the passage.'] },
  { number: 33, prompt: 'The narrator thought that Mary Anthony was …', options: ['A) too tall for Bobbie.', 'B) too ordinary for Bobbie.', 'C) a good match for Bobbie.', 'D) merely a gold digger.'] },
  { number: 34, prompt: 'The “quiet dinner” …', options: ['A) proved Mary an exquisite hostess.', 'B) made the narrator feel uncomfortable.', 'C) turned out to be an evening of much noise and screams.', 'D) was a totally enjoyable experience for all.'] },
  { number: 35, prompt: 'Mary was angry because she …', options: ['A) she had no proper dress for a night out.', 'B) she wanted just an ordinary quiet evening with Bobbie.', 'C) she would not set foot in either the Savoy or Covent Garden.', 'D) her husband had forgotten their wedding anniversary.'] },
  { number: 36, prompt: 'The tone of the story would best be described as …', options: ['A) tragic.', 'B) humorous.', 'C) cheerful.', 'D) melancholy.'] },
]

const taskThreePassage = [
  'The Mechanical Turk: An 18th-Century “AI” Sensation',
  'In 1769, a Hungarian inventor named Wolfgang von Kempelen unveiled what seemed like a miracle of human ingenuity – a mechanical man, dressed in elegant Turkish robes, capable of playing chess against the greatest minds of Europe. The automaton, known as the Mechanical Turk, could move pieces with precision, anticipate its opponent’s strategies, and even correct mistakes. It wasn’t just a machine; it was a spectacle, a glimpse into a future where intelligence wasn’t confined to flesh and blood but could exist within gears and cogs.',
  'The Turk quickly became a sensation. It travelled across royal courts and grand salons, challenging the most brilliant players of the time. Even Napoleon Bonaparte himself couldn’t resist testing his wits against it. The legend goes that during their match, Napoleon tried to trick the machine by making an illegal move. The Turk, unfazed, reached forward, swiped the offending piece off the board, and reset the game – a reaction so lifelike that the emperor burst into laughter. The world marvelled at the idea of a machine that could think, strategise, and even outsmart humans.',
  'For nearly a century, the Mechanical Turk roamed the world, mesmerising crowds and humiliating overconfident challengers. But behind its impressive façade there was a secret that no one in the audience could have imagined. Beneath the wooden cabinet that supposedly housed the machine’s gears and mechanisms, a human chess master sat hidden in the shadows, controlling every move. The brilliant automaton was nothing more than an elaborate illusion, a carefully orchestrated hoax that played into humanity’s deepest desires – a belief that intelligence could be created, that machines could rival the human mind.',
  'Despite being a deception, the Mechanical Turk ignited something powerful: a fascination with the idea of artificial intelligence long before the term even existed. It wasn’t just a party trick; it was a promise of what the future could hold. More than 200 years later, the dream of a thinking machine is no longer an illusion. Today, AI-powered systems can outplay grandmasters, diagnose diseases, compose music, and hold conversations indistinguishable from those of a human. What once was a trick designed to entertain royalty has evolved into one of the greatest scientific revolutions in history.',
  'The irony is that AI, in many ways, still carries traces of its old deception. Just as the Turk required a hidden human to function, much of modern artificial intelligence still relies on human intervention, data, and programming to appear truly intelligent. In fact, Amazon named its crowdsourcing AI platform “Mechanical Turk” as a sign of recognition of the 18th-century trickster, acknowledging that even today, some tasks that seem automated still require human involvement behind the scenes.',
  'The Mechanical Turk may not have been real, but the dream it represented – the dream of artificial intelligence – was. And as machines continue to learn, evolve, and even surpass human intelligence in certain fields, we are finally living in the future that 18th-century audiences once only imagined. The illusion is no longer necessary because reality has caught up.',
]

const taskThreeQuestions: OpenQuestion[] = [
  { number: 37, prompt: 'Who invented the Mechanical Turk and when did that happen?' },
  { number: 38, prompt: 'Why did audiences believe the Mechanical Turk was capable of real intelligence?' },
  { number: 39, prompt: 'What specific details about the Mechanical Turk’s appearance and movements made people believe it was a real thinking machine?' },
  { number: 40, prompt: 'How did Napoleon Bonaparte try to challenge the Mechanical Turk’s intelligence during their match, and what was the machine’s unexpected response?' },
  { number: 41, prompt: 'How did the Mechanical Turk actually manage to defeat some of the best chess players of its time?' },
  { number: 42, prompt: 'How did the Mechanical Turk influence public perception of machines and their potential intelligence?' },
  { number: 43, prompt: 'Why did Amazon choose to name its crowdsourcing AI platform “Mechanical Turk”?' },
]

export default function English2025PreviewPage() {
  const [choiceAnswers, setChoiceAnswers] = useState<Record<number, string>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({})

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Test Website</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight">English DZI B2 2025</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Standalone recreation of the 2025 reading and writing sections only, using the exact content you provided.
            </p>
          </div>
          <Link
            href="/english-preview"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Back to Preview
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Official Format</p>
          <h2 className="mt-3 text-xl font-semibold">READING COMPREHENSION</h2>
          <p className="mt-1 text-sm text-stone-600">Tasks 1-3 and Writing Tasks 44-45</p>
        </div>

        <TaskBlock
          title="Task One"
          instruction="Read the text below. Then read the questions that follow it and choose the best answer to each question, marking your answers on your answer sheet."
          paragraphs={taskOnePassage}
        />
        <QuestionGroup>
          {taskOneQuestions.map((question) => (
            <ChoiceCard
              key={question.number}
              question={question}
              value={choiceAnswers[question.number]}
              onChange={(value) => setChoiceAnswers((prev) => ({ ...prev, [question.number]: value }))}
            />
          ))}
        </QuestionGroup>

        <TaskBlock
          title="Task Two"
          instruction="Read the text below. Then read the questions that follow it and choose the best answer to each question, marking your answers on your answer sheet."
          paragraphs={taskTwoPassage}
        />
        <QuestionGroup>
          {taskTwoQuestions.map((question) => (
            <ChoiceCard
              key={question.number}
              question={question}
              value={choiceAnswers[question.number]}
              onChange={(value) => setChoiceAnswers((prev) => ({ ...prev, [question.number]: value }))}
            />
          ))}
        </QuestionGroup>

        <TaskBlock
          title="Task Three"
          instruction="Read the text below. Then read the questions that follow it and answer each question with a sentence of your own. Write your answers on your answer sheet. Sentences copied word for word from the text will get 0 points."
          paragraphs={taskThreePassage}
        />
        <QuestionGroup>
          {taskThreeQuestions.map((question) => (
            <OpenCard
              key={question.number}
              question={question}
              value={openAnswers[question.number] || ''}
              rows={3}
              onChange={(value) => setOpenAnswers((prev) => ({ ...prev, [question.number]: value }))}
            />
          ))}
        </QuestionGroup>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">WRITING</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            You are required to do BOTH tasks.
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Внимание: В случай на непристоен език, плагиатство или текст, идентичен с този на друг ученик, на съответния текст се присъждат 0 точки.
          </p>
        </section>

        <QuestionGroup>
          <OpenCard
            question={{
              number: 44,
              prompt:
                'Read the task and write a formal letter (120 – 130 words), including the suggested prompts.\n\nYou are a university student and have observed that the library’s operating hours in your university are insufficient to meet the needs of students, especially during examination periods. Write a letter to the Head Librarian in which you:\n• explain why the current library hours are inadequate;\n• propose practical measures to address the issue;\n• express willingness and ways to assist.\n\nSign your letter with James Blake / Jane Blake.\n\nПисмен текст с обем под 65 думи или текст, изцяло несъответстващ на темата, се оценява с 0 (нула) точки.',
            }}
            value={openAnswers[44] || ''}
            rows={10}
            onChange={(value) => setOpenAnswers((prev) => ({ ...prev, 44: value }))}
          />
          <OpenCard
            question={{
              number: 45,
              prompt:
                'Read the task and write an essay (200 – 220 words), expressing your opinion on the set topic.\n\nThe Future of Education: How will learning evolve in the next decade? Consider the following:\n• technological innovations (incl. AI) in teaching and learning;\n• the changing roles of teachers and students;\n• the importance of lifelong learning and adaptability.\n\nПисмен текст с обем под 110 думи или текст, изцяло несъответстващ на темата, се оценява с 0 (нула) точки.',
            }}
            value={openAnswers[45] || ''}
            rows={12}
            onChange={(value) => setOpenAnswers((prev) => ({ ...prev, 45: value }))}
          />
        </QuestionGroup>
      </section>
    </main>
  )
}

function TaskBlock({
  title,
  instruction,
  paragraphs,
}: {
  title: string
  instruction: string
  paragraphs: string[]
}) {
  return (
    <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-600 whitespace-pre-wrap">{instruction}</p>
      <div className="mt-6 space-y-4 text-[15px] leading-8 text-stone-800">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

function QuestionGroup({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 space-y-4">{children}</div>
}

function ChoiceCard({
  question,
  value,
  onChange,
}: {
  question: ChoiceQuestion
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-stone-500">Question {question.number}</p>
      <h3 className="mt-2 text-base leading-7 text-stone-900">{question.prompt}</h3>
      <div className="mt-4 space-y-3">
        {question.options.map((option) => {
          const label = option.slice(0, 1)
          const text = option.slice(3)
          const selected = value === label
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                selected ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
              }`}
            >
              <input
                type="radio"
                name={`q-${question.number}`}
                checked={selected}
                onChange={() => onChange(label)}
                className="mt-1"
              />
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-stone-300 text-xs font-bold">
                {label}
              </span>
              <span>{text}</span>
            </label>
          )
        })}
      </div>
    </article>
  )
}

function OpenCard({
  question,
  value,
  rows,
  onChange,
}: {
  question: OpenQuestion
  value: string
  rows: number
  onChange: (value: string) => void
}) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-stone-500">Question {question.number}</p>
      <h3 className="mt-2 text-base leading-7 whitespace-pre-wrap text-stone-900">{question.prompt}</h3>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here..."
        className="mt-4 w-full resize-y rounded-2xl border border-stone-200 px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      />
    </article>
  )
}
