/**
 * Simple list item for transitioning to the NotYetSupported view indicating the activity/link/whatever is something
 * not supported yet in the version of the UI in use.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, TransitionEvent) {
        return declare("mobilehr.widgets.utils.notYetSupported.NotYetSupportedListItem", ListItem, {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                // You cannot internationalise a link you do not support (doh!), so just print the link title
                this.label = this.link.title;
                this.destinationView = "notYetSupported";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo: this.destinationView, href: null, url: null, scene: null,
                    transition: "slide", transitionDir: 1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._notYetSupported();
            },
            _notYetSupported:function() {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.link, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });