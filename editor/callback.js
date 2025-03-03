exports.handler = async (event, context) => {
  // Get the authorization code from the query parameters
  const code = event.queryStringParameters.code;
  
  // Redirect back to the editor page with the auth code
  return {
    statusCode: 302,
    headers: {
      'Location': 'https://meika.netlify.app/editor/',
      'Cache-Control': 'no-cache'
    }
  };
};