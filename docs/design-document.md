# GrindBoard — Design Document

## Project Description

GrindBoard is a web application that helps CS students organize and track their technical interview preparation. Students often solve hundreds of LeetCode-style problems but lose track of which topics they're weak in, which companies asked what, and how their speed improves over time.

GrindBoard lets users:

- Build a personal question bank tagged by company, topic, and difficulty
- Log each practice attempt with time spent, result (solved/unsolved/partial), and notes
- View summary stats and per-topic breakdowns to identify weak areas

Unlike bookmarking problems on LeetCode, this tool focuses on **self-assessment and deliberate practice** by surfacing weak areas and tracking improvement across attempts.

---

## User Personas

### Kevin — Job-Hunting Senior

Kevin is a senior CS student preparing for technical interviews at FAANG companies. He has a target list of companies and needs to focus his practice on their most frequently asked topics. Kevin solves 3–5 problems per day and wants to track his solve rate and average time by topic so he can prioritize weak areas in the weeks leading up to his interviews.

**Goals:**

- Focus practice on company-specific questions
- Track improvement in speed and accuracy
- Identify weak topics before interviews

**Pain points:**

- Loses track of which problems he's already solved
- Can't easily filter his question bank by company
- No way to see progress over time on LeetCode alone

---

### Mei — Early Planner

Mei is a sophomore who started interview prep early. She wants to build a question bank gradually over months, adding problems as she encounters them in class or study groups. She practices a few times a week and wants to see her long-term progress.

**Goals:**

- Build a question bank over time
- Track attempts and notes for review sessions
- See which topics she's improving on

**Pain points:**

- Bookmarks scattered across browsers and spreadsheets
- Forgets which approach she used on past attempts
- Hard to see trends in her progress

---

## User Stories

### Question Bank Management (Qingdong Gong)

1. **As Kevin**, I want to add a question with title, link, company tags, topic, and difficulty, so I can build a personal problem bank.

2. **As Mei**, I want to browse and filter questions by company, topic, or difficulty, so I can focus my study on weak areas.

3. **As Kevin**, I want to edit question details, so I can update tags as I learn which companies ask them.

4. **As Mei**, I want to delete questions I no longer find relevant, so my bank stays focused.

### Practice Session Tracking (Alexander Sholla)

5. **As Kevin**, I want to log a practice attempt for a question with time spent, result (solved/unsolved/partial), and notes, so I can track each attempt.

6. **As Mei**, I want to view all my practice sessions for a specific question, so I can see if I'm improving.

7. **As Kevin**, I want to edit or delete a practice log, so I can fix mistakes in my records.

8. **As Mei**, I want to see summary stats (total sessions, average time by topic, solve rate), so I can identify weak areas to focus on.

---

## Design Mockups

### Main View — Question Bank

```
┌──────────────────────────────────────────────────────┐
│  GrindBoard              [Questions] [Sessions] [Stats] │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Question Bank                          [+ Add Question]│
│                                                        │
│  ┌─ Filters ────────────────────────────────────────┐ │
│  │ [All Difficulties ▾] [Topic...] [Company...] [Go]│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─ Two Sum ──────────────────────────── Easy ──────┐ │
│  │  Topics: Array, Hash Table                        │ │
│  │  Companies: Google, Amazon, Meta                  │ │
│  │  [History] [Log Attempt] [Edit] [Delete]          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─ Merge Intervals ─────────────────── Med ────────┐ │
│  │  Topics: Array, Sorting                           │ │
│  │  Companies: Facebook, Microsoft                   │ │
│  │  [History] [Log Attempt] [Edit] [Delete]          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Add/Edit Question Form

```
┌──────────────────────────────────────────────────────┐
│  GrindBoard              [Questions] [Sessions] [Stats] │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Add New Question                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Title:       [Two Sum                          ] │ │
│  │  Link:        [https://leetcode.com/problems/...] │ │
│  │  Companies:   [Google, Amazon                   ] │ │
│  │  Topics:      [Array, Hash Table                ] │ │
│  │  Difficulty:  [Med ▾]                             │ │
│  │                                                    │ │
│  │                          [Save Question] [Cancel]  │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Sessions List

```
┌──────────────────────────────────────────────────────┐
│  GrindBoard              [Questions] [Sessions] [Stats] │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Practice Sessions                      [+ Log Attempt] │
│                                                        │
│  ┌─────────┬──────────────┬──────┬─────────┬────────┐ │
│  │ Date    │ Question     │ Time │ Result  │ Actions│ │
│  ├─────────┼──────────────┼──────┼─────────┼────────┤ │
│  │ Feb 15  │ Two Sum Easy │ 12m  │ Solved  │ E | D  │ │
│  │ Feb 14  │ Merge   Med  │ 35m  │ Partial │ E | D  │ │
│  │ Feb 13  │ LRU     Hard │ 45m  │ Unsolvd │ E | D  │ │
│  └─────────┴──────────────┴──────┴─────────┴────────┘ │
└──────────────────────────────────────────────────────┘
```

### Stats Dashboard

```
┌──────────────────────────────────────────────────────┐
│  GrindBoard              [Questions] [Sessions] [Stats] │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Practice Stats                                        │
│                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   142    │ │    98    │ │    44    │ │  23 min  │ │
│  │ Sessions │ │  Solved  │ │ Unsolved │ │ Avg Time │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                        │
│  By Topic                                              │
│  ┌────────────┬──────┬────────┬──────────┬──────────┐ │
│  │ Topic      │ Sess │ Solved │ Rate     │ Avg Time │ │
│  ├────────────┼──────┼────────┼──────────┼──────────┤ │
│  │ Array      │  35  │   28   │   80%    │  18 min  │ │
│  │ Trees      │  22  │   14   │   64%    │  28 min  │ │
│  │ DP         │  18  │    8   │   44%    │  35 min  │ │
│  └────────────┴──────┴────────┴──────────┴──────────┘ │
└──────────────────────────────────────────────────────┘
```
