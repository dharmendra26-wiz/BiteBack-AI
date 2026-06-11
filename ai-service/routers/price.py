from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import math

router = APIRouter()


class PriceRequest(BaseModel):
    itemName: str
    category: str
    originalPrice: float
    quantity: int
    hoursUntilExpiry: float
    timeOfDay: Optional[int] = None  # hour 0-23
    historicalSaleRate: Optional[float] = 0.7  # 0-1, how fast this category sells


class PriceResponse(BaseModel):
    suggestedPrice: float
    discountPct: int
    reason: str
    urgency: str  # LOW, MEDIUM, HIGH, CRITICAL


@router.post("/price", response_model=PriceResponse)
async def suggest_price(request: PriceRequest):
    """
    Smart Markdown pricing engine.
    Calculates optimal discount based on:
    - Hours until expiry
    - Time of day (foot traffic)
    - Category sell-through rate
    - Quantity remaining
    """
    hours = request.hoursUntilExpiry
    original = request.originalPrice
    qty = request.quantity
    sale_rate = request.historicalSaleRate or 0.7

    # ── Urgency tier ─────────────────────────────────────────────
    if hours <= 1:
        urgency = "CRITICAL"
        base_discount = 0.70   # 70% off
    elif hours <= 2:
        urgency = "HIGH"
        base_discount = 0.55
    elif hours <= 4:
        urgency = "MEDIUM"
        base_discount = 0.40
    else:
        urgency = "LOW"
        base_discount = 0.25

    # ── Time-of-day adjustment ────────────────────────────────────
    tod = request.timeOfDay
    if tod is not None:
        if 11 <= tod <= 13 or 17 <= tod <= 19:
            # Peak lunch / dinner — less discount needed
            base_discount = max(0.15, base_discount - 0.05)
        elif tod >= 20 or tod <= 7:
            # Late evening / early morning — more aggressive
            base_discount = min(0.75, base_discount + 0.08)

    # ── Quantity adjustment ───────────────────────────────────────
    if qty > 20:
        base_discount = min(0.75, base_discount + 0.05)  # lots left = bigger discount
    elif qty <= 3:
        base_discount = max(0.10, base_discount - 0.05)  # scarcity = less discount

    # ── Category sell-rate adjustment ─────────────────────────────
    # Slow movers get bigger discounts
    if sale_rate < 0.4:
        base_discount = min(0.75, base_discount + 0.08)
    elif sale_rate > 0.8:
        base_discount = max(0.10, base_discount - 0.05)

    # ── Final calculation ─────────────────────────────────────────
    discount_pct = round(base_discount * 100)
    suggested = round(original * (1 - base_discount), 2)
    suggested = max(suggested, 0.50)  # never below 50p

    # ── Human reason ─────────────────────────────────────────────
    reasons = {
        "CRITICAL": f"⚡ Expires in {hours:.0f}h — aggressive pricing to avoid waste",
        "HIGH": f"🔥 Expiring soon ({hours:.0f}h) — strong discount drives quick pickup",
        "MEDIUM": f"⏰ {hours:.0f}h left — moderate markdown encourages sales",
        "LOW": f"💚 {hours:.0f}h shelf life — early bird deal to reduce later waste",
    }

    return PriceResponse(
        suggestedPrice=suggested,
        discountPct=discount_pct,
        reason=reasons[urgency],
        urgency=urgency
    )
