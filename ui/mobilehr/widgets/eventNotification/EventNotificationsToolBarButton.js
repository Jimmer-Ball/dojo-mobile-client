/**
 * ToolBarButton placed within our application header that is used to gain access to the users current set of event
 * notifications. Moves the UI onto the EventNotificationsView where the results are displayed.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dijit/registry", "dojo/dom-class", "dojox/mobile/ToolBarButton",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper", "dojo/_base/array"],
    function (declare, lang, connect, registry, domClass, ToolBarButton, TransitionEvent, WidgetHelper, array) {
        return declare("mobilehr.widgets.eventNotification.EventNotificationsToolBarButton", [ToolBarButton, WidgetHelper], {
            preamble:function (params) {
                // set a data type filter on the button so that we can filter the results that are shown in the
                // the
                this.eventTypeFilter = params.eventTypeFilter;
                this.link = params.link;
                this.moveTo = "#";
                // todo this needs to become the backup, we need a style that draws the button, this one should be easy its just a styled exclamation mark
                this.icon = "mobilehr/images/tab-icon-notificationsW.png";
                this.label = null;
                // go to the notifications result screen
                this.destinationView = "eventNotifications";
                // default back to the ActionView main menu
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"flip", transitionDir:1};
            },

            buildRendering: function(){
                this.inherited(arguments);
                // set the padding of the button before we show the widget
                domClass.add(this.domNode, "mobilehrInfoToolBarButton");

            },

            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotEventNotifications"));
                _resourceController.doRetrieve("services/mobile/eventNotifications");
            },

            /**
             * Call back function once the service has retrieved the users current notifications.
             */
            _gotEventNotifications:function () {
                var dto = null;
                switch (_resourceController.responseCode) {
                    case 200 :
                        dto = _resourceController.responseData;
                        break;
                    default :
                        dto = {errorCode:_resourceController.responseCode};
                        break;
                }
                if (_resourceController.responseCode !== 401) {
                    var destination = registry.byId("eventNotifications");
                    // call create content on EventNotificationsView
                    var filteredNotifications = this._processNotifications(dto);
                    destination.createContent(filteredNotifications, this._getCurrentViewId(), this.eventTypeFilter);
                    return new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                } else {
                    this.goBackToLoginView(this.domNode);
                }
            },

            /**
             * Internationalise the system message provided with a version taken from our lexicon as we don't
             * currently provide any internationalisation at the API. If a filter was supplied when we
             * constructed this widget then ensure that we only pass eligible notification (by data type)
             * to the EventNotificationsView.
             *
             * We get a event notifications representation with individual notifications contained in it
             * eventNotifications property. Each notification is of the form
             *
             * {
             *     uuid:                "someUUID",
             *     timeStamp:           date string to be localised,
             *     systemMessageCode:   "LR_AUTHORISATION_SUCCESS",
             *     systemMessage:       "Success authorising leave request",
             *     dataType:            "LEAVE_REQUEST",
             *     dataTypeDescription: "Leave requests",
             *     successIndicator:    "true",
             *     details:             "leave request has been authorised",
             *     relatedUuid:         "someUUID"
             *     relatedResourceLink  : {
             *          rel:        "getLeaveRequest",
             *          href:       "http://localhost:8080/mobilehr/services/mobile/leaveRequest/someUUID",
             *          mediaType:  "application/xml",
             *          verb:       "GET"
             *     }
             * }
             *
             * @param dto
             */
            _processNotifications:function(dto) {
                var filteredNotifications = new Array();

                array.forEach(dto.eventNotifications, lang.hitch(this, function(notification) {

                    // override system message with internationalised content
                    notification.systemMessage = _lexicon[notification.systemMessageCode];

                    // identify the notifications data type
                    var dataType = notification.dataType;

                    // if a filter is defined per data type then apply it
                    if (this.eventTypeFilter) {
                        // only populate that particular type
                        if (dataType && this.eventTypeFilter === dataType) {
                            filteredNotifications.push(notification);
                        }
                    } else {
                        // if no filter was specified simply add it to our list of notifications
                        filteredNotifications.push(notification);
                    }
                }));

                return filteredNotifications;
            },

            /**
             * Detect the id of the current "view" that this button has been rendered on.
             *
             * @return the id of the parent view
             */
            _getCurrentViewId: function() {
                // default view
                var currentViewId = "actions";
                try {
                    // sneaky way of identifying the view id based on the buttons ancestors
                    // this.domNode == EventNotificationsToolBarButton -> parentNode == Heading ->
                    // parentNode == view container -> parentNode == ScrollableView
                    currentViewId = this.domNode.parentNode.parentNode.parentNode.id;
                } catch (e) {
                    // do nothing and let the default return
                }
                return currentViewId;
            },

            /**
             * Override the default select behaviour that changes the style of the button, we want ours to
             * to remain one style so that they don't behave like HTML links but are more like a proper app.
             */
            select:function() {
                // do nothing
            }
        });
    });
