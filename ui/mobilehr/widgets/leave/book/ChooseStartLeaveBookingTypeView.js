/**
 * Provide the set of booking types that are applicable given the entitlement passed in.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper",
    "mobilehr/mixins/RepresentationHelper", "mobilehr/widgets/leave/book/LeaveBookingTypeListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, TransitionEvent, WidgetHelper,
              RepresentationHelper, LeaveBookingTypeListItem) {
        return declare("mobilehr.widgets.leave.book.ChooseStartLeaveBookingTypeView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.relatedListItemId = null;
                    this.bookingTypes = null;
                    this.chosenType = null;
                    this.instructions = null;
                    this.backDestination = null;
                    this.transitionOptions = null;
                    this.chooseStartLeaveBookingTypeHeading = null;
                    this.chooseStartLeaveBookingTypeInstructions = null;
                    this.chooseStartLeaveBookingTypeList = null;
                    this._subscriptions = [];
                },
                startup:function () {
                    this.inherited(arguments);
                    this.chooseStartLeaveBookingTypeHeading = registry.byId("chooseStartLeaveBookingTypeHeading");
                    this.chooseStartLeaveBookingTypeHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.chooseStartLeaveBookingTypeHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.chooseStartLeaveBookingTypeInstructions = this.$("chooseStartLeaveBookingTypeInstructions");
                    this.chooseStartLeaveBookingTypeInstructions.innerHTML = _lexicon.chooseStartLeaveBookingTypeInstructions;
                    this.chooseStartLeaveBookingTypeList = registry.byId("chooseStartLeaveBookingTypeList");
                    this.messageDialog = registry.byId("messageDialog");
                    this._subscriptions.push(connect.connect(this.chooseStartLeaveBookingTypeHeading.get("backButton"), "onclick",
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
                createContent:function (relatedListItemId, bookingTypes, chosenType, instructions, backDestination,
                                        hours, minutes) {
                    this.relatedListItemId = relatedListItemId;
                    this.bookingTypes = bookingTypes;
                    this.chosenType = chosenType;
                    this.instructions = instructions;
                    this.backDestination = backDestination;
                    this.chooseStartLeaveBookingTypeInstructions.innerHTML = this.instructions;
                    this.transitionOptions = {moveTo:this.backDestination, href:null, url:null, scene:null, transition:"slide", transitionDir:-1};

                    this.clearListWidget(this.chooseStartLeaveBookingTypeList);
                    array.forEach(this.bookingTypes, function (bookingType) {
                        if (this.chosenType === bookingType) {
                            this.chooseStartLeaveBookingTypeList.addChild(
                                new LeaveBookingTypeListItem({
                                    type:"start",
                                    bookingType:bookingType,
                                    backDestination:"chooseStartLeaveBookingType",
                                    instructions:_lexicon.leaveBookingTypeStartTimeInstructions,
                                    isSelected:true,
                                    hours: hours,
                                    minutes: minutes}));
                        } else {
                            this.chooseStartLeaveBookingTypeList.addChild(
                                new LeaveBookingTypeListItem({
                                    type:"start",
                                    bookingType:bookingType,
                                    backDestination:"chooseStartLeaveBookingType",
                                    instructions:_lexicon.leaveBookingTypeStartTimeInstructions,
                                    isSelected:false,
                                    hours: hours,
                                    minutes: minutes}));
                        }
                    }, this);
                },
                _backClicked:function () {
                    // See which booking type is currently selected, and only allow the transition
                    // if something is selected
                    var gotHours = null;
                    var gotMinutes = null;
                    var gotType = null;
                    var children = this.chooseStartLeaveBookingTypeList.getChildren();
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
                            _lexicon.chooseStartLeaveBookingTypeMissingChoice,
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