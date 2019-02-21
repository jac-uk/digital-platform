const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const test = require("../../../functions/node_modules/firebase-functions-test")()

// mockConfig has to happen BEFORE requiring index.js
test.mockConfig({
  notify: {
    key: "deadbeef",
    validate: "template-id-abc-123"
  }
});

const jacFunctions = require("../../../functions/index")
jest.mock("../../../functions/node_modules/notifications-node-client")

beforeEach(() => {
  NotifyClient.mockClear()
})

it('Check that the consumer called the class constructor', () => {
  const notifyClient = new NotifyClient()
  expect(NotifyClient).toHaveBeenCalledTimes(1)
})

describe("Validation email", () => {

  const mockEvent = {
    data: {
      email: "test@test.com",
      displayName: "Test User"
    }
  };

  it("is sent when a user registers", () => {
    jacFunctions.sendValidationEmail(mockEvent).then(() => {
      expect(NotifyClient).toHaveBeenCalledTimes(1)
      const mockNotifyClientInstance = NotifyClient.mock.instances[0]
      const mockSendEmail = mockNotifyClientInstance.sendEmail
      expect(mockSendEmail).toHaveBeenCalledTimes(1)
    })
  })
})
