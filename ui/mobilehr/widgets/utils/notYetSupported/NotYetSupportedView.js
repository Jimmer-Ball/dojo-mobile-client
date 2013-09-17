/**
 * Display the not yet supported view for covering off functionality we (the UI expressed in code)
 * do not yet currently support.  We display this off the back of attempting to support a link
 * we do not yet provide functionality for, or perhaps any feature in the UI we want to to provide
 * feedback on work in progress for example.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper) {
        return declare("mobilehr.widgets.utils.notYetSupported.NotYetSupportedView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                notYetSupportedTemplate:'<table width="100%"><tbody>${content}</tbody></table>',
                constructor:function () {
                    this.notYetSupportedContent = null;
                    this.notYetSupportedHeading = null;
                    this.notYetSupportedInstructions = null;
                    this._subscriptions = [];
                    this.backDestination = null;
                },
                startup:function () {
                    this.inherited(arguments);
                    this.notYetSupportedContent = registry.byId("notYetSupportedContent");
                    this.notYetSupportedHeading = registry.byId("notYetSupportedHeading");
                    this.notYetSupportedHeading._setBackAttr(_lexicon.backButtonLabel);
                    this.notYetSupportedHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.notYetSupportedInstructions = this.$("notYetSupportedInstructions");
                    this.notYetSupportedInstructions.innerHTML = _lexicon.notYetSupportedInstructions;
                    this._subscriptions = [];
                    this._subscriptions.push(connect.connect(this.notYetSupportedHeading.get("backButton"), "onclick", lang.hitch(this, "_backClicked")));
                    this.backDestination = "actions";
                },
                /**
                 * Amend the display to show the link details passed in and its content and set the back destination
                 * according to whatever view or listItem called this.
                 *
                 * @param link link details
                 * @param backDestination where to go navigate back to depends on where we were called from
                 */
                createContent:function (link, backDestination) {
                    this.backDestination = backDestination;
                    var details = "";
                    for (var property in link) {
                        if (link.hasOwnProperty(property)) {
                            details = [details, '<tr><td valign="top"><span style="font-weight: bold;">',
                                property, ':',
                                '</span></td><td align="right"><span>',
                                link[property],
                                '</span></td></tr>'].join("");
                        }
                    }
                    this.notYetSupportedContent.containerNode.innerHTML = this.substitute(this.notYetSupportedTemplate, {content:details});
                },
                _backClicked:function () {
                    this.notYetSupportedHeading.goTo(this.backDestination, this.notYetSupportedHeading.href);
                },
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });