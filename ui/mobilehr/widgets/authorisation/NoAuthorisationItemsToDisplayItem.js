/**
 * List item that indicates there are no authorisation items left to process or display. Can be re-used for any type
 * of authorisation as time goes on.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/connect", "dojox/mobile/ListItem"],
    function (declare,connect, ListItem) {
        return declare("mobilehr.widgets.authorisation.NoAuthorisationItemsToDisplayItem", ListItem, {
            constructor:function () {
                this.variableHeight = true;
                this.icon = "mblDomButtonSilverCircleRedCross";
                this.label = _lexicon.noAuthorisationItemsLeft;
            },
            /**
             * Un-wire the default onclick handler, as we don't allow any onClick behaviour
             */
            startup:function () {
                this.inherited(arguments);
                if (this._onClickHandle) {
                    connect.disconnect(this._onClickHandle);
                }
            }
        });
    });