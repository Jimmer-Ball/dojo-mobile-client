/**
 * List item for displaying a leave booking type a user can choose from.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/ListItem", "dojox/mobile/TransitionEvent"],
    function (declare, registry, WidgetHelper, ListItem, TransitionEvent) {
        return declare("mobilehr.widgets.leave.book.LeaveBookingTypeListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.type = params.type;
                this.bookingType = params.bookingType;
                this.destinationViewOnBack = params.backDestination;
                this.instructions = params.instructions;
                this.checked = params.isSelected;
                this.hours = params.hours;
                this.minutes = params.minutes;

                this.icon = "mobilehr/images/icon_29.png";
                this.transtionsOptions = null;
                this.destinationView = null;

                this.label = this.getBookingTypeLabel(this.bookingType);
                // If dealing with a TIME option we need to set the right text and the hours and minutes
                if (this.bookingType === "TIME") {
                    if (this.type === "start") {
                        this.destinationView = "chooseStartTime";
                    } else {
                        this.destinationView = "chooseEndTime";
                    }
                    this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
                }
            },
            /**
             * If we are dealing with a time chooser, don't forget the right hand side text showing the
             * hours and minutes.
             */
            buildRendering:function () {
                this.inherited(arguments);
                this.label = this.getBookingTypeLabel(this.bookingType);
                if (this.bookingType === "TIME") {
                    this._setRightTextAttr(this.getAPITimeString(this.hours, this.minutes));
                }
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._toggle();
            },
            /**
             * Called from ChooseStartLeaveBookingTypeView or ChooseEndLeaveBookingTypeView
             */
            getHours:function () {
                return this.hours;
            },
            /**
             * Called from ChooseStartLeaveBookingTypeView or ChooseEndLeaveBookingTypeView
             */
            getMinutes:function () {
                return this.minutes;
            },
            /**
             * Reset the time to whatever is passed in, as called by the time spinner view.
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
             * Toggle the selection and also transition to the appropriate time spinner view if dealing with a
             * selected time value
             */
            _toggle:function () {
                if (this.checked === true) {
                    this._setCheckedAttr(false);
                } else {
                    this._setCheckedAttr(true);
                }
                if (this.bookingType === "TIME") {
                    if (this.checked === true) {
                        var destination = registry.byId(this.destinationView);
                        destination.createContent(this.hours, this.minutes, this.instructions, this.id, this.destinationViewOnBack);
                        new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                    }
                }
            }
        });
    });