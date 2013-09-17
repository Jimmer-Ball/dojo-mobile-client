/**
 * A chooser widget for choosing the time, which takes the following parameters, hours, minutes , a custom label, and
 * on back view.  The aim of this widget is to keep a hold of chosen time settings in conjunction with the TimeView
 * widget.
 *
 * Note hours and minutes are kept as integer values internally, but displayed as text
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.utils.time.ChooseTimeListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.id = params.id;
                this.hours = params.hours;
                this.minutes = params.minutes;
                this.label = params.label;
                this.viewInstructions = params.viewInstructions;
                this.destinationView = params.destinationView;
                this.backDestination = params.backDestination;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
            },
            buildRendering:function () {
                this.inherited(arguments);
                this._setRightTextAttr(this.getAPITimeString(this.hours, this.minutes));
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showTimeView();
            },
            /**
             * Reset the time to whatever is passed in by whatever is calling this
             *
             * @param hours hours integer or string doesn't matter to us
             * @param minutes minutes integer
             */
            resetTime:function (hours, minutes) {
                this.hours = this.stripTimeComponentToInteger(hours);
                this.minutes = this.stripTimeComponentToInteger(minutes);
                this._setRightTextAttr(this.getAPITimeString(this.hours, this.minutes));
            },

            /**
             * Show the time view ensuring the spinner displays the hours and minutes settings
             */
            _showTimeView:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.hours, this.minutes, this.viewInstructions, this.id, this.backDestination);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });