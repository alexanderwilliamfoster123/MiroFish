"""
Standalone production server for the Ad Reaction Studio.

Serves only the ad-reaction API plus the built frontend, with a minimal
dependency set (flask, flask-cors, openai, python-dotenv) — no Zep/OASIS —
so it can run on small cloud instances. The full MiroFish app is unaffected;
use backend/run.py for the complete platform.

The heavy modules are avoided by loading the studio's modules directly from
their files instead of importing the `app` package (whose __init__ chain pulls
in the full simulation stack).

Usage:
    python backend/studio_server.py          # serves on PORT (default 8080)
Env:
    LLM_API_KEY / LLM_BASE_URL / LLM_MODEL_NAME  — OpenAI-compatible LLM
    PORT                                         — listen port
    STATIC_DIR                                   — built frontend (default ../frontend/dist)
"""

import importlib.util
import os
import sys
import types

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from flask import Blueprint, Flask, redirect, send_from_directory  # noqa: E402
from flask_cors import CORS  # noqa: E402


def _load(name, relpath):
    spec = importlib.util.spec_from_file_location(
        name, os.path.join(BACKEND_DIR, relpath))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


# Register lightweight package stand-ins so the studio modules' relative
# imports resolve without executing app/__init__.py or app/services/__init__.py
app_pkg = types.ModuleType('app'); app_pkg.__path__ = [os.path.join(BACKEND_DIR, 'app')]
sys.modules['app'] = app_pkg
api_pkg = types.ModuleType('app.api'); api_pkg.__path__ = [os.path.join(BACKEND_DIR, 'app/api')]
ad_reaction_bp = Blueprint('ad_reaction', __name__)
api_pkg.ad_reaction_bp = ad_reaction_bp
sys.modules['app.api'] = api_pkg
utils_pkg = types.ModuleType('app.utils'); utils_pkg.__path__ = [os.path.join(BACKEND_DIR, 'app/utils')]
sys.modules['app.utils'] = utils_pkg
svc_pkg = types.ModuleType('app.services'); svc_pkg.__path__ = [os.path.join(BACKEND_DIR, 'app/services')]
sys.modules['app.services'] = svc_pkg

_load('app.config', 'app/config.py')
_load('app.utils.logger', 'app/utils/logger.py')
_load('app.utils.llm_client', 'app/utils/llm_client.py')
_load('app.services.ad_reaction_simulator', 'app/services/ad_reaction_simulator.py')
_load('app.api.ad_reaction', 'app/api/ad_reaction.py')

STATIC_DIR = os.environ.get(
    'STATIC_DIR', os.path.join(BACKEND_DIR, '../frontend/dist'))

server = Flask(__name__, static_folder=None)
CORS(server, resources={r"/api/*": {"origins": "*"}})
server.register_blueprint(ad_reaction_bp, url_prefix='/api/ad-reaction')


@server.route('/health')
def health():
    return {'status': 'ok', 'service': 'Ad Reaction Studio'}


@server.route('/')
def index():
    # Studio-only deployment: the full-platform home isn't functional here
    return redirect('/ad-reaction')


@server.route('/<path:path>')
def static_files(path):
    full = os.path.join(STATIC_DIR, path)
    if os.path.isfile(full):
        return send_from_directory(STATIC_DIR, path)
    # SPA fallback for client-side routes like /ad-reaction
    return send_from_directory(STATIC_DIR, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    server.run(host='0.0.0.0', port=port)
