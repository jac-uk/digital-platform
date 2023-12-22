
const selectionDayTimetable = require('../../../functions/actions/tasks/selectionDayTimetable.js');

describe('selectionDayTimetable', () => {
  let mockPanelData;
  let mockCandidateInfo;
  let mockReasonableAdjustments;
  let mockPanelConflicts;
  beforeEach(() => {
    // Mock data for testing
    mockPanelData = [
      { 
        panel: { 
          id: 'panel1', 
        },
        panellists: [
          {
            id: 'panellist1',
          },
          {
            id: 'panellist2',
          },
        ],
        date: new Date('2023-01-01'),
        totalSlots: 5,
      },
      { 
        panel: { 
          id: 'panel2', 
        },
        panellists: [
          {
            id: 'panellist3',
          },
          {
            id: 'panellist4',
          },
        ],
        date: new Date('2023-01-02'),
        totalSlots: 5,
      },
      // Add more panel data as needed
    ];

    mockCandidateInfo = [
      {
        candidate: {
          id: 'candidate1',
        },
        availableDates: [new Date('2023-01-01')],
      },
      {
        candidate: {
          id: 'candidate2',
        },
        availableDates: [new Date('2023-01-02')],
      },
    ];

    mockReasonableAdjustments = [
      'candidate1',
      'candidate4',
      'candidate8',
    ];

    mockPanelConflicts = [
      { 
        candidate: {
          id: 'candidate1',
        },
        panellist: {
          id: 'panellist3',
        },
      },
    ];
  });

  it('assigns candidates to panels, based on availability', () => {
    const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts).timetable;

    expect(result).toHaveLength(2);

    const firstRow = result[0];
    expect(firstRow.Panel).toBe(mockPanelData[0].panel.id);
    expect(firstRow.Date).toEqual(mockPanelData[0].date);
    expect(firstRow.Slot).toBe(1);
    expect(firstRow.CandidateRef).toBe(mockCandidateInfo[0].candidate.id); 
    expect(firstRow.ReasonableAdjustment).toBe(true);

    const secondRow = result[1];
    expect(secondRow.Panel).toBe(mockPanelData[1].panel.id);
    expect(secondRow.Date).toEqual(mockPanelData[1].date);
    expect(secondRow.Slot).toBe(1);
    expect(secondRow.CandidateRef).toBe(mockCandidateInfo[1].candidate.id);
    expect(secondRow.ReasonableAdjustment).toBe(false);
  });

  describe('slots', () => {
    it('assigns candidates to slots', () => {
      mockPanelConflicts = [];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2023-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts).timetable;

      expect(result).toHaveLength(2);

      const firstRow = result[0];
      expect(firstRow.Panel).toBe(mockPanelData[0].panel.id);
      expect(firstRow.Date).toEqual(mockPanelData[0].date);
      expect(firstRow.Slot).toBe(1);
      expect(firstRow.CandidateRef).toBe(mockCandidateInfo[0].candidate.id); 
      expect(firstRow.ReasonableAdjustment).toBe(true);

      const secondRow = result[1];
      expect(secondRow.Panel).toBe(mockPanelData[0].panel.id);
      expect(secondRow.Date).toEqual(mockPanelData[0].date);
      expect(secondRow.Slot).toBe(2);
      expect(secondRow.CandidateRef).toBe(mockCandidateInfo[1].candidate.id);
      expect(secondRow.ReasonableAdjustment).toBe(false);
    });

    it('wont assign too many candidates to slots', () => {
      mockPanelConflicts = [];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2023-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(5); 
      expect(result.unassignedCandidates).toEqual([mockCandidateInfo[5]]);
    });
  });

  describe('panel', () => {
    it('wont assign candidate to panel with conflict', () => {
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2023-01-01')],
        },
      ];

    mockPanelData = [
      { 
        panel: { 
          id: 'panel1', 
        },
        panellists: [
          {
            id: 'panellist1',
          },
          {
            id: 'panellist2',
          },
        ],
        date: new Date('2023-01-01'),
        totalSlots: 5,
      },
    ];

      mockPanelConflicts = [
        { 
          candidate: {
            id: 'candidate1',
          },
          panellist: {
            id: 'panellist1',
          },
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toEqual([]);
      expect(result.unassignedCandidates).toEqual(mockCandidateInfo);
    });

    it('too many candidates for given panels', () => {
      mockPanelConflicts = [];
      mockPanelData = [
        { 
          panel: { 
            id: 'panel1', 
          },
          panellists: [
            {
              id: 'panellist1',
            },
            {
              id: 'panellist2',
            },
          ],
          date: new Date('2023-01-01'),
          totalSlots: 5,
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2023-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(5); 
      expect(result.unassignedCandidates).toEqual([mockCandidateInfo[5]]);  
    });

    it('no available candidates for a panel', () => {
      mockPanelConflicts = [];
      mockPanelData = [
        { 
          panel: { 
            id: 'panel1', 
          },
          panellists: [
            {
              id: 'panellist1',
            },
            {
              id: 'panellist2',
            },
          ],
          date: new Date('2023-01-02'),
          totalSlots: 5,
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2023-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2023-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(0); 
      expect(result.unassignedCandidates).toEqual(mockCandidateInfo);  
    });
  });
    
});
