# 🧠 Proompter — AI Prompt Evaluation & Optimization Platform

**Built with Next.js, Supabase, Python, Opik, and LiteLLM**

---

## 🚀 The Problem

AI teams waste hours manually evaluating prompt quality. Without structure, iteration becomes guesswork. Metrics are inconsistent. Collaboration is messy. And scaling tests? Painful.

---

## 🧩 The Solution — Proompter

**Proompter** is a full-stack platform that **automates** prompt evaluation and **accelerates** prompt engineering workflows.

It enables teams to:
- Instantly **score prompts** across multiple metrics (e.g., hallucination, CTA strength)
- **Compare and optimize** prompt sets using A/B testing and iterative loops
- **Collaborate as a team**, track results, and make data-driven prompt decisions

This tool is built for **quick hackathons**, **startup scale**, and **production extensibility**.

---

## 🛠️ Tech Stack

| Layer          | Tech Used                            |
| -------------- | ------------------------------------ |
| Frontend       | Next.js (App Router), React, TailwindCSS, Framer Motion, ShadCN, Three.js |
| Backend        | Next.js API Routes, Python (Opik, LiteLLM), Supabase Functions |
| Evaluation     | Python scripts with modular metric engine (hallucination, CTA, etc.) |
| Auth & DB      | Supabase Auth + Postgres (Row-level security, Team-based ACL) |
| Notifications  | Email + Telegram (optional) |
| Hosting        | Vercel (frontend) + Supabase (backend + DB) |

---

## ✨ Key Features

- ✅ **Automated Multi-Metric Evaluation** (relevance, hallucination, emotional tone, CTA strength)
- ⚙️ **Prompt Optimization Engine** (run batch A/B tests and auto-select best performers)
- 👥 **Team Collaboration** (invite teammates, view shared results, assign experiments)
- 📊 **Live Dashboard** (real-time metrics, history, experiments)
- 📦 **Chunked Processing** (scale across hundreds of prompts)
- 🔌 **Extensible Python Metric System** (add custom prompt evaluators in seconds)
- 🔐 **Secure Auth** with Email + Google OAuth

---

## 🧠 How It Works

1. **Sign Up & Log In**
2. **Create an Experiment**  
   Input task description and a set of prompt candidates.
3. **Automated Evaluation**  
   Prompts are sent to a Python backend via chunked requests.  
   Opik + LiteLLM score prompts across multiple dimensions.
4. **Get Results**  
   Top-performing prompts are auto-highlighted with visual scoring.
5. **Optimize & Share**  
   Run A/B tests or iterative experiments. Invite your team and share results.

---

## 📐 Architecture

```mermaid
graph TD
  A[User] -->|Web UI| B[Next.js Frontend]
  B -->|API Calls| C[API Routes (Next.js)]
  C -->|Prompts| D[Python Evaluator (Opik, LiteLLM)]
  D -->|Scores| C
  C -->|Results| B
  B -->|Client SDK| E[Supabase DB]
  C -->|Supabase Server SDK| E
  C -->|Notify| F[Telegram / Email]
