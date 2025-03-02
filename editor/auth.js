class GitHubSessionManager {
    constructor() {
        this.isUserLoggedIn = false;
    }

    updateEditorAccess() {
        const loginOverlay = document.getElementById('login-overlay');
        const editorContainer = document.querySelector('.editor-container');
        const toolbar = document.querySelector('.toolbar');
        
        if (!this.isUserLoggedIn) {
            loginOverlay.style.display = 'flex';
            editorContainer.classList.add('blocked');
            toolbar.classList.add('blocked');
        } else {
            loginOverlay.style.display = 'none';
            editorContainer.classList.remove('blocked');
            toolbar.classList.remove('blocked');
        }
    }

    async validateGitHubSession() {
        const token = sessionStorage.getItem('github_token');
        if (!token) return false;

        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid session');
            }

            const userData = await response.json();
            return userData.login === 'MayanMisfit';
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }

    async checkAndUpdateSession() {
        const isValidSession = await this.validateGitHubSession();
        
        if (isValidSession) {
            this.updateUIForLoggedInUser();
        } else {
            this.killSession();
        }
    }

    updateUIForLoggedInUser() {
        document.getElementById('logged-out').style.display = 'none';
        document.getElementById('logged-in').style.display = 'flex';
        document.getElementById('username').textContent = 'MayanMisfit';
        document.getElementById('current-time').textContent = 'UTC: 2025-03-02 23:20:51';
        this.isUserLoggedIn = true;
        this.updateEditorAccess();
    }

    updateUIForLoggedOutUser() {
        document.getElementById('logged-out').style.display = 'flex';
        document.getElementById('logged-in').style.display = 'none';
        document.getElementById('username').textContent = '';
        this.isUserLoggedIn = false;
        this.updateEditorAccess();
    }

    killSession() {
        sessionStorage.removeItem('github_token');
        const editor = document.getElementById('editor');
        if (editor) editor.value = '';
        this.updateUIForLoggedOutUser();
    }
}

const sessionManager = new GitHubSessionManager();

document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById('current-time').textContent = 'UTC: 2025-03-02 23:20:51';
    
    // Add login button handlers
    const loginButtons = ['github-login', 'github-login-overlay'];
    loginButtons.forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', (e) => {
            e.preventDefault();
            // Let the system handle the OAuth flow
            if (window.githubOAuth && typeof window.githubOAuth.login === 'function') {
                window.githubOAuth.login();
            }
        });
    });
    
    // Add logout button handler
    document.getElementById('github-logout').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.githubOAuth && typeof window.githubOAuth.logout === 'function') {
            window.githubOAuth.logout();
        }
        sessionManager.killSession();
    });

    await sessionManager.checkAndUpdateSession();
});