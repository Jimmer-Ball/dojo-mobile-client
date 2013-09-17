/**
 * Authorisation of individual leave request view holding:-
 *
 * 1) Details of the leave request
 * 2) Comment box for user input of comments
 * 3) Authorise and reject buttons to allow authorisation or rejection of the relevant leave request.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
        "dojox/mobile/TransitionEvent", "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper",
        "mobilehr/mixins/RepresentationHelper"],
    function (declare, lang, array, connect, registry, TransitionEvent, ScrollableView, WidgetHelper,
              RepresentationHelper) {
        return declare("mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                leaveRequestTableTemplate:'<table width="100%"><tbody>${content}</tbody></table>',
                leaveRequestItemTemplate:'<tr><td valign="top"><span style="font-weight: bold;">${itemName}</span></td>' +
                    '<td align="right"><span>${itemValue}</span></td></tr>',
                constructor:function () {
                    this.parentView = null;
                    this.leaveRequest = null;
                    this.chosenLeaveType = null;
                    this.authorisationLeaveRequestHeading = null;
                    this.leaveAuthorisationDetails = null;
                    this.leaveAuthorisationComments = null;
                    this.authoriseLeaveButton = null;
                    this.rejectLeaveButton = null;
                    this.confirmationDialog = null;
                    this.messageDialog = null;
                    this.backDestination = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.authorisationLeaveRequestHeading = registry.byId("authorisationLeaveRequestHeading");
                    this.authorisationLeaveRequestHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.authorisationLeaveRequestHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.leaveAuthorisationDetails = registry.byId("leaveAuthorisationDetails");
                    this.leaveAuthorisationComments = registry.byId("leaveAuthorisationComments");
                    this.leaveAuthorisationComments.set("placeholder", _lexicon.leaveAuthorisationCommentsPlaceholder);
                    this.authoriseLeaveButton = registry.byId("authoriseLeaveButton");
                    this.authoriseLeaveButton._setLabelAttr(_lexicon.authoriseLeaveButton);
                    this.rejectLeaveButton = registry.byId("rejectLeaveButton");
                    this.rejectLeaveButton._setLabelAttr(_lexicon.rejectLeaveButton);
                    this.confirmationDialog = registry.byId("confirmationDialog");
                    this.messageDialog = registry.byId("messageDialog");
                    this.backDestination = "authorisationLeaveRequests";
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                    this._subscriptions.push(connect.connect(this.authorisationLeaveRequestHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.authoriseLeaveButton.domNode, "onclick", lang.hitch(this, "_authoriseClicked")));
                    this._subscriptions.push(connect.connect(this.rejectLeaveButton.domNode, "onclick", lang.hitch(this, "_rejectClicked")));
                },
                createContent:function (parentView, leaveRequest, chosenLeaveType, backDestination) {
                    this.parentView = parentView;
                    this.leaveRequest = leaveRequest;
                    this.chosenLeaveType = chosenLeaveType;
                    this.backDestination = backDestination;
                    var tableContents = "";
                    tableContents = [tableContents,
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestEmployeeNameLabel, itemValue:this.leaveRequest.employeeName}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestLeaveTypeLabel, itemValue:this.leaveRequest.leaveType.leaveTypeName}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestSubmissionDateLabel, itemValue:this.convertToDateOnly(this.leaveRequest.submissionDate)}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestLeaveUnitsLabel, itemValue:this.leaveRequest.leaveUnits}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestStartDateLabel, itemValue:this.convertToDateOnly(this.leaveRequest.startDate)}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestEndDateLabel, itemValue:this.convertToDateOnly(this.leaveRequest.endDate)}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestStartTimeLabel, itemValue:this.leaveRequest.startTime}),
                        this.substitute(this.leaveRequestItemTemplate, {itemName:_lexicon.leaveRequestEndTimeLabel, itemValue:this.leaveRequest.endTime})
                    ].join("");
                    this.leaveAuthorisationComments.set("value", null);
                    this.leaveAuthorisationDetails.containerNode.innerHTML = this.substitute(this.leaveRequestTableTemplate, {content:tableContents});
                },
                _backClicked:function () {
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                _authoriseClicked:function () {
                    this.confirmationDialog.show(_lexicon.dialogConfirmationTitle, _lexicon.confirmLeaveRequestAuthorise,
                        _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                        lang.hitch(this, "_confirmedAuthorisation"),
                        lang.hitch(this, "_cancelled"));
                },
                _rejectClicked:function () {
                    this.confirmationDialog.show(_lexicon.dialogConfirmationTitle, _lexicon.confirmLeaveRequestReject,
                        _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                        lang.hitch(this, "_confirmedRejection"),
                        lang.hitch(this, "_cancelled"));
                },
                _confirmedAuthorisation:function () {
                    var authorisation = this.getLeaveRequestAuthStructure(this.leaveRequest.uuid, this.getUTCTimestamp(),
                        this.leaveAuthorisationComments.get("value"));
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_sentAuthorisation"));
                    _resourceController.doCreate(authorisation, "services/mobile/actions/leaveRequest/authorise");
                },
                _confirmedRejection:function () {
                    var rejection = this.getLeaveRequestAuthStructure(this.leaveRequest.uuid, this.getUTCTimestamp(),
                        this.leaveAuthorisationComments.get("value"));
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_sentRejection"));
                    _resourceController.doCreate(rejection, "services/mobile/actions/leaveRequest/reject");
                },
                _cancelled:function () {
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                _sentAuthorisation:function () {
                   this._actOnResponseCode();
                },
                _sentRejection:function () {
                   this._actOnResponseCode();
                },
                _actOnResponseCode:function() {
                    switch(_resourceController.responseCode) {
                        case 201 :
                            this._returnToParentAndRemoveAuthorisation(_resourceController.responseData);
                            break;
                        case 401 :
                            this.goBackToLoginView(this.domNode);
                            break;
                        default :
                            this.displayServiceErrorDialog(_lexicon.dialogErrorTitle,_lexicon.dialogConfirmationButtonLabel, this.messageDialog, null);
                            break;
                    }
                },
                _returnToParentAndRemoveAuthorisation:function(actionProcessed) {
                    this.parentView.removeLeaveRequest(actionProcessed);
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });