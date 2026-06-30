import os
import sqlite3
import datetime

IS_VERCEL = os.environ.get("VERCEL") == "1"
DB_PATH = os.path.join("/tmp" if IS_VERCEL else ".", "marketpulse.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    try:
        conn = get_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS price_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT NOT NULL,
                price REAL NOT NULL,
                volume INTEGER NOT NULL,
                change_percent REAL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_ticker_timestamp
            ON price_cache(ticker, timestamp)
        """)
        conn.commit()
        conn.close()
    except Exception:
        pass


def insert_price(ticker, price, volume, change_percent):
    try:
        conn = get_connection()
        conn.execute(
            "INSERT INTO price_cache (ticker, price, volume, change_percent, timestamp) VALUES (?, ?, ?, ?, ?)",
            (ticker, price, volume, change_percent, datetime.datetime.now().isoformat()),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def get_recent_prices(ticker, limit=100):
    try:
        conn = get_connection()
        rows = conn.execute(
            "SELECT * FROM price_cache WHERE ticker = ? ORDER BY timestamp DESC LIMIT ?",
            (ticker, limit),
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception:
        return []
