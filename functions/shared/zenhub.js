const axios = require('axios');

// @TODO: 
// The token is sent in the X-Authentication-Token header. For example, using curl it would be:

// curl -H 'X-Authentication-Token: TOKEN' URL
// Alternatively, you can choose to send the token in the URL using the access_token query string attribute. To do so, add ?access_token=TOKEN to any URL.

// ERRORS
// As this is a GraphQL API, a response code of 200 does not guarantee that the request was successful. Responses in GraphQL are in JSON and this JSON may contain an "errors" field with a list of errors that occurred with your request. Most of the time, if there's an error or something goes wrong with the request you're trying to make, this error field in the response is where you can find information about it.

// It's possible for a few other response codes to come from our API:

// Status Code	Description
// 401	The token is not valid. See Authentication.

module.exports = (config) => {

  const newIssue = {
    label: 'User Feedback',
    assignee: 'drieJAC',
    repositoryId: 'Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvNjAzMjc4NjY',  // Admin repo
  };
  const baseApiUrl = config.ZENHUB_GRAPH_QL_URL;
  const apiKey = config.ZENHUB_GRAPH_QL_API_KEY;
  const axiosHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  
  return {
    createIssue,
  };

  async function createIssue(body) {
    if (baseApiUrl && apiKey) {
      try {
        const timestamp = Date.now();
        newIssue.title = `OJ Zenhub API Test ${timestamp}`;
        const result = await axios({
          url: baseApiUrl,
          method: 'post',
          headers: axiosHeaders,
          data: {
            operationName: 'createIssue',
            query: `
              mutation createIssue {
                createIssue(input: {
                    title: "${newIssue.title}",
                    body: "${body}",
                    repositoryId: "${newIssue.repositoryId}",
                    labels: ["${newIssue.label}"],
                    assignees: ["${newIssue.assignee}"]
                }) {
                    issue {
                        id
                        title
                    }
                }
              }
            `,
          },
        });

        // @TODO: STORE THE ISSUE ID IN THE DB!!

        console.log('ZENHUB ISSUE ID:');
        console.log(result.data.data.createIssue.issue.id);

        return result;
      } catch(error) {
        console.log('Zenhub createIssue error:');
        console.log(error);
      }
    }
    return false;
  }
};
