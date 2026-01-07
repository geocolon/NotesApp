from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import os
from functools import wraps

app = Flask(__name__)
CORS(app)

# In-memory storage (replace with database in production)
notes = []
note_id_counter = 1

# Keycloak configuration
KEYCLOAK_URL = os.getenv('KEYCLOAK_URL', 'http://localhost:8080')
KEYCLOAK_REALM = os.getenv('KEYCLOAK_REALM', 'notes-realm')
KEYCLOAK_CLIENT_ID = os.getenv('KEYCLOAK_CLIENT_ID', 'notes-client')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix
            token = token.split(' ')[1] if ' ' in token else token
            # In production, verify token with Keycloak
            # For simplicity, we're doing basic validation
            decoded = jwt.decode(token, options={"verify_signature": False})
            request.user = decoded
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/notes', methods=['GET'])
@token_required
def get_notes():
    user_id = request.user.get('sub')
    user_notes = [note for note in notes if note['user_id'] == user_id]
    return jsonify(user_notes), 200

@app.route('/api/notes', methods=['POST'])
@token_required
def create_note():
    global note_id_counter
    data = request.get_json()
    
    if not data.get('title') or not data.get('content'):
        return jsonify({'message': 'Title and content are required'}), 400
    
    note = {
        'id': note_id_counter,
        'title': data['title'],
        'content': data['content'],
        'completed': data.get('completed', False),
        'user_id': request.user.get('sub')
    }
    
    notes.append(note)
    note_id_counter += 1
    
    return jsonify(note), 201

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@token_required
def update_note(note_id):
    user_id = request.user.get('sub')
    note = next((n for n in notes if n['id'] == note_id and n['user_id'] == user_id), None)
    
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    data = request.get_json()
    note['title'] = data.get('title', note['title'])
    note['content'] = data.get('content', note['content'])
    note['completed'] = data.get('completed', note['completed'])
    
    return jsonify(note), 200

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(note_id):
    global notes
    user_id = request.user.get('sub')
    note = next((n for n in notes if n['id'] == note_id and n['user_id'] == user_id), None)
    
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    notes = [n for n in notes if n['id'] != note_id]
    
    return jsonify({'message': 'Note deleted'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)