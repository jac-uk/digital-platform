const axios = require('axios');
const crypto = require('crypto');
const { objectHasNestedProperty } = require('./helpers');

/**
 * Zenhub GraphQL API calls
 * As this is a GraphQL API, a response code of 200 does not guarantee that the request was successful.
 * Responses in GraphQL are in JSON and this JSON may contain an "errors" field with a list of errors that occurred with your request.
 * @param {*} config 
 * @returns issue id | false
 */
module.exports = (config) => {
  const baseApiUrl = config.ZENHUB_GRAPH_QL_URL;
  const apiKey = config.ZENHUB_GRAPH_QL_API_KEY;
  const axiosHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  
  return {
    createZenhubIssue,
    createGithubIssue,
    validateWebhookRequest,
  };

  /**
   * Creates issue ONLY in Zenhub
   * Cannot set assigness nor labels
   * @param {*} referenceNumber 
   * @param {*} body 
   * @returns 
   */
  async function createZenhubIssue(referenceNumber, body) {
    const platformIssuesRepositoryId = config.ZENHUB_ISSUES_WORKSPACE_ID;
    if (baseApiUrl && apiKey) {
      try {
        const title = `User Raised Issue ${referenceNumber}`;
        const result = await axios({
          url: baseApiUrl,
          method: 'post',
          headers: axiosHeaders,
          data: {
            operationName: 'createIssue',
            query: `
              mutation createIssue {
                createIssue(input: {
                    title: "${title}",
                    body: "${body}",
                    repositoryId: "${platformIssuesRepositoryId}"
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

  /**
   * Creates issue in Github (gets picked up by Zenhub)
   * Cannot set assigness
   * @param {*} referenceNumber 
   * @param {*} body 
   * @returns 
   */
  async function createGithubIssue(referenceNumber, body, label) {
    const platformIssuesRepositoryId = 'Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvMTMzOTczMzA2';
    if (baseApiUrl && apiKey) {
      try {
        const title = `User Raised Issue ${referenceNumber}`;
        const result = await axios({
          url: baseApiUrl,
          method: 'post',
          headers: axiosHeaders,
          data: {
            operationName: 'createIssue',
            query: `
              mutation createIssue {
                createIssue(input: {
                    title: "${title}",
                    body: "${body}",
                    repositoryId: "${platformIssuesRepositoryId}"
                    labels: ["${label}"],
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

  /**
   * Validate a webhook request from Github
   * @param {string} secret 
   * @param {string} header 
   * @param {object} payload 
   * @returns 
   */
  async function validateWebhookRequest(secret, header, payload) {
    const [algorithm, sigHex] = header.split('=');
    const key = Buffer.from(secret, 'utf-8');
    const hmac = crypto.createHmac('sha256', key);
    const payloadString = JSON.stringify(payload); // Convert payload to a string
    const calculatedSigHex = hmac.update(payloadString).digest('hex');
    return calculatedSigHex === sigHex;
  }
};
