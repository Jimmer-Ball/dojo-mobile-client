/**
 * Class that was within dojox.mobile.SpinWheelDatePicker, is now its own class.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/date/locale", "mobilehr/widgets/utils/spinners/SpinWheelSlot"],
    function (declare, locale, SpinWheelSlot) {
        return declare("mobilehr.widgets.utils.spinners.SpinWheelDaySlot", SpinWheelSlot, {
            /**
             * Setup the labeFrom and labelTo values for the days given our constructor
             *
             * @param params
             */
            preamble:function(params) {
                this.labelFrom = params.labelFrom;
                this.labelTo = params.labelTo;
            }
        });
    });
