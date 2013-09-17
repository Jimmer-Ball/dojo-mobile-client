/**
 * List item that transitions to a view asking the user to provide a start and end day range for their
 * prospective leave request.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, TransitionEvent) {
        return declare("mobilehr.widgets.leave.book.LeaveRangeListItem", ListItem, {
            preamble:function(params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = _lexicon[this.link.rel];
                this.destinationView = "leaveRange";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo: this.destinationView, href: null, url: null, scene: null,
                    transition: "slide", transitionDir: 1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._goToLeaveRangeView();
            },
            _goToLeaveRangeView:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.link, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });
