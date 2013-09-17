/**
 * Provide a chooser widget which holds the label of a required field and the current setting for the
 * required field (arbitrary, first in list).  Clicking on it will put up a view of all the validly available
 * options given the required field, and will have the currently selected option "ticked" and all the others
 * "un-ticked".
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dijit/registry", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.requiredFields.ChooseRequiredFieldOptionListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.variableHeight = true;
                this.id = params.id;
                this.requiredField = params.requiredField;
                this.destinationView = params.destinationView;
                this.destinationViewOnBack = params.destinationViewOnBack;
                this.chosenOption = this.requiredField.requiredFieldOptions[0];
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = this.requiredField.name;
                this.rightText = this.chosenOption.value;
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null, transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                this._showOptions();
            },
            /**
             * Return details of the required field and the chosen option
             */
            getChosenDetails:function () {
                return {requiredField:this.requiredField, chosenOption:this.chosenOption};
            },
            /**
             * Set the chosen option to whatever was passed in and amend the text displayed
             *
             * @param chosenOption chosen option
             */
            setChosenOption:function (chosenOption) {
                this.chosenOption = chosenOption;
                this._setRightTextAttr(this.chosenOption.value);
            },
            /**
             * Show the RequiredFieldOptionsView passing in the required field details, the chosen option, the id
             * of this chooser widget (so the chosen option can be reset when required), and the destination view on
             * back.
             */
            _showOptions:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.requiredField, this.chosenOption, this.id, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            }
        });
    });