# MarketPulse AI

**AI-Powered Real-Time Equity Intelligence Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-4A90D9)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Groq](https://img.shields.io/badge/Groq-LLaMA3.3-F97316)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)

MarketPulse AI transforms raw stock data into actionable intelligence. Instead of just showing price charts, it tells you **why** the price is moving, **what** the sentiment is across news and social media, and **what** risks or opportunities exist right now.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Live Multi-Ticker Dashboard** | Track up to 10 stocks in real-time via WebSocket with sparkline mini-charts |
| 2 | **AI Market Copilot** | Ask plain-English questions about the market — powered by Groq LLaMA-3.3-70b |
| 3 | **Sentiment Score Engine** | Scores 0-100 per ticker using NLP on news headlines from NewsAPI |
| 4 | **Anomaly Detector** | Flags volume spikes (>200% avg) and rapid price moves (>3% in 5 min) |
| 5 | **Competitor Comparison** | Radar chart comparing tickers across 5 dimensions |
| 6 | **Fear & Greed Meter** | Live gauge from sentiment, momentum, and volatility inputs |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 + TypeScript | Component framework |
| Vite | Build tool with HMR |
| TailwindCSS | Utility-first styling |
| Recharts | Sparklines, radar charts, gauges |
| Lucide React | Icons |
| Axios | API calls |

### Backend

| Technology | Purpose |
|------------|---------|
| Python FastAPI | REST + WebSocket server |
| yfinance | Yahoo Finance data |
| Groq SDK | LLaMA-3.3-70b inference |
| TextBlob | NLP sentiment scoring |
| SQLite | Historical price cache |
| Uvicorn | ASGI server |

### Data Sources

- **Yahoo Finance** — Real-time stock prices, historical data, company info
- **NewsAPI** — News headlines for sentiment analysis
- **Groq** — AI chat inference (LLaMA-3.3-70b)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- API keys: [Groq](https://console.groq.com) and [NewsAPI](https://newsapi.org)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/marketpulse-ai.git
cd marketpulse-ai

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Run Locally

```bash
# Terminal 1 — Backend (port 8000)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 and add a ticker like `TSLA` to get started.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Yahoo      │────▶│  FastAPI Server  │────▶│  React        │
│  Finance    │     │  (WebSocket +    │     │  Frontend     │
│  NewsAPI    │     │   REST APIs)     │     │  (Vite + TS)  │
│  Groq       │     │                  │     │               │
└─────────────┘     ├──────────────────┤     ├───────────────┤
                    │  SQLite Cache    │     │  Recharts     │
                    │  AI Service      │     │  TailwindCSS  │
                    │  Sentiment Eng   │     │  Lucide Icons │
                    └──────────────────┘     └───────────────┘
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| WS | `/ws/stocks` | Real-time stock data stream |
| GET | `/api/stock/{ticker}/history` | 30-day closing prices |
| GET | `/api/stock/{ticker}/info` | Company info (sector, market cap, PE) |
| GET | `/api/stock/{ticker}/sentiment` | Sentiment score + headlines |
| GET | `/api/tickers/compare?tickers=A,B` | Multi-ticker comparison data |
| POST | `/api/ai/chat` | AI market question |

---

## Screenshots

> *Dashboard with live multi-ticker cards, AI chat sidebar, sentiment panel, and Fear & Greed meter.*
>
> *Competitor comparison radar chart modal.*
>
> *AI Copilot answering market questions in real-time.*

---

## Contributing

PRs are welcome. Open an issue first to discuss changes.

---

## License

MIT
