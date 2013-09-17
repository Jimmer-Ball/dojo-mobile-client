/**
 * List item for search type is something clicked on by a user that displays an option and an icon indicating
 * whether this type is selected or not.
 *
 * {searchType:searchType, isSelected:true}
 *
 * Created by SelectUserDirectorySearchTypeView.  We get constructed with the searchType details, and a parameter
 * called isSelected which is either true or false indicating whether we are selected or not.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class",
    "dijit/registry", "dojox/mobile/ListItem"],
    function (declare, lang, domClass, registry, ListItem) {
        return declare("mobilehr.widgets.userDirectory.UserDirectorySearchTypeListItem", ListItem, {

            preamble:function (params) {
                this.icon = "mobilehr/images/icon_29.png";
                this.searchType = params.searchType;
                this.label = this.searchType.description;
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
