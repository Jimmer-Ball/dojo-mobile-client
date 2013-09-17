/**
 * List item to show the list of current leave requests by way of calling the API Service to first get the details.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dijit/registry", "dojox/mobile/ListItem",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper"],
    function (declare, lang, connect, registry, ListItem, TransitionEvent, WidgetHelper) {
        return declare("mobilehr.widgets.leave.display.CurrentLeaveRequestsListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = _lexicon[this.link.rel];
                this.destinationView = "leaveRequests";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotCurrentLeaveRequests"));
                _resourceController.doRetrieve("services/mobile/leaveRequests/current");
            },
            _gotCurrentLeaveRequests:function () {
                var dto = null;
                switch (_resourceController.responseCode) {
                    case 200 :
                        dto = _resourceController.responseData;
                        break;
                    default :
                        dto = {errorCode:_resourceController.responseCode};
                        break;
                }
                if (_resourceController.responseCode !== 401) {
                    var destination = registry.byId("leaveRequests");
                    destination.createContent(dto, this.destinationViewOnBack);
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                } else {
                    this.goBackToLoginView(this.domNode);
                }
            }
        });
    });