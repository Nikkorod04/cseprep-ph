# CSE Prep PH — Content Blueprint

Spec for the question bank, tips library, and study plans. This is the file the content pipeline and the item writer follow.

> **Rule zero:** Every item is an **original** item. Do not copy CSC exam questions, reviewer books, or Facebook PDFs. Similar *style* is fine; copied *text* is not.

---

## 1. Exam blueprint

| | Professional | Subprofessional |
|---|---|---|
| Items (total) | 170 | 165 |
| Scored items | 150 (+20 EDQ) | 145 (+20 EDQ) |
| Time | 190 min | 160 min |
| Seconds per item | ~67 | ~58 |
| Passing rating | 80.00% general average | 80.00% |
| Sections | Verbal, Numerical, Analytical, General Info | Verbal, Numerical, Clerical, General Info |

**Target to pass:** ~120 of 150 correct (Professional), ~116 of 145 (Subprofessional). No per-section cut-off.

---

## 2. Topic taxonomy & launch volumes

`section.topic` slugs used in the JSON and DB.

| Section | Topic slug | Items | Weight |
|---|---|---|---|
| verbal | `vocabulary` | 70 | 28% |
| verbal | `grammar-usage` | 60 | 24% |
| verbal | `reading-comprehension` | 45 | 18% |
| verbal | `analogy` | 40 | 16% |
| verbal | `paragraph-organization` | 35 | 14% |
| numerical | `word-problems` | 90 | 36% |
| numerical | `basic-operations` | 60 | 24% |
| numerical | `number-series` | 60 | 24% |
| numerical | `fractions-percent` | 40 | 16% |
| analytical | `data-interpretation` | 45 | 28% |
| analytical | `logic` | 40 | 25% |
| analytical | `word-association` | 40 | 25% |
| analytical | `assumptions-conclusions` | 35 | 22% |
| clerical | `filing-alphabetical` | 40 | 33% |
| clerical | `spelling` | 40 | 33% |
| clerical | `comparing-coding` | 40 | 33% |
| general-info | `constitution` | 50 | 36% |
| general-info | `ra-6713` | 30 | 21% |
| general-info | `peace-human-rights` | 25 | 18% |
| general-info | `environment` | 35 | 25% |

**Difficulty split per topic:** 30% easy (1) · 50% medium (2) · 20% hard (3).

---

## 3. Item schema

`assets/content/v1/verbal.json` etc. Validated with Zod at build time.

```ts
type Track = "professional" | "subprofessional";
type Section = "verbal" | "numerical" | "analytical" | "clerical" | "general-info";

interface Question {
  id: string;                    // "prof-num-word-0001" — unique, stable forever
  tracks: Track[];               // shared items list both
  section: Section;
  topic: string;                 // slug from §2
  difficulty: 1 | 2 | 3;
  stem: string;                  // supports \n for tables/series
  choices: [                    // exactly 4
    { key: "A"; text: string },
    { key: "B"; text: string },
    { key: "C"; text: string },
    { key: "D"; text: string }
  ];
  answer: "A" | "B" | "C" | "D";
  explanation: string;           // ≤ 60 words, shows the why
  tip?: string;                  // one-line rule shown on the explanation card
  timeLimitSec?: number;         // optional override for speed drills
  version: number;               // bump on any edit
  reviewedAt: string;           // "2026-11-24"
}
```

### Writing standards

1. **One defensible answer.** If a smart reviewer can argue for B, rewrite the item.
2. **Plausible distractors.** Wrong choices should come from real mistakes (wrong operation, misread unit, common misspelling) — not random numbers.
3. **No calculator dependency.** All numerical items solvable in ≤ 45 seconds with mental math or scratch paper.
4. **No trick trivia.** Test the concept, not whether they memorized an obscure date.
5. **Never all-of-the-above / none-of-the-above.** They leak the answer.
6. **Answer position balanced.** ~25% each of A/B/C/D. Lint for it.
7. **Explanations teach the rule**, not just restate the arithmetic.
8. **Filipino names and contexts** (Juana, Barangay Malinis, ₱) — makes items feel local and original.
9. **Laws:** cite the statute number in the explanation. Content is dated; add `reviewedAt`.

---

## 4. Sample items (the quality bar)

### Verbal — Vocabulary

> **The agency's memorandum was so ______ that even the newest employees understood the revised filing procedure on their first read.**
> A. ambiguous  B. lucid  C. verbose  D. curt
> **Answer: B.** "Lucid" means clear and easy to understand, which matches "understood on their first read." *Tip: replace the blank with your own word first, then find the closest match.*

> **The audit findings were ______: the report cited no document, witness, or computation to support them.**
> A. substantiated  B. baseless  C. meticulous  D. conclusive
> **Answer: B.** The clause after the colon says nothing supports the findings. *Tip: the colon usually explains the blank.*

### Verbal — Grammar & Correct Usage

> **Each of the applicants ______ required to submit a copy of the transcript of records.**
> A. are  B. were  C. is  D. have been
> **Answer: C.** The subject is "Each," which is singular; "of the applicants" is only a modifier. *Tip: cross out prepositional phrases before checking subject–verb agreement.*

> **Neither the supervisor nor the clerks ______ informed about the schedule change.**
> A. was  B. were  C. is  D. has been
> **Answer: B.** With "neither…nor," the verb agrees with the nearer subject ("clerks"). *Tip: nearest-subject rule for either/or and neither/nor.*

> **The number of examinees ______ increased since the announcement.**
> A. have  B. has  C. were  D. are
> **Answer: B.** "The number" is singular; "a number of" would take a plural verb. *Tip: "the number" singular, "a number of" plural.*

> **Walking into the records office, ______.**
> A. the telephone was ringing loudly
> B. the clerk noticed the telephone ringing
> C. the ringing telephone surprised the room
> D. there was a telephone ringing
> **Answer: B.** The opening phrase must describe the person doing the walking. *Tip: the subject right after a comma must be the one performing the action.*

### Verbal — Analogy

> **thermometer : temperature :: barometer : ______**
> A. humidity  B. pressure  C. wind speed  D. altitude
> **Answer: B.** A thermometer measures temperature; a barometer measures atmospheric pressure.

> **frugal : wasteful :: ______**
> A. generous : stingy  B. timid : shy  C. rapid : quick  D. wealthy : rich
> **Answer: A.** The pair is opposites (thrifty vs. wasteful); generous vs. stingy is the only antonym pair. *Tip: name the relationship in a sentence before looking at the choices.*

### Verbal — Paragraph Organization

> **Arrange the sentences to form a coherent paragraph.**
> 1. Finally, the documents are forwarded to the records officer for archiving.
> 2. First, the receiving clerk logs every incoming document in the registry.
> 3. Next, the assigned staff classifies the document by subject.
> 4. Handling incoming correspondence follows four steps.
> A. 4-2-3-1  B. 2-3-1-4  C. 4-3-2-1  D. 2-4-3-1
> **Answer: A.** Sentence 4 is the topic sentence; "First/Next/Finally" fixes the order. *Tip: find the topic sentence and the transition words first.*

### Verbal — Reading Comprehension

> **The barangay office announced that business permits would be processed only from 8:00 a.m. to 12:00 p.m. starting next week. Residents who arrive after noon will be asked to return the following day. The change allows staff to conduct field inspections in the afternoon.**
>
> **Why will residents who arrive after noon be turned away?**
> A. The office closes permanently at noon.
> B. Staff will be conducting field inspections.
> C. Permits are no longer issued to residents.
> D. The registry has run out of forms.
> **Answer: B.** Stated directly in the last sentence. *Tip: answer only from the passage — outside knowledge is a trap.*

### Numerical — Word Problems

> **A barangay budget of ₱480,000 is allocated as follows: 35% for salaries, 25% for supplies, and the rest for equipment. How much is allocated for equipment?**
> A. ₱120,000  B. ₱168,000  C. ₱192,000  D. ₱288,000
> **Answer: C.** Equipment = 100% − 35% − 25% = 40%. 0.40 × 480,000 = 192,000. *Tip: compute the remaining percent before touching the peso amount.*

> **A clerk can encode a report in 6 hours; another clerk can do it in 4 hours. Working together, how long will it take?**
> A. 2 h 24 min  B. 2 h 40 min  C. 3 h  D. 5 h
> **Answer: A.** 1/6 + 1/4 = 5/12 of the job per hour → 12/5 = 2.4 h = 2 h 24 min. *Tip: work rate = 1/time; add the rates, then invert.*

> **The price of a ream of paper rose from ₱180 to ₱207. What was the percent increase?**
> A. 12%  B. 15%  C. 18%  D. 27%
> **Answer: B.** Increase = 27; 27 ÷ 180 = 0.15 = 15%. *Tip: percent change = change ÷ original, never ÷ new.*

> **The ratio of male to female employees in an office is 3:5. If there are 320 employees, how many are female?**
> A. 120  B. 160  C. 200  D. 240
> **Answer: C.** Total parts = 8; one part = 40; female = 5 × 40 = 200. *Tip: add the ratio parts first to get the "one part" value.*

> **The average of five numbers is 24. When one number is removed, the average of the remaining four becomes 22. What number was removed?**
> A. 26  B. 30  C. 32  D. 34
> **Answer: C.** Original sum = 120; new sum = 88; removed = 32. *Tip: averages hide totals — convert to sums.*

> **A father is three times as old as his son. In 12 years, he will be twice as old. How old is the son now?**
> A. 10  B. 12  C. 14  D. 16
> **Answer: B.** 3x + 12 = 2(x + 12) → x = 12. *Tip: put "now" and "in 12 years" in two columns.*

### Numerical — Number Series

> **3, 6, 11, 18, 27, ______**
> A. 36  B. 38  C. 40  D. 44
> **Answer: B.** Differences are +3, +5, +7, +9, so the next is +11 → 38. *Tip: check first differences before ratios.*

> **2, 6, 12, 20, 30, ______**
> A. 38  B. 40  C. 42  D. 44
> **Answer: C.** n(n+1): 1·2, 2·3, 3·4, 4·5, 5·6, 6·7 = 42. *Tip: if second differences are constant (+2), the pattern is quadratic.*

### Numerical — Fractions, Decimals, Percent

> **Which is equal to 3/8?**
> A. 0.30  B. 0.34  C. 0.375  D. 0.38
> **Answer: C.** 3 ÷ 8 = 0.375 = 37.5%. *Tip: memorize the eighths: 1/8 = 12.5%, 3/8 = 37.5%, 5/8 = 62.5%, 7/8 = 87.5%.*

> **A shirt priced at ₱1,240 is on sale at 25% off. What is the sale price?**
> A. ₱900  B. ₱930  C. ₱960  D. ₱1,000
> **Answer: B.** 25% of 1,240 = 310; 1,240 − 310 = 930. *Tip: "25% off" = pay 75%, so 0.75 × 1,240 is one step.*

### Analytical — Word Association

> **Which does not belong?**
> A. tuna  B. shark  C. dolphin  D. tilapia
> **Answer: C.** Dolphin is a mammal; the rest are fish. *Tip: find the category first, then the exception.*

### Analytical — Assumptions & Conclusions

> **All clerks in the office who passed the exam were promoted. Maricel was promoted. Therefore, Maricel passed the exam.**
> **The reasoning is flawed because ______.**
> A. Maricel may not be a clerk
> B. being promoted does not necessarily mean passing the exam
> C. the premise about clerks is false
> D. some clerks were not promoted
> **Answer: B.** The argument affirms the consequent: promotion could have other causes. *Tip: "All P are Q; X is Q; therefore X is P" is always invalid.*

### Analytical — Logic

> **If it rains, the field trip is cancelled. The field trip was not cancelled. Therefore, ______.**
> A. it rained  B. it did not rain  C. the trip was rescheduled  D. it may have rained
> **Answer: B.** Contrapositive: valid. *Tip: "If P then Q" gives you "not Q → not P" — never "Q → P."*

> **All A are B. Some B are C. Therefore, some A are C.**
> **This conclusion is ______.**
> A. valid  B. invalid  C. true by definition  D. a tautology
> **Answer: B.** The C's that are B may all be outside A. *Tip: draw the circles.*

### Analytical — Data Interpretation

> **Transactions handled by three offices:**
>
> | Office | Monday | Tuesday |
> |---|---|---|
> | A | 120 | 150 |
> | B | 90 | 110 |
> | C | 140 | 100 |
>
> **Approximately what percent of Tuesday's total transactions came from Office A?**
> A. 40%  B. 42%  C. 45%  D. 48%
> **Answer: B.** Tuesday total = 360; 150/360 ≈ 41.7% ≈ 42%. *Tip: read the column the question asks about — Monday is a decoy.*

### Clerical — Filing / Alphabetizing

> **Arrange these names in the order they would be filed:**
> 1. Del Rosario, Maria  2. Dela Cruz, Juan  3. De Leon, Ana  4. Dela Peña, Rico
> A. 2-4-3-1  B. 2-3-4-1  C. 3-2-4-1  D. 4-2-3-1
> **Answer: A.** Ignore spaces: DELACRUZ < DELAPENA < DELEON < DELROSARIO. *Tip: file letter by letter, ignoring spaces and punctuation; "nothing before something."*

### Clerical — Spelling

> **Which word is spelled correctly?**
> A. accomodate  B. accommodate  C. acommodate  D. accommadate
> **Answer: B.** Two c's, two m's. *Tip: "accommodate" is big enough to accommodate two of each.*

### General Information — Constitution

> **The Bill of Rights is found in which article of the 1987 Constitution?**
> A. Article II  B. Article III  C. Article VI  D. Article XIII
> **Answer: B.** *Tip: II = principles, III = rights, VI = legislative, XIII = social justice and human rights.*

> **Which body is constitutionally mandated to investigate human rights violations involving civil and political rights?**
> A. Commission on Audit  B. Ombudsman  C. Commission on Human Rights  D. Sandiganbayan
> **Answer: C.** Article XIII, Sections 17–18.

### General Information — RA 6713

> **Under RA 6713, within how many working days must a public official respond to a letter or request from the public?**
> A. 5  B. 10  C. 15  D. 30
> **Answer: C.** *Tip: 15 working days to reply; 30 days to divest; SALN by April 30.*

### General Information — Environment

> **RA 9003 is also known as the ______.**
> A. Clean Air Act  B. Ecological Solid Waste Management Act  C. Clean Water Act  D. Wildlife Resources Conservation Act
> **Answer: B.** *Tip: 8749 air, 9003 waste, 9275 water, 9147 wildlife.*

---

## 5. Tips & Tricks library

Each article: a 1-line rule, a worked example, and 2–4 "traps." Target 250–400 words. Slug per topic.

### 5.1 Test-taking strategy (applies to all sections)

1. **67 seconds per item.** Professional: 150 items / 170 min. If an item passes 90 seconds, mark it and move.
2. **Three-pass method.** Pass 1: answer everything you know instantly. Pass 2: the ones needing computation. Pass 3: guesses. Never let a hard item eat three easy ones.
3. **No penalty for wrong answers.** CSC does not subtract for incorrect responses — **leave nothing blank.**
4. **Eliminate two, then choose.** A 50/50 guess is worth far more than a blank.
5. **Checkpoints.** After 1 hour you should be near item 55; after 2 hours, item 110. If you're behind, speed up — don't skip the easy tail.
6. **Answer in the booklet first, then transfer in blocks of 10.** Prevents one-item-one-bubble drift errors.
7. **Bubble check every 25 items.** Misalignment is the most common silent disaster.
8. **If two choices look right, one is usually too extreme.** "Always," "never," "all" are usually wrong in verbal and GenInfo.
9. **Do the section you're strongest in first?** No — follow the booklet order. Section timers in the real exam are not per-section; losing your place costs more than the morale boost.
10. **The last 10 minutes are for transfers and blanks, not new computation.**

### 5.2 Verbal

**Vocabulary**
- Cover the choices, read the sentence, insert your own word, then match.
- Look for contrast signals: *but, although, however, despite* → the blank is the opposite of the clue.
- Look for cause/effect: *because, therefore, as a result* → the blank continues the logic.
- Learn roots: *bene* (good), *mal* (bad), *cred* (believe), *dict* (say), *spec* (look), *aud* (hear), *therm* (heat), *chron* (time).
- **Trap:** picking the most familiar word instead of the one that fits the sentence's tone.

**Grammar**
- Cross out prepositional phrases before checking subject–verb agreement.
- *Each, every, either, neither, everyone, somebody, nobody* → singular.
- *Neither…nor / either…or* → verb agrees with the nearer subject.
- *The number* → singular; *a number of* → plural.
- Collective nouns (*committee, staff, team*) → singular when acting as one body.
- *One of the + plural noun + singular verb*: "One of the clerks **is** absent."
- *Fewer* for countable, *less* for mass: fewer items, less time.
- *Who* = subject, *whom* = object (test with he/him).
- *Lie/lay*: lie (recline, no object), lay (put something down).
- Keep parallel structure: "reading, writing, and **speaking**" — not "to speak."
- **Trap:** long introductory phrases that hide a misplaced modifier.

**Analogy**
- Build a bridge sentence: "A thermometer *measures* temperature."
- Check the direction: *cat : kitten :: dog : puppy* (adult → young), not the reverse.
- Common relationships: synonym, antonym, part–whole, category–member, function, cause–effect, degree, worker–tool.
- **Trap:** a pair that shares a topic but not the relationship.

**Paragraph organization**
- Find the topic sentence (usually first, sometimes last).
- Transition words are the skeleton: *first, next, then, finally, however, therefore*.
- Pronouns (*this, these, it*) must point backward — the noun comes first.
- **Trap:** chronological vs. logical order (general → specific).

**Reading comprehension**
- Read the questions first, then the passage — you'll know what to hunt for.
- Answer only from the text. Outside knowledge is a distractor.
- Watch for **EXCEPT / NOT / LEAST** — the most-missed instruction words.
- Main idea ≠ first sentence. Check what the whole passage is doing.
- **Trap:** a choice that is true in real life but not stated in the passage.

### 5.3 Numerical

- **Estimate first.** If choices are far apart, round and pick — don't compute exactly.
- **Backsolve.** Plug choices into the question; start with B or C.
- "Of" = multiply, "is" = equals, "per" = divide.
- Percent change = change ÷ **original**.
- Percent increase then decrease of the same rate never returns to the start.
- Ratio: add the parts, find one part, multiply.
- Average: convert to total (sum = average × count).
- Work: rates add (1/a + 1/b = 1/t); never average the times.
- Speed: d = rt. Watch units (minutes vs. hours, meters vs. km).
- Simple interest: I = Prt. Discount: pay (100% − d).
- Divisibility: 3 (digit sum), 4 (last 2 digits), 6 (2 and 3), 8 (last 3), 9 (digit sum), 11 (alternating sum).
- Memorize: 1/8 = 12.5%, 1/6 ≈ 16.7%, 1/3 ≈ 33.3%, 3/8 = 37.5%, 5/8 = 62.5%, 7/8 = 87.5%.
- **Trap:** answering the wrong quantity ("how many female" vs. "how many male").

**Number series decision tree**
1. Differences constant? → arithmetic.
2. Ratios constant? → geometric.
3. Differences grow by a constant? → second difference / squares.
4. Alternating (two interleaved series)? → check odd/even positions.
5. Familiar sets? → primes, squares (1,4,9,16), cubes, Fibonacci, factorials.
6. Digits? → digit sum, reverse, product.
7. **Trap:** assuming +4 forever when the jump is +2, +4, +6, +8.

### 5.4 Analytical

- **Word association:** name the category in 3 words, then find the exception. Watch for "all but one are X."
- **Assumptions:** an assumption is unstated but *necessary*. Negate it — if the argument collapses, it's the assumption.
- **Conclusions:** must follow from the premises alone, not from what's probably true.
- **"All P are Q; X is Q; therefore X is P"** → invalid (affirming the consequent).
- **"All P are Q; X is P; therefore X is Q"** → valid.
- **"If P then Q"** gives **"not Q → not P."** It never gives "Q → P."
- **Some/all traps:** "Some B are C" says nothing about whether any A is C.
- **Data interpretation:** read the title, units, and axis labels before the question. Compute only the asked value. Use rough percentages.
- **Trap:** Monday data in a Tuesday question; "percent of total" vs. "percent more than."

### 5.5 Clerical

**Filing / alphabetizing**
- File letter by letter, ignoring spaces, hyphens, and punctuation.
- "Nothing before something": *Mabini* comes before *Mabini, Jr.*
- Treat *Mc* and *Mac* as if spelled *Mac* (McDonald before Macaraeg? — follow the letter-by-letter rule your item states; be consistent).
- Names: last name first, then first name, then middle initial.
- Numbers file before letters; numerals in numerical order.
- **Trap:** "Dela Cruz" vs. "De Leon" — compare letter 3: **A** before **E**.

**Spelling** — drill these 40:
*accommodate, acquaintance, apparent, bureaucracy, cemetery, committee, consensus, definitely, embarrass, entrepreneur, exaggerate, existence, harassment, immediately, incidentally, indispensable, liaison, maintenance, millennium, necessary, noticeable, occasion, occurrence, parallel, perseverance, Philippines, possession, privilege, questionnaire, receive, recommend, restaurant, rhythm, schedule, separate, sincerely, succeed, tomorrow, vacillate, withhold*

**Comparing / coding**
- Compare character by character, left to right, and stop at the first difference.
- For codes, write the shift (+1, −2) above each letter.
- **Trap:** visually similar strings (6713 vs. 6173, O vs. 0, I vs. l).

### 5.6 General Information

**1987 Constitution — must-knows**
- Ratified: **February 2, 1987** plebiscite. 18 articles.
- **Art. II** Declaration of Principles and State Policies · **Art. III** Bill of Rights · **Art. VI** Legislative · **Art. VII** Executive · **Art. VIII** Judicial · **Art. IX** Constitutional Commissions (CSC, COMELEC, COA) · **Art. X** Local Government · **Art. XI** Accountability of Public Officers · **Art. XIII** Social Justice & Human Rights (CHR) · **Art. XIV** Education.
- Senate: 24 members, 6 years, max 2 consecutive terms. House: 3 years, max 3 consecutive terms.
- President: natural-born, 40+, resident 10 years, 6-year single term. VP: 6 years, max 2 consecutive.
- Supreme Court: Chief Justice + 14, mandatory retirement at 70.
- Bill of Rights essentials: due process, equal protection, unreasonable searches, right to counsel, speedy trial, bail, double jeopardy, free speech/press, religious freedom, right to information.
- **Trap:** "Article XII" (National Economy) vs. "Article XIII" (Social Justice and Human Rights).

**RA 6713 — Code of Conduct and Ethical Standards**
- **8 norms:** commitment to public interest; professionalism; justness and sincerity; political neutrality; responsiveness to the public; nationalism and patriotism; commitment to democracy; simple living.
- Reply to public letters/requests within **15 working days**.
- File **SALN** within 30 days of assuming office, **by April 30** every year, and within 30 days after leaving.
- Divest conflicting interests within **30 days**.
- Prohibited: soliciting/accepting gifts, outside employment that conflicts, recommending anyone to a position, disclosing confidential information, using office for private gain.
- **Trap:** "15 calendar days" — it's working days.

**Peace & Human Rights**
- **UDHR**: adopted **December 10, 1948** (Human Rights Day).
- **CHR**: created by the 1987 Constitution, Art. XIII, Sec. 17–18.
- **Geneva Conventions (1949)**: humanitarian law; **RA 9851** penalizes crimes against IHL, genocide, and crimes against humanity.
- **RA 10368**: recognition and reparation for human rights victims under Martial Law.
- **Trap:** confusing the CHR (investigates civil/political rights violations) with the Ombudsman (public accountability).

**Environment**
- **RA 8749** Clean Air Act (1999) · **RA 9003** Ecological Solid Waste Management Act (2000) · **RA 9275** Clean Water Act (2004) · **RA 9147** Wildlife Resources Conservation and Protection Act (2001) · **RA 7586** NIPAS (1992, expanded by RA 11038 in 2018) · **PD 705** Revised Forestry Code · **RA 9729** Climate Change Act (2009) · **RA 6969** Toxic Substances and Hazardous Wastes.
- **4Rs**: reduce, reuse, recycle, recover. Waste hierarchy: avoid > reduce > reuse > recycle > recover > dispose.
- **Montreal Protocol (1987)** ozone-depleting substances · **Kyoto Protocol (1997)** · **Paris Agreement (2015)**.
- DENR is the primary agency; EMB enforces air/water/waste laws.
- **Trap:** matching 9003 (waste) with "Clean Water" because both mention cleanliness.

### 5.7 Exam-day checklist

> Verify every item against your own **Notice of Examination** — CSC changes logistics per batch.

- Bring: Notice of Examination, valid government ID, **two black ballpens**, No. 2 pencils, eraser, sharpener, transparent water bottle.
- No phones, smartwatches, calculators, or notes. Gates close **7:30 a.m.** — late examinees are not admitted.
- Eat a real breakfast; the Professional exam runs 3 hours 10 minutes with no extended break.
- Wear comfortable clothes; bring a jacket if the room is air-conditioned.
- Do a 10-item warm-up the night before — not a full mock. Confidence beats cramming.
- Sleep 7–8 hours. Recall drops sharply below 6.

---

## 6. Formula sheet (in-app "Cheat Sheet" screen)

```
PERCENT
  part = rate × base          rate = part ÷ base
  % change = (new − old) ÷ old × 100
  % increase then decrease of same r → net loss of r²

RATIO & PROPORTION
  a:b with total T → one part = T ÷ (a + b)

AVERAGE
  sum = average × count
  new average = (old sum − removed) ÷ (count − 1)

WORK
  1/a + 1/b = 1/t

SPEED
  d = r × t      average speed = total distance ÷ total time

INTEREST
  simple: I = P × r × t
  discount price = original × (1 − d)

GEOMETRY
  rectangle: A = lw, P = 2(l + w)
  triangle: A = ½bh
  circle: A = πr², C = 2πr
  cube: V = s³        cylinder: V = πr²h

FRACTION ↔ PERCENT
  1/8 = 12.5%   1/6 ≈ 16.67%   1/5 = 20%   1/4 = 25%
  1/3 ≈ 33.33%  3/8 = 37.5%    2/5 = 40%   1/2 = 50%
  5/8 = 62.5%   2/3 ≈ 66.67%   3/4 = 75%   7/8 = 87.5%

DIVISIBILITY
  3 → digit sum ÷ 3        4 → last 2 digits ÷ 4
  6 → divisible by 2 and 3 8 → last 3 digits ÷ 8
  9 → digit sum ÷ 9        11 → alternating digit sum ÷ 11
```

---

## 7. Study plans

### 30-day plan (2 hours/day)

| Week | Focus | Daily |
|---|---|---|
| 1 | Diagnostic + Verbal | 20 vocab/grammar items + 1 tip article |
| 2 | Numerical | 20 word problems + 10 number series |
| 3 | Analytical / Clerical + GenInfo | 20 analytical or clerical + 10 GenInfo |
| 4 | Full mocks + error log | Mock every other day, review every mistake |

**Daily template:** 10-item warm-up (weakest topic) → 20-item focused set → 10-item mixed set → review error log (10 min).

### 60-day plan

- Days 1–10 Verbal · 11–25 Numerical · 26–35 Analytical/Clerical · 36–45 GenInfo · 46–55 mixed sets · 56–60 three full mocks + review.
- One full mock every Sunday from day 21.
- Error log review is non-negotiable: 15 minutes, every day.

### The Error Log method (teach this in-app)

For every wrong answer, tag it:
1. **Concept gap** — didn't know the rule.
2. **Careless** — knew it, misread.
3. **Time pressure** — rushed.
4. **Guess** — no idea.

Then: concept gaps → study the tip article; careless → slow down 5 seconds and underline the question; time pressure → speed drills; guesses → re-learn the topic from scratch. Re-drill all four categories after 48 hours.

---

## 8. Content QA checklist (per batch)

- [ ] Every item has exactly 4 choices and 1 defensible answer
- [ ] Answer letters balanced (~25% each)
- [ ] No duplicate or near-duplicate stems
- [ ] Explanation ≤ 60 words and states the rule
- [ ] Difficulty tagged and roughly 30/50/20
- [ ] Numeric answers verified by a second method
- [ ] Law citations still current (`reviewedAt` within 12 months)
- [ ] No calculator-only items
- [ ] 20 random items playtested on-device
- [ ] `contentVersion` bumped
