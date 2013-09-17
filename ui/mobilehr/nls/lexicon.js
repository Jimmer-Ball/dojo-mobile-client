// This file MUST be UTF-8 without BOM and is an anonymous JS object.  If you aren't sure what you are doing, go and create
// this file in something like Notepad++ from which you can alter the file encoding on the main menu toolbar drop-downs to
// UTF-8 encoding without BOM before saving and committing.  Note, IntelliJ isn't very smart about encoding, it deals with
// what its given according to Settings - Project Settings - File Encodings, so only edit these files in IntelliJ AFTER
// you've created them in Notepad++ where you can ensure their encoding is UTF-8 before going anywhere near IntelliJ.
// If you get this wrong you will break the UI's i18n, and I will not be happy. Kapeesh?
define({
    // The "root" or default or fallback i18n bundle for our application (this will be used for plain en and en-gb and 
    // for any language that cannot be matched to the user's preferred locale.  Go see index.jsp for how the DOJO locale 
    // is actually set to the user's preferred locale.
    root:{
        // Application title
        applicationTitle:"Mobile HR",

        // Supported links (version 1.0)
        getCurrentPayAdvice:"Most recent pay",
        getCurrentExpenseAdvice:"Most recent expense",
        getCurrentLeaveRequests:"Current leave requests",
        getAuthorisations:"Authorisations",
        getLeaveEntitlements:"Submit leave",
        mobileUserDirectory:"User Directory",
        resetInternalDataServices:"Reset internal data services",
        getUserEventNotifications:"Notifications",

        // Supported data types
        AUTHORISATION:"Authorisation",
        EXPENSE_ADVICE:"Expense Advice",
        LEAVE_REQUEST:"Leave Requests",
        PAY_ADVICE:"Pay Advice",

        // Service error state reporting
        errorUnknown:"Unknown error with service",
        errorUnreadableAuthResponse:"Unreadable authentication response returned",
        error0: "Your browser cannot access the following service URL: ",
        error400Start:"Invalid details provided. Either contact customer support providing the following unique identifier:",
        error400End:", or see if you can fix the problem yourself: ",
        error400ForEmailValidation:"Please provide a valid email address of the form user@domain.com",
        error400ForCommentsValidation:"The comments entered were invalid, this field accepts alpha-numeric and punctuation characters, its entry length is limited to 255 characters.",
        error401:"You are not authorised to perform this action, please contact customer support",
        error403:"Access to the service is currently blocked, please try again later",
        error404:"The service is not accessible, please contact customer support",
        error500Start:"We're sorry.  Please contact customer support providing the following unique identifier:",
        error500End:", and problem description: ",
        error500ServerError:"We're sorry. Please contact customer support providing the time and date that this service error occurred",
        informationNoData:"No data is available",

        // Standard button and label settings that are applied to lots of views
        backButtonLabel:"Back",
        logoutButtonLabel:"Logout",
        missingAllCategory:"All",

        // Standard dialog controls
        dialogInformationTitle:"Information",
        dialogErrorTitle:"Error",
        dialogWarningTitle:"Warning",
        dialogConfirmationTitle:"Please confirm",
        dialogConfirmationButtonLabel:"OK",
        dialogCancellationButtonLabel:"Cancel",

        // LoginView
        loginInstructions:"Provide your credentials",
        loginEmailTitle:"Email:",
        emailInputPlaceholder:"Provide your email",
        loginPasswordTitle:"Password:",
        loginListItemLabel:"Login",

        // ActionView
        actionsInstructions:"Welcome",

        // PayAdviceView
        payAdviceInstructions:"Pay Advice details",
        payAdviceTaxYear: "Tax Year",
        payAdvicePayPeriod: "Pay Period",
        payAdvicePayDate: "Pay Date",
        payAdviceGrossPay: "Total Payments",
        payAdviceTotalDeductions: "Total Deductions",
        payAdviceNetPay: "Net Pay",

        // ExpenseAdviceView
        expenseAdviceInstructions:"Expense Advice details",
        expenseAdvicePayDateLabel:"Pay Date",
        expenseAdviceNetAmountLabel:"Amount",
        expenseAdviceDescriptionLabel:"Description",

        // LeaveRequestView
        leaveRequestInstructions:"Leave Request details",
        leaveRequestLeaveType:"Leave Type",
        leaveRequestState:"Leave Request State",
        leaveRequestSubmissionDate:"Submission Date",
        leaveRequestUnitsTaken:"Units Taken",
        leaveRequestStartDate:"Start Date",
        leaveRequestEndDate:"End Date",
        leaveRequestStartTime:"Start Time",
        leaveRequestEndTime:"End Time",
        cancelLeaveRequestButton: "Cancel Leave Request",
        confirmCancelLeaveRequest:"Are you sure you want to cancel this leave request?",

        // AuthorisationTypesView
        authorisationTypesBanner:"Authorisation",
        authorisationTypesInstructions:"Please select the resource type you wish to view authorisations for",

        // AuthorisationLeaveRequestView
        confirmLeaveRequestAuthorise:"Are you sure you want to authorise the selected request?",
        confirmLeaveRequestReject:"Are you sure you want to reject the selected request?",
        leaveRequestEmployeeNameLabel:"Employee Name:",
        leaveRequestLeaveTypeLabel:"Leave Type:",
        leaveRequestSubmissionDateLabel:"Submission Date:",
        leaveRequestLeaveUnitsLabel:"Leave Units:",
        leaveRequestStartDateLabel:"Start Date:",
        leaveRequestEndDateLabel:"End Date:",
        leaveRequestStartTimeLabel:"Start Time:",
        leaveRequestEndTimeLabel:"End Time:",
        leaveAuthorisationCommentsPlaceholder:"Provide some comments",
        authoriseLeaveButton:"Authorise",
        rejectLeaveButton:"Reject",

        // AuthorisationLeaveRequestsView
        authorisationLeaveRequestsTitle:"Authorisation",
        authorisationLeaveRequestsInstructions:"Select leave request type you wish to view authorisations for",
        bulkAuthoriseLeaveButton:"Authorise",
        bulkRejectLeaveButton:"Reject",
        noLeaveRequestsAuthoriseSelected:"To authorise, you need to select some leave requests first",
        noLeaveRequestsRejectSelected:"To reject, you need to select some leave requests first",
        confirmLeaveRequestsAuthorise:"Are you sure you want to authorise the selected requests?",
        confirmLeaveRequestsReject:"Are you sure you want to reject the selected requests?",
        noAuthorisationItemsLeft:"You have no authorisations left to action",

        // LeaveRangeView
        leaveRangeInstructions:"Provide start and end dates for your leave",
        leaveStartInstructions:"Start Date:",
        leaveEndInstructions:"End Date:",
        leaveRangeContinueItem:"Continue",
        invalidDatesMessageStart:"Sorry, but the dates ",
        invalidDatesMessageMiddle: " and ",
        invalidDatesMessageEnd: " are invalid, try again",

        // LeaveEntitlementGroupsView
        leaveEntitlementGroupsInstructions:"Choose a type to book against",

        // LeaveEntitlementView
        leaveEntitlementInstructions:"Choose a type to book against",

        // BookLeaveRequestView
        bookLeaveRequestInstructions:"Book Leave",
        bookLeaveSubmitButton:"Submit",
        bookLeaveStartDateLabel: "Start Date:",
        bookLeaveEndDateLabel: "End Date:",
        bookLeaveSameDateLabel: "Date:",
        bookLeaveLeaveType: "Leave Type:",
        bookLeaveChooseSameDay: "Booking type",
        bookLeaveChooseStartDay: "Start day type",
        bookLeaveChooseEndDay: "End day type",
        bookLeaveBookingTypeFULL: "Full Day",
        bookLeaveBookingTypeAM: "AM",
        bookLeaveBookingTypePM: "PM",
        bookLeaveBookingTypeTIME: "TIME",
        bookLeaveConfirmSubmission: "Are you sure you want to submit this leave request?",

        // ChooseStartLeaveBookingTypeView
        chooseStartLeaveBookingTypeInstructions:"Choose start day booking type",
        chooseStartLeaveBookingTypeMissingChoice:"You have to choose a booking type",

        // ChooseEndLeaveBookingTypeView
        chooseEndLeaveBookingTypeInstructions:"Choose end day booking type",
        chooseEndLeaveBookingTypeMissingChoice:"You have to choose a booking type",

        // ChooseSameDayLeaveBookingTypeView
        chooseSameDayLeaveBookingTypeInstructions:"Choose booking type",
        chooseSameDayLeaveBookingTypeMissingChoice:"You have to choose a booking type to book leave",
        chooseSameDayLeaveBookingTypeEndBeforeStart:"The end time cannot be before or the same as the start time",
        chooseSameDayLeaveBookingTypeNeedStartAndEnd:"You have to provide both a start time and an end time",

        // LeaveBookingTypeListItem
        leaveBookingTypeStartTimeInstructions:"Choose start time",
        leaveBookingTypeEndTimeInstructions:"Choose end time",

        // LeaveBookingTypeSameDayListItem
        leaveBookingTypeSameDayStartTimeInstructions:"Choose start time",
        leaveBookingTypeSameDayEndTimeInstructions:"Choose end time",
        leaveBookingTypeSameDayStartTime: "START TIME",
        leaveBookingTypeSameDayEndTime: "END TIME",

        // StartTimeView
        chooseStartTimeInstructions:"Provide a start time",

        // EndTimeView
        chooseEndTimeInstructions:"Provide an end time",

        // NotYetSupportedView
        notYetSupportedInstructions:"Sorry, but this feature is not yet supported in the UI version you are using",

        // ChooseLeaveTypeListItem
        chooseLeaveType:"Choose leave type:",

        // UserDirectoryListItem
        userDirectorySearchByFirstName:"First name",
        userDirectorySearchByLastName:"Last name",
        userDirectorySearchByUserName:"Username",

        // RequiredFieldOptionsView
        requiredFieldOptionChoose:"You have to choose an option",

        // PerformUserDirectorySearchView
        userDirectorySearchInstructions:"Perform User Directory Search",
        userDirectorySearchSubmitButton:"Search",
        userDirectoryDefaultSearchTerm:"Please enter a search term",
        userDirectorySearchTermWarning:"Please enter a valid search term, you must enter at least three characters",
        alphaNumericOnlyWarning:"Please enter a valid search term, this search type only accepts alpha-numeric characters",
        alphaOnlyWarning:"Please enter a valid search term, this search type only accepts alpha characters",
        userDirectoryNoSearchTypeSelectedWarning:"We were unable to determine the currently selected search type",

        // SelectUserDirectorySearchTypeView
        userDirectorySearchTypeInstructions:"Please select the search type you wish to perform",
        userDirectorySearchTypeWarning:"You have to choose a search type",

        // ChooseUserDirectorySearchTypeItem
        userDirectorySearchTypeChooserLabel:"Search Type",

        // UserDirectorySearchResultNextListItem
        nextSearchResults:"Display the next set of results",

        // UserDirectorySearchResultsView
        userDirectoryNoResultsReturned:"No results were found",

        // UserDirectorySearchResultView
        userfirstName:"First Name",
        userlastName:"Last Name",
        userjobTitle:"Job Title",
        userlocation:"Location",
        userworkTelNumber:"Work No.",
        usermobileNumber:"Mobile No.",
        emailAddress:"Email",
        userDirectoryCreateSMSButton:"Send this user a message",
        userDirectoryIPhoneStandaloneWarning: "If you decide to perform this action you will be forced to log back into the application afterward, iOS does not support external links in Web App mode (i.e. when a web app is launched from the home page)",

        // EventNotificationsToolBarButton
        eventNotificationsToolBarButtonLabel:"Notifications",

        // EventNotificationsView
        eventNotificationsInstructions:"Notifications",
        eventNotificationsInstructionsFiltered:"Notifications for ",
        eventNotificationsNoNotificationsReturned: "No new notifications were found",
        eventNotificationsNoNotificationsReturnedFiltered: "No notifications were found for ",

        // field labels:
        eventNotificationTimeStamp:"Created",
        eventSuccessIndicator: "Success",
        eventNotificationDataType:"Data Type",
        systemMessageCode:"Service Code",
        systemEventMessage:"Message",
        eventNotificationDetail:"Details",
        getRelatedResourceButtonText:"Get related data",

        // API Service Messages
        API_UNAVAILABLE_ERROR:"API is currently unavailable",
        API_SERVICE_ERROR:"System service error at the API",
        LR_CREATE_SUCCESS:"Success creating leave request",
        LR_CREATE_ERROR:"Error creating leave request",
        LR_AUTHORISATION_SUCCESS:"Success authorising leave request",
        LR_AUTHORISATION_ERROR:"Error authorising leave request",
        LR_REJECTION_SUCCESS:"Success rejecting a leave request",
        LR_REJECTION_ERROR:"Error rejecting leave request",
        LR_UPDATE_SUCCESS:"Success updating a leave request",
        LR_UPDATE_ERROR:"Error updating a leave request",
        LR_CANCEL_SUCCESS:"Success cancelling a leave request",
        LR_CANCEL_ERROR:"Error cancelling a leave request",
        SYS_INFORMATION_MESSAGE: "Generic system broadcast message",

        // administration functionality
        adminActionDialogTitle: "API Administration",
        adminActionSuccess:"The API administration action succeeded",
        adminActionWarning:"The API administration action has failed"
    },
    // What other language bundles do we also support via our application? State the language code here and override whatever
    // settings you want to provided in the particular language down in the lexicon in the right directory.  The directory names
    // used must be the actual ISO language codes names (see http://www.metamodpro.com/browser-language-codes). If you still don't
    // know what these should be, go look under the nls directory of dojo-src/nls for an idea of how dojo core supports them
    // already or talk to me.  An example though would be "en-us" for American English, and "fr" for French, etc. Finally, why
    // don't we have "en-gb" or "en" specific directories, well because en-gb is our default language, so its content is defined in
    // this file, so there doesn't need to be a specific sub-directory for it.
    "fr-fr":true
});