/**
 * Choose a given data type holding authorisations and call the right type of view type accordingly to display the
 * listing as required.
 *
 * Created by AuthorisationTypesView passing in the data type details and the list of authorisations of that type
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",  "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.authorisation.ChooseDataTypeListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.dataType = params.dataType;
                this.authorisationsList = params.authorisationsList;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = this.dataType.description;
                this.destinationView = "authorisationLeaveRequests";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo: this.destinationView, href: null, url: null, scene: null,
                    transition: "slide", transitionDir: 1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showAuthorisationRecords();
            },
            /**
             * Show the authorisation specific view for the data type.  At the moment we only do leave request
             * authorisation so we've not got a proper switch to different view destinations here like we will
             * longer term.
             *
             * TODO: As more "types" of authorisation come online we'll have to get a bit more complex in terms
             * of the routing through here to other views.
             */
            _showAuthorisationRecords:function () {
                if (this.dataType.listName === "leaveRequests") {
                    var destination = registry.byId(this.destinationView);
                    destination.createContent(this.authorisationsList, this.destinationViewOnBack);
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                }
            }
        });
    });