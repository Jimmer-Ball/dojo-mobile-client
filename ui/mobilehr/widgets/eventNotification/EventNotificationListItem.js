/**
 * List item for a single event notification whose details can be viewed.  On click it displays the full detail of the
 * notification in the EventNotificationView.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class",
    "dijit/registry", "dojo/query", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/TransitionEvent", "dojox/mobile/deviceTheme"],
    function (declare, lang, connect, array, domClass, registry, query, ListItem, WidgetHelper, TransitionEvent, dt) {
        return declare("mobilehr.widgets.eventNotification.EventNotificationListItem", [ListItem, WidgetHelper], {
            systemCodeTemplate:'<span>${code}</span>',
            eventTimeDetailTemplate:'<span>${timeStamp}</span><br>',
            /**
             * Allow our list item to be of variable height to accommodate our variable contents
             *
             * @param params whatever we were invoked with on "new"
             */
            preamble:function (params) {
                this.variableHeight = true;
                this.parentView = params.parentView;
                this.eventNotification = params.eventNotification;
                this.moveTo = "#";
                // go to the individual result display
                this.destinationView = "eventNotification";
                this.destinationViewOnBack = "eventNotifications";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
                this._subscriptions = [];
            },

            /**
             * Specially populate our list item so the user details on the left and the extra details on the right are
             * easy on the eye and take the current theme into account.
             */
            buildRendering:function () {
                this.inherited(arguments);
                if (this.labelNode) {
                    this._setLabelAttr(this._formatSystemCodeDetails());
                    domClass.add(this.labelNode, "mobilehrListItemLeftSmallText");
                }
                this._setRightTextAttr(this._formatEventTimeDetails());
                if (dt.currentTheme === "android") {
                    domClass.replace(this.rightTextNode, "androidMobilehrListItemRightSmallText", "mblListItemRightText");
                } else {
                    domClass.replace(this.rightTextNode, "mobilehrListItemRightSmallText", "mblListItemRightText");
                }
            },

            /**
             * Simply move to the next view to display our result in full.
             *
             * @param event the onClick event
             */
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                // we already have the full data for this result, simply pass it to the EventNotificationView
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.eventNotification, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },

            /**
             * Format the system code detail that this event notification is reporting.
             */
            _formatSystemCodeDetails:function () {
                return this.substitute(this.systemCodeTemplate,
                    {
                        code:this.eventNotification.systemMessage
                    });
            },
            /**
             * Format the notifications timeStamp into local time for display.
             */
            _formatEventTimeDetails:function () {
                return this.substitute(this.eventTimeDetailTemplate,
                    {
                        timeStamp:this.convertToFullDate(this.eventNotification.timeStamp)
                    });
            },

            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    })
;
