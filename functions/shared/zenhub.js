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

  let baseApiUrl, apiKey;
  if (config.ZENHUB_USE_GRAPH_QL_API) {
    baseApiUrl = config.ZENHUB_GRAPH_QL_URL;
    apiKey = config.ZENHUB_GRAPH_QL_API_KEY;
  }
  else {
    baseApiUrl = config.ZENHUB_REST_URL;
    apiKey = config.ZENHUB_REST_API_KEY; 
  }

  const axiosHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    //'Access-Control-Allow-Origin': '*',
  };
  

  return {
    //post,
    createIssue,
    //getRepos,
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

  // data: {
  //  query: `
  //   mutation updateUserCity($id: Int!, $city: String!) {
  //     updateUserCity(userID: $id, city: $city) {
  //       id
  //       name
  //       age
  //       city
  //       knowledge {
  //         language
  //         frameworks
  //       }
  //     }
  //   }
  // `,
  // query: `
  //   mutation createIssue ($title: String!, $body String!, $id: String!, $assignee: String!, $labels: Array!) {
  //     createIssue(title: $title, body: $body, repositoryId: $id, labels: $labels, assignee: $assignee) {
  //         issue {
  //             id
  //             title
  //         }
  //     }
  //   }
  // `,
  // variables: {
  //   // id: 2,
  //   // city: 'Test',
  //   title: `OJ Zenhub API Test ${timestamp}`,
  //   body: 'My new issue body',
  //   repositoryId: 'Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvNjAzMjc4NjY',
  //   labels: ['User Feedback'],
  //   assignees: ['drieJAC'],
  // },
  //}
            

  async function createIssue(bodyParams) {

    console.log('bodyParams:');
    console.log(bodyParams);

    if (baseApiUrl && apiKey) {

      try {
        
        const timestamp = Date.now();

        const result = await axios({
          url: baseApiUrl,
          method: 'post',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          data: {
            operationName: 'createIssue',
            query: `
              mutation createIssue {
                createIssue(input: {
                    title: "OJ Zenhub API Test 5",
                    body: "My new issue body",
                    repositoryId: "Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvNjAzMjc4NjY",
                    labels: ["User Feedback"],
                    assignees: ["drieJAC"]
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

        return result;

      } catch(error) {

        console.log('Zenhub createIssue error:');
        console.log(error);
      }
    }
    return false;
  }
};
