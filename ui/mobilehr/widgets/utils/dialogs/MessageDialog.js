/**
 * Non-Dijit-template custom message dialog. This sits attached to the DOM (see index.jsp) but hidden, and is a
 * general purpose confirmation dialog for display to the user that doesn't use Dijit.Dialog and doesn't break the
 * mobile parser. You can amend the title, content message, and acknowledgement button text displayed by the dialog
 * by providing details to the show method.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/window", "dojo/dom-construct", "dojo/_base/lang",
    "dijit/_Container", "dijit/_WidgetBase", "dojo/_base/connect", "dojo/_base/array", "dijit/registry",
    "mobilehr/mixins/WidgetHelper"],
    function (declare, win, domConstruct, lang, container, widgetBase, connect, array, registry, WidgetHelper) {
        return declare("mobilehr.widgets.utils.dialogs.MessageDialog", [container, widgetBase, WidgetHelper], {
            constructor:function () {
                this.top = "auto";
                this.left = "auto";
                this.modal = true;
                this._cover = [];
                this._subscriptions = [];
                this.messageDialogTitle = null;
                this.messageDialogContent = null;
                this.messageDialogAcknowledgeButton = null;
            },
            buildRendering:function () {
                this.inherited(arguments);
                if (!this.containerNode) {
                    this.containerNode = this.domNode;
                }
            },
            /**
             * Because we aren't a full-on template driven Dijit here we have to provide direct handles to our
             * internal children as we've not got access to data-dojo-attach-point as we are meant to be light-weight.
             */
            startup:function () {
                this.inherited(arguments);
                this.messageDialogTitle = this.$("messageDialogTitle");
                this.messageDialogContent = this.$("messageDialogContent");
                this.messageDialogAcknowledgeButton = registry.byId("messageDialogAcknowledgeButton");
                this._subscriptions.push(connect.connect(this.messageDialogAcknowledgeButton.domNode, "onclick",
                    lang.hitch(this, "_acknowledgeClicked")));
            },
            /**
             * Show the user confirmation dialog with the appropriate content and appropriate wiring
             *
             * @param title Title of dialog
             * @param message Message content of dialog
             * @param acknowledgeLabel Acknowledgement button label
             */
            show:function (title, message, acknowledgeLabel) {
                this.messageDialogTitle.innerHTML = title;
                this.messageDialogContent.innerHTML = message;
                this.messageDialogAcknowledgeButton._setLabelAttr(acknowledgeLabel);
                if (this.domNode.style.display === "") {
                    return;
                }
                if (this.modal) {
                    this.addCover();
                }
                this.domNode.style.display = "";
                this.refresh();
                this.domNode.focus();
            },
            hide:function () {
                if (this.domNode.style.display === "none") {
                    return;
                }
                this.domNode.style.display = "none";
                if (this.modal) {
                    this.removeCover();
                }
            },
            addCover:function () {
                if (!this._cover[0]) {
                    this._cover[0] = domConstruct.create("div", {
                        className:"mobilehrDialogCover"
                    }, win.body());
                } else {
                    this._cover[0].style.display = "";
                }
            },
            removeCover:function () {
                this._cover[0].style.display = "none";
            },
            /**
             * Refresh (center) the rendering of the dialog depending on the overall display shape
             */
            refresh:function () {
                var n = this.domNode;
                if (this.top === "auto") {
                    //noinspection JSDuplicatedDeclaration
                    var h = win.global.innerHeight || win.doc.documentElement.clientHeight;
                    n.style.top = Math.round((h - n.offsetHeight) / 2) + "px";
                } else {
                    n.style.top = this.top;
                }
                if (this.left === "auto") {
                    //noinspection JSDuplicatedDeclaration
                    var h = win.global.innerWidth || win.doc.documentElement.clientWidth;
                    n.style.left = Math.round((h - n.offsetWidth) / 2) + "px";
                } else {
                    n.style.left = this.left;
                }
            },
            resize:function () {
                array.forEach(this.getChildren(), function (child) {
                    if (child.resize) {
                        child.resize();
                    }
                });
            },
            /**
             * When acknowledgement event occurs call clear the dialog
             *
             * @param event
             */
            _acknowledgeClicked:function (event) {
                this.messageDialogAcknowledgeButton._onClick(event);
                this.hide();
            },
            /**
             * Disconnect our eventing
             */
            destroy:function () {
                array.forEach(this._subscriptions, connect.disconnect);
                this.inherited(arguments);
            }
        });
    });