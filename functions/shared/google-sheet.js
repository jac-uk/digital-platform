import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

export default () => {

  return {
    getValues,
  };

  /**
   * Gets cell values from a Spreadsheet.
   * @param {string} spreadsheetId The spreadsheet ID.
   * @param {string} range The sheet range.
   * @return {obj} spreadsheet information
   */
  async function getValues(spreadsheetId, range) {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
  
    const service = google.sheets({version: 'v4', auth});
    try {
      const result = await service.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};
