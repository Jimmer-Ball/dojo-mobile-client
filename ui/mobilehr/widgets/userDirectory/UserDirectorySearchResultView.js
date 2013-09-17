/**
 * Displays the contents of a single user directory search result. This view contains functional
 * links for emailing, calling or texting a given directory result. These external links can launch
 * native applications on the client's device using the values provided by the link e.g.
 * tel:+19493313987 will activate the native phone application and will pre-populate those numbers
 * ready to call the search result user.
 *
 * When the client is accessed from an iPhone we need to override the onclick handlers for these
 * functional links (tel:, sms: and mailto:) as they will actually close our application. This is
 * due to the iOS policy that only permits one application to run at any one time, but Safari is a
 * native app so it shouldn't be affected under this policy??? This is only true if the application
 * was <bold>not</bold> launched in AppMode i.e. via a iPhone home page icon
 * {@see WidgetHelper#detectiPhoneStandaloneAppMode}. This special mode treats Safari as if it were an
 * app rather than the native browser. Please note the client is extremely well behaved when iPhone
 * users make use of Safari as a browser rather than launching via the home page.
 *
 * In the override we intercept the link press and warn the user that they will leave the application
 * in their current mode if they proceed. If they decide to continue we fire the external link and the
 * device will launch the native application based on the scheme provided (tel:, sms: or mailto:).
 *
 * Mobile Safari on iOS currently supports the links described in the Apple URL Scheme Reference found here:
 *
 * http://developer.apple.com/library/ios/#featuredarticles/iPhoneURLScheme_Reference/Introduction/Introduction.html#//apple_ref/doc/uid/TP40007891-SW1
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry", "dojo/query",
    "dojo/dom-construct", "dojo/_base/event", "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper",
    "mobilehr/mixins/FieldBuilder"],
    function (declare, lang, array, connect, registry, query, domConstruct, event, ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder) {
        return declare("mobilehr.widgets.userDirectory.UserDirectorySearchResultView",
            [ScrollableView, WidgetHelper, RepresentationHelper, FieldBuilder], {

                constructor:function () {
                    this.userDirectorySearchResultFields = null;
                    this.searchResultContent = null;
                    this.userDirectorySearchResultHeading = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                    this.resultDto = null;
                    this.confirmationDialog = null;
                },

                startup:function () {
                    this.inherited(arguments);
                    // our fields to display and their display properties
                    this.userDirectorySearchResultFields = [
                        {fieldId: 'firstName', fieldLabel: _lexicon.userfirstName},
                        {fieldId: 'lastName', fieldLabel: _lexicon.userlastName},
                        {fieldId: 'jobTitle', fieldLabel: _lexicon.userjobTitle},
                        {fieldId: 'location', fieldLabel: _lexicon.userlocation},
                        {fieldId: 'workTelNumber', fieldLabel: _lexicon.userworkTelNumber, dataType: 'telephone', layout: "single"},
                        {fieldId: 'mobileNumber', fieldLabel: _lexicon.usermobileNumber, dataType: 'telephone', layout: "single"},
                        {fieldId: 'email', fieldLabel: _lexicon.emailAddress, dataType: 'email', layout: "fullWidth"}
                    ];
                    this.searchResultContent = registry.byId("searchResultContent");
                    this.userDirectorySearchResultHeading = registry.byId("userDirectorySearchResultHeading");
                    this.userDirectorySmsButton = registry.byId("userDirectorySmsButton");
                    this.userDirectorySmsButton._setLabelAttr(_lexicon.userDirectoryCreateSMSButton);
                    this.userDirectorySearchResultHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.userDirectorySearchResultHeading._setLabelAttr(_lexicon.applicationTitle);
                    this._subscriptions.push(connect.connect(this.userDirectorySearchResultHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this._subscriptions.push(connect.connect(this.userDirectorySmsButton.domNode, "onclick", lang.hitch(this, "_sendSMSMessageClicked")));
                    this.backDestination = "userDirectorySearchResults";
                    // we utilise the confirmation dialog on this view to warn users that they will exit the application
                    // if we are in standalone mode and one of our special links is used (tel:, sms: or mailto:)
                    this.confirmationDialog = registry.byId("confirmationDialog");
                },

                /**
                 * Amend the content to display and the back destination accordingly.
                 *
                 * @param dto pay advice DTO or error details expressed by HTTP response code
                 * @param backDestination where to go navigate back to depends on where we were called from
                 */
                createContent:function (dto, backDestination) {
                    this.resultDto = dto;
                    if (dto.hasOwnProperty("errorCode")) {
                        this.displayServiceErrorNodeContent(dto["errorCode"], this.searchResultContent.containerNode,
                            _resourceController.responseData, "informationNoData");
                    } else {
                        this._createContent(dto);
                    }
                    this.backDestination = backDestination;
                },

                /**
                 * Render the data fields for this view using the content of the dto and the views
                 * userDirectorySearchResultFields member.
                 *
                 * @param dto a complex data object that contains pay advice data
                 */
                _createContent:function (dto) {
                    // replace the content of our table with the rows we have created
                    this.searchResultContent.containerNode.innerHTML =
                        this.createDisplayFields(this.userDirectorySearchResultFields, dto);

                    // for each of our special links (mailto:, tel: etc...) add a warning if we are in
                    //  iPhone App Mode as the user will be logged out of the app (and the relevant app will
                    // be launched by iOS).
                    if (this.detectiPhoneStandaloneAppMode()) {
                        query('a', this.domNode).forEach(lang.hitch(this, function(link) {
                            // override the default onclick
                            this._subscriptions.push(
                                connect.connect(link, "onclick",  lang.hitch(this, "_executeExternalLink", link)));
                        }));
                    }
                },

                /**
                 * Show the user a warning regarding the use of App Mode and if they accept the outcome use the
                 * href within the link we are passed to perform the external links action.
                 *
                 * @param link a link whose href uses the tel:, mailto: or sms: scheme
                 * @param evt  the click event
                 */
                _executeExternalLink:function(link, evt) {
                    // kill the original onclick functionality as we don't want the href executing
                    event.stop(evt);
                    // issue the warning
                    this.confirmationDialog.show(
                        _lexicon.dialogConfirmationTitle,
                        _lexicon.userDirectoryIPhoneStandaloneWarning,
                        _lexicon.dialogConfirmationButtonLabel,
                        _lexicon.dialogCancellationButtonLabel,
                        lang.hitch(link, function () {
                            window.location.replace(this.getAttribute("href"));
                        }),
                        lang.hitch(this, "_cancelledRequest"));
                },

                /**
                 * Issue an SMS request that should allow the devices native SMS functionality to create a message
                 * that is sent to the users listed mobile number.
                 */
                _sendSMSMessageClicked:function(event) {
                    // if in standalone version on the iPhone call our workaround function _sendSMSMessageStandaloneMode
                    if (this.detectiPhoneStandaloneAppMode()) {
                        this.confirmationDialog.show(_lexicon.dialogConfirmationTitle,
                            _lexicon.userDirectoryIPhoneStandaloneWarning,
                            _lexicon.dialogConfirmationButtonLabel, _lexicon.dialogCancellationButtonLabel,
                            lang.hitch(this, "_sendSMSMessageStandaloneMode"),
                            lang.hitch(this, "_cancelledRequest"));

                    } else {
                        this.inherited(arguments);
                        // simply reset the location if we aren't in iPhone app mode
                        window.location.replace(["sms:",
                            this.resultDto.mobileNumber].join(""));

                        return false;
                    }
                },

                /**
                 * Do nothing function that gets called when a user decides not to follow one of our special
                 * links in iPhone standalone mode.
                 */
                _cancelledRequest:function () {
                },

                /**
                 * Only HTML anchor tags with sms url will launch the iOS messaging application when the webapp
                 * is run in standalone mode so we need this extra function to create a link on the fly and issue
                 * a request from it (strange but true).
                 */
                _sendSMSMessageStandaloneMode:function() {
                    var smsHref = "sms:" + this.resultDto.mobileNumber;
                    // construct a new link we can issue the request from, we don't need to attach it to the
                    // DOM though so avoid memory leaks
                    var smsLink = domConstruct.create("a", { href: smsHref});

                    // override onclick
                    var evt = smsLink.ownerDocument.createEvent('MouseEvents');
                    // simulate the click
                    evt.initMouseEvent('click', true, true,
                        smsLink.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    smsLink.dispatchEvent(evt);
                    // destroy the reference so our smsLink is garbage collected
                    smsLink = null;
                },

                _backClicked:function () {
                    this.userDirectorySearchResultHeading.goTo(this.backDestination, this.userDirectorySearchResultHeading.href);
                },

                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });
