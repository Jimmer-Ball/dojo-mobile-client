// All lexicon files MUST be UTF-8 without BOM.  Go use Notepad++ to create the file, ensuring Encoding -> Encode in UTF-8
// without BOM has been done before the file is first saved and checked in, so it gets checked in in the right format
// (UTF-8 without BOM).  Feel free to edit the file in IntelliJ AFTER that point only. Note, these are simple to use.
// Any "root" items you want to override (provide a translation for), first look in the "root" lexicon in the directory
// above, get the names of the properties you want to provide language translations for and put your translations here,
// obviously using the same property names to identify them and so override the base lexicon translation provided.
define({
    // Application title
    applicationTitle:"Mobile HR",

    // Supported links (version 1.0)
    getCurrentPayAdvice:"Paie la plus récente",
    getCurrentExpenseAdvice:"Frais les plus récents",
    getCurrentLeaveRequests:"Demandes récentes de congés",
    getAuthorisations:"Autorisations",
    getLeaveEntitlements:"Entrez une demande de congé",
    mobileUserDirectory:"Annuaire des Utilisateurs",
    resetInternalDataServices:"Réinitialiser internes des services de données",

    // Supported data types
    AUTHORISATION:"Autorisation",
    EXPENSE_ADVICE:"Frais",
    LEAVE_REQUEST:"Congés",
    PAY_ADVICE:"Paie",

    // Service error state reporting
    errorUnknown: "Erreur inconnue provenant du service",
    errorUnreadableAuthResponse: "Réponse d'authentification illisible retournée",
    error0: "Votre navigateur ne peut pas accéder à l'URL du service suivant: ",
    error400Start:"Les détails fournis sont invalides. Veuillez contacter le Service Client en fournissant l'identifiant unique suivant:",
    error400End:", ou voyez si vous pouvez corriger le problème vous-même: ",
    error400ForEmailValidation:"Veuillez fournir une adresse email valide de la forme utilisateur@domaine.fr",
    error400ForCommentsValidation:"Les commentaires inscrits étaient invalides, ce champ accepte les caractères alphanumériques et de ponctuation, sa longueur d'entrée est limité à 255 caractères.",
    error401: "Vous n'êtes pas autorisé à effectuer cette action, veuillez contacter le Support Client",
    error403: "L'accès au service est actuellement bloqué, veuillez réessayer plus tard",
    error404: "Le service n'est pas accessible, veuillez contacter le Support Client",
    error500Start: "Nous sommes désolés. Veuillez contacter le Service Client en fournissant l'identifiant unique suivant:",
    error500End: ", et la description du problème: ",
    error500ServerError:"Nous sommes désolés. Veuillez contacter le Service Client fournissant l'heure et la date à laquelle l'erreur s'est produite",
    informationNoData: "Aucune donnée n'est disponible",

    // Standard button and label settings that can be applied to lots of views
    backButtonLabel: "Retour",
    logoutButtonLabel: "Déconnexion",
    missingAllCategory: "Toutes",

    // Standard dialog controls
    dialogInformationTitle: "Informations",
    dialogErrorTitle: "Erreur",
    dialogWarningTitle:"Attention",
    dialogConfirmationTitle: "Veuillez confirmer",
    dialogConfirmationButtonLabel: "OK",
    dialogCancellationButtonLabel: "Annuler",

    // LoginView
    loginInstructions: "Veuillez fournir vos informations d'identification",
	loginEmailTitle: "Email:",
    emailInputPlaceholder: "Indiquez votre e-mail",
    loginPasswordTitle: "Mot de passe:",
    loginListItemLabel: "Entrer",

    // ActionView
    actionsInstructions: "Bienvenue",

    // PayAdviceView
    payAdviceInstructions: "Détails de paiement",
    payAdviceTaxYear: "Année fiscale",
    payAdvicePayPeriod: "Période de paie",
    payAdvicePayDate: "Date de paiement",
    payAdviceGrossPay: "Total des paiements",
    payAdviceTotalDeductions: "Total des déductions",
    payAdviceNetPay: "Paiement net",

    // ExpenseAdviceView
    expenseAdviceInstructions: "Détails des frais",
    expenseAdvicePayDateLabel: "Date de paie",
    expenseAdviceNetAmountLabel: "Montant",
    expenseAdviceDescriptionLabel: "Description",

    // LeaveRequestView
    leaveRequestInstructions: "Détails de congé",
    leaveRequestLeaveType:"Type de congé",
    leaveRequestState:"Status du Congé",
    leaveRequestSubmissionDate:"Date de soumission",
    leaveRequestUnitsTaken:"Unités prélevées",
    leaveRequestStartDate:"Date de début",
    leaveRequestEndDate:"Date de fin",
    leaveRequestStartTime:"Heure de début",
    leaveRequestEndTime:"Heure de fin",
    cancelLeaveRequestButton: "Annuler Congé",
    confirmCancelLeaveRequest:"Etes-vous sûr de vouloir annuler cette congé?",

    // AuthorisationTypesView
    authorisationTypesBanner: "Autorisation",
    authorisationTypesInstructions: "Veuillez sélectionner le type de resource pour laquelle vous souhaitez afficher les autorisations",

    // AuthorisationLeaveRequestView
    confirmLeaveRequestAuthorise: "Etes-vous sûr de vouloir autoriser la demande sélectionnée?",
    confirmLeaveRequestReject: "Etes-vous sûr de vouloir rejeter la demande sélectionnée?",
    leaveRequestEmployeeNameLabel: "Nom de l'employé:",
    leaveRequestLeaveTypeLabel: "Type de congé:",
    leaveRequestSubmissionDateLabel: "Date de soumission:",
    leaveRequestLeaveUnitsLabel: "Congé unités:",
    leaveRequestStartDateLabel: "Date de début:",
    leaveRequestEndDateLabel: "Date de fin:",
    leaveRequestStartTimeLabel: "Heure de début:",
    leaveRequestEndTimeLabel: "Heure de fin:",
    leaveAuthorisationCommentsPlaceholder: "Fournir des commentaires",
    authoriseLeaveButton: "Autoriser",
    rejectLeaveButton: "Rejeter",

    // AuthorisationLeaveRequestsView
    authorisationLeaveRequestsTitle: "Autorisation",
    authorisationLeaveRequestsInstructions: "Veuillez sélectionner le type de demande pour lesquelles vous souhaitez voir les autorisations",
    bulkAuthoriseLeaveButton: "Autoriser",
    bulkRejectLeaveButton: "Rejeter",
    noLeaveRequestsAuthoriseSelected: "Pour autoriser, vous devez sélectionner certaines demandes qui sortent en premier",
    noLeaveRequestsRejectSelected: "Pour rejeter, vous devez sélectionner certaines demandes qui sortent en premier",
    confirmLeaveRequestsAuthorise: "Etes-vous sûr que vous voulez autoriser les demandes sélectionnées?",
    confirmLeaveRequestsReject: "Etes-vous sûr de vouloir rejeter les demandes sélectionnées?",
    noAuthorisationItemsLeft: "Vous n'avez pas d'autorisations laissés à l'action",

    // LeaveRangeView
    leaveRangeInstructions: "Fournir début et de fin des dates de votre congé",
    leaveStartInstructions: "Date de début:",
    leaveEndInstructions: "Date de fin:",
    leaveRangeContinueItem: "Continuer",
    invalidDatesMessageStart:"Désolé, mais les dates ",
    invalidDatesMessageMiddle: " et ",
    invalidDatesMessageEnd: " ne sont pas valides, essayez à nouveau",

    // LeaveEntitlementGroupsView
    leaveEntitlementGroupsInstructions: "Choisissez un type",

    // LeaveEntitlementView
    leaveEntitlementInstructions: "Choisissez un type",

    // BookLeaveRequestView
    bookLeaveRequestInstructions: "Réserve congé",
    bookLeaveSubmitButton: "Soumettre",
    bookLeaveStartDateLabel: "Date de début:",
    bookLeaveEndDateLabel: "Date de fin:",
    bookLeaveSameDateLabel: "Date:",
    bookLeaveLeaveType: "Type de congé:",
    bookLeaveChooseSameDay: "Type de réservation",
    bookLeaveChooseStartDay: "Le type de jour de début",
    bookLeaveChooseEndDay: "Le type de jour de fin",
    bookLeaveBookingTypeFULL: "Journée complète",
    bookLeaveBookingTypeAM: "AM",
    bookLeaveBookingTypePM: "PM",
    bookLeaveBookingTypeTIME: "Temps",
    bookLeaveConfirmSubmission: "Etes-vous sûr de vouloir soumettre cette demande de congé?",

    // ChooseStartLeaveBookingTypeView
    chooseStartLeaveBookingTypeInstructions: "Choisissez le type de réservation pour le jour de départ",
    chooseStartLeaveBookingTypeMissingChoice:"Vous devez choisir un type de réservation",

    // ChooseEndLeaveBookingTypeView
    chooseEndLeaveBookingTypeInstructions: "Choisissez le type de réservation pour le jour de la fin",
    chooseEndLeaveBookingTypeMissingChoice:"Vous devez choisir un type de réservation",

    // ChooseSameDayLeaveBookingTypeView
    chooseSameDayLeaveBookingTypeInstructions:"Choisissez le type de réservation",
    chooseSameDayLeaveBookingTypeMissingChoice:"Vous devez choisir un type de réservation pour réserver un congé",
    chooseSameDayLeaveBookingTypeEndBeforeStart:"L'heure de fin ne peut pas être avant ou le même que le temps de début",
    chooseSameDayLeaveBookingTypeNeedStartAndEnd:"Vous devez fournir une heure de début et une heure de fin",

    // LeaveBookingTypeListItem
    leaveBookingTypeStartTimeInstructions:"Choisissez l'heure de début",
    leaveBookingTypeEndTimeInstructions:"Choisissez heure de fin",

    // LeaveBookingTypeSameDayListItem
    leaveBookingTypeSameDayStartTimeInstructions:"Choisissez l'heure de début",
    leaveBookingTypeSameDayEndTimeInstructions:"Choisissez heure de fin",
    leaveBookingTypeSameDayStartTime: "l'heure de début",
    leaveBookingTypeSameDayEndTime: "l'heure de fin",

    // StartTimeView
    chooseStartTimeInstructions: "Fournir un temps de début",

    // EndTimeView
    chooseEndTimeInstructions: "Fournir une heure de fin",

    // NotYetSupportedView
    notYetSupportedInstructions: "Désolé, mais cette fonctionnalité n'est pas encore supportée dans la version que vous utilisez",

    // ChooseLeaveTypeListItem
    chooseLeaveType: "Choisissez le type de congé:",

    // UserDirectoryListItem
    userDirectorySearchByFirstName:"Prénom",
    userDirectorySearchByLastName:"Nom",
    userDirectorySearchByUserName:"Nom d'utilisateur",

    // RequiredFieldOptionsView
    requiredFieldOptionChoose:"Vous devez choisir une option",

    // PerformUserDirectorySearchView
    userDirectorySearchInstructions:"Consulter l'annuaire Utilisateurs",
    userDirectorySearchSubmitButton:"Rechercher",
    userDirectoryDefaultSearchTerm:"Veuillez entrer un terme de recherche",
    userDirectorySearchTermWarning: "Veuillez entrer un terme de recherche valide, vous devez entrer au moins trois caractères!",
    alphaNumericOnlyWarning:"Veuillez entrer un terme de recherche valide, le type de recherche accepte les caractères alpha-numériques",
    alphaOnlyWarning:"Veuillez entrer un terme de recherche valide, le type de recherche accepte les caractères alphabétiques",
    userDirectoryNoSearchTypeSelectedWarning:"Nous n'avons pas pu déterminer le type de recherche sélectionné",

    // SelectUserDirectorySearchTypeView
    userDirectorySearchTypeInstructions:"Veuillez sélectionner le type de recherche que vous souhaitez effectuer",
    userDirectorySearchTypeWarning:"Vous devez choisir un type de recherche",

    // ChooseUserDirectorySearchTypeItem
    userDirectorySearchTypeChooserLabel:"Type de Recherche",

    // UserDirectorySearchResultNextListItem
    nextSearchResults:"Afficher la prochaine série de résultats",

    // UserDirectorySearchResultsView
    userDirectoryNoResultsReturned:"Aucun résultat n'a été renvoyé",

    // UserDirectorySearchResultView
    userfirstName:"Prénom",
    userlastName:"Nom",
    userjobTitle:"Fonction",
    userlocation:"Emplacement",
    userworkTelNumber:"Tél au Bureau",
    usermobileNumber: "No. de Tél Portable",
    emailAddress: "E-mail",
    userDirectoryCreateSMSButton:"Envoyer un SMS à cet utilisateur",
    userDirectoryIPhoneStandaloneWarning: "Si vous décidez d'effectuer cette action, vous serez obligé de vous reconnecter de l'application par la suite, iOS ne supporte pas les liens externes dans le mode Web App c'est à dire quand une application web est lancé à partir de la page d'accueil",

    // EventNotificationsToolBarButton
    eventNotificationsToolBarButtonLabel:"Notifications",

    // EventNotificationsView
    eventNotificationsInstructions:"Notifications",
    eventNotificationsInstructionsFiltered:"Notifications pour ",
    eventNotificationsNoNotificationsReturned: "Pas de nouvelles notifications ont été trouvés",
    eventNotificationsNoNotificationsReturnedFiltered: "Aucune notification n'a été trouvé pour ",

    // field labels:
    eventNotificationTimeStamp:"Créé",
    eventSuccessIndicator: "Success",
    eventNotificationDataType:"Type de Données",
    systemMessageCode:"Code du Service",
    systemEventMessage:"Message",
    eventNotificationDetail:"Détails",
    getRelatedResourceButtonText:"Obtenez des ressources connexes",

    // API Service Messages
    API_UNAVAILABLE_ERROR:"API est indisponible",
    API_SERVICE_ERROR:"Erreur de service à l'API",
    LR_CREATE_SUCCESS:"Success création demande de congé",
    LR_CREATE_ERROR:"Erreur de création de demande de congé",
    LR_AUTHORISATION_SUCCESS:"Autorisé demande de congé avec succès",
    LR_AUTHORISATION_ERROR:"Demande de congé d'erreur d'autorisation",
    LR_REJECTION_SUCCESS:"Demande de congé rejetée avec succès",
    LR_REJECTION_ERROR:"Erreur rejetant la demande de congé",
    LR_UPDATE_SUCCESS:"Mise à jour réussie demande de congé",
    LR_UPDATE_ERROR:"Erreur de mise à une demande de congé",
    LR_CANCEL_SUCCESS:"Demande de congé annulée avec succès",
    LR_CANCEL_ERROR:"Erreur d'annuler une demande de congé",
    SYS_INFORMATION_MESSAGE: "Générique message de diffusion système",

    // administration functionality
    adminActionDialogTitle: "API Administration",
    adminActionSuccess:"L'action de l'administration a réussi",
    adminActionWarning:"L'action de l'administration n'a pas"
});