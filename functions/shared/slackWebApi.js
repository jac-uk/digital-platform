import axios from 'axios';
import { objectHasNestedProperty } from './helpers.js';

/**
 * Calls to the Slack Web API
 *
 * Note: These calls don't currently work when using the local emulator!!
 *
 * @returns an object such as (for eg getUser)
 * { ok: false, error: 'user_not_found' }
 * or
 * { ok: true, warning: 'something_problematic', user: ... }
 * or
 * { ok: true, user: ... }
 *
 * Note: Relies on the following ENV values (or secrets)
 *  SLACK_TICKETING_APP_BOT_TOKEN
 *  SLACK_API_STUB
 */
export default () => {

  return {
    getUser,
  };


  async function getUser(userId) {
    // check for required env values
    if (!process.env.SLACK_API_STUB) return false;
    if (!process.env.SLACK_TICKETING_APP_BOT_TOKEN) return false;

    const apiUrl = `${process.env.SLACK_API_STUB}/users.info?user=${userId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_TICKETING_APP_BOT_TOKEN}`,
        },
      });
      if (objectHasNestedProperty(response, 'data.ok')) {
        // Error
        if (!response.data.ok) {
          console.error(`Slack user lookup error for slack member id: '${userId}' with error: ${response.data.error}`);
        }
        // Warning
        if (objectHasNestedProperty(response, 'data.warning')) {
          console.log(`Slack user lookup warning for slack member id ${userId} with warning: ${response.data.warning}`);
        }
        return response.data.ok;
      }

    } catch (error) {
      // Handle errors here
      console.error('Error:', error.message);
    }
    return false;
  }
};
