/**
 * Given the input list of leave requests, display all the different leave types a user can pick from, including
 * our magic "All" type, and also highlight (via a tick) which type of leave is currently chosen. The choice of a
 * given leave type is mutually exclusive, if you select one of these then you un-select the others.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/authorisation/leave/LeaveTypeListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, LeaveTypeListItem) {
        return declare("mobilehr.widgets.authorisation.leave.LeaveTypesView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.types = null;
                    this.chosenLeaveType = null;
                    this.leaveRequestsLeftToProcess = null;
                    this.backDestination = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.leaveTypesList = registry.byId("leaveTypesList");
                    this.leaveTypesHeading = registry.byId("leaveTypesHeading");
                    this.leaveTypesHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.leaveTypesHeading._setLabelAttr(_lexicon.applicationTitle);
                    this._subscriptions.push(connect.connect(this.leaveTypesHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },
                /**
                 * First, we work out the list of leave types to choose from given the types of the input leave requests
                 * and we include the default type "All" (see the WidgetHelper class for details of the UUID), and then
                 * we build up the display of our leave types and take into account which is currently selected. When
                 * first created "All" will be selected.
                 *
                 * @param chosenLeaveType chosen leave type
                 * @param leaveRequestsLeftToProcess leave requests left to process
                 * @param backDestination back destination
                 */
                createContent:function (chosenLeaveType, leaveRequestsLeftToProcess, backDestination) {
                    this.leaveRequestsLeftToProcess = leaveRequestsLeftToProcess;
                    this.chosenLeaveType = chosenLeaveType;
                    this.backDestination = backDestination;
                    this.types = [];
                    array.forEach(this.leaveRequestsLeftToProcess, function (leaveRequest) {
                        if (!this.contains(this.types, "leaveTypeName", leaveRequest.leaveType.leaveTypeName)) {
                            this.types.push(leaveRequest.leaveType);
                        }
                    }, this);
                    if (!this.contains(this.types, "uuid", this.ALL_LEAVE_TYPE_UUID)) {
                        this.types.push(this.getAllLeaveType());
                    }
                    this.clearListWidget(this.leaveTypesList);
                    array.forEach(this.types, function (leaveType) {
                        if (leaveType.uuid === this.chosenLeaveType.uuid) {
                            this.leaveTypesList.addChild(new LeaveTypeListItem({type: leaveType, isSelected: true}));
                        } else {
                            this.leaveTypesList.addChild(new LeaveTypeListItem({type: leaveType, isSelected: false}));
                        }
                    }, this);
                },
                /**
                 * We go back to AuthorisationLeaveRequestsView filtering the display accordingly.
                 */
                _backClicked:function () {
                    var gotType = null;
                    var children = this.leaveTypesList.getChildren();
                    for (var i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        if (child.checked) {
                            gotType = child.type;
                            break;
                        }
                    }
                    if (gotType !== null) {
                        this.chosenLeaveType = gotType;
                    } else {
                        this.chosenLeaveType = this.getAllLeaveType();
                    }
                    var destination = registry.byId(this.backDestination);
                    destination.filterAuthorisationsAccordingToLeaveType(this.chosenLeaveType);
                    this.performTransition(this.backDestination, -1, "slide", null, null);
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });