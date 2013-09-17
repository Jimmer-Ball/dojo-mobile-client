/**
 * List item that gets appended to the rendered results set if the result set being displayed contains a
 * "next" link. We return a limited number of results to the client to prevent performance issues. The
 * client currently uses Apple style paging, i.e. an item of this kind is added to the end of the result list,
 * upon pressing it we load the next set of results and add them into the current view.
 *
 * Items of this kind are constructed with the next "next" link from the result list that has the extra results.
 * We also pass a reference to the result list contained in the result view widget (our parent widget) so that we can
 * add the next set of results to its contents. Once the next set of results has been successfully loaded we detach
 * ourselves from the DOM, add the results, and then reattach ourselves at the end (if required by the presence of
 * a "next" link in the new result set).
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class",
    "dijit/registry", "dojo/query", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/TransitionEvent", "dojox/mobile/deviceTheme",
    "mobilehr/widgets/userDirectory/UserDirectorySearchResultListItem",
    "mobilehr/widgets/userDirectory/UserDirectorySearchResultNextListItem"],
    function (declare, lang, connect, array, domClass, registry, query, ListItem, WidgetHelper, TransitionEvent, dt,
              UserDirectorySearchResultListItem, UserDirectorySearchResultNextListItem) {
        return declare("mobilehr.widgets.userDirectory.UserDirectorySearchResultNextListItem", [ListItem, WidgetHelper], {

            /**
             * Our constructor, notable expected parameters include:
             *
             * nextResultLink   - a link representation that will contain a href to access the next set of directory
             *                    results
             * searchResultList - the display widget that we should append ourselves and new results to
             *
             * @param params a parameters object
             */
            preamble:function (params) {
                // the link to retrieve the next set of results
                this.nextResultsLink = params.nextResultsLink;
                // the results list we add the next sets of result to
                this.searchResultList = params.searchResultList;
                this.variableHeight = true;
                this.moveTo = "#";
                this.noArrow = true;
                this.parentView = params.parentView;
                // common message for this kind of item
                this.label = _lexicon.nextSearchResults;
            },

            /**
             * Retrieve the next set of results using the "next" link we were provided with.
             *
             * @param event the onClick event
             */
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                // perform the rest call to get the next set of results
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotNewResults"));
                _resourceController.doRetrieve(this.nextResultsLink.href);
            },

            /**
             * Add the new results to the result list widget if we get any, plus this next link if required.
             * We only reattach ourselves if we detect the next link.
             */
            _gotNewResults:function() {
                switch(_resourceController.responseCode) {
                    case 200 :
                        // pop ourselves off the current list
                        this.searchResultList.removeChild(this);

                        // add the results to the results list
                        var serviceCallResult = _resourceController.responseData;
                        if (serviceCallResult !== null) {
                            array.forEach(serviceCallResult.searchResults, function (searchResult) {
                                this.searchResultList.addChild(
                                    new UserDirectorySearchResultListItem({searchResult:searchResult}));
                            }, this);

                            // determine whether we need to get more results
                            array.forEach(serviceCallResult.links, function (link) {
                                // if we find a next link then amend the current our current nextLink
                                // and add ourselves to the end of the list
                                if (link.rel === "next") {
                                    // reset our link to the one returned
                                    this.nextResultsLink = link;
                                    // add ourselves back on the end of the list
                                    this.searchResultList.addChild(this);
                                }
                            }, this);
                        }
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

            destroy:function () {
                this.inherited(arguments);
            }
        });
    })
;