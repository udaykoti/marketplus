import requests
from textblob import TextBlob
import config

_cache = {}


def analyze_sentiment(texts):
    if not texts:
        return 50, []

    scores = []
    for text in texts:
        blob = TextBlob(text)
        scores.append(blob.sentiment.polarity)

    if not scores:
        return 50, []

    avg_polarity = sum(scores) / len(scores)
    normalized = round(((avg_polarity + 1) / 2) * 100, 1)
    return normalized, scores


def fetch_news_sentiment(ticker):
    cache_key = f"news_{ticker}"
    if cache_key in _cache:
        return _cache[cache_key]

    if not config.NEWS_API_KEY or config.NEWS_API_KEY == "your_news_api_key_here":
        result = {"score": 50, "headlines": [], "error": "NEWS_API_KEY not configured"}
        _cache[cache_key] = result
        return result

    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": ticker,
            "apiKey": config.NEWS_API_KEY,
            "pageSize": 20,
            "sortBy": "publishedAt",
            "language": "en",
        }
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()

        headlines = []
        texts = []
        for article in data.get("articles", []):
            title = article.get("title", "")
            desc = article.get("description", "")
            combined = f"{title}. {desc}".strip()
            if combined:
                texts.append(combined)
                headlines.append({"title": title, "url": article.get("url", "#")})

        score, _ = analyze_sentiment(texts)
        result = {
            "score": score,
            "headlines": headlines[:5],
            "label": _get_label(score),
        }
        _cache[cache_key] = result
        return result
    except Exception as e:
        result = {"score": 50, "headlines": [], "error": str(e)}
        _cache[cache_key] = result
        return result


def _get_label(score):
    if score < 40:
        return "Bearish"
    elif score < 60:
        return "Neutral"
    else:
        return "Bullish"
