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
      rejectionOtherReasonID?: number;
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
    rejectionReasons?: Array<{ reasonID: number; label: string }>;
  };
  actions?: {
    setPipelineStatusURL?: string;
    setPipelineStatusToken?: string;
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
    source?: string;
    keySkills?: string;
    ownerName?: string;
    recruiterName?: string;
    gdprSigned?: boolean;
    dateAdded?: string;
    rejectionReasons?: string;
  }>;
};

export type DashboardSetPipelineStatusResponse = {
  success: boolean;
  code?: string;
  message?: string;
  updatedStatusID?: number;
  updatedStatusLabel?: string;
  historyID?: number;
  autoFilledStatusIDs?: number[];
};

export type PipelineRemoveModernResponse = {
  success: boolean;
  code?: string;
  message?: string;
  candidateID?: number;
  jobOrderID?: number;
};

export type PipelineStatusDetailsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    pipelineID: number;
    candidateID: number;
    jobOrderID: number;
  };
  permissions: {
    canEditHistory: boolean;
  };
  actions: {
    editDateURL: string;
    legacyDetailsURL: string;
  };
  pipeline: {
    pipelineID: number;
    candidateID: number;
    candidateName: string;
    jobOrderID: number;
    jobOrderTitle: string;
    companyName: string;
  };
  summary: {
    totalTransitions: number;
    autoTransitions: number;
    editedTransitions: number;
    latestTransitionDisplay: string;
  };
  history: Array<{
    historyID: number;
    dateRaw: string;
    dateDisplay: string;
    dateEdit: string;
    statusFromID: number;
    statusFrom: string;
    statusFromSlug: string;
    statusToID: number;
    statusTo: string;
    statusToSlug: string;
    enteredByID: number;
    enteredByName: string;
    commentText: string;
    commentIsSystem: boolean;
    isAutoTransition: boolean;
    rejectionReasons: string;
    rejectionReasonOther: string;
    editedAt: string;
    editedAtDisplay: string;
    editedByName: string;
    editNote: string;
  }>;
};

export type PipelineStatusHistoryUpdateResponse = {
  success: boolean;
  code?: string;
  message?: string;
  pipelineID?: number;
  updatedCount?: number;
  updatedHistoryIDs?: number[];
};

export type ModernMutationResponse = {
  success: boolean;
  code?: string;
  message?: string;
};

export type ImportBulkResumesModernMutationResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  success: boolean;
  code?: string;
  message?: string;
  redirectURL?: string;
};

export type ImportDeleteBulkResumesModernMutationResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  success: boolean;
  code?: string;
  message?: string;
  redirectURL?: string;
};

export type CandidateGoogleDriveUploadMutationResponse = ModernMutationResponse & {
  editURL?: string;
  fileID?: string;
  fileName?: string;
  authURL?: string;
  reusedExisting?: boolean;
  googleDriveLinked?: boolean;
};

export type CandidateGoogleDriveDeleteMutationResponse = ModernMutationResponse & {
  authURL?: string;
  attachmentID?: number;
  googleDriveLinked?: boolean;
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
    gdprSigned: boolean;
    pipelineActiveCount: number;
    isInPipeline: boolean;
    candidateURL: string;
    candidateEditURL: string;
    addToListURL: string;
    addToJobOrderURL: string;
  }>;
};

export type CandidateResumeModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    listURL: string;
    candidateURL: string;
    legacyURL: string;
  };
  state: {
    query: string;
    hasData: boolean;
  };
  resume: {
    attachmentID: number;
    candidateID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    title: string;
    text: string;
  };
};

export type CompaniesListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    sortBy: string;
    sortDirection: string;
    permissions: {
      canAddCompany: boolean;
      canEditCompany: boolean;
      canDeleteCompany: boolean;
      canAddToList: boolean;
    };
  };
  filters: {
    quickSearch: string;
    onlyMyCompanies: boolean;
    onlyHotCompanies: boolean;
  };
  actions: {
    addCompanyURL: string;
    legacyURL: string;
  };
  rows: Array<{
    companyID: number;
    name: string;
    isHot: boolean;
    jobs: number;
    city: string;
    country: string;
    phone: string;
    webSite: string;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    hasAttachment: boolean;
    showURL: string;
    editURL: string;
    addToListURL: string;
  }>;
};

export type CompaniesShowModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    companyID: number;
    permissions: {
      canEditCompany: boolean;
      canDeleteCompany: boolean;
      canAddJobOrder: boolean;
      canAddContact: boolean;
      canCreateAttachment: boolean;
      canDeleteAttachment: boolean;
      canViewHistory: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    deleteURL: string;
    addJobOrderURL: string;
    addContactURL: string;
    historyURL: string;
    createAttachmentURL: string;
    deleteAttachmentURL: string;
    deleteAttachmentToken: string;
  };
  company: {
    companyID: number;
    name: string;
    isHot: boolean;
    titleClass: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    cityAndState: string;
    billingContactID: number;
    billingContactFullName: string;
    webSite: string;
    keyTechnologies: string;
    dateCreated: string;
    enteredByFullName: string;
    ownerFullName: string;
    notesHTML: string;
    notesText: string;
  };
  attachments: {
    count: number;
    items: Array<{
      attachmentID: number;
      fileName: string;
      dateCreated: string;
      retrievalURL: string;
    }>;
  };
  jobOrders: {
    count: number;
    items: Array<{
      jobOrderID: number;
      title: string;
      status: string;
      type: string;
      dateCreated: string;
      dateModified: string;
      daysOld: number;
      submitted: number;
      pipeline: number;
      showURL: string;
      editURL: string;
    }>;
  };
  contacts: {
    count: number;
    activeCount: number;
    items: Array<{
      contactID: number;
      firstName: string;
      lastName: string;
      title: string;
      department: string;
      email: string;
      phone: string;
      dateCreated: string;
      ownerName: string;
      leftCompany: boolean;
      showURL: string;
      editURL: string;
    }>;
  };
  departments: Array<{
    departmentID: number;
    name: string;
  }>;
  extraFields: Array<{
    fieldName: string;
    display: string;
  }>;
};

type CompanyModernExtraField = {
  postKey: string;
  fieldName: string;
  inputType: 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'date';
  value: string;
  options: string[];
};

export type CompaniesAddModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddCompany: boolean;
    };
  };
  actions: {
    submitURL: string;
    listURL: string;
    legacyURL: string;
  };
  defaults: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    url: string;
    keyTechnologies: string;
    notes: string;
    isHot: boolean;
    departmentsCSV: string;
  };
  extraFields: CompanyModernExtraField[];
};

export type CompaniesEditModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    companyID: number;
    permissions: {
      canEditCompany: boolean;
    };
  };
  actions: {
    submitURL: string;
    showURL: string;
    listURL: string;
    legacyURL: string;
  };
  company: {
    companyID: number;
    name: string;
    defaultCompany: boolean;
    isHot: boolean;
    phone: string;
    address: string;
    city: string;
    country: string;
    url: string;
    keyTechnologies: string;
    notes: string;
    owner: string;
    billingContact: string;
    departmentsCSV: string;
  };
  options: {
    owners: Array<{
      value: string;
      label: string;
    }>;
    billingContacts: Array<{
      value: string;
      label: string;
    }>;
    canSendOwnershipEmail: boolean;
  };
  departments: Array<{
    departmentID: number;
    name: string;
  }>;
  extraFields: CompanyModernExtraField[];
};

export type ContactsListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    totalContacts: number;
    sortBy: string;
    sortDirection: string;
    permissions: {
      canAddContact: boolean;
      canEditContact: boolean;
      canDeleteContact: boolean;
      canAddToList: boolean;
      canShowColdCallList: boolean;
    };
  };
  filters: {
    quickSearch: string;
    onlyMyContacts: boolean;
    onlyHotContacts: boolean;
  };
  actions: {
    addContactURL: string;
    coldCallListURL: string;
    legacyURL: string;
  };
  state: {
    errorMessage: string;
  };
  rows: Array<{
    contactID: number;
    companyID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    companyName: string;
    title: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    isHot: boolean;
    leftCompany: boolean;
    hasAttachment: boolean;
    showURL: string;
    editURL: string;
    companyURL: string;
    addToListURL: string;
  }>;
};

export type ContactsColdCallListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    totalRows: number;
    permissions: {
      canShowColdCallList: boolean;
      canDownloadVCard: boolean;
    };
  };
  actions: {
    listURL: string;
    legacyURL: string;
  };
  rows: Array<{
    contactID: number;
    companyID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    title: string;
    phoneCell: string;
    companyName: string;
    showURL: string;
    companyURL: string;
    downloadVCardURL: string;
  }>;
};

export type ContactsShowModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    contactID: number;
    permissions: {
      canEditContact: boolean;
      canDeleteContact: boolean;
      canViewHistory: boolean;
      canManageLists: boolean;
      canOpenLists: boolean;
      canLogActivityScheduleEvent: boolean;
      canAddActivityScheduleEvent: boolean;
      canEditActivity: boolean;
      canDeleteActivity: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    deleteURL: string;
    historyURL: string;
    downloadVCardURL: string;
    addActivityURL: string;
    scheduleEventURL: string;
    manageListsURL: string;
    sessionCookie: string;
  };
  contact: {
    contactID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    title: string;
    department: string;
    companyID: number;
    companyName: string;
    companyShowURL: string;
    phoneWork: string;
    phoneCell: string;
    phoneOther: string;
    email1: string;
    email2: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    cityAndState: string;
    isHotContact: boolean;
    leftCompany: boolean;
    reportsToID: number;
    reportsToName: string;
    reportsToTitle: string;
    reportsToURL: string;
    dateCreated: string;
    dateModified: string;
    enteredByFullName: string;
    ownerFullName: string;
    titleClassContact: string;
    titleClassCompany: string;
    notesHTML: string;
    notesText: string;
    shortNotesHTML: string;
    isShortNotes: boolean;
  };
  jobOrders: {
    count: number;
    items: Array<{
      jobOrderID: number;
      title: string;
      type: string;
      status: string;
      dateCreated: string;
      dateModified: string;
      startDate: string;
      daysOld: number;
      submitted: number;
      pipeline: number;
      recruiterName: string;
      ownerName: string;
      showURL: string;
      editURL: string;
    }>;
  };
  extraFields: Array<{
    fieldName: string;
    display: string;
  }>;
  upcomingEvents: {
    count: number;
    items: Array<{
      eventID: number;
      title: string;
      dateDisplay: string;
      typeImage: string;
      enteredByName: string;
      day: number;
      month: number;
      year: string;
      showURL: string;
    }>;
  };
  activity: {
    count: number;
    items: Array<{
      activityID: number;
      type: string;
      dateCreated: string;
      enteredByName: string;
      regarding: string;
      notes: string;
      jobOrderID: number;
    }>;
  };
  lists: {
    count: number;
    items: Array<{
      listID: number;
      name: string;
      showURL: string;
    }>;
  };
};

type ContactModernExtraField = {
  postKey: string;
  fieldName: string;
  inputType: 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'date';
  value: string;
  options: string[];
};

export type ContactsAddModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddContact: boolean;
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
    companyID: string;
    title: string;
    department: string;
    departmentsCSV: string;
    reportsTo: string;
    isHot: boolean;
    email1: string;
    email2: string;
    phoneWork: string;
    phoneCell: string;
    phoneOther: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  };
  options: {
    companies: Array<{
      value: string;
      label: string;
    }>;
    reportsTo: Array<{
      value: string;
      label: string;
    }>;
    defaultCompanyID: number;
    departments: Array<{
      departmentID: number;
      name: string;
    }>;
  };
  extraFields: ContactModernExtraField[];
};

export type ContactsEditModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    contactID: number;
    permissions: {
      canEditContact: boolean;
    };
  };
  actions: {
    submitURL: string;
    showURL: string;
    listURL: string;
    legacyURL: string;
  };
  contact: {
    contactID: number;
    firstName: string;
    lastName: string;
    companyID: string;
    title: string;
    department: string;
    departmentsCSV: string;
    reportsTo: string;
    isHot: boolean;
    leftCompany: boolean;
    owner: string;
    email1: string;
    email2: string;
    phoneWork: string;
    phoneCell: string;
    phoneOther: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  };
  options: {
    companies: Array<{
      value: string;
      label: string;
    }>;
    owners: Array<{
      value: string;
      label: string;
    }>;
    reportsTo: Array<{
      value: string;
      label: string;
    }>;
    defaultCompanyID: number;
    canSendOwnershipEmail: boolean;
    departments: Array<{
      departmentID: number;
      name: string;
    }>;
  };
  extraFields: ContactModernExtraField[];
};

export type ActivityListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    sortBy: string;
    sortDirection: string;
  };
  filters: {
    quickSearch: string;
    period: string;
    startDate: string;
    endDate: string;
    dataItemType: string;
    activityTypeID: number;
  };
  options: {
    periods: Array<{
      value: string;
      label: string;
    }>;
    dataItemTypes: Array<{
      value: string;
      label: string;
    }>;
    activityTypes: Array<{
      activityTypeID: number;
      label: string;
    }>;
  };
  actions: {
    legacyURL: string;
  };
  rows: Array<{
    activityID: number;
    dataItemID: number;
    dataItemType: number;
    dataItemTypeKey: 'candidate' | 'contact';
    firstName: string;
    lastName: string;
    fullName: string;
    isHot: boolean;
    dateCreated: string;
    typeDescription: string;
    notes: string;
    enteredByName: string;
    regarding: string;
    jobOrderID: number;
    jobOrderTitle: string;
    companyID: number;
    companyName: string;
    profileURL: string;
    jobOrderURL: string;
    companyURL: string;
  }>;
};

export type GdprRequestsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    permissions?: {
      canViewAll?: boolean;
      canEdit?: boolean;
      canExport?: boolean;
      canDeleteCandidateData?: boolean;
    };
    summary?: {
      createdCount?: number;
      sentCount?: number;
      acceptedCount?: number;
      declinedCount?: number;
      expiredCount?: number;
      legacyCount?: number;
      needsDeletionCount?: number;
    };
  };
  filters: {
    status: string;
    expiring: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    candidateID: string;
    needsDeletion: boolean;
  };
  options?: {
    statuses?: Array<{
      value: string;
      label: string;
    }>;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
    exportCSVURL: string;
    exportPDFURL: string;
  };
  rows: Array<{
    requestID: number;
    candidateID: number;
    candidateExists?: boolean | number;
    candidateName?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    candidateEmail?: string;
    email1?: string;
    candidateURL?: string;
    showURL?: string;
    status?: string;
    statusLabel: string;
    displayStatus?: string;
    isExpired?: boolean | number;
    createdAt?: string;
    createdAtSort?: string;
    expiresAt?: string;
    sentAt?: string;
    decision: string;
    decisionLabel?: string;
    acceptedAt?: string;
    gdprExpirationDate?: string;
    acceptedIP?: string;
    acceptedLang?: string;
    noticeVersion?: string;
    proofURL: string;
    proofLabel: string;
    proofAttachmentID?: number;
    proofDirName?: string;
    proofFilename?: string;
    deletedAt?: string;
    deletedAtFormatted?: string;
    isLatest?: boolean | number;
    isLegacy?: boolean | number;
    renewalEligible?: boolean | number;
  }>;
};

export type CalendarModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddEvent: boolean;
      canEditEvent: boolean;
      canDeleteEvent: boolean;
      canUseSuperUser: boolean;
    };
  };
  filters: {
    view: 'DAYVIEW' | 'WEEKVIEW' | 'MONTHVIEW';
    month: number;
    year: number;
    day: number;
    selectedDateISO: string;
    showEvent: number;
    superUserActive: boolean;
    rangeStartISO: string;
    rangeEndISO: string;
  };
  options: {
    views: Array<{
      value: 'DAYVIEW' | 'WEEKVIEW' | 'MONTHVIEW';
      label: string;
    }>;
    eventTypes: Array<{
      typeID: number;
      description: string;
    }>;
  };
  actions: {
    legacyURL: string;
    todayURL: string;
    prevURL: string;
    nextURL: string;
    addEventURL: string;
    addEventToken: string;
    editEventURL: string;
    editEventToken: string;
    deleteEventURL: string;
    deleteEventToken: string;
  };
  summary: {
    eventsInRange: number;
    upcomingCount: number;
    dateLabel: string;
    rangeLabel: string;
  };
  events: Array<{
    eventID: number;
    title: string;
    description: string;
    allDay: boolean;
    dateISO: string;
    dateDisplay: string;
    timeHHMM: string;
    timeDisplay: string;
    duration: number;
    isPublic: boolean;
    eventTypeID: number;
    eventTypeDescription: string;
    enteredByUserID: number;
    enteredByName: string;
    dataItemType: number;
    dataItemID: number;
    dataItemLabel: string;
    dataItemKind: string;
    dataItemURL: string;
    regardingJobOrderID: number;
    regardingJobOrderTitle: string;
    regardingCompanyID: number;
    regardingCompanyName: string;
    regardingLabel: string;
    regardingURL: string;
    showURL: string;
  }>;
  upcoming: Array<{
    eventID: number;
    title: string;
    dateDisplay: string;
    timeDisplay: string;
    allDay: boolean;
    showURL: string;
  }>;
};

export type CalendarEventMutationResponse = ModernMutationResponse & {
  eventID?: number;
  dateISO?: string;
  showURL?: string;
};

export type ListsManageModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    sortBy: string;
    sortDirection: string;
    permissions: {
      canCreateList: boolean;
      canDeleteList: boolean;
      hasListAccessSchema: boolean;
    };
  };
  filters: {
    quickSearch: string;
    dataItemType: number;
    listType: 'all' | 'static' | 'dynamic';
  };
  options: {
    dataItemTypes: Array<{
      value: number;
      label: string;
    }>;
    listTypes: Array<{
      value: 'all' | 'static' | 'dynamic';
      label: string;
    }>;
  };
  actions: {
    legacyURL: string;
    ajaxEndpointURL: string;
  };
  sessionCookie: string;
  rows: Array<{
    savedListID: number;
    description: string;
    dataItemType: number;
    dataItemTypeLabel: string;
    isDynamic: boolean;
    listTypeLabel: string;
    numberEntries: number;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    canEdit: boolean;
    canManageAccess: boolean;
    listAccessRestricted: boolean;
    canDelete: boolean;
    showURL: string;
    showLegacyURL: string;
    deleteLegacyURL: string;
  }>;
};

export type ListsDetailModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
  };
  list: {
    savedListID: number;
    description: string;
    dataItemType: number;
    dataItemTypeLabel: string;
    isDynamic: boolean;
    numberEntries: number;
    ownerName: string;
    listTypeLabel: string;
  };
  filters: {
    quickSearch: string;
  };
  permissions: {
    canEditList: boolean;
    canManageListAccess: boolean;
    canDeleteList: boolean;
    listAccessRestricted: boolean;
    hasListAccessSchema: boolean;
  };
  state: {
    dynamicListUnsupported: boolean;
    message: string;
  };
  actions: {
    listsURL: string;
    legacyURL: string;
    deleteLegacyURL: string;
  };
  rows: Array<{
    savedListEntryID: number;
    dataItemID: number;
    primaryLabel: string;
    secondaryLabel: string;
    dateAdded: string;
    itemURL: string;
    itemLegacyURL: string;
    isMissing: boolean;
  }>;
};

export type ReportsLauncherModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  statistics: {
    companies: ReportMetricBlock;
    candidates: ReportMetricBlock;
    contacts: ReportMetricBlock;
    jobOrders: ReportMetricBlock;
    submissions: ReportMetricBlock;
    hires: ReportMetricBlock;
  };
  launchers: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
  }>;
  actions: {
    legacyURL: string;
  };
};

export type ReportsCustomerDashboardModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  filters: {
    selectedCompanyID: number;
    rangeDays: number;
    activityType: string;
    focusMetric: string;
  };
  options: {
    companies: Array<{
      companyID: number;
      name: string;
    }>;
    rangeDays: Array<{
      value: number;
      label: string;
    }>;
    activityTypes: Array<{
      value: string;
      label: string;
    }>;
    focusMetrics: string[];
  };
  state: {
    selectedCompanyName: string;
    activityTypeLabel: string;
    rangeStartLabel: string;
    rangeEndLabel: string;
    hasCompanies: boolean;
  };
  dashboard: {
    snapshot: {
      totalJobOrders: number;
      openJobOrders: number;
      hiresInRange: number;
      confirmedFutureHires: number;
      medianDaysToFill: number | null;
      activePipelineCount: number;
      offersMade: number;
      offersAccepted: number;
      offerAcceptanceRate: number | null;
      offerAcceptanceLabel: string;
      slaHitRate: number | null;
      slaHitLabel: string;
      slaWindowDays: number;
      riskNoActivityDays: number;
      riskLongOpenDays: number;
    };
    aging: {
      bucket0to15: number;
      bucket16to30: number;
      bucket31plus: number;
    };
    openJobRows: Array<{
      jobOrderID: number;
      title: string;
      status: string;
      openingsTotal: number;
      openingsAvailable: number;
      activeCandidates: number;
      daysOpen: number;
      lastPipelineDateLabel: string;
      daysSinceActivity: number | null;
      healthLabel: string;
      healthClass: string;
      riskScore: number;
      riskReasonsLabel: string;
    }>;
    atRiskJobs: Array<{
      jobOrderID: number;
      title: string;
      status: string;
      openingsTotal: number;
      openingsAvailable: number;
      activeCandidates: number;
      daysOpen: number;
      lastPipelineDateLabel: string;
      daysSinceActivity: number | null;
      healthLabel: string;
      healthClass: string;
      riskScore: number;
      riskReasonsLabel: string;
    }>;
    activePipelineRows: Array<{
      candidateID: number;
      candidateName: string;
      statusLabel: string;
      statusSlug: string;
      jobOrderID: number;
      jobOrderTitle: string;
      lastUpdatedLabel: string;
    }>;
    hireRowsInRange: Array<{
      candidateID: number;
      candidateName: string;
      jobOrderID: number;
      jobOrderTitle: string;
      hireDateLabel: string;
      daysToFill: number;
    }>;
    futureHireRows: Array<{
      candidateID: number;
      candidateName: string;
      jobOrderID: number;
      jobOrderTitle: string;
      hireDateLabel: string;
      daysToFill: number;
    }>;
    offerBreakdownRows: Array<{
      candidateID: number;
      candidateName: string;
      jobOrderID: number;
      jobOrderTitle: string;
      offerDateLabel: string;
      outcomeLabel: string;
      outcomeSlug: string;
    }>;
    cardDetail: {
      key: string;
      title: string;
      emptyLabel: string;
      rows: Array<Record<string, unknown>>;
    } | Record<string, never>;
    funnelStages: Array<{
      key: string;
      label: string;
      count: number;
      barWidth: number;
      statusID: number;
    }>;
    funnelConversions: Array<{
      from: string;
      to: string;
      rate: number | null;
      rateLabel: string;
    }>;
    biggestDropoff: {
      from: string;
      to: string;
      drop: number;
      dropLabel: string;
    } | null;
    activityTrendRows: Array<{
      weekLabel: string;
      submissionsCount: number;
      interviewsCount: number;
      offersCount: number;
      hiresCount: number;
      submissionsWidth: number;
      interviewsWidth: number;
      offersWidth: number;
      hiresWidth: number;
    }>;
    activityTrendMax: number;
    sourceQualityRows: Array<{
      source: string;
      interviewPathCount: number;
      hireCount: number;
      hireRateLabel: string;
    }>;
    rejectionReasonRows: Array<{
      label: string;
      rejectionCount: number;
    }>;
    upcomingOutcomes: {
      upcomingInterviewCount: number;
      recentActivityCount: number;
      pendingInterviewCount: number;
      pendingOfferCount: number;
      overdueOfferCount: number;
      upcomingInterviewsRS: Array<Record<string, unknown>>;
      recentPipelineActivityRS: Array<{
        activityDate: string;
        candidateID: number;
        candidateName: string;
        stageToLabel: string;
        stageToSlug: string;
        jobOrderID: number;
        jobOrderTitle: string;
      }>;
    };
    insightLine: string;
  };
  actions: {
    legacyURL: string;
    selfURL: string;
    companyDetailsURL: string;
    addJobOrderURL: string;
    jobOrdersURL: string;
    kpisURL: string;
    graphViewURL: string;
  };
};

export type ReportsGraphViewModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  graph: {
    imageURL: string;
    hasImage: boolean;
    siteName: string;
  };
  settings: {
    refreshSecondsDefault: number;
    refreshIntervals: number[];
  };
  actions: {
    legacyURL: string;
    reportsURL: string;
  };
};

export type SourcingListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  state: {
    startYear: number;
    startWeek: number;
    currentWeekYear: number;
    currentWeekNumber: number;
    weeksTotal: number;
  };
  summary: {
    totalSourced: number;
    averagePerWeek: number;
  };
  actions: {
    saveURL: string;
    legacyURL: string;
  };
  rows: Array<{
    weekYear: number;
    weekNumber: number;
    weekLabel: string;
    count: number;
    isCurrent: boolean;
  }>;
};

export type SourcingSaveMutationResponse = {
  success: boolean;
  savedCount?: number;
  message?: string;
  code?: string;
};

export type QueueOverviewModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  state: {
    queueTableAvailable: boolean;
  };
  summary: {
    totalCount: number;
    pendingCount: number;
    lockedCount: number;
    errorCount: number;
    completedCount: number;
    staleLockedCount: number;
    processorActive: boolean;
    lastRunEpoch: number;
    lastRunLabel: string;
  };
  charts: {
    priorityBuckets: Array<{
      priority: number;
      count: number;
    }>;
  };
  actions: {
    legacyURL: string;
    refreshURL: string;
  };
  rows: Array<{
    queueID: number;
    siteID: number;
    task: string;
    argsPreview: string;
    priority: number;
    dateCreated: string;
    dateTimeout: string;
    dateCompleted: string;
    locked: boolean;
    error: number;
    state: 'pending' | 'locked' | 'error' | 'completed' | string;
    responsePreview: string;
  }>;
};

export type GraphsOverviewModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  state: {
    isLoggedIn: boolean;
    defaultWidth: number;
    defaultHeight: number;
  };
  options: {
    viewModes: Array<{
      value: number;
      label: string;
    }>;
  };
  actions: {
    legacyURL: string;
    reportsURL: string;
  };
  graphs: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    defaultParams: Record<string, number | string>;
    imageURL: string;
  }>;
};

export type HomeOverviewModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    inboxURL: string;
    myNotesURL: string;
    dashboardURL: string;
    legacyURL: string;
  };
  summary: {
    recentHiresCount: number;
    importantCandidatesCount: number;
  };
  events: {
    upcomingEventsHTML: string;
    followUpEventsHTML: string;
  };
  charts: {
    hiringOverviewURL: string;
    funnelSnapshotURL: string;
    seniorityDistributionURL: string;
  };
  chartsModern?: {
    hiringOverview: {
      view: string;
      points: Array<{
        label: string;
        submitted: number;
        interviewing: number;
        hired: number;
        total: number;
      }>;
    };
    funnelSnapshot: {
      mode: string;
      total: number;
      stages: Array<{
        label: string;
        count: number;
        percentOfTotal: number;
        retentionPercent: number | null;
      }>;
    };
    seniorityDistribution: {
      activeOnlyTotal: number;
      activeOnly: Array<{
        label: string;
        count: number;
        percentOfTotal: number;
      }>;
      includingInactiveTotal: number;
      includingInactive: Array<{
        label: string;
        count: number;
        percentOfTotal: number;
      }>;
    };
  };
  jobOrderOptions: Array<{
    id: number;
    title: string;
  }>;
  recentHires: Array<{
    candidateID: number;
    candidateName: string;
    candidateURL: string;
    companyID: number;
    companyName: string;
    companyURL: string;
    recruiterName: string;
    date: string;
  }>;
};

export type HomeQuickSearchModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    homeURL: string;
    inboxURL: string;
    myNotesURL: string;
    legacyURL: string;
  };
  state: {
    query: string;
  };
  summary: {
    totalResults: number;
    jobOrdersCount: number;
    activeCandidatesCount: number;
    inactiveCandidatesCount: number;
    companiesCount: number;
    contactsCount: number;
  };
  jobOrders: Array<{
    jobOrderID: number;
    title: string;
    companyID: number;
    companyName: string;
    type: string;
    status: string;
    startDate: string;
    recruiterName: string;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    showURL: string;
    companyURL: string;
  }>;
  candidates: {
    active: Array<{
      candidateID: number;
      firstName: string;
      lastName: string;
      fullName: string;
      keySkills: string;
      phoneCell: string;
      ownerName: string;
      dateCreated: string;
      dateModified: string;
      showURL: string;
    }>;
    inactive: Array<{
      candidateID: number;
      firstName: string;
      lastName: string;
      fullName: string;
      keySkills: string;
      phoneCell: string;
      ownerName: string;
      dateCreated: string;
      dateModified: string;
      showURL: string;
    }>;
  };
  companies: Array<{
    companyID: number;
    name: string;
    phone: string;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    showURL: string;
  }>;
  contacts: Array<{
    contactID: number;
    companyID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    title: string;
    companyName: string;
    phoneCell: string;
    ownerName: string;
    dateCreated: string;
    dateModified: string;
    showURL: string;
    companyURL: string;
  }>;
};

export type ImportLauncherModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    legacyURL: string;
    selectTypeURL: string;
    viewPendingURL: string;
    importBulkResumesURL: string;
    deleteBulkResumesURL: string;
    massImportURL: string;
  };
  permissions: {
    canImport: boolean;
    canManageBulkResumes: boolean;
  };
  summary: {
    pendingImportsCount: number;
    bulkResumeCount: number;
    bulkFileSizeKB: number;
    firstBulkCreatedDate: string;
    lastBulkCreatedDate: string;
  };
  pendingImports: Array<{
    importID: number;
    moduleName: string;
    dateCreated: string;
    addedLines: number;
    hasErrors: boolean;
    revertURL: string;
    viewErrorsURL: string;
  }>;
};

export type SettingsWizardImportModernDataResponse = ModernMutationResponse;
export type SettingsWizardLicenseModernDataResponse = ModernMutationResponse;
export type SettingsWizardAddUserModernDataResponse = ModernMutationResponse;
export type SettingsWizardCheckKeyModernDataResponse = ModernMutationResponse;
export type SettingsWizardFirstTimeSetupModernDataResponse = ModernMutationResponse;
export type SettingsWizardDeleteUserModernDataResponse = ModernMutationResponse;
export type SettingsWizardEmailModernDataResponse = ModernMutationResponse;
export type SettingsWizardLocalizationModernDataResponse = ModernMutationResponse;
export type SettingsWizardPasswordModernDataResponse = ModernMutationResponse;
export type SettingsWizardSiteNameModernDataResponse = ModernMutationResponse;
export type SettingsWizardWebsiteModernDataResponse = ModernMutationResponse;

export type SettingsProfileSummary = {
  userID: number;
  fullName: string;
  isDemoUser: boolean;
  authMode: string;
};

export type SettingsMyProfileModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  summary: SettingsProfileSummary;
  actions: {
    showProfileURL: string;
    changePasswordURL: string;
    legacyURL: string;
  };
};

export type SettingsMyProfileChangePasswordModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  summary: SettingsProfileSummary;
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
};

export type SettingsAdministrationModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  flash?: {
    message: string;
    success: boolean;
  };
  summary: {
    siteName: string;
    version: string;
    fullName: string;
    systemAdministration: boolean;
    careerPortalUnlock: boolean;
    rolePermissionsEnabled: boolean;
    totalCandidates: number;
    newVersionAvailable: boolean;
    versionCheckPref: boolean;
  };
  sections: Array<{
    key: string;
    title: string;
    description: string;
    items: Array<{
      label: string;
      description: string;
      href: string;
      badge?: string;
      highlight?: boolean;
      external?: boolean;
    }>;
  }>;
  actions: {
    dashboardURL: string;
    legacyURL: string;
  };
};

export type SettingsLoginActivityModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    view: 'successful' | 'unsuccessful';
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    sortBy: string;
    sortDirection: 'ASC' | 'DESC';
    validSortByFields: string[];
  };
  actions: {
    routeURL: string;
    backURL: string;
    legacyURL: string;
  };
  rows: Array<{
    userLoginID: number;
    userID: number;
    firstName: string;
    lastName: string;
    ip: string;
    hostname: string;
    shortUserAgent: string;
    date: string;
    dateSort: string;
    userURL: string;
  }>;
};

export type SettingsRejectionReasonsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  flash: {
    saved: boolean;
    message: string;
  };
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  rejectionReasons: Array<{
    rejectionReasonID: number;
    label: string;
  }>;
};

export type SettingsEmailTemplatesModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    submitURL: string;
    addURL: string;
    deleteURL: string;
    backURL: string;
    legacyURL: string;
  };
  templates: Array<{
    emailTemplateID: number;
    emailTemplateTitle: string;
    emailTemplateTag: string;
    text: string;
    disabled: number;
    possibleVariables: string;
    isCustom: boolean;
  }>;
};

export type SettingsGdprSettingsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: 'settings.gdprSettings.v1';
    modernPage: string;
  };
  state: {
    gdprSaved: boolean;
  };
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  settings: {
    gdprExpirationYears: string | number;
    gdprFromAddress: string;
  };
};

export type SettingsGdprSettingsMutationResponse = ModernMutationResponse & {
  meta: {
    contractVersion: number;
    contractKey: 'settings.gdprSettings.mutation.v1';
    modernPage: string;
  };
  message?: string;
  actions?: {
    routeURL?: string;
    backURL?: string;
    legacyURL?: string;
  };
};

export type SettingsEmailTemplateMutationResponse = ModernMutationResponse & {
  meta: {
    contractVersion: number;
    contractKey:
      | 'settings.addEmailTemplate.mutation.v1'
      | 'settings.deleteEmailTemplate.mutation.v1'
      | 'settings.emailTemplates.mutation.v1';
    modernPage: string;
  };
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsAddEmailTemplateMutationResponse = SettingsEmailTemplateMutationResponse & {
  meta: SettingsEmailTemplateMutationResponse['meta'] & {
    contractKey: 'settings.addEmailTemplate.mutation.v1';
  };
};

export type SettingsDeleteEmailTemplateMutationResponse = SettingsEmailTemplateMutationResponse & {
  meta: SettingsEmailTemplateMutationResponse['meta'] & {
    contractKey: 'settings.deleteEmailTemplate.mutation.v1';
  };
};

export type SettingsUpdateEmailTemplateMutationResponse = SettingsEmailTemplateMutationResponse & {
  meta: SettingsEmailTemplateMutationResponse['meta'] & {
    contractKey: 'settings.emailTemplates.mutation.v1';
  };
};

export type SettingsModernContractMeta<ContractKey extends string = string> = {
  contractVersion: number;
  contractKey: ContractKey;
  modernPage: string;
};

export type SettingsEmailSettingsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.emailSettings.v1'>;
  settings: {
    fromAddress: string;
    configured: boolean | string;
    candidateJoborderStatusSendsMessage: Record<string, boolean | number | string>;
  };
  templates: SettingsEmailTemplatesModernDataResponse['templates'];
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
};

export type SettingsEmailSettingsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.emailSettings.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsFeedbackSettingsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.feedbackSettings.v1'>;
  state: {
    feedbackSaved: boolean;
  };
  settings: {
    feedbackRecipientUserID: number;
    recipientOptions: Array<{
      userID: number;
      fullName: string;
    }>;
  };
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
};

export type SettingsFeedbackSettingsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.feedbackSettings.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsForceEmailModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.forceEmail.v1'>;
  state: {
    title: string;
    prompt: string;
    inputTypeTextParam: string;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsForceEmailMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.forceEmail.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsGoogleOIDCSettingsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.googleOIDCSettings.v1'>;
  state: {
    googleOIDCSaved: boolean;
    googleOIDCTestOk?: boolean;
    googleOIDCTestMessage?: string;
  };
  settings: {
    enabled: boolean | string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    hostedDomain: string;
    siteId: number | string;
    autoProvisionEnabled: boolean | string;
    notifyEmail: string;
    fromEmail: string;
    requestSubject: string;
    sharedDriveId: string;
    sharedDocsFolderName: string;
  };
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
};

export type SettingsGoogleOIDCSettingsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.googleOIDCSettings.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsDeleteUserModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.deleteUser.v1'>;
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsDeleteUserMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.deleteUser.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsCustomizeCalendarModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.customizeCalendar.v1'>;
  settings: {
    noAjax: boolean | string;
    defaultPublic: boolean | string;
    firstDayMonday: boolean | string;
    dayStart: number | string;
    dayStop: number | string;
    calendarView: string;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsCustomizeCalendarMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.customizeCalendar.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsEEOModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.eeo.v1'>;
  settings: {
    enabled: boolean | string;
    genderTracking: boolean | string;
    ethnicTracking: boolean | string;
    veteranTracking: boolean | string;
    disabilityTracking: boolean | string;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsEEOMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.eeo.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsTalentFitFlowSettingsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.talentFitFlowSettings.v1'>;
  state: {
    tffSaved: boolean;
    tffTestOk?: boolean;
    tffTestMessage?: string;
  };
  settings: {
    baseUrl: string;
    apiKey: string;
    hmacSecret: string;
  };
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
};

export type SettingsTalentFitFlowSettingsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.talentFitFlowSettings.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
  tffTestOk?: boolean;
  tffTestMessage?: string;
};

export type SettingsNewInstallPasswordModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.newInstallPassword.v1'>;
  state: {
    inputType: 'password';
    title: string;
    prompt: string;
    message?: string;
    messageSuccess?: boolean;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsNewInstallPasswordMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.newInstallPassword.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsNewSiteNameModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.newSiteName.v1'>;
  state: {
    inputType: 'siteName';
    inputTypeTextParam: string;
    title: string;
    prompt: string;
    message?: string;
    messageSuccess?: boolean;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsNewSiteNameMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.newSiteName.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsBackupAttachment = {
  attachmentID: number;
  originalFilename: string;
  fileSize: string;
  dateCreated: string;
  retrievalURL: string;
  retrievalURLLocal: string;
};

export type SettingsCreateBackupModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.createBackup.v1'>;
  actions: {
    backURL: string;
    deleteBackupURL: string;
    legacyURL: string;
  };
  attachments: SettingsBackupAttachment[];
};

export type SettingsDeleteBackupMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.deleteBackup.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL: string;
  };
};

export type SettingsExtraFieldType = {
  extraFieldType: number;
  name: string;
  hasOptions: boolean;
};

export type SettingsExtraFieldSetting = {
  fieldName: string;
  extraFieldType: number;
  extraFieldTypeName: string;
  extraFieldOptions: string[];
};

export type SettingsExtraFieldGroup = {
  name: string;
  type: number;
  rows: SettingsExtraFieldSetting[];
};

export type SettingsCustomizeExtraFieldsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.customizeExtraFields.v1'>;
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  extraFieldTypes: SettingsExtraFieldType[];
  groups: SettingsExtraFieldGroup[];
};

export type SettingsCustomizeExtraFieldsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.customizeExtraFields.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL: string;
  };
};

export type SettingsNewInstallFinishedModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.newInstallFinished.v1'>;
  wizard: {
    inputType: 'conclusion';
    title: string;
    prompt: string;
    home: string;
  };
  actions: {
    homeURL: string;
    legacyURL: string;
  };
};

export type SettingsNewInstallFinishedMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.newInstallFinished.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL?: string;
  };
};

export type SettingsUpgradeSiteNameModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.upgradeSiteName.v1'>;
  state: {
    inputType: 'siteName';
    inputTypeTextParam: string;
    title: string;
    prompt: string;
    message?: string;
    messageSuccess?: boolean;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

export type SettingsUpgradeSiteNameMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.upgradeSiteName.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
  };
};

export type SettingsCareerPortalTemplateRecord = {
  careerPortalName: string;
};

export type SettingsCareerPortalQuestionnaireListItem = {
  questionnaireID: number;
  title: string;
  description: string;
  isActive: boolean | number | string;
};

export type SettingsCareerPortalQuestionnaireAnswer = {
  answerID: number;
  answerText: string;
  answerPosition: number;
  actionSource: string;
  actionNotes: string;
  actionIsHot: number | boolean;
  actionIsActive: number | boolean;
  actionCanRelocate: number | boolean;
  actionKeySkills: string;
};

export type SettingsCareerPortalQuestionnaireQuestion = {
  questionID: number;
  questionPosition: number;
  questionType: string;
  questionTypeLabel?: string;
  questionText: string;
  minimumLength: number;
  maximumLength: number;
  answers: SettingsCareerPortalQuestionnaireAnswer[];
};

export type SettingsCareerPortalTemplateEditSetting = {
  setting: string;
  value: string;
};

export type SettingsCareerPortalSettingsModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.careerPortalSettings.v1'>;
  settings: {
    enabled: boolean | string;
    allowBrowse: boolean | string;
    candidateRegistration: boolean | string;
    showCompany: boolean | string;
    showDepartment: boolean | string;
    activeBoard?: string;
  };
  questionnaires: SettingsCareerPortalQuestionnaireListItem[];
  templateNames: SettingsCareerPortalTemplateRecord[];
  templateCustomNames: SettingsCareerPortalTemplateRecord[];
  careerPortalURL: string;
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL?: string;
    questionnaireURL?: string;
    questionnaireUpdateURL?: string;
    templateEditURL?: string;
    tweakURL?: string;
    setActiveURL?: string;
  };
};

export type SettingsCareerPortalSettingsMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.careerPortalSettings.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL?: string;
  };
};

export type SettingsCareerPortalTemplateEditModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.careerPortalTemplateEdit.v1'>;
  templateName: string;
  template: Record<string, string>;
  eeoEnabled: boolean | string;
  EEOSettingsRS: {
    enabled: boolean | string;
    genderTracking: boolean | string;
    ethnicTracking: boolean | string;
    veteranTracking: boolean | string;
    disabilityTracking: boolean | string;
  };
  extraFieldsForJobOrders: Array<{
    fieldName: string;
  }>;
  extraFieldsForCandidates: Array<{
    fieldName: string;
  }>;
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL?: string;
  };
};

export type SettingsCareerPortalTemplateEditMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.careerPortalTemplateEdit.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL?: string;
  };
};

export type SettingsCareerPortalQuestionnaireModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.careerPortalQuestionnaire.v1'>;
  questionnaireID: number | string;
  title: string;
  description: string;
  isActive: boolean | number | string;
  questions: SettingsCareerPortalQuestionnaireQuestion[];
  scrollX?: number | string;
  scrollY?: number | string;
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL?: string;
  };
};

export type SettingsCareerPortalQuestionnaireMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.careerPortalQuestionnaire.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL?: string;
  };
};

export type SettingsCareerPortalQuestionnairePreviewModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.careerPortalQuestionnairePreview.v1'>;
  questionnaireID: number | string;
  data: {
    questionnaireID?: number | string;
    title?: string;
    description: string;
    isActive?: boolean | number | string;
  };
  questions: SettingsCareerPortalQuestionnaireQuestion[];
  actions: {
    legacyURL: string;
    backURL?: string;
  };
};

export type SettingsCareerPortalQuestionnaireUpdateModernDataResponse = {
  meta: SettingsModernContractMeta<'settings.careerPortalQuestionnaireUpdate.v1'>;
  questionnaires: SettingsCareerPortalQuestionnaireListItem[];
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL?: string;
    addQuestionnaireURL?: string;
  };
};

export type SettingsCareerPortalQuestionnaireUpdateMutationResponse = ModernMutationResponse & {
  meta: SettingsModernContractMeta<'settings.careerPortalQuestionnaireUpdate.mutation.v1'>;
  message: string;
  actions: {
    routeURL: string;
    legacyURL?: string;
  };
};

export type SettingsTagsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    backURL: string;
    legacyURL: string;
    addURL: string;
    updateURL: string;
    deleteURL: string;
  };
  tags: Array<{
    tagID: number;
    parentTagID: number;
    parentTagTitle: string;
    tagTitle: string;
  }>;
};

export type SettingsRolePagePermissionsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  message: string;
  rolePermissionsEnabled: boolean;
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
    schemaMigrationsURL: string;
  };
  roles: Array<{
    roleID: number;
    roleKey: string;
    roleName: string;
    accessLevel: number;
  }>;
  pages: Array<{
    pageKey: string;
    label: string;
    module: string;
    action: string;
  }>;
  accessOptions: Array<{
    optionKey: string;
    label: string;
    isVisible: number;
    requiredAccessLevel: number;
  }>;
  matrix: Record<string, Record<string, {
    isVisible: number;
    requiredAccessLevel: number;
    option: string;
  }>>;
};

export type SettingsSchemaMigrationsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  message: string;
  errorMessage: string;
  dirMissing: boolean;
  pendingCount: number;
  actions: {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  migrations: Array<{
    version: string;
    checksum: string;
    applied: boolean;
    appliedAt: string;
    appliedBy: string;
    checksumMatches: boolean;
  }>;
};

export type SettingsViewItemHistoryModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    dataItemType: number;
    dataItemID: number;
  };
  summary: {
    title: string;
    subtitle: string;
  };
  actions: {
    backURL: string;
    legacyURL: string;
  };
  fields: Array<{
    key: string;
    label: string;
    value: string;
    isLongField: boolean;
  }>;
  revisions: Array<{
    revisionID: number;
    theField: string;
    dateModified: string;
    enteredByFullName: string;
    description: string;
    previousValue: string;
    newValue: string;
    isFieldRevision: boolean;
  }>;
};

export type SettingsManageUsersModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  summary: {
    totalUsers: number;
    totalLicensedUsers: number;
    availableSlots: number;
    unlimitedLicenses: boolean;
    canAddLicensedUsers: boolean;
  };
  state: {
    authMode: string;
    currentUserID: number;
    userRolesEnabled: boolean;
  };
  actions: {
    addUserURL: string;
    deleteActionURL: string;
    backURL: string;
    legacyURL: string;
  };
  permissions: {
    canDeleteUsers: boolean;
    canAddUsers: boolean;
  };
  rows: Array<{
    userID: number;
    firstName: string;
    lastName: string;
    username: string;
    applicationRole: string;
    accessLevel: number;
    accessLevelDescription: string;
    successfulDate: string;
    unsuccessfulDate: string;
    showURL: string;
    editURL: string;
    canDelete: boolean;
  }>;
};

export type SettingsAddUserModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  state: {
    authMode: string;
    defaultAccessLevel: number;
    userRolesEnabled: boolean;
    defaultUserRoleID: number;
    eeoEnabled: boolean;
    showLicenseWarning: boolean;
  };
  summary: {
    totalLicensedUsers: number;
    availableSlots: number;
  };
  actions: {
    submitURL: string;
    manageUsersURL: string;
    legacyURL: string;
  };
  accessLevels: Array<{
    accessID: number;
    shortDescription: string;
    longDescription: string;
    isDefault: boolean;
  }>;
  categories: Array<{
    label: string;
    value: string;
    description: string;
    requiredAccessLevel: number;
    forcedAccessLevel: number;
  }>;
  roles: Array<{
    roleID: number;
    roleKey: string;
    roleName: string;
    accessLevel: number;
    isActive: number;
  }>;
};

export type SettingsEditUserModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    userID: number;
  };
  state: {
    authMode: string;
    currentUserID: number;
    userRolesEnabled: boolean;
    selectedUserRoleID: number;
    cannotEnableMessage: boolean;
    disableAccessChange: boolean;
    canResetPassword: boolean;
    eeoEnabled: boolean;
  };
  summary: {
    totalLicensedUsers: number;
    availableSlots: number;
  };
  actions: {
    submitURL: string;
    showUserURL: string;
    manageUsersURL: string;
    legacyURL: string;
  };
  user: {
    userID: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    accessLevel: number;
    accessLevelDescription: string;
    accessLevelLongDescription: string;
    categories: string;
    canSeeEEOInfo: boolean;
  };
  accessLevels: Array<{
    accessID: number;
    shortDescription: string;
    longDescription: string;
    isSelected: boolean;
    isDisabled: boolean;
  }>;
  categories: Array<{
    label: string;
    value: string;
    description: string;
    isSelected: boolean;
  }>;
  roles: Array<{
    roleID: number;
    roleKey: string;
    roleName: string;
    accessLevel: number;
    isActive: number;
  }>;
};

export type SettingsShowUserModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    userID: number;
  };
  state: {
    privledged: boolean;
    userRolesEnabled: boolean;
    eeoEnabled: boolean;
  };
  actions: {
    editURL: string;
    manageUsersURL: string;
    settingsURL: string;
    legacyURL: string;
  };
  user: {
    userID: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    username: string;
    accessLevel: number;
    accessLevelLongDescription: string;
    canSeeEEOInfo: boolean;
    successfulDate: string;
    unsuccessfulDate: string;
    category: {
      value: string;
      label: string;
      description: string;
    };
    applicationRole: {
      roleName: string;
      roleKey: string;
      accessLevel: number;
    };
  };
  loginAttempts: Array<{
    ip: string;
    hostname: string;
    shortUserAgent: string;
    date: string;
    successful: string;
  }>;
};

export type LoginModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    action: string;
  };
  actions: {
    showLoginURL: string;
    forgotPasswordURL: string;
    requestAccessURL: string;
    noCookiesURL: string;
    legacyURL: string;
    loginSubmitURL?: string;
    forgotPasswordSubmitURL?: string;
    requestAccessSubmitURL?: string;
    retryURL?: string;
  };
  state: {
    view: 'login-form' | 'forgot-password' | 'request-access' | 'no-cookies';
    message?: string;
    messageSuccess?: boolean;
    username?: string;
    reloginVars?: string;
    siteName?: string;
    siteNameFull?: string;
    siteNameError?: boolean;
    googleAuthEnabled?: boolean;
    googleLoginURL?: string;
    complete?: boolean;
    status?: string;
    statusMessage?: string;
    fullName?: string;
    email?: string;
    reason?: string;
    title?: string;
  };
};

export type RssJobOrdersModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    xmlURL: string;
    careersURL: string;
  };
  summary: {
    totalJobOrders: number;
  };
  rows: Array<{
    jobOrderID: number;
    title: string;
    type: string;
    location: string;
    publicURL: string;
  }>;
};

export type KpisListModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    legacyURL: string;
    detailsURL: string;
  };
  state: {
    weekLabel: string;
    dataAsOfLabel: string;
  };
  options: {
    candidateSourceScopes: Array<{
      value: 'all' | 'internal' | 'partner' | string;
      label: string;
    }>;
    jobOrderScopes: Array<{
      value: 'all' | 'open' | string;
      label: string;
    }>;
    customers: Array<{
      value: number;
      label: string;
    }>;
    trendViews: Array<{
      value: 'weekly' | 'monthly' | string;
      label: string;
    }>;
  };
  filters: {
    officialReports: boolean;
    showDeadline: boolean;
    showCompletionRate: boolean;
    showExpectedFilled: boolean;
    hideZeroOpenPositions: boolean;
    customerID: number;
    candidateSourceScope: string;
    jobOrderScope: string;
    trendView: string;
    trendStart: string;
    trendEnd: string;
  };
  summary: {
    totals: {
      newPositions: number;
      totalOpenPositions: number;
      filledPositions: number;
      expectedFilled: number;
      expectedInFullPlan: number;
    };
    totalsLastWeek: {
      newPositions: number;
      totalOpenPositions: number;
      filledPositions: number;
      expectedFilled: number;
      expectedInFullPlan: number;
    };
    totalsDiff: {
      newPositions: number;
      totalOpenPositions: number;
      filledPositions: number;
      expectedFilled: number;
      expectedInFullPlan: number;
    };
    executiveScorecard: {
      metrics: Array<{
        key: string;
        label: string;
        value: string;
        hint: string;
      }>;
    };
  };
  rows: {
    kpiRows: Array<{
      companyID: number;
      companyName: string;
      newPositions: number;
      totalOpenPositions: number;
      filledPositions: number;
      expectedConversionDisplay: string;
      expectedFilled: number;
      expectedInFullPlan: number;
    }>;
    jobOrderKpiRows: Array<{
      jobOrderID: number;
      title: string;
      status: string;
      companyName: string;
      timeToDeadline: string;
      timeToDeadlineClass: string;
      totalOpenPositions: number;
      submittedCount: number;
      interviewCount: number;
      approvedCount: number;
      hiredCount: number;
      acceptanceRate: string;
      acceptanceRateClass: string;
      hiringRate: string;
    }>;
    requestQualifiedRows: Array<{
      jobOrderID: number;
      title: string;
      companyName: string;
      receivedDate: string;
      submittedDate: string;
      daysValue: string;
      daysClass: string;
    }>;
    candidateSourceRows: Array<{
      label: string;
      thisWeek: number;
      lastWeek: number;
      delta: number;
      sourceScope?: string;
      thisWeekLink?: string;
      lastWeekLink?: string;
    }>;
    candidateMetricRows: Array<{
      label: string;
      thisWeek: number;
      lastWeek: number;
      delta: number;
      thisWeekLink?: string;
      lastWeekLink?: string;
    }>;
    candidateSourceSnapshot: {
      internal: number;
      partner: number;
      total: number;
    };
  };
  charts: {
    candidateTrend: {
      view: string;
      start: string;
      end: string;
      points: Array<{
        label: string;
        value: number;
      }>;
      total: number;
      peak: number;
      latest: number;
      graphURL: string;
    };
    candidateSource: {
      pieURL: string;
    };
  };
};

export type KpisDetailsModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
  };
  actions: {
    legacyURL: string;
    backURL: string;
  };
  state: {
    detailTitle: string;
    detailRangeLabel: string;
    detailMode: 'candidate' | 'status' | string;
  };
  rows: Array<{
    candidateID: number;
    candidateName: string;
    created?: string;
    source?: string;
    jobOrderID?: number;
    jobOrderTitle?: string;
    statusDate?: string;
  }>;
};

export type HomeInboxModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    homeURL: string;
    myNotesURL: string;
    legacyURL: string;
  };
  state: {
    schemaAvailable: boolean;
    flashMessage: string;
    flashIsError: boolean;
    selectedThreadKey: string;
  };
  summary: {
    threadCount: number;
    messageCount: number;
  };
  threads: Array<{
    threadKey: string;
    threadType: string;
    entityType: string;
    entityName: string;
    entitySubName: string;
    lastMessageAt: string;
    snippet: string;
    unreadCount: number;
    threadURL: string;
  }>;
  selectedThread: {
    threadKey: string;
    entityType: string;
    entityName: string;
    entitySubName: string;
    openURL: string;
    openLabel: string;
  };
  messages: Array<{
    senderName: string;
    dateCreated: string;
    mentionedUsers: string;
    bodyHTML: string;
  }>;
};

export type HomeMyNotesModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  actions: {
    homeURL: string;
    inboxURL: string;
    legacyURL: string;
    mutations?: {
      addTodoURL?: string;
      addTodoToken?: string;
      updateTodoURL?: string;
      updateTodoToken?: string;
      setTodoStatusURL: string;
      setTodoStatusToken: string;
    };
  };
  state: {
    view: string;
    schemaAvailable: boolean;
    flashMessage: string;
    flashIsError: boolean;
    noteMode: string;
    noteSearch: string;
  };
  summary: {
    notesCount: number;
    archivedNotesCount: number;
    todoOpenCount: number;
    todoDoneCount: number;
    reminderDueCount: number;
    todoStatusOpenCount: number;
    todoStatusInProgressCount: number;
    todoStatusBlockedCount: number;
    todoStatusDoneCount: number;
  };
  todoPriorities: Array<{
    value: string;
    label: string;
  }>;
  todoStatuses: Array<{
    value: string;
    label: string;
  }>;
  notes: Array<{
    itemID: number;
    title: string;
    bodyHTML: string;
    isArchived: boolean;
    dateCreated: string;
    dateModified: string;
  }>;
  todosByStatus: {
    open: Array<{
      itemID: number;
      title: string;
      body: string;
      bodyHTML: string;
      taskStatus?: string;
      priority?: string;
      priorityLabel: string;
      dueDateISO?: string;
      dueDate: string;
      reminderAtRaw?: string;
      dateCreated?: string;
      dateModified?: string;
      isOverdue: boolean;
      isReminderDue: boolean;
    }>;
    in_progress: Array<{
      itemID: number;
      title: string;
      body: string;
      bodyHTML: string;
      taskStatus?: string;
      priority?: string;
      priorityLabel: string;
      dueDateISO?: string;
      dueDate: string;
      reminderAtRaw?: string;
      dateCreated?: string;
      dateModified?: string;
      isOverdue: boolean;
      isReminderDue: boolean;
    }>;
    blocked: Array<{
      itemID: number;
      title: string;
      body: string;
      bodyHTML: string;
      taskStatus?: string;
      priority?: string;
      priorityLabel: string;
      dueDateISO?: string;
      dueDate: string;
      reminderAtRaw?: string;
      dateCreated?: string;
      dateModified?: string;
      isOverdue: boolean;
      isReminderDue: boolean;
    }>;
    done: Array<{
      itemID: number;
      title: string;
      body: string;
      bodyHTML: string;
      taskStatus?: string;
      priority?: string;
      priorityLabel: string;
      dueDateISO?: string;
      dueDate: string;
      reminderAtRaw?: string;
      dateCreated?: string;
      dateModified?: string;
      isOverdue: boolean;
      isReminderDue: boolean;
    }>;
  };
};

type ReportMetricBlock = {
  toDate: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  lastYear: number;
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
      canAddCandidateToPipeline: boolean;
    };
  };
  filters: {
    status: string;
    companyID: number;
    companyName: string;
    onlyMyJobOrders: boolean;
    showInactive: boolean;
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
    quickActions: {
      statuses: Array<{
        value: string;
        label: string;
        tone: string;
      }>;
      priorities: Array<{
        value: string;
        label: string;
      }>;
      owners: Array<{
        value: string;
        label: string;
      }>;
      recruiters: Array<{
        value: string;
        label: string;
      }>;
    };
  };
  summary: {
    clientInterviewAll: number;
    clientInterviewHistoricalAll: number;
    hiredAll: number;
    rejectedAll: number;
  };
  actions: {
    addJobOrderURL: string;
    addJobOrderPopupURL: string;
    recruiterAllocationURL: string;
    pipelineMatrixURL: string;
    quickUpdateURL: string;
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
    priority: 'low' | 'standard' | 'high';
    priorityLabel: string;
    priorityTone: 'low' | 'standard' | 'high';
    hasAttachment: boolean;
    isMonitored: boolean;
    commentCount: number;
    daysOld: number;
    dateCreated: string;
    openings: number;
    remainingOpenings: number;
    internalValidation: number;
    clientInterview: number;
    clientInterviewAll: number;
    clientInterviewHistorical: number;
    clientInterviewHistoricalAll: number;
    proposed: number;
    hired: number;
    hiredAll: number;
    rejected: number;
    rejectedAll: number;
    ownerUserID: number;
    ownerName: string;
    recruiterUserID: number;
    recruiterName: string;
    showURL: string;
    showLegacyURL: string;
    editURL: string;
    addCandidateURL: string;
    hiringPlanURL: string;
    setMonitoredBaseURL: string;
    companyURL: string;
  }>;
};

export type JobOrderRejectionReasonBreakdownModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    jobOrderID: number;
  };
  jobOrder: {
    jobOrderID: number;
    title: string;
    companyName: string;
  };
  summary: {
    totalRejectedCandidates: number;
    totalReasonMentions: number;
    candidatesWithReasons: number;
    candidatesWithoutReasons: number;
  };
  reasons: Array<{
    reasonID: number;
    label: string;
    count: number;
  }>;
};

export type JobOrdersRecruiterAllocationModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    permissions: {
      canManageRecruiterAllocation: boolean;
    };
  };
  filters: {
    scope: string;
    search: string;
    ownerUserID: number;
    recruiterUserID: number;
  };
  options: {
    scopes: Array<{
      value: string;
      label: string;
    }>;
    owners: Array<{
      value: string;
      label: string;
    }>;
    recruiters: Array<{
      value: string;
      label: string;
    }>;
  };
  state: {
    noticeMessage: string;
    errorMessage: string;
    startRow: number;
    endRow: number;
  };
  actions: {
    submitURL: string;
    listURL: string;
    legacyURL: string;
  };
  rows: Array<{
    jobOrderID: number;
    companyJobID: string;
    title: string;
    companyName: string;
    status: string;
    ownerUserID: number;
    ownerFullName: string;
    recruiterUserID: number;
    recruiterFullName: string;
    dateModified: string;
    showURL: string;
  }>;
};

export type JobOrdersRecruiterAllocationMutationResponse = {
  success: boolean;
  code?: string;
  noticeMessage?: string;
  errorMessage?: string;
  updatedCount?: number;
  errorCount?: number;
};

export type JobOrdersPipelineMatrixViewConfig = {
  columnOrder: string[];
  visibleColumns: Record<string, boolean>;
  columnFilters: Record<string, string>;
  sortBy: string;
  sortDirection: string;
  serverFilters?: {
    search: string;
    ownerUserID: number;
    recruiterUserID: number;
    pipelineStatusID: number;
    includeClosed: boolean;
    maxResults: number;
  };
};

export type JobOrdersPipelineMatrixSavedView = {
  viewID: number;
  name: string;
  config: JobOrdersPipelineMatrixViewConfig;
  updatedAt: string;
};

export type JobOrdersPipelineMatrixViewMutationResponse = ModernMutationResponse & {
  viewID?: number;
  views?: JobOrdersPipelineMatrixSavedView[];
};

export type JobOrdersPipelineMatrixModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    page: number;
    totalPages: number;
    totalRows: number;
    entriesPerPage: number;
    permissions: {
      canManageRecruiterAllocation: boolean;
      canEditCandidate: boolean;
      canEditJobOrder: boolean;
    };
  };
  filters: {
    search: string;
    ownerUserID: number;
    recruiterUserID: number;
    pipelineStatusID: number;
    includeClosed: boolean;
    sortBy: string;
    sortDirection: string;
  };
  options: {
    owners: Array<{
      value: string;
      label: string;
    }>;
    recruiters: Array<{
      value: string;
      label: string;
    }>;
    pipelineStatuses: Array<{
      value: string;
      label: string;
    }>;
    rowsPerPage: number[];
  };
  state: {
    errorMessage: string;
    startRow: number;
    endRow: number;
  };
  actions: {
    listURL: string;
    recruiterAllocationURL: string;
    saveViewURL: string;
    deleteViewURL: string;
    legacyURL: string;
  };
  savedViews: JobOrdersPipelineMatrixSavedView[];
  rows: Array<{
    candidateJobOrderID: number;
    candidateID: number;
    candidateName: string;
    jobOrderID: number;
    jobOrderTitle: string;
    companyID: number;
    companyName: string;
    source: string;
    keySkills: string;
    pipelineStatusID: number;
    pipelineStatus: string;
    ownerUserID: number;
    ownerName: string;
    recruiterUserID: number;
    recruiterName: string;
    location: string;
    gdprSigned: boolean;
    isActive: boolean;
    dateAdded: string;
    lastActivity: string;
    candidateURL: string;
    jobOrderURL: string;
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
      canPurgeFromPipeline: boolean;
      canAddComment: boolean;
      canAdministrativeHideShow: boolean;
      canCreateAttachment: boolean;
      canDeleteAttachment: boolean;
      canPostMessage: boolean;
      canDeleteMessageThread: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    addCandidateURL: string;
    createAttachmentURL: string;
    deleteAttachmentURL?: string;
    deleteAttachmentToken?: string;
    reportURL: string;
    historyURL: string;
    deleteURL: string;
    hiringPlanURL: string;
    addCommentURL: string;
    postMessageURL: string;
    deleteMessageThreadURL: string;
    administrativeHideShowBaseURL: string;
    removeFromPipelineToken?: string;
    setPipelineStatusURL?: string;
    setPipelineStatusToken?: string;
  };
  pipelineStatus: {
    rejectedStatusID: number;
    rejectionOtherReasonID?: number;
    rejectionReasons?: Array<{
      reasonID: number;
      label: string;
    }>;
    orderedStatusIDs: number[];
    statuses: Array<{
      statusID: number;
      status: string;
    }>;
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
    priority: 'low' | 'standard' | 'high';
    priorityLabel: string;
    priorityTone: 'low' | 'standard' | 'high';
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
    initiallyOpen: boolean;
    canAddComment: boolean;
    categories: string[];
    maxLength: number;
    securityToken: string;
    flashMessage: string;
    flashIsError: boolean;
    items: Array<{
      activityID: number;
      dateCreated: string;
      enteredBy: string;
      category: string;
      commentHTML: string;
      commentText: string;
    }>;
  };
  messages: {
    enabled: boolean;
    threadID: number;
    threadVisibleToCurrentUser: boolean;
    initiallyOpen: boolean;
    maxLength: number;
    securityToken: string;
    deleteThreadSecurityToken: string;
    openInboxURL: string;
    mentionHintNames: string[];
    mentionAutocompleteValues: string[];
    flashMessage: string;
    flashIsError: boolean;
    items: Array<{
      messageID: number;
      dateCreated: string;
      senderName: string;
      mentionedUsers: string;
      bodyHTML: string;
      bodyText: string;
    }>;
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

type JobOrderModernExtraField = {
  postKey: string;
  fieldName: string;
  inputType: 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'date';
  value: string;
  options: string[];
};

export type JobOrderCompanyContextModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    companyID: number;
  };
  location: {
    city: string;
    state: string;
  };
  contacts: Array<{
    value: string;
    label: string;
  }>;
  departments: {
    csv: string;
    items: Array<{
      departmentID: number;
      name: string;
    }>;
  };
};

export type JobOrderAddPopupModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddJobOrder: boolean;
    };
  };
  actions: {
    startAddURL: string;
    listURL: string;
    legacyURL: string;
  };
  state: {
    typeOfAdd: 'new' | 'existing';
    selectedJobOrderID: number;
    totalCopySources: number;
  };
  copySources: Array<{
    jobOrderID: number;
    title: string;
    companyName: string;
    status: string;
    label: string;
  }>;
};

export type JobOrdersAddModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    permissions: {
      canAddJobOrder: boolean;
    };
  };
  state: {
    noCompanies: boolean;
  };
  actions: {
    submitURL: string;
    listURL: string;
    legacyURL: string;
    companyContextURL: string;
  };
  defaults: {
    title: string;
    startDate: string;
    companyID: string;
    department: string;
    departmentsCSV: string;
    contactID: string;
    type: string;
    city: string;
    state: string;
    duration: string;
    maxRate: string;
    salary: string;
    openings: string;
    companyJobID: string;
    recruiter: string;
    owner: string;
    isHot: boolean;
    public: boolean;
    questionnaire: string;
    description: string;
    notes: string;
  };
  options: {
    users: Array<{
      value: string;
      label: string;
    }>;
    companies: Array<{
      value: string;
      label: string;
    }>;
    contacts: Array<{
      value: string;
      label: string;
    }>;
    departments: Array<{
      departmentID: number;
      name: string;
    }>;
    jobTypes: Array<{
      value: string;
      label: string;
      description: string;
    }>;
    questionnaires: Array<{
      value: string;
      label: string;
    }>;
    careerPortalEnabled: boolean;
    defaultCompanyID: number;
  };
  extraFields: JobOrderModernExtraField[];
};

export type JobOrdersEditModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    jobOrderID: number;
    permissions: {
      canEditJobOrder: boolean;
      canDeleteJobOrder: boolean;
    };
  };
  actions: {
    submitURL: string;
    showURL: string;
    listURL: string;
    legacyURL: string;
    deleteURL: string;
    companyContextURL: string;
    hiringPlanURL: string;
  };
  jobOrder: {
    jobOrderID: number;
    title: string;
    startDate: string;
    createdDate: string;
    createdTime: string;
    companyID: string;
    duration: string;
    maxRate: string;
    salary: string;
    department: string;
    departmentsCSV: string;
    contactID: string;
    type: string;
    city: string;
    state: string;
    openings: string;
    openingsAvailable: string;
    recruiter: string;
    companyJobID: string;
    owner: string;
    status: string;
    isHot: boolean;
    public: boolean;
    questionnaire: string;
    description: string;
    notes: string;
  };
  options: {
    users: Array<{
      value: string;
      label: string;
    }>;
    recruiters: Array<{
      value: string;
      label: string;
    }>;
    owners: Array<{
      value: string;
      label: string;
    }>;
    companies: Array<{
      value: string;
      label: string;
    }>;
    contacts: Array<{
      value: string;
      label: string;
    }>;
    departments: Array<{
      departmentID: number;
      name: string;
    }>;
    jobTypes: Array<{
      value: string;
      label: string;
      description: string;
    }>;
    statusGroups: Array<{
      group: string;
      options: Array<{
        value: string;
        label: string;
      }>;
    }>;
    questionnaires: Array<{
      value: string;
      label: string;
    }>;
    careerPortalEnabled: boolean;
    defaultCompanyID: number;
    canSendOwnershipEmail: boolean;
    hasHiringPlan: boolean;
  };
  extraFields: JobOrderModernExtraField[];
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
      canPurgeFromPipeline: boolean;
      canCreateAttachment: boolean;
      canDeleteAttachment: boolean;
      canManageTags: boolean;
      canManageLists: boolean;
      canViewLists: boolean;
      canPostComment: boolean;
      canViewHistory: boolean;
      canSendGDPR: boolean;
      candidateMessagingEnabled: boolean;
      canDeleteMessageThread: boolean;
    };
  };
  actions: {
    legacyURL: string;
    editURL: string;
    deleteURL: string;
    addToJobOrderURL: string;
    createAttachmentURL: string;
    deleteAttachmentURL?: string;
    deleteAttachmentToken?: string;
    googleDriveUploadAttachmentURL?: string;
    googleDriveUploadAttachmentToken?: string;
    googleDriveDeleteAttachmentURL?: string;
    googleDriveDeleteAttachmentToken?: string;
    googleDriveConnectURL?: string;
    googleDriveAccountEmail?: string;
    googleDriveLinkMode?: string;
    addTagsURL: string;
    addTagsToken?: string;
    addToListURL: string;
    linkDuplicateURL: string;
    viewHistoryURL: string;
    addCommentURL: string;
    postMessageURL: string;
    deleteMessageThreadURL: string;
    removeFromPipelineToken?: string;
    setPipelineStatusURL?: string;
    setPipelineStatusToken?: string;
    gdprSendURL?: string;
  };
  pipelineStatus: {
    rejectedStatusID: number;
    rejectionOtherReasonID?: number;
    rejectionReasons?: Array<{
      reasonID: number;
      label: string;
    }>;
    orderedStatusIDs: number[];
    statuses: Array<{
      statusID: number;
      status: string;
    }>;
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
    signed: boolean;
    expirationDate: string;
    latestRequest: {
      hasRequest?: boolean;
      status: string;
      createdAt: string;
      emailSentAt: string;
      acceptedAt: string;
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
  tagManagement: {
    assignedTagIDs: number[];
    catalog: Array<{
      tagID: number;
      title: string;
      parentTagID: number;
    }>;
  };
  lists: Array<{
    listID: number;
    name: string;
    url: string;
  }>;
  comments: {
    count: number;
    initiallyOpen: boolean;
    canAddComment: boolean;
    categories: string[];
    maxLength: number;
    securityToken: string;
    flashMessage: string;
    flashIsError: boolean;
    items: Array<{
      activityID: number;
      dateCreated: string;
      enteredBy: string;
      category: string;
      commentHTML: string;
      commentText: string;
    }>;
  };
  messages: {
    enabled: boolean;
    threadID: number;
    threadVisibleToCurrentUser: boolean;
    initiallyOpen: boolean;
    maxLength: number;
    securityToken: string;
    deleteThreadSecurityToken: string;
    openInboxURL: string;
    mentionHintNames: string[];
    mentionAutocompleteValues: string[];
    flashMessage: string;
    flashIsError: boolean;
    items: Array<{
      messageID: number;
      dateCreated: string;
      senderName: string;
      mentionedUsers: string;
      bodyHTML: string;
      bodyText: string;
    }>;
  };
  attachments: {
    items: Array<{
      attachmentID: number;
      fileName: string;
      dateCreated: string;
      retrievalURL: string;
      googleDriveLinked?: boolean;
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
      canDeleteCandidate: boolean;
      canCreateAttachment: boolean;
      canDeleteAttachment: boolean;
    };
  };
  actions: {
    submitURL: string;
    showURL: string;
    legacyURL: string;
    deleteURL: string;
    createAttachmentURL: string;
    deleteAttachmentURL?: string;
    deleteAttachmentToken?: string;
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
  resumeImport: {
    isParsingEnabled: boolean;
    parsingStatus: Record<string, unknown>;
  };
  extraFields: Array<{
    postKey: string;
    fieldName: string;
    inputType: 'text' | 'textarea' | 'checkbox' | 'dropdown' | 'radio' | 'date';
    value: string;
    options: string[];
  }>;
  attachments: Array<{
    attachmentID: number;
    fileName: string;
    dateCreated: string;
    isProfileImage: boolean;
    retrievalURL: string;
    previewAvailable: boolean;
    previewURL: string;
  }>;
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
  resumeImport: {
    isParsingEnabled: boolean;
    parsingStatus: Record<string, unknown>;
    documentText: string;
    documentTempFile: string;
  };
  extraFields: Array<{
    postKey: string;
    fieldName: string;
    inputType: 'text' | 'textarea' | 'checkbox' | 'dropdown' | 'radio' | 'date';
    value: string;
    options: string[];
  }>;
};

export type CandidateDuplicateMatch = {
  candidate_id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: string;
  matchReasons: string[];
  score: number;
  dateCreated: string;
};

export type CandidateDuplicateCheckResponse = {
  success: number;
  message?: string;
  hardMatches: CandidateDuplicateMatch[];
  softMatches: CandidateDuplicateMatch[];
};

export type CandidateAssignToJobOrderModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    isMultipleCandidates: boolean;
    candidateIDs: number[];
    singleCandidateID: number;
    candidateDisplayName: string;
    canSetStatusOnAdd: boolean;
    defaultAssignmentStatusID: number;
  };
  options: {
    assignmentStatuses: Array<{
      statusID: number;
      status: string;
    }>;
    jobOrders: Array<{
      jobOrderID: number;
      title: string;
      companyName: string;
      status: string;
      openingsAvailable: number;
      isInPipeline: boolean;
    }>;
  };
  actions: {
    addToPipelineURL: string;
    securityToken: string;
    legacyURL: string;
  };
};

export type CandidateAssignToJobOrderMutationResponse = ModernMutationResponse & {
  requiresConfirm?: boolean;
  candidateID?: number;
  jobOrderID?: number;
  addedCandidateIDs?: number[];
  statusApplied?: boolean;
};

export type JobOrderAssignCandidateModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
    jobOrderID: number;
    jobOrderTitle: string;
    canSetStatusOnAdd: boolean;
    defaultAssignmentStatusID: number;
  };
  options: {
    assignmentStatuses: Array<{
      statusID: number;
      status: string;
    }>;
  };
  state: {
    query: string;
  };
  rows: Array<{
    candidateID: number;
    fullName: string;
    city: string;
    state: string;
    keySkills: string;
    ownerName: string;
    inPipeline: boolean;
    candidateURL: string;
  }>;
  actions: {
    addToPipelineURL: string;
    securityToken: string;
    legacyURL: string;
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

