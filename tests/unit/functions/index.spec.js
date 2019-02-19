const test = require("../../../functions/node_modules/firebase-functions-test")();
const NotifyClient = require("../../../functions/node_modules/notifications-node-client").NotifyClient;
jest.mock("../../../functions/node_modules/notifications-node-client");

beforeEach(() => {
  NotifyClient.mockClear();
});

it('Check that the consumer called the class constructor', () => {
  const notifyClient = new NotifyClient();
  expect(NotifyClient).toHaveBeenCalledTimes(1);
});
