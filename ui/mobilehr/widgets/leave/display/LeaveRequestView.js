/**
 * Display a leave request and provide users with the oppurtunity to cancel it if its in a viable state i.e. not
 * already cancelled or authorised.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojo/dom-class", "dojox/mobile/ScrollableView", "dojox/mobile/TransitionEvent", "dojox/mobile/Button",
    "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper", "mobilehr/mixins/FieldBuilder"],
    function (declare, lang, array, connect, registry, domClass, ScrollableView, TransitionEvent, Button, WidgetHelper,
              RepresentationHelper,
              FieldBuilder) {
        return declare("mobilehr.widgets.leave.display.LeaveRequestView",
            [ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder], {
                constructor:function() {
                    this.leaveRequest = null;
                    this.leaveRequestDisplayFields = null;
                    this.leaveRequestContent = null;
                    this.leaveRequestHeading = null;
                    this.leaveRequestInstructions = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    this.confirmationDialog = null;
                    // an optional cancellation button that may be displayed if the leave request
                    // this view represents contains a cancellation link
                    this.cancelLeaveRequestButton = null;
                    this.messageDialog = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.leaveRequestDisplayFields = [
                        {fieldId: "leaveType.leaveTypeName", fieldLabel: _lexicon.leaveRequestLeaveType, layout: "single"},
                        {fieldId: "state", fieldLabel: _lexicon.leaveRequestState, layout: "single"},
                        {fieldId: "submissionDate", fieldLabel: _lexicon.leaveRequestSubmissionDate, dataType: "date", layout: "single"},
                        {fieldId: "leaveUnits", fieldLabel: _lexicon.leaveRequestUnitsTaken, descriptorField: "leaveUnitsDescription"} ,
                        {fieldId: "startDate", fieldLabel: _lexicon.leaveRequestStartDate, dataType: "date", descriptorField: "startDayType"},
                        {fieldId: "startTime", fieldLabel: _lexicon.leaveRequestStartTime},
                        {fieldId: "endDate", fieldLabel: _lexicon.leaveRequestEndDate, dataType: "date", descriptorField: "endDayType"},
                        {fieldId: "endTime", fieldLabel: _lexicon.leaveRequestEndTime}];
                    this.leaveRequestContent = registry.byId("leaveRequestContent");
                    this.leaveRequestHeading = registry.byId("leaveRequestHeading");
                    this.leaveRequestHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.leaveRequestHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.leaveRequestInstructions = this.$("leaveRequestInstructions");
                    this.leaveRequestInstructions.innerHTML = _lexicon.leaveRequestInstructions;
                    this.cancelLeaveRequestButton = registry.byId("cancelLeaveRequestButton");
                    this.cancelLeaveRequestButton._setLabelAttr(_lexicon.cancelLeaveRequestButton);
                    this._subscriptions.push(connect.connect(this.leaveRequestHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.cancelLeaveRequestButton.domNode, "onclick", lang.hitch(this, "_cancelRequestClicked")));
                    this.backDestination = "actions";
                    this.confirmationDialog = registry.byId("confirmationDialog");
                    this.messageDialog = registry.byId("messageDialog");
                },
                createContent:function (dto, backDestination) {
                    if (dto.hasOwnProperty("errorCode")) {
                        this.displayServiceErrorNodeContent(dto["errorCode"], this.leaveRequestContent.containerNode,
                            _resourceController.responseData, "informationNoData");
                    } else {
                        this._createContent(dto);
                    }
                    this.backDestination = backDestination;
                },
                _createContent:function (dto) {
                    this.leaveRequest = dto;
                    this.leaveRequestContent.containerNode.innerHTML =
                        this.createDisplayFields(this.leaveRequestDisplayFields, dto);
                    this._setupCancellationButton(this.leaveRequest);
                },
                /**
                 * Set the display class for the leave request cancellation button based on the links
                 * provided in the leave request representation and the current state of that request.
                 *
                 * @param leaveRequest the leave request this view is displaying
                 */
                _setupCancellationButton:function(leaveRequest) {
                    // ensure that the button is hidden by default
                    if (!domClass.contains(this.cancelLeaveRequestButton.domNode, "mobilehrIsHidden")) {
                        domClass.add(this.cancelLeaveRequestButton.domNode, "mobilehrIsHidden");
                    }
                    // show the button if the leave request has not already been authorised or cancelled and we
                    // received a valid cancellation link in the leave request representation
                    if (leaveRequest.links !== null && leaveRequest.state !== "AUTHORISED" &&
                        leaveRequest.state !== "CANCELLED") {
                        array.forEach(leaveRequest.links, lang.hitch(this, function (link) {
                            // if a cancellation link was provided then show the button
                            if (link.rel === "cancelLeaveRequest") {
                                // remove the view only class i.e. show the button
                                domClass.remove(this.cancelLeaveRequestButton.domNode, "mobilehrIsHidden");
                            }
                        }));
                    }
                },
                /**
                 * When the cancel button is pressed we ask the user to confirm this action before letting them
                 * continue.
                 */
                _cancelRequestClicked:function() {
                    this.confirmationDialog.show(
                        _lexicon.dialogConfirmationTitle,
                        _lexicon.confirmCancelLeaveRequest,
                        _lexicon.dialogConfirmationButtonLabel,
                        _lexicon.dialogCancellationButtonLabel,
                        lang.hitch(this, "_performCancellation"),
                        lang.hitch(this, "_cancelledRequest"));
                },
                _performCancellation:function() {
                    // create cancellation request representation
                    var leaveRequestCancellation = this.getLeaveRequestCancelActionStructure(
                        this.leaveRequest.uuid, this.getUTCTimestamp());

                    // send it to the services cancellation resource
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_submittedCancellationRequest"));
                    _resourceController.doCreate(leaveRequestCancellation, "services/mobile/actions/leaveRequest/cancel");
                },
                /**
                 * If we successfully cancelled the leave request, navigate back to LeaveRequestsView. If we got a 401 go
                 * back to the login view, and if we got anything else display an error dialog.
                 */
                _submittedCancellationRequest:function () {
                    switch(_resourceController.responseCode) {
                        case 201 :
                            this.transitionOptions = {moveTo:"actions", href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                            new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                            break;
                        case 401 :
                            this.goBackToLoginView(this.domNode);
                            break;
                        default :
                            this.displayServiceErrorDialog(_lexicon.dialogErrorTitle,
                                _lexicon.dialogConfirmationButtonLabel, this.messageDialog, null);
                            break;
                    }
                },
                /**
                 * Do nothing function that gets called when a user decides not to cancel the request.
                 */
                _cancelledRequest:function () {
                },
                _backClicked:function () {
                    this.leaveRequestHeading.goTo(this.backDestination, this.leaveRequestHeading.href);
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });