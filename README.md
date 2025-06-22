🧠 Proompter: Collaborative Prompt Evaluation & Optimization Platform
⚡ Supercharge your AI workflows. Automate prompt evaluation. Build better prompts—together.

🚀 Problem
Prompt engineering is slow, subjective, and non-collaborative.
Teams often guess which prompt performs best, without scalable tools to measure, compare, or optimize.

🎯 Solution: Proompter
Proompter is a full-stack AI prompt evaluation & optimization platform that lets individuals and teams:

🚀 Rapidly test, score, and compare prompts.

🧪 Run automated A/B tests with quantitative evaluation (relevance, hallucination, tone, etc.).

🤝 Collaborate in real-time with shared results, version history, and notifications.

Built with Next.js, Three.js, Python, Opik, LiteLLM, Supabase, and TailwindCSS, Proompter is designed to be hackathon-ready, dev-friendly, and scalable for production use.

🧩 Key Features
Feature	Description
🧪 Automated Prompt Evaluation	Evaluate multiple prompts at once using Python + Opik + LiteLLM.
📊 Multi-Metric Scoring	Assess prompts using relevance, hallucination, emotional tone, and CTA clarity.
🔁 Iterative Optimization	A/B test prompt variants and run multi-step optimization flows.
👥 Team Collaboration	Share experiments, invite teammates, and track history together.
📦 Chunked Processing	Efficiently handles large prompt sets (both frontend and backend).
✨ Modern UX	Beautiful UI with Framer Motion animations and Three.js visualizations.
🔧 Customizable	Drop in your own metrics or expand the system with your evaluation logic.

🛠️ Tech Stack
Layer	Stack
Frontend	Next.js · React · TailwindCSS · Framer Motion · Three.js
Backend	Next.js API Routes · Python (Opik + LiteLLM)
Auth & DB	Supabase (PostgreSQL + Auth + Realtime)
Infra & Hosting	Vercel (Frontend) · Supabase (Backend/Postgres)
AI Evaluation	LiteLLM wrapper for OpenAI & other LLMs · Opik for standardized prompt grading
Notifications	Telegram Bot · Email (via Supabase)

🧱 Codebase Structure
ruby
Copy
Edit
proompter/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes (e.g., /api/optimize)
│   └── dashboard/           # Authenticated dashboard views
├── components/              # Reusable UI components (Tailwind + Framer Motion)
├── lib/                     # Supabase client, auth utils, helpers
├── scripts/                 # Python backend for evaluation
│   ├── optimize.py          # Core evaluator
│   └── metrics/             # Pluggable custom metrics
├── supabase/                # SQL migrations, schema, Supabase config
├── public/                  # Static assets
├── .env.example             # Example environment variables
├── next.config.js           # Next.js config
├── tailwind.config.js       # TailwindCSS config
└── README.md                # This file
📈 How It Works
Register & Authenticate: Secure signup via email or Google OAuth.

Submit Prompt Experiments: Input multiple prompts and task context.

Automated Evaluation: Prompts are sent to a Python backend where Opik + LiteLLM analyze them across multiple metrics.

Chunking Engine: Both frontend and backend automatically split large prompt batches.

Results & Optimization: Scores are returned and ranked; users can launch A/B tests or iterate.

Team Sharing: Collaborators can view, comment, and get notified about prompt experiments.

🔌 Key API Endpoints
Endpoint	Method	Description
/api/optimize	POST	Evaluate a batch of prompts. Handles chunked requests, returns scores.
/api/optimization-runs	POST	Launch or continue a multi-step optimization session.
/api/run	POST	Run a single prompt test and get feedback.
auth/, teams/	Various	Handle authentication and team collaboration endpoints.

⚙️ Local Setup
✅ Requirements
Node.js 18+

Python 3.9+

Supabase project (setup or use provided migrations)

🧪 Quickstart
bash
Copy
Edit
git clone https://github.com/your-org/proompter.git
cd proompter
npm install
pip install -r requirements.txt
🔐 Environment Variables
Create .env from .env.example:

env
Copy
Edit
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
🚀 Run
bash
Copy
Edit
npm run dev  # launches frontend (Next.js)
Visit http://localhost:3000

🧩 Extending Proompter
Task	How
Add new evaluation metric	Add a file in scripts/metrics/, then import it in optimize.py.
Add UI views	Use the Tailwind + Framer-powered components in components/ui/.
Add API logic	Add a new handler under app/api/.
Add team logic	Extend teams, prompt_history, optimization_runs in Supabase.

👥 Team Collaboration
👨‍👩‍👧 Invite teammates

📊 Share and comment on experiments

🔔 Get notified by email or Telegram when results are ready

🏁 Hackathon Highlights
What We Solved	How
❌ Prompt engineering is subjective	✅ Used Opik to provide standardized scores for prompts
❌ No scalable way to evaluate at once	✅ Built chunking + batch API for massive prompt sets
❌ No team-based prompt iteration tools	✅ Added shared dashboards, history, and notifications
❌ Hard to define “best” prompt	✅ Built-in metrics + scoring engine + iterative optimizer

📜 License
MIT License – use freely, fork, and build upon it.

💬 Final Pitch
Proompter brings structure and scalability to the chaotic world of prompt engineering.
Instead of guessing, teams can now test, score, and optimize their prompts using robust AI metrics—fast.

With an extensible architecture, a real-time collaborative UI, and powerful evaluation logic, Proompter is built to empower the next generation of AI creators.

Would you like a deployment badge, demo link section, or images/gifs added? I can tailor it further for judges with visuals or a walkthrough section.
