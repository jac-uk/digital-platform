const { setup, teardown, setupAdmin } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/testing');

describe("Applications", () => {
  afterEach(async () => {
    await teardown();
  });

  context("Create", () => {
    it("prevent un-authenticated user from creating an application", async () => {
      const db = await setup();
      await assertFails(db.collection("applications").add({}));
    });
    it("prevent authenticated user from creating a random application", async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection("applications").add({}));
    });
    it("allow authenticated user to create own application", async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection("applications").add({ userId: 'user1' }));
    });
  });

  context("Read", () => {
    it("prevent un-authenticated user from reading application data", async () => {
      const db = await setup();
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection("applications").get());
    });
  
    it("prevent authenticated user from reading application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user2' } });
      await assertFails(db.collection("applications").get());
    });
  
    it("allow authenticated user to read their own application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertSucceeds(db.collection("applications").where('userId', '==', 'user1').get());
    });
  
    it("prevent authenticated user from reading another's application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user2' } });
      await assertFails(db.collection("applications").where('userId', '==', 'user2').get());
    });

    it("allow JAC admin to list all applications", async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'applications/app1': { }, 'applications/app2': { } }
      );
      await assertSucceeds(db.collection("applications").get());
    });    
  });  

  context("Update", () => {
    it("prevent un-authenticated user from updating application data", async () => {
      const db = await setup();
      await assertFails(db.collection("applications").doc("app1").update({}));
    });
    it("prevent authenticated user from updating someone else's application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user2' } });
      await assertFails(db.collection("applications").doc("app1").update({ userId: 'user1' }));
    });
    it("allow authenticated user to update own application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertSucceeds(db.collection("applications").doc("app1").update({}));
    });
    it("prevent authenticated user from updating own application data to belong to someone else", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection("applications").doc("app1").update({ userId: 'user2' }));
    });

  });

  context("Delete", () => {
    it("prevent un-authenticated user from deleting a application", async () => {
      const db = await setup();
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection("applications").doc("app1").delete());
    });
    it("prevent authenticated user from deleting someone else's application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user2' } });
      await assertFails(db.collection("applications").doc("app1").delete());
    });
    it("prevent authenticated user from deleting own application data", async () => {
      const db = await setup({ uid: 'user1' });
      const adminDb = await setupAdmin(db, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection("applications").doc("app1").delete());
    });
  });

});
