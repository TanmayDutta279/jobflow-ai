# JobFlow AI

AI-powered resume analyzer and job matching app. Upload a PDF resume, get an ATS score, extracted skills, improvement suggestions, and role matches.

## Features

- PDF resume upload and text extraction
- ATS score and skill analysis
- AI-powered ATS scoring, resume analysis, and improvement recommendations
- AI-powered semantic job matching, ranking, missing-skill analysis, and job summaries
- AI-generated job-search queries for Indeed, LinkedIn, Naukri.com, and Wellfound
- No keyword-only or local fallback scoring: AI is required for analysis and matching
- Suggested roles and application links
- Responsive React dashboard with mock local authentication

## Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express
- Groq / OpenAI-compatible API
- `pdf-parse` for PDF extraction

## Run locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The API runs on `http://localhost:5000`.

AI analysis is required. Add your Groq key to `backend/.env`:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

### 2. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

For local development, Vite proxies `/api` to the backend automatically.

## Deployment

The project includes `render.yaml` for the Express backend and `netlify.toml` for the React frontend.

1. Deploy `backend` to Render.
2. Add `GROQ_API_KEY` and `FRONTEND_URL` in the Render environment variables.
3. Deploy `frontend` to Netlify.
4. Set `VITE_API_URL` to the deployed backend URL followed by `/api`.

## Author

Tanmay Dutta

## Job sources

JobFlow AI combines live listings from public job feeds (Arbeitnow, Remotive, Remote OK, and Jobicy) and generates resume-aware search links for Indeed, LinkedIn, Naukri.com, and Wellfound.

The four external sites are opened with a search query derived from the uploaded resume. This avoids scraping protected job pages and sends the user to the original site's current results and application flow. Direct job cards from those sites require their approved partner/API access rather than an unauthenticated public endpoint.


## AI usage
The demo uses AI primarily for the resume analysis/ATS profile. That profile is cached for 6 hours. Job matching and external job-site search links use the cached AI profile plus local ranking, so a Job Matcher click does not consume additional AI requests.
