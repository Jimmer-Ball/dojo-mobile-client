/**
 * Get the user to provide a leave range start and end date.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper) {
        return declare("mobilehr.widgets.leave.book.LeaveRangeView", [ScrollableView, WidgetHelper, RepresentationHelper], {
            constructor:function () {
                this._subscriptions = [];
                this.link = null;
                this.backDestination = null;
                this.destinationViewOnBack = "leaveRange";
                this.leaveRangeHeading = null;
                this.leaveRangeInstructions = null;
                this.leaveStartInstructions = null;
                this.leaveEndInstructions = null;
                this.leaveRangeStartDate = null;
                this.leaveRangeEndDate = null;
                this.leaveRangeContinueItem = null;
                this.messageDialog = null;
                this.confirmationDialog = null;
                this.startDate = null;
                this.endDate = null;
            },
            /**
             * Pick up on our widgets following markup startup
             */
            startup:function () {
                this.inherited(arguments);
                this.leaveRangeHeading = registry.byId("leaveRangeHeading");
                this.leaveRangeHeading._setBackAttr(_lexicon.backButtonLabel);
                this.leaveRangeHeading._setLabelAttr(_lexicon.applicationTitle);
                this.leaveRangeInstructions = this.$("leaveRangeInstructions");
                this.leaveStartInstructions = this.$("leaveStartInstructions");
                this.leaveEndInstructions = this.$("leaveEndInstructions");
                this.leaveRangeInstructions.innerHTML = _lexicon.leaveRangeInstructions;
                this.leaveStartInstructions.innerHTML = _lexicon.leaveStartInstructions;
                this.leaveEndInstructions.innerHTML = _lexicon.leaveEndInstructions;
                this.leaveRangeStartDate = registry.byId("leaveRangeStartDate");
                this.leaveRangeEndDate = registry.byId("leaveRangeEndDate");
                this.leaveRangeContinueItem = registry.byId("leaveRangeContinueItem");
                this.leaveRangeContinueItem._setLabelAttr(_lexicon.leaveRangeContinueItem);
                this.messageDialog = registry.byId("messageDialog");
                this.confirmationDialog = registry.byId("confirmationDialog");
                this._subscriptions.push(connect.connect(this.leaveRangeHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                this._subscriptions.push(connect.connect(this.leaveRangeContinueItem.domNode, "onclick", lang.hitch(this, "_continueClicked")));
            },
            createContent:function (link, backDestination) {
                this.link = link;
                this.backDestination = backDestination;
            },
            /**
             * Reset our SpinWheelDatePicker child widgets.
             */
            resetDateSpinners:function() {
                this.leaveRangeStartDate.reset();
                this.leaveRangeEndDate.reset();
            },
            /**
             * Override the dojox.mobile.View method so that we can reset our date spinner widgets on access
             * to this view before the client views them.
             */
            onBeforeTransitionIn:function(moveTo, dir, transition, context, method) {
                this.resetDateSpinners();
            },
            _continueClicked:function () {
                var startDate = this.getDateProvidedFromSpinner(this.leaveRangeStartDate.slots[0].getValue(),
                    this.leaveRangeStartDate.slots[1].getValue(), this.leaveRangeStartDate.slots[2].getValue());
                var endDate = this.getDateProvidedFromSpinner(this.leaveRangeEndDate.slots[0].getValue(),
                    this.leaveRangeEndDate.slots[1].getValue(), this.leaveRangeEndDate.slots[2].getValue());
                if (this.validDateRange(startDate, endDate)) {
                    this.startDate = this.translateToAPIDateString(startDate);
                    this.endDate = this.translateToAPIDateString(endDate);
                    this._callService();
                } else {
                    this.messageDialog.show(_lexicon.dialogInformationTitle, [_lexicon.invalidDatesMessageStart,
                        this.translateToAPIDateString(startDate), _lexicon.invalidDatesMessageMiddle,
                        this.translateToAPIDateString(endDate),
                        _lexicon.invalidDatesMessageEnd].join(""), _lexicon.dialogConfirmationButtonLabel);
                }
            },
            _callService:function () {
                _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_postGetEntitlements"));
                _resourceController.doRetrieve(["services/mobile/leaveEntitlements",
                    "?startDate=", this.startDate, "&endDate=", this.endDate].join(""));
            },
            _postGetEntitlements:function () {
                var leaveEntitlements = null;
                var errorCode = null;
                var errorDetails = null;
                switch (_resourceController.responseCode) {
                    case 200 :
                        leaveEntitlements = _resourceController.responseData;
                        break;
                    default :
                        errorCode = _resourceController.responseCode;
                        errorDetails = _resourceController.responseData;
                        break;
                }
                if (_resourceController.responseCode !== 401) {
                    var destination = registry.byId("leaveEntitlementGroups");
                    destination.createContent(leaveEntitlements, this.startDate, this.endDate, this.destinationViewOnBack, errorCode, errorDetails);
                    this.performTransition(destination.id, 1, "slide");
                } else {
                    this.leaveRangeHeading.goTo("login", this.leaveRangeHeading.href)
                }
            },
            _backClicked:function () {
                this.leaveRangeHeading.goTo(this.backDestination, this.leaveRangeHeading.href);
            },
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });