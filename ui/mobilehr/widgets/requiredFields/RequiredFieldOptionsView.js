/**
 * Given the input list of required field options, display all the different options a user can pick from and also
 * highlight (via a tick) which option is currently chosen. The choice of an option is mutually exclusive, if you
 * select one of these then you un-select the others.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/requiredFields/RequiredFieldOptionListItem" ],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper,
              RequiredFieldOptionListItem) {
        return declare("mobilehr.widgets.requiredFields.RequiredFieldOptionsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.requiredField = null;
                    this.chosenOption = null;
                    this.relatedListItemId = null;
                    this.backDestination = null;
                    this.messageDialog = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.requiredFieldOptionsHeading = registry.byId("requiredFieldOptionsHeading");
                    this.requiredFieldOptionsHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.requiredFieldOptionsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.requiredFieldOptionsList = registry.byId("requiredFieldOptionsList");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.requiredFieldOptionsHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },
                /**
                 * Create content of required field options view on basis of required field contents, chosen option,
                 * the list item from whence this view was/is called, and the back destination.
                 *
                 * @param requiredField  required field
                 * @param chosenOption chosen option
                 * @param relatedListItemId calling list item
                 * @param backDestination back destination
                 */
                createContent:function (requiredField, chosenOption, relatedListItemId, backDestination) {
                    this.requiredField = requiredField;
                    this.chosenOption = chosenOption;
                    this.relatedListItemId = relatedListItemId;
                    this.backDestination = backDestination;
                    this.clearListWidget(this.requiredFieldOptionsList);
                    array.forEach(this.requiredField.requiredFieldOptions, function (option) {
                        if (option.uuid === this.chosenOption.uuid) {
                            this.requiredFieldOptionsList.addChild(new RequiredFieldOptionListItem({requiredFieldOption:option, isSelected:true}));
                        } else {
                            this.requiredFieldOptionsList.addChild(new RequiredFieldOptionListItem({requiredFieldOption:option, isSelected:false}));
                        }
                    }, this);
                },
                /**
                 * Navigate back to the BookLeaveRequestView, so long as the user has actually chosen an option,
                 * amending the display on the chooser widget as we go.
                 */
                _backClicked:function () {
                    var gotOption = null;
                    var children = this.requiredFieldOptionsList.getChildren();
                    for (var i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        if (child.checked) {
                            gotOption = child.requiredFieldOption;
                            break;
                        }
                    }
                    if (gotOption === null) {
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.requiredFieldOptionChoose,
                            _lexicon.dialogConfirmationButtonLabel);
                    } else {
                        this.chosenOption = gotOption;
                        var relatedListItem = registry.byId(this.relatedListItemId);
                        relatedListItem.setChosenOption(this.chosenOption);
                        this.performTransition(this.backDestination, -1, "slide", null, null);
                    }
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });