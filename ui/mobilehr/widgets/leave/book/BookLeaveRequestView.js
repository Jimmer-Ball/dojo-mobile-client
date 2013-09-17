/**
 * Book leave request view holding:-
 *
 * 1) Full form details for our intrepid user to complete whose content completely depends on the entitlement
 *    structure.
 * 3) Submit button to allow submission of the new leave request via REST API.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/TransitionEvent", "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper", "mobilehr/widgets/utils/time/ChooseTimeListItem",
    "mobilehr/widgets/requiredFields/ChooseRequiredFieldOptionListItem",
    "mobilehr/widgets/leave/book/ChooseLeaveBookingTypeListItem",
    "mobilehr/widgets/leave/book/sameDay/ChooseLeaveBookingTypeSameDayListItem"],
    function (declare, lang, array, connect, registry, TransitionEvent, ScrollableView, WidgetHelper,
              RepresentationHelper, ChooseTimeListItem, ChooseRequiredFieldOptionListItem, ChooseLeaveBookingTypeListItem,
              ChooseLeaveBookingTypeSameDayListItem) {
        return declare("mobilehr.widgets.leave.book.BookLeaveRequestView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                leaveDetailsTemplate:'<table width="100%"><tbody>${content}</tbody></table>',
                leaveDetailsItemTemplate:'<tr><td valign="top"><span style="font-weight:bold;">' +
                    '${label}</span></td><td align="right"><span>${value}</span></td></tr>',
                constructor:function () {
                    this.bookLeaveRequestHeading = null;
                    this.bookLeaveRequestInstructions = null;
                    this.bookLeaveRequestDisplayDetails = null;
                    this.bookLeaveRequestOptions = null;
                    this.submitLeaveButton = null;
                    this.confirmationDialog = null;
                    this.messageDialog = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    this.transitionOptions = null;
                    this.entitlement = null;
                    this.startDate = null;
                    this.endDate = null;
                    this.startLeaveBookingTypeList = null;
                    this.endLeaveBookingTypeList = null;
                    this.sameDayLeaveBookingTypeList = null;
                    this.startLeaveBookingTypeItem = null;
                    this.endLeaveBookingTypeItem = null;
                    this.sameDayLeaveBookingTypeItem = null;
                    this.requiredFieldChooserLists = [];
                    this.requiredFieldChooserWidgetIds = [];
                    this.actionFields = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.bookLeaveRequestHeading = registry.byId("bookLeaveRequestHeading");
                    this.bookLeaveRequestHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.bookLeaveRequestHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.bookLeaveRequestInstructions = this.$("bookLeaveRequestInstructions");
                    this.bookLeaveRequestInstructions.innerHTML = _lexicon.bookLeaveRequestInstructions;
                    this.bookLeaveRequestDisplayDetails = this.$("bookLeaveRequestDisplayDetails");
                    this.bookLeaveRequestOptions = this.$("bookLeaveRequestOptions");
                    this.submitLeaveButton = registry.byId("submitLeaveButton");
                    this.submitLeaveButton._setLabelAttr(_lexicon.bookLeaveSubmitButton);
                    this.confirmationDialog = registry.byId("confirmationDialog");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.bookLeaveRequestHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.submitLeaveButton.domNode, "onclick", lang.hitch(this, "_submitClicked")));
                },
                /**
                 * Display the know un-editable leave details, and then dynamically add leave booking type chooser
                 * widgets to the parent DIV bookLeaveRequestOptions if the entitlement demands it, and add required
                 * field chooser widgets if the entitlement needs required fields.
                 *
                 * @param entitlement entitlement to book against
                 * @param startDate start date of leave in yyyy-MM-dd format (e.g. 2012-07-03)
                 * @param endDate   end date of leave (e.g. 2012-07-04)
                 * @param backDestination back destination
                 */
                createContent:function (entitlement, startDate, endDate, backDestination) {
                    this.entitlement = entitlement;
                    this.startDate = startDate;
                    this.endDate = endDate;
                    this.backDestination = backDestination;
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                    this.bookLeaveRequestDisplayDetails.innerHTML = this._formatLeaveDetails();
                    this.actionFields = [];
                    this._removeLeaveBookingTypeChooserLists();
                    this._removeRequiredFieldChooserLists();
                    var bookingTypes = this.getBookingTypes();
                    if (bookingTypes !== null) {
                        this._addLeaveBookingTypeChooserLists(bookingTypes);
                    }
                    if (this.entitlement.requiredFieldMappings.length > 0) {
                        this._addRequiredFieldChooserLists();
                    }
                },
                /**
                 * Navigate back to either LeaveEntitlementGroupsView or LeaveEntitlementView.
                 */
                _backClicked:function () {
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                /**
                 * Get the user to confirm submission of leave
                 */
                _submitClicked:function () {
                    this.confirmationDialog.show(_lexicon. dialogConfirmationTitle,
                                                 _lexicon.bookLeaveConfirmSubmission,
                        _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                        lang.hitch(this, "_confirmedSubmission"),
                        lang.hitch(this, "_cancelled"));
                },
                /**
                 * Get the known leave details, and the settings from the leave booking type chooser widgets, and from
                 * the required field widgets as required.
                 */
                _confirmedSubmission:function () {
                    var startDayType = "FULL";
                    var endDayType = "FULL";
                    var startTime = null;
                    var endTime = null;
                    if (this.startLeaveBookingTypeItem !== null) {
                        startDayType = this.startLeaveBookingTypeItem.getChosenType();
                        if (this.startLeaveBookingTypeItem.getChosenType() === "TIME") {
                            startTime = this.startLeaveBookingTypeItem.provideAPITimeString();
                        }
                    }
                    if (this.endLeaveBookingTypeItem !== null) {
                        endDayType = this.endLeaveBookingTypeItem.getChosenType();
                        if (this.endLeaveBookingTypeItem.getChosenType() === "TIME") {
                            endTime = this.endLeaveBookingTypeItem.provideAPITimeString();
                        }
                    }
                    if (this.sameDayLeaveBookingTypeItem !== null) {
                        startDayType = this.sameDayLeaveBookingTypeItem.getChosenType();
                        endDayType = startDayType;
                        if (this.sameDayLeaveBookingTypeItem.getChosenType() === "TIME") {
                            startTime = this.sameDayLeaveBookingTypeItem.getStartAPITimeString();
                            endTime = this.sameDayLeaveBookingTypeItem.getEndAPITimeString();
                        }
                    }
                    array.forEach(this.requiredFieldChooserWidgetIds, function (widgetId) {
                        var chosenDetails = registry.byId(widgetId).getChosenDetails();
                        this.actionFields.push(this.getActionField(chosenDetails.requiredField.uuid, chosenDetails.chosenOption.uuid));
                    }, this);
                    var leaveRequestSubmission = this.getLeaveRequestCreateActionStructure(this.getUTCTimestamp(),
                        this.entitlement.uuid, this.startDate, this.endDate, startDayType, endDayType, startTime,
                        endTime, null, this.actionFields);
                    _resourceController.registerPostCreateCallback(lang.hitch(this, "_submittedLeaveRequest"));
                    _resourceController.doCreate(leaveRequestSubmission, "services/mobile/actions/leaveRequest/create");
                },
                /**
                 * If we cancel simply navigate back a view
                 */
                _cancelled:function () {
                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                },
                /**
                 * If we successfully submitted our leave request, navigate back to LeaveRangeView. If we got a 401 go
                 * back to the login view, and if we got anything else display an error dialog.
                 */
                _submittedLeaveRequest:function () {
                    switch(_resourceController.responseCode) {
                        case 201 :
                            this.transitionOptions = {moveTo:"leaveRange", href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                            new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
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
                 * Format the known leave request details which are simply displayed containing the start date
                 * and perhaps the end date (depending on whether they are the same day or not), and the leave
                 * type name.
                 */
                _formatLeaveDetails:function () {
                    var leaveDetails = "";
                    var startDate = this.convertToDateOnly(this.startDate);
                    var endDate = this.convertToDateOnly(this.endDate);
                    if (endDate && endDate !== startDate) {
                        leaveDetails = [this.substitute(this.leaveDetailsItemTemplate, {label:_lexicon.bookLeaveStartDateLabel, value:this.translateToFullDateString(this.startDate)}),
                            this.substitute(this.leaveDetailsItemTemplate, {label:_lexicon.bookLeaveEndDateLabel, value:this.translateToFullDateString(this.endDate)}),
                            this.substitute(this.leaveDetailsItemTemplate, {label:_lexicon.bookLeaveLeaveType, value:this.entitlement.leaveType.leaveTypeName})
                        ].join("");
                    } else {
                        leaveDetails = [this.substitute(this.leaveDetailsItemTemplate, {label:_lexicon.bookLeaveSameDateLabel, value:this.translateToFullDateString(this.startDate)}),
                            this.substitute(this.leaveDetailsItemTemplate, {label:_lexicon.bookLeaveLeaveType, value:this.entitlement.leaveType.leaveTypeName})
                        ].join("");
                    }
                    return this.substitute(this.leaveDetailsTemplate, {content:leaveDetails});
                },
                /**
                 * Add the chooser list widgets for the start and end day booking types, as according to
                 * the entitlement being booked against they are required.
                 *
                 * @param bookingTypes what booking types should be displayed on the chooser widgets
                 *        given the entitlement
                 */
                _addLeaveBookingTypeChooserLists:function (bookingTypes) {
                    if (this.startDate !== this.endDate) {
                        this.startLeaveBookingTypeList = this.createListWidget("startLeaveBookingTypeList");
                        var startDayBookingTypes = this._filterBookingTypes(bookingTypes, "AM");
                        this.startLeaveBookingTypeItem = new ChooseLeaveBookingTypeListItem({
                            id:this.startLeaveBookingTypeList + "_listItem",
                            bookingTypes:startDayBookingTypes,
                            chosenType:startDayBookingTypes[0],
                            parentView:"bookLeaveRequest",
                            instructions:_lexicon.bookLeaveChooseStartDay,
                            destinationView:"chooseStartLeaveBookingType",
                            hours:9,
                            minutes:0});
                        this.startLeaveBookingTypeList.addChild(this.startLeaveBookingTypeItem);
                        this.endLeaveBookingTypeList = this.createListWidget("endLeaveBookingTypeList");
                        var endDayBookingTypes = this._filterBookingTypes(bookingTypes, "PM");
                        this.endLeaveBookingTypeItem = new ChooseLeaveBookingTypeListItem({
                            id:this.endLeaveBookingTypeList + "_listItem",
                            bookingTypes:endDayBookingTypes,
                            chosenType:endDayBookingTypes[0],
                            parentView:"bookLeaveRequest",
                            instructions:_lexicon.bookLeaveChooseEndDay,
                            destinationView:"chooseEndLeaveBookingType",
                            hours:17,
                            minutes:0});
                        this.endLeaveBookingTypeList.addChild(this.endLeaveBookingTypeItem);
                        this.startLeaveBookingTypeList.placeAt("bookLeaveRequestOptions", "last");
                        this.endLeaveBookingTypeList.placeAt("bookLeaveRequestOptions", "last");
                        this.startLeaveBookingTypeList.startup();
                        this.endLeaveBookingTypeList.startup();
                    } else {
                        this.sameDayLeaveBookingTypeList = this.createListWidget("sameDayLeaveBookingTypeList");
                        this.sameDayLeaveBookingTypeItem = new ChooseLeaveBookingTypeSameDayListItem({
                            id:this.sameDayLeaveBookingTypeList + "_listItem",
                            bookingTypes:bookingTypes,
                            chosenType:bookingTypes[0],
                            parentView:"bookLeaveRequest",
                            instructions:_lexicon.bookLeaveChooseSameDay,
                            destinationView:"chooseSameDayLeaveBookingType",
                            startHours:9,
                            startMinutes:0,
                            endHours:17,
                            endMinutes:0});
                        this.sameDayLeaveBookingTypeList.addChild(this.sameDayLeaveBookingTypeItem);
                        this.sameDayLeaveBookingTypeList.placeAt("bookLeaveRequestOptions", "last");
                        this.sameDayLeaveBookingTypeList.startup();
                    }
                },
                /**
                 * Decide on the booking types the user can choose from given the entitlement details
                 *
                 * @return full days and time booking types if we are dealing with PART, AM, PM and full days if
                 * we are only dealing with HALF day precision, and null if we are only dealing with an entitlement
                 * that allows FULL days.
                 */
                getBookingTypes:function () {
                    if (this.entitlement.bookingType === "PART") {
                        return ["FULL", "TIME"];
                    } else {
                        if (this.entitlement.bookingType === "HALF") {
                            return ["FULL", "AM", "PM"];
                        } else {
                            return null;
                        }
                    }
                },
                /**
                 * Remove the specified type from the list of booking types if present.
                 *
                 * @param   bookingTypes the list of permissible booking types based on the leave
                 *          entitlement
                 */
                _filterBookingTypes:function (bookingTypes, typeToRemove) {
                    var filteredBookingTypes = new Array();
                    if (this.startDate !== this.endDate) {
                        array.forEach(bookingTypes, function (type) {
                            if (type !== typeToRemove) {
                                filteredBookingTypes.push(type);
                            }
                        }, this);
                    }
                    return filteredBookingTypes;
                },
                /**
                 * Programmatically create required field chooser widgets and add them to parent lists that are
                 * attached to the simple DOM placeholder identified by "bookLeaveRequestOptions" and start them
                 * all up so they display correctly and have the requisite dynamic behaviour.  Note we keep
                 * a note of our requiredFieldChooserLists for when we need to clean them up.
                 */
                _addRequiredFieldChooserLists:function () {
                    array.forEach(this.entitlement.requiredFieldMappings.sort(this._sortRequiredFieldsBySequenceReverse), function (requiredFieldMapping) {
                        var parentList = this.createListWidget(requiredFieldMapping.requiredField.uuid);
                        var childChooser = new ChooseRequiredFieldOptionListItem({
                            id:[requiredFieldMapping.requiredField.uuid, "_chooser"].join(""),
                            requiredField:requiredFieldMapping.requiredField,
                            destinationView:"requiredFieldOptions",
                            destinationViewOnBack:"bookLeaveRequest"});
                        parentList.addChild(childChooser);
                        this.requiredFieldChooserLists.push(parentList);
                        this.requiredFieldChooserWidgetIds.push([requiredFieldMapping.requiredField.uuid, "_chooser"].join(""));
                        if (requiredFieldMapping.position === "BOTTOM") {
                            parentList.placeAt("bookLeaveRequestOptions", "last");
                        } else {
                            parentList.placeAt("bookLeaveRequestOptions", "first");
                        }
                        parentList.startup();
                    }, this);
                },
                /**
                 * Remove any of the required field list widgets on the view
                 */
                _removeRequiredFieldChooserLists:function () {
                    if (this.requiredFieldChooserLists !== null && this.requiredFieldChooserLists.length > 0) {
                        array.forEach(this.requiredFieldChooserLists, function (chooserWidget) {
                            chooserWidget.destroyRecursive();
                        }, this);
                    }
                    this.requiredFieldChooserLists = [];
                    this.requiredFieldChooserWidgetIds = [];
                },
                /**
                 * Remove the start, end, and same day leave booking type list widgets if they exist
                 */
                _removeLeaveBookingTypeChooserLists:function () {
                    if (this.startLeaveBookingTypeList !== null) {
                        this.startLeaveBookingTypeList.destroyRecursive();
                        this.startLeaveBookingTypeList = null;
                        this.startLeaveBookingTypeItem = null;
                    }
                    if (this.endLeaveBookingTypeList !== null) {
                        this.endLeaveBookingTypeList.destroyRecursive();
                        this.endLeaveBookingTypeList = null;
                        this.endLeaveBookingTypeItem = null;
                    }
                    if (this.sameDayLeaveBookingTypeList !== null) {
                        this.sameDayLeaveBookingTypeList.destroyRecursive();
                        this.sameDayLeaveBookingTypeList = null;
                        this.sameDayLeaveBookingTypeItem = null;
                    }
                },
                /**
                 * Sort a pair of requiredFieldMappings via their sequence property. As we use this function
                 * to append required fields to the DOM we use the reverse so that items with a larger sequence
                 * value are added first.
                 *
                 * @param fieldA a requiredFieldMapping
                 * @param fieldB a requiredFieldMapping
                 */
                _sortRequiredFieldsBySequenceReverse: function(fieldA, fieldB) {
                    try {
                        // sort the fields based on their sequence property
                        return fieldB.sequence - fieldA.sequence;
                    } catch(e) {
                        // if there isn't a sequence available on the objects we are comparing
                        // refer to the items as equal
                        return 0;
                    }
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this._removeLeaveBookingTypeChooserLists();
                    this._removeRequiredFieldChooserLists();
                    this.inherited(arguments);
                }
            });
    });