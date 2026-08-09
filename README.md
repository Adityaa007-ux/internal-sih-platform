# SIH Navigator

JGI-SIH — MASTER PROTOTYPE GENERATION PROMPT

I have uploaded the complete project documentation for my JSPM Group Internal Smart India Hackathon (JGI-SIH) Portal.

IMPORTANT — READ THE DOCUMENT FIRST

Before generating any UI or code, read and understand the entire uploaded documentation carefully.

The uploaded documentation is the primary source of truth for this project.

Extract and understand:

Project objective

Problem being solved

Target users

User roles

Complete workflow

AI modules

All planned features

Functional requirements

Dashboard requirements

Selection process

Technology architecture

Demo requirements

The focused features intended for the prototype

Do NOT ignore features because the project is a prototype.

Do NOT replace documented requirements with a generic college website.

Do NOT create only a landing page.

Build a small but highly functional, polished SaaS-style prototype that demonstrates the complete concept described in the documentation.

1. PRODUCT

Application name:

JSPM Group Internal SIH Portal

Short name:

JGI-SIH

Purpose:

A centralized internal platform for managing the JSPM Group's Internal Smart India Hackathon selection process.

The prototype should demonstrate how students can register teams, explore/select SIH problem statements, submit proposals, receive AI-powered analysis and similarity detection, and proceed through faculty review, shortlisting, offline presentation, and final selection.

2. CORE REQUIREMENT

Build a fully interactive prototype, not a static design.

The evaluator should be able to actually click through the major workflow.

The prototype must contain:

Working navigation

Working forms

Working buttons

Working modals/pages

Search

Filters

Tabs

Tables

Cards

Status indicators

Loading states

Success states

Error/empty states

AI-analysis simulations

Charts

Notifications

Chat assistant

Realistic sample data

No important button should silently do nothing.

If a real backend/API is not available, implement realistic local/demo logic.

Structure the application so the demo AI services can later be replaced with real APIs.

3. DESIGN DIRECTION

Create a premium modern SaaS dashboard.

Visual characteristics:

Professional

Clean

Modern

Academic + hackathon oriented

Trustworthy

Technology-focused

Responsive

Desktop-first

Mobile-friendly

Consistent typography

Rounded cards

Subtle shadows

Professional blue/indigo visual identity

Clean icons

Clear information hierarchy

Smooth transitions

Modern charts

Excellent spacing

Do not make it look like a generic AI website.

It should look like an actual institutional internal SIH management platform.

4. APPLICATION STRUCTURE

Create a proper application shell with:

Sidebar

Dashboard

Team Registration

My Team

Problem Explorer

Proposal Analyzer

Similarity Detection

AI Recommendations

AI Assistant

Submissions

Faculty Review

Shortlist

Presentation

Results

Analytics

Announcements

Settings

Use role-based navigation where appropriate.

Create a professional top bar containing:

Global search

Notifications

User profile

Current role

Settings

5. ROLE-BASED EXPERIENCE

Implement conceptual role-based dashboards for:

Student

Register team

Manage team

Explore problems

Submit proposal

Run AI analysis

Run similarity analysis

Receive recommendations

Use AI assistant

Track selection status

Faculty

View submissions

Review proposals

See AI analysis

See similarity results

Score teams

Add comments

Shortlist teams

Manage presentation evaluation

Mentor

View assigned teams

Review proposals

Provide feedback

Track team progress

Admin

Manage users

Manage teams

Manage problems

Manage submissions

Manage faculty/mentors

Manage selection stages

Schedule presentations

Publish results

View analytics

Provide a simple Demo Role Switcher/Login so the team can quickly demonstrate different roles.

6. STUDENT DASHBOARD

Create a highly polished Student Dashboard.

Show:

Welcome message

Team name

Registration ID

Team status

Selected problem

Proposal status

AI analysis status

Similarity status

Current selection stage

Important announcements

Upcoming deadlines

Quick actions

Create a visual selection pipeline:

Registration → Problem Selection → Proposal Submission → AI Analysis → Faculty Review → Shortlist → Offline Presentation → Final Result

Clearly highlight the current stage.

7. TEAM REGISTRATION

Create a functional team-registration workflow.

Fields:

Team name

Team leader

Campus

Department

Contact information

Email

Team members

Selected problem statement

Allow adding/removing team members before submission.

On submission:

Validate fields

Show loading state

Show successful registration

Generate demo registration ID

Display team dashboard

Display registration status

Include the concept of locking team membership after final registration.

8. PROBLEM STATEMENT EXPLORER

Create a professional problem-statement explorer.

Each problem should contain:

Problem ID

Title

Description

Organization

Category

Theme

Difficulty

Tags

Add:

Search

Category filter

Theme filter

Difficulty filter

Sorting

Detailed problem view

Select problem action

Use realistic SIH-style demo problem statements.

9. AI PROBLEM RECOMMENDATION

Create an AI-powered recommendation feature.

Recommend problems based on:

Team skills

Technologies

Interests

Previous proposal

Selected categories

Each recommendation should display:

Problem

Match percentage

Reason

Difficulty

Relevant skills

Example:

92% Match

"Recommended because your team has strong AI/ML and full-stack development capabilities."

Make the recommendation interactive.

10. PROPOSAL SUBMISSION

Create a professional proposal submission form.

Fields should include:

Problem statement

Proposed solution

Innovation

Technical approach

Technology stack

Target users

Expected impact

Scalability

Implementation approach

Allow saving as draft.

Allow final submission.

Show:

Draft

Submitted

Under AI Analysis

Under Faculty Review

Shortlisted

Presentation

Selected/Not Selected

11. AI PROPOSAL ANALYZER

This is one of the most important modules.

Create a realistic AI analysis experience.

Button:

Analyze Proposal with AI

When clicked:

Show analysis/loading animation.

Display analysis progress.

Generate realistic demo results.

Show a comprehensive AI evaluation dashboard.

Display:

Overall Score

Problem Understanding

Innovation

Feasibility

Technical Strength

Impact

Scalability

Clarity

Use visual score cards/progress bars.

Also show:

AI Strengths

What is strong about the proposal.

AI Weaknesses

Potential problems.

AI Recommendations

Specific improvements.

Missing Information

What the team should add.

AI Summary

A concise evaluation of the proposal.

Make this look like an actual AI product.

12. AI SIMILARITY / DUPLICATE DETECTION

This is a critical feature.

Create a dedicated:

AI Similarity Detection

module.

The user should be able to run:

Run Similarity Analysis

Show an animated processing state.

Then display:

Similarity Score

Example:

82% Similarity

Show a clear risk classification:

Low

Moderate

High

Potential Duplicate

Display:

Most similar proposals

Similar problem statements

Matching concepts

Common keywords/concepts

Explanation of similarity

Risk warning

Example:

Potentially Similar Proposal — 82%

Show why the system considers them similar.

Include visual comparison cards.

The interface should clearly communicate that this helps faculty identify duplicate or highly similar ideas.

13. AI ASSISTANT / CHATBOT

Create a polished chatbot called:

JGI-SIH AI Assistant

It should appear as a floating assistant button.

Clicking it opens a modern chat interface.

The assistant should help students with:

Understanding problem statements

Improving proposals

Generating innovation ideas

Technical approach suggestions

SIH process questions

Similarity concerns

Submission guidance

Portal navigation

Selection process

General project guidance

Include:

User messages

AI messages

Typing animation

Suggested prompts

Send button

Enter-to-send

Clear chat

Conversation history during the session

Provide useful predefined demo responses so the chatbot works without an external API.

Structure it so a real AI API can be connected later.

14. FACULTY REVIEW

Create a Faculty Review dashboard.

Show submitted teams in a professional data table.

Columns:

Team

Problem

Proposal Score

Similarity Score

Risk

Faculty Score

Status

Action

Add:

Search

Filters

Sorting

Status filters

Opening a team should show:

Team information

Members

Problem statement

Full proposal

AI analysis

Similarity analysis

Faculty evaluation

Comments

Faculty evaluation categories:

Problem Understanding

Innovation

Feasibility

Technical Approach

Impact

Presentation Readiness

Allow faculty to enter scores and comments.

15. SHORTLISTING

Create a dedicated shortlist page.

Show ranked teams.

Use a conceptual combined evaluation based on:

AI proposal score

Similarity risk

Faculty evaluation

Display:

Rank

Team

Problem

AI Score

Faculty Score

Similarity Risk

Final Status

Statuses:

Under Review

Shortlisted

Not Shortlisted

Allow faculty/admin to update the status.

16. OFFLINE PRESENTATION

The final selection should NOT be represented as completely online.

The actual final selection happens through an offline faculty presentation.

Build the portal workflow up to and around this stage.

For shortlisted teams display:

Team

Presentation date

Time

Venue

Faculty panel

Presentation status

Faculty remarks

Allow admin to schedule presentations.

After the offline presentation, faculty can enter the final evaluation/result into the portal.

Clearly represent:

Offline Faculty Presentation → Final Evaluation → Result Publication

17. RESULTS

Create a professional Internal SIH Results page.

Admin/faculty can publish final results.

Display:

Selected teams

Problem statements

Final scores

Selection status

Use a polished result presentation suitable for sharing with students and faculty.

18. ANALYTICS

Create a professional Analytics Dashboard.

Show KPI cards:

Total Teams

Registered Teams

Submitted Proposals

AI Analyses

High Similarity Cases

Shortlisted Teams

Presentations

Selected Teams

Create charts for:

Teams by campus

Teams by department

Problem categories

Proposal score distribution

Similarity risk distribution

Selection funnel

Use realistic demo data.

19. ANNOUNCEMENTS

Create an announcement/notification system.

Examples:

Registration deadline

Proposal deadline

AI analysis completed

Faculty review started

Shortlist announced

Presentation schedule published

Final results announced

Display notifications in the dashboard and notification center.

20. GLOBAL SEARCH

Implement global search across:

Teams

Problems

Proposals

Users

Results

Search results should be interactive.

21. DEMO DATA

Do not leave the prototype empty.

Populate realistic demo data.

Create sample:

Students

Teams

Team members

Problems

Proposals

AI scores

Similarity scores

Faculty reviews

Shortlisted teams

Presentation schedules

Results

Announcements

Use Indian college/SIH-style data.

Clearly indicate that the data is demo/sample data.

22. COMPLETE DEMO FLOW

The most important demonstration should work like this:

Student

Login/Demo Role

↓

Dashboard

↓

Register Team

↓

Explore Problems

↓

Select Problem

↓

Submit Proposal

↓

Run AI Proposal Analysis

↓

View AI Score + Feedback

↓

Run Similarity Detection

↓

View Similarity Score + Matching Proposals

↓

View AI Recommendations

↓

Ask JGI-SIH AI Assistant

↓

Track Application Status

Faculty

Switch to Faculty Role

↓

Faculty Dashboard

↓

View Submitted Teams

↓

Open Proposal

↓

View AI Analysis

↓

View Similarity Analysis

↓

Evaluate Team

↓

Add Faculty Score/Comments

↓

Shortlist Team

↓

Schedule Offline Presentation

Final Stage

Offline Presentation

↓

Faculty enters final evaluation

↓

Admin publishes result

↓

Results Dashboard

↓

Analytics

This complete flow should be demonstrable without requiring a real backend.

23. AI ARCHITECTURE READINESS

The prototype should be designed so the demo AI logic can later be replaced with our real AI services.

The project may later connect to:

FastAPI

Python

Sentence Transformers

Embeddings

Similarity models

Gemini/LLM APIs

Vector search

Especially keep these modules modular:

Proposal Analyzer

Similarity Detection

Problem Recommendation

AI Assistant

For now, use realistic local/mock AI behavior so the prototype works immediately.

Do NOT expose fake API keys or require secret credentials.

24. TECHNICAL QUALITY

Use a clean modern frontend architecture.

Prefer:

React

Tailwind CSS

TypeScript where appropriate

Reusable components

Modular pages

Reusable UI components

Clean state management

Local demo data

Avoid unnecessary complexity.

The generated project must run successfully.

Fix compilation/runtime errors before considering the prototype complete.

25. RESPONSIVENESS

Make the application responsive for:

Desktop

Laptop

Tablet

Mobile

Desktop should receive the highest design priority because the prototype will primarily be demonstrated to faculty.

26. IMPORTANT UX REQUIREMENTS

Do not create dead-end screens.

Every major action should produce a visible response.

Examples:

Analyze Proposal
→ Loading
→ Results

Run Similarity
→ Processing
→ Similarity Results

Register Team
→ Validation
→ Success

Submit Proposal
→ Confirmation
→ Status update

Shortlist
→ Status update

Schedule Presentation
→ Confirmation

Publish Result
→ Result becomes visible

Ask AI
→ Chat response

Search
→ Filtered results

27. FINAL QUALITY BAR

The final result should feel like:

A real internal SIH management SaaS platform developed by a professional software team.

It should NOT feel like:

A simple college website

A static Figma mockup

A landing page

A collection of disconnected screens

A generic AI dashboard

It should demonstrate a clear product story:

Problem Submission → AI Evaluation → Similarity Detection → Faculty Review → Shortlisting → Offline Presentation → Final Selection

28. DOCUMENTATION PRIORITY

If anything in this prompt conflicts with the uploaded documentation:

Follow the uploaded documentation first.

Do not remove documented features.

If the documentation contains additional features that are not explicitly listed in this prompt, implement those features as well.

Use the documentation to determine the exact project scope, workflow, user roles, AI modules, technology requirements, and demo features.

29. BUILD ORDER

Build the prototype in this order:

Application shell/navigation

Role-based dashboards

Team registration

Problem explorer

Proposal submission

AI proposal analyzer

Similarity detection

AI recommendations

AI assistant

Faculty review

Shortlisting

Offline presentation

Results

Analytics

Announcements

Final polish and responsive design

After implementation, test the complete demo flow and fix any broken interactions.

FINAL INSTRUCTION

Read the uploaded documentation completely.

Then build the JGI-SIH prototype according to the documentation and the requirements above.

Prioritize:

FUNCTIONALITY > COMPLETE WORKFLOW > AI FEATURE DEMONSTRATION > UI POLISH > DECORATION

The final prototype must be immediately usable for a team demonstration and easy to share with my SIH team members.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jspm-internal-sih.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0046e05-ea70-4786-b072-c925f2c7599f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
