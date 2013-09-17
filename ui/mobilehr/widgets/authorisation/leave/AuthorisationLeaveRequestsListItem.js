/**
 * List item for leave requests that can be authorised.  On click it displays the individual leave request subject to
 * authorisation, allowing the user to add comments and to authorise or reject the individual request.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class",
    "dijit/registry", "dojo/query", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/TransitionEvent", "dojox/mobile/deviceTheme"],
    function (declare, lang, connect, array, domClass, registry, query, ListItem, WidgetHelper, TransitionEvent, dt) {
        return declare("mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestsListItem", [ListItem, WidgetHelper], {
            userDetailsTemplate:'<span class="mobilehrListItemLeftTop">${employeeName}</span><br>' +
                '<span class="mobilehrListItemLeftBottom">${submissionDate}</span>',
            leaveDetailsTemplate:'<span class="mobilehrListItemRightTop">${dateRange}</span><br>' +
                '<span class="mobilehrListItemRightBottom">${leaveTypeName}</span>',
            /**
             * Allow our list item to be of variable height to accommodate our variable contents
             *
             * @param params whatever we were invoked with on "new"
             */
            preamble:function (params) {
                this.variableHeight = true;
                this.parentView = params.parentView;
                this.leaveRequest = params.leaveRequest;
                this.chosenLeaveType = params.chosenLeaveType;
                this.itemSelected = params.itemSelected;
                this.moveTo = "#";
                if (this.itemSelected) {
                    this.icon = "mblDomButtonSilverCircleGreenButton";
                } else {
                    this.icon = "mblDomButtonSilverCircleRedCross";
                }
                this.destinationView = "authorisationLeaveRequest";
                this.destinationViewOnBack = "authorisationLeaveRequests";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
                this._subscriptions = [];
            },
            /**
             * Specially populate our list item so the user details on the left and the leave details on the right are
             * easy on the eye and take the current theme into account.
             */
            buildRendering:function () {
                this.inherited(arguments);
                if (this.labelNode) {
                    this._setLabelAttr(this._formatUserDetails());
                    domClass.add(this.labelNode, "mobilehrListItemLeftSmallText");
                }
                this._setRightTextAttr(this._formatLeaveDetails());
                if (dt.currentTheme === "android") {
                    domClass.replace(this.rightTextNode, "androidMobilehrListItemRightSmallText", "mblListItemRightText");
                } else {
                    domClass.replace(this.rightTextNode, "mobilehrListItemRightSmallText", "mblListItemRightText");
                }
            },
            /**
             * On startup we have to get a bit nasty here.  We have to un-wire the singular generic click handler and
             * wire up separate handlers to different bits of widget instead, so clicking on different bits trip
             * different methods and so behaviour.
             */
            startup:function () {
                this.inherited(arguments);
                // Un-wire the generic onClick handler so nothing "generic" happens on clicking the "whole" of our item
                if (this._onClickHandle) {
                    connect.disconnect(this._onClickHandle);
                }
                // Add in our custom onclick handlers to cope with our users clicking different parts of our item and
                // so resulting in specific behaviours depending on where they click along its length.
                this._subscriptions.push(connect.connect(this.iconNode, "onclick", lang.hitch(this, "_iconNodeClicked")));
                this._subscriptions.push(connect.connect(this.labelNode, "onclick", lang.hitch(this, "_labelNodeClicked")));
                this._subscriptions.push(connect.connect(this.rightTextNode, "onclick", lang.hitch(this, "_rightTextNodeClicked")));
                this._subscriptions.push(connect.connect(this.rightIconNode, "onclick", lang.hitch(this, "_rightIconNodeClicked")));
            },
            /**
             * Toggle the selection status and icon used for indicating whether this item is selected for bulk
             * processing or not.
             *
             * @param itemSelected true if selected, false otherwise
             */
            toggleSelection:function (itemSelected) {
                var divArray = query(".mblDomButton", this.iconNode);
                if (itemSelected === true) {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleGreenButton", "mblDomButtonSilverCircleRedCross");
                } else {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleRedCross", "mblDomButtonSilverCircleGreenButton");
                }
                this.itemSelected = itemSelected;
                this.parentView.toggleSelectionStatus(this.leaveRequest, this.itemSelected);
            },
            /**
             * If the left icon is clicked we amend the iconography and set the itemSelected status appropriately
             */
            _iconNodeClicked:function () {
                var divArray = query(".mblDomButton", this.iconNode);
                if (this.itemSelected === true) {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleRedCross", "mblDomButtonSilverCircleGreenButton");
                    this.itemSelected = false;
                } else {
                    this.switchClassesOnNode(divArray[0], "mblDomButtonSilverCircleGreenButton", "mblDomButtonSilverCircleRedCross");
                    this.itemSelected = true;
                }
                this.parentView.toggleSelectionStatus(this.leaveRequest, this.itemSelected);
            },
            /**
             * If the label, right text, or right icon are clicked we do the same things each time, but only if we
             * are actually selected.
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
                if (this.itemSelected) {
                    this.select();
                    this.setTransitionPos(event);
                    this._showAuthorisationLeaveRequest();
                }
            },
            _showAuthorisationLeaveRequest:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.parentView, this.leaveRequest, this.chosenLeaveType, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },
            /**
             * Format the user details displayed on the left containing the submission date and the employee name.
             */
            _formatUserDetails:function () {
                var submissionDate = this.convertToDateOnly(this.leaveRequest.submissionDate);
                return this.substitute(this.userDetailsTemplate,
                    {employeeName:this.leaveRequest.employeeName, submissionDate:submissionDate});
            },
            /**
             * Format the leave details displayed on the right containing the start date and the end date, and the
             * leave type name
             */
            _formatLeaveDetails:function () {
                var dateRange = "";
                var startDate = this.convertToDateOnly(this.leaveRequest.startDate);
                var endDate = this.convertToDateOnly(this.leaveRequest.endDate);
                dateRange = [dateRange, startDate].join("");
                if (endDate && endDate !== startDate) {
                    dateRange = [dateRange, " - ", endDate].join("");
                }
                return this.substitute(this.leaveDetailsTemplate,
                    {dateRange:dateRange, leaveTypeName:this.leaveRequest.leaveType.leaveTypeName});
            },
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });