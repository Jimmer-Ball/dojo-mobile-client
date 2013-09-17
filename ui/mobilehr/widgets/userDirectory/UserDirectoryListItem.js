/**
 * List item to gain access to the mobile user directory. Sets up the search type descriptions and moves us on to the
 * PerformUserDirectorySearchView.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dijit/registry", "dojox/mobile/ListItem",
    "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper", "dojo/_base/array"],
    function (declare, lang, connect, registry, ListItem, TransitionEvent, WidgetHelper, array) {
        return declare("mobilehr.widgets.userDirectory.UserDirectoryListItem", [ListItem, WidgetHelper], {
            preamble:function (params) {
                this.link = params.link;
                this.moveTo = "#";
                this.icon = "mobilehr/images/icon_29.png";
                this.label = _lexicon[this.link.rel];
                // go to the search screen
                this.destinationView = "performUserDirectorySearch";
                // back to the ActionView main menu
                this.destinationViewOnBack = "actions";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
            },
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotAvailableSearchTypes"));
                _resourceController.doRetrieve("services/mobile/mobileUserDirectory");
            },

            /**
             * Call back function once the service has accessed the user directory resource.
             */
            _gotAvailableSearchTypes:function () {
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
                    var destination = registry.byId("performUserDirectorySearch");
                    // add some user friendly descriptions to the search types (no i18n at the API yet)
                    this._decorateSearchTypesWithDescriptions(dto);
                    // call create content on PerformUserDirectorySearchView
                    destination.createContent(dto, this.destinationViewOnBack);
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                } else {
                    this.goBackToLoginView(this.domNode);
                }
            },
            /**
             * Adds a description property to each search type in the search types provided, the
             * description holds an i18n token so our types can be internationalised.
             *
             * Although the service provides us with a set of search types for searching the directory
             * it does not supply descriptions as of yet (no i18n in the api service). We can do our part
             * at the client though as we can discern what the types relate to by name and provide
             * translations.
             *
             * @param searchTypes an object containing some search types
             */
            _decorateSearchTypesWithDescriptions: function(searchTypes) {
                array.forEach(searchTypes.searchTypes, function (searchType) {
                    var searchTypeName = searchType.searchType;
                    switch (searchTypeName) {
                        case "SEARCH_BY_FIRST_NAME":
                            searchType.description = _lexicon.userDirectorySearchByFirstName; break;
                        case "SEARCH_BY_LAST_NAME":
                            searchType.description = _lexicon.userDirectorySearchByLastName; break;
                        case "SEARCH_BY_USERNAME":
                            searchType.description = _lexicon.userDirectorySearchByUserName; break;
                    }
                }, this);
            }
        });
    });
