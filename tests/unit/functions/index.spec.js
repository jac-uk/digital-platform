const admin = require('../../../functions/node_modules/firebase-admin');
const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient
const test = require("../../../functions/node_modules/firebase-functions-test")()
const validationTemplateId = "validation-template-123"

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
				validation: validationTemplateId
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

describe("exports.sendValidationEmail", () => {
	const mockEvent = {
		data: {
			email: "test@test.com",
			displayName: "Test User"
		}
	};
describe("NotifyClient", () => {
		let mockNotifyClientInstance, mockSendEmail

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
	})

	describe("admin.auth().generateEmailVerificationLink", () => {
		let mockGenerateEmailVerificationLink

		beforeEach(() => {
			mockGenerateEmailVerificationLink = jest.spyOn(admin.auth(), "generateEmailVerificationLink");
			jacFunctions.sendValidationEmail(mockEvent)
		})

		it("is called once", () => {
			expect(mockGenerateEmailVerificationLink).toHaveBeenCalledTimes(1)
		})
	})
})
