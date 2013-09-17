/**
 * A SpinWheel-based time picker widget taken wholesale from the original provided in dojox.mobile
 *
 */
define([
    "dojo/_base/declare",
    "dojo/dom-class",
    "mobilehr/widgets/utils/spinners/SpinWheel",
    "mobilehr/widgets/utils/spinners/SpinWheelSlot"
], function (declare, domClass, SpinWheel, SpinWheelSlot) {
    return declare("mobilehr.widgets.utils.spinners.SpinWheelTimePicker", SpinWheel, {
        /**
         * Put what were statics inside a constructor, so their values do NOT get messed up by more than
         * one instance of one of these sharing screen space.
         */
        constructor:function () {
            this.slotClasses = [SpinWheelSlot, SpinWheelSlot];
            this.slotProps = [
                {labelFrom:0, labelTo:23},
                {labels:["00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
                    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
                    "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
                    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
                    "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
                    "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"]}
            ];
        },
        buildRendering: function(){
            this.inherited(arguments);
            domClass.add(this.domNode, "mblSpinWheelTimePicker");
            // override default width of widget
            domClass.add(this.domNode, "mobilehrSpinWheelTimePicker");
        },
        /**
         * Reset the time presented to the input time or to the current time if neither hours or
         * minutes numbers are provided.
         *
         * @param hours hours number value either null||undefined or between 0 and 23 (either number or string)
         * @param minutes minutes number either null||undefined or between 0 to 59 (either number or string)
         */
        reset:function (hours, minutes) {
            var _h;
            var _m;
            var m;
            if (typeof hours === "undefined" || hours === null || typeof minutes === "undefined" || minutes === null) {
                // Use the current time to set the initial string values
                var now = new Date();
                _h = now.getHours() + "";
                m = now.getMinutes();
            } else {
                m = this.removePrefixedZeroCharacter(minutes);
                if ((hours < 0 || hours > 24) && (m < 0 || m > 59)) {
                    throw "You cannot set hours to " + hours + ", and minutes to " + m;
                }
                _h = hours;
            }
            // Translate to a string and prepend 0 onto the front of the minutes value if minutes are less than 10
            _m = (m < 10 ? "0" : "") + m;
            // Set the selected colour and the value appropriately for hours and minute strings
            this.slots[0].setValue(_h);
            this.slots[0].setColor(_h);
            this.slots[1].setValue(_m);
            this.slots[1].setColor(_m);
        },
        /**
         * The spin wheel setting for minutes comes back with prefixed zeros on the front if the value is less than
         * 10 which is hopeless if you want to set the value correctly on the spin wheel again.
         *
         * @param minutes minutes
         */
        removePrefixedZeroCharacter:function (minutes) {
            if (typeof minutes === "string") {
                var startingCharacter = minutes.substring(0, 1);
                if (startingCharacter === '0') {
                    return minutes.substring(1);
                } else {
                    return minutes;
                }
            } else {
                return minutes;
            }
        }
    });
});
