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

export type JobOrdersListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    totalJobOrders: number;
    sortBy: string;
    sortDirection: string;
    permissions: {
      canAddJobOrder: boolean;
      canEditJobOrder: boolean;
      canDeleteJobOrder: boolean;
      canManageRecruiterAllocation: boolean;
      canToggleMonitored: boolean;
    };
  };
  filters: {
    status: string;
    companyID: number;
    companyName: string;
    onlyMyJobOrders: boolean;
    onlyHotJobOrders: boolean;
  };
  options: {
    statuses: Array<{
      value: string;
      label: string;
      tone: string;
    }>;
    companies: Array<{
      companyID: number;
      name: string;
    }>;
  };
  actions: {
    addJobOrderURL: string;
    addJobOrderPopupURL: string;
    recruiterAllocationURL: string;
    legacyURL: string;
  };
  state: {
    errorMessage: string;
  };
  rows: Array<{
    jobOrderID: number;
    title: string;
    companyName: string;
    companyID: number;
    status: string;
    statusSlug: string;
    isHot: boolean;
    hasAttachment: boolean;
    isMonitored: boolean;
    commentCount: number;
    daysOld: number;
    dateCreated: string;
    submitted: number;
    pipeline: number;
    ownerName: string;
    recruiterName: string;
    showURL: string;
    showLegacyURL: string;
    setMonitoredBaseURL: string;
    companyURL: string;
  }>;
};

export type JobOrdersShowModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    jobOrderID: number;
    isPopup: boolean;
    showClosedPipeline: boolean;
    permissions: {
      canEditJobOrder: boolean;
      canDeleteJobOrder: boolean;
      canViewHistory: boolean;
      canAddCandidateToPipeline: boolean;
      canChangePipelineStatus: boolean;
      canRemoveFromPipeline: boolean;
      canAddComment: boolean;
      canAdministrativeHideShow: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    addCandidateURL: string;
    reportURL: string;
    historyURL: string;
    deleteURL: string;
    hiringPlanURL: string;
  };
  jobOrder: {
    jobOrderID: number;
    title: string;
    titleClass: string;
    companyID: number;
    companyName: string;
    companyURL: string;
    contactID: number;
    contactFullName: string;
    recruiterFullName: string;
    ownerFullName: string;
    enteredByFullName: string;
    status: string;
    type: string;
    typeDescription: string;
    city: string;
    state: string;
    cityAndState: string;
    startDate: string;
    dateCreated: string;
    dateModified: string;
    daysOld: number;
    duration: string;
    maxRate: string;
    salary: string;
    isHot: boolean;
    isAdminHidden: boolean;
    public: boolean;
    description: string;
    notes: string;
    openings: number;
    openingsAvailable: number;
    pipelineCount: number;
    submittedCount: number;
  };
  attachments: {
    count: number;
    items: Array<{
      attachmentID: number;
      fileName: string;
      dateCreated: string;
      icon: string;
      retrievalURL: string;
    }>;
  };
  extraFields: Array<{
    fieldName: string;
    display: string;
  }>;
  hiringPlan: {
    totalOpenings: number;
    items: Array<{
      hiringPlanID: number;
      openings: number;
      description: string;
      startDate: string;
      endDate: string;
    }>;
  };
  comments: {
    count: number;
    flashMessage: string;
    flashIsError: boolean;
  };
  messages: {
    flashMessage: string;
    flashIsError: boolean;
  };
  pipeline: {
    activeCount: number;
    closedCount: number;
    items: Array<{
      candidateJobOrderID: number;
      candidateID: number;
      candidateName: string;
      candidateURL: string;
      statusID: number;
      statusLabel: string;
      statusSlug: string;
      isActive: boolean;
      dateCreated: string;
      country: string;
      isHotCandidate: boolean;
      isDuplicateCandidate: boolean;
      submitted: boolean;
      ratingValue: number;
      ownerName: string;
      addedByName: string;
      actions: {
        changeStatusURL: string;
        removeFromPipelineURL: string;
        pipelineDetailsURL: string;
      };
    }>;
  };
};

export type CandidatesShowModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    candidateID: number;
    showClosedPipeline: boolean;
    isPopup: boolean;
    permissions: {
      canEditCandidate: boolean;
      canDeleteCandidate: boolean;
      canAddToJobOrder: boolean;
      canChangePipelineStatus: boolean;
      canRemoveFromPipeline: boolean;
      canCreateAttachment: boolean;
      canDeleteAttachment: boolean;
      canManageTags: boolean;
      canManageLists: boolean;
      canViewLists: boolean;
      canPostComment: boolean;
      canSendGDPR: boolean;
      candidateMessagingEnabled: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    deleteURL: string;
    addToJobOrderURL: string;
    createAttachmentURL: string;
    addTagsURL: string;
    addToListURL: string;
    linkDuplicateURL: string;
    viewHistoryURL: string;
  };
  candidate: {
    candidateID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    titleClass: string;
    isActive: boolean;
    isHot: boolean;
    email1: string;
    phoneCell: string;
    bestTimeToCall: string;
    address: string;
    city: string;
    country: string;
    dateAvailable: string;
    currentEmployer: string;
    keySkills: string;
    canRelocate: string;
    currentPay: string;
    desiredPay: string;
    owner: string;
    enteredBy: string;
    source: string;
    dateCreated: string;
    dateModified: string;
    pipelineCount: number;
    submittedCount: number;
    notesHTML: string;
    notesText: string;
    profileImageURL: string;
    duplicates: Array<{
      candidateID: number;
      showURL: string;
    }>;
  };
  extraFields: Array<{
    fieldName: string;
    display: string;
  }>;
  eeoValues: Array<{
    fieldName: string;
    fieldValue: string;
  }>;
  gdpr: {
    latestRequest: {
      hasRequest?: boolean;
      status: string;
      createdAt: string;
      emailSentAt: string;
      expiresAt: string;
      deletedAt: string;
      rawStatus?: string;
      requestID?: number;
    };
    deletionRequired: boolean;
    sendEnabled: boolean;
    sendDisabled: boolean;
    sendDisabledReason: string;
    legacyConsent: boolean;
    legacyProof: {
      status: string;
      attachmentID: number;
      link: string;
      fileName: string;
    };
    legacyProofWarning: boolean;
    flashMessage: string;
  };
  tags: string[];
  lists: Array<{
    listID: number;
    name: string;
    url: string;
  }>;
  comments: {
    count: number;
    items: Array<{
      activityID: number;
      dateCreated: string;
      enteredBy: string;
      category: string;
      commentHTML: string;
      commentText: string;
    }>;
  };
  attachments: {
    items: Array<{
      attachmentID: number;
      fileName: string;
      dateCreated: string;
      retrievalURL: string;
      previewAvailable: boolean;
      previewURL: string;
    }>;
    transformCandidates: Array<{
      attachmentID: number;
      originalFilename: string;
    }>;
  };
  pipelines: {
    activeCount: number;
    closedCount: number;
    items: Array<{
      candidateJobOrderID: number;
      jobOrderID: number;
      jobOrderTitle: string;
      jobOrderURL: string;
      clientJobID: string;
      companyID: number;
      companyName: string;
      companyURL: string;
      ownerName: string;
      addedByName: string;
      statusID: number;
      statusLabel: string;
      statusSlug: string;
      isActive: boolean;
      dateCreated: string;
      ratingValue: number;
      actions: {
        changeStatusURL: string;
        removeFromPipelineURL: string;
        pipelineDetailsURL: string;
      };
    }>;
  };
  calendar: Array<{
    eventID: number;
    title: string;
    dateShow: string;
    typeImage: string;
    eventURL: string;
  }>;
  questionnaires: Array<Record<string, unknown>>;
};

export type CandidatesEditModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    candidateID: number;
    permissions: {
      canEditCandidate: boolean;
    };
  };
  actions: {
    submitURL: string;
    showURL: string;
    legacyURL: string;
  };
  candidate: {
    candidateID: number;
    isActive: boolean;
    firstName: string;
    lastName: string;
    email1: string;
    phoneCell: string;
    address: string;
    city: string;
    country: string;
    bestTimeToCall: string;
    dateAvailable: string;
    gdprSigned: boolean;
    gdprExpirationDate: string;
    isHot: boolean;
    source: string;
    owner: string;
    keySkills: string;
    currentEmployer: string;
    currentPay: string;
    desiredPay: string;
    notes: string;
    canRelocate: boolean;
    gender: string;
    race: string;
    veteran: string;
    disability: string;
  };
  options: {
    owners: Array<{
      value: string;
      label: string;
    }>;
    sources: Array<{
      value: string;
      label: string;
    }>;
    sourceCSV: string;
  };
};

export type CandidatesAddModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddCandidate: boolean;
    };
  };
  actions: {
    submitURL: string;
    listURL: string;
    legacyURL: string;
  };
  defaults: {
    firstName: string;
    lastName: string;
    email1: string;
    phoneCell: string;
    address: string;
    city: string;
    country: string;
    bestTimeToCall: string;
    dateAvailable: string;
    gdprSigned: boolean;
    gdprExpirationDate: string;
    source: string;
    keySkills: string;
    currentEmployer: string;
    currentPay: string;
    desiredPay: string;
    notes: string;
    canRelocate: boolean;
    gender: string;
    race: string;
    veteran: string;
    disability: string;
  };
  options: {
    sources: Array<{
      value: string;
      label: string;
    }>;
    sourceCSV: string;
    gdprExpirationYears: number;
  };
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
