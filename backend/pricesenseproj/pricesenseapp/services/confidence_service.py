"""
Confidence Calculation Service
Phase 3 of Context-Aware Confidence System

Takes analyzed headlines (with sentiment + relevance scores) and
calculates a single confidence indicator (0-100%).
"""

# ─────────────────────────────────────────────
# HEURISTIC PARAMETERS (configurable, not learned)
# ─────────────────────────────────────────────
RELEVANCE_WEIGHT = 0.7   # How much relevance matters vs deviation
DEVIATION_WEIGHT = 0.3   # How much sentiment deviation matters
DEFAULT_CONFIDENCE = 70.0  # Confidence when no headlines provided
MIN_HEADLINES = 3         # Minimum headlines for reliable score
RELEVANCE_THRESHOLD = 0.3  # Below this, headline is considered irrelevant


def calculate_confidence(analyzed_headlines, historical_baseline=0.0):
    """
    Calculate confidence indicator from analyzed headlines.

    Args:
        analyzed_headlines: List of dicts from sentiment_service.analyze_headlines()
                            Each must have: sentiment, relevance
        historical_baseline: Average sentiment from historical headlines (default 0.0)

    Returns:
        dict with:
            - confidence: float (0-100)
            - interpretation: str
            - warning: str or None
            - baseline: float
            - total_headlines: int
            - relevant_headlines_used: int
            - avg_sentiment: float
            - avg_relevance: float
    """
    if not analyzed_headlines:
        return {
            "confidence": DEFAULT_CONFIDENCE,
            "interpretation": "No headlines provided. Assuming stable environment.",
            "warning": None,
            "baseline": historical_baseline,
            "total_headlines": 0,
            "relevant_headlines_used": 0,
            "avg_sentiment": 0.0,
            "avg_relevance": 0.0,
        }

    # Filter to only relevant headlines
    relevant = [h for h in analyzed_headlines if h["relevance"] >= RELEVANCE_THRESHOLD]

    if not relevant:
        return {
            "confidence": DEFAULT_CONFIDENCE,
            "interpretation": "No relevant headlines found for your business. Assuming stable environment.",
            "warning": "No headlines were relevant to your business description. Consider updating it.",
            "baseline": historical_baseline,
            "total_headlines": len(analyzed_headlines),
            "relevant_headlines_used": 0,
            "avg_sentiment": 0.0,
            "avg_relevance": 0.0,
        }

    # Calculate average sentiment and relevance from relevant headlines only
    sentiments = [h["sentiment"] for h in relevant]
    relevances = [h["relevance"] for h in relevant]

    avg_sentiment = sum(sentiments) / len(sentiments)
    avg_relevance = sum(relevances) / len(relevances)

    # Calculate deviation from baseline
    deviation = abs(avg_sentiment - historical_baseline)

    # Gate: deviation only matters if headlines are relevant
    gated_deviation = deviation * avg_relevance

    # Weighted uncertainty formula
    uncertainty = (RELEVANCE_WEIGHT * avg_relevance) + (DEVIATION_WEIGHT * gated_deviation)

    # Confidence = inverse of uncertainty
    confidence = 100.0 * (1.0 - uncertainty)
    confidence = max(0.0, min(100.0, confidence))

    # Interpretation
    if confidence >= 75:
        interpretation = "High confidence. External environment appears stable."
    elif confidence >= 50:
        interpretation = "Moderate confidence. Some external uncertainty detected."
    elif confidence >= 25:
        interpretation = "Low confidence. Significant external disruption detected."
    else:
        interpretation = "Very low confidence. Major external shocks detected. Historical patterns may be unreliable."

    # Warning for too few headlines
    warning = None
    if len(relevant) < MIN_HEADLINES:
        warning = f"Only {len(relevant)} relevant headlines found. At least {MIN_HEADLINES} recommended for reliable confidence."

    return {
        "confidence": round(confidence, 1),
        "interpretation": interpretation,
        "warning": warning,
        "baseline": round(historical_baseline, 4),
        "total_headlines": len(analyzed_headlines),
        "relevant_headlines_used": len(relevant),
        "avg_sentiment": round(avg_sentiment, 4),
        "avg_relevance": round(avg_relevance, 4),
    }