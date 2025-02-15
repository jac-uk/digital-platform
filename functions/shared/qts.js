import axios from 'axios';

export default (qtKey) => {
  return {
    get,
    post,
  };

  async function get(url, params) {
    if (process.env.QT_URL && qtKey) {
      try {
        const result = await axios.get(
          `${process.env.QT_URL}/${url}?key=${qtKey}`,
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
    if (process.env.QT_URL && qtKey) {
      try {
        const result = await axios.post(
          `${process.env.QT_URL}/${url}?key=${qtKey}`,
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
