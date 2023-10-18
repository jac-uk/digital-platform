const axios = require('axios');
const { objectHasNestedProperty } = require('./helpers');

/**
 * Zenhub GraphQL API calls
 * As this is a GraphQL API, a response code of 200 does not guarantee that the request was successful.
 * Responses in GraphQL are in JSON and this JSON may contain an "errors" field with a list of errors that occurred with your request.
 * @param {*} config 
 * @returns 
 */
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

        if (objectHasNestedProperty(result, 'data.errors')) {
          const errorsStr = result.data.errors.map(e => e.message).join('\n');
          throw new Error(errorsStr);
        }
        else if (objectHasNestedProperty(result, 'data.data.createIssue.issue.id')) {
          // Return the new issue id from the API
          return result.data.data.createIssue.issue.id;
        }
        else {
          throw new Error('New issue id was not returned from the API');
        }
      } catch(error) {
        console.log('Zenhub createIssue errors:');
        console.log(error);
      }
    }
    return false;
  }
};
