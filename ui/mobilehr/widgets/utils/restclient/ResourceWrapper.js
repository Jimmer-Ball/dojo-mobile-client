/**
 * Wrapper for communicating to a remote (but still in-same-domain) REST resource using JSON over AJAX/XHR
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/xhr", "dojo/_base/json"],
    function (declare, lang, xhr, json) {
        return declare("mobilehr.widgets.utils.restclient.ResourceWrapper", null, {
            /**
             * At some point we may need to use DAP MIME types, not just plain json to perhaps allow API versions.
             */
            constructor:function () {
                this.requestURL = null;
                this.requestBody = null;
                this.responseData = null;
                this.responseCode = null;
                this.token = null;
                this.type = "json";
                this.accept = "application/json";
                this.xhrArgs = {};
            },
            /**
             * Send a create request to a resource (POST)
             *
             * @param data data to create
             * @param resourceURL resource URL
             */
            doCreate:function (data, resourceURL) {
                this.requestURL = resourceURL;
                if (data !== null) {
                    this.requestBody = json.toJson(data);
                } else {
                    this.requestBody = null;
                }
                this._setHandlersAndHeaders("_standardCreateResponseHandler", resourceURL);
                if (data !== null) {
                    this.xhrArgs.postData = json.toJson(data);
                } else {
                    this.xhrArgs.postData = null;
                }
                this.preCreate();
                xhr.post(this.xhrArgs);
            },
            /**
             * Send a retrieve request to a resource (GET)
             *
             * @param resourceURL resource URL
             */
            doRetrieve:function (resourceURL) {
                this.requestURL = resourceURL;
                this.requestBody = null;
                this._setHandlersAndHeaders("_standardRetrieveResponseHandler", resourceURL);
                this.preRetrieve();
                xhr.get(this.xhrArgs);
            },
            /**
             * Send an update request to a resource (PUT)
             *
             * @param data data to update
             * @param resourceURL resource URL
             */
            doUpdate:function (data, resourceURL) {
                this.requestURL = resourceURL;
                this.requestBody = json.toJson(data);
                this._setHandlersAndHeaders("_standardUpdateResponseHandler", resourceURL);
                this.xhrArgs.putData = json.toJson(data);
                this.preUpdate();
                xhr.put(this.xhrArgs);
            },
            /**
             * Send a delete request to a resource (DELETE)
             *
             * @param resourceURL resource URL
             */
            doDelete:function (resourceURL) {
                this.requestURL = resourceURL;
                this.requestBody = null;
                this._setHandlersAndHeaders("_standardDeleteResponseHandler", resourceURL);
                this.preDelete();
                xhr.del(this.xhrArgs);
            },
            /**
             * Pre process the outgoing create request details any way you want.
             */
            preCreate:function () {
            },
            /**
             * Pre process the outgoing retrieve request details any way you want.
             */
            preRetrieve:function () {
            },
            /**
             * Pre process the outgoing update request details any way you want.
             */
            preUpdate:function () {
            },
            /**
             * Pre process the outgoing delete request details any way you want.
             */
            preDelete:function () {
            },
            /**
             * Post process the incoming response to a create request any way you want.
             */
            postCreate:function () {
            },
            /**
             * Post process the incoming response to a retrieve request any way you want.
             */
            postRetrieve:function () {
            },
            /**
             * Post process the incoming response to an update request any way you want.
             */
            postUpdate:function () {
            },
            /**
             * Post process the incoming response to a delete request any way you want.
             */
            postDelete:function () {
            },
            /**
             * Tidy up any child objects as required
             */
            destroy:function () {
            },
            /**
             * Set the response handler, the type of the payload expected both on request
             * and response, and set the request headers appropriately. The headers needed
             * are Accept for us to say to the service, this is the type of data we want in
             * the response, Content-Type for us to let the service know the type of data we
             * are sending it, and Authorization to hold our token we got when we first logged
             * in.
             *
             * @param methodName name of method to hitch to
             * @param resourceURL resourceURL to use
             */
            _setHandlersAndHeaders:function (methodName, resourceURL) {
                this.xhrArgs.url = resourceURL;
                this.xhrArgs.failOk = true;
                this.xhrArgs.handleAs = this.type;
                // Stop IE caching request results to the same URL
                this.xhrArgs.preventCache = true;
                // Attempting to set the contentType as part of the headers collection causes a bug in Chrome and
                // Safari.  So instead we use the xhrArgs member "contentType" to do the same job. See the bug
                // report http://bugs.dojotoolkit.org/ticket/14993 for details of the issue down in xhr.js.
                this.xhrArgs.contentType = this.accept;
                // Note we hitch the scope of this (so any derived class too) to the handler
                this.xhrArgs.handle = lang.hitch(this, methodName);
                // If we have already been authenticated then put the token in the Authorization header
                if (this.token) {
                    this.xhrArgs.headers = {"Accept":this.accept, "Authorization":this.token};
                } else {
                    this.xhrArgs.headers = {"Accept":this.accept};
                }
            },
            /**
             * Standard create response handler that obtains the data and calls any registered callback
             *
             * @param data data
             * @param ioargs ioargs
             */
            _standardCreateResponseHandler:function (data, ioargs) {
                this._standardResponseHandler(data, ioargs);
                this.postCreate();
            },
            /**
             * Standard retrieve response handler that obtains the data and calls any registered callback
             *
             * @param data data
             * @param ioargs ioargs
             */
            _standardRetrieveResponseHandler:function (data, ioargs) {
                this._standardResponseHandler(data, ioargs);
                this.postRetrieve();
            },
            /**
             * Standard update response handler that obtains the data and calls any registered callback
             *
             * @param data data
             * @param ioargs ioargs
             */
            _standardUpdateResponseHandler:function (data, ioargs) {
                this._standardResponseHandler(data, ioargs);
                this.postUpdate();
            },
            /**
             * Standard delete response handler that obtains the data and calls any registered callback
             *
             * @param data data
             * @param ioargs ioargs
             */
            _standardDeleteResponseHandler:function (data, ioargs) {
                this._standardResponseHandler(data, ioargs);
                this.postDelete();
            },
            /**
             * Standard response handler that convert the response into a JS object which may or may not be empty
             *
             * @param data What the xhr library thinks the data should be.  This only contains meaningful data when the
             *             service end provides us with a response that fits with the returns in dojo._isDocumentOk.
             * @param ioargs Where the full information for any XmlHttpRequest gets placed including the raw payload and
             *               response code.
             */
            _standardResponseHandler:function (data, ioargs) {
                this.responseCode = ioargs.xhr.status;
                if (ioargs.xhr.responseText && ioargs.xhr.responseText !== "") {
                    if (ioargs.xhr.responseText.charAt(0) === '{') {
                        this.responseData = json.fromJson(ioargs.xhr.responseText);
                        // Reset the global token to whatever was provided too, if it exists
                        if (this.responseData.token) {
                            this.token = this.responseData.token;
                        }
                    } else {
                        this.responseData = {};
                    }
                } else {
                    this.responseData = {};
                }
            }
        });
    });

