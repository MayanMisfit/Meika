class DiscordSessionManager {
    constructor() {
        this.isUserLoggedIn = false;
        this.currentTime = '2025-03-03 00:13:43';
        this.currentUser = 'MayanMisfit';
        this.clientId = '1345901505982758912';
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

    async validateSession() {
        const token = sessionStorage.getItem('discord_token');
        if (!token) return false;

        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid session');
            }

            const userData = await response.json();
            this.currentUser = userData.username;
            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }

    async checkAndUpdateSession() {
        // Check for auth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // Exchange code for token using Netlify function
            try {
                const response = await fetch('/.netlify/functions/discord-auth', {
                    method: 'POST',
                    body: JSON.stringify({ code }),
                });
                
                if (!response.ok) {
                    throw new Error('Auth failed');
                }
                
                const data = await response.json();
                sessionStorage.setItem('discord_token', data.access_token);
                
                // Remove code from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Auth error:', error);
            }
        }

        const isValidSession = await this.validateSession();
        
        if (isValidSession) {
            this.updateUIForLoggedInUser();
        } else {
            this.killSession();
        }
    }

    updateUIForLoggedInUser() {
        document.getElementById('logged-out').style.display = 'none';
        document.getElementById('logged-in').style.display = 'flex';
        document.getElementById('username').textContent = this.currentUser;
        document.getElementById('current-time').textContent = `UTC: ${this.currentTime}`;
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
        sessionStorage.removeItem('discord_token');
        const editor = document.getElementById('editor');
        if (editor) editor.value = '';
        this.updateUIForLoggedOutUser();
    }

    initiateDiscordLogin() {
        // Use the current URL's origin for the redirect
        const redirectUri = encodeURIComponent(`${window.location.origin}/.netlify/functions/discord-callback`);
        
        // Discord OAuth2 URL with required scopes
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
        
        // Redirect to Discord auth
        window.location.href = discordAuthUrl;
    }
}

const sessionManager = new DiscordSessionManager();

document.addEventListener('DOMContentLoaded', function() {
    // Set up Discord login button listeners
    const loginButtons = ['github-login', 'github-login-overlay'];
    loginButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Login button clicked'); // Debug log
                sessionManager.initiateDiscordLogin();
            });
        }
    });

    // Set up logout button
    const logoutButton = document.getElementById('github-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionManager.killSession();
        });
    }

    // Update UI elements
    document.getElementById('current-time').textContent = `UTC: ${sessionManager.currentTime}`;
    
    // Initial session check
    sessionManager.checkAndUpdateSession();
});