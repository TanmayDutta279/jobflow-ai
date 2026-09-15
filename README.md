# JobFlow AI

JobFlow AI is an AI-powered job search assistant that analyzes a user's resume, extracts relevant skills and job roles, and recommends matching job opportunities from multiple sources.

## Live Demo

https://jobflow-ai-srw6.netlify.app/

## Features

- Resume upload and PDF text extraction
- AI-powered resume analysis using Groq
- ATS score and resume insights
- Automatic skill and job-role extraction
- Resume-based job matching
- Real job listings from multiple job sources
- Match percentage and matched skills
- Direct application links
- Search links for platforms such as LinkedIn, Indeed, Naukri and Wellfound
- Responsive React interface
- Separate frontend and backend architecture

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- Multer
- PDF Parse
- Axios
- CORS
- Dotenv

### AI
- Groq API
- OpenAI-compatible API
- `openai/gpt-oss-20b`

### Deployment
- Netlify - Frontend
- Render - Backend
- GitHub - Source Control

## How It Works

```text
Resume PDF
    ↓
PDF Text Extraction
    ↓
Groq AI Resume Analysis
    ↓
Skills + Job Roles + ATS Insights
    ↓
Real Job Listings
    ↓
Local Semantic Matching
    ↓
Recommended Jobs + Apply Links
