// Constants provided by the system
const CURRENT_USER = 'MayanMisfit';
let isUserLoggedIn = false;

function updateEditorAccess() {
    const loginOverlay = document.getElementById('login-overlay');
    const editorContainer = document.querySelector('.editor-container');
    const toolbar = document.querySelector('.toolbar');
    
    if (!isUserLoggedIn) {
        loginOverlay.style.display = 'flex';
        editorContainer.classList.add('blocked');
        toolbar.classList.add('blocked');
    } else {
        loginOverlay.style.display = 'none';
        editorContainer.classList.remove('blocked');
        toolbar.classList.remove('blocked');
    }
}

function updateUIForLoggedInUser(username) {
    if (username === CURRENT_USER) {
        document.getElementById('logged-out').style.display = 'none';
        document.getElementById('logged-in').style.display = 'flex';
        document.getElementById('username').textContent = username;
        isUserLoggedIn = true;
        updateEditorAccess();
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
    } else {
        alert('Access denied. Only MayanMisfit can use this editor.');
        killSession();
    }
}

function updateUIForLoggedOutUser() {
    document.getElementById('logged-out').style.display = 'flex';
    document.getElementById('logged-in').style.display = 'none';
    document.getElementById('username').textContent = '';
    isUserLoggedIn = false;
    updateEditorAccess();
}

function killSession() {
    sessionStorage.clear();
    const editor = document.getElementById('editor');
    if (editor) editor.value = '';
    updateUIForLoggedOutUser();
}

function handleLogin() {
    const username = prompt('Enter username:');
    if (username) {
        updateUIForLoggedInUser(username);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('github-login').addEventListener('click', handleLogin);
    document.getElementById('github-login-overlay').addEventListener('click', handleLogin);
    document.getElementById('github-logout').addEventListener('click', killSession);
    
    // Check for existing session
    const savedSession = sessionStorage.getItem('isLoggedIn');
    const savedUsername = sessionStorage.getItem('username');
    
    if (savedSession && savedUsername === CURRENT_USER) {
        updateUIForLoggedInUser(savedUsername);
    } else {
        killSession();
    }
});