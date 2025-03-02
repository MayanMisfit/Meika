// Constants provided by the system
const CURRENT_USER = 'MayanMisfit';
const CURRENT_UTC_TIME = '2025-03-02 22:27:42';
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

function updateUIForLoggedInUser() {
    document.getElementById('logged-out').style.display = 'none';
    document.getElementById('logged-in').style.display = 'flex';
    document.getElementById('username').textContent = CURRENT_USER;
    document.getElementById('current-time').textContent = `UTC: ${CURRENT_UTC_TIME}`;
    isUserLoggedIn = true;
    updateEditorAccess();
}

function updateUIForLoggedOutUser() {
    document.getElementById('logged-out').style.display = 'flex';
    document.getElementById('logged-in').style.display = 'none';
    document.getElementById('username').textContent = '';
    isUserLoggedIn = false;
    updateEditorAccess();
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for login/logout buttons
    document.getElementById('github-login').addEventListener('click', updateUIForLoggedInUser);
    document.getElementById('github-login-overlay').addEventListener('click', updateUIForLoggedInUser);
    document.getElementById('github-logout').addEventListener('click', updateUIForLoggedOutUser);

    // Set initial time display
    document.getElementById('current-time').textContent = `UTC: ${CURRENT_UTC_TIME}`;
    
    // Start in logged out state
    updateUIForLoggedOutUser();
});