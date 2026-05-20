# Meal Match AI

Live at [meal-match.app](https://www.meal-match.app)

Generates personalised 7-day meal plans, grocery lists, and workout routines based on your budget, dietary preferences, and cuisine style. Uses the Gemini API to build the plan and returns everything in under a minute. Supports English, Romanian, Spanish, and Italian recipes with accurate GBP pricing.

New users get a 3-day free trial. After that it's a one-time £30 payment via Stripe.

**Stack:** React, Tailwind CSS, Node.js, Express, MongoDB, Google Gemini API, Stripe

---

## Running locally

You'll need Node 18+, a MongoDB instance, and API keys for Gemini and Stripe.

```bash
# backend
cd backend
npm install
cp .env.example .env
node server.js

# frontend
cd frontend
npm install
npm run dev
```

Copy `backend/.env.example` to `backend/.env` and fill in your keys:

```
PORT=5000
MONGO_URI=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.
