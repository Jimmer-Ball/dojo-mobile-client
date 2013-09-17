define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/leave/entitlement/LeaveEntitlementGroupsListItem",
    "mobilehr/widgets/leave/entitlement/LeaveEntitlementListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, LeaveEntitlementGroupsListItem, LeaveEntitlementListItem) {
        return declare("mobilehr.widgets.leave.entitlement.LeaveEntitlementGroupsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.leaveEntitlementGroupsList = null;
                    this.leaveEntitlementGroupsHeading = null;
                    this.leaveEntitlementGroupsInstructions = null;
                    this.backDestination = null;
                    this._subscriptions = [];
                    this.startDate = null;
                    this.endDate = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.leaveEntitlementGroupsList = registry.byId("leaveEntitlementGroupsList");
                    this.leaveEntitlementGroupsHeading = registry.byId("leaveEntitlementGroupsHeading");
                    this.leaveEntitlementGroupsHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.leaveEntitlementGroupsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.leaveEntitlementGroupsInstructions = this.$("leaveEntitlementGroupsInstructions");
                    this.leaveEntitlementGroupsInstructions.innerHTML = _lexicon.leaveEntitlementGroupsInstructions;
                    this._subscriptions.push(connect.connect(this.leaveEntitlementGroupsHeading.get("backButton"),
                        "onclick", lang.hitch(this, "_backClicked")));
                },
                /**
                 * Build up the content of the leave entitlement groups view by reference to the full set of
                 * entitlements passed in or the errorCode and errorDetails passed in.
                 *
                 * @param allEntitlements all entitlements applicable
                 * @param startDate The start date for leave
                 * @param endDate The end date for leave
                 * @param backDestination back destination
                 * @param errorCode errorCode if any
                 * @param errorDetails if any
                 */
                createContent:function (allEntitlements, startDate, endDate, backDestination, errorCode, errorDetails) {
                    this.startDate = startDate;
                    this.endDate = endDate;
                    this.backDestination = backDestination;
                    this.clearListWidget(this.leaveEntitlementGroupsList);
                    if (errorCode !== null) {
                        this.displayServiceErrorNodeContent(errorCode, this.leaveEntitlementGroupsList.containerNode, errorDetails, null);
                    } else {
                        this._createContent(allEntitlements);
                    }
                },
                /**
                 * Some leave types will only have one entitlement, so can be booked against, others will have a load
                 * meaming the user has to choose which entitlement to book against.
                 *
                 * @param allEntitlements all entitlements
                 */
                _createContent:function (allEntitlements) {
                    var entitlementsByTypes = this.createEntitlementsByTypesStructure(allEntitlements.leaveEntitlements);
                    if (entitlementsByTypes.length > 0) {
                        array.forEach(entitlementsByTypes.sort(this._sortByLeaveTypesName), function (entitlementsByType) {
                            if (entitlementsByType.entitlements.length > 1) {
                                this.leaveEntitlementGroupsList.addChild(
                                    new LeaveEntitlementGroupsListItem({
                                        entitlementsByType:entitlementsByType,
                                        startDate:this.startDate,
                                        endDate:this.endDate,
                                        destinationView:"leaveEntitlement",
                                        destinationViewOnBack:"leaveEntitlementGroups"}));
                            } else {
                                this.leaveEntitlementGroupsList.addChild(
                                    new LeaveEntitlementListItem({
                                        entitlement:entitlementsByType.entitlements[0],
                                        startDate:this.startDate,
                                        endDate:this.endDate,
                                        destinationView:"bookLeaveRequest",
                                        destinationViewOnBack:"leaveEntitlementGroups"}));
                            }
                        }, this);
                    } else {
                        this.createMessageNodeContent(this.leaveEntitlementGroupsList.containerNode, "informationNoData");
                    }
                },
                _backClicked:function () {
                    this.leaveEntitlementGroupsHeading.goTo(this.backDestination, this.leaveEntitlementGroupsHeading.href);
                },
                _sortByLeaveTypesName:function (entitlementsByTypeA, entitlementsByTypeB) {
                    if (entitlementsByTypeA.leaveType.leaveTypeName === entitlementsByTypeB.leaveType.leaveTypeName) return 0;
                    return entitlementsByTypeA.leaveType.leaveTypeName < entitlementsByTypeB.leaveType.leaveTypeName ? -1 : 1;
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });