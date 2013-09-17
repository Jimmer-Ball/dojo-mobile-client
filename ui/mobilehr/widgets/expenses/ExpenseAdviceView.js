/**
 * Display an expense advice
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/mixins/FieldBuilder"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder) {
        return declare("mobilehr.widgets.expenses.ExpenseAdviceView",
            [ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder], {
                /**
                 * Fields that this view displays on screen.
                 */
                constructor:function() {
                    this.expenseAdviceDisplayFields = null;
                    this.expenseAdviceContent = null;
                    this.expenseAdviceHeading = null;
                    this.expenseAdviceInstructions = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.expenseAdviceDisplayFields = [
                        {fieldId: "payDate", fieldLabel: _lexicon.expenseAdvicePayDateLabel, dataType: "date"},
                        {fieldId: 'netAmount', fieldLabel: _lexicon.expenseAdviceNetAmountLabel, dataType: "currency"},
                        {fieldId: 'expenseAdviceDescription', fieldLabel: _lexicon.expenseAdviceDescriptionLabel, layout: "fullWidth"}
                    ];
                    this.expenseAdviceContent = registry.byId("expenseAdviceContent");
                    this.expenseAdviceHeading = registry.byId("expenseAdviceHeading");
                    this.expenseAdviceHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.expenseAdviceHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.expenseAdviceInstructions = this.$("expenseAdviceInstructions");
                    this.expenseAdviceInstructions.innerHTML = _lexicon.expenseAdviceInstructions;
                    this._subscriptions.push(connect.connect(this.expenseAdviceHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this.backDestination = "actions";
                },
                /**
                 * Amend the content to display and the back destination accordingly.
                 *
                 * @param dto expense advice DTO or error expressed by HTTP response code
                 * @param backDestination where to go navigate back to depends on where we were called from
                 */
                createContent:function (dto, backDestination) {
                    if (dto.hasOwnProperty("errorCode")) {
                        this.displayServiceErrorNodeContent(dto["errorCode"],
                            this.expenseAdviceContent.containerNode, _resourceController.responseData,
                            "informationNoData");
                    } else {
                        this._createContent(dto);
                    }
                    this.backDestination = backDestination;
                },
                _createContent:function (dto) {
                    // replace the content of our table with the rows we have created
                    this.expenseAdviceContent.containerNode.innerHTML =
                        this.createDisplayFields(this.expenseAdviceDisplayFields, dto);
                },
                _backClicked:function () {
                    this.expenseAdviceHeading.goTo(this.backDestination, this.expenseAdviceHeading.href);
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });