/**
 * Generic list item used to display our API administration action links.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojox/mobile/ListItem",
    "dojox/mobile/TransitionEvent", "dojo/dom-class", "mobilehr/mixins/WidgetHelper"],
    function (declare, lang, registry, ListItem, TransitionEvent, domClass, WidgetHelper) {
        return declare("mobilehr.widgets.admin.AdminListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = _lexicon[this.link.rel];
                this.destinationView = "";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
                this.messageDialog = null;
                // default state for this kind of ListItem is to not show the right hand arrow on the item
                // but you can override it if you really want to
                if (params.noArrow) {
                    this.noArrow = params.noArrow;
                } else {
                    this.noArrow = true;
                }
            },
            startup:function () {
                this.inherited(arguments);
                this.messageDialog = registry.byId("messageDialog");
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                _resourceController.registerPostCreateCallback(lang.hitch(this, "_postAdminAction"));
                _resourceController.doCreate(null, this.link.href);
            },
            _postAdminAction:function () {
                // anything but a 200 OK is bad for this section of the API at the moment so display the appropriate
                // dialogue based on this
                switch (_resourceController.responseCode) {
                    case 200 :
                        this.messageDialog.show(_lexicon.adminActionDialogTitle, _lexicon.adminActionSuccess, _lexicon.dialogConfirmationButtonLabel);
                        break;
                    default :
                        this.messageDialog.show(_lexicon.adminActionDialogTitle, _lexicon.adminActionWarning, _lexicon.dialogConfirmationButtonLabel);
                }
            }
        });
    });