/**
 * View displayed when there is more than one entitlement for a given leave type (e.g. holiday) that shows
 * a set of list items each indicating the entitlement name and if its not indefinite the number of units
 * remaining.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/leave/entitlement/LeaveEntitlementListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, LeaveEntitlementListItem) {
        return declare("mobilehr.widgets.leave.entitlement.LeaveEntitlementView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                /**
                 * If we navigate off this view from our list items, we need to tell the LeaveEntitlementListItem
                 * were to navigate to.  If you choose a particular entitlement we navigate to bookLeave and let
                 * it know it came from this view by setting the destinationViewOnBack to here.
                 */
                constructor:function () {
                    this.leaveEntitlementList = null;
                    this.leaveEntitlementHeading = null;
                    this.leaveEntitlementInstructions = null;
                    this.startDate = null;
                    this.endDate = null;
                    this.backDestination = null;
                    this._subscriptions = [];
                    this.destinationView = "bookLeaveRequest";
                    this.destinationViewOnBack = "leaveEntitlement";
                },
                startup:function () {
                    this.inherited(arguments);
                    this.leaveEntitlementList = registry.byId("leaveEntitlementList");
                    this.leaveEntitlementHeading = registry.byId("leaveEntitlementHeading");
                    this.leaveEntitlementHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.leaveEntitlementHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.leaveEntitlementInstructions = this.$("leaveEntitlementInstructions");
                    this.leaveEntitlementInstructions.innerHTML = _lexicon.leaveEntitlementInstructions;
                    this._subscriptions.push(connect.connect(this.leaveEntitlementHeading.get("backButton"),
                        "onclick", lang.hitch(this, "_backClicked")));
                },
                /**
                 * Build up the content of the leave entitlement view by reference to the entitlementsByType passed in.
                 *
                 * @param entitlementsByType entitlements applicable given type
                 * @param startDate The requested start date
                 * @param endDate The requested end date
                 * @param backDestination back destination
                 */
                createContent:function (entitlementsByType, startDate, endDate, backDestination) {
                    this.startDate = startDate;
                    this.endDate = endDate;
                    this.backDestination = backDestination;
                    this.clearListWidget(this.leaveEntitlementList);
                    array.forEach(entitlementsByType.entitlements.sort(this._sortByEntitlementName), function (entitlement) {
                        this.leaveEntitlementList.addChild(
                            new LeaveEntitlementListItem({
                                entitlement:entitlement,
                                startDate:this.startDate,
                                endDate:this.endDate,
                                destinationView:this.destinationView,
                                destinationViewOnBack:this.destinationViewOnBack}));
                    }, this);
                },
                _backClicked:function () {
                    this.leaveEntitlementHeading.goTo(this.backDestination, this.leaveEntitlementHeading.href);
                },
                _sortByEntitlementName:function (entitlementA, entitlementB) {
                    if (entitlementA.description === entitlementB.description) return 0;
                    return entitlementA.description < entitlementB.description ? -1 : 1;
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });