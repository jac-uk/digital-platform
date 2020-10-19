
const mockConfig = jest.fn();
const mockFirebase = jest.fn();
const mockDb = jest.fn();

const { qtReportLookupRank, qtReportScoresReport } = require('../../../functions/actions/qualifyingTests/generateQualifyingTestReport')(mockConfig, mockFirebase, mockDb);

describe('qtReportScoresReport()', () => {

  it('returns report', async () => {
    const mockRawData = [
      {
        diversity: {
          female: true,
          bame: false,
          solicitor: false,
          disability: false,
        },
        score: 10,
      },
      {
        diversity: {
          female: true,
          bame: true,
          solicitor: false,
          disability: false,
        },
        score: 10,
      },
    ];
    const expectedReport = [
      {
        score: 10,
        count: 2,
        rank: 1,
        cumulativeDiversity: {
          female: 2,
          bame: 1,
          solicitor: 0,
          disability: 0,
        },
        diversity: {
          female: 2,
          bame: 1,
          solicitor: 0,
          disability: 0,
        },
      },
    ];
    const lookupData = qtReportLookupRank(mockRawData);
    const report = qtReportScoresReport(mockRawData, lookupData);
    expect(report).toEqual(expectedReport);
  });

});
