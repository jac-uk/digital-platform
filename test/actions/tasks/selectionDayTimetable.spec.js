import selectionDayTimetable from '../../../functions/actions/tasks/selectionDayTimetable.js';

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
        date: new Date('2024-01-01'),
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
        date: new Date('2024-01-02'),
        totalSlots: 5,
      },
      // Add more panel data as needed
    ];

    mockCandidateInfo = [
      {
        candidate: {
          id: 'candidate1',
        },
        availableDates: [new Date('2024-01-01')],
      },
      {
        candidate: {
          id: 'candidate2',
        },
        availableDates: [new Date('2024-01-02')],
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
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
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
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(5); 
      expect(result.unassignedCandidates).toEqual([mockCandidateInfo[5]]);
    });

    it('allocates candidates based on availability', () => {
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
          date: new Date('2024-01-01'),
          totalSlots: 1,
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
          date: new Date('2024-01-02'),
          totalSlots: 1,
        },
        { 
          panel: { 
            id: 'panel3', 
          },
          panellists: [
            {
              id: 'panellist5',
            },
            {
              id: 'panellist6',
            },
          ],
          date: new Date('2024-01-03'),
          totalSlots: 1,
        },
      ];
      mockReasonableAdjustments = [];
      mockPanelConflicts = [];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02'), new Date('2024-01-03')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);
    
      expect(result.timetable[0]).toEqual(
        {'CandidateRef': 'candidate2', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': false, 'Slot': 1}
      );
      expect(result.timetable[1]).toEqual(
        {'CandidateRef': 'candidate3', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': false, 'Slot': 1}
      );
      expect(result.timetable[2]).toEqual(
        {'CandidateRef': 'candidate1', 'Date': new Date('2024-01-03'), 'Panel': 'panel3', 'ReasonableAdjustment': false, 'Slot': 1}
      );
      expect(result.unassignedCandidates).toEqual([]);
    });

    it('handles overlapping availability for different slots', () => {
      const overlappingPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 1,
        },
        {
          panel: { id: 'panel2' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-02'),
          totalSlots: 1,
        },
        {
          panel: { id: 'panel3' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-03'),
          totalSlots: 1,
        },
      ];
    
      const overlappingDatesCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-02'), new Date('2024-01-03')],
        },
      ];
    
      const result = selectionDayTimetable(
        overlappingPanelData,
        overlappingDatesCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(2);
      expect(result[0].CandidateRef).toBe('candidate1');
      expect(result[1].CandidateRef).toBe('candidate2');
    });

    it('handles one slot across all panels', () => {
      const oneSlotPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 1,
        },
        {
          panel: { id: 'panel2' },
          panellists: [{ id: 'panellist2' }],
          date: new Date('2024-01-02'),
          totalSlots: 1,
        },
      ];
    
      const oneSlotCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(
        oneSlotPanelData,
        oneSlotCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(2);
      expect(result[0].CandidateRef).toBe('candidate1');
      expect(result[1].CandidateRef).toBe('candidate2');
    });

    it('handles no slots available across all panels', () => {
      const noSlotsPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 0,
        },
        {
          panel: { id: 'panel2' },
          panellists: [{ id: 'panellist2' }],
          date: new Date('2024-01-02'),
          totalSlots: 0,
        },
      ];
    
      const noSlotsCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(
        noSlotsPanelData,
        noSlotsCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(0);
    });

    xit('assigns RA candidates to last slot', () => {
      mockReasonableAdjustments = ['candidate3'];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(5); 
      expect(result.timetable[4].CandidateRef).toEqual(mockCandidateInfo[2].candidate.id);
    });
  });
  
  describe('panel', () => {
    it('wont assign candidate to panel with conflict', () => {
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01')],
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
          date: new Date('2024-01-01'),
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
          date: new Date('2024-01-01'),
          totalSlots: 1,
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(1); 
      expect(result.unassignedCandidates).toEqual([mockCandidateInfo[1]]);  
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
          date: new Date('2024-01-02'),
          totalSlots: 5,
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(0); 
      expect(result.unassignedCandidates).toEqual(mockCandidateInfo);  
    });

    it('handles conflicts within the same panel', () => {
      const conflictPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 3,
        },
      ];
    
      const conflictCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: { id: 'candidate3' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
    
      const conflictPanelConflicts = [
        { candidate: { id: 'candidate2' }, panellist: { id: 'panellist1' } },
        { candidate: { id: 'candidate3' }, panellist: { id: 'panellist1' } },
      ];
    
      const result = selectionDayTimetable(
        conflictPanelData,
        conflictCandidateInfo,
        [],
        conflictPanelConflicts
      );

      expect(result.timetable).toHaveLength(1);
      expect(result.timetable[0].CandidateRef).toBe('candidate1');
      expect(result.unassignedCandidates[0].candidate.id).toBe('candidate2');
      expect(result.unassignedCandidates[1].candidate.id).toBe('candidate3');
    });
  });
  
  describe('edge cases', () => {
    it('no candidates', () => {
      const result = selectionDayTimetable([], [], [], []).timetable;
  
      expect(result).toHaveLength(0);
    });

    it('handles edge case: no panels', () => {
      const result = selectionDayTimetable([], mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts).timetable;
  
      expect(result).toHaveLength(0);
    });
  
    it('handles edge case: no conflicts', () => {
      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, []).timetable;
  
      expect(result).toHaveLength(2); // Assuming there are two panels in mockPanelData
    });
  
    it('handles edge case: no reasonable adjustments', () => {
      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, [], mockPanelConflicts).timetable;
  
      expect(result).toHaveLength(2); // Assuming there are two panels in mockPanelData
    });
  
    it('handles combination of cases', () => {
      // Create a scenario where a candidate has both a conflict and a reasonable adjustment
      const conflictingCandidate = {
        candidate: {
          id: 'conflictingCandidate',
        },
        availableDates: [new Date('2024-01-01')],
      };
  
      const reasonableAdjustedCandidate = {
        candidate: {
          id: 'reasonableAdjustedCandidate',
        },
        availableDates: [new Date('2024-01-01')],
      };
  
      const result = selectionDayTimetable(
        mockPanelData,
        [conflictingCandidate, reasonableAdjustedCandidate],
        [conflictingCandidate.candidate.id, reasonableAdjustedCandidate.candidate.id],
        [{ candidate: { id: 'conflictingCandidate' }, panellist: { id: 'panellist1' } }]
      ).timetable;
  
      expect(result).toHaveLength(1);
      expect(result[0].CandidateRef).toBe(reasonableAdjustedCandidate.candidate.id);
      expect(result[0].ReasonableAdjustment).toBe(true);
    });

    it('performs well with a larger dataset', () => {
      // Create a larger dataset for performance testing
      const largePanelData = Array.from({ length: 100 }, (_, index) => ({
        panel: { id: `panel${index + 1}` },
        panellists: [{ id: `panellist${index * 2 + 1}` }, { id: `panellist${index * 2 + 2}` }],
        date: new Date(`2024-01-${index + 1}`),
        totalSlots: 5,
      }));
  
      const largeCandidateInfo = Array.from({ length: 200 }, (_, index) => ({
        candidate: { id: `candidate${index + 1}` },
        availableDates: [new Date(`2024-01-${index % 10 + 1}`)],
      }));
  
      const result = selectionDayTimetable(largePanelData, largeCandidateInfo, [], []).timetable;
  
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles randomized input data', () => {
      // Create a scenario with randomized input data
      const randomizedPanelData = [...mockPanelData].sort(() => Math.random() - 0.5);
      const randomizedCandidateInfo = [...mockCandidateInfo].sort(() => Math.random() - 0.5);
  
      const result = selectionDayTimetable(randomizedPanelData, randomizedCandidateInfo, [], []).timetable;
  
      expect(result).toHaveLength(2); // Assuming there are two panels in mockPanelData
    });

    it('handles multiple slots and dates', () => {
      const multiSlotPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 3,
        },
        {
          panel: { id: 'panel2' },
          panellists: [{ id: 'panellist2' }],
          date: new Date('2024-01-02'),
          totalSlots: 3,
        },
      ];
      const multiSlotCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate3' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate4' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate5' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate6' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(
        multiSlotPanelData,
        multiSlotCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(6);
    });
    
    it('handles unassignable candidates with conflicts and no available slots', () => {
      const unassignableConflictData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 1,
        },
      ];
      const unassignableConflictCandidateInfo = [
        {
          candidate: { id: 'conflictCandidate' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
      const unassignableConflictPanelConflicts = [
        {
          candidate: { id: 'conflictCandidate' },
          panellist: { id: 'panellist1' },
        },
      ];
    
      const result = selectionDayTimetable(
        unassignableConflictData,
        unassignableConflictCandidateInfo,
        [],
        unassignableConflictPanelConflicts
      ).unassignedCandidates;
    
      expect(result).toHaveLength(1); // Expecting one unassignable candidate
      expect(result[0].candidate.id).toBe('conflictCandidate'); // Ensure correct candidate is unassigned
    });
    
    it('handles combination of conflicts and reasonable adjustments for a candidate', () => {
      const combinedConflictRAData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 1,
        },
      ];
      const combinedConflictRACandidateInfo = [
        {
          candidate: { id: 'conflictedCandidateWithRA' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
      const combinedConflictRAPanelConflicts = [
        {
          candidate: { id: 'conflictedCandidateWithRA' },
          panellist: { id: 'panellist1' },
        },
      ];
      const combinedConflictRAResasonableAdjustments = ['conflictedCandidateWithRA'];
    
      const result = selectionDayTimetable(
        combinedConflictRAData,
        combinedConflictRACandidateInfo,
        combinedConflictRAResasonableAdjustments,
        combinedConflictRAPanelConflicts
      ).unassignedCandidates;
    
      expect(result).toHaveLength(1); // Expecting one slot allocated
      expect(result[0].candidate.id).toBe('conflictedCandidateWithRA'); // Ensure correct candidate is assigned
    });
    
    it('handles edge case with panels having no available slots', () => {
      const noAvailableSlotsData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 0,
        },
      ];
      const noAvailableSlotsCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
    
      const result = selectionDayTimetable(
        noAvailableSlotsData,
        noAvailableSlotsCandidateInfo,
        [],
        []
      ).unassignedCandidates;
    
      expect(result).toHaveLength(1); // Expecting one unassignable candidate
      expect(result[0].candidate.id).toBe('candidate1'); // Ensure correct candidate is unassigned
    });

    it('assigns candidates and handles error cases', () => {
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
          date: new Date('2024-01-01'),
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
          date: new Date('2024-01-02'),
          totalSlots: 5,
        },
        { 
          panel: { 
            id: 'panel3', 
          },
          panellists: [
            {
              id: 'panellist5',
            },
          ],
          date: new Date('2024-01-03'),
          totalSlots: 1,
        },
      ];
      mockPanelConflicts = [
        { 
          candidate: {
            id: 'unassignableCandidateHasConflict',
          },
          panellist: {
            id: 'panellist5',
          },
        },
      ];
      mockCandidateInfo = [
        // all assignable to panel1
        {
          candidate: {
            id: 'candidate1',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          availableDates: [new Date('2024-01-01')],
        },
        // all assignable to panel2
        {
          candidate: {
            id: 'candidate6',
          },
          availableDates: [new Date('2024-01-02')],
        },
        {
          candidate: {
            id: 'candidate7',
          },
          availableDates: [new Date('2024-01-02')],
        },
        {
          candidate: {
            id: 'candidate8',
          },
          availableDates: [new Date('2024-01-02')],
        },
        {
          candidate: {
            id: 'candidate9',
          },
          availableDates: [new Date('2024-01-02')],
        },
        {
          candidate: {
            id: 'candidate10',
          },
          availableDates: [new Date('2024-01-02')],
        },
        // unassignable no slots left
        {
          candidate: {
            id: 'unassignableCandidateNoSlotsLeft',
          },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        // unassignable candidate has conflict
        {
          candidate: {
            id: 'unassignableCandidateHasConflict',
          },
          availableDates: [new Date('2024-01-03')],
        },
      ];
    
      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);
    
      expect(result.timetable).toEqual([
        // panel1 candidates
        {'CandidateRef': 'candidate1', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': true, 'Slot': 1},
        {'CandidateRef': 'candidate2', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': false, 'Slot': 2},
        {'CandidateRef': 'candidate3', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': false, 'Slot': 3},
        {'CandidateRef': 'candidate4', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': true, 'Slot': 4},
        {'CandidateRef': 'candidate5', 'Date': new Date('2024-01-01'), 'Panel': 'panel1', 'ReasonableAdjustment': false, 'Slot': 5},
        // panel2 candidates
        {'CandidateRef': 'candidate6', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': false, 'Slot': 1},
        {'CandidateRef': 'candidate7', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': false, 'Slot': 2},
        {'CandidateRef': 'candidate8', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': true, 'Slot': 3},
        {'CandidateRef': 'candidate9', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': false, 'Slot': 4},
        {'CandidateRef': 'candidate10', 'Date': new Date('2024-01-02'), 'Panel': 'panel2', 'ReasonableAdjustment': false, 'Slot': 5},
      ]);
      expect(result.unassignedCandidates).toEqual([
        // unassignable candidates
          mockCandidateInfo[10],
          mockCandidateInfo[11],
      ]);
    });

    it('handles performance testing with a very large dataset', () => {
      // Create a large dataset for performance testing
      const largeDatasetPanelData = Array.from({ length: 1000 }, (_, index) => ({
        panel: { id: `panel${index + 1}` },
        panellists: [{ id: `panellist${index + 1}` }],
        date: new Date(new Date('2024-01-01').getTime() + 24 * 60 * 60 * parseInt(`${index}000`)),
        totalSlots: 3,
      }));
    
      const largeDatasetCandidateInfo = Array.from({ length: 1000 }, (_, index) => ({
        candidate: { id: `candidate${index + 1}` },
        availableDates: [new Date(new Date('2024-01-01').getTime() + 24 * 60 * 60 * parseInt(`${index}000`)), new Date(new Date('2024-01-01').getTime() + 24 * 60 * 60 * parseInt(`${index+1}000`))],
      }));

      const result = selectionDayTimetable(
        largeDatasetPanelData,
        largeDatasetCandidateInfo,
        [],
        []
      );
      
      expect(result.timetable).toHaveLength(1000);
      expect(result.unassignedCandidates).toHaveLength(0);
    });
    
    it('handles a combination of cases', () => {
      // Combine multiple scenarios to test a variety of situations simultaneously
      const combinedPanelData = [
        {
          panel: { id: 'panel1' },
          panellists: [{ id: 'panellist1' }],
          date: new Date('2024-01-01'),
          totalSlots: 2,
        },
        {
          panel: { id: 'panel2' },
          panellists: [{ id: 'panellist2' }],
          date: new Date('2024-01-02'),
          totalSlots: 1,
        },
      ];
    
      const combinedCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate3' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(
        combinedPanelData,
        combinedCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(3);
      expect(result[0].CandidateRef).toBe('candidate1');
      expect(result[1].CandidateRef).toBe('candidate2');
      expect(result[2].CandidateRef).toBe('candidate3');
    });
    
  });
});
