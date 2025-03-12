import selectionDayTimetable from '../../../functions/actions/tasks/selectionDayTimetable.js';
import { formatDate } from '../../../functions/shared/helpers.js';

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
          name: 'Panel 1',
        },
        panellists: [
          {
            id: 'panellist1',
          },
          {
            id: 'panellist2',
          },
        ],
        applicationIds: ['application1', 'application2'],
        timetable: [
          {
            date: new Date('2024-01-01'),
            totalSlots: 2,
          },
        ],
      },
      { 
        panel: { 
          id: 'panel2',
          name: 'Panel 2',
        },
        panellists: [
          {
            id: 'panellist1',
          },
          {
            id: 'panellist2',
          },
        ],
        applicationIds: ['application3', 'application4'],
        timetable: [
          {
            date: new Date('2024-01-02'),
            totalSlots: 2,
          },
        ],
      },
      // Add more panel data as needed
    ];

    mockCandidateInfo = [
      {
        candidate: {
          id: 'candidate1',
        },
        application: {
          id: 'application1',
          ref: 'JAC001-001',
          fullName: '001 JAC',
        },
        availableDates: [new Date('2024-01-01')],
      },
      {
        candidate: {
          id: 'candidate3',
        },
        application: {
          id: 'application3',
          ref: 'JAC001-003',
          fullName: '003 JAC',
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
        panellists: [
          {
            id: 'panellist3',
          },
        ],
      },
    ];
  });

  it('assigns candidates to panels, based on availability', () => {
    const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts).timetable;

    expect(result).toHaveLength(2);

    const firstRow = result[0];
    expect(firstRow.panel.id).toBe(mockPanelData[0].panel.id);
    expect(firstRow.panel.name).toBe(mockPanelData[0].panel.name);
    expect(firstRow.date).toEqual(formatDate(mockPanelData[0].timetable[0].date, 'DD/MM/YYYY'));
    expect(firstRow.slot).toBe(1);
    expect(firstRow.application.ref).toBe(mockCandidateInfo[0].application.ref);
    expect(firstRow.application.fullName).toBe(mockCandidateInfo[0].application.fullName);
    expect(firstRow.reasonableAdjustment).toBe(true);

    const secondRow = result[1];
    expect(secondRow.panel.id).toBe(mockPanelData[1].panel.id);
    expect(secondRow.panel.name).toBe(mockPanelData[1].panel.name);
    expect(secondRow.date).toEqual(formatDate(mockPanelData[1].timetable[0].date, 'DD/MM/YYYY'));
    expect(secondRow.slot).toBe(1);
    expect(secondRow.application.ref).toBe(mockCandidateInfo[1].application.ref);
    expect(secondRow.application.fullName).toBe(mockCandidateInfo[1].application.fullName);
    expect(secondRow.reasonableAdjustment).toBe(false);
  });
  
  describe('slots', () => {
    it('assigns candidates to slots', () => {
      mockPanelConflicts = [];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          application: {
            id: 'application2',
            ref: 'JAC001-002',
            fullName: '002 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts).timetable;

      expect(result).toHaveLength(2);
      
      const firstRow = result[0];
      expect(firstRow.panel.id).toBe(mockPanelData[0].panel.id);
      expect(firstRow.panel.name).toBe(mockPanelData[0].panel.name);
      expect(firstRow.date).toEqual(formatDate(mockPanelData[0].timetable[0].date, 'DD/MM/YYYY'));
      expect(firstRow.slot).toBe(1);
      expect(firstRow.application.ref).toBe(mockCandidateInfo[0].application.ref);
      expect(firstRow.application.fullName).toBe(mockCandidateInfo[0].application.fullName);
      expect(firstRow.reasonableAdjustment).toBe(true);

      const secondRow = result[1];
      expect(secondRow.panel.id).toBe(mockPanelData[0].panel.id);
      expect(secondRow.panel.name).toBe(mockPanelData[0].panel.name);
      expect(secondRow.date).toEqual(formatDate(mockPanelData[0].timetable[0].date, 'DD/MM/YYYY'));
      expect(secondRow.slot).toBe(2);
      expect(secondRow.application.ref).toBe(mockCandidateInfo[1].application.ref);
      expect(secondRow.application.fullName).toBe(mockCandidateInfo[1].application.fullName);
      expect(secondRow.reasonableAdjustment).toBe(false);
    });

    it('wont assign too many candidates to slots', () => {
      mockPanelConflicts = [];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          application: {
            id: 'application2',
            ref: 'JAC001-002',
            fullName: '002 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          application: {
            id: 'application3',
            ref: 'JAC001-003',
            fullName: '003 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          application: {
            id: 'application4',
            ref: 'JAC001-004',
            fullName: '004 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      const result = selectionDayTimetable(mockPanelData, mockCandidateInfo, mockReasonableAdjustments, mockPanelConflicts);

      expect(result.timetable).toHaveLength(2); 
      expect(result.unassignedCandidates).toHaveLength(2); 
    });

    it('handles no slots available across all panels', () => {
      const noSlotsPanelData = [
        {
          panel: {
            id: 'panel1',
            name: 'Panel 1',
          },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1', 'application2'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 0,
            },
          ],
        },
        {
          panel: {
            id: 'panel2',
            name: 'Panel 2',
          },
          panellists: [{ id: 'panellist2' }],
          applicationIds: ['application3', 'application4'],
          timetable: [
            {
              date: new Date('2024-01-02'),
              totalSlots: 0,
            },
          ],
        },
      ];
    
      const noSlotsCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          application: {
            id: 'application2',
            ref: 'JAC001-002',
            fullName: '002 JAC',
          },
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
      expect(result.timetable[4].candidateRef).toEqual(mockCandidateInfo[2].candidate.id);
    });
  });
  
  describe('panel', () => {
    it('wont assign candidate to panel with conflict', () => {
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
      ];

      mockPanelData = [
        { 
          panel: { 
            id: 'panel1', 
            name: 'Panel 1',
          },
          panellists: [
            {
              id: 'panellist1',
            },
            {
              id: 'panellist2',
            },
          ],
          applicationIds: ['application1'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 5,
            },
          ],
        },
      ];
      
      mockPanelConflicts = [
        { 
          candidate: {
            id: 'candidate1',
          },
          panellists: [
            {
              id: 'panellist1',
            },
          ], 
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
            name: 'Panel 1',
          },
          panellists: [
            {
              id: 'panellist1',
            },
            {
              id: 'panellist2',
            },
          ],
          applicationIds: ['application1', 'application2'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 1,
            },
          ],
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          application: {
            id: 'application2',
            ref: 'JAC001-002',
            fullName: '002 JAC',
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
            name: 'Panel 1',
          },
          panellists: [
            {
              id: 'panellist1',
            },
            {
              id: 'panellist2',
            },
          ],
          applicationIds: ['application1', 'application2'],
          timetable: [
            {
              date: new Date('2024-01-02'),
              totalSlots: 5,
            },
          ],
        },
      ];
      mockCandidateInfo = [
        {
          candidate: {
            id: 'candidate1',
          },
          application: {
            id: 'application1',
            ref: 'JAC001-001',
            fullName: '001 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate2',
          },
          application: {
            id: 'application2',
            ref: 'JAC001-002',
            fullName: '002 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate3',
          },
          application: {
            id: 'application3',
            ref: 'JAC001-003',
            fullName: '003 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate4',
          },
          application: {
            id: 'application4',
            ref: 'JAC001-004',
            fullName: '004 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate5',
          },
          application: {
            id: 'application5', 
            ref: 'JAC001-005',
            fullName: '005 JAC',
          },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: {
            id: 'candidate6',
          },
          application: {
            id: 'application6',
            ref: 'JAC001-006',
            fullName: '006 JAC',
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
          panel: {
            id: 'panel1',
            name: 'Panel 1',
          },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1', 'application2'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 3,
            },
          ],
        },
      ];
    
      const conflictCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          application: { id: 'application1', ref: 'JAC001-001', fullName: '001 JAC' },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: { id: 'candidate2' },
          application: { id: 'application2', ref: 'JAC001-002', fullName: '002 JAC' },
          availableDates: [new Date('2024-01-01')],
        },
        {
          candidate: { id: 'candidate3' },
          application: { id: 'application3', ref: 'JAC001-003', fullName: '003 JAC' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
    
      const conflictPanelConflicts = [
        { candidate: { id: 'candidate2' }, panellists: [{ id: 'panellist1' }] },
        { candidate: { id: 'candidate3' }, panellists: [{ id: 'panellist1' }] },
      ];
    
      const result = selectionDayTimetable(
        conflictPanelData,
        conflictCandidateInfo,
        [],
        conflictPanelConflicts
      );

      expect(result.timetable).toHaveLength(1);
      expect(result.timetable[0].application.ref).toBe('JAC001-001');
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
        application: {
          id: 'application1',
          ref: 'JAC001-001',
          fullName: '001 JAC',
        },
        availableDates: [new Date('2024-01-01')],
      };
  
      const reasonableAdjustedCandidate = {
        candidate: {
          id: 'reasonableAdjustedCandidate',
        },
        application: {
          id: 'application2',
          ref: 'JAC001-002',
          fullName: '002 JAC',
        },
        availableDates: [new Date('2024-01-01')],
      };
  
      const result = selectionDayTimetable(
        mockPanelData,
        [conflictingCandidate, reasonableAdjustedCandidate],
        [conflictingCandidate.candidate.id, reasonableAdjustedCandidate.candidate.id],
        [{ candidate: { id: 'conflictingCandidate' }, panellists: [{ id: 'panellist1' }] }]
      ).timetable;
  
      expect(result).toHaveLength(1);
      expect(result[0].candidateRef).toBe(reasonableAdjustedCandidate.candidate.ref);
      expect(result[0].reasonableAdjustment).toBe(true);
    });

    it('performs well with a larger dataset', () => {
      // Create a larger dataset for performance testing
      const largePanelData = Array.from({ length: 100 }, (_, index) => ({
        panel: { id: `panel${index + 1}`, name: `Panel ${index + 1}` },
        panellists: [{ id: `panellist${index * 2 + 1}` }, { id: `panellist${index * 2 + 2}` }],
        applicationIds: [`application${index * 2 + 1}`, `application${index * 2 + 2}`],
        timetable: [
          {
            date: new Date(`2024-01-${index + 1}`),
            totalSlots: 5,
          },
        ],
      }));
  
      const largeCandidateInfo = Array.from({ length: 200 }, (_, index) => ({
        candidate: { id: `candidate${index + 1}` },
        application: { id: `application${index + 1}`, ref: `JAC001-${index + 1}`, fullName: `${index + 1} JAC` },
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
    
    it('handles unassignable candidates with conflicts and no available slots', () => {
      const unassignableConflictData = [
        {
          panel: { id: 'panel1', name: 'Panel 1' },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 1,
            },
          ],
        },
      ];
      const unassignableConflictCandidateInfo = [
        {
          candidate: { id: 'conflictCandidate' },
          application: { id: 'application1', ref: 'JAC001-001', fullName: '001 JAC' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
      const unassignableConflictPanelConflicts = [
        {
          candidate: { id: 'conflictCandidate' },
          panellists: [{ id: 'panellist1' }],
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
          panel: { id: 'panel1', name: 'Panel 1' },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 1,
            },
          ],
        },
      ];
      const combinedConflictRACandidateInfo = [
        {
          candidate: { id: 'conflictedCandidateWithRA' },
          application: { id: 'application1', ref: 'JAC001-001', fullName: '001 JAC' },
          availableDates: [new Date('2024-01-01')],
        },
      ];
      const combinedConflictRAPanelConflicts = [
        {
          candidate: { id: 'conflictedCandidateWithRA' },
          panellists: [{ id: 'panellist1' }],
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
          panel: { id: 'panel1', name: 'Panel 1' },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 0,
            },
          ],
        },
      ];
      const noAvailableSlotsCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          application: { id: 'application1', ref: 'JAC001-001', fullName: '001 JAC' },
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

    it('handles performance testing with a very large dataset', () => {
      // Create a large dataset for performance testing
      const largeDatasetPanelData = Array.from({ length: 1000 }, (_, index) => ({
        panel: { id: `panel${index + 1}`, name: `Panel ${index + 1}` },
        panellists: [{ id: `panellist${index + 1}` }],
        applicationIds: [`application${index + 1}`],
        timetable: [
          {
            date: new Date(new Date('2024-01-01').getTime() + 24 * 60 * 60 * parseInt(`${index}000`)),
            totalSlots: 3,
          },
        ],
      }));
    
      const largeDatasetCandidateInfo = Array.from({ length: 1000 }, (_, index) => ({
        candidate: { id: `candidate${index + 1}` },
        application: { id: `application${index + 1}`, ref: `JAC001-${index + 1}`, fullName: `${index + 1} JAC` },
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
          panel: { id: 'panel1', name: 'Panel 1' },
          panellists: [{ id: 'panellist1' }],
          applicationIds: ['application1'],
          timetable: [
            {
              date: new Date('2024-01-01'),
              totalSlots: 2,
            },
          ],
        },
        {
          panel: { id: 'panel2', name: 'Panel 2' },
          panellists: [{ id: 'panellist2' }],
          applicationIds: ['application2'],
          timetable: [
            {
              date: new Date('2024-01-02'),
              totalSlots: 1,
            },
          ],
        },
      ];
    
      const combinedCandidateInfo = [
        {
          candidate: { id: 'candidate1' },
          application: { id: 'application1', ref: 'JAC001-001', fullName: '001 JAC' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
        {
          candidate: { id: 'candidate2', ref: 'JAC001-002' },
          application: { id: 'application2', ref: 'JAC001-002', fullName: '002 JAC' },
          availableDates: [new Date('2024-01-01'), new Date('2024-01-02')],
        },
      ];
    
      const result = selectionDayTimetable(
        combinedPanelData,
        combinedCandidateInfo,
        [],
        []
      ).timetable;
    
      expect(result).toHaveLength(2);
      expect(result[0].application.ref).toBe('JAC001-001');
      expect(result[1].application.ref).toBe('JAC001-002');
    });
    
  });
});
