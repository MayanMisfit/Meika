exports.handler = async (event) => {
    // Redirect back to the editor page
    return {
      statusCode: 302,
      headers: {
        Location: '/editor/',
      },
    };
  };