"""
Ad Reaction API
Endpoints for the Ad Reaction Studio: seeded-page roster and quick audience
reaction simulations against a headline/creative.
"""

import traceback

from flask import request, jsonify

from . import ad_reaction_bp
from ..services.ad_reaction_simulator import (
    get_roster,
    run_simulation,
    MAX_PAGES_PER_RUN,
    DEFAULT_PERSONAS_PER_PAGE,
)
from ..utils.logger import get_logger

logger = get_logger('mirofish.api.ad_reaction')


@ad_reaction_bp.route('/roster', methods=['GET'])
def roster():
    """
    Return the seeded-page roster (deduplicated, with suggested groups).

    Response:
        {"success": true, "data": {"pages": [{"name", "group", "mentions"}, ...],
                                   "max_pages_per_run": 10}}
    """
    pages = get_roster()
    return jsonify({
        'success': True,
        'data': {
            'pages': pages,
            'max_pages_per_run': MAX_PAGES_PER_RUN,
        },
    })


@ad_reaction_bp.route('/simulate', methods=['POST'])
def simulate():
    """
    Simulate audience reactions to an ad across selected pages.

    Request (JSON):
        {
            "headline": "...",              // required
            "caption": "...",               // optional
            "pages": ["PageName", ...],     // required, 1..MAX_PAGES_PER_RUN
            "personas_per_page": 4           // optional, 1..6
        }

    Response:
        {"success": true, "data": {"summary": {...}, "results": [...]}}
    """
    try:
        data = request.get_json() or {}

        headline = (data.get('headline') or '').strip()
        if not headline:
            return jsonify({'success': False, 'error': 'headline is required'}), 400

        pages = data.get('pages') or []
        if not isinstance(pages, list) or not pages:
            return jsonify({'success': False,
                            'error': 'pages must be a non-empty list'}), 400
        if len(pages) > MAX_PAGES_PER_RUN:
            return jsonify({'success': False,
                            'error': f'select at most {MAX_PAGES_PER_RUN} pages per run'}), 400

        caption = (data.get('caption') or '').strip() or None
        personas_per_page = data.get('personas_per_page', DEFAULT_PERSONAS_PER_PAGE)
        try:
            personas_per_page = int(personas_per_page)
        except (TypeError, ValueError):
            personas_per_page = DEFAULT_PERSONAS_PER_PAGE

        logger.info(f"Ad reaction run: {len(pages)} pages, headline={headline[:80]!r}")
        result = run_simulation(
            headline=headline,
            page_names=[str(p) for p in pages],
            caption=caption,
            personas_per_page=personas_per_page,
        )
        return jsonify({'success': True, 'data': result})

    except ValueError as e:
        # Typically: LLM not configured
        logger.error(f"Ad reaction config error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    except Exception as e:  # noqa: BLE001
        logger.error(f"Ad reaction simulation failed: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500
