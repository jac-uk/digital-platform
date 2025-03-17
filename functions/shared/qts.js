import axios from 'axios';

export default () => {
  return {
    get,
    post,
  };

  async function get(url, params) {
    if (process.env.QT_URL && process.env.QT_KEY) {
      try {
        const result = await axios.get(
          `${process.env.QT_URL}/${url}?key=${process.env.QT_KEY}`,
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
    if (process.env.QT_URL && process.env.QT_KEY) {
      try {
        const result = await axios.post(
          `${process.env.QT_URL}/${url}?key=${process.env.QT_KEY}`,
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
