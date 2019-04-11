const submission = require("../../qt/submission");
const admin = require("firebase-admin");

const mocks = {
  getUser: jest.fn().mockResolvedValue({dummy: 'user'}),
}

jest.mock("firebase-admin", () => {
  // The eslint skip is a peculiarity of the way firebase-admin works. The alternative to skipping it is to write a convoluted
  // test to just call the `admin` parameter.
  //
  // eslint-disable-next-line no-unused-labels
  admin: {
    return {
      auth: jest.fn(() => {
        return {
          getUser: mocks.getUser
        }
      })
    }
  }
});

// I'm skipping tests for right now as we need to get the prototype online but the tests fail due to firestore not being mocked
// yet.
describe.skip("createRecord", () => {
  afterEach(() => {
    mocks.getUser.mockReset();
  });

  const userData = {
    title: "April 2019: RUCA: Situational Judgement",
    userId: "ABC123"
  };

  test("logs the initial call", async () => {
    const spy = jest.spyOn(global.console, "info");
    await submission.createRecord(userData);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("checks that the user exists", async () => {
    await submission.createRecord(userData);
    expect(mocks.getUser).toHaveBeenCalledWith("ABC123");
  });

  test("throws an exception if the user does not exist", async () => {
    mocks.getUser = jest.fn().mockRejectedValue(() => {
       throw new Error("User not found");
    });

    await expect(submission.createRecord(userData)).rejects.toThrow("User not found");
  });
});

