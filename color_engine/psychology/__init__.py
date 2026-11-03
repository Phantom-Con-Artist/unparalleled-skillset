"""
Color Psychology & Aesthetic Tokens Package
===========================================
Affective emotion vectors (Ou et al., 2004) and deterministic aesthetic classification
mapping palettes to semantic tokens (Luxury, Modern, Minimalist, Cyberpunk, etc.).
"""

from .emotions import ou_color_emotions
from .tokens import evaluate_aesthetic_tokens

__all__ = [
    "ou_color_emotions",
    "evaluate_aesthetic_tokens",
]
