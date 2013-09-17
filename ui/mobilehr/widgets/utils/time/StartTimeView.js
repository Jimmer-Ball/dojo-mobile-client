/**
 * Choose start time view holding a SpinWheelTimePicker and a back directive.  By reference to the provided
 * relatedListItem this widget can updated the current time on the appropriate relatedListItem correctly.  So, this
 * gives us a consistent way of capturing and managing user's time settings in a variety of different scenarios.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/TransitionEvent", "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper"],
    function (declare, lang, array, connect, registry, TransitionEvent, ScrollableView, WidgetHelper, RepresentationHelper) {
        return declare("mobilehr.widgets.utils.time.StartTimeView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.chooseTimeHeading = null;
                    this.chooseTimeInstructions = null;
                    this.chooseTimeSpinner = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    this.transtionOptions = null;
                    this.timeSetting = null;
                    this.hours = null;
                    this.minutes = null;
                    this.relatedListItemId = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.chooseTimeHeading = registry.byId("chooseStartTimeHeading");
                    this.chooseTimeHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.chooseTimeHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.chooseTimeInstructions = this.$("chooseStartTimeInstructions");
                    this.chooseTimeInstructions.innerHTML = _lexicon.chooseStartTimeInstructions;
                    this.chooseTimeSpinner = registry.byId("chooseStartTimeSpinner");
                    this._subscriptions.push(connect.connect(this.chooseTimeHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },
                /**
                 * Set the time appropriately on the widget for display.
                 *
                 * @param hours hour numeric setting
                 * @param minutes numeric setting
                 * @params view instructions
                 * @param relatedListItemId the ID of the list item used to navigate to here holds the current time
                 *        setting, so as and when we navigate "back" from this view, we need to update the related
                 *        list item current time setting
                 * @param backDestination back destination
                 */
                createContent:function (hours, minutes, viewInstructions, relatedListItemId, backDestination) {
                    this.hours = hours;
                    this.minutes = minutes;
                    this.chooseTimeInstructions.innerHTML = viewInstructions;
                    this.relatedListItemId = relatedListItemId;
                    this.backDestination = backDestination;
                    this.chooseTimeSpinner.reset(this.hours, this.minutes);
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                },
                /**
                 * When we click on back we have to set the current time on the relatedListItem correctly
                 */
                _backClicked:function () {
                    registry.byId(this.relatedListItemId).resetTime(this.chooseTimeSpinner.slots[0].getValue(),
                        this.chooseTimeSpinner.slots[1].getValue());
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });