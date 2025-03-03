exports.handler = async (event, context) => {
  // Extract code from query parameters
  const code = event.queryStringParameters.code;
  
  // Get the origin
  const origin = event.headers.host === 'localhost:8888' 
    ? 'http://localhost:8888' 
    : 'https://meika.netlify.app';

  return {
    statusCode: 302,
    headers: {
      'Location': `${origin}/editor/`, // Ensure trailing slash
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  };
};