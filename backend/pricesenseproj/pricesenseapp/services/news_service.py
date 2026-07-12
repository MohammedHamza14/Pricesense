# import feedparser
# from typing import List, Dict

# # Business news RSS feeds
# RSS_FEEDS = [
#     "https://feeds.bbci.co.uk/news/business/rss.xml",
#     "https://feeds.reuters.com/reuters/businessNews",
# ]

# def fetch_headlines(limit_per_feed: int = 5) -> List[Dict]:
#     """
#     Fetch business headlines from RSS feeds.

#     Returns:
#         [
#             {
#                 "source": "...",
#                 "title": "...",
#                 "link": "..."
#             }
#         ]
#     """

#     headlines = []

#     for url in RSS_FEEDS:
#         try:
#             feed = feedparser.parse(url)

#             source = feed.feed.get("title", "Unknown")

#             for entry in feed.entries[:limit_per_feed]:
#                 headlines.append({
#                     "source": source,
#                     "title": entry.get("title", ""),
#                     "link": entry.get("link", "")
#                 })

#         except Exception as e:
#             print(f"RSS Error ({url}): {e}")

#     return headlines

"""
RSS News Fetching Service
Phase 1 of Context-Aware Confidence System

Fetches business news headlines from multiple RSS feeds.
Handles feed failures gracefully — one failing feed does not crash the system.
"""

import feedparser
from datetime import datetime, timedelta


# ─────────────────────────────────────────────
# RSS FEED CONFIGURATION
# ─────────────────────────────────────────────
RSS_FEEDS = [
    {
        "name": "BBC Business",
        "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
    },
    {
        "name": "Reuters Business",
        "url": "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    },
    {
        "name": "CNBC",
        "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001166",
    },
    {
        "name": "Google News Business",
        "url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
    },
]


def fetch_rss_headlines(days=3):
    """
    Fetch business news headlines from configured RSS feeds.

    Args:
        days (int): Number of days to look back. Defaults to 3.

    Returns:
        dict: {
            "status": "success" or "partial_success" or "error",
            "total_headlines": int,
            "feeds_accessed": int,
            "feeds_failed": int,
            "headlines": [
                {
                    "source": str,
                    "title": str,
                    "link": str,
                },
                ...
            ],
            "failed_feeds": [str, ...]
        }
    """
    headlines = []
    failed_feeds = []
    feeds_accessed = 0
    cutoff_date = datetime.now() - timedelta(days=days)

    for feed in RSS_FEEDS:
        try:
            parsed = feedparser.parse(feed["url"])

            # Check if feed was successfully parsed
            if parsed.bozo and not parsed.entries:
                failed_feeds.append(feed["name"])
                continue

            feeds_accessed += 1

            for entry in parsed.entries:
                # Filter by date if available
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_date = datetime(*entry.published_parsed[:6])
                    if pub_date < cutoff_date:
                        continue

                headlines.append({
                    "source": feed["name"],
                    "title": entry.title.strip() if entry.title else "",
                    "link": entry.link.strip() if entry.link else "",
                })

        except Exception:
            # One feed failing should not crash the entire fetch
            failed_feeds.append(feed["name"])
            continue

    # Remove exact duplicate titles (keep first occurrence)
    seen_titles = set()
    unique_headlines = []
    for h in headlines:
        if h["title"] not in seen_titles:
            seen_titles.add(h["title"])
            unique_headlines.append(h)

    # Determine overall status
    if feeds_accessed == 0:
        status = "error"
    elif len(failed_feeds) > 0:
        status = "partial_success"
    else:
        status = "success"

    return {
        "status": status,
        "total_headlines": len(unique_headlines),
        "feeds_accessed": feeds_accessed,
        "feeds_failed": len(failed_feeds),
        "headlines": unique_headlines,
        "failed_feeds": failed_feeds,
    }