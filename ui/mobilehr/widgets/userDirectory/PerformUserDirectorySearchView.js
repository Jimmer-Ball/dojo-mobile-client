/**
 * Perform user directory search, this widget contains :-
 *
 * 1) A search term input for our users to populate
 * 2) A search type chooser link (ChooseUserDirectorySearchTypeItem) that permits the user to select the
 *    search type they want to perform. This item retains the selection from the selection screen 
 *    (SelectUserDirectorySearchTypeView)
 * 3) A submit button to issue the search to the service
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/TransitionEvent", "dojox/mobile/ScrollableView", "dojo/dom-style", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper", "mobilehr/widgets/userDirectory/ChooseUserDirectorySearchTypeItem"],
    function (declare, lang, array, connect, registry, TransitionEvent, ScrollableView, domStyle, WidgetHelper,
              RepresentationHelper, ChooseUserDirectorySearchTypeItem) {
        return declare("mobilehr.widgets.userDirectory.PerformUserDirectorySearchView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {

                constructor:function () {
                    this.performUserDirectorySearchHeading = null;
                    this.userDirectorySearchInstructions = null;
                    this.directorySearchTerm  = null;
                    this.searchTypeSelector = null;
                    this.submitDirectorySearchButton = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    this.transitionOptions = null;
                    this.searchTypes = null;
                    this.messageDialog = null;
                    // after searching we move to the UserDirectorySearchResultsView
                    this.destinationView = "userDirectorySearchResults";
                },

                startup:function () {
                    this.inherited(arguments);
                    this.performUserDirectorySearchHeading = registry.byId("performUserDirectorySearchHeading");
                    this.performUserDirectorySearchHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.performUserDirectorySearchHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.userDirectorySearchInstructions = this.$("userDirectorySearchInstructions");
                    this.userDirectorySearchInstructions.innerHTML = _lexicon.userDirectorySearchInstructions;
                    // get a widget handle to our search term entry text box
                    this.directorySearchTerm = registry.byId("directorySearchTerm");
                    // get a widget handle to the search button
                    this.submitDirectorySearchButton = registry.byId("submitDirectorySearchButton");
                    this.submitDirectorySearchButton._setLabelAttr(_lexicon.userDirectorySearchSubmitButton);
                    this._subscriptions.push(connect.connect(this.performUserDirectorySearchHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.submitDirectorySearchButton.domNode, "onclick", lang.hitch(this, "_searchButtonClicked")));
                    this._subscriptions.push(connect.connect(this.directorySearchTerm.domNode, "onfocus", lang.hitch(this, "_searchTermAccessed")));
                    this.messageDialog = registry.byId("messageDialog");
                },

                /**
                 * Display the content of the search screen, there isn't a lot to do here apart from setting up the
                 * search type selector widget and adding it to the display.
                 *
                 * @param searchTypes       the available search types as provided by the service
                 * @param backDestination   back destination, the view to move to when the back button is pressed
                 */
                createContent:function (searchTypes, backDestination) {
                    this.searchTypes = searchTypes;
                    this.backDestination = backDestination;
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                    this.actionFields = [];
                    // create the search type selection item if we haven't done so already
                    if (this.searchTypeSelector === null) {
                        this._addSearchTypeSelector(searchTypes);
                    }

                    // populate the search term with its default value
                    this.directorySearchTerm.set("value", _lexicon.userDirectoryDefaultSearchTerm);
                    // override its border setting to round it off
                    domStyle.set(this.directorySearchTerm.domNode, "-webkit-border-radius", "20px");
                },

                /**
                 * Navigate back to the actions view
                 */
                _backClicked:function () {
                    this.performUserDirectorySearchHeading.goTo("actions", this.performUserDirectorySearchHeading.href);
                },

                /**
                 * Validate the content of the search term box and perform service call if everything looks ok.
                 */
                _searchButtonClicked:function () {
                    // get the search term the user provided
                    var searchTermProvided = this.directorySearchTerm.get("value");
                    // we don't want to submit an empty search term or one that is less than three characters in length
                    // as the service will reject it
                    if (searchTermProvided === null || searchTermProvided.length < 3 ||
                        searchTermProvided === _lexicon.userDirectoryDefaultSearchTerm) {
                        // show this generic one for now, we need to use the error message dialog though
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.userDirectorySearchTermWarning,
                            _lexicon.dialogConfirmationButtonLabel);
                    } else {
                        // do the actual search
                        var searchType = null;
                        // get search type selected from the chooser
                        if (this.searchTypeSelector !== null) {
                            // grab the currently selected search type
                            searchType = this.searchTypeSelector.getChosenDetails().searchType;
                        }

                        if (searchType !== null) {
                            /**
                             * rejecting the special characters --
                             * allowing only alphabets for FirstName and LastName;
                             * and accepting digits also for UserName
                             */
                            if(searchType == 'SEARCH_BY_LAST_NAME' || searchType == 'SEARCH_BY_FIRST_NAME') {
                                if(!this._alphaOnlyValidation(searchTermProvided)) {
                                    return false;
                                }
                            }
                            else {
                                if(!this._alphaNumericValidation(searchTermProvided)) {
                                    return false;
                                }
                            }
                            // submitting request to the server
                            _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_submittedDirectorySearchRequest"));
                            _resourceController.doRetrieve("services/mobile/mobileUserDirectory/searchMobileUserDirectory/searchType/" +
                                searchType + "/searchTerm/" + this._formatSearchTerm(searchTermProvided) + "/startIndex/0");
                        } else {
                            this.messageDialog.show(_lexicon.dialogErrorTitle,
                                _lexicon.userDirectoryNoSearchTypeSelectedWarning,
                                _lexicon.dialogConfirmationButtonLabel);
                        }
                    }
                },

                /**
                 * If we cancel simply navigate back a view
                 */
                _cancelled:function () {
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },

                /**
                 * If we successfully submitted our search request navigate to the result. If we got a 401 go back to
                 * the login view, and if we got anything else display an error dialog.
                 */
                _submittedDirectorySearchRequest:function () {
                    switch(_resourceController.responseCode) {
                        case 200 :
                            // setup the results view before moving there
                            var destination = registry.byId(this.destinationView);
                            destination.createContent(
                                _resourceController.responseData,
                                this.searchTypeSelector.getChosenDetails().description,
                                this.directorySearchTerm.get("value"),
                                "performUserDirectorySearch");
                            this.transitionOptions = {moveTo:"userDirectorySearchResults", href:null, url:null, scene:null, transition:"slide", transitionDir:1};
                            new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                            break;
                        case 400 :
                            // the service will return a bad request 400 for search terms that do not exceed three characters
                            // in length, this is a security precaution in order to prevent massive search results from being
                            // returned and clogging the service our UI doesn't normally allow this but this will catch
                            // the problem and report it
                            this.displayServiceErrorDialog(_lexicon.dialogWarningTitle,
                                _lexicon.dialogConfirmationButtonLabel, this.messageDialog, null, "userDirectorySearchTermWarning");
                            break;
                        case 401 :
                            this.goBackToLoginView(this.domNode);
                            break;
                        default :
                            this.displayServiceErrorDialog(_lexicon.dialogErrorTitle,
                                _lexicon.dialogConfirmationButtonLabel, this.messageDialog, null);
                            break;
                    }
                },

                /**
                 * Add the search types chooser widget (ChooseUserDirectorySearchTypeItem) and place it within the
                 * view at a specified location provided in the markup.
                 *
                 * @param searchTypes the search types we can perform
                 */
                _addSearchTypeSelector:function(searchTypes) {
                    var searchTypeChooser = new ChooseUserDirectorySearchTypeItem({
                        // we should have received a search type options dto when we moved to this view, it should
                        // contain three search types
                        searchTypeOptions: searchTypes
                    });
                    // add it to the markup at the div we provided in index.jsp
                    searchTypeChooser.placeAt("directorySearchTypeChooser");
                    // start the widget
                    searchTypeChooser.startup();
                    // set the classes reference to the chooser
                    this.searchTypeSelector = searchTypeChooser;
                },

                /**
                 * Replace any spaces in the term provided with %20 to form a valid URL token we can pass to the
                 * service.
                 *
                 * @param searchTerm a search term that may or may not contain a space
                 */
                _formatSearchTerm:function(searchTerm) {
                    return searchTerm.replace(new RegExp(" ", "g"), "%20");
                },

                /**
                 * Called when a user accesses the search term to wipe the default content.
                 */
                _searchTermAccessed:function() {
                    this.directorySearchTerm.set("value", "");
                },

                /**
                 * Validation method that determines whether the search string provided is made up of
                 * alpha characters only.
                 *
                 * @param searchTerm the search term our user has provided
                 */
                _alphaOnlyValidation:function(searchTerm) {
                    var specialChars = /[^A-Za-z]/;
                    if (specialChars.test(searchTerm)) {
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.alphaOnlyWarning,
                            _lexicon.dialogConfirmationButtonLabel);
                        return false;
                    } else {
                        return true;
                    }
                },

                /**
                 * Validation method that determines whether the search string provided is made up of
                 * alpha numeric characters only.
                 *
                 * @param searchTerm the search term our user has provided
                 */
                _alphaNumericValidation:function(searchTerm) {
                    var specialChars = /[^A-Za-z\d]/;
                    if (specialChars.test(searchTerm)) {
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.alphaNumericOnlyWarning,
                            _lexicon.dialogConfirmationButtonLabel);
                        return false;
                    } else {
                        return true;
                    }
                },

                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    // destroy the inner search type selector widget
                    this.searchTypeSelector.destroy();
                    this.inherited(arguments);
                }
            });
    });
