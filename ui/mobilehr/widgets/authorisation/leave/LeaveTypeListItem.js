/**
 * List item for leave type is something clicked on by a user that displays a leaveType and an icon indicating
 * whether this type is selected or not.
 *
 * Created by LeaveTypesView.  We get constructed with the "type" holding the leave type details, and a parameter
 * called isSelected which is either true or false indicating whether we are selected or not.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class",
    "dijit/registry", "dojox/mobile/ListItem"],
    function (declare, lang, domClass, registry, ListItem) {
        return declare("mobilehr.widgets.authorisation.leave.LeaveTypeListItem", ListItem, {
            preamble:function (params) {
                this.icon = "mobilehr/images/icon_29.png";
                this.type = params.type;
                this.label = this.type.leaveTypeName;
                this.checked = params.isSelected;
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._toggle();
            },
            /**
             * Display whether or not this particular leave type isSelected
             */
            _toggle:function () {
                if (this.checked === true) {
                    this._setCheckedAttr(false);
                } else {
                    this._setCheckedAttr(true);
                }
            },
            /**
             * Called by the calling view (parent) to toggle off this child in response to another sibling having
             * been selected
             */
            toggleOff:function () {
                this._setCheckedAttr(false);
            }
        });
    });