import json
import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import config

from database import init_db, insert_price
from stock_service import get_stock_data, get_historical_data, get_ticker_info
from anomaly_service import check_anomaly
from ai_service import ask_market_question
from sentiment_service import fetch_news_sentiment

app = FastAPI(title="MarketPulse AI", version="1.0.0")

origins = [o.strip() for o in config.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()


@app.get("/")
def root():
    return {"status": "ok", "app": "MarketPulse AI"}


@app.get("/api/diag")
def diag():
    import traceback, requests
    result = {"vercel": os.environ.get("VERCEL")}
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1m&range=1d"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        r = requests.get(url, headers=headers, timeout=15)
        result["status"] = r.status_code
        result["has_data"] = "chart" in r.json()
    except Exception as e:
        result["error"] = traceback.format_exc()
    return result


@app.get("/api/stocks")
def get_stocks(tickers: str = Query(..., description="Comma-separated ticker symbols")):
    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    results = {}
    for ticker in ticker_list:
        stock = get_stock_data(ticker)
        if stock and "error" not in stock:
            insert_price(ticker, stock["price"], stock["volume"], stock["changePercent"])
            anomaly = check_anomaly(ticker, stock["price"], stock["volume"])
            if anomaly:
                stock["anomaly"] = anomaly
        results[ticker] = stock
    return results


@app.get("/api/stock/{ticker}/history")
def stock_history(ticker: str):
    data = get_historical_data(ticker)
    return {"ticker": ticker.upper(), "history": data}


@app.get("/api/stock/{ticker}/info")
def stock_info(ticker: str):
    return get_ticker_info(ticker)


@app.get("/api/stock/{ticker}/sentiment")
def stock_sentiment(ticker: str):
    return fetch_news_sentiment(ticker)


@app.get("/api/tickers/compare")
def compare_tickers(tickers: str = Query(..., description="Comma-separated ticker symbols")):
    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    results = {}
    for t in ticker_list:
        data = get_stock_data(t)
        if data and "error" not in data:
            info = get_ticker_info(t)
            history = get_historical_data(t)
            results[t.upper()] = {**data, "info": info, "history": history}
    return {"tickers": results}


@app.post("/api/ai/chat")
def ai_chat(body: dict):
    question = body.get("question", "")
    tickers = body.get("tickers", [])
    context = {}
    for t in tickers:
        data = get_stock_data(t)
        if data and "error" not in data:
            context[t] = data
    return ask_market_question(question, context)
