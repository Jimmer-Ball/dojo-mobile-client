/**
 * ToolBarButton placed within our application header that is used to move the client back to the ActioView
 * which is considered our home page.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/dom-class", "dojox/mobile/ToolBarButton",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper"],
    function (declare, domClass, ToolBarButton, TransitionEvent, WidgetHelper) {
        return declare("mobilehr.widgets.common.HomeToolBarButton", [ToolBarButton, WidgetHelper], {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/tab-icon-homeW.png";
                this.label = null;
                // go to the home result screen
                this.destinationView = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:-1};
            },

            buildRendering: function(){
                this.inherited(arguments);
                // set the padding of the button before we show the widget
                domClass.add(this.domNode, "mobilehrToolBarButton");
            },

            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                return new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
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
