const PERMISSIONS = {
  // TODO: Consider camelCase vs ALL_CAPS
  // DATABASE
  canCreate: 'd1',
  canUpdate: 'd2',
  canDelete: 'd3',
  // USERS
  canEnableUsers: 'u1',
  canChangeUserRole: 'u2',
  canEditRolePermissions: 'u3',
  // EXERCISE
  canApproveExercise: 'e1',
  canAddNotesToExercise: 'e2',
  canResetExercise: 'e3',
  canAmendAfterLaunch: 'e4',
  //CANDIDATES
  canViewAllCandidates: 'c1',
  canAddNotesToCandidates: 'c2',
};

module.exports = PERMISSIONS;
