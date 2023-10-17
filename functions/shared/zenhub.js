const axios = require('axios');

// @TODO: 
// The token is sent in the X-Authentication-Token header. For example, using curl it would be:

// curl -H 'X-Authentication-Token: TOKEN' URL
// Alternatively, you can choose to send the token in the URL using the access_token query string attribute. To do so, add ?access_token=TOKEN to any URL.

module.exports = (config) => {

  let baseApiUrl, apiKey;
  if (config.ZENHUB_USE_GRAPH_QL_API) {
    baseApiUrl = config.ZENHUB_GRAPH_QL_URL;
    apiKey = config.ZENHUB_GRAPH_QL_API_KEY;
  }
  else {
    baseApiUrl = config.ZENHUB_REST_URL;
    apiKey = config.ZENHUB_REST_API_KEY; 
  }

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
  

  return {
    //post,
    createIssue,
    getRepos,
  };

  // async function post(msgString) {
  //   if (config.SLACK_URL) {
  //     const result = await axios.post(
  //       config.SLACK_URL,
  //       {
  //         text: msgString,
  //       }
  //     );
  //     return result;
  //   }
  //   return false;
  // }

  async function createIssue(bodyParams) {
    if (baseApiUrl && apiKey) {

      // @TODO: Build the endpoint from the ZENHUB_URL!!

      try {
        const result = await axios.post(
          baseApiUrl,
          bodyParams,
          axiosConfig
        );
        return result;
      } catch(error) {

        // ERRORS
        // As this is a GraphQL API, a response code of 200 does not guarantee that the request was successful. Responses in GraphQL are in JSON and this JSON may contain an "errors" field with a list of errors that occurred with your request. Most of the time, if there's an error or something goes wrong with the request you're trying to make, this error field in the response is where you can find information about it.

        // It's possible for a few other response codes to come from our API:

        // Status Code	Description
        // 401	The token is not valid. See Authentication.

        console.log('Zenhub createIssue error:');
        console.log(error);
      }
    }
    return false;
  }
};
