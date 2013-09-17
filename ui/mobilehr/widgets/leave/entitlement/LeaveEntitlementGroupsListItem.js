/**
 * Display a list item for a group or collection of entitlements for the input leave type.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.entitlement.LeaveEntitlementGroupsListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.entitlementsByType = params.entitlementsByType;
                this.startDate = params.startDate;
                this.endDate = params.endDate;
                this.destinationView = params.destinationView;
                this.destinationViewOnBack = params.destinationViewOnBack;
                this.leaveType = this.entitlementsByType.leaveType;
                this.label = this.entitlementsByType.leaveType.leaveTypeName;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
            },
            /**
             * We can only amend the right icon 2 attribute after the dom has been put in place for us to hang our
             * hat on
             */
            buildRendering:function () {
                this.inherited(arguments);
                this._setRightIcon2Attr("mblDomButtonGreenCirclePlus");
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._displayEntitlementView();
            },
            /**
             * Display the entitlement view which holds a list of entitlements for the given leave type
             * against which a user can book.
             */
            _displayEntitlementView:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.entitlementsByType, this.startDate, this.endDate, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });