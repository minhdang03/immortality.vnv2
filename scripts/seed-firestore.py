#!/usr/bin/env python3
"""
Firebase Firestore seed via REST API.
No SDK needed - just curl/requests via urllib.

Usage: import and call seed_collection(), or run directly to test connection.
"""
import json, os, sys, urllib.request, urllib.error
from datetime import datetime, timezone

# Load .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    for line in open(env_path):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ.setdefault(k, v)

API_KEY = os.environ.get('VITE_FIREBASE_API_KEY', '')
PROJECT_ID = os.environ.get('VITE_FIREBASE_PROJECT_ID', '')
EMAIL = os.environ.get('SEED_ADMIN_EMAIL', '')
PASSWORD = os.environ.get('SEED_ADMIN_PASSWORD', '')

_token = None

def _post(url, data):
    req = urllib.request.Request(url, json.dumps(data).encode(), {'Content-Type': 'application/json'})
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = json.loads(e.read())
        raise Exception(err.get('error', {}).get('message', str(err)))

def login():
    global _token
    resp = _post(
        f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}',
        {'email': EMAIL, 'password': PASSWORD, 'returnSecureToken': True}
    )
    _token = resp['idToken']
    print(f'✅ Logged in as {EMAIL}')

def _to_firestore_value(v):
    """Convert Python value to Firestore REST API value format."""
    if isinstance(v, str):
        return {'stringValue': v}
    elif isinstance(v, bool):
        return {'booleanValue': v}
    elif isinstance(v, int):
        return {'integerValue': str(v)}
    elif isinstance(v, float):
        return {'doubleValue': v}
    elif isinstance(v, dict):
        return {'mapValue': {'fields': {k: _to_firestore_value(val) for k, val in v.items()}}}
    elif isinstance(v, list):
        return {'arrayValue': {'values': [_to_firestore_value(item) for item in v]}}
    elif v is None:
        return {'nullValue': None}
    return {'stringValue': str(v)}

def _to_firestore_fields(doc):
    """Convert a Python dict to Firestore fields format."""
    return {k: _to_firestore_value(v) for k, v in doc.items()}

def add_doc(collection, doc):
    """Add a document to a Firestore collection."""
    if not _token:
        login()
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    fields = _to_firestore_fields(doc)
    url = f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{collection}'
    req = urllib.request.Request(url, json.dumps({'fields': fields}).encode(), {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {_token}'
    })
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    doc_id = result['name'].split('/')[-1]
    return doc_id

def get_max_order(collection):
    """Get the current max order value in a collection."""
    if not _token:
        login()
    url = f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{collection}?pageSize=1000'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {_token}'})
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        docs = result.get('documents', [])
        max_order = 0
        for doc in docs:
            order = doc.get('fields', {}).get('order', {}).get('integerValue', '0')
            max_order = max(max_order, int(order))
        return max_order
    except:
        return 0

def seed_collection(collection, items):
    """Seed multiple items into a Firestore collection."""
    login()
    max_order = get_max_order(collection)
    print(f'📦 Seeding {len(items)} items into "{collection}" (current max order: {max_order})')

    for i, item in enumerate(items):
        if 'order' not in item:
            item['order'] = max_order + i + 1
        doc_id = add_doc(collection, item)
        title = item.get('vi', {}).get('title', item.get('en', {}).get('title', f'Item {i+1}'))
        print(f'  {i+1}. "{title}" → {doc_id}')

    print(f'\n✅ Done! {len(items)} items seeded into "{collection}".')

if __name__ == '__main__':
    login()
    print('🔗 Connection OK. Use seed_collection() to seed data.')
