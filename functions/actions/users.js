const { getDocument } = require('../shared/helpers');

module.exports = (auth, db) => {
  return {
    generateSignInWithEmailLink,
  };

  async function generateSignInWithEmailLink(ref, email, returnUrl) {
    let hasAccess;
    switch (ref.substring(0, ref.indexOf('/'))) {
      case 'assessments':
        hasAccess = await canAccessAssessments(ref, email);
        break;
      default:
        return false;
    }
    if (!hasAccess) {
      return false;
    } else {
      const actionCodeSettings = {
        url: `${returnUrl}?return=true`,
        handleCodeInApp: true,
      };
      return auth.generateSignInWithEmailLink(email, actionCodeSettings);
    }
  }

  async function canAccessAssessments(ref, email) {
    // @TODO improve ref validation
    let resource = await getDocument(db.doc(ref));
    if (resource.assessor.email === email) {
      return true;
    }
    return false;
  }

}
