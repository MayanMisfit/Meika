exports.handler = async (event, context) => {
    // Redirect to the editor page with the auth code
    const code = event.queryStringParameters.code;
    
    return {
      statusCode: 302,
      headers: {
        Location: `/editor/?code=${code}`,
      },
    };
  };