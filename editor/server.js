const clientId = 'Iv23liBmuVkYfimI9CMi';
const clientSecret = '3f905e7acc934a9da1cc4e782cf7efb98c66193f';

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange code for access token
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});