const admin = require('../../../functions/node_modules/firebase-admin');
const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const test = require("../../../functions/node_modules/firebase-functions-test")()
const verificationTemplateId = "verification-template-123"

let adminStub, jacFunctions

jest.mock("../../../functions/node_modules/notifications-node-client")

beforeAll(() => {
  adminStub = jest.spyOn(admin, "initializeApp");
  jacFunctions = require("../../../functions/index")
})

beforeEach(() => {

  test.mockConfig({
    notify: {
      key: "deadbeef",
      templates: {
        verification: verificationTemplateId
      }
    }
  });

  NotifyClient.mockClear()
})

afterAll(() => {
  adminStub.mockRestore();
  test.cleanup()
})

it("Check that the consumer called the class constructor", () => {
  new NotifyClient()
  expect(NotifyClient).toHaveBeenCalledTimes(1)
})

describe("exports.sendVerificationEmail", () => {
  const mockEvent = {
    data: {
      email: "test@test.com",
      displayName: "Test User"
    }
  };
  describe("NotifyClient.sendEmail", () => {
    let mockNotifyClientInstance

    beforeEach(() => {
      mockNotifyClientInstance = NotifyClient.mock.instances[0]
    })

    it("uses a new instance of the notify client", () => {
      jacFunctions.sendVerificationEmail(mockEvent).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        expect(NotifyClient).toHaveBeenCalledTimes(1)
      })
    })

    it("is only called once per invocation", () => {
      jacFunctions.sendVerificationEmail(mockEvent).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        expect(mockSendEmail).toHaveBeenCalledTimes(1)
      })
    })

    it("is called with the configured Notify template ID", () => {
      jacFunctions.sendVerificationEmail(mockEvent).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        expect(mockSendEmail).toHaveBeenCalledWith(verificationTemplateId,
          expect.anything(),
          expect.anything())
      })
    })

    it("is called with the 'to:' email registered by the user", () => {
      jacFunctions.sendVerificationEmail(mockEvent).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(),
          mockEvent.data.email,
          expect.anything())
      })
    })

    it("is called with the required Notify personalisation object", () => {
      jacFunctions.sendVerificationEmail(mockEvent).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(),
          expect.anything(),
          expect.objectContaining({ personalisation: expect.any(Object) }))
      })
    })
  })

  describe("admin.auth().generateEmailVerificationLink", () => {
    let mockGenerateEmailVerificationLink

    beforeEach(() => {
      mockGenerateEmailVerificationLink = jest.spyOn(admin.auth(), "generateEmailVerificationLink")
      jacFunctions.sendVerificationEmail(mockEvent)
    })

    it("is called once", () => {
      expect(mockGenerateEmailVerificationLink).toHaveBeenCalledTimes(1)
    })

    it("is called with a user email address", () => {
      expect(mockGenerateEmailVerificationLink).toHaveBeenCalledWith(mockEvent.data.email)
    })
  })
})
