// GitHub OAuth Configuration
const githubClientId = 'Iv23liBmuVkYfimI9CMi';
const redirectUri = 'https://meika.netlify.app/editor/';

// DOM Elements
const loggedOutElement = document.getElementById('logged-out');
const loggedInElement = document.getElementById('logged-in');
const loginButton = document.getElementById('github-login');
const logoutButton = document.getElementById('github-logout');
const usernameElement = document.getElementById('username');
const userAvatarElement = document.getElementById('user-avatar');

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('github_token');
    if (token) {
        fetchUserData(token);
        loggedOutElement.style.display = 'none';
        loggedInElement.style.display = 'flex';
    } else {
        loggedOutElement.style.display = 'flex';
        loggedInElement.style.display = 'none';
    }
}

// Handle login
loginButton.addEventListener('click', () => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    window.location.href = authUrl;
});

// Handle logout
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('github_token');
    checkAuthStatus();
});

// Fetch user data
async function fetchUserData(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const userData = await response.json();
        
        usernameElement.textContent = userData.login;
        userAvatarElement.src = userData.avatar_url;
    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('github_token');
        checkAuthStatus();
    }
}

// Handle OAuth callback
if (window.location.search.includes('code=')) {
    const code = new URLSearchParams(window.location.search).get('code');
    // Exchange code for token using your backend endpoint
    fetch('/auth/github/callback?code=' + code)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('github_token', data.access_token);
            window.location.href = '/'; // Redirect to main page
        })
        .catch(error => {
            console.error('Error during authentication:', error);
        });
}

// Check auth status on page load
checkAuthStatus();