import yfinance as yf


def get_stock_data(ticker):
    try:
        ticker_obj = yf.Ticker(ticker)
        hist = ticker_obj.history(period="5d", interval="1m")
        if hist.empty:
            return None

        latest = hist.iloc[-1]
        prev_close = hist["Close"].iloc[-2] if len(hist) > 1 else latest["Open"]
        current_price = round(float(latest["Close"]), 2)
        change_percent = round(((current_price - prev_close) / prev_close) * 100, 2)

        return {
            "ticker": ticker.upper(),
            "price": current_price,
            "open": round(float(latest["Open"]), 2),
            "high": round(float(latest["High"]), 2),
            "low": round(float(latest["Low"]), 2),
            "volume": int(latest["Volume"]),
            "changePercent": change_percent,
            "timestamp": str(latest.name),
        }
    except Exception as e:
        return {"ticker": ticker.upper(), "error": str(e)}


def get_historical_data(ticker):
    try:
        ticker_obj = yf.Ticker(ticker)
        hist = ticker_obj.history(period="1mo", interval="1d")
        if hist.empty:
            return []

        return [
            {"date": str(idx.date()), "price": round(float(row["Close"]), 2)}
            for idx, row in hist.iterrows()
        ]
    except Exception:
        return []


def get_ticker_info(ticker):
    try:
        ticker_obj = yf.Ticker(ticker)
        info = ticker_obj.info
        return {
            "name": info.get("longName", info.get("shortName", ticker)),
            "sector": info.get("sector", "N/A"),
            "marketCap": info.get("marketCap", 0),
            "peRatio": info.get("trailingPE", info.get("forwardPE", 0)),
            "week52High": info.get("fiftyTwoWeekHigh", 0),
            "week52Low": info.get("fiftyTwoWeekLow", 0),
        }
    except Exception:
        return {"name": ticker, "error": "Could not fetch info"}
