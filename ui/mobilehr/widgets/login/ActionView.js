/**
 * "Home page view" that ties up with the actions view on the main page which displays our home links provided by the
 * API, which depends on the user's role and authorisation levels, as list item types following login.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry", "dojo/dom-class",
    "dojo/dom", "dojo/dom-construct", "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/payslips/CurrentPayAdviceListItem", "mobilehr/widgets/expenses/CurrentExpenseAdviceListItem",
    "mobilehr/widgets/leave/display/CurrentLeaveRequestsListItem", "mobilehr/widgets/admin/AdminListItem",
    "mobilehr/widgets/authorisation/AuthorisationsListItem", "mobilehr/widgets/leave/book/LeaveRangeListItem",
    "mobilehr/widgets/userDirectory/UserDirectoryListItem", "mobilehr/widgets/utils/notYetSupported/NotYetSupportedListItem"],
    function (declare, lang, array, connect, registry, domClass, dom, domConstruct, ScrollableView, WidgetHelper, RepresentationHelper,
              CurrentPayAdviceListItem, CurrentExpenseAdviceListItem, CurrentLeaveRequestsListItem, AdminListItem,
              AuthorisationsListItem, LeaveRangeListItem, UserDirectoryListItem, NotYetSupportedListItem) {
        return declare("mobilehr.widgets.login.ActionView", [ScrollableView, WidgetHelper, RepresentationHelper], {
            /**
             * What links (so functionality expressed in views) does the UI currently support
             */
            constructor:function () {
                this._mapOfSupportedLinksToListItems = {
                    "getCurrentPayAdvice":CurrentPayAdviceListItem,
                    "getCurrentExpenseAdvice":CurrentExpenseAdviceListItem,
                    "getCurrentLeaveRequests":CurrentLeaveRequestsListItem,
                    "getAuthorisations":AuthorisationsListItem,
                    "getLeaveEntitlements":LeaveRangeListItem,
                    "mobileUserDirectory":UserDirectoryListItem,
                    "resetInternalDataServices":AdminListItem
                };

                this._subscriptions = [];

                // individual action group lists
                this.authActionList = null;
                this.leaveActionList = null;
                this.adviceActionList = null;
                this.userDirActionList = null;
                // api administrator action list
                this.adminActionList = null;

                this.actionsHeading = null;
                this.actionsInstructions = null;
            },
            /**
             * Pick up on our widgets following markup startup
             */
            startup:function () {
                this.inherited(arguments);
                // we use the following lists to group sets of functionally related action links
                this.authActionList = registry.byId("authActionList");
                this.leaveActionList = registry.byId("leaveActionList");
                this.adviceActionList = registry.byId("adviceActionList");
                this.userDirActionList = registry.byId("userDirActionList");
                this.adminActionList = registry.byId("adminActionList");

                // collect our initialised action lists so we can sort them within the display
                this.actionLists = [
                    this.authActionList,
                    this.leaveActionList,
                    this.adviceActionList,
                    this.userDirActionList,
                    this.adminActionList];

                this.actionsHeading = registry.byId("actionsHeading");
                this.actionsHeading._setBackAttr(_lexicon.logoutButtonLabel);
                this.actionsHeading._setLabelAttr(_lexicon.applicationTitle);
                this.actionsInstructions = this.$("actionsInstructions");
                this.actionsInstructions.innerHTML = _lexicon.actionsInstructions;
                this._subscriptions.push(connect.connect(
                    this.actionsHeading.get("backButton"), "onclick", lang.hitch(this, "_logoutClicked")));
            },
            /**
             * Create the list of links given the authentication response, so create the list of actions a given
             * user can perform, sorting the links alphabetically ascending on the basis of the link rel, and
             * picking up the right action implementation class, or picking up the NotYetSupportedAction class.
             *
             * @param dto holds the authenticationResponse
             */
            createContent:function (dto) {
                this._populateWelcomeMessage(dto);
                // ensure all of our action lists start out empty and visible
                this._resetActionLists();
                this._populateActionLists(dto);
                // configure the display based upon which items are being shown to the user after the login
                this._reconfigureDisplay();
                // reset widgets (application wide) on entry to the app
                this._resetApplicationWidgets();
            },
            /**
             * The actionsHeading has been clicked so log the user out.
             */
            _logoutClicked:function () {
                _resourceController.registerPostDeleteCallback(lang.hitch(this, "_postLogout"));
                _resourceController.doDelete("services/mobile/login");
            },
            /**
             * Go back to the login view regardless of the status of the logout call, if we go we go.
             */
            _postLogout:function () {
                _resourceController.token = null;
                // reset the date spinner widgets so that we they are pre-initialised if someone else uses the app
                // on the same device
                this._resetApplicationWidgets();
                this.actionsHeading.goTo("login", this.actionsHeading.href);
            },
            /**
             * Given the input link, return the right list item class if we support the link in the UI, or return the
             * NotYetSupportedListItem class if we don't YET support following the link in the UI.
             *
             * @param link The link details
             */
            _getListItemClassGivenLink:function (link) {
                var listItemClass = this._mapOfSupportedLinksToListItems[link.rel];
                if (listItemClass) {
                    return new listItemClass({link:link});
                } else {
                    return new NotYetSupportedListItem({link:link});
                }
            },
            /**
             * Find a link in the list of links provided with the supplied rel and return it.
             *
             * @param links a list of links
             * @param rel   a link relation
             * @return a link from the list provided that has the supplied rel, or null if we do not find such a link
             */
            _getLinkByRel:function (links, rel) {
                var linkByRel = null;
                array.forEach(links, function(link) {
                    if (link.rel === rel) {
                        linkByRel = link;
                    }
                }, this);

                return linkByRel;
            },
            /**
             * Add the provided rel's corresponding link to the action list (dojox.mobile.RoundRectList) if we
             * find a link with that rel in the supplied links list.
             *
             * @param actionList a rounded rectangle list group that we are going to try and add an action link to
             * @param rel        the rel of the link we wish to add
             * @param links      the set of available action links to look for the rel in
             */
            _addActionListItem:function (actionList, rel, links) {
                var link = this._getLinkByRel(links, rel);
                if (link !== null) {
                    actionList.addChild(this._getListItemClassGivenLink(link));
                }
            },
            /**
             * Add each link to the specific functionally related group if it exists in the provided dto's link set.
             *
             * @param dto holds the authenticationResponse and link content
             */
            _populateActionLists: function(dto) {
                this._addActionListItem(this.authActionList, "getAuthorisations", dto.links);
                this._addActionListItem(this.leaveActionList, "getLeaveEntitlements", dto.links);
                this._addActionListItem(this.leaveActionList, "getCurrentLeaveRequests", dto.links);
                this._addActionListItem(this.adviceActionList, "getCurrentPayAdvice", dto.links);
                this._addActionListItem(this.adviceActionList, "getCurrentExpenseAdvice", dto.links);
                this._addActionListItem(this.userDirActionList, "mobileUserDirectory", dto.links);
                this._addActionListItem(this.adminActionList, "resetInternalDataServices", dto.links);
            },
            _emptyActionLists:function() {
                this.clearListWidget(this.authActionList);
                this.clearListWidget(this.leaveActionList);
                this.clearListWidget(this.adviceActionList);
                this.clearListWidget(this.userDirActionList);
                this.clearListWidget(this.adminActionList);
            },
            _reconfigureDisplay:function() {
                // hide the actions lists that did not receive a list item
                this._removeEmptyActionLists();
                // push unused items to the bottom
                this._reorderActionLists();
            },
            /**
             * Tidy up the action list by hiding the RoundRectList action lists, an organisation may or may
             * not use the full set of components so we don't to display empty lists.
             */
            _removeEmptyActionLists:function() {
                this._toggleActionListDisplay(this.authActionList);
                this._toggleActionListDisplay(this.leaveActionList);
                this._toggleActionListDisplay(this.adviceActionList);
                this._toggleActionListDisplay(this.userDirActionList);
                this._toggleActionListDisplay(this.adminActionList);
            },
            /**
             * Move empty action lists to the bottom of the overall set.
             */
            _reorderActionLists:function() {
                // old fashioned for loop for array access
                for (var i = 0; i < this.actionLists.length; i++) {
                    if (domClass.contains(this.actionLists[i].domNode, "mobilehrIsHidden")) {
                        // place it after the last item to move the unused items to the bottom
                        domConstruct.place(this.actionLists[i].domNode, this.actionLists[this.actionLists.length - 1].domNode, "after");
                    }
                }
            },
            /**
             * Detect whether the list we were passed contained any elements, if it does then
             * ensure the list is shown else hide it.
             *
             * @param actionList a RoundRectList that may or may not contain list items
             */
            _toggleActionListDisplay:function (actionList) {
                if (actionList.domNode.childNodes.length > 0) {
                    domClass.remove(actionList.domNode, "mobilehrIsHidden");
                } else {
                    domClass.add(actionList.domNode, "mobilehrIsHidden");
                }
            },
            /**
             * Make all action lists visible.
             */
            _resetActionLists: function() {
                this._emptyActionLists();
                domClass.remove(this.authActionList.domNode, "mobilehrIsHidden");
                domClass.remove(this.leaveActionList, "mobilehrIsHidden");
                domClass.remove(this.adviceActionList, "mobilehrIsHidden");
                domClass.remove(this.userDirActionList, "mobilehrIsHidden");
                domClass.remove(this.adminActionList, "mobilehrIsHidden");
                // place "first" using the reverse order to reset action list positions
                for (var i = this.actionLists.length - 1; i > -1; i--) {
                    domConstruct.place(this.actionLists[i].domNode, dom.byId("userActionsList"), "first");
                }
            },
            /**
             * Add the users forename to the welcome message if it is available.
             *
             * @param dto the response dto
             */
            _populateWelcomeMessage: function (dto) {
                if (dto.userName.length > 0) {
                    this.actionsInstructions.innerHTML = [
                        _lexicon.actionsInstructions,
                        dto.userName.split(" ")[0]].join(" ");
                } else {
                    this.actionsInstructions.innerHTML = _lexicon.actionsInstructions;
                }
            },
            /**
             * Reset any widgets that retain state between client logins.
             */
            _resetApplicationWidgets: function() {
                // we are just resetting the date spinners at the moment, if there is a need
                // for something more complicated involving registering resettable widgets then
                // we will cross that bridge when we come to it
                registry.byId("leaveRange").resetDateSpinners();
            },
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });