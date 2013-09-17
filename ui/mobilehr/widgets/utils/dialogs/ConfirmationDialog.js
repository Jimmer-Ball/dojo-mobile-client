/**
 * Non-Dijit-template custom confirmation dialog. This sits attached to the DOM (see index.jsp) but hidden, and is a
 * general purpose confirmation dialog for display to the user that doesn't use Dijit.Dialog and doesn't break the
 * mobile parser. You can amend the title, content message, confirmation button text, and cancellation button text
 * displayed by the dialog by providing details to the show method.  You are also expected to register custom
 * callback methods  to be invoked when the confirmation or cancellation buttons are clicked to ensure some element
 * of your code gets called following a user's click on the dialog.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/_base/lang",
    "dijit/_Container", "dijit/_WidgetBase", "dojo/_base/connect", "dojo/_base/array", "dijit/registry",
    "mobilehr/mixins/WidgetHelper"],
    function (declare, win, domClass, domConstruct, lang, container, widgetBase, connect, array, registry, WidgetHelper) {
        return declare("mobilehr.widgets.utils.dialogs.ConfirmationDialog", [container, widgetBase, WidgetHelper], {
            constructor:function () {
                this.top = "auto";
                this.left = "auto";
                this.modal = true;
                this._cover = [];
                this._subscriptions = [];
                this.confirmationDialogTitle = null;
                this.confirmationDialogContent = null;
                this.confirmationDialogConfirmButton = null;
                this.confirmationDialogCancelButton = null;
                this.confirmationCallback = null;
                this.cancellationCallback = null;
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
                this.confirmationDialogTitle = this.$("confirmationDialogTitle");
                this.confirmationDialogContent = this.$("confirmationDialogContent");
                this.confirmationDialogConfirmButton = registry.byId("confirmationDialogConfirmButton");
                this.confirmationDialogCancelButton = registry.byId("confirmationDialogCancelButton");
                this._subscriptions.push(connect.connect(this.confirmationDialogConfirmButton.domNode, "onclick",
                    lang.hitch(this, "_confirmClicked")));
                this._subscriptions.push(connect.connect(this.confirmationDialogCancelButton.domNode, "onclick",
                    lang.hitch(this, "_cancelClicked")));
            },
            /**
             * Show the user confirmation dialog with the appropriate content and appropriate wiring
             *
             * @param title Title of dialog
             * @param message Message content of dialog
             * @param confirmationLabel Confirmation button label
             * @param cancellationLabel Cancellation button label
             * @param confirmationCallback function to call when user clicks confirmation button
             * @param cancellationCallback function to call when user clicks cancellation button
             */
            show:function (title, message, confirmationLabel, cancellationLabel, confirmationCallback, cancellationCallback) {
                this.confirmationDialogTitle.innerHTML = title;
                this.confirmationDialogContent.innerHTML = message;
                this.confirmationDialogConfirmButton._setLabelAttr(confirmationLabel);
                this.confirmationDialogCancelButton._setLabelAttr(cancellationLabel);
                this.confirmationCallback = confirmationCallback;
                this.cancellationCallback = cancellationCallback;
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
             * When confirmation event occurs call the base onclick behaviour and the registered callback function
             *
             * @param event
             */
            _confirmClicked:function (event) {
                this.confirmationDialogConfirmButton._onClick(event);
                if (this.confirmationCallback != null && typeof this.confirmationCallback === "function") {
                    this.confirmationCallback();
                }
                this.hide();
            },
            /**
             * When cancellation event occurs call the base onclick behaviour and the registered callback function
             *
             * @param event
             */
            _cancelClicked:function (event) {
                this.confirmationDialogCancelButton._onClick(event);
                if (this.cancellationCallback != null && typeof this.cancellationCallback === "function") {
                    this.cancellationCallback();
                }
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