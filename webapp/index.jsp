<%@page contentType="text/html" pageEncoding="UTF-8" trimDirectiveWhitespaces="true" %>
<%@page import="com.timepoorprogrammer.mobile.system.SystemBean" %>
<%@page import="com.timepoorprogrammer.mobile.utilities.JNDIUtils" %>
<%@page import="com.timepoorprogrammer.mobile.utilities.UserAgentHelper" %>
<%@ page import="com.timepoorprogrammer.mobile.utilities.AcceptLanguageHelper" %>
<%@page session="false" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%
    // Get hold of the CSS theme we should be using given the user agent header passed in from the client.  This works
    // prior to page load so means the right CSS theme will be in place when the packed application needs it.
    final UserAgentHelper helper = new UserAgentHelper();
    final String linkCSS = helper.getCSS(request, response);
    // Lookup the version of the application so we append it to the CSS and JavaScript lookup to ensure a user
    // doesn't need to refresh their browser when we release new versions of the UI.
    final SystemBean systemBean = JNDIUtils.lookup(SystemBean.class, "SystemBean");
    final String version = systemBean.getVersion();
    // Log the requested Accept-Language so we can track the language that the client wants us to use for the application
    AcceptLanguageHelper.logRequestedAcceptLanguage(request);
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-touch-fullscreen" content="yes"/>
    <title>Mobile HR</title>

    <!-- What if our users do not have javascript enabled? (Can't be internationalised unfortunately AFAIK) -->
    <noscript>
        <p>Sorry, but you need to enable javascript on your browser in order to use your API service
            client, please go and turn it on now in your browser's settings and then try again.</p>
    </noscript>
    <!-- User-Agent theme specific styling to apply as determined by the UserAgentHelper class pre page download -->
    <%=linkCSS%>
    <!-- Our own additions to the CSS styles, regardless of dojox.mobile theme -->
    <link href="mobilehr/mobilehr.css?<%=version%>" rel="stylesheet"/>
    <!-- Let DOJO know where its packages are, turn AMD loading on, and set the locale to the user's preferred locale. -->
    <script type="text/javascript">
        //noinspection JSUnusedAssignment
        var dojoConfig = (function () {
            var base = location.href.split("/");
            base.pop();
            base = base.join("/");
            return {
                async:true,
                isDebug:true,
                mblIosWorkaround:false,
                packages:[
                    {name:"mobilehr", location:base + "/mobilehr"}
                ],
                locale:"<c:out value="${pageContext.request.locale.language}"/><c:if test="${fn:length(pageContext.request.locale.country) gt 0}">-<c:out value="${fn:toLowerCase(pageContext.request.locale.country)}"/></c:if>"};
        })();
    </script>
    <!-- The DOJO library, which at time of writing this is Dojo 1.7.2. -->
    <script src="dojo/dojo.js?<%=version%>" type="text/javascript"></script>
    <script type="text/javascript">
        var _resourceController = null;
        var _lexicon = null;
        var _forgotToLogout = null;
        /**
         * Execute when DOJO is ready.  This executes later than the domReady! AMD directive. Note we load up all the
         * JS we know we need fro the markup using AMD.  We also let dojox.mobile.compat decide if any "-compat" theme
         * files need loading to support non-WebKit browsers, as dojox.mobile dynamically amends widget code and not
         * just styling if the browser is non-WebKit.
         */
        (function () {
            require(["dojo/ready", "mobilehr/widgets/utils/dialogs/ConfirmationDialog", "mobilehr/widgets/utils/dialogs/MessageDialog",
                "mobilehr/widgets/utils/spinners/SpinWheel", "mobilehr/widgets/utils/spinners/SpinWheelDatePicker",
                "mobilehr/widgets/utils/spinners/SpinWheelDaySlot", "mobilehr/widgets/utils/spinners/SpinWheelMonthSlot",
                "mobilehr/widgets/utils/spinners/SpinWheelSlot", "mobilehr/widgets/utils/spinners/SpinWheelTimePicker",
                "mobilehr/widgets/utils/spinners/SpinWheelYearSlot", "mobilehr/widgets/login/ActionView",
                "mobilehr/widgets/authorisation/leave/AuthorisationLeaveRequestsView", "mobilehr/widgets/authorisation/leave/AuthorisationLeaveRequestView",
                "mobilehr/widgets/authorisation/AuthorisationTypesView", "mobilehr/widgets/leave/book/BookLeaveRequestView",
                "mobilehr/widgets/leave/book/ChooseEndLeaveBookingTypeView", "mobilehr/widgets/leave/book/sameDay/ChooseSameDayLeaveBookingTypeView",
                "mobilehr/widgets/leave/book/ChooseStartLeaveBookingTypeView", "mobilehr/widgets/utils/time/EndTimeView",
                "mobilehr/widgets/expenses/ExpenseAdviceView", "mobilehr/widgets/leave/entitlement/LeaveEntitlementGroupsView",
                "mobilehr/widgets/leave/entitlement/LeaveEntitlementView", "mobilehr/widgets/leave/book/LeaveRangeView",
                "mobilehr/widgets/leave/display/LeaveRequestView", "mobilehr/widgets/leave/display/LeaveRequestsView",
                "mobilehr/widgets/authorisation/leave/LeaveTypesView", "mobilehr/widgets/login/LoginView",
                "mobilehr/widgets/utils/notYetSupported/NotYetSupportedView", "mobilehr/widgets/payslips/PayAdviceView",
                "mobilehr/widgets/requiredFields/RequiredFieldOptionsView", "mobilehr/widgets/utils/time/StartTimeView",
                "mobilehr/widgets/utils/restclient/ResourceController", "mobilehr/widgets/userDirectory/PerformUserDirectorySearchView",
                "mobilehr/widgets/userDirectory/SelectUserDirectorySearchTypeView",
                "mobilehr/widgets/userDirectory/UserDirectorySearchResultsView", "mobilehr/widgets/userDirectory/UserDirectorySearchResultView",
                "mobilehr/widgets/eventNotification/EventNotificationsToolBarButton", "mobilehr/widgets/eventNotification/EventNotificationsBackToolBarButton",
                "mobilehr/widgets/eventNotification/EventNotificationsView", "mobilehr/widgets/eventNotification/EventNotificationView",
                "mobilehr/widgets/common/HomeToolBarButton", "mobilehr/widgets/common/MobileHeading",
                "dojox/mobile", "dojox/mobile/parser", "dojox/mobile/compat", "dojox/mobile/TextArea", "dojox/mobile/TextBox", "dojox/mobile/Button",
                "dojo/_base/unload", "dojo/_base/lang", "dijit/registry", "dojo/_base/array", "dojo/_base/connect",
                "dojo/dom-style", "dojo/_base/fx", "dojo/i18n"],
                    function (ready, ConfirmationDialog, MessageDialog, SpinWheel, SpinWheelDatePicker, SpinWheelDaySlot,
                              SpinWheelMonthSlot, SpinWheelSlot, SpinWheelTimePicker, SpinWheelYearSlot, ActionView,
                              AuthorisationLeaveRequestsView, AuthorisationLeaveRequestView, AuthorisationTypesView,
                              BookLeaveRequestView, ChooseEndLeaveBookingTypeView, ChooseSameDayLeaveBookingTypeView,
                              ChooseStartLeaveBookingTypeView, EndTimeView, ExpenseAdviceView, LeaveEntitlementGroupsView,
                              LeaveEntitlementView, LeaveRangeView, LeaveRequestView, LeaveRequestsView, LeaveTypesView,
                              LoginView, NotYetSupportedView, PayAdviceView, RequiredFieldOptionsView, StartTimeView,
                              ResourceController, PerformUserDirectorySearchView, SelectUserDirectorySearchTypeView,
                              UserDirectorySearchResultsView, UserDirectorySearchResultView, EventNotificationsToolBarButton,
                              EventNotificationsBackToolBarButton, EventNotificationsView, EventNotificationView,
                              HomeToolBarButton, MobileHeading, mobile, mobileParser, compat, TextArea, TextBox, Button,
                              baseUnload, lang, registry, array, connect, domStyle, fx, i18n) {
                        ready(function () {
                            /**
                             * Create the lexicon for use across the application.  We need it prior to the parse stage
                             * as the mixin classes also make use of the lexicon as well, and consequently parsing a
                             * widget that inherits from the mixins when the lexicon hasn't been setup would cause a
                             * "undefined".
                             */
                            _lexicon = i18n.getLocalization("mobilehr", "lexicon");
                            /**
                             * Parse the application
                             */
                            mobileParser.parse();
                            /**
                             * On window unload, make sure our user is logged out if not done so already, and tidy up our
                             * widgets to avoid memory leaks.
                             */
                            baseUnload.addOnWindowUnload(function () {
                                if (_resourceController != null && _resourceController.token != null) {
                                    _resourceController.registerPostDeleteCallback(lang.hitch(this, "_forgotToLogout"));
                                    _resourceController.doDelete("services/mobile/login");
                                }
                                registry.toArray().forEach(function (widget) {
                                    try {
                                        array.forEach(widget._connects, function (connection) {
                                            array.forEach(connection, connect.disconnect);
                                        });
                                        widget.destroy();
                                    } catch (ex) {
                                    }
                                });
                            });
                            /**
                             * Create the one and only Resource Controller needed for the application uses to talk to
                             * the API Service
                             */
                            _resourceController = new ResourceController();
                            /**
                             * If the user forgot to log-out following the forced log-out on window unload (tab close,
                             * or browser close) clear the current authentication token in use.
                             */
                            _forgotToLogout = function () {
                                if (_resourceController != null) {
                                    _resourceController.token = null;
                                }
                            };
                            /**
                             * Remove the loading icon and display us in all our glory
                             */
                            fx.fadeOut({
                                node:"mobilehrPreLoader",
                                duration:700,
                                onEnd:function () {
                                    domStyle.set("mobilehrPreLoader", "display", "none");
                                }
                            }).play();
                        });
                    });
        })();
    </script>
</head>
<body>
<div id="mobilehrPreLoader"></div>

<!-- The login view in which a user provides their credentials to access the API by reference to a returned token -->
<div id="login" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.login.LoginView"
     data-dojo-props="selected:true">
    <div class="mobilehrLogo"></div>
    <h1 id="loginHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"></h1>

    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="loginInstructions" class="mobilehrInstructions"></div>
    </div>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <table width="100%">
            <tr>
                <td valign="top"><span id="loginEmailTitle" class="bold"></span></td>
                <td align="right" class="mobilehrRightTableColumPad">
                    <%--suppress HtmlFormInputWithoutLabel --%>
                    <input id="email" data-dojo-type="dojox.mobile.TextBox" class="mobilehrInputWidth"
                           data-dojo-props="selectOnClick:true">
                </td>
            </tr>
            <tr>
                <td valign="top"><span id="loginPasswordTitle" class="bold"></span></td>
                <td align="right" class="mobilehrRightTableColumPad">
                    <%--suppress HtmlFormInputWithoutLabel --%>
                    <input id="password" type="password" data-dojo-type="dojox.mobile.TextBox"
                           class="mobilehrInputWidth"
                           data-dojo-props="selectOnClick:true">
                </td>
            </tr>
        </table>
        <div id="loginError" class="mobilehrErrorStatusHidden"></div>
    </div>
    <div>
        <ul data-dojo-type="dojox.mobile.RoundRectList">
            <li id="loginListItem" data-dojo-type="dojox.mobile.ListItem"
                data-dojo-props="icon:'mobilehr/images/icon_29.png', moveTo:'#', transition:'slide'">
            </li>
        </ul>
    </div>
</div>

<!-- The actions view which shows what a user can do to the API with this client -->
<div id="actions" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.login.ActionView">
    <h1 id="actionsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Logout', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="actionsInstructions" class="mobilehrInstructions"></div>
    </div>
    <!-- Action links by group -->
    <ul id="userActionsList" style="list-style-type:none;margin:0;padding:0;">
        <ul id="authActionList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
        <ul id="leaveActionList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
        <ul id="adviceActionList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
        <ul id="userDirActionList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
        <ul id="adminActionList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
    </ul>
</div>

<!-- The pay advice view -->
<div id="payAdvice" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.payslips.PayAdviceView">
    <h1 id="payAdviceHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'PAY_ADVICE'" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="payAdviceInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="payAdviceContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
</div>

<!-- The expense advice view -->
<div id="expenseAdvice" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.expenses.ExpenseAdviceView">
    <h1 id="expenseAdviceHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'EXPENSE_ADVICE'" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="expenseAdviceInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="expenseAdviceContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
</div>

<!-- The leave requests list view -->
<div id="leaveRequests" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.leave.display.LeaveRequestsView">
    <h1 id="leaveRequestsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
    </h1>
    <ul id="leaveRequestsList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
</div>

<!-- The leave request view -->
<div id="leaveRequest" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.leave.display.LeaveRequestView">
    <h1 id="leaveRequestHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="leaveRequestInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="leaveRequestContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
    <div class="mobilehrCenteredDiv">
        <button id="cancelLeaveRequestButton" class="mobilehrSubmitButtonUnrestrictedWidth mobilehrIsHidden"
                data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The authorisation types view, showing what types of authorisations there may be (leave requests, expenses, etc) -->
<div id="authorisationTypes" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.authorisation.AuthorisationTypesView">
    <h1 id="authorisationTypesHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="authorisationTypesBanner" class="mobilehrInstructions"></div>
    </div>
    <div id="authorisationTypesInstructions" class="mobilehrLowerCaseInstructions"></div>
    <ul id="authorisationTypesList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
</div>

<!-- The leave requests authorisation view, from where a user can bulk authorise or reject leave requests -->
<div id="authorisationLeaveRequests" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestsView">
    <h1 id="authorisationLeaveRequestsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="authorisationLeaveRequestsTitle" class="mobilehrInstructions"></div>
    </div>
    <div id="authorisationLeaveRequestsInstructions" class="mobilehrLowerCaseInstructions"></div>
    <ul id="chooseLeaveTypeList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
    <ul id="authorisationLeaveRequestsList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
    <div class="mobilehrCenteredDiv">
        <button id="bulkAuthoriseLeaveButton" class="mobilehrAuthoriseButton"
                data-dojo-type="dojox.mobile.Button"></button>
        <button id="bulkRejectLeaveButton" class="mobilehrRejectButton" data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The leave request authorisation view, from where a user can provide comments against the authorisation
     or rejection of an individual leave request -->
<div id="authorisationLeaveRequest" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestView">
    <h1 id="authorisationLeaveRequestHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" id="leaveAuthorisationDetails" data-dojo-props="shadow:true"></div>
    <div class="mobilehrCenteredDiv">
        <%--suppress HtmlFormInputWithoutLabel --%>
        <textarea rows="6" cols="40" id="leaveAuthorisationComments" class="mobilehrTextArea"
                  data-dojo-type="dojox.mobile.TextArea"></textarea>
    </div>
    <div class="mobilehrCenteredDiv">
        <button id="authoriseLeaveButton" class="mobilehrAuthoriseButton" data-dojo-type="dojox.mobile.Button"></button>
        <button id="rejectLeaveButton" class="mobilehrRejectButton" data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The leave types view which displays the list of leave types a user can use to thin down the set of
     leave requests they may be dealing with during authorisation -->
<div id="leaveTypes" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.authorisation.leave.LeaveTypesView">
    <h1 id="leaveTypesHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <ul id="leaveTypesList" data-dojo-type="dojox.mobile.RoundRectList" data-dojo-props="select:'single'"></ul>
</div>

<!-- The leave range view from which a user provides a start and an end date for their intended leave -->
<div id="leaveRange" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.leave.book.LeaveRangeView">
    <h1 id="leaveRangeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="leaveRangeInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="leaveStartInstructions" class="mobilehrSpinWheelInstructions"></div>
    <div id="leaveRangeStartDate" class="mobilehrTextArea"
         data-dojo-type="mobilehr.widgets.utils.spinners.SpinWheelDatePicker"></div>
    <div id="leaveEndInstructions" class="mobilehrSpinWheelInstructions"></div>
    <div id="leaveRangeEndDate" class="mobilehrTextArea"
         data-dojo-type="mobilehr.widgets.utils.spinners.SpinWheelDatePicker"></div>
    <div>
        <ul data-dojo-type="dojox.mobile.RoundRectList">
            <li id="leaveRangeContinueItem" data-dojo-type="dojox.mobile.ListItem"
                data-dojo-props="icon:'mobilehr/images/icon_29.png', moveTo:'#', transition:'slide'">
            </li>
        </ul>
    </div>
</div>

<!-- The entitlement groups view, showing what can be booked against according to the leave types -->
<div id="leaveEntitlementGroups" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.leave.entitlement.LeaveEntitlementGroupsView">
    <h1 id="leaveEntitlementGroupsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="leaveEntitlementGroupsInstructions" class="mobilehrInstructions"></div>
    </div>
    <ul id="leaveEntitlementGroupsList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
</div>

<!-- Some types of leave have multiple entitlements, so we need a view to display this -->
<div id="leaveEntitlement" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.leave.entitlement.LeaveEntitlementView">
    <h1 id="leaveEntitlementHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="leaveEntitlementInstructions" class="mobilehrInstructions"></div>
    </div>
    <ul id="leaveEntitlementList" data-dojo-type="dojox.mobile.RoundRectList"></ul>
</div>

<!-- Book leave view whose content is dependent on the entitlement and start date and end date passed in -->
<div id="bookLeaveRequest" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.leave.book.BookLeaveRequestView">
    <h1 id="bookLeaveRequestHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="bookLeaveRequestInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="bookLeaveRequestDisplayDetails" data-dojo-type="dojox.mobile.RoundRect"
         data-dojo-props="shadow:true"></div>
    <div id="bookLeaveRequestOptions"></div>
    <div class="mobilehrCenteredDiv">
        <button id="submitLeaveButton" class="mobilehrSubmitButton" data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- Choose the booking type for the leave start point.  This could be "Full Day", "AM", "PM", or a HH:MM 24 hour clock time setting -->
<div id="chooseStartLeaveBookingType" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.leave.book.ChooseStartLeaveBookingTypeView">
    <h1 id="chooseStartLeaveBookingTypeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="chooseStartLeaveBookingTypeInstructions" class="mobilehrInstructions"></div>
    </div>
    <ul id="chooseStartLeaveBookingTypeList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'single'"></ul>
</div>

<!-- Choose the booking type for the leave end point.  This could be "Full Day", "AM", "PM", or a HH:MM 24 hour clock time setting -->
<div id="chooseEndLeaveBookingType" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.leave.book.ChooseEndLeaveBookingTypeView">
    <h1 id="chooseEndLeaveBookingTypeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="chooseEndLeaveBookingTypeInstructions" class="mobilehrInstructions"></div>
    </div>
    <ul id="chooseEndLeaveBookingTypeList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'single'"></ul>
</div>

<!-- Choose the booking type for the same day.  This could be "Full Day", "AM", "PM", or both of HH:MM 24 hour clock
     time setting for start time and a HH:MM 24 hour clock time setting for the end time.  Hence the multiple
     selection being valid (albeit controlled in code) -->
<div id="chooseSameDayLeaveBookingType" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.leave.book.sameDay.ChooseSameDayLeaveBookingTypeView">
    <h1 id="chooseSameDayLeaveBookingTypeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="chooseSameDayLeaveBookingTypeInstructions" class="mobilehrInstructions"></div>
    </div>
    <ul id="chooseSameDayLeaveBookingTypeList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'multiple'"></ul>
</div>

<!-- Simple choose start time view holding just a time spinner for a user to set a time input value -->
<div id="chooseStartTime" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.utils.time.StartTimeView">
    <h1 id="chooseStartTimeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="chooseStartTimeInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="chooseStartTimeSpinner" class="mobilehrTextArea"
         data-dojo-type="mobilehr.widgets.utils.spinners.SpinWheelTimePicker"></div>
</div>

<!-- Simple choose end time view holding just a time spinner for a user to set a time input value -->
<div id="chooseEndTime" class="mobilehrIsHidden" data-dojo-type="mobilehr.widgets.utils.time.EndTimeView">
    <h1 id="chooseEndTimeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             data-dojo-props="eventTypeFilter: 'LEAVE_REQUEST'" style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="chooseEndTimeInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="chooseEndTimeSpinner" class="mobilehrTextArea"
         data-dojo-type="mobilehr.widgets.utils.spinners.SpinWheelTimePicker"></div>
</div>

<!-- The required field options view from which a user can select a particular required field option -->
<div id="requiredFieldOptions" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.requiredFields.RequiredFieldOptionsView">
    <h1 id="requiredFieldOptionsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <ul id="requiredFieldOptionsList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'single'"></ul>
</div>

<!-- The not yet supported view we use as a placeholder when we either encounter a link we don't support, or encounter
     a piece of work that is to be completed -->
<div id="notYetSupported" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.utils.notYetSupported.NotYetSupportedView">
    <h1 id="notYetSupportedHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading" data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
    </h1>
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="notYetSupportedInstructions" class="mobilehrInstructions"></div>
    </div>
    <div id="notYetSupportedContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
</div>

<!-- The standard confirmation (yes/no, confirm/cancel) dialog any one of the views can display when needed.  Leave
 the style as it is please.  I know its "bad practice" but its necessary. -->
<div id="confirmationDialog" style="display:none" class="mobilehrDialog"
     data-dojo-type="mobilehr.widgets.utils.dialogs.ConfirmationDialog">
    <div class="mobilehrDialogContainer">
        <div id="confirmationDialogTitle" class="mobilehrDialogTitle"></div>
        <div id="confirmationDialogContent" class="mobilehrDialogContent"></div>
        <button id="confirmationDialogConfirmButton" class="mobilehrAuthoriseButton"
                data-dojo-type="dojox.mobile.Button"></button>
        <button id="confirmationDialogCancelButton" class="mobilehrRejectButton"
                data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The simple message dialog any one of the views can display when needed.  Again leave the style as it is please. -->
<div id="messageDialog" style="display:none" class="mobilehrDialog"
     data-dojo-type="mobilehr.widgets.utils.dialogs.MessageDialog">
    <div class="mobilehrDialogContainer">
        <div id="messageDialogTitle" class="mobilehrDialogTitle"></div>
        <div id="messageDialogContent" class="mobilehrDialogContent"></div>
        <button id="messageDialogAcknowledgeButton" class="mobilehrAuthoriseButton"
                data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The user directory search term input view -->
<div id="performUserDirectorySearch" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.userDirectory.PerformUserDirectorySearchView">
    <h1 id="performUserDirectorySearchHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
    </h1>
    <!-- inform the user of the type of search they are performing -->
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="userDirectorySearchInstructions" class="mobilehrInstructions"></div>
    </div>
    <div class="mobilehrCenteredDiv mobilehrSearchDirectoryInputContainer">
        <%--suppress HtmlFormInputWithoutLabel --%>
        <input id="directorySearchTerm" data-dojo-type="dojox.mobile.TextBox" class="mobilhrSearchDirectorySearchInput"
               data-dojo-props="selectOnClick:true, maxLength:15">
    </div>
    <div>
        <ul data-dojo-type="dojox.mobile.RoundRectList">
            <li id="directorySearchTypeChooser"></li>
        </ul>
    </div>
    <div class="mobilehrCenteredDiv">
        <button id="submitDirectorySearchButton" class="mobilehrSubmitButton"
                data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The user directory search type selection view -->
<div id="selectUserDirectorySearchType" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.userDirectory.SelectUserDirectorySearchTypeView">
    <h1 id="selectUserDirectorySearchTypeHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <!-- tell the user to select a search type to proceed -->
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="userDirectorySearchTypeInstructions" class="mobilehrInstructions"></div>
    </div>
    <!-- the list of search types we can perform (a list of UserDirectorySearchItem widgets)-->
    <ul id="userDirectorySearchTypeList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'single'"></ul>
</div>


<!-- The user directory search results -->
<div id="userDirectorySearchResults" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.userDirectory.UserDirectorySearchResultsView">
    <h1 id="userDirectorySearchResultsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <!-- tell the user to select a search type to proceed -->
    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="userDirectorySearchResultsInstructions" style="overflow:auto;" class="mobilehrInstructions"></div>
    </div>

    <!-- the list of results that were returned from the search (a list of UserDirectorySearchResultListItem widgets)-->
    <ul id="userDirectorySearchResultsList" data-dojo-type="dojox.mobile.RoundRectList"
        data-dojo-props="select:'single'"></ul>
</div>

<!-- The full content of a search result -->
<div id="userDirectorySearchResult" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.userDirectory.UserDirectorySearchResultView">
    <h1 id="userDirectorySearchResultHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'">
        <div data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsToolBarButton"
             style="float:right;"></div>
        <div data-dojo-type="mobilehr.widgets.common.HomeToolBarButton" style="float:right;"></div>
    </h1>
    <!-- the content of the search result-->
    <div id="searchResultContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
    <div class="mobilehrCenteredDiv">
        <button id="userDirectorySmsButton" class="mobilehrSubmitButtonUnrestrictedWidth"
                data-dojo-type="dojox.mobile.Button"></button>
    </div>
</div>

<!-- The users current event notifications -->
<div id="eventNotifications" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsView">
    <h1 id="eventNotificationsHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading">
        <div id="eventNotificationBackButton"
             data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationsBackToolBarButton"
             style="float:right;"></div>
    </h1>

    <div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true">
        <div id="eventNotificationsInstructions" class="mobilehrInstructions"></div>
    </div>
    <!-- the list of results that were returned from the search (a list of UserDirectorySearchResultListItem widgets)-->
    <ul id="eventNotificationsList" data-dojo-type="dojox.mobile.RoundRectList" data-dojo-props="select:'single'"></ul>
</div>

<!-- The full content of notification -->
<div id="eventNotification" class="mobilehrIsHidden"
     data-dojo-type="mobilehr.widgets.eventNotification.EventNotificationView">
    <h1 id="eventNotificationHeading" data-dojo-type="mobilehr.widgets.common.MobileHeading"
        data-dojo-props="back:'Back', moveTo:'#'"></h1>
    <!-- the content of the notification-->
    <div id="eventNotificationContent" data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:true"></div>
    <!-- a button that will take the client to the related resource -->
    <div id="getRelatedResourceButton" data-dojo-type="dojox.mobile.RoundRect" class="mobilehrIsHidden"
         data-dojo-props="shadow:true">
        <div id="getRelatedResourceButtonInstructions" class="mobilehrInstructions"></div>
    </div>
</div>

</body>
</html>