/**
 * List item for displaying a particular leave request
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.display.LeaveRequestListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.leaveRequest = params.leaveRequest;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.destinationView = "leaveRequest";
                this.destinationViewOnBack = "leaveRequests";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showLeaveRequest();
            },
            _showLeaveRequest:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.leaveRequest, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });