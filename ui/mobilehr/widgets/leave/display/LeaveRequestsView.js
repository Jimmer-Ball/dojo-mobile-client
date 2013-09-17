/**
 * Display an individual leave request
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/leave/display/LeaveRequestListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, LeaveRequestListItem) {
        return declare("mobilehr.widgets.leave.display.LeaveRequestsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.leaveRequestsList = null;
                    this.leaveRequestsHeading = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.leaveRequestsList = registry.byId("leaveRequestsList");
                    this.leaveRequestsHeading = registry.byId("leaveRequestsHeading");
                    this.leaveRequestsHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.leaveRequestsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this._subscriptions.push(connect.connect(this.leaveRequestsHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },
                createContent:function (dto, backDestination) {
                    this.backDestination = backDestination;
                    this.clearListWidget(this.leaveRequestsList);
                    if (dto.hasOwnProperty("errorCode")) {
                        this.displayServiceErrorNodeContent(dto["errorCode"], this.leaveRequestsList.containerNode, _resourceController.responseData, null);
                    } else {
                        this._createContent(dto);
                    }
                },
                _createContent:function (dto) {
                    if (dto.leaveRequests.length > 0) {
                        // sort leave requests by start date desc (so most recent first) then create a list item for each
                        array.forEach(dto.leaveRequests.sort(this._sortRequestsByDate), function (leaveRequest) {
                            this.leaveRequestsList.addChild(
                                new LeaveRequestListItem({
                                    leaveRequest:leaveRequest,
                                    label: this._getListItemLabel(leaveRequest, dto.leaveRequests)
                                }));
                        }, this);
                    } else {
                        this.createMessageNodeContent(this.leaveRequestsList.containerNode, "informationNoData");
                    }
                },
                _backClicked:function () {
                    this.leaveRequestsHeading.goTo(this.backDestination, this.leaveRequestsHeading.href);
                },
                /**
                 * Retrieve the label for our item usually the start date for single days and the start and end
                 * date for ranges. We may also include the leave type description, in most cases we don't need to,
                 * but in certain situations where we have two requests for the same date and time then we need to
                 * differentiate between them so can make use of the type they were booked against.
                 *
                 * @param leaveRequest  the leave request we are deriving a suitable label for
                 * @param leaveRequests the total set of leave requests the view is to contain
                 * @return the label to use for the list item we are creating
                 */
                _getListItemLabel:function (leaveRequest, leaveRequests) {
                    // if we are rendering the label for a single days leave then just use the start date
                    if (leaveRequest.startDate === leaveRequest.endDate) {
                        // we need to check if the time should be shown, see if there are other requests in the
                        // set for the same date
                        if (this._checkForRequestsOnTheSameDay(leaveRequest, leaveRequests)) {
                            return [this.convertToDateOnly(leaveRequest.startDate),
                                " (", leaveRequest.leaveType.leaveTypeName, ")"].join("");
                        } else {
                            return this.convertToDateOnly(leaveRequest.startDate);
                        }
                    } else {
                        // build the date range string again using the leave type to differentiate if we need to
                        if (this._checkForRequestsOnTheSameDay(leaveRequest, leaveRequests)) {
                            return [this.convertToDateOnly(leaveRequest.startDate),
                                    " - ",
                                    this.convertToDateOnly(leaveRequest.endDate),
                                    " (", leaveRequest.leaveType.leaveTypeName, ")"
                                    ].join("");
                        } else {
                            return [this.convertToDateOnly(leaveRequest.startDate),
                                    " - ",
                                    this.convertToDateOnly(leaveRequest.endDate)
                                    ].join("");
                        }
                    }
                },
                /**
                 * Determine whether the start date used by the leave request we are checking is used by any of the
                 * other single day requests.
                 *
                 * @param leaveRequestToCheck   the leave request we are currently checking against the total list
                 * @param leaveRequests         a list of leave requests that contains the current request we are
                 *                              inspecting
                 */
                _checkForRequestsOnTheSameDay: function (leaveRequestToCheck, leaveRequests) {
                    var multipleItemsWithSameDates = false;

                    array.forEach(leaveRequests, function (leaveRequest) {
                        // as long as we aren't currently inspecting the item to check the we can perform the date check
                        if (leaveRequest.uuid != leaveRequestToCheck.uuid) {
                            // do the comparisons for the single and multiple day requests comparing like for like
                            if (this._isRequestForSingleDay(leaveRequest)) {
                                if (leaveRequest.startDate === leaveRequestToCheck.startDate) {
                                    multipleItemsWithSameDates = true;
                                }
                            } else {
                                if ((leaveRequest.startDate === leaveRequestToCheck.startDate) &&
                                    (leaveRequest.endDate === leaveRequestToCheck.endDate)) {
                                    multipleItemsWithSameDates = true;
                                }
                            }
                        }
                    }, this);

                    return multipleItemsWithSameDates;
                },
                /**
                 * Determines whether the leave request provided spans more than one day.
                 *
                 * @param leaveRequest a leave request
                 */
                _isRequestForSingleDay:function (leaveRequest) {
                    return leaveRequest.startDate === leaveRequest.endDate;
                },
                /**
                 * Sort the two leave requests according to the start date of the requests. We want to sort the
                 * requests so that we get the most recent first.
                 *
                 * @param requestA leave request A
                 * @param requestB leave request B
                 * @return 0 if equal, -1 if a<b, and 1 if a>b
                 */
                _sortRequestsByDate:function (requestA, requestB) {
                    if (requestA.startDate === requestB.startDate) return 0;
                    return requestA.startDate > requestB.startDate ? -1 : 1;
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });