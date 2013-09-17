/**
 * Class that was within dojox.mobile.SpinWheelDatePicker for setting up a month slot, now its own class.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/date/locale", "mobilehr/widgets/utils/spinners/SpinWheelSlot"],
    function (declare, locale, SpinWheelSlot) {
        return declare("mobilehr.widgets.utils.spinners.SpinWheelMonthSlot", SpinWheelSlot, {
            /**
             * We can over-ride the labelFrom and labelTo setting here
             *
             * @param params
             */
            preamble:function (params) {
                if (params.labelFrom) {
                    this.labelFrom = params.labelFrom;
                }
                if (params.labelTo) {
                    this.labelTo = params.labelTo;
                }
            },
            /**
             * Here we setup our base class labels to be the 12 months within a year in the appropriate
             * 3 character short version for the applicable locale.
             */
            buildRendering:function () {
                this.labels = [];
                var dtA = new Date(2000, 0, 1);
                var monthStr;
                for (var i = 0; i < 12; i++) {
                    dtA.setMonth(i);
                    monthStr = locale.format(dtA, {datePattern:"MMM", selector:"date"});
                    this.labels.push(monthStr);
                }
                this.inherited(arguments);
            }
        });
    });
