const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const test = require("../../../functions/node_modules/firebase-functions-test")()
const validationTemplateId = "validation-template-123"

// mockConfig has to happen BEFORE requiring index.js
test.mockConfig({
  notify: {
    key: "deadbeef",
    templates: {
      validation: validationTemplateId
    }
  }
});

const jacFunctions = require("../../../functions/index")
jest.mock("../../../functions/node_modules/notifications-node-client")

beforeEach(() => {
  NotifyClient.mockClear()
})

it('Check that the consumer called the class constructor', () => {
  new NotifyClient()
  expect(NotifyClient).toHaveBeenCalledTimes(1)
})

describe("exports.sendValidationEmail", () => {

  const mockEvent = {
    data: {
      email: "test@test.com",
      displayName: "Test User"
    }
  };

  it("calls .sendEmail once on an instance of the notify client", () => {
    jacFunctions.sendValidationEmail(mockEvent).then(() => {
      expect(NotifyClient).toHaveBeenCalledTimes(1)
      const mockNotifyClientInstance = NotifyClient.mock.instances[0]
      const mockSendEmail = mockNotifyClientInstance.sendEmail
      expect(mockSendEmail).toHaveBeenCalledTimes(1)
    })
  })

  it("calls .sendEmail with the correct template ID", () => {
    jacFunctions.sendValidationEmail(mockEvent).then(() => {
      expect(NotifyClient).toHaveBeenCalledTimes(1)
      const mockNotifyClientInstance = NotifyClient.mock.instances[0]
      const mockSendEmail = mockNotifyClientInstance.sendEmail
      expect(mockSendEmail).toHaveBeenCalledWith(validationTemplateId, expect.anything(), expect.anything())
    })
  })

  it("calls .sendEmail with the correct 'to:' email", () => {
    jacFunctions.sendValidationEmail(mockEvent).then(() => {
      expect(NotifyClient).toHaveBeenCalledTimes(1)
      const mockNotifyClientInstance = NotifyClient.mock.instances[0]
      const mockSendEmail = mockNotifyClientInstance.sendEmail
      expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(), mockEvent.data.email, expect.anything())
    })
  })

  it("calls .sendEmail with the required personalisation object", () => {
    jacFunctions.sendValidationEmail(mockEvent).then(() => {
      expect(NotifyClient).toHaveBeenCalledTimes(1)
      const mockNotifyClientInstance = NotifyClient.mock.instances[0]
      const mockSendEmail = mockNotifyClientInstance.sendEmail
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ personalisation: expect.any(Object) })
     )
    })
  })
})
