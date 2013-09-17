/**
 * Given a list of search results create a UserDirectorySearchResultListItem widget for each and add it to this
 * widgets search results list.  If there are more results available than those returned by the service in the
 * initial call a "Next" link will be returned with the results representation. We render this next link as a
 * UserDirectorySearchResultNextListItem widget and attach it to the end of the current results list. Upon
 * subsequent retrievals we reuse this next widget by resetting its link property and removing it from the
 * current list and reattaching it at the end,  but only if a "Next" link is returned with the next set of results.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "dojox/mobile/RoundRect", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/userDirectory/UserDirectorySearchResultListItem",
    "mobilehr/widgets/userDirectory/UserDirectorySearchResultNextListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, RoundRect, WidgetHelper, RepresentationHelper,
              UserDirectorySearchResultListItem, UserDirectorySearchResultNextListItem) {
        return declare("mobilehr.widgets.userDirectory.UserDirectorySearchResultsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {

                constructor:function () {
                    this.searchResults = null;
                    // these two pieces of data should feature in the instructions
                    this.chosenSearchType = null;
                    this.chosenSearchTerm = null;
                    this.relatedListItemId = null;
                    this.backDestination = null;
                    this._subscriptions = [];
                },

                startup:function () {
                    this.inherited(arguments);
                    this.userDirectorySearchResultsHeading = registry.byId("userDirectorySearchResultsHeading");
                    this.userDirectorySearchResultsHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.userDirectorySearchResultsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.userDirectorySearchResultsInstructions = this.$("userDirectorySearchResultsInstructions");
                    this.searchResultsList = registry.byId("userDirectorySearchResultsList");
                    this._subscriptions.push(connect.connect(this.userDirectorySearchResultsHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                },

                /**
                 * Render the content of the search result list with the search results representation we are
                 * provided with. If a "Next" link is contained in the results then render this at the bottom
                 * of the list. If no results are returned then we let the user know to prevent any confusion
                 * as to whether a search has "worked".
                 *
                 * @param searchResults     the list of search results
                 * @param chosenSearchType  currently selected search type
                 * @param chosenSearchTerm  the search term that was entered for this search result
                 * @param backDestination   back destination
                 */
                createContent:function (searchResults, chosenSearchType, chosenSearchTerm, backDestination) {
                    this.searchResults = searchResults;
                    this.chosenSearchType = chosenSearchType;
                    this.chosenSearchTerm = chosenSearchTerm;
                    this.backDestination = backDestination;
                    // wipe out the current result list
                    this.clearListWidget(this.searchResultsList);
                    // clear any messages that were added to the list
                    this.searchResultsList.domNode.innerHTML = null;

                    // set the current search details on the instruction node
                    this.userDirectorySearchResultsInstructions.innerHTML = this._populateCurrentSearchInfo();

                    if (this.searchResults.searchResults != null && this.searchResults.searchResults.length > 0) {
                        // add the search result list items
                        array.forEach(this.searchResults.searchResults, function (searchResult) {
                                this.searchResultsList.addChild(
                                    new UserDirectorySearchResultListItem({searchResult:searchResult}));
                        }, this);

                        array.forEach(this.searchResults.links, function (link) {
                            // if we find a next link then amend the current list with a UserDirectorySearchResultNextListItem
                            // that will load the next set of results
                            if (link.rel === "next") {
                                this.searchResultsList.addChild(
                                    new UserDirectorySearchResultNextListItem({
                                        // the link we need to get the next set of results
                                        nextResultsLink:link,
                                        // reference to the list we will add the results to
                                        searchResultList:this.searchResultsList
                                        }));
                            }
                        }, this);
                    } else {
                        // no results were found so let the client know
                            this.createMessageNodeContent(
                                this.searchResultsList.domNode,
                                "userDirectoryNoResultsReturned",
                                "mobilehrCenteredPaddedDiv");
                    }
                },

                /**
                 * Navigate back to the PerformUserDirectorySearchView so the user can perform another search.
                 */
                _backClicked:function () {
                    // just go back to the perform search node for now
                    this.performTransition(this.backDestination, -1, "slide", null, null);
                },

                /**
                 * Populate the instructions using the search type and term info we were passed
                 */
                _populateCurrentSearchInfo:function() {
                    return [this.chosenSearchType, " : ", this.chosenSearchTerm].join('');
                },

                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });
