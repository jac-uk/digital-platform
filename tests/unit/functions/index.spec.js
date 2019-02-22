const admin = require('../../../functions/node_modules/firebase-admin');
const jacFunctions = require("../../../functions/index")
const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const test = require("../../../functions/node_modules/firebase-functions-test")()
const validationTemplateId = "validation-template-123"

jest.mock("../../../functions/node_modules/notifications-node-client")

const mockAuth = jest.fn()
const mockGenVerificationLink = jest.fn()

beforeEach(() => {
  jest.mock("../../../functions/node_modules/firebase-admin", () => {
    return jest.fn().mockImplementation(() => {
      return { auth: mockAuth }
    })
  })

  test.mockConfig({
    notify: {
      key: "deadbeef",
      templates: {
        validation: validationTemplateId
      }
    }
  });

  NotifyClient.mockClear()
})

afterEach(() => {
  test.cleanup()
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

  let mockNotifyClientInstance
  let mockSendEmail

  beforeEach(() => {
    jacFunctions.sendValidationEmail(mockEvent)
    mockNotifyClientInstance = NotifyClient.mock.instances[0]
    mockSendEmail = mockNotifyClientInstance.sendEmail
  })

  it("creates a new instance of the notify client", () => {
    expect(NotifyClient).toHaveBeenCalledTimes(1)
  })

  it("calls .sendEmail once on an instance of the notify client", () => {
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it("calls .sendEmail with the correct template ID", () => {
    expect(mockSendEmail).toHaveBeenCalledWith(validationTemplateId,
      expect.anything(),
      expect.anything())
  })

  it("calls .sendEmail with the correct 'to:' email", () => {
    expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(),
      mockEvent.data.email,
      expect.anything())
  })

  it("calls .sendEmail with the required personalisation object", () => {
    expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(),
      expect.anything(),
      expect.objectContaining({ personalisation: expect.any(Object) }))
  })

  //it("generates a new validation email using admin.auth().generateEmailVerificationLink", () => {
    ////jacFunctions.sendValidationEmail(mockEvent)
    ////expect(mockAuth).toHaveBeenCalledTimes(1)
  //})
})
