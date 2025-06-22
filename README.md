# Proompter: AI Prompt Evaluation & Optimization Platform

## Overview

**Proompter** is a full-stack, hackathon-ready platform for evaluating, comparing, and optimizing AI prompts. It empowers teams and individuals to rapidly iterate on prompt engineering, leveraging automated, multi-metric evaluation and collaborative features. Proompter is built with Next.js (React), Supabase, and Python (Opik, LiteLLM), and is designed for extensibility, scalability, and a beautiful user experience.

---

## Table of Contents
- [Features](#features)
- [How It Works](#how-it-works)
- [Why Proompter?](#why-proompter)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Extending Proompter](#extending-proompter)
- [Team & Collaboration](#team--collaboration)
- [License](#license)

---

## Features
- **Prompt Evaluation:** Submit multiple prompts and receive automated, multi-metric scoring (relevance, hallucination, emotional tone, call-to-action).
- **Prompt Optimization:** Batch and iterative optimization flows, including A/B testing and best-prompt selection.
- **Team Collaboration:** Invite teammates, share experiments, and receive notifications (email, Telegram).
- **Modern Dashboard:** Track experiments, prompt history, and team activity with real-time metrics.
- **Chunked Processing:** Handles large prompt sets efficiently, avoiding browser/server request limits.
- **Custom Metrics:** Easily extend with your own Python evaluation metrics.
- **Authentication:** Secure sign-up/sign-in with email confirmation and Google OAuth.
- **Beautiful UI:** Built with Tailwind, Framer Motion, and custom components for a delightful user experience.

---

## How It Works
1. **Sign Up & Confirm Email:** Users register and confirm their email for secure access.
2. **Create Experiments:** Users submit one or more prompts, describe the task, and (optionally) the expected output.
3. **Automated Evaluation:** Prompts are chunked and sent to the backend, where a Python script (using Opik and LiteLLM) evaluates each prompt on multiple metrics.
4. **Results & Optimization:** Scores are returned, best prompts are highlighted, and users can iterate or run further optimizations (A/B tests, etc.).
5. **Team Collaboration:** Users can join teams, share results, and receive notifications.

---

## Why Proompter?
- **Speed:** Instantly compare dozens of prompt variants with automated, multi-metric scoring.
- **Objectivity:** Uses both standard and custom metrics (relevance, hallucination, emotional tone, CTA) for robust evaluation.
- **Collaboration:** Built for teams—share, compare, and optimize together.
- **Scalability:** Handles large prompt sets with chunked processing and efficient backend scripts.
- **Extensibility:** Add your own metrics or evaluation logic in Python with minimal friction.
- **User Experience:** Modern, responsive UI with real-time feedback and beautiful design.

---

## Architecture

```mermaid
graph TD
  A[User] -->|Web UI| B[Next.js Frontend]
  B -->|API Calls| C[Next.js API Routes]
  C -->|Prompt Data| D[Python Scripts (Opik, LiteLLM)]
  D -->|Scores| C
  C -->|Results| B
  B -->|Supabase Client| E[Supabase DB]
  C -->|Supabase Server| E
  C -->|Notifications| F[Telegram/Email]
```

---

## Key Components

### Frontend (Next.js/React)
- **Dashboard:** Metrics, recent experiments, quick actions.
- **Experiment Submission:** Multi-prompt input, chunked API calls, results display.
- **AuthForm:** Sign up/in, Google OAuth, email confirmation popup.
- **Team Management:** Create/join teams, view team experiments.

### Backend (API & Python)
- **API Routes:** `/api/optimize`, `/api/optimization-runs`, `/api/run`, etc.
- **Python Scripts:** `scripts/optimize.py` (core evaluation), custom metrics in `scripts/metrics/`.
- **Chunked Processing:** Both client and server handle prompt chunking for large-scale evaluation.

### Database (Supabase)
- **Tables:** Users, prompt_history, optimization_runs, teams, etc.
- **Auth:** Secure, scalable authentication and team management.

---

## API Endpoints

- **POST `/api/optimize`**  
  Evaluate a batch of prompts. Handles chunked requests, returns scores for each prompt and highlights the best.
- **POST `/api/optimization-runs`**  
  (If enabled) Start or manage an optimization run (multi-step, iterative).
- **POST `/api/run`**  
  (If enabled) Run a single experiment or test.
- **Other endpoints** for team management, history, etc.

---

## Setup & Installation

### Prerequisites
- Node.js (18+)
- Python (3.9+)
- Supabase project (or use the provided SQL migrations)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/proompter.git
cd proompter
npm install
pip install -r requirements.txt
```

### 2. Configure Environment
- Set up your Supabase project and copy the credentials to `.env`.
- Add your OpenAI or other LLM API keys to `.env`.

### 3. Run the App

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Extending Proompter
- **Add Custom Metrics:** Drop new Python scripts in `scripts/metrics/` and import them in `optimize.py`.
- **UI Components:** Use the `components/ui/` library for rapid UI development.
- **API Routes:** Add new endpoints in `app/api/` as needed.

---

## Team & Collaboration
- **Invite teammates** via the dashboard.
- **Share experiments** and results.
- **Receive notifications** via email and (optionally) Telegram.

---

## License

MIT (or specify your license here)

---

## Hackathon Pitch

**Proompter** is your team's secret weapon for prompt engineering.  
It automates the grind of prompt evaluation, lets you scale up your experiments, and brings your team together for rapid, data-driven iteration.  
With robust metrics, beautiful UX, and extensibility at its core, Proompter is the platform for the next generation of AI builders.
