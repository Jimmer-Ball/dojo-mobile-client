/**
 * Provide a mechanism for external classes to register callback methods that can be called both prior and after a REST
 * call. So, allow for custom pre-processing of the outgoing request contents and headers, and custom post-processing
 * of the response headers and content returned by any class with access to the ResourceController.
 *
 * Go and see ResourceWrapper for details of the basic REST calls that can be made to the remote resource(s).
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "mobilehr/widgets/utils/restclient/ResourceWrapper"],
    function (declare, ResourceWrapper) {
        return declare("mobilehr.widgets.utils.restclient.ResourceController", ResourceWrapper, {
            /**
             * Set all our callbacks to null
             */
            constructor:function () {
                this.preCreateCallback = null;
                this.preRetrieveCallback = null;
                this.preUpdateCallback = null;
                this.preDeleteCallback = null;
                this.postCreateCallback = null;
                this.postRetrieveCallback = null;
                this.postUpdateCallback = null;
                this.postDeleteCallback = null;
            },
            // ======================================================================
            // Register any pre or post create, retrieve, update, or delete callbacks
            // ======================================================================
            registerPreCreateCallback:function (f) {
                this.preCreateCallback = f;
            },
            registerPreRetrieveCallback:function (f) {
                this.preRetrieveCallback = f;
            },
            registerPreUpdateCallback:function (f) {
                this.preUpdateRequestCallback = f;
            },
            registerPreDeleteCallback:function (f) {
                this.preDeleteCallback = f;
            },
            registerPostCreateCallback:function (f) {
                this.postCreateCallback = f;
            },
            registerPostRetrieveCallback:function (f) {
                this.postRetrieveCallback = f;
            },
            registerPostUpdateCallback:function (f) {
                this.postUpdateCallback = f;
            },
            registerPostDeleteCallback:function (f) {
                this.postDeleteCallback = f;
            },
            // ==============================================================
            // Overridden methods that call the currently registered callback
            // ==============================================================
            preCreate:function () {
                if (this.preCreateCallback != null && typeof this.preCreateCallback === "function") {
                    this.preCreateCallback();
                }
            },
            preRetrieve:function () {
                if (this.preRetrieveCallback !== null && typeof this.preRetrieveCallback === "function") {
                    this.preRetrieveCallback();
                }
            },
            preUpdate:function () {
                if (this.preUpdateCallback != null && typeof this.preUpdateCallback === "function") {
                    this.preUpdateCallback();
                }
            },
            preDelete:function () {
                if (this.preDeleteCallback != null && typeof this.preDeleteCallback === "function") {
                    this.preDeleteCallback();
                }
            },
            postCreate:function () {
                if (this.postCreateCallback != null && typeof this.postCreateCallback === "function") {
                    this.postCreateCallback();
                }
            },
            postRetrieve:function () {
                if (this.postRetrieveCallback != null && typeof this.postRetrieveCallback === "function") {
                    this.postRetrieveCallback();
                }
            },
            postUpdate:function () {
                if (this.postUpdateCallback != null && typeof this.postUpdateCallback === "function") {
                    this.postUpdateCallback();
                }
            },
            postDelete:function () {
                if (this.postDeleteCallback != null && typeof this.postDeleteCallback === "function") {
                    this.postDeleteCallback();
                }
            }
        });
    });