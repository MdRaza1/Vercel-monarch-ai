# MONARCH + Groq AI Chatbot

This project preserves the uploaded MONARCH HTML page and adds a floating, mobile-friendly Groq-powered chatbot. The Groq key is only read by the Vercel serverless function and is never embedded in browser HTML.

## Deploy to Vercel

1. Create a GitHub repository and upload the contents of this ZIP (the `public`, `api` folders and root config files).
2. In Vercel, import that GitHub repository.
3. In **Project → Settings → Environment Variables**, add:
   - `GROQ_API_KEY` = your actual Groq API key
   - `GROQ_MODEL` = `llama-3.3-70b-versatile` (optional; use a model available to your Groq account)
4. Apply the variables to Production (and Preview if needed), save, then redeploy.
5. Open the deployed website and tap the glowing ✦ button at the bottom-right.

## Local preview / testing

Requires Node.js 18+. Static HTML can be previewed, but `/api/chat` needs a Vercel-compatible runtime and environment variables. The easiest end-to-end test is a Vercel Preview deployment.

## Security notes

- Never put your real Groq key in `public/index.html`, client-side JavaScript, or a committed `.env` file.
- `.env.example` contains only a placeholder. Set the real secret in Vercel Environment Variables.
- The endpoint limits message count and message length, but it does not include a full public-user rate limiter. If the site becomes public or receives abuse, add rate limiting and usage monitoring before promoting it widely.
- Do not commit real secrets to GitHub.
