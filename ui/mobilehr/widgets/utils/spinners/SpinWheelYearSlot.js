/**
 * Class that was within dojox.mobile.SpinWheelDatePicker for setting up a year slot, now its own class.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/date/locale", "mobilehr/widgets/utils/spinners/SpinWheelSlot"],
    function (declare, locale, SpinWheelSlot) {
        return declare("mobilehr.widgets.utils.spinners.SpinWheelYearSlot", [SpinWheelSlot], {
            preamble:function(params) {
                this.labelFrom = params.labelFrom;
                this.labelTo = params.labelTo;
            },
            /**
             * Here we setup our year slot with the full range of years in the javascript date object in
             * the applicable local locale format.
             */
            buildRendering:function () {
                this.labels = [];
                if (this.labelFrom !== this.labelTo) {
                    var dtA = new Date(this.labelFrom, 0, 1);
                    var i, idx;
                    for (i = this.labelFrom, idx = 0; i <= this.labelTo; i++, idx++) {
                        dtA.setFullYear(i);
                        this.labels.push(locale.format(dtA, {datePattern:"yyyy", selector:"date"}));
                    }
                }
                this.inherited(arguments);
            }
        });
    });
