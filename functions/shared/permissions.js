import { HttpsError } from 'firebase-functions/v2/https';

const PERMISSIONS = {
  users: {
    label: 'Users',
    permissions: {
      canEnableUsers: {
        label: 'Can enable users',
        value: 'u1',
      },
      canChangeUserRole: {
        label: 'Can change user role',
        value: 'u2',
      },
      canEditRolePermissions: {
        label: 'Can edit role permissions',
        value: 'u3',
      },
      canDeleteUsers: {
        label: 'Can delete users',
        value: 'u4',
      },
      canCreateRoles: {
        label: 'Can create roles',
        value: 'u5',
      },
      canCreateUsers: {
        label: 'Can create users',
        value: 'u6',
      },
      canReadUsers: {
        label: 'Can read users',
        value: 'u7',
      },
    },
  },
  exercises: {
    label: 'Exercises',
    permissions: {
      canReadExercises: {
        label: 'Can read exercises',
        value: 'e1',
      },
      canCreateExercises: {
        label: 'Can create exercises',
        value: 'e2',
      },
      canUpdateExercises: {
        label: 'Can update exercises',
        value: 'e3',
      },
      canDeleteExercises: {
        label: 'Can delete exercises',
        value: 'e4',
      },
      canApproveExercise: {
        label: 'Can approve exercise',
        value: 'e5',
      },
      canResetExercise: {
        label: 'Can reset exercise',
        value: 'e6',
      },
      canAmendAfterLaunch: {
        label: 'Can amend after launch',
        value: 'e7',
      },
      canPublishExercise: {
        label: 'Can publish an exercise as live',
        value: 'e8',
      },
      canDeleteCandidateCharacterInformation: {
        label: 'Can delete candidate character information',
        value: 'e9',
      },
      canSendApplicationReminders: {
        label: 'Can send application reminders',
        value: 'e10',
      },
      canConfigureExercise: {
        label: 'Can configure exercise',
        value: 'e11',
      },
      canResetCharacterIssuesReport: {
        label: 'Can reset character issues report',
        value: 'e12',
      },
    },
  },
  candidates: {
    label: 'Candidates',
    permissions: {
      canReadCandidates: {
        label: 'Can read candidates',
        value: 'c1',
      },
      canCreateCandidates: {
        label: 'Can create candidates',
        value: 'c2',
      },
      canUpdateCandidates: {
        label: 'Can update candidates',
        value: 'c3',
      },
      canDeleteCandidates: {
        label: 'Can delete candidates',
        value: 'c4',
      },
      canFlagCandidates: {
        label: 'Can flag candidates',
        value: 'c5',
      },
    },
  },
  notifications: {
    label: 'Notifications',
    permissions: {
      canReadNotifications: {
        label: 'Can read notifications',
        value: 'n1',
      },
      canCreateNotifications: {
        label: 'Can create notifications',
        value: 'n2',
      },
      canUpdateNotifications: {
        label: 'Can update notifications',
        value: 'n3',
      },
      canDeleteNotifications: {
        label: 'Can delete notifications',
        value: 'n4',
      },
    },
  },
  notes: {
    label: 'Notes',
    permissions: {
      canReadNotes: {
        label: 'Can read notes',
        value: 'nt1',
      },
      canCreateNotes: {
        label: 'Can create notes',
        value: 'nt2',
      },
      canUpdateNotes: {
        label: 'Can update notes',
        value: 'nt3',
      },
      canDeleteNotes: {
        label: 'Can delete notes',
        value: 'nt4',
      },
    },
  },
  panellists: {
    label: 'Panellists',
    permissions: {
      canManagePanellists: {
        label: 'Can manage panellist data',
        value: 'pa1',
      },
      canViewPanellists: {
        label: 'Can view panellists',
        value: 'pa2',
      },
    },
  },
  panels: {
    label: 'Panels',
    permissions: {
      canReadPanels: {
        label: 'Can read panels',
        value: 'p1',
      },
      canCreatePanels: {
        label: 'Can create panels',
        value: 'p2',
      },
      canUpdatePanels: {
        label: 'Can update panels',
        value: 'p3',
      },
      canDeletePanels: {
        label: 'Can delete panels',
        value: 'p4',
      },
    },
  },
  meta: {
    label: 'Meta',
    permissions: {
      canReadMeta: {
        label: 'Can read meta',
        value: 'm1',
      },
      canCreateMeta: {
        label: 'Can create meta',
        value: 'm2',
      },
      canUpdateMeta: {
        label: 'Can update meta',
        value: 'm3',
      },
      canDeleteMeta: {
        label: 'Can delete meta',
        value: 'm4',
      },
    },
  },
  settings: {
    label: 'Settings',
    permissions: {
      canReadSettings: {
        label: 'Can read settings',
        value: 's1',
      },
      canCreateSettings: {
        label: 'Can create settings',
        value: 's2',
      },
      canUpdateSettings: {
        label: 'Can update settings',
        value: 's3',
      },
      canDeleteSettings: {
        label: 'Can delete settings',
        value: 's4',
      },
    },
  },
  applications: {
    label: 'Applications',
    permissions: {
      canReadApplications: {
        label: 'Can read applications',
        value: 'a1',
      },
      canCreateApplications: {
        label: 'Can create applications',
        value: 'a2',
      },
      canUpdateApplications: {
        label: 'Can update applications',
        value: 'a3',
      },
      canDeleteApplications: {
        label: 'Can delete applications',
        value: 'a4',
      },
      canRequestLateApplications: {
        label: 'Can request late applications',
        value: 'a5',
      },
      canApproveLateApplications: {
        label: 'Can approve late applications',
        value: 'a6',
      },
      canCreateTestApplications: {
        label: 'Can create test applications',
        value: 'a7',
      },
    },
  },
  applicationRecords: {
    label: 'ApplicationRecords',
    permissions: {
      canReadApplicationRecords: {
        label: 'Can read applicationRecords',
        value: 'ar1',
      },
      canCreateApplicationRecords: {
        label: 'Can create applicationRecords',
        value: 'ar2',
      },
      canUpdateApplicationRecords: {
        label: 'Can update applicationRecords',
        value: 'ar3',
      },
      canDeleteApplicationRecords: {
        label: 'Can delete applicationRecords',
        value: 'ar4',
      },
    },
  },
  logs: {
    label: 'Logs',
    permissions: {
      canReadLogs: {
        label: 'Can read logs',
        value: 'l1',
      },
      canCreateLogs: {
        label: 'Can create logs',
        value: 'l2',
      },
      canUpdateLogs: {
        label: 'Can update logs',
        value: 'l3',
      },
      canDeleteLogs: {
        label: 'Can delete logs',
        value: 'l4',
      },
    },
  },
  assessments: {
    label: 'Assessments',
    permissions: {
      canReadAssessments: {
        label: 'Can read assessments',
        value: 'as1',
      },
      canCreateAssessments: {
        label: 'Can create assessments',
        value: 'as2',
      },
      canUpdateAssessments: {
        label: 'Can update assessments',
        value: 'as3',
      },
      canDeleteAssessments: {
        label: 'Can delete assessments',
        value: 'as4',
      },
    },
  },
  invitations: {
    label: 'Invitations',
    permissions: {
      canReadInvitations: {
        label: 'Can read invitations',
        value: 'i1',
      },
      canCreateInvitations: {
        label: 'Can create invitations',
        value: 'i2',
      },
      canUpdateInvitations: {
        label: 'Can update invitations',
        value: 'i3',
      },
      canDeleteInvitations: {
        label: 'Can delete invitations',
        value: 'i4',
      },
    },
  },
  messages: {
    label: 'Messages',
    permissions: {
      canReadMessages: {
        label: 'Can read messages',
        value: 'msg1',
      },
      canCreateMessages: {
        label: 'Can create messages',
        value: 'msg2',
      },
      canUpdateMessages: {
        label: 'Can update messages',
        value: 'msg3',
      },
      canDeleteMessages: {
        label: 'Can delete messages',
        value: 'msg4',
      },
    },
  },
  candidateForms: {
    label: 'CandidateForms',
    permissions: {
      canRead: {
        label: 'Can read candidate forms',
        value: 'cf1',
      },
      canCreate: {
        label: 'Can create candidate forms',
        value: 'cf2',
      },
      canUpdate: {
        label: 'Can update candidate forms',
        value: 'cf3',
      },
      canDelete: {
        label: 'Can delete candidate forms',
        value: 'cf4',
      },
    },
  },
  releases: {
    label: 'Releases',
    permissions: {
      canReadReleases: {
        label: 'Can read releases',
        value: 'r1',
      },
    },
  },
  tasks: {
    label: 'Tasks',
    permissions: {
      canCreate: {
        label: 'Can create tasks',
        value: 't1',
      },
      canUpdate: {
        label: 'Can update tasks',
        value: 't2',
      },
      canEditScoreCalculation: {
        label: 'Can edit score calculation',
        value: 't3',
      },
    },
  },
};

export {
  PERMISSIONS,
  hasPermissions,
  convertPermissions
};

function hasPermissions(rolePermissions, permissions) {
  const valid = rolePermissions
    && Array.isArray(rolePermissions)
    && permissions.every(p => rolePermissions.includes(p));

  if (!valid) {
    throw new HttpsError('permission-denied', 'Permission denied');
  }
}

/*
 * Convert permissions using values from PERMISSIONS object
 * @param {Object} role - The role object from the firestore
 * @returns {Array} - An array of permissions
 */
function convertPermissions(role) {
  const convertedPermissions = [];
  if (role && role.enabledPermissions && role.enabledPermissions.length > 0) {
    for (const permission of role.enabledPermissions) {
      for (const group of Object.keys(PERMISSIONS)) {
        for (const p of Object.keys(PERMISSIONS[group].permissions)) {
          if (p === permission) {
            convertedPermissions.push(PERMISSIONS[group].permissions[p].value);
          }
        }
      }
    }
  }
  return convertedPermissions;
}
