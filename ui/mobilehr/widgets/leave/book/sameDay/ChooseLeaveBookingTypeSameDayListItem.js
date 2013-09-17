/**
 * Provide a chooser widget which holds the label of a same day leave booking type and the current settings for the
 * leave booking type.  Clicking on it will put up a view of all the validly available leave booking types
 * options given the required field, and will have the currently selected options "ticked" and all the others
 * "un-ticked".
 *
 * Note the plural "options".  When booking leave on a single day, if dealing with type "TIME", your user shall have
 * to provide two time values selected, not one.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.leave.book.sameDay.ChooseLeaveBookingTypeSameDayListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.variableHeight = true;
                this.id = params.id;
                this.bookingTypes = params.bookingTypes;
                this.chosenType = params.chosenType;
                this.parentView = params.parentView;
                this.instructions = params.instructions;
                this.destinationView = params.destinationView;
                this.startHours = params.startHours;
                this.startMinutes = params.startMinutes;
                this.endHours = params.endHours;
                this.endMinutes = params.endMinutes;
                this.destinationViewOnBack = this.parentView;
                this.label = this.instructions;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
            },
            startup:function() {
                this.inherited(arguments);
                this._setRightTextAttr(this._getRightTextString());
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showBookingTypes();
            },

            /**
             * Called from ChooseSameDayLeaveBookingTypeView
             *
              * @param gotType type
             * @param gotStartHours start hours
             * @param gotStartMinutes start minutes
             * @param gotEndHours end hours
             * @param gotEndMinutes end minutes
             */
            amendCurrentSettings:function (gotType, gotStartHours, gotStartMinutes, gotEndHours, gotEndMinutes) {
                this.chosenType = gotType;
                this.startHours = this.stripTimeComponentToInteger(gotStartHours);
                this.startMinutes = this.stripTimeComponentToInteger(gotStartMinutes);
                this.endHours = this.stripTimeComponentToInteger(gotEndHours);
                this.endMinutes = this.stripTimeComponentToInteger(gotEndMinutes);
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
                    this.startHours,
                    this.startMinutes,
                    this.endHours,
                    this.endMinutes);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },
            /**
             * Return the start time in HH:MM 24 hour clock format
             */
            getStartAPITimeString:function () {
                return this.getAPITimeString(this.startHours, this.startMinutes);
            },
            /**
             * Return the end time in HH:MM 24 hour clock format
             */
            getEndAPITimeString:function () {
                return this.getAPITimeString(this.endHours, this.endMinutes);
            },
            /**
             * If we are dealing with time we postfix the two start and end TIME strings onto the right text with the
             * actual times chosen from the time spinners
             */
            _getRightTextString:function () {
                if (this.chosenType === "TIME") {
                    return [this.getBookingTypeLabel(this.chosenType),
                        ": ", this.getStartAPITimeString(), "-",
                        this.getEndAPITimeString()].join("");
                } else {
                    return this.getBookingTypeLabel(this.chosenType);
                }
            }
        });
    });