export type UIModeBootstrap = {
  targetModule: string;
  targetAction: string;
  indexName: string;
  requestURI: string;
  siteID: number;
  userID: number;
  fullName: string;
  mode: 'modern' | 'legacy';
  legacyURL: string;
  modernURL: string;
  resolvedBy: string;
  timestampUTC: string;
};

export type DashboardModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    scope: 'mine' | 'all';
    view: 'list' | 'kanban';
    showClosed: boolean;
    canViewAllScopes: boolean;
    jobOrderScopeLabel: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    permissions?: {
      canChangeStatus: boolean;
      canAssignToJobOrder: boolean;
    };
    statusRules?: {
      rejectedStatusID: number;
      orderedStatusIDs: number[];
    };
  };
  filters: {
    companyID: number;
    jobOrderID: number;
    statusID: number;
  };
  options: {
    companies: Array<{ companyID: number; name: string }>;
    jobOrders: Array<{ jobOrderID: number; title: string; companyName: string }>;
    statuses: Array<{ statusID: number; status: string }>;
  };
  rows: Array<{
    candidateID: number;
    candidateName: string;
    candidateURL: string;
    jobOrderID: number;
    jobOrderTitle: string;
    jobOrderURL: string;
    companyID: number;
    companyName: string;
    candidateJobOrderID?: number;
    statusID: number;
    statusLabel: string;
    statusSlug: string;
    lastStatusChangeDisplay: string;
    location: string;
    isActive: number;
  }>;
};

export type CandidatesListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    totalCandidates: number;
    sortBy: string;
    sortDirection: string;
    permissions: {
      canAddCandidate: boolean;
      canEditCandidate: boolean;
      canDeleteCandidate: boolean;
      canAddToList: boolean;
      canAddToJobOrder: boolean;
      canEmailCandidates: boolean;
    };
  };
  filters: {
    quickSearch: string;
    sourceFilter: string;
    onlyMyCandidates: boolean;
    onlyHotCandidates: boolean;
    onlyGdprUnsigned: boolean;
    onlyInternalCandidates: boolean;
    onlyActiveCandidates: boolean;
  };
  options: {
    sources: Array<{
      value: string;
      label: string;
    }>;
  };
  state: {
    topLog: string;
  };
  rows: Array<{
    candidateID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    city: string;
    country: string;
    keySkills: string;
    source: string;
    ownerName: string;
    createdDate: string;
    modifiedDate: string;
    isHot: boolean;
    commentCount: number;
    hasAttachment: boolean;
    hasDuplicate: boolean;
    isSubmitted: boolean;
    candidateURL: string;
    candidateEditURL: string;
    addToListURL: string;
    addToJobOrderURL: string;
  }>;
};

export type QuickActionAddToListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  dataItem: {
    type: number;
    typeLabel: string;
    ids: number[];
  };
  permissions: {
    canManageLists: boolean;
    canDeleteLists: boolean;
  };
  sessionCookie: string;
  lists: Array<{
    savedListID: number;
    description: string;
    numberEntries: number;
  }>;
};
