import jwt from 'jsonwebtoken';

export default (CONSTANTS) => {
  return {
    createToken,
    verifyToken,
  };

  /**
   * Create a token(JWT)
   * @see https://github.com/auth0/node-jsonwebtoken for fields of payload and options
   * @param {*} payload 
   * @param {*} options 
   * @returns 
   */
  function createToken(payload, options = { expiresIn: '5m' }) {
    const token = jwt.sign(payload,
      CONSTANTS.JWT_SECRET || 'secret',
      options
    );

    return token;
  }

  function verifyToken(token) {
    const decoded = jwt.verify(token, CONSTANTS.JWT_SECRET || 'secret');
    return decoded;      
  }

};
