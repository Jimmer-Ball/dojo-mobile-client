/**
 * List item for clicking through to the most current expense advice by way of first calling the API service for the
 * details.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojox/mobile/ListItem",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper"],
    function (declare, lang, registry, ListItem, TransitionEvent, WidgetHelper) {
        return declare("mobilehr.widgets.expenses.CurrentExpenseAdviceListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = _lexicon[this.link.rel];
                this.destinationView = "expenseAdvice";
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotCurrentExpenseAdvice"));
                _resourceController.doRetrieve("services/mobile/expenseAdvice/current");
            },
            _gotCurrentExpenseAdvice:function () {
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
                    var destination = registry.byId(this.destinationView);
                    destination.createContent(dto, this.destinationViewOnBack);
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                } else {
                    this.goBackToLoginView(this.domNode);
                }
            }
        });
    });