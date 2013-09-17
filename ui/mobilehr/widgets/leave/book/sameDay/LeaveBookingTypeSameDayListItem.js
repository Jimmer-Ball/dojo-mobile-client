/**
 * List item for a leave booking type for same day leave
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class",
    "dijit/registry", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, lang, domClass, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.book.sameDay.LeaveBookingTypeSameDayListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.timeType = params.timeType;
                this.bookingType = params.bookingType;
                this.destinationViewOnBack = params.backDestination;
                this.instructions = params.instructions;
                this.checked = params.isSelected;
                this.hours = params.hours;
                this.minutes = params.minutes;

                this.icon = "mobilehr/images/icon_29.png";
                this.transtionsOptions = null;
                this.destinationView = null;
                if (this.bookingType === "TIME") {
                    if (this.timeType === "start") {
                        this.label = _lexicon.leaveBookingTypeSameDayStartTime;
                        this.destinationView = "chooseStartTime";
                    } else {
                        this.label = _lexicon.leaveBookingTypeSameDayEndTime;
                        this.destinationView = "chooseEndTime";
                    }
                    this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
                } else {
                    this.label = this.getBookingTypeLabel(this.bookingType);
                }
            },
            /**
             * If we are dealing with a time chooser, don't forget the right hand side text should show the
             * hours and minutes.
             */
            buildRendering:function () {
                this.inherited(arguments);
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
                    var parent = registry.byId(this.destinationViewOnBack);
                    parent.childClicked(this.id);
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