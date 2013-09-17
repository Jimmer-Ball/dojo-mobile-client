/**
 * Provide a chooser widget which has a label ("directory search type") and the current client search type selection. 
 * Clicking on it will move to the SelectUserDirectorySearchTypeView which as the name suggests is a view of the
 * currently available search type options provided by the service, and will have the currently selected search type
 * "ticked", and all the others "un-ticked".
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dijit/registry", "dojo/_base/array", "dojox/mobile/ListItem",
    "mobilehr/mixins/WidgetHelper", "dojox/mobile/TransitionEvent"],
    function (declare, registry, array, ListItem, WidgetHelper, TransitionEvent) {
        return declare("mobilehr.widgets.userDirectory.ChooseUserDirectorySearchTypeItem", [ListItem, WidgetHelper], {

            preamble:function (params) {
                this.variableHeight = true;
                this.id = "userDirectorySearchTypeChooser";
                // this is supplied when the widget is constructed in the PerformUserDirectorySearchView
                this.searchTypeOptions = params.searchTypeOptions;
                this.destinationView = "selectUserDirectorySearchType";
                this.destinationViewOnBack = "performUserDirectorySearch";
                // select the first item by default
                this.chosenSearchType = this._setDefaultSearchType(this.searchTypeOptions.searchTypes);
                this.moveTo = "#";
                this.label = _lexicon.userDirectorySearchTypeChooserLabel;
                this.rightText = this.chosenSearchType.description;
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
                return this.chosenSearchType;
            },

            /**
             * Set the chosen option to whatever was passed in and amend the text displayed
             *
             * @param chosenSearchType chosen option
             */
            setChosenOption:function (chosenSearchType) {
                this.chosenSearchType = chosenSearchType;
                this._setRightTextAttr(this.chosenSearchType.description);
            },

            /**
             * Show the SelectUserDirectorySearchTypeView passing in the available search type options, the currently
             * chosen search type, the id of this chooser widget (so the chosen option can be reset when required),
             * and the destination view on back.
             */
            _showOptions:function () {
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.searchTypeOptions, this.chosenSearchType, this.id, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },

            /**
             * Find the search by last name in the types array passed to us and return it.
             */
            _setDefaultSearchType:function(searchTypes) {
                var defaultSearchType = null;
                if (searchTypes !== null) {
                    array.forEach(searchTypes, function (searchType) {
                        if (searchType.searchType === "SEARCH_BY_LAST_NAME" ) {
                            defaultSearchType = searchType;
                        }
                    }, this);
                }
                return defaultSearchType;
            }
        });
    });