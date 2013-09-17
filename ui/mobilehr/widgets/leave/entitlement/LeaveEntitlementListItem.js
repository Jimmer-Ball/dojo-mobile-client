/**
 * List item for an individual leave entitlement.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
        "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.entitlement.LeaveEntitlementListItem", [ListItem, WidgetHelper], {
            /**
             * One of these gets created from LeaveEntitlementView and from LeaveEntitlementGroupsView when
             * navigating off to the bookLeaveRequest view. When coming from LeaveEntitlementView, the
             * destinationViewOnBack is set to "leaveEntitlement", and when coming from LeaveEntitlementGroupView,
             * the destinationViewOnBack is set to "leaveEntitlementGroups"
             *
             * @param params params
             */
            preamble:function (params) {
                this.variableHeight = true;
                this.entitlement = params.entitlement;
                this.startDate = params.startDate;
                this.endDate = params.endDate;
                this.destinationView = params.destinationView;
                this.destinationViewOnBack = params.destinationViewOnBack;
                this.label = this.entitlement.description;
                this.isIndefinite = this.entitlement.indefiniteEntitlement;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                if (!this.isIndefinite) {
                    this.rightText = [this.entitlement.unitsRemaining, " ", this.entitlement.leaveUnitType].join("");
                }
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._displayBookLeaveView();
            },
            _displayBookLeaveView:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.entitlement, this.startDate, this.endDate, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });