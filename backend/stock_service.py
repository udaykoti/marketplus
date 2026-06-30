import requests
import pandas as pd

_HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"


def get_stock_data(ticker):
    try:
        params = {"interval": "1m", "range": "5d"}
        r = requests.get(_CHART_URL.format(ticker=ticker), params=params, headers=_HEADERS, timeout=15)
        r.raise_for_status()
        data = r.json()["chart"]["result"][0]
        meta = data["meta"]
        quotes = data["indicators"]["quote"][0]
        timestamps = data["timestamp"]

        closes = [c for c in quotes["close"] if c is not None]
        if not closes:
            return None

        current_price = round(closes[-1], 2)
        prev_close = round(closes[-2] if len(closes) > 1 else meta.get("chartPreviousClose", current_price), 2)
        change_percent = round(((current_price - prev_close) / prev_close) * 100, 2)

        return {
            "ticker": ticker.upper(),
            "price": current_price,
            "open": round(quotes["open"][-1], 2) if quotes["open"][-1] else 0,
            "high": round(max(c for c in quotes["high"] if c is not None), 2),
            "low": round(min(c for c in quotes["low"] if c is not None), 2),
            "volume": int(quotes["volume"][-1]) if quotes["volume"][-1] else 0,
            "changePercent": change_percent,
            "timestamp": pd.Timestamp(timestamps[-1], unit="s").isoformat(),
        }
    except Exception as e:
        return {"ticker": ticker.upper(), "error": str(e)}


def get_historical_data(ticker):
    try:
        params = {"interval": "1d", "range": "1mo"}
        r = requests.get(_CHART_URL.format(ticker=ticker), params=params, headers=_HEADERS, timeout=15)
        r.raise_for_status()
        data = r.json()["chart"]["result"][0]
        quotes = data["indicators"]["quote"][0]
        timestamps = data["timestamp"]

        return [
            {"date": pd.Timestamp(ts, unit="s").strftime("%Y-%m-%d"), "price": round(c, 2)}
            for ts, c in zip(timestamps, quotes["close"])
            if c is not None
        ]
    except Exception:
        return []


def get_ticker_info(ticker):
    try:
        url = "https://query1.finance.yahoo.com/v1/finance/search?q={t}"
        r = requests.get(url.format(t=ticker), headers=_HEADERS, timeout=15)
        r.raise_for_status()
        quotes = r.json().get("quotes", [])
        if not quotes:
            return {"name": ticker, "error": "No info found"}
        info = quotes[0]
        return {
            "name": info.get("longname", info.get("shortname", ticker)),
            "sector": info.get("sector", "N/A"),
            "marketCap": 0,
            "peRatio": 0,
            "week52High": 0,
            "week52Low": 0,
        }
    except Exception:
        return {"name": ticker, "error": "Could not fetch info"}
