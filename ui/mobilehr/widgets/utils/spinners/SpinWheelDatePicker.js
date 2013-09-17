/**
 * Class that was dojox.mobile.SpinWheelDatePicker, now in its own class, as the original used statics where it
 * shouldn't have and in-lined variables to be members when it should have included these as classes in their own
 * right.
 */
define([
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/date",
    "dojo/date/locale",
    "dijit/_Contained",
    "dijit/_Container",
    "dijit/_WidgetBase",
    "mobilehr/widgets/utils/spinners/SpinWheel",
    "mobilehr/widgets/utils/spinners/SpinWheelSlot",
    "mobilehr/widgets/utils/spinners/SpinWheelDaySlot",
    "mobilehr/widgets/utils/spinners/SpinWheelMonthSlot",
    "mobilehr/widgets/utils/spinners/SpinWheelYearSlot"],
    function (declare, domClass, ddate, datelocale, Contained, Container, WidgetBase, SpinWheel, SpinWheelSlot,
              SpinWheelDaySlot, SpinWheelMonthSlot, SpinWheelYearSlot) {
        return declare("mobilehr.widgets.utils.spinners.SpinWheelDatePicker", [WidgetBase, Container, Contained, SpinWheel], {

            /**
             * We want to create a spin wheel which provides a year, month, and day slots, where years go from
             * 1970 to 2038, months get calculated within the widget, and days go from 1 to 31.
             */
            constructor:function () {
                this.slotClasses = [SpinWheelYearSlot, SpinWheelMonthSlot, SpinWheelDaySlot];
                this.slotProps = [{labelFrom:1970, labelTo:2038},{},{labelFrom:1, labelTo:31}];
            },

            buildRendering:function () {
                this.inherited(arguments);
                domClass.add(this.domNode, "mblSpinWheelDatePicker");
                // override default width of widget
                domClass.add(this.domNode, "mobilehrSpinWheelDatePicker");
                this.connect(this.slots[1], "onFlickAnimationEnd", "onMonthSet");
                this.connect(this.slots[2], "onFlickAnimationEnd", "onDaySet");
            },

            reset:function () {
                // summary:
                // Goes to today.
                var now = new Date();
                var monthStr = datelocale.format(now, {datePattern:"MMM", selector:"date"});
                this.setValue([now.getFullYear(), monthStr, now.getDate()]);
            },

            onMonthSet:function () {
                // summary:
                //		A handler called when the month value is changed.
                var daysInMonth = this.onDaySet();
                var disableValuesTable = {28:[29, 30, 31], 29:[30, 31], 30:[31], 31:[]};
                this.slots[2].disableValues(disableValuesTable[daysInMonth]);
            },

            onDaySet:function () {
                // summary:
                //		A handler called when the day value is changed.
                var y = this.slots[0].getValue();
                var m = this.slots[1].getValue();
                var newMonth = datelocale.parse(y + "/" + m, {datePattern:'yyyy/MMM', selector:'date'});
                var daysInMonth = ddate.getDaysInMonth(newMonth);
                var d = this.slots[2].getValue();
                if (daysInMonth < d) {
                    this.slots[2].setValue(daysInMonth);
                }
                return daysInMonth;
            }
        });
    });
