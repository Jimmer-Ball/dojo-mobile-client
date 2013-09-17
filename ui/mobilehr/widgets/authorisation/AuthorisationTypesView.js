/**
 * Show the list of authorisation data types a user can choose from. Here we create a list of data-types
 * applicable to the authorisations, but we only bother displaying an entry in this list if there actually
 * are authorisation records of that data type for our user to process.  If there are no authorisations of
 * any possible data-type available at all, then we display a no records found message to the user.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/widgets/authorisation/ChooseDataTypeListItem"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper,
              ChooseDataTypeListItem) {
        return declare("mobilehr.widgets.authorisation.AuthorisationTypesView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function() {
                    this.authorisationTypesList = null;
                    this.authorisationTypesHeading = null;
                    this.authorisationTypesBanner = null;
                    this.authorisationTypesInstructions = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.authorisationTypesList = registry.byId("authorisationTypesList");
                    this.authorisationTypesHeading = registry.byId("authorisationTypesHeading");
                    this.authorisationTypesHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.authorisationTypesHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.authorisationTypesBanner = this.$("authorisationTypesBanner");
                    this.authorisationTypesInstructions = this.$("authorisationTypesInstructions");
                    this.authorisationTypesBanner.innerHTML = _lexicon.authorisationTypesBanner;
                    this.authorisationTypesInstructions.innerHTML = _lexicon.authorisationTypesInstructions;
                    this._subscriptions.push(connect.connect(this.authorisationTypesHeading.get("backButton"),
                        "onclick", lang.hitch(this, "_backClicked")));
                },
                createContent:function (dto, backDestination) {
                    this.backDestination = backDestination;
                    this.clearListWidget(this.authorisationTypesList);
                    if (dto.hasOwnProperty("errorCode")) {
                        this.displayServiceErrorNodeContent(dto["errorCode"], this.authorisationTypesList.containerNode, _resourceController.responseData, null);
                    } else {
                        this._createContent(dto);
                    }
                },
                _createContent:function (dto) {
                    var gotData = false;
                    array.forEach(dto.dataTypeDefinitions, function (dataType) {
                        if (dto.hasOwnProperty(dataType.listName)) {
                            if (dto[dataType.listName].length > 0) {
                                gotData = true;
                                this.authorisationTypesList.addChild(new ChooseDataTypeListItem({dataType:dataType,
                                    authorisationsList:dto[dataType.listName]}));
                            }
                        }
                    }, this);
                    if (gotData === false) {
                        this.createMessageNodeContent(this.authorisationTypesList.containerNode, "informationNoData");
                    }
                },
                _backClicked:function () {
                    this.authorisationTypesHeading.goTo(this.backDestination, this.authorisationTypesHeading.href);
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });