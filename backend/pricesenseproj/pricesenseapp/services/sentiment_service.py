"""
Sentiment & Relevance Service
Phase 2 of Context-Aware Confidence System

Adds VADER sentiment analysis and MiniLM semantic relevance filtering
on top of raw RSS headlines.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# ─────────────────────────────────────────────
# LAZY-LOADED MODELS (loaded once, reused)
# ─────────────────────────────────────────────

_vader = None
_minilm = None


def _get_vader():
    """Lazy-load VADER sentiment analyzer."""
    global _vader
    if _vader is None:
        _vader = SentimentIntensityAnalyzer()
    return _vader


def _get_minilm():
    """Lazy-load MiniLM sentence transformer."""
    global _minilm
    if _minilm is None:
        _minilm = SentenceTransformer("all-MiniLM-L6-v2")
    return _minilm


# ─────────────────────────────────────────────
# PUBLIC FUNCTIONS
# ─────────────────────────────────────────────

def score_sentiment(headline: str) -> float:
    """
    Score the emotional tone of a headline using VADER.

    Args:
        headline: A news headline string.

    Returns:
        float between -1 (very negative) and +1 (very positive).
    """
    analyzer = _get_vader()
    scores = analyzer.polarity_scores(headline)
    return round(scores["compound"], 6)


def score_relevance(headline: str, business_description: str) -> float:
    """
    Measure semantic similarity between a headline and a business description.

    Args:
        headline: A news headline string.
        business_description: Description of the user's business.

    Returns:
        float between 0 (completely irrelevant) and 1 (highly relevant).
    """
    model = _get_minilm()
    headline_emb = model.encode([headline])
    business_emb = model.encode([business_description])
    similarity = cosine_similarity(headline_emb, business_emb)[0][0]
    return round(max(0.0, min(1.0, float(similarity))), 6)


def analyze_headlines(headlines: list, business_description: str) -> dict:
    """
    Analyze a list of headlines with sentiment and relevance scoring.

    Args:
        headlines: List of headline dicts from news_service.fetch_rss_headlines().
                   Each dict must have: source, title, link.
        business_description: Description of the user's business.

    Returns:
        dict with:
            - total_headlines: int
            - relevant_headlines: int
            - irrelevant_headlines: int
            - analyzed: list of dicts with source, title, link, sentiment, relevance
    """
    if not headlines:
        return {
            "total_headlines": 0,
            "relevant_headlines": 0,
            "irrelevant_headlines": 0,
            "analyzed": [],
        }

    analyzed = []

    for item in headlines:
        title = item.get("title", "")
        if not title:
            continue

        sentiment = score_sentiment(title)
        relevance = score_relevance(title, business_description)

        analyzed.append({
            "source": item.get("source", ""),
            "title": title,
            "link": item.get("link", ""),
            "sentiment": sentiment,
            "relevance": relevance,
        })

    # Sort by relevance (most relevant first)
    analyzed.sort(key=lambda x: x["relevance"], reverse=True)

    relevant_count = sum(1 for a in analyzed if a["relevance"] >= 0.3)
    irrelevant_count = len(analyzed) - relevant_count

    return {
        "total_headlines": len(analyzed),
        "relevant_headlines": relevant_count,
        "irrelevant_headlines": irrelevant_count,
        "analyzed": analyzed,
    }