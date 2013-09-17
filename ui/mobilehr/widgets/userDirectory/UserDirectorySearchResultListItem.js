/**
 * List item for a search result whose details can be viewed.  On click it displays the individual search result
 * with the full details that were returned. We currently display the first name, last name, job title and location
 * on these items to allow users to discern between results that have the same first and last names.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class",
    "dijit/registry", "dojo/query", "dojox/mobile/ListItem", "mobilehr/mixins/WidgetHelper",
    "dojox/mobile/TransitionEvent", "dojox/mobile/deviceTheme"],
    function (declare, lang, connect, array, domClass, registry, query, ListItem, WidgetHelper, TransitionEvent, dt) {
        return declare("mobilehr.widgets.userDirectory.UserDirectorySearchResultListItem", [ListItem, WidgetHelper], {
            // this is the content we show per result, so first name, last name, job title and location
            userDetailsTemplate:'<span class="mobilehrListItemLeftTop">${firstName}</span><br>' +
                '<span class="mobilehrListItemLeftBottom">${lastName}</span>',
            jobDetailsTemplate:'<span class="mobilehrListItemRightTop">${jobTitle}</span><br>' +
                '<span class="mobilehrListItemRightBottom">${location}</span>',
            /**
             * Allow our list item to be of variable height to accommodate our variable contents
             *
             * @param params whatever we were invoked with on "new"
             */
            preamble:function (params) {
                this.variableHeight = true;
                this.parentView = params.parentView;
                this.searchResult = params.searchResult;
                this.moveTo = "#";
                // go to the individual result display
                this.destinationView = "userDirectorySearchResult";
                this.destinationViewOnBack = "userDirectorySearchResults";
                this.transitionOptions = {moveTo:this.destinationView, href:null, url:null, scene:null,
                    transition:"slide", transitionDir:1};
                this._subscriptions = [];
            },

            /**
             * Specially populate our list item so the user details on the left and the extra details on the right are
             * easy on the eye and take the current theme into account.
             */
            buildRendering:function () {
                this.inherited(arguments);
                if (this.labelNode) {
                    this._setLabelAttr(this._formatUserDetails());
                    domClass.add(this.labelNode, "mobilehrListItemLeftSmallText");
                }
                this._setRightTextAttr(this._formatJobDetails());
                if (dt.currentTheme === "android") {
                    domClass.replace(this.rightTextNode, "androidMobilehrListItemRightSmallText", "mblListItemRightText");
                } else {
                    domClass.replace(this.rightTextNode, "mobilehrListItemRightSmallText", "mblListItemRightText");
                }
            },

            /**
             * Simply move to the next view to display our result in full.
             *
             * @param event the onClick event
             */
            onClick:function (event) {
                this.select();
                this.setTransitionPos(event);
                // we already have the full data for this result, simply pass it to the UserDirectorySearchResultView
                var destination = registry.byId(this.destinationView);
                destination.createContent(this.searchResult, this.destinationViewOnBack);
                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
            },

            /**
             * Format the user details displayed on the list item containing the users first name and last name.
             */
            _formatUserDetails:function () {
                return this.substitute(this.userDetailsTemplate,
                    {
                        firstName:this.searchResult.firstName,
                        lastName:this.searchResult.lastName
                    });
            },

            /**
             * Format the users job details for the right side of the list item, job title and location.
             */
            _formatJobDetails:function () {
                return this.substitute(this.jobDetailsTemplate,
                    {
                        jobTitle:this.searchResult.jobTitle,
                        location:this.searchResult.location
                    });
            },

            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    })
;
