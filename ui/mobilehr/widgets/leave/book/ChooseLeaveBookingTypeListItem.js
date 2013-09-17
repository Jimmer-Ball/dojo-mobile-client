/**
 * Provide a chooser widget which holds the label of a leave booking type and the current setting for the
 * leave booking type.  Clicking on it will put up a view of all the validly available leave booking types
 * options given the required field, and will have the currently selected option "ticked" and all the others
 * "un-ticked".
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.book.ChooseLeaveBookingTypeListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.variableHeight = true;
                this.id = params.id;
                this.bookingTypes = params.bookingTypes;
                this.chosenType = params.chosenType;
                this.parentView = params.parentView;
                this.instructions = params.instructions;
                this.destinationView = params.destinationView;
                this.hours = params.hours;
                this.minutes = params.minutes;
                this.destinationViewOnBack = this.parentView;
                this.label = this.instructions;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
            },
            startup:function () {
                this.inherited(arguments);
                this._setRightTextAttr(this._getRightTextString());
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showBookingTypes();
            },
            /**
             * Called from destination view either ChooseEndLeaveBookingTypeView or ChooseStartLeaveBookingTypeView
             *
             * @param gotType got type
             * @param gotHours got hours
             * @param gotMinutes got minutes
             */
            amendCurrentSettings:function (gotType, gotHours, gotMinutes) {
                this.chosenType = gotType;
                this.hours = this.stripTimeComponentToInteger(gotHours);
                this.minutes = this.stripTimeComponentToInteger(gotMinutes);
                this._setRightTextAttr(this._getRightTextString());
            },
            /**
             * Return the chosen leave booking type type, as called from BookLeaveRequestView
             */
            getChosenType:function () {
                return this.chosenType;
            },
            /**
             * Show the booking type view, either ChooseEndLeaveBookingTypeView or ChooseStartLeaveBookingTypeView
             */
            _showBookingTypes:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.id,
                    this.bookingTypes,
                    this.chosenType,
                    this.instructions,
                    this.destinationViewOnBack,
                    this.hours,
                    this.minutes);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },
            provideAPITimeString:function () {
                return this.getAPITimeString(this.hours, this.minutes);
            },
            /**
             * If we are dealing with time we postfix the TIME string with the actual time chosen from
             * the time spinners
             */
            _getRightTextString:function () {
                if (this.chosenType === "TIME") {
                    return [this.getBookingTypeLabel(this.chosenType), ": ", this.getAPITimeString(this.hours, this.minutes)].join("");
                } else {
                    return this.getBookingTypeLabel(this.chosenType);
                }
            }
        });
    });