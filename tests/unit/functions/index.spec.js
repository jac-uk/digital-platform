const admin = require('../../../functions/node_modules/firebase-admin');
const test = require("../../../functions/node_modules/firebase-functions-test")()
//const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const verificationTemplateId = "verification-template-123"

//jest.mock("../../../functions/node_modules/notifications-node-client")

jest
  .spyOn(admin, "initializeApp")
  .mockImplementation(() => jest.fn())

const mockAuth= jest.spyOn(admin, "auth", "get")
const mockGetVerificationEmailLink= jest.spyOn(mockAuth, "getVerificationEmailLink")

const jacFunctions = require("../../../functions/index")

beforeEach(() => {
  test.mockConfig({
    notify: {
      key: "deadbeef",
      templates: {
        verification: verificationTemplateId
      }
    }
  })
  //NotifyClient.mockClear()
})

afterAll(() => {
  test.cleanup()
})

describe("exports.sendVerificationEmail", () => {
  const mockUser = { data: test.auth.exampleUserRecord() }

  describe("NotifyClient.sendEmail", () => {
    //const wrapped = test.wrap(jacFunctions.sendVerificationEmail)
    //let mockNotifyClientInstance

    //beforeEach(() => {
    //mockNotifyClientInstance = NotifyClient.mock.instances[0]
    //})

    //it("uses a new instance of the notify client", () => {
    //return wrapped(mockUser).then(() => {
    ////const mockSendEmail = mockNotifyClientInstance.sendEmail
    ////expect(NotifyClient).toHaveBeenCalledTimes(1)
    //expect(true).toBe(true)
    //})
    //})

    it("is only called once per invocation", () => {
      return jacFunctions.sendVerificationEmail(mockUser).then(() => {
        const mockSendEmail = mockNotifyClientInstance.sendEmail
        return expect(mockSendEmail).toHaveBeenCalledTimes(1)
      })
    })

    //it("is called with the configured Notify template ID", () => {
    //jacFunctions.sendVerificationEmail(mockEvent).then(() => {
    //const mockSendEmail = mockNotifyClientInstance.sendEmail
    //expect(mockSendEmail).toHaveBeenCalledWith(verificationTemplateId,
    //expect.anything(),
    //expect.anything())
    //})
    //})

    //it("is called with the 'to:' email registered by the user", () => {
    //jacFunctions.sendVerificationEmail(mockEvent).then(() => {
    //const mockSendEmail = mockNotifyClientInstance.sendEmail
    //console.log(mockSendEmail)
    //})
    //})

    //it("is called with the required Notify personalisation object", () => {
    //jacFunctions.sendVerificationEmail(mockEvent).then(() => {
    //const mockSendEmail = mockNotifyClientInstance.sendEmail
    //return expect(mockSendEmail).toHaveBeenCalledWith(expect.anything(),
    //expect.anything(),
    //expect.objectContaining({ personalisation: expect.any(Object) }))
    //})
    //})

    //it("set the user email in the personalisation object", () => {
    //jacFunctions.sendVerificationEmail(mockEvent).then(() => {
    //const mockSendEmail = mockNotifyClientInstance.sendEmail
    //expect(mockSendEmail).toHaveBeenCalledWith(
    //expect.objectContaining({ "verificationLink": mockEvent.data.email }),
    //)
    //})
    //})
    //})

    //describe("admin.auth().generateEmailVerificationLink", () => {
    //let mockGenerateEmailVerificationLink

    //beforeEach(() => {
    //mockGenerateEmailVerificationLink = jest.spyOn(admin.auth(), "generateEmailVerificationLink")
    //jacFunctions.sendVerificationEmail(mockEvent)
    //})

    //it("is called once", () => {
    //expect(mockGenerateEmailVerificationLink).toHaveBeenCalledTimes(1)
    //})

    //it("is called with a user email address", () => {
    //expect(mockGenerateEmailVerificationLink).toHaveBeenCalledWith(mockEvent.data.email)
    //})
    //})
  })
})
