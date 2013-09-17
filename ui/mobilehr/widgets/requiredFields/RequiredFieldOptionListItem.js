/**
 * List item for required field option is something clicked on by a user that displays an option and an icon indicating
 * whether this option is selected or not.
 *
 * {requiredFieldOption:requiredFieldOption, isSelected:true}
 *
 * Created by RequiredFieldOptionsView.  We get constructed with the requiredFieldOption details, and a parameter
 * called isSelected which is either true or false indicating whether we are selected or not.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class",
    "dijit/registry", "dojox/mobile/ListItem"],
    function (declare, lang, domClass, registry, ListItem) {
        return declare("mobilehr.widgets.requiredFields.RequiredFieldOptionListItem", ListItem, {
            preamble:function (params) {
                this.icon = "mobilehr/images/icon_29.png";
                this.requiredFieldOption = params.requiredFieldOption;
                this.label = this.requiredFieldOption.value;
                this.checked = params.isSelected;
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._toggle();
            },
            _toggle:function () {
                if (this.checked === true) {
                    this._setCheckedAttr(false);
                } else {
                    this._setCheckedAttr(true);
                }
            },
            toggleOff:function () {
                this._setCheckedAttr(false);
            }
        });
    });