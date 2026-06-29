from database import get_recent_prices


def check_anomaly(ticker, current_price, current_volume):
    records = get_recent_prices(ticker, limit=100)
    alerts = []

    if len(records) >= 2:
        volumes = [r["volume"] for r in records if r["volume"] > 0]
        if volumes:
            avg_volume = sum(volumes) / len(volumes)
            if avg_volume > 0 and current_volume > avg_volume * 2:
                spike_pct = round(((current_volume - avg_volume) / avg_volume) * 100)
                severity = "high" if spike_pct > 300 else "medium"
                alerts.append({
                    "type": "volume_spike",
                    "severity": severity,
                    "message": f"{ticker} volume spiked {spike_pct}% above average",
                })

    prices_5min = [r["price"] for r in records[:5]]
    if len(prices_5min) >= 2:
        old_price = prices_5min[-1]
        if old_price > 0:
            change = abs((current_price - old_price) / old_price) * 100
            if change > 3:
                direction = "up" if current_price > old_price else "down"
                severity = "high" if change > 5 else "medium"
                alerts.append({
                    "type": "price_movement",
                    "severity": severity,
                    "message": f"{ticker} moved {direction} {change:.1f}% in 5 minutes",
                })

    return alerts[0] if alerts else None
