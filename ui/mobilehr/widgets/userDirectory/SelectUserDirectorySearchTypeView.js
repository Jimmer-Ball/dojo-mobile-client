/**
 * Given the list of directory search types that the service returns to us, display the types that can be selected
 * and also highlight (via a tick) which option is currently chosen. The choice of an option is mutually exclusive,
 * if you select one of these then you un-select the others.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/userDirectory/UserDirectorySearchTypeListItem" ],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper,
              UserDirectorySearchTypeListItem) {
        return declare("mobilehr.widgets.userDirectory.SelectUserDirectorySearchTypeView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {

                constructor:function () {
                    this.searchTypes = null;
                    this.chosenSearchType = null;
                    this.relatedListItemId = null;
                    this.backDestination = null;
                    this.messageDialog = null;
                    this._subscriptions = [];
                },

                startup:function () {
                    this.inherited(arguments);
                    this.selectUserDirectorySearchTypeHeading = registry.byId("selectUserDirectorySearchTypeHeading");
                    this.selectUserDirectorySearchTypeHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.selectUserDirectorySearchTypeHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.userDirectorySearchTypeInstructions = this.$("userDirectorySearchTypeInstructions");
                    this.userDirectorySearchTypeInstructions.innerHTML = _lexicon.userDirectorySearchTypeInstructions;
                    this.searchTypesList = registry.byId("userDirectorySearchTypeList");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.selectUserDirectorySearchTypeHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },

                /**
                 * Create content of required field options view on basis of required field contents, chosen option,
                 * the list item from whence this view was/is called, and the back destination.
                 *
                 * @param searchTypes       the list of search types
                 * @param chosenSearchType  currently selected search type
                 * @param relatedListItemId calling list item
                 * @param backDestination   back destination
                 */
                createContent:function (searchTypes, chosenSearchType, relatedListItemId, backDestination) {
                    this.searchTypes = searchTypes;
                    this.chosenSearchType = chosenSearchType;
                    this.relatedListItemId = relatedListItemId;
                    this.backDestination = backDestination;
                    this.clearListWidget(this.searchTypesList);
                    array.forEach(this.searchTypes.searchTypes, function (searchType) {
                        if (searchType.searchType === this.chosenSearchType.searchType) {
                            this.searchTypesList.addChild(new UserDirectorySearchTypeListItem({searchType:searchType, isSelected:true}));
                        } else {
                            this.searchTypesList.addChild(new UserDirectorySearchTypeListItem({searchType:searchType, isSelected:false}));
                        }
                    }, this);
                },

                /**
                 * Navigate back to the PerformUserDirectorySearchView, so long as the user has actually chosen an option,
                 * amending the display on the chooser widget as we go.
                 */
                _backClicked:function () {
                    var gotOption = null;
                    var children = this.searchTypesList.getChildren();
                    for (var i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        if (child.checked) {
                            gotOption = child.searchType;
                            break;
                        }
                    }
                    if (gotOption === null) {
                        this.messageDialog.show(
                            _lexicon.dialogErrorTitle,
                            _lexicon.userDirectorySearchTypeWarning,
                            _lexicon.dialogConfirmationButtonLabel);
                    } else {
                        this.chosenSearchType = gotOption;
                        var relatedListItem = registry.byId(this.relatedListItemId);
                        relatedListItem.setChosenOption(this.chosenSearchType);
                        this.performTransition(this.backDestination, -1, "slide", null, null);
                    }
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });
