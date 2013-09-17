/**
 * Class that was the dojox.mobile.SpinWheel, but with all statics now class members
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dijit/_Contained",
    "dijit/_Container",
    "dijit/_WidgetBase",
    "mobilehr/widgets/utils/spinners/SpinWheelSlot"
], function (declare, array, lang, domClass, domConstruct, Contained, Container, WidgetBase, SpinWheelSlot) {
    return declare("mobilehr.widgets.utils.spinners.SpinWheel", [WidgetBase, Container, Contained], {
        /**
         * Preamble the parameters into the class as needed
         *
         * @param params params
         */
        preamble:function (params) {
            this.slotClasses = params.slotClasses;
            this.slotProps = params.slotProps;
        },
        /**
         * This will get overridden by a derived class as needed
         */
        constructor:function () {
            this.slotClasses = [];
            this.slotProps = [];
            this.centerPos = 0;
        },

        buildRendering:function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "mblSpinWheel");
            this.centerPos = Math.round(this.domNode.offsetHeight / 2);

            this.slots = [];
            for (var i = 0; i < this.slotClasses.length; i++) {
                this.slots.push(((typeof this.slotClasses[i] == 'string') ? lang.getObject(this.slotClasses[i]) : this.slotClasses[i])(this.slotProps[i]));
                this.addChild(this.slots[i]);
            }
            domConstruct.create("DIV", {className:"mblSpinWheelBar"}, this.domNode);
        },

        startup:function () {
            this.inherited(arguments);
            this.reset();
        },

        getValue:function () {
            // summary:
            //		Returns an array of slot values.
            var a = [];
            array.forEach(this.getChildren(), function (w) {
                if (w instanceof SpinWheelSlot) {
                    a.push(w.getValue());
                }
            }, this);
            return a;
        },

        setValue:function (/*Array*/a) {
            // summary:
            //		Sets the slot values.
            var i = 0;

            array.forEach(this.getChildren(), function (w) {
                if (w instanceof SpinWheelSlot) {
                    w.setValue(a[i]);
                    w.setColor(a[i]);
                    i++;
                }
            }, this);
        },

        reset:function () {
            // summary:
            //		Resets the SpinWheel to show the initial values.
            array.forEach(this.getChildren(), function (w) {
                if (w instanceof SpinWheelSlot) {
                    w.setInitialValue();
                }
            }, this);
        }
    });
});
