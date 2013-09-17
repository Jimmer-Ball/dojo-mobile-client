/**
 * Authorisation of leave requests main display holding:-
 *
 * 1) A widget that allows you to change the leave type selected and so filter the list of leave requests displayed.
 *    Note we come setup with an extra type of "All" which we've manufactured to allow a user to display all leave
 *    requests.
 * 2) A widget that allows you to bulk select/deselect the displayed leave requests.
 * 3) A widget that allows you to individually select/deselect a particular leave request.
 * 4) A transition on each displayed leave request list item that allows you to move to an individual leave request,
 *    add in some comments and then authorise or reject that leave request individually.
 * 5) An authorise button to allow bulk authorisation of selected leave requests.
 * 6) A reject button to allow bulk rejection of selected leave requests.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/authorisation/leave/ChooseLeaveTypeListItem",
    "mobilehr/widgets/authorisation/leave/AuthorisationLeaveRequestsListItem",
    "mobilehr/widgets/authorisation/NoAuthorisationItemsToDisplayItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper,
              ChooseLeaveTypeListItem, AuthorisationLeaveRequestsListItem, NoAuthorisationItemsToDisplayItem) {
        return declare("mobilehr.widgets.authorisation.leave.AuthorisationLeaveRequestsView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.backDestination = null;
                    this.leaveRequestsLeftToProcess = null;
                    this.chosenLeaveType = null;
                    this.authorisationLeaveRequestsHeading = null;
                    this.authorisationLeaveRequestsTitle = null;
                    this.authorisationLeaveRequestsInstructions = null;
                    this.chooseLeaveTypeList = null;
                    this.authorisationLeaveRequestsList = null;
                    this.bulkAuthoriseLeaveButton = null;
                    this.bulkRejectLeaveButton = null;
                    this._subscriptions = [];
                    this.selectedLeaveRequests = [];
                    this.confirmationDialog = null;
                    this.messageDialog = null;
                    this.gotUnprocessedRequests = null;
                    this.displayedRequestItems = [];
                },
                /**
                 * Get handles on the widgets, and set the default back destination to be "actions" and the default choice of
                 * leave types applied via the chooseTypeWidget to be "All" leave types.
                 */
                startup:function () {
                    this.inherited(arguments);
                    this.authorisationLeaveRequestsHeading = registry.byId("authorisationLeaveRequestsHeading");
                    this.authorisationLeaveRequestsHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.authorisationLeaveRequestsHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.authorisationLeaveRequestsTitle = this.$("authorisationLeaveRequestsTitle");
                    this.authorisationLeaveRequestsTitle.innerHTML = _lexicon.authorisationLeaveRequestsTitle;
                    this.authorisationLeaveRequestsInstructions = this.$("authorisationLeaveRequestsInstructions");
                    this.authorisationLeaveRequestsInstructions.innerHTML = _lexicon.authorisationLeaveRequestsInstructions;
                    this.chooseLeaveTypeList = registry.byId("chooseLeaveTypeList");
                    this.authorisationLeaveRequestsList = registry.byId("authorisationLeaveRequestsList");
                    this.bulkAuthoriseLeaveButton = registry.byId("bulkAuthoriseLeaveButton");
                    this.bulkAuthoriseLeaveButton._setLabelAttr(_lexicon.bulkAuthoriseLeaveButton);
                    this.bulkRejectLeaveButton = registry.byId("bulkRejectLeaveButton");
                    this.bulkRejectLeaveButton._setLabelAttr(_lexicon.bulkRejectLeaveButton);
                    this.confirmationDialog = registry.byId("confirmationDialog");
                    this.messageDialog = registry.byId("messageDialog");
                    // connect back button to our _backClicked function rather than the whole header
                    this._subscriptions.push(connect.connect(this.authorisationLeaveRequestsHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.bulkAuthoriseLeaveButton.domNode, "onclick", lang.hitch(this, "_authoriseClicked")));
                    this._subscriptions.push(connect.connect(this.bulkRejectLeaveButton.domNode, "onclick", lang.hitch(this, "_rejectClicked")));
                    this.backDestination = "actions";
                    this.chosenLeaveType = this.getAllLeaveType();
                },
                /**
                 * Create initial content for the view as called from ChooseDataTypeItem showing all leave requests
                 *
                 * @param leaveRequests list of leave requests
                 * @param backDestination where a user should navigate back to from this view
                 */
                createContent:function (leaveRequests, backDestination) {
                    this.gotUnprocessedRequests = true;
                    this.displayedRequestItems = [];
                    this.backDestination = backDestination;
                    this.leaveRequestsLeftToProcess = leaveRequests;
                    this.chosenLeaveType = this.getAllLeaveType();
                    this.clearListWidget(this.chooseLeaveTypeList);
                    this.chooseLeaveTypeList.addChild(new ChooseLeaveTypeListItem({parentView:this, chosenLeaveType:this.chosenLeaveType}));
                    this.clearListWidget(this.authorisationLeaveRequestsList);
                    array.forEach(this.leaveRequestsLeftToProcess.sort(this._sortRequestsByOldestSubmissionDateFirst), function (leaveRequest) {
                        this.displayedRequestItems.push({leaveRequest:leaveRequest, itemSelected:true});
                        this.authorisationLeaveRequestsList.addChild(new AuthorisationLeaveRequestsListItem({parentView:this,
                            chosenLeaveType:this.chosenLeaveType, leaveRequest:leaveRequest, itemSelected:true}));
                    }, this);
                },
                /**
                 * Remove leave requests both from the list of leave requests left to process and the list of leave
                 * requests displayed awaiting authorisation.
                 *
                 * @param leaveRequests processed
                 */
                removeLeaveRequests:function (leaveRequests) {
                    array.forEach(leaveRequests, function (leaveRequest) {
                        this.removeLeaveRequest(leaveRequest);
                    }, this);
                },
                /**
                 * Remove a leave request both from the list of leave requests left to process and the list of leave
                 * requests displayed awaiting authorisation. If there are no children on display left, and there are
                 * no more leave request authorisations to process we display the "no requests to authorise" item.
                 *
                 * @param leaveRequest to remove
                 */
                removeLeaveRequest:function (leaveRequest) {
                    this.removeFromLeaveRequestsLeftToProcess(leaveRequest);
                    this.removeFromDisplay(leaveRequest);
                    if (this.authorisationLeaveRequestsList.hasChildren() === false) {
                        if (this.leaveRequestsLeftToProcess.length === 0) {
                            this.gotUnprocessedRequests = false;
                            this.authorisationLeaveRequestsList.addChild(new NoAuthorisationItemsToDisplayItem());
                        }
                    }
                },
                /**
                 * Remove leave request from array of leave requests left to process given input leave request. Note
                 * when removing elements from a JS array, you have to go "backwards" down the array.
                 *
                 * @param leaveRequest to remove from leave requests left to process
                 */
                removeFromLeaveRequestsLeftToProcess:function (leaveRequest) {
                    for (var i = this.leaveRequestsLeftToProcess.length-1; i >= 0; i--){
                        var item = this.leaveRequestsLeftToProcess[i];
                        if (item.uuid === leaveRequest.uuid) {
                            this.leaveRequestsLeftToProcess.splice(i, 1);
                        }
                    }
                },
                /**
                 * Remove leave request from display
                 *
                 * @param leaveRequest to remove from displayed authorisations
                 */
                removeFromDisplay:function (leaveRequest) {
                    array.forEach(this.authorisationLeaveRequestsList.getChildren(), function (child) {
                        if (child.leaveRequest.uuid === leaveRequest.uuid) {
                            this.authorisationLeaveRequestsList.removeChild(child);
                        }
                    }, this);
                    for (var i = this.displayedRequestItems.length-1; i >= 0; i--){
                        var item = this.displayedRequestItems[i];
                        if (item.leaveRequest.uuid === leaveRequest.uuid) {
                            this.displayedRequestItems.splice(i, 1);
                        }
                    }
                },
                /**
                 * Filter the displayed authorisation list according to the chosen leave type.  If not dealing with ALL,
                 * first remove children not of the chosen type from our display proxy list and then add requests yet to
                 * be processed to the display proxy list if they match our type and set the default selection status
                 * of the item to true.  If dealing with ALL, add all "yet to be processed" requests to the display
                 * proxy list.  Finally, remove the current selection list and add children in submission order, oldest
                 * first, and amend the displayed type on the leave type choice widget.
                 *
                 * @param chosenLeaveType chosen leave type
                 */
                filterAuthorisationsAccordingToLeaveType:function (chosenLeaveType) {
                    var notOnDisplay = this.getLeaveRequestsNotOnDisplay();
                    if (chosenLeaveType.uuid !== this.ALL_LEAVE_TYPE_UUID) {
                        // Remove items not of the chosen type
                        for (var i = this.displayedRequestItems.length-1; i >= 0; i--){
                            var item = this.displayedRequestItems[i];
                            if (item.leaveRequest.leaveType.uuid !== chosenLeaveType.uuid) {
                                this.displayedRequestItems.splice(i, 1);
                            }
                        }
                        // For items not currently on display, add them if their leave type matches the choice
                        array.forEach(notOnDisplay, function (leaveRequest) {
                            if (leaveRequest.leaveType.uuid === chosenLeaveType.uuid) {
                                this.displayedRequestItems.push({leaveRequest:leaveRequest, itemSelected:true});
                            }
                        }, this);
                    } else {
                        // If its not on display yet, it should be
                        array.forEach(notOnDisplay, function (leaveRequest) {
                            this.displayedRequestItems.push({leaveRequest:leaveRequest, itemSelected:true});
                        }, this);
                    }
                    this.clearListWidget(this.authorisationLeaveRequestsList);
                    array.forEach(this.displayedRequestItems.sort(this._sortProxyItemsByOldestSubmissionDateFirst), function (proxyItem) {
                        this.authorisationLeaveRequestsList.addChild(new AuthorisationLeaveRequestsListItem({parentView:this,
                            chosenLeaveType:chosenLeaveType, leaveRequest:proxyItem.leaveRequest, itemSelected:proxyItem.itemSelected}));
                    }, this);
                    this.chooseLeaveTypeList.getChildren()[0].amendChosenLeaveType(chosenLeaveType);
                    this.chosenLeaveType = chosenLeaveType;
                },
                /**
                 * Get the leave requests still to process that are not on display
                 */
                getLeaveRequestsNotOnDisplay:function () {
                    var notOnDisplay = [];
                    array.forEach(this.leaveRequestsLeftToProcess, function (leaveRequest) {
                        var requestDisplayed = false;
                        for (var i = 0; i < this.displayedRequestItems.length; i += 1) {
                            var item = this.displayedRequestItems[i];
                            if (item.leaveRequest.uuid === leaveRequest.uuid) {
                                requestDisplayed = true;
                                break;
                            }
                        }
                        if (!requestDisplayed) {
                            notOnDisplay.push(leaveRequest);
                        }
                    }, this);
                    return notOnDisplay;
                },

                /**
                 * Called from the ChooseLeaveTypeItem widget to allow us to toggle the selection of the child leave
                 * request list items.
                 *
                 * @param allSelected  true if all children should be selected, false otherwise
                 */
                toggleChildren:function (allSelected) {
                    if (this.gotUnprocessedRequests === true) {
                        array.forEach(this.authorisationLeaveRequestsList.getChildren(), function (child) {
                            child.toggleSelection(allSelected);
                        }, this);
                    }
                },
                /**
                 * Amend the selection status of a given displayedRequestItem
                 *
                 * @param leaveRequest
                 * @param itemSelected
                 */
                toggleSelectionStatus:function (leaveRequest, itemSelected) {
                    for (var i = 0; i < this.displayedRequestItems.length; i += 1) {
                        var item = this.displayedRequestItems[i];
                        if (item.leaveRequest.uuid === leaveRequest.uuid) {
                            item.itemSelected = itemSelected;
                        }
                    }
                },
                /**
                 * Called from the ChooseLeaveTypeItem widget to see if there are any unprocessed requests left
                 */
                gotUnProcessedRequests:function () {
                    return this.gotUnprocessedRequests;
                },
                /**
                 * Called from any child needing to get hold of the list of leave requests left to process
                 */
                getLeaveRequestsLeftToProcess:function () {
                    return this.leaveRequestsLeftToProcess;
                },

                /**
                 * We navigate back to the action view from here, as once we are done, we want the back-end to catch up
                 * (process some of our actions).  So we go back to action view, and make a user choose "Authorisations"
                 * again if they want to do more authorisations which trips the REST call to the API, so refreshes our
                 * list of authorisations the client works with.
                 */
                _backClicked:function () {
                    if (this.backDestination) {
                        this.authorisationLeaveRequestsHeading.goTo(this.backDestination, this.authorisationLeaveRequestsHeading.href);
                    } else {
                        this.authorisationLeaveRequestsHeading.goTo("actions", this.authorisationLeaveRequestsHeading.href);
                    }
                },
                /**
                 * When authorise is clicked, make sure we've got some leave requests to authorise and if we do, provide
                 * the user a confirmation dialog and continue, otherwise let the user know nothing is selected.
                 */
                _authoriseClicked:function () {
                    this.selectedLeaveRequests = this._whatRequestsAreSelected();
                    if (this.selectedLeaveRequests.length > 0) {
                        this.confirmationDialog.show(_lexicon.dialogConfirmationTitle,
                            _lexicon.confirmLeaveRequestsAuthorise,
                            _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                            lang.hitch(this, "_confirmedAuthorisation"),
                            lang.hitch(this, "_cancelledAuthorisation"));
                    } else {
                        this.messageDialog.show(_lexicon.dialogInformationTitle,
                            _lexicon.noLeaveRequestsAuthoriseSelected,
                            _lexicon.dialogConfirmationButtonLabel);
                    }
                },
                /**
                 * When reject is clicked, make sure we've got some leave requests to reject and if we do, provide
                 * the user a confirmation dialog and continue, otherwise let the user know nothing is selected.
                 */
                _rejectClicked:function () {
                    this.selectedLeaveRequests = this._whatRequestsAreSelected();
                    if (this.selectedLeaveRequests.length > 0) {
                        this.confirmationDialog.show(_lexicon.dialogConfirmationTitle,
                            _lexicon.confirmLeaveRequestsReject,
                            _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                            lang.hitch(this, "_confirmedRejection"),
                            lang.hitch(this, "_cancelledRejection"));
                    } else {
                        this.messageDialog.show(_lexicon.dialogInformationTitle,
                            _lexicon.noLeaveRequestsRejectSelected,
                            _lexicon.dialogConfirmationButtonLabel);
                    }
                },
                /**
                 * Send the set of authorisation actions off to the API given the selected requests
                 */
                _confirmedAuthorisation:function () {
                    var authorisations = [];
                    array.forEach(this.selectedLeaveRequests, function (leaveRequest) {
                        authorisations.push(this.getLeaveRequestAuthStructure(leaveRequest.uuid,
                            this.getUTCTimestamp(),
                            null));
                    }, this);
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_sentAuthorisations"));
                    _resourceController.doCreate(this.getLeaveRequestAuthorisationsStructure(authorisations),
                        "services/mobile/actions/leaveRequests/authorise");
                },
                _cancelledAuthorisation:function () {
                },
                /**
                 * Send the set of rejection actions off to the API given the selected requests
                 */
                _confirmedRejection:function () {
                    var rejections = [];
                    array.forEach(this.selectedLeaveRequests, function (leaveRequest) {
                        rejections.push(this.getLeaveRequestAuthStructure(leaveRequest.uuid,
                            this.getUTCTimestamp(),
                            null));
                    }, this);
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_sentRejections"));
                    _resourceController.doCreate(this.getLeaveRequestRejectionsStructure(rejections),
                        "services/mobile/actions/leaveRequests/reject");
                },
                _cancelledRejection:function () {
                },
                /**
                 * After we've sent our authorisation actions we need to either indicate an error or tidy up our list
                 * of displayed authorisations, removing those processed by the API.
                 */
                _sentAuthorisations:function () {
                    switch(_resourceController.responseCode) {
                        case 201 :
                            var actionsProcessed = _resourceController.responseData;
                            this.removeLeaveRequests(actionsProcessed.authoriseLeaveRequestActions);
                            break;
                        case 401 :
                            this.authorisationLeaveRequestsHeading.goTo("login", this.authorisationLeaveRequestsHeading.href);
                            break;
                        default :
                            this.displayServiceErrorDialog(_lexicon.dialogErrorTitle,_lexicon.dialogConfirmationButtonLabel, this.messageDialog, null);
                            break;
                    }
                },
                /**
                 * After we've sent our rejection actions we need to either indicate an error or tidy up our list
                 * of displayed authorisations, removing those processed by the API.
                 */
                _sentRejections:function () {
                    switch(_resourceController.responseCode) {
                        case 201 :
                            var actionsProcessed = _resourceController.responseData;
                            this.removeLeaveRequests(actionsProcessed.rejectLeaveRequestActions);
                            break;
                        case 401 :
                            this.authorisationLeaveRequestsHeading.goTo("login", this.authorisationLeaveRequestsHeading.href);
                            break;
                        default :
                            this.displayServiceErrorDialog(_lexicon.dialogErrorTitle,_lexicon.dialogConfirmationButtonLabel, this.messageDialog, null);
                            break;
                    }
                },
                /**
                 * Determine what request in the current list are selected
                 *
                 * @return selected requests
                 */
                _whatRequestsAreSelected:function () {
                    var selectedLeaveRequests = [];
                    array.forEach(this.authorisationLeaveRequestsList.getChildren(), function (child) {
                        if (child.itemSelected && child.itemSelected === true) {
                            selectedLeaveRequests.push(child.leaveRequest);
                        }
                    }, this);
                    return selectedLeaveRequests;
                },
                /**
                 * Lexicographical sort the two input leave requests according to their submisision date, oldest first.
                 * Oldest means lowest submission date first.  If you ever want to re-order this with newest first, then
                 * switch the -1 and 1 values.
                 *
                 * @param leaveRequestA leave request A
                 * @param leaveRequestB leave request B
                 * @return 0 if equal, -1 if a<b, and 1 if a>b (so oldest first)
                 */
                _sortRequestsByOldestSubmissionDateFirst:function (leaveRequestA, leaveRequestB) {
                    if (leaveRequestA.submissionDate === leaveRequestB.submissionDate) return 0;
                    return leaveRequestA.submissionDate < leaveRequestB.submissionDate ? -1 : 1;
                },
                /**
                 * Lexicographical sort the two input leave request display proxy item according to their submission
                 * date, oldest first. Oldest means lowest submission date first.  If you ever want to re-order this
                 * with newest first, then switch the -1 and 1 values.
                 *
                 * @param proxyItemA proxyItem A
                 * @param proxyItemB proxyItem B
                 * @return 0 if equal, -1 if a<b, and 1 if a>b (so oldest first)
                 */
                _sortProxyItemsByOldestSubmissionDateFirst:function (proxyItemA, proxyItemB) {
                    if (proxyItemA.leaveRequest.submissionDate === proxyItemB.leaveRequest.submissionDate) return 0;
                    return proxyItemA.leaveRequest.submissionDate < proxyItemB.leaveRequest.submissionDate ? -1 : 1;
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });