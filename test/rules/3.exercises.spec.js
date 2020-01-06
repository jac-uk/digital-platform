const { setup, teardown, setupAdmin } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/testing');

describe("Exercises", () => {
  afterEach(async () => {
    await teardown();
  });
  
  context("Create", () => {
    it("prevent un-authenticated user from creating an exercise", async () => {
      const db = await setup();
      await assertFails(db.collection("exercises").add({}));
    });
  
    it("prevent authenticated user from creating an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection("exercises").add({}));
    });
  
    it("prevent authenticated user with verified email from creating an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection("exercises").add({}));
    });
  
    it("prevent authenticated user with un-verified JAC email from creating an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection("exercises").add({}));
    });
  
    it("allow authenticated user with verified @judicialappointments.digital email to create an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertSucceeds(db.collection("exercises").add({}));
    });
  
    it("allow authenticated user with verified @judicialappointments.gov.uk email to create an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertSucceeds(db.collection("exercises").add({}));
    });
  });

  context("Read", () => {
    it("allow un-authenticated user to read an exercise (TO BE REMOVED WHEN VACANCY COLLECTION IS USED INSTEAD)", async () => {
      const db = await setup();
      await assertSucceeds(db.collection("exercises").get());
      await assertSucceeds(db.collection("exercises").doc('ex1').get());
    });
  
    it("allow authenticated user to read a exercise (TO BE REMOVED WHEN VACANCY COLLECTION IS USED INSTEAD)", async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection("exercises").get());
      await assertSucceeds(db.collection("exercises").doc('ex1').get());
    });

    // it("prevent un-authenticated user from reading exercises", async () => {
    //   const db = await setup();
    //   await assertFails(db.collection("exercises").get());
    // });
  
    // it("prevent authenticated user from reading exercises", async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
    //   await assertFails(db.collection("exercises").get());
    // });
  
    // it("prevent authenticated user with verified email from reading exercises", async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
    //   await assertFails(db.collection("exercises").get());
    // });
  
    // it("prevent authenticated user with un-verified JAC email from reading exercises", async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
    //   await assertFails(db.collection("exercises").get());
    // });
  
    it("allow authenticated user with verified @judicialappointments.digital email to read exercises", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertSucceeds(db.collection("exercises").get());
    });
  
    it("allow authenticated user with verified @judicialappointments.gov.uk email to read exercises", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertSucceeds(db.collection("exercises").get());
    });
  });

  context("Update", () => {
    it("prevent un-authenticated user from updating an exercise", async () => {
      const db = await setup();
      const adminDb = await setupAdmin(db, { 'exercises/ex1': { } });
      await assertFails(db.collection("exercises").doc("ex1").update({}));
    });
  
    it("prevent authenticated user from updating an exercise", async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection("exercises").doc("ex1").update({}));
    });
  
    it("prevent authenticated user with verified email from updating an exercise", async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection("exercises").doc("ex1").update({}));
    });
  
    it("prevent authenticated user with un-verified JAC email from updating an exercise", async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection("exercises").doc("ex1").update({}));
    });
  
    it("allow authenticated user with verified @judicialappointments.digital email to update an exercise", async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertSucceeds(db.collection("exercises").doc("ex1").update({}));
    });
  
    it("allow authenticated user with verified @judicialappointments.gov.uk email to update an exercise", async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertSucceeds(db.collection("exercises").doc("ex1").update({}));
    });
  });

  context("Delete", () => {
    it("prevent un-authenticated user from deleting an exercise", async () => {
      const db = await setup();
      await assertFails(db.collection("exercises").doc("ex1").delete());
    });
  
    it("prevent authenticated user from deleting an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection("exercises").doc("ex1").delete());
    });
  
    it("prevent authenticated user with verified email from deleting an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection("exercises").doc("ex1").delete());
    });
  
    it("prevent authenticated user with un-verified JAC email from deleting an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection("exercises").doc("ex1").delete());
    });
  
    it("allow authenticated user with verified @judicialappointments.digital email to delete an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertSucceeds(db.collection("exercises").doc("ex1").delete());
    });
  
    it("allow authenticated user with verified @judicialappointments.gov.uk email to delete an exercise", async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertSucceeds(db.collection("exercises").doc("ex1").delete());
    });
  });


});
