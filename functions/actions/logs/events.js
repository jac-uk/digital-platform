module.exports = (firebase, db) => {
  return {
    logEvent,
  };

  /**
   * Logs an event in the firestore database
   */
  async function logEvent(type, description, details, userId) {

    // construct the event document
    const event = {
      timestamp: firebase.firestore.Timestamp.now(),
      userId: userId || null,
      description: description,
      details: details,
    };

    // store the event document in the database
    let docRef = await db.collection('/logs/' + type + '/events').add(event);

    // return the unique key of the document that was created
    return docRef.id;
  }

};
