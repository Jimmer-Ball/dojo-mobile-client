/**
 * Provider a chooser for leave booking type.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper", "mobilehr/widgets/leave/book/LeaveBookingTypeListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, TransitionEvent, WidgetHelper,
              RepresentationHelper, LeaveBookingTypeListItem) {
        return declare("mobilehr.widgets.leave.book.ChooseEndLeaveBookingTypeView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.relatedListItemId = null;
                    this.bookingTypes = null;
                    this.chosenType = null;
                    this.instructions = null;
                    this.backDestination = null;
                    this.transitionOptions = null;
                    this.chooseEndLeaveBookingTypeHeading = null;
                    this.chooseEndLeaveBookingTypeInstructions = null;
                    this.chooseEndLeaveBookingTypeList = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.chooseEndLeaveBookingTypeHeading = registry.byId("chooseEndLeaveBookingTypeHeading");
                    this.chooseEndLeaveBookingTypeHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.chooseEndLeaveBookingTypeHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.chooseEndLeaveBookingTypeInstructions = this.$("chooseEndLeaveBookingTypeInstructions");
                    this.chooseEndLeaveBookingTypeInstructions.innerHTML = _lexicon.chooseEndLeaveBookingTypeInstructions;
                    this.chooseEndLeaveBookingTypeList = registry.byId("chooseEndLeaveBookingTypeList");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.chooseEndLeaveBookingTypeHeading.get("backButton"), "onclick",
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
                 * @param hours
                 * @param minutes
                 */
                createContent:function (relatedListItemId, bookingTypes, chosenType, instructions, backDestination, hours, minutes) {
                    this.relatedListItemId = relatedListItemId;
                    this.bookingTypes = bookingTypes;
                    this.chosenType = chosenType;
                    this.instructions = instructions;
                    this.backDestination = backDestination;
                    this.chooseEndLeaveBookingTypeInstructions.innerHTML = this.instructions;
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};

                    this.clearListWidget(this.chooseEndLeaveBookingTypeList);
                    array.forEach(this.bookingTypes, function (bookingType) {
                        if (this.chosenType === bookingType) {
                            this.chooseEndLeaveBookingTypeList.addChild(
                                new LeaveBookingTypeListItem({
                                    type:"end",
                                    bookingType:bookingType,
                                    backDestination:"chooseEndLeaveBookingType",
                                    instructions:_lexicon.leaveBookingTypeEndTimeInstructions,
                                    isSelected:true,
                                    hours:hours,
                                    minutes:minutes}));
                        } else {
                            this.chooseEndLeaveBookingTypeList.addChild(
                                new LeaveBookingTypeListItem({
                                    type:"end",
                                    bookingType:bookingType,
                                    backDestination:"chooseEndLeaveBookingType",
                                    instructions:_lexicon.leaveBookingTypeEndTimeInstructions,
                                    isSelected:false,
                                    hours:hours,
                                    minutes:minutes}));
                        }
                    }, this);
                },
                _backClicked:function () {
                    // See which booking type is currently selected, and only allow the transition
                    // if something is selected
                    var gotHours = null;
                    var gotMinutes = null;
                    var gotType = null;
                    var children = this.chooseEndLeaveBookingTypeList.getChildren();
                    for (var i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        if (child.checked) {
                            gotHours = child.getHours();
                            gotMinutes = child.getMinutes();
                            gotType = child.bookingType;
                            break;
                        }
                    }
                    if (gotType === null) {
                        this.messageDialog.show(_lexicon.dialogErrorTitle,
                            _lexicon.chooseEndLeaveBookingTypeMissingChoice,
                            _lexicon.dialogConfirmationButtonLabel);
                    } else {
                        // Update the chooser relatedListItem to display the chosen option and value
                        this.chosenType = gotType;
                        var relatedListItem = registry.byId(this.relatedListItemId);
                        relatedListItem.amendCurrentSettings(gotType, gotHours, gotMinutes);
                        new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                    }
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });