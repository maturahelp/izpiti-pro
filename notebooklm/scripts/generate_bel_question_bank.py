#!/usr/bin/env python3
"""
Generate a synthetic BEL question bank inspired by the official NVO and DZI
datasets already extracted from the local pdf/ and dzi/ folders.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


ROOT = Path(__file__).resolve().parents[2]
NOTEBOOKLM_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = NOTEBOOKLM_DIR / "generated"
OUTPUT_JSON = OUTPUT_DIR / "synthetic_bel_question_bank_500.json"
OUTPUT_MD = OUTPUT_DIR / "synthetic_bel_question_bank_500.md"

OFFICIAL_NVO_DATASET = ROOT / "official_quiz_dataset.json"
OFFICIAL_DZI_DATASET = ROOT / "izpiti-pro" / "data" / "official_dzi_bel_dataset.json"


def load_dataset(path: Path) -> List[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def chunked(seq: List[dict], size: int) -> List[List[dict]]:
    return [seq[i:i + size] for i in range(0, len(seq), size)]


def unique(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def options_dict(values: List[str]) -> Dict[str, str]:
    return {label: value for label, value in zip(["А", "Б", "В", "Г"], values)}


@dataclass(frozen=True)
class ReadingTopic:
    title: str
    text: str
    main_idea: str
    true_claim: str
    false_claims: List[str]
    synonym_pair: List[str]
    antonym_pair: List[str]


READING_TOPICS = [
    ReadingTopic(
        title="Ученически клуб по доброволчество",
        text=(
            "В много училища клубовете по доброволчество вече не се възприемат като "
            "допълнителна дейност, а като възможност учениците да усвояват практически "
            "умения. Участниците в такива клубове организират кампании за събиране на книги, "
            "помагат в приюти за животни и работят по инициативи за по-чиста градска среда. "
            "Според учители именно редовната работа по общополезни каузи развива "
            "отговорност, постоянство и способност за сътрудничество."
        ),
        main_idea="Доброволческите инициативи възпитават практически умения и гражданска отговорност.",
        true_claim="Работата по каузи помага на учениците да развиват чувство за отговорност.",
        false_claims=[
            "Клубовете по доброволчество пречат на учениците да работят в екип.",
            "Учителите смятат, че доброволчеството е загуба на време.",
            "В клубовете се допускат само ученици с отличен успех.",
        ],
        synonym_pair=["редовната", "постоянната"],
        antonym_pair=["отговорност", "безотговорност"],
    ),
    ReadingTopic(
        title="Библиотеката като общностно пространство",
        text=(
            "Съвременната библиотека отдавна не е само място за заемане на книги. "
            "Все по-често в нея се провеждат срещи с писатели, работилници за деца "
            "и курсове за дигитална грамотност. Така библиотеката се превръща в "
            "отворено пространство, което събира хора с различни интереси и възраст. "
            "Според библиотекари това променя отношението на младите към четенето, "
            "защото книгите започват да се свързват с живо общуване, а не само със задължение."
        ),
        main_idea="Библиотеката изпълнява културна и образователна роля далеч отвъд заемането на книги.",
        true_claim="Събитията в библиотеката могат да променят отношението на младите към четенето.",
        false_claims=[
            "Днешните библиотеки отказват да организират срещи с писатели.",
            "Библиотеката се посещава единствено от малки деца.",
            "Курсовете за дигитална грамотност нямат място в библиотеката.",
        ],
        synonym_pair=["отворено", "достъпно"],
        antonym_pair=["задължение", "удоволствие"],
    ),
    ReadingTopic(
        title="Сънят и учебните резултати",
        text=(
            "Лекари и психолози все по-често обръщат внимание на връзката между съня "
            "и способността за учене. Когато тийнейджърите спят недостатъчно, концентрацията "
            "им намалява, а запаметяването на нова информация става по-трудно. "
            "Наблюдения в училища показват, че учениците с по-добър режим на сън "
            "по-лесно планират задачите си и допускат по-малко грешки при работа под напрежение."
        ),
        main_idea="Качественият сън подпомага концентрацията, паметта и учебната организация.",
        true_claim="Недоспиването затруднява запаметяването на нова информация.",
        false_claims=[
            "Лекарите твърдят, че сънят няма влияние върху ученето.",
            "Учениците с добър режим на сън правят повече грешки под напрежение.",
            "Режимът на сън е важен само за малките деца.",
        ],
        synonym_pair=["намалява", "отслабва"],
        antonym_pair=["по-трудно", "по-лесно"],
    ),
    ReadingTopic(
        title="Градски транспорт и екология",
        text=(
            "Все повече европейски градове насърчават използването на обществен транспорт "
            "и велосипеди, за да намалят замърсяването на въздуха. Когато придвижването "
            "с автобуси и трамваи е удобно, гражданите по-рядко избират личния автомобил "
            "за кратки разстояния. Освен че ограничава вредните емисии, тази промяна "
            "намалява шума и освобождава повече пространство за пешеходци."
        ),
        main_idea="Удобният обществен транспорт може да подобри градската среда и качеството на въздуха.",
        true_claim="По-рядкото използване на лични автомобили може да намали вредните емисии.",
        false_claims=[
            "Автобусите и трамваите увеличават нуждата от повече място за паркиране.",
            "Удобният транспорт няма връзка с избора на гражданите как да се придвижват.",
            "Промяната в начина на придвижване увеличава градския шум.",
        ],
        synonym_pair=["насърчават", "поощряват"],
        antonym_pair=["удобно", "неудобно"],
    ),
    ReadingTopic(
        title="Изкуственият интелект в училище",
        text=(
            "Използването на инструменти с изкуствен интелект в училище предизвиква "
            "едновременно интерес и предпазливост. От една страна, тези технологии "
            "могат да помагат за търсене на информация и за създаване на първоначални идеи. "
            "От друга страна, учителите предупреждават, че без критично мислене и проверка "
            "на източниците учениците рискуват да приемат неточности за достоверни факти."
        ),
        main_idea="Ползата от изкуствения интелект зависи от критичното мислене и проверката на информацията.",
        true_claim="Учителите подчертават нуждата от проверка на източниците.",
        false_claims=[
            "Изкуственият интелект е напълно безполезен за училищната работа.",
            "Технологиите правят критичното мислене излишно.",
            "Всеки отговор, даден от изкуствен интелект, е безусловно верен.",
        ],
        synonym_pair=["предпазливост", "внимание"],
        antonym_pair=["достоверни", "неточни"],
    ),
    ReadingTopic(
        title="Музеят и личната история",
        text=(
            "Много музеи днес включват в експозициите си разкази на обикновени хора, "
            "за да покажат как големите исторически събития са променяли ежедневието. "
            "Снимки, писма и предмети от семейни архиви правят миналото по-разбираемо "
            "и по-близко за посетителите. Когато ученикът види историята през съдбата на "
            "конкретен човек, той по-лесно осъзнава, че миналото не е просто поредица от дати."
        ),
        main_idea="Личните истории в музея правят историческото знание по-достъпно и въздействащо.",
        true_claim="Семейните архиви могат да направят миналото по-близко за посетителите.",
        false_claims=[
            "Историята се разбира най-добре само чрез списък от дати.",
            "Музеите избягват да показват предмети от семейни архиви.",
            "Личните разкази нямат място в историческите експозиции.",
        ],
        synonym_pair=["по-близко", "по-достъпно"],
        antonym_pair=["обикновени", "необикновени"],
    ),
]


LITERARY_WORKS = [
    {
        "title": "„Българският език“",
        "author": "Иван Вазов",
        "theme": "защитата на родното слово",
        "characteristic": "лирическият говорител отхвърля клеветите срещу българския език",
    },
    {
        "title": "„Опълченците на Шипка“",
        "author": "Иван Вазов",
        "theme": "героизмът в защита на родината",
        "characteristic": "паметта за саможертвата на българските опълченци",
    },
    {
        "title": "„Хубава си, моя горо“",
        "author": "Любен Каравелов",
        "theme": "носталгията по родното",
        "characteristic": "образът на гората е символ на отечеството",
    },
    {
        "title": "„На прощаване“",
        "author": "Христо Ботев",
        "theme": "дългът към свободата и майката",
        "characteristic": "героят тръгва към саможертва в името на отечеството",
    },
    {
        "title": "„Неразделни“",
        "author": "Пенчо Славейков",
        "theme": "любовта, изправена срещу обществените забрани",
        "characteristic": "трагичният конфликт между личното чувство и родовия ред",
    },
    {
        "title": "„По жицата“",
        "author": "Йордан Йовков",
        "theme": "страданието и надеждата",
        "characteristic": "чудото е търсено като спасение за болно дете",
    },
    {
        "title": "„Косачи“",
        "author": "Елин Пелин",
        "theme": "силата на мечтата и приказното слово",
        "characteristic": "разказът съчетава трудното всекидневие и въображението",
    },
    {
        "title": "„По жътва“",
        "author": "Елин Пелин",
        "theme": "човешката драма сред трудовото всекидневие",
        "characteristic": "природната картина подчертава трагизма на съдбата",
    },
    {
        "title": "„Серафим“",
        "author": "Йордан Йовков",
        "theme": "доброто като нравствен избор",
        "characteristic": "героят помага без да очаква отплата",
    },
    {
        "title": "„Крадецът на праскови“",
        "author": "Емилиян Станев",
        "theme": "сблъсъкът между разум и чувство",
        "characteristic": "любовта разклаща привидната подреденост на живота",
    },
]


ORTHOGRAPHY_ITEMS = [
    ("уредник", ["вариянт", "съвременици", "потчертавам"]),
    ("препоръка", ["препорака", "препоръкаа", "препоръкай"]),
    ("изследване", ["изледване", "изследвание", "изследвъне"]),
    ("сътрудничество", ["съотрудничество", "сътрудничествоо", "сатрудничество"]),
    ("извънкласен", ["изванкласен", "извънклассeн", "извънклассн"]),
    ("читател", ["4итател", "четатeл", "читателл"]),
    ("обществен", ["общесвен", "общесвен", "обществeнн"]),
    ("въздействие", ["въздейсвие", "въздействиее", "въздействийе"]),
    ("възможност", ["вазможност", "възможнос", "възможнност"]),
    ("постижение", ["постежение", "постижeниеe", "постигжение"]),
    ("отговорност", ["отговорнос", "отговорнност", "одговорност"]),
    ("безценен", ["безцененн", "бесценен", "безценн"]),
]


GRAMMAR_CORRECT_SENTENCES = [
    "Учителят обсъди с учениците резултатите от анкетата.",
    "На училищното тържество присъстваха родители и гости.",
    "Новият проект насърчава децата да четат всеки ден.",
    "Редакторът публикува статията в електронното издание.",
    "В библиотеката се организираха срещи с млади автори.",
    "Спортният клуб привлече ученици от различни възрасти.",
]

GRAMMAR_INCORRECT_SENTENCES = [
    "Моля, изпратете доклада на госпожа Петрова и на мен утре сутринта.",
    "Директорката поздрави учениците за отличните им резултати.",
    "Книгата, която ми препоръча, се оказаха много интересна.",
    "Екипът представиха проекта си пред журито.",
    "Момичето и брат му отиде на състезанието вчера.",
    "На изложбата бяха показаните най-добрите рисунки.",
]

PUNCTUATION_CORRECT_SENTENCES = [
    "Когато приключи часовете, Мария отиде в библиотеката, за да върне книгата.",
    "Учениците, които участваха в дебата, подготвиха убедителни аргументи.",
    "Ако искаш, можем да обсъдим текста след училище.",
    "Според учителя, макар задачата да е трудна, тя е напълно решима.",
]

PUNCTUATION_INCORRECT_SENTENCES = [
    "Когато приключи часовете Мария отиде в библиотеката за да върне книгата.",
    "Учениците които участваха в дебата, подготвиха убедителни аргументи.",
    "Ако искаш можем да обсъдим текста, след училище.",
    "Според учителя макар задачата да е трудна тя е напълно решима.",
]

MORPHOLOGY_ITEMS = [
    ("свежест", "Туристите се наслаждаваха на ({word}) на планинския въздух.", "свежестта"),
    ("билет", "Липсва информация от кой офис е бил закупен ({word}) Ви за полета.", "билетът"),
    ("предмет", "В една от залите на музея са изложени двайсет антични ({word}).", "предмета"),
    ("книга", "Библиотекарката подреди новите ({word}) на отделен рафт.", "книги"),
    ("приятел", "Учителят разговаря с ({word}) на ученика след часа.", "приятеля"),
    ("събитие", "Организаторите обявиха, че ({word}) ще започне точно в шест часа.", "събитието"),
    ("среща", "След ({word}) с писателя учениците задаваха още въпроси.", "срещата"),
    ("ученик", "Наградата бе връчена на ({word}), спечелил първо място.", "ученика"),
]

PARONYM_ITEMS = [
    ("Той е човек, който твърдо устоява своите житейски принципи.", "отстоява"),
    ("Режисьорът представи ефектен, но твърде ефективен финал на спектакъла.", "ефектен"),
    ("Журналистът зададе тактичен, но и много тактически въпрос.", "тактичен"),
    ("Учените направиха икономично изследване върху историческите документи.", "икономическо"),
    ("Тя прояви практичен интерес към историята на изкуството.", "практически"),
    ("Лекторът използва популярни термини, за да бъде текстът разбираем за всички.", "популяризаторски"),
]

ERROR_TEXTS = [
    {
        "wrong": (
            "Все повече ученици осъзнават, че четенето не е досадно задължение а възможност "
            "да откриват нови светове. Когато човек редовно чете той обогатява речта си, "
            "развива въображението и започва по уверено да изразява мислите си."
        ),
        "fixed": (
            "Все повече ученици осъзнават, че четенето не е досадно задължение, а възможност "
            "да откриват нови светове. Когато човек редовно чете, той обогатява речта си, "
            "развива въображението и започва по-уверено да изразява мислите си."
        ),
        "error_count": 4,
    },
    {
        "wrong": (
            "Училищните проекти по доброволчество показват че младите хора умеят да работят "
            "в екип и да поемат отговорност. Участието в подобни инициативи ги прави "
            "по чувствителни към проблемите на другите."
        ),
        "fixed": (
            "Училищните проекти по доброволчество показват, че младите хора умеят да работят "
            "в екип и да поемат отговорност. Участието в подобни инициативи ги прави "
            "по-чувствителни към проблемите на другите."
        ),
        "error_count": 3,
    },
    {
        "wrong": (
            "Съвременните музеи все по често разказват историята чрез лични свидетелства "
            "и предмети от всекидневието. Така миналото престава да изглежда далечно "
            "и безлично а посетителите го възприемат по емоционално."
        ),
        "fixed": (
            "Съвременните музеи все по-често разказват историята чрез лични свидетелства "
            "и предмети от всекидневието. Така миналото престава да изглежда далечно "
            "и безлично, а посетителите го възприемат по-емоционално."
        ),
        "error_count": 3,
    },
]

SHORT_RESPONSE_PROMPTS = [
    (
        "Запишете в текст от 3 – 4 изречения какво внушава твърдението: "
        "„Истинското знание не се състои само в запомнянето, а в разбирането.“",
        "Например: знанието е ценно, когато човек умее да го осмисля и прилага; "
        "механичното запаметяване не гарантира трайно разбиране; "
        "осмисленото учене развива самостоятелно мислене.",
    ),
    (
        "Запишете в текст от 3 – 4 изречения какво внушава мисълта: "
        "„Отговорността започва там, където свършват оправданията.“",
        "Например: човек поема зряло отношение към постъпките си; "
        "търсенето на оправдания не решава проблемите; "
        "отговорното поведение изисква действия, а не само думи.",
    ),
    (
        "Запишете в текст от 3 – 4 изречения какъв житейски смисъл носи изразът: "
        "„Надеждата не отменя трудностите, но помага да бъдат преодолени.“",
        "Например: надеждата дава вътрешна опора в трудни моменти; "
        "тя не заменя усилието, а го подкрепя; "
        "човек по-лесно намира сили за действие, когато вярва в добрия изход.",
    ),
]

ESSAY_TOPICS = [
    (
        "Тема за есе: Кога свободата изисква самодисциплина",
        "Тема за интерпретативно съчинение: Доброто като избор в „Серафим“ от Йордан Йовков",
    ),
    (
        "Тема за есе: Успехът - награда или изпитание",
        "Тема за интерпретативно съчинение: Родното и чуждото в „Хубава си, моя горо“",
    ),
    (
        "Тема за есе: Страхът - пречка или предупреждение",
        "Тема за интерпретативно съчинение: Разум и чувство в „Крадецът на праскови“",
    ),
]


def shuffled_options(correct: str, distractors: List[str], rnd: random.Random) -> (Dict[str, str], str):
    all_options = [correct] + distractors[:3]
    rnd.shuffle(all_options)
    mapping = options_dict(all_options)
    for label, value in mapping.items():
        if value == correct:
            return mapping, label
    raise RuntimeError("Correct answer not found")


def build_source_stats() -> dict:
    nvo = [item for item in load_dataset(OFFICIAL_NVO_DATASET) if item.get("subject") == "Български език и литература"]
    dzi = load_dataset(OFFICIAL_DZI_DATASET)
    return {
        "nvo_bel_tests": len(nvo),
        "dzi_bel_tests": len(dzi),
        "nvo_bel_source_pdfs": unique([item["source_pdf"] for item in nvo]),
        "dzi_bel_source_pdfs": unique([item["source_pdf"] for item in dzi]),
    }


def generate_nvo_reading(index: int, rnd: random.Random) -> List[dict]:
    topic = READING_TOPICS[index % len(READING_TOPICS)]
    items = []

    q1_options, q1_correct = shuffled_options(
        topic.main_idea,
        [
            "Текстът представя единствено исторически факти без изводи.",
            "Основното в текста е противопоставянето между поколенията.",
            "Текстът защитава тезата, че училището няма обществена роля.",
        ],
        rnd,
    )
    items.append(
        {
            "type": "single_choice",
            "style": "nvo_bel",
            "section": "reading_comprehension",
            "context_title": topic.title,
            "context_text": topic.text,
            "question": f"Коя е основната теза в текста „{topic.title}“?",
            "options": q1_options,
            "correct_option": q1_correct,
            "official_answer": q1_options[q1_correct],
        }
    )

    q2_options, q2_correct = shuffled_options(
        topic.true_claim,
        topic.false_claims,
        rnd,
    )
    items.append(
        {
            "type": "single_choice",
            "style": "nvo_bel",
            "section": "reading_comprehension",
            "context_title": topic.title,
            "context_text": topic.text,
            "question": "Кое твърдение е вярно според текста?",
            "options": q2_options,
            "correct_option": q2_correct,
            "official_answer": q2_options[q2_correct],
        }
    )

    synonym_left, synonym_right = topic.synonym_pair
    antonym_left, antonym_right = topic.antonym_pair
    q3_correct = f"{synonym_left} – {synonym_right}"
    q3_options, q3_correct_letter = shuffled_options(
        q3_correct,
        [
            f"{antonym_left} – {antonym_right}",
            f"{synonym_left} – {antonym_right}",
            f"{antonym_left} – {synonym_right}",
        ],
        rnd,
    )
    items.append(
        {
            "type": "single_choice",
            "style": "nvo_bel",
            "section": "lexis",
            "context_title": topic.title,
            "context_text": topic.text,
            "question": "В кой ред думите са синоними?",
            "options": q3_options,
            "correct_option": q3_correct_letter,
            "official_answer": q3_options[q3_correct_letter],
        }
    )

    return items


def generate_literature_single(index: int, rnd: random.Random, style: str) -> dict:
    correct = LITERARY_WORKS[index % len(LITERARY_WORKS)]
    distractors = [item for item in LITERARY_WORKS if item["title"] != correct["title"]]
    rnd.shuffle(distractors)

    question_variants = [
        (
            f"В коя творба е интерпретирана темата за {correct['theme']}?",
            correct["title"],
            [item["title"] for item in distractors[:3]],
        ),
        (
            f"Кой автор е създал творбата {correct['title']}?",
            correct["author"],
            unique([item["author"] for item in distractors if item["author"] != correct["author"]])[:3],
        ),
        (
            f"Кое твърдение се отнася за {correct['title']}?",
            correct["characteristic"],
            [item["characteristic"] for item in distractors[:3]],
        ),
    ]
    stem, answer, wrong = question_variants[index % len(question_variants)]
    option_map, correct_option = shuffled_options(answer, wrong, rnd)
    return {
        "type": "single_choice",
        "style": style,
        "section": "literature",
        "question": stem,
        "options": option_map,
        "correct_option": correct_option,
        "official_answer": option_map[correct_option],
    }


def generate_orthography_single(index: int, rnd: random.Random) -> dict:
    correct, wrong = ORTHOGRAPHY_ITEMS[index % len(ORTHOGRAPHY_ITEMS)]
    option_map, correct_option = shuffled_options(correct, wrong, rnd)
    return {
        "type": "single_choice",
        "style": "dzi_bel",
        "section": "orthography",
        "question": "В кой ред думата е изписана правилно?",
        "options": option_map,
        "correct_option": correct_option,
        "official_answer": option_map[correct_option],
    }


def generate_grammar_single(index: int, rnd: random.Random) -> dict:
    variant = index % 4
    if variant == 0:
        correct = GRAMMAR_CORRECT_SENTENCES[index % len(GRAMMAR_CORRECT_SENTENCES)]
        wrong = rnd.sample(GRAMMAR_INCORRECT_SENTENCES, 3)
        option_map, correct_option = shuffled_options(correct, wrong, rnd)
        question = "В кое изречение НЕ е допусната граматична грешка?"
        section = "grammar"
    elif variant == 1:
        correct = GRAMMAR_INCORRECT_SENTENCES[index % len(GRAMMAR_INCORRECT_SENTENCES)]
        wrong = rnd.sample(GRAMMAR_CORRECT_SENTENCES, 3)
        option_map, correct_option = shuffled_options(correct, wrong, rnd)
        question = "В кое изречение е допусната граматична грешка?"
        section = "grammar"
    elif variant == 2:
        correct = PUNCTUATION_CORRECT_SENTENCES[index % len(PUNCTUATION_CORRECT_SENTENCES)]
        wrong = rnd.sample(PUNCTUATION_INCORRECT_SENTENCES, 3)
        option_map, correct_option = shuffled_options(correct, wrong, rnd)
        question = "В кое изречение НЕ е допусната пунктуационна грешка?"
        section = "punctuation"
    else:
        correct = PUNCTUATION_INCORRECT_SENTENCES[index % len(PUNCTUATION_INCORRECT_SENTENCES)]
        wrong = rnd.sample(PUNCTUATION_CORRECT_SENTENCES, 3)
        option_map, correct_option = shuffled_options(correct, wrong, rnd)
        question = "В кое изречение е допусната пунктуационна грешка?"
        section = "punctuation"

    return {
        "type": "single_choice",
        "style": "dzi_bel",
        "section": section,
        "question": question,
        "options": option_map,
        "correct_option": correct_option,
        "official_answer": option_map[correct_option],
    }


def generate_open_morphology(index: int) -> dict:
    word, template, answer = MORPHOLOGY_ITEMS[index % len(MORPHOLOGY_ITEMS)]
    return {
        "type": "open_response",
        "style": "dzi_bel",
        "section": "morphology",
        "question": (
            "В листа за отговори запишете правилната за изречението форма на думата, "
            f"поставена в скоби. {template.format(word=word)}"
        ),
        "official_answer": answer,
    }


def generate_open_paronym(index: int) -> dict:
    sentence, answer = PARONYM_ITEMS[index % len(PARONYM_ITEMS)]
    return {
        "type": "open_response",
        "style": "dzi_bel",
        "section": "lexis",
        "question": (
            "В листа за отговори запишете САМО паронима, с който да поправите "
            f"лексикалната грешка в изречението. {sentence}"
        ),
        "official_answer": answer,
    }


def generate_error_correction(index: int) -> dict:
    item = ERROR_TEXTS[index % len(ERROR_TEXTS)]
    return {
        "type": "open_response",
        "style": "nvo_bel",
        "section": "editing",
        "question": (
            "В листа за отговори препишете текста, като поправите допуснатите "
            f"{item['error_count']} грешки – правописни, пунктуационни или граматични. "
            f"{item['wrong']}"
        ),
        "official_answer": item["fixed"],
    }


def generate_short_response(index: int) -> dict:
    question, answer = SHORT_RESPONSE_PROMPTS[index % len(SHORT_RESPONSE_PROMPTS)]
    return {
        "type": "open_response",
        "style": "nvo_bel",
        "section": "short_written_response",
        "question": question,
        "official_answer": answer,
    }


def generate_essay_prompt(index: int) -> dict:
    essay, interpretation = ESSAY_TOPICS[index % len(ESSAY_TOPICS)]
    return {
        "type": "open_response",
        "style": "dzi_bel",
        "section": "extended_writing",
        "question": (
            "Напишете аргументативен текст в обем до 4 страници по ЕДНА от следните две теми: "
            f"{essay}. {interpretation}."
        ),
        "official_answer": (
            "Очаква се самостоятелен аргументативен текст с ясна теза, логически "
            "последователни аргументи, уместни примери и езикова грамотност."
        ),
    }


def generate_bank() -> dict:
    rnd = random.Random(20260401)
    source_stats = build_source_stats()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    questions = []
    counter = 1

    for index in range(30):
        for item in generate_nvo_reading(index, rnd):
            item["id"] = f"syn-{counter:03d}"
            item["source_inspiration"] = "pdf/"
            questions.append(item)
            counter += 1

    for index in range(60):
        item = generate_literature_single(index, rnd, "nvo_bel")
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "pdf/"
        questions.append(item)
        counter += 1

    for index in range(40):
        item = generate_error_correction(index)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "pdf/"
        questions.append(item)
        counter += 1

    for index in range(30):
        item = generate_short_response(index)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "pdf/"
        questions.append(item)
        counter += 1

    for index in range(85):
        item = generate_orthography_single(index, rnd)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    for index in range(70):
        item = generate_grammar_single(index, rnd)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    for index in range(35):
        item = generate_open_morphology(index)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    for index in range(25):
        item = generate_open_paronym(index)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    for index in range(30):
        item = generate_literature_single(index, rnd, "dzi_bel")
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    for index in range(35):
        item = generate_essay_prompt(index)
        item["id"] = f"syn-{counter:03d}"
        item["source_inspiration"] = "dzi/"
        questions.append(item)
        counter += 1

    if len(questions) != 500:
        raise RuntimeError(f"Expected 500 questions, got {len(questions)}")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "workspace": str(NOTEBOOKLM_DIR),
        "source_dirs": [str(ROOT / "pdf"), str(ROOT / "dzi")],
        "source_datasets": [str(OFFICIAL_NVO_DATASET), str(OFFICIAL_DZI_DATASET)],
        "assumption": (
            "Generated bank is BEL-focused and uses the extracted NVO BEL and DZI BEL datasets "
            "derived from the local pdf/ and dzi/ folders."
        ),
        "source_stats": source_stats,
        "question_count": len(questions),
        "questions": questions,
    }
    return payload


def write_outputs(payload: dict) -> None:
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Synthetic BEL Question Bank (500)",
        "",
        f"- Generated at: {payload['generated_at']}",
        f"- Workspace: {payload['workspace']}",
        f"- Source dirs: {', '.join(payload['source_dirs'])}",
        f"- Assumption: {payload['assumption']}",
        "",
    ]

    for block in chunked(payload["questions"], 25):
        for question in block:
            lines.append(f"## {question['id']}")
            lines.append("")
            lines.append(f"- Style: {question['style']}")
            lines.append(f"- Section: {question['section']}")
            lines.append(f"- Type: {question['type']}")
            if "context_title" in question:
                lines.append(f"- Context title: {question['context_title']}")
                lines.append(f"- Context: {question['context_text']}")
            lines.append(f"- Question: {question['question']}")
            if "options" in question:
                lines.append("- Options:")
                for label, value in question["options"].items():
                    lines.append(f"  - {label}: {value}")
                lines.append(f"- Correct option: {question['correct_option']}")
            lines.append(f"- Official answer: {question['official_answer']}")
            lines.append("")

    OUTPUT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    payload = generate_bank()
    write_outputs(payload)
    print(f"Generated {payload['question_count']} questions")
    print(f"JSON: {OUTPUT_JSON}")
    print(f"Markdown: {OUTPUT_MD}")


if __name__ == "__main__":
    main()
