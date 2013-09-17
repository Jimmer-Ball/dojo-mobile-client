/**
 * Given a list of event notifications, create EventNotificationListItem widgets which can be displayed to the client.
 * These items are essentially links that let us view the full event notification details. These lists are attached to
 * the eventNotificationsList for display. The list we receive may be filtered so we must make the user aware of this
 * to avoid confusion.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "dojox/mobile/RoundRect", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/eventNotification/EventNotificationListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, RoundRect, WidgetHelper, RepresentationHelper,
              EventNotificationListItem) {
        return declare("mobilehr.widgets.eventNotification.EventNotificationsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {

                constructor:function () {
                    this.eventNotifications = null;
                    // these two pieces of data should feature in the instructions
                    this.chosenSearchType = null;
                    this.chosenSearchTerm = null;
                    this.relatedListItemId = null;
                    this.backDestination = null;
                    this.dataTypeFilter = null;
                    this.dataTypeId = null;
                    this.eventNotificationBackButton = null;
                    this._subscriptions = [];
                },

                startup:function () {
                    this.inherited(arguments);
                    this.eventNotificationsHeading = registry.byId("eventNotificationsHeading");
                    this.eventNotificationsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.eventNotificationsInstructions = this.$("eventNotificationsInstructions");
                    this.eventNotificationsInstructions.innerHTML =_lexicon.eventNotificationsInstructions;
                    this.eventNotificationsList = registry.byId("eventNotificationsList");
                    // get a handle to the back button as we need to tell it the back destination which is dynamic
                    this.eventNotificationBackButton = registry.byId("eventNotificationBackButton");
                },

                /**
                 * Render the list of event notifications we have received
                 *
                 * @param eventNotifications    a map of event notifications
                 * @param backDestination       back destination
                 * @param dataTypeFilter        the data type that was used to filter the event notifications we were
                 *                              passed
                 */
                createContent:function (eventNotifications, backDestination, dataTypeFilter) {
                    this.eventNotifications = eventNotifications;
                    this.backDestination = backDestination;
                    // now we know where we came from to reach this destination we can set the back destination that
                    // our static back button should take us back to
                    this.eventNotificationBackButton._setupBackDestination(backDestination);
                    if (dataTypeFilter) {
                        this.dataTypeFilter = dataTypeFilter;
                        // set up an id to use for display purposes, we may or may not have a lexicon entry for the
                        // filter type supplied
                        this.dataTypeId = (typeof _lexicon[dataTypeFilter] === "undefined") ? dataTypeFilter : _lexicon[dataTypeFilter];
                        // update the instructions to let the user know we are showing them type specific notifications
                        this.eventNotificationsInstructions.innerHTML =
                                [_lexicon.eventNotificationsInstructionsFiltered,
                                    this.dataTypeId].join("");
                    } else {
                        // make sure we reset the instruction as the last access may have reset it
                        this.eventNotificationsInstructions.innerHTML =_lexicon.eventNotificationsInstructions;
                    }

                    // wipe out the current result list
                    this.clearListWidget(this.eventNotificationsList);
                    // clear any messages that were previously added to the list
                    this.eventNotificationsList.domNode.innerHTML = null;

                    // sort the items before displaying them
                    if (this.eventNotifications !== null &&
                        this.eventNotifications.length > 0) {
                        array.forEach(this.eventNotifications.sort(
                            this._sortNotificationsByMostRecentFirst), lang.hitch(this, function(notification) {
                                this.eventNotificationsList.addChild(
                                    new EventNotificationListItem({eventNotification:notification}));
                            }));
                    } else {
                        // no results were found so let the client know
                        // use the data type string
                        if (this.dataTypeId) {
                            // use eventNotificationsNoNotificationsReturnedFiltered plus data type title
                            this.eventNotificationsList.domNode.innerHTML =
                                ['<div class="',
                                    "mobilehrCenteredPaddedDiv",
                                    '">',
                                    _lexicon.eventNotificationsNoNotificationsReturnedFiltered,
                                    this.dataTypeId,
                                    '</div>'].join("");
                        } else {
                            this.createMessageNodeContent(
                                this.eventNotificationsList.domNode,
                                "eventNotificationsNoNotificationsReturned",
                                "mobilehrCenteredPaddedDiv");
                        }
                    }
                },

                /**
                 * Lexicographical sort the two input event notifications according to their submission date,
                 * most recent first. This means largest time stamp first.  If you ever want to re-order this
                 * with newest first, then switch the 1 and -1 values.
                 *
                 * @param eventNotificationA notification A
                 * @param eventNotificationB notification B
                 * @return 0 if equal, 1 if a<b, and -1 if a>b (so most recent first)
                 */
                _sortNotificationsByMostRecentFirst:function (eventNotificationA, eventNotificationB) {
                    if (eventNotificationA.timeStamp === eventNotificationB.timeStamp) return 0;
                    return eventNotificationA.timeStamp < eventNotificationB.timeStamp ? 1 : -1;
                },

                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });
