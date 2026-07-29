"""
Waitlist API路由
提供 Paktos 等候名单的订阅、统计接口
"""

import os
import re
import json
import threading
from datetime import datetime, timezone

from flask import request, jsonify

from . import waitlist_bp
from ..utils.logger import get_logger

logger = get_logger('mirofish.api.waitlist')

# 订阅数据存储路径
WAITLIST_DIR = os.path.join(os.path.dirname(__file__), '../../uploads/waitlist')
WAITLIST_FILE = os.path.join(WAITLIST_DIR, 'subscribers.json')

# 简单的邮箱格式校验
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

# 文件读写锁（避免并发写入损坏数据）
_lock = threading.Lock()


def _load_subscribers():
    """读取订阅者列表，文件不存在或损坏时返回空列表"""
    if not os.path.exists(WAITLIST_FILE):
        return []
    try:
        with open(WAITLIST_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        logger.warning('waitlist 数据文件读取失败，视为空列表')
        return []


def _save_subscribers(subscribers):
    """保存订阅者列表"""
    os.makedirs(WAITLIST_DIR, exist_ok=True)
    with open(WAITLIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(subscribers, f, ensure_ascii=False, indent=2)


@waitlist_bp.route('/subscribe', methods=['POST'])
def subscribe():
    """
    加入等候名单

    请求（JSON）：
        { "email": "someone@example.com" }

    返回：
        { "success": true, "already_subscribed": false, "count": 128 }
    """
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip().lower()

    if not email or not EMAIL_RE.match(email):
        return jsonify({'success': False, 'error': 'Please enter a valid email address.'}), 400

    with _lock:
        subscribers = _load_subscribers()
        already = any(s.get('email') == email for s in subscribers)
        if not already:
            subscribers.append({
                'email': email,
                'subscribed_at': datetime.now(timezone.utc).isoformat()
            })
            _save_subscribers(subscribers)
            logger.info(f'waitlist 新增订阅: {email}')

    return jsonify({
        'success': True,
        'already_subscribed': already,
        'count': len(subscribers)
    })


@waitlist_bp.route('/count', methods=['GET'])
def count():
    """获取当前订阅人数"""
    with _lock:
        subscribers = _load_subscribers()
    return jsonify({'success': True, 'count': len(subscribers)})
