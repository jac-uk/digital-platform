// @TODO use firestore mock library

const mockSnapshot = {
  id: 'application1',
  ref: 'applications/application1',
  data: () => {
    return {
      referenceNumber: 'applref001',
    };
  },
};

export const mockDb = {
  collection: jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue({
      delete: jest.fn(),
      get: jest.fn().mockReturnValue(mockSnapshot),
    }),
    where: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue(mockSnapshot),
    }),
  }),
};

