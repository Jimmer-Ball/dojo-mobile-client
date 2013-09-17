/**
 * Provide the list of booking type items that are applicable for a same day's leave request given the entitlement
 * passed in.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper", "mobilehr/widgets/leave/book/sameDay/LeaveBookingTypeSameDayListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, TransitionEvent, WidgetHelper,
              RepresentationHelper, LeaveBookingTypeSameDayListItem) {
        return declare("mobilehr.widgets.leave.book.sameDay.ChooseSameDayLeaveBookingTypeView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.relatedListItemId = null;
                    this.bookingTypes = null;
                    this.chosenType = null;
                    this.instructions = null;
                    this.backDestination = null;
                    this.transitionOptions = null;
                    this.chooseSameDayLeaveBookingTypeHeading = null;
                    this.chooseSameDayLeaveBookingTypeInstructions = null;
                    this.chooseSameDayLeaveBookingTypeList = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.chooseSameDayLeaveBookingTypeHeading = registry.byId("chooseSameDayLeaveBookingTypeHeading");
                    this.chooseSameDayLeaveBookingTypeHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.chooseSameDayLeaveBookingTypeHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.chooseSameDayLeaveBookingTypeInstructions = this.$("chooseSameDayLeaveBookingTypeInstructions");
                    this.chooseSameDayLeaveBookingTypeInstructions.innerHTML = _lexicon.chooseSameDayLeaveBookingTypeInstructions;
                    this.chooseSameDayLeaveBookingTypeList = registry.byId("chooseSameDayLeaveBookingTypeList");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.chooseSameDayLeaveBookingTypeHeading.get("backButton"), "onclick",
                        lang.hitch(this, "_backClicked")));
                },
                /**
                 * Create content
                 *
                 * @param relatedListItemId related list item that called this view
                 * @param bookingTypes booking types
                 * @param chosenType chosen type
                 * @param instructions  instructions
                 * @param backDestination back destination
                 * @param startHours start hours
                 * @param startMinutes start minutes
                 * @param endHours end hours
                 * @param endMinutes end minutes
                 */
                createContent:function (relatedListItemId, bookingTypes, chosenType, instructions, backDestination, startHours, startMinutes, endHours, endMinutes) {
                    this.relatedListItemId = relatedListItemId;
                    this.bookingTypes = bookingTypes;
                    this.chosenType = chosenType;
                    this.instructions = instructions;
                    this.backDestination = backDestination;
                    this.startHours = startHours;
                    this.startMinutes = startMinutes;
                    this.endHours = endHours;
                    this.endMinutes = endMinutes;
                    this.chooseSameDayLeaveBookingTypeInstructions.innerHTML = this.instructions;
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};
                    this.clearListWidget(this.chooseSameDayLeaveBookingTypeList);
                    array.forEach(this.bookingTypes, function (bookingType) {
                        this._addItemsOfType(bookingType, this.chosenType === bookingType, startHours, startMinutes, endHours, endMinutes);
                    }, this);
                },
                /**
                 * Add items of type. We add two time choosers (start and end) and one for each of the other types
                 *
                 * @param bookingType booking type
                 * @param isSelected is selected
                 * @param startHours start hours
                 * @param startMinutes start minutes
                 * @param endHours end hours
                 * @param endMinutes end minutes
                 */
                _addItemsOfType:function (bookingType, isSelected, startHours, startMinutes, endHours, endMinutes) {
                    if (bookingType === "TIME") {
                        // Add two items one for start time and one for end time
                        this.chooseSameDayLeaveBookingTypeList.addChild(
                            new LeaveBookingTypeSameDayListItem({
                                timeType:"start",
                                bookingType:bookingType,
                                backDestination:"chooseSameDayLeaveBookingType",
                                instructions:_lexicon.leaveBookingTypeSameDayStartTimeInstructions,
                                isSelected:isSelected,
                                hours:startHours,
                                minutes:startMinutes}));
                        this.chooseSameDayLeaveBookingTypeList.addChild(
                            new LeaveBookingTypeSameDayListItem({
                                timeType:"end",
                                bookingType:bookingType,
                                backDestination:"chooseSameDayLeaveBookingType",
                                instructions:_lexicon.leaveBookingTypeSameDayEndTimeInstructions,
                                isSelected:isSelected,
                                hours:endHours,
                                minutes:endMinutes}));
                    } else {
                        // Add a simple non time based item
                        this.chooseSameDayLeaveBookingTypeList.addChild(
                            new LeaveBookingTypeSameDayListItem({
                                timeType:null,
                                bookingType:bookingType,
                                backDestination:"chooseSameDayLeaveBookingType",
                                instructions:null,
                                isSelected:isSelected,
                                hours:null,
                                minutes:null}));
                    }
                },
                /**
                 * Manage the selection on the basis of what type of child has been clicked.  This is tricky because
                 * all selected items other than TIME type ones are mutually exclusive.  So we have to be clever in
                 * looping and deselection.
                 *
                 * Note, this method only gets called if the child that has been clicked is "checked||selected"
                 *
                 * @param childId Newly chosen child widget's identifier
                 */
                childClicked:function (childId) {
                    var chosenChild = registry.byId(childId);
                    // Uncheck the other children, as all bar TIME are mutually exclusive
                    var children = this.chooseSameDayLeaveBookingTypeList.getChildren();
                    for (var i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        // If current child is not the chosen child amend its checked status appropriately
                        if (child.id !== chosenChild.id) {
                            // If the chosen child is not a TIME type un-check the other children
                            if (chosenChild.bookingType !== "TIME") {
                                if (child.checked === true) {
                                    child._setCheckedAttr(false);
                                }
                            } else {
                                // If the current child is not a TIME type, then un-check it, otherwise do nothing
                                // as if our chosen child is a TIME type then there can be more than one selection
                                if (child.bookingType !== "TIME") {
                                    if (child.checked === true) {
                                        child._setCheckedAttr(false);
                                    }
                                }
                            }
                        }
                    }
                },
                _backClicked:function () {
                    // See which booking type is currently selected, and only allow the transition
                    // if something is selected and if TIME, we have both start and end times.
                    var gotStartHours = null;
                    var gotStartMinutes = null;
                    var gotEndHours = null;
                    var gotEndMinutes = null;
                    var gotType = null;
                    var children = this.chooseSameDayLeaveBookingTypeList.getChildren();
                    var child;
                    var i;
                    // Get the time settings by looping through all the children
                    for (i = 0; i < children.length; i += 1) {
                        child = children[i];
                        // Get the current start and end time settings
                        if (child.bookingType === "TIME") {
                            if (child.timeType === "start") {
                                gotStartHours = child.getHours();
                                gotStartMinutes = child.getMinutes();

                            } else {
                                gotEndHours = child.getHours();
                                gotEndMinutes = child.getMinutes();
                            }
                        }
                    }
                    // Determine the booking type
                    for (i = 0; i < children.length; i += 1) {
                        child = children[i];
                        if (child.checked) {
                            if (child.bookingType !== "TIME") {
                                gotType = child.bookingType;
                                break;
                            } else {
                                if (child.timeType === "start") {
                                    if (gotEndHours !== null && gotEndMinutes !== null) {
                                        gotType = child.bookingType;
                                        break;
                                    }
                                } else {
                                    if (gotStartHours !== null && gotStartMinutes !== null) {
                                        gotType = child.bookingType;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (gotType === null) {
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.chooseSameDayLeaveBookingTypeMissingChoice,
                            _lexicon.dialogConfirmationButtonLabel);
                    } else {
                        this.chosenType = gotType;
                        // Update the chooser relatedListItem to display the chosen option and value
                        var relatedListItem = registry.byId(this.relatedListItemId);
                        if (this.chosenType === "TIME") {
                            if (gotEndHours !== null && gotEndMinutes !== null && gotStartHours !== null && gotStartMinutes !== null) {
                                if (this.validSameDayTimeRange(gotStartHours, gotStartMinutes, gotEndHours, gotEndMinutes)) {
                                    relatedListItem.amendCurrentSettings(gotType, gotStartHours, gotStartMinutes, gotEndHours, gotEndMinutes);
                                    new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                                } else {
                                    this.messageDialog.show(_lexicon.dialogErrorTitle,
                                        _lexicon.chooseSameDayLeaveBookingTypeEndBeforeStart,
                                        _lexicon.dialogConfirmationButtonLabel);
                                }
                            } else {
                                this.messageDialog.show(_lexicon.dialogErrorTitle,
                                    _lexicon.chooseSameDayLeaveBookingTypeNeedStartAndEnd,
                                    _lexicon.dialogConfirmationButtonLabel);
                            }
                        } else {
                            relatedListItem.amendCurrentSettings(gotType, gotStartHours, gotStartMinutes, gotEndHours, gotEndMinutes);
                            new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                        }
                    }
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });