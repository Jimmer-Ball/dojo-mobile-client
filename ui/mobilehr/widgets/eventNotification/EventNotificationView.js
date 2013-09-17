/**
 * Display the full details of an event notification
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry", "dojo/dom-class",
    "dojox/mobile/ScrollableView", "dojox/mobile/TransitionEvent", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/mixins/FieldBuilder"],
    function (declare, lang, array, connect, registry, domClass, ScrollableView, TransitionEvent, WidgetHelper, RepresentationHelper, FieldBuilder) {
        return declare("mobilehr.widgets.eventNotification.EventNotificationView",
            [ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder], {
                /**
                 * Fields that this view displays on screen.
                 */
                constructor:function () {
                    this.eventNotification = null;
                    this.eventNotificationContent = null;
                    this.eventNotificationHeading = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    // a button that is shown if the event notification we populate the view with has a link to the
                    // events related resource embedded in it
                    this.getRelatedResourceButton = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    // fields that relate to user specific notifications i.e. those with a data type
                    this.userNotificationDisplayFields = [
                        {fieldId: "timeStamp", fieldLabel: _lexicon.eventNotificationTimeStamp, dataType: "date"},
                        {fieldId: 'dataType', fieldLabel: _lexicon.eventNotificationDataType},
                        {fieldId: 'systemMessageCode', fieldLabel: _lexicon.systemMessageCode, layout: "fullWidth"},
                        {fieldId: 'systemMessage', fieldLabel: _lexicon.systemEventMessage, layout: "fullWidth"},
                        {fieldId: 'details', fieldLabel: _lexicon.eventNotificationDetail, layout:"fullWidth"}
                    ];
                    // fields that are required for non user specific notification (API wide and organisation wide)
                    // no data type information will be available and we shouldn't show a success indicator either
                    this.generalNotificationDisplayFields = [
                        {fieldId: "timeStamp", fieldLabel: _lexicon.eventNotificationTimeStamp, dataType: "date"},
                        {fieldId: 'systemMessageCode', fieldLabel: _lexicon.systemMessageCode, layout: "single"},
                        {fieldId: 'systemMessage', fieldLabel: _lexicon.systemEventMessage, layout: "fullWidth"},
                        {fieldId: 'details', fieldLabel: _lexicon.eventNotificationDetail, layout:"fullWidth"}
                    ];
                    this.eventNotificationContent = registry.byId("eventNotificationContent");
                    this.eventNotificationHeading = registry.byId("eventNotificationHeading");
                    this.eventNotificationHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.eventNotificationHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.getRelatedResourceButton = registry.byId("getRelatedResourceButton");
                    this.getRelatedResourceButtonInstructions = this.$("getRelatedResourceButtonInstructions");
                    this.getRelatedResourceButtonInstructions.innerHTML = _lexicon.getRelatedResourceButtonText;

                    this._subscriptions.push(connect.connect(this.eventNotificationHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.getRelatedResourceButton.domNode, "onclick", lang.hitch(this, "_getRelatedResourceClicked")));
                    // always move back to the eventNotifications view, from there we can then return to the rest of the application
                    this.backDestination = "eventNotifications";
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
                    this.eventNotification = dto;
                    // add optional display fields based on the notification type (user specific or general)
                    if (dto.dataType !== null && dto.relatedUuid !== null) {
                        // replace the content of our table with the rows we have created
                        this.eventNotificationContent.containerNode.innerHTML =
                            this.createDisplayFields(this.userNotificationDisplayFields, dto);
                    } else {
                        // replace the content of our table with the rows we have created
                        this.eventNotificationContent.containerNode.innerHTML =
                            this.createDisplayFields(this.generalNotificationDisplayFields, dto);
                    }
                    // show/hide the related resource button
                    this._setupGetRelatedResourceButton(this.eventNotification);

                },

                /**
                 * Show or hide the get related resource button depending on whether a related resource link
                 * was contained in the event notification supplied. We also set up the title of the button so
                 * it is data type specific.
                 *
                 * @param eventNotification
                 */
                _setupGetRelatedResourceButton:function(eventNotification) {
                    // ensure that the button is hidden by default
                    if (!domClass.contains(this.getRelatedResourceButton.domNode, "mobilehrIsHidden")) {
                        domClass.add(this.getRelatedResourceButton.domNode, "mobilehrIsHidden");
                    }

                    // determine if there is a related link to the resource, and that it actually
                    // contains something we can use
                    if (eventNotification.relatedResourceLink && eventNotification.relatedResourceLink.href) {
                        // show the button
                        domClass.remove(this.getRelatedResourceButton.domNode, "mobilehrIsHidden");
                    }
                },

                /**
                 * Transition the current view to the that of the events related resource after contacting the service
                 * to retrieve that resources content.
                 */
                _getRelatedResourceClicked:function() {
                    var getResourceURL = this.eventNotification.relatedResourceLink.href;

                    if (getResourceURL && getResourceURL.length > 0) {
                        _resourceController.registerPostRetrieveCallback(lang.hitch(this, "_gotRelatedResource"));
                        _resourceController.doRetrieve(getResourceURL);
                    }
                },

                /**
                 * Call back function executed after the related resource details have been retrieved. Currently
                 * we only deal with leave requests so there is only one destination view but in future we can derive
                 * the view to use based on the "is" property of the representation returned.
                 */
                _gotRelatedResource:function() {
                    switch(_resourceController.responseCode) {
                        case 200 :
                            var dynamicDestination = this.getDestinationViewForRepresentation(_resourceController.responseData);
                            if (dynamicDestination !== null) {
                                var destination = registry.byId(dynamicDestination);
                                destination.createContent(_resourceController.responseData, "eventNotification");
                                this.transitionOptions = {moveTo:"leaveRequest", href:null, url:null, scene:null, transition:"slide", transitionDir:1};
                                new TransitionEvent(this.domNode, this.transitionOptions).dispatch();
                            }
                            // break anyway
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

                _backClicked:function () {
                    this.eventNotificationHeading.goTo(this.backDestination, this.eventNotificationHeading.href);
                },

                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });
