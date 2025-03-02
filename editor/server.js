const express = require('express');
const axios = require('axios');
const session = require('express-session');
const qs = require('querystring');

const app = express();
const port = 3000;

// Replace these with your GitHub OAuth app credentials
const clientId = 'your_github_client_id';
const clientSecret = 'your_github_client_secret';

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// GitHub OAuth callback route
app.get('/auth/github/callback', async (req, res) => {
    const requestToken = req.query.code;
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const tokenBody = {
        client_id: clientId,
        client_secret: clientSecret,
        code: requestToken,
    };

    try {
        // Exchange authorization code for access token
        const response = await axios.post(tokenUrl, qs.stringify(tokenBody), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = qs.parse(response.data).access_token;

        // Retrieve user info from GitHub API
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        });

        const user = userResponse.data;

        // Save user info in session
        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        console.error('Error during GitHub OAuth:', error);
        res.status(500).send('Authentication failed');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});