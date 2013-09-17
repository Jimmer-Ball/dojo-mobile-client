/**
 * Provide a chooser widget which holds the instruction "Choose leave type:" and the current setting for the
 * chosen leave type.  Clicking on it will put up a list of all the validly available leave types given the
 * leave requests left to process, and will have the currently selected leave type "ticked" and all the others
 * "un-ticked".
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojo/_base/array", "dojo/_base/connect", "dojo/query",
    "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, lang, registry, array, connect, query, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.authorisation.leave.ChooseLeaveTypeListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.chosenLeaveType = params.chosenLeaveType;
                this.moveTo = "#";
                this.icon = "mblDomButtonSilverCircleGreenButton";
                this.label = _lexicon.chooseLeaveType;
                this.rightText = this.chosenLeaveType.leaveTypeName;
                this.parentView = params.parentView;
                this.destinationView = "leaveTypes";
                this.destinationViewOnBack = "authorisationLeaveRequests";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
                this._subscriptions = [];
                this.allSelected = true;
            },
            startup:function () {
                this.inherited(arguments);
                if (this._onClickHandle) {
                    connect.disconnect(this._onClickHandle);
                }
                this._subscriptions.push(connect.connect(this.iconNode, "onclick", lang.hitch(this, "_iconNodeClicked")));
                this._subscriptions.push(connect.connect(this.labelNode, "onclick", lang.hitch(this, "_labelNodeClicked")));
                this._subscriptions.push(connect.connect(this.rightTextNode, "onclick", lang.hitch(this, "_rightTextNodeClicked")));
                this._subscriptions.push(connect.connect(this.rightIconNode, "onclick", lang.hitch(this, "_rightIconNodeClicked")));
            },
            /**
             * Amend the chosen leave type
             *
             * @param chosenLeaveType chosen leave type
             */
            amendChosenLeaveType:function (chosenLeaveType) {
                this.chosenLeaveType = chosenLeaveType;
                this._setRightTextAttr(this.chosenLeaveType.leaveTypeName);
            },
            /**
             * When the icon node gets clicked amend the display and call the parentView toggle method with the value of allSelected
             */
            _iconNodeClicked:function () {
                var divArray = query(".mblDomButton", this.iconNode);
                if (this.allSelected === true) {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleRedCross", "mblDomButtonSilverCircleGreenButton");
                    this.allSelected = false;
                } else {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleGreenButton", "mblDomButtonSilverCircleRedCross");
                    this.allSelected = true;
                }
                this.parentView.toggleChildren(this.allSelected);
            },
            /**
             * Only transition to the possible leave types if there are any selectable authorisations left
             *
             * @param event event
             */
            _labelNodeClicked:function (event) {
                this._mainPartClicked(event);
            },
            _rightTextNodeClicked:function (event) {
                this._mainPartClicked(event);
            },
            _rightIconNodeClicked:function (event) {
                this._mainPartClicked(event);
            },
            _mainPartClicked:function (event) {
                if (this.parentView.gotUnProcessedRequests() === true) {
                    this.select();
                    this.setTransitionPos(event);
                    this._showLeaveTypes();
                }
            },
            /**
             * Show the leave types a user can choose from given the leave requests left to process, making sure we
             * "tick" the type currently selected and "un-tick" all the others. We transition to LeaveTypesView making
             * sure this view builds its list of available leave types on the basis of what is left to process.
             */
            _showLeaveTypes:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.chosenLeaveType,
                    this.parentView.getLeaveRequestsLeftToProcess(),
                    this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });