/*
 * The DOJO build system release build profile for the whole user interface application. When we release, we provide a
 * report (see minimised_dojo directory under target for said report).  We've left a bit of console in, as we want to
 * allow console.warn in our minimised application to allow us to help debug problems in the packed build that don't
 * occur in the unpacked build.  The packed.minimised product is called dojo.js and is found in the minimised_dojo
 * output directory under target, as we take advantage here of doing a custom base build of DOJO to wrap everything
 * into one built product.
 *
 * Note the releaseDir is set here relative to where the Dojo build tools live.  I found that if we don't set the
 * releaseDir here (rather than in the build.xml file like it really should be) we get a JS evaluation exception
 * through the Dojo build tool in DOJO 1.7.2.
 *
 * If you want to change this file, you need to understand the content of the web-app pom.xml release profile, the
 * content of the build.xml file invoked at the web-app root directory, and finally the DOJO build system itself.
 * Do not skimp on this understanding/learning process, else you will break the project's automation for which you
 * will be punished by Chris Ditchburn.
 *
 * Simply put though.  If you add a new widget, you need to understand AMD, and you need to add details of it in here.
 * Keep the logical alphabetical and functional order in this file, it need not be a mess.
 */
dependencies = {
    action:"release",
    stripConsole:"normal",
    hasReport:true,
    releaseDir:"../../../minimised_dojo",
    cssOptimize:"comments",
    /*
     * Create the one and only minimised custom base layer file "dojo.js" our application is packed into
     */
    layers:[
        {
            name:"dojo.js",
            customBase:true,
            dependencies:[
                /* dojox.mobile 1.7.2 uses dijit base for its widgets */
                "dijit._base.manager",
                "dijit._base.sniff",
                "dijit._WidgetBase",
                "dijit.registry",

                /* Base parts of dojo used across the application */
                "dojo._base.array",
                "dojo._base.connect",
                "dojo._base.declare",
                "dojo._base.event",
                "dojo._base.fx",
                "dojo._base.html",
                "dojo._base.lang",
                "dojo._base.unload",
                "dojo._base.window",
                "dojo._firebug.firebug",
                "dojo.currency",
                "dojo.dom-construct",
                "dojo.dom-class",
                "dojo.dom-style",
                "dojo.i18n",
                "dojo.ready",
                "dojo.query",
                "dojo.selector.acme",

                /* Base parts of dojox.mobile used */
                "dojox.mobile._compat",
                "dojox.mobile.compat",
                "dojox.mobile.parser",
                "dojox.mobile",
                "dojox.mobile.TextArea",
                "dojox.mobile.TextBox",
                "dojox.mobile.Button",
                "dojox.mobile.ScrollableView",

                /* ============================================================================================= */
                /*                       APPLICATION CODE UNDER src/main/ui/mobilehr                             */
                /* ============================================================================================= */

                /* Mixins used as helpers for other classes, holding common code */
                "mobilehr.mixins.RepresentationHelper",
                "mobilehr.mixins.WidgetHelper",
                "mobilehr.mixins.FieldBuilder",
                "mobilehr.mixins.ServiceErrorHelper",

                /* API administration functionality */
                "mobilehr.widgets.admin.AdminListItem",

                /* Authorisation common code */
                "mobilehr.widgets.authorisation.AuthorisationsListItem",
                "mobilehr.widgets.authorisation.AuthorisationTypesView",
                "mobilehr.widgets.authorisation.ChooseDataTypeListItem",
                "mobilehr.widgets.authorisation.NoAuthorisationItemsToDisplayItem",

                /* Authorisation of leave */
                "mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestsListItem",
                "mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestView",
                "mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestsView",
                "mobilehr.widgets.authorisation.leave.ChooseLeaveTypeListItem",
                "mobilehr.widgets.authorisation.leave.LeaveTypeListItem",
                "mobilehr.widgets.authorisation.leave.LeaveTypesView",

                /* Common */
                "mobilehr.widgets.common.MobileHeading",
                "mobilehr.widgets.common.HomeToolBarButton",

                /* Event Notifications */
                "mobilehr.widgets.eventNotification.EventNotificationListItem",
                "mobilehr.widgets.eventNotification.EventNotificationsToolBarButton",
                "mobilehr.widgets.eventNotification.EventNotificationsBackToolBarButton",
                "mobilehr.widgets.eventNotification.EventNotificationView",
                "mobilehr.widgets.eventNotification.EventNotificationsView",

                /* Expenses */
                "mobilehr.widgets.expenses.CurrentExpenseAdviceListItem",
                "mobilehr.widgets.expenses.ExpenseAdviceView",

                /* Leave booking, displaying, and entitlements */
                "mobilehr.widgets.leave.book.BookLeaveRequestView",
                "mobilehr.widgets.leave.book.ChooseLeaveBookingTypeListItem",
                "mobilehr.widgets.leave.book.ChooseEndLeaveBookingTypeView",
                "mobilehr.widgets.leave.book.ChooseStartLeaveBookingTypeView",
                "mobilehr.widgets.leave.book.LeaveBookingTypeListItem",
                "mobilehr.widgets.leave.book.LeaveRangeListItem",
                "mobilehr.widgets.leave.book.LeaveRangeView",
                "mobilehr.widgets.leave.book.sameDay.ChooseLeaveBookingTypeSameDayListItem",
                "mobilehr.widgets.leave.book.sameDay.ChooseSameDayLeaveBookingTypeView",
                "mobilehr.widgets.leave.book.sameDay.LeaveBookingTypeSameDayListItem",
                "mobilehr.widgets.leave.display.CurrentLeaveRequestsListItem",
                "mobilehr.widgets.leave.display.LeaveRequestListItem",
                "mobilehr.widgets.leave.display.LeaveRequestView",
                "mobilehr.widgets.leave.display.LeaveRequestsView",
                "mobilehr.widgets.leave.entitlement.LeaveEntitlementGroupsListItem",
                "mobilehr.widgets.leave.entitlement.LeaveEntitlementGroupsView",
                "mobilehr.widgets.leave.entitlement.LeaveEntitlementListItem",
                "mobilehr.widgets.leave.entitlement.LeaveEntitlementView",

                /* Login and home links view */
                "mobilehr.widgets.login.ActionView",
                "mobilehr.widgets.login.LoginView",

                /* Pay Slips/Advices */
                "mobilehr.widgets.payslips.CurrentPayAdviceListItem",
                "mobilehr.widgets.payslips.PayAdviceView",

                /* Required Fields */
                "mobilehr.widgets.requiredFields.ChooseRequiredFieldOptionListItem",
                "mobilehr.widgets.requiredFields.RequiredFieldOptionListItem",
                "mobilehr.widgets.requiredFields.RequiredFieldOptionsView",

                /* User Directory */
                "mobilehr.widgets.userDirectory.ChooseUserDirectorySearchTypeItem",
                "mobilehr.widgets.userDirectory.PerformUserDirectorySearchView",
                "mobilehr.widgets.userDirectory.SelectUserDirectorySearchTypeView",
                "mobilehr.widgets.userDirectory.UserDirectoryListItem",
                "mobilehr.widgets.userDirectory.UserDirectorySearchResultListItem",
                "mobilehr.widgets.userDirectory.UserDirectorySearchResultsView",
                "mobilehr.widgets.userDirectory.UserDirectorySearchResultView",
                "mobilehr.widgets.userDirectory.UserDirectorySearchResultNextListItem",
                "mobilehr.widgets.userDirectory.UserDirectorySearchTypeListItem",

                /* Utility classes */
                "mobilehr.widgets.utils.dialogs.ConfirmationDialog",
                "mobilehr.widgets.utils.dialogs.MessageDialog",
                "mobilehr.widgets.utils.notYetSupported.NotYetSupportedListItem",
                "mobilehr.widgets.utils.notYetSupported.NotYetSupportedView",
                "mobilehr.widgets.utils.restclient.ResourceController",
                "mobilehr.widgets.utils.restclient.ResourceWrapper",
                "mobilehr.widgets.utils.spinners.SpinWheel",
                "mobilehr.widgets.utils.spinners.SpinWheelDatePicker",
                "mobilehr.widgets.utils.spinners.SpinWheelDaySlot",
                "mobilehr.widgets.utils.spinners.SpinWheelMonthSlot",
                "mobilehr.widgets.utils.spinners.SpinWheelSlot",
                "mobilehr.widgets.utils.spinners.SpinWheelTimePicker",
                "mobilehr.widgets.utils.spinners.SpinWheelYearSlot",
                "mobilehr.widgets.utils.time.ChooseTimeListItem",
                "mobilehr.widgets.utils.time.EndTimeView",
                "mobilehr.widgets.utils.time.StartTimeView"
            ],
            // The path to the copyright file here must be relative to the actual util/buildscripts directory, so
            // where the build tool within DOJO is actually run from by the build.xml in the web-app top directory.
            copyrightFile:"../../../src/main/ui/mobilehr/TimePoorProgrammer.txt"
        }
    ],
    /* Without specifying these to the build system the package paths above don't make any sense to the build tool */
    prefixes:[
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ],
        [ "mobilehr", "../../../src/main/ui/mobilehr" ]
    ]
};

