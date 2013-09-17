/**
 * Our own version of the dojox.mobile.Header that provides access to the header inner back button. The core
 * implementation of the header renders the button for us, but as we include a number of other functional buttons
 * on our header (subclasses of dojox.mobile.ToolBarButton) we need to be able to "connect" events directly to
 * that inner back button. A reference to the button is stored in the private _btn property which we are essentially
 * exposing in our version of the header. This makes our code more readable rather than accessing the private
 * members of the header in a hacky non OO way.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojox/mobile/Heading"],
    function (declare, Heading) {
        return declare("mobilehr.widgets.common.MobileHeading", [Heading], {
            /**
             * backButton field that allows Dojo to construct a getter for us for our header widget, client
             * code can the simply call heading.get("backButton") to get a reference to the button.
             */
            backButton: null,/*
            constructor:function() {
                this.inherited(arguments);
                this.backButton = null;
            },*/
            _setBackAttr: function(/*String*/back){
                // make sure we do all of the regular work to construct the _btn reference
                this.inherited(arguments);
                // if the button was initialised then set our property
                if (this._btn) {
                    this.backButton = this._btn;
                }
            }
    });
});

