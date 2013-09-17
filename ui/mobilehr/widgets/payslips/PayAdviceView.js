/**
 * Display a pay advice
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/mixins/FieldBuilder"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder) {
        return declare("mobilehr.widgets.payslips.PayAdviceView",
            [ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder], {
            /**
             * Fields that this view displays on screen.
             */
            constructor:function () {
                this.payAdviceDisplayFields = null;
                this.payAdviceContent = null;
                this.payAdviceHeading = null;
                this._subscriptions = [];
                this.backDestination = null;
            },
            startup:function () {
                this.inherited(arguments);
                this.payAdviceDisplayFields = [
                    {fieldId: 'taxYear', fieldLabel: _lexicon.payAdviceTaxYear},
                    {fieldId: 'payPeriod', fieldLabel: _lexicon.payAdvicePayPeriod},
                    {fieldId: 'payDate', fieldLabel: _lexicon.payAdvicePayDate, dataType: "date"},
                    {fieldId: 'grossPay', fieldLabel: _lexicon.payAdviceGrossPay, dataType: "currency"},
                    {fieldId: 'totalDeductions', fieldLabel: _lexicon.payAdviceTotalDeductions, dataType: "currency"},
                    {fieldId: 'netPay', fieldLabel: _lexicon.payAdviceNetPay, dataType: "currency"}
                ];
                this.payAdviceContent = registry.byId("payAdviceContent");
                this.payAdviceHeading = registry.byId("payAdviceHeading");
                this.payAdviceHeading._setBackAttr(_lexicon.backButtonLabel);
                this.payAdviceHeading._setLabelAttr(_lexicon.applicationTitle);
                this.payAdviceInstructions = this.$("payAdviceInstructions");
                this.payAdviceInstructions.innerHTML = _lexicon.payAdviceInstructions;
                this._subscriptions.push(connect.connect(this.payAdviceHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                this.backDestination = "actions";
            },
            /**
             * Amend the content to display and the back destination accordingly.
             *
             * @param dto pay advice DTO or error details expressed by HTTP response code
             * @param backDestination where to go navigate back to depends on where we were called from
             */
            createContent:function (dto, backDestination) {
                if (dto.hasOwnProperty("errorCode")) {
                    this.displayServiceErrorNodeContent(dto["errorCode"], this.payAdviceContent.containerNode,
                        _resourceController.responseData, "informationNoData");
                } else {
                    this._createContent(dto);
                }
                this.backDestination = backDestination;
            },
            /**
             * Render the data fields for this view using the content of the dto and the views payAdviceFields
             * member.
             *
             * @param dto a complex data object that contains pay advice data
             */
            _createContent:function (dto) {
                // replace the content of our table with the rows we have created
                this.payAdviceContent.containerNode.innerHTML =
                    this.createDisplayFields(this.payAdviceDisplayFields, dto);
            },
            _backClicked:function () {
                this.payAdviceHeading.goTo(this.backDestination, this.payAdviceHeading.href);
            },
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });