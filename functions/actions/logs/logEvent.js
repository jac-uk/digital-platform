
export default (firebase, db, auth) => {
  return {
    logEvent,
  };

  /**
   * Logs an event in the firestore database
   *
   * @param {string} type - The type of event (info, warning or error)
   * @param {string} description - Description of the event
   * @param {object} details - Details of the event
   * @param {ojbect} user - If not specified, the current logged in user will be used
   * @returns {string} - Document ref for the event
   */
  async function logEvent(type, description, details, user) {

    // if a user has not been specified in the function call, attempt to get the currently logged in user
    if (typeof(user) === 'undefined' && auth.currentUser) {
      user = {
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName || null,
        email: auth.currentUser.email || null,
      };
    }

    // construct the event document
    const event = {
      timestamp: firebase.firestore.Timestamp.now(),
      user: user || null,
      description: description,
      details: details,
    };

    // store the event document in the database
    let docRef = await db.collection('/logs/' + type + '/events').add(event);

    // return the unique key of the document that was created
    return docRef.id;
  }

};
