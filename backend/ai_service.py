from groq import Groq
import config

client = Groq(api_key=config.GROQ_API_KEY)


def ask_market_question(question, context):
    if not config.GROQ_API_KEY:
        return {"error": "GROQ_API_KEY not configured. Set it in .env to enable AI features."}

    try:
        context_str = "\n".join(
            f"{t.upper()}: ${d.get('price', 'N/A')} ({d.get('changePercent', 0)}%), "
            f"Volume: {d.get('volume', 'N/A')}"
            for t, d in context.items()
            if isinstance(d, dict) and "error" not in d
        )

        system_prompt = (
            "You are a financial market intelligence assistant. "
            "You have access to live stock data provided as context. "
            "Answer user questions about the market concisely and accurately. "
            "Use the live data provided to support your answers."
        )

        user_prompt = f"Live Market Data:\n{context_str}\n\nUser Question: {question}"

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=500,
        )

        return {"response": response.choices[0].message.content}
    except Exception as e:
        return {"error": f"AI service error: {str(e)}"}
