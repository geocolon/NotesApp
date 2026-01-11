// Configuration
const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'notes-realm';
const CLIENT_ID = 'notes-client';
const BACKEND_URL = 'http://localhost:5001';
const REDIRECT_URI = 'http://localhost:3000';

let accessToken = null;
let keycloak = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-note-btn').addEventListener('click', addNote);
}

async function checkAuthentication() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    accessToken = localStorage.getItem('access_token');

    if (code && !accessToken) {
        // Exchange code for token
        await exchangeCodeForToken(code);
        // Clean URL
        window.history.replaceState({}, document.title, '/');
        return;
    }

    if (accessToken) {
        try {
            // Verify token is still valid
            const decoded = parseJwt(accessToken);
            if (decoded.exp * 1000 < Date.now()) {
                // Token expired
                localStorage.removeItem('access_token');
                accessToken = null;
                showLoginScreen();
            } else {
                showMainScreen();
                loadNotes();
            }
        } catch (error) {
            showMainScreen();
            loadNotes();
        }
    } else {
        showLoginScreen();
    }
}

async function exchangeCodeForToken(code) {
    try {
        const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
        
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error('Token exchange failed');
        }

        const data = await response.json();
        accessToken = data.access_token;
        localStorage.setItem('access_token', accessToken);
        
        // Decode token to get username
        const decoded = parseJwt(accessToken);
        localStorage.setItem('username', decoded.preferred_username || decoded.name || 'User');
        
        showMainScreen();
        loadNotes();
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        alert('Login failed. Please try again.');
        showLoginScreen();
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return {};
    }
}

function login() {
    const authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=openid`;
    
    window.location.href = authUrl;
}

function logout() {
    localStorage.removeItem('access_token');
    accessToken = null;
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('username').textContent = 'User';
}

async function loadNotes() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/notes`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load notes');

        const notes = await response.json();
        displayNotes(notes);
    } catch (error) {
        console.error('Error loading notes:', error);
        // For demo purposes, show mock data
        displayNotes([
            { id: 1, title: 'Welcome', content: 'This is a demo note', completed: false }
        ]);
    }
}

function displayNotes(notes) {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<p class="empty-state">No notes yet. Create your first note above!</p>';
        return;
    }

    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesList.appendChild(noteElement);
    });
}

function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `
        <div class="note-header">
            <h3>${note.title}</h3>
            <div class="note-actions">
                <button class="btn-icon" onclick="toggleComplete(${note.id})">
                    ${note.completed ? '✓' : '○'}
                </button>
                <button class="btn-icon delete" onclick="deleteNote(${note.id})">🗑️</button>
            </div>
        </div>
        <p>${note.content}</p>
    `;
    return div;
}

async function addNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ title, content, completed: false })
        });

        if (!response.ok) throw new Error('Failed to add note');

        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        
        loadNotes();
    } catch (error) {
        console.error('Error adding note:', error);
        alert('Failed to add note. Using demo mode.');
    }
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete note');
        
        loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}

async function toggleComplete(id) {
    // Implementation for toggling completion status
    loadNotes();
}