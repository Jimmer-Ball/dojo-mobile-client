/**
 * ToolBarButton placed within our application header that is used to move from the EventNotificationView back to the
 * rest of the application. As the EventNotificationsView can be accessed using the EventNotificationsToolBarButton
 * from almost anywhere in the application then we need to be able to set the destination this back button moves to
 * dynamically. We are relying on the EventNotificationsView to update our destination once it know the view it was
 * accessed from. We default to the "actions" view if the back destination has not been set appropriately.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dijit/registry", "dojo/dom-class", "dojox/mobile/ToolBarButton",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper"],
    function (declare, lang, connect, registry, domClass, ToolBarButton, TransitionEvent, WidgetHelper) {
        return declare("mobilehr.widgets.eventNotification.EventNotificationsBackToolBarButton", [ToolBarButton, WidgetHelper], {
            preamble:function (params) {
                // set a data type filter on the button so that we can filter the results that are shown in the
                // the
                this.eventTypeFilter = params.eventTypeFilter;
                this.link = params.link;
                this.moveTo = "#";
                // todo this needs to become the backup, we need a style that draws the back button, the hardest button we are gona have to draw
                this.icon = "mobilehr/images/tab-icon-returnW.png";
                this.label = null;
                // default back to the ActionView main menu if the event notification view doesn't let us know where to go
                this.backDestination = "actions";
                this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null,
                    transition:"flip", transitionDir:-1};
            },

            buildRendering: function(){
                this.inherited(arguments);
                // set the padding of the button before we show the widget
                domClass.add(this.domNode, "mobilehrInfoToolBarButton");
            },

            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                // we can just move back for to the last view
                return new TransitionEvent(this.domNode,
                    {
                        moveTo:this.backDestination,
                        href:null,
                        url:null,
                        scene:null,
                        transition:"flip",
                        transitionDir:-1
                    }).dispatch();
            },

            /**
             * Set the destination that this back button will move the client's view to. As the parent view of the
             * button (EventNotificationsView) can be accessed from many places in the application via the
             * EventNotificationToolBarButton this back button has to deal with moving back to a dynamic location.
             *
             * When we create the new content of the EventNotificationsView with a back destination this function
             * should then be called on this button to let it know where to move back to.
             *
             * @param fromView the view the parent view was accessed from
             */
            _setupBackDestination: function (fromView) {
                console.log("setting back destination for back tool bar button to", fromView);
                this.backDestination = fromView;
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
