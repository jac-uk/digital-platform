import axios from 'axios';

export default (config) => {

  return {
    get,
    post,
  };

  async function get(url, params) {
    if (config.QT_URL && config.QT_KEY) {
      try {
        const result = await axios.get(
          `${config.QT_URL}/${url}?key=${config.QT_KEY}`,
          { params: params }
        );
        return result.data;
      } catch (e) {
        return {
          success: false,
          message: e.message,
        };
      }
    }
    return {
      success: false,
      message: 'Check config',
    };
  }

  async function post(url, data) {
    if (config.QT_URL && config.QT_KEY) {
      try {
        const result = await axios.post(
          `${config.QT_URL}/${url}?key=${config.QT_KEY}`,
          data
        );
        return result.data;
      } catch (e) {
        return {
          success: false,
          message: e.message,
        };
      }
    }
    return {
      success: false,
      message: 'Check config',
    };
  }

};
