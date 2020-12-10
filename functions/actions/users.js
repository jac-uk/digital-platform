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
      console.log('generateSignInWithEmailLink', ref);
      const emailLink = await auth.generateSignInWithEmailLink(email, actionCodeSettings);
      console.log('generateSignInWithEmailLink DONE', ref);
      return emailLink;
    }
  }

  async function canAccessAssessments(ref, email) {
    // @TODO improve ref validation
    let resource = await getDocument(db.doc(ref));
    if (resource && resource.assessor && resource.assessor.email === email) {
      return true;
    }
    return false;
  }

};
