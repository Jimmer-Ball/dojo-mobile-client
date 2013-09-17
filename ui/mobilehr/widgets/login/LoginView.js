/**
 * The login view for the mobile application presented to a user when they enter the application as determined
 * by the data-dojo-props="selected:true" item on the view definition in index.jsp.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/connect", "dijit/registry",
    "dojox/mobile/ScrollableView", "mobilehr/mixins/WidgetHelper", "mobilehr/mixins/RepresentationHelper"],
    function (declare, lang, array, connect, registry, ScrollableView, WidgetHelper, RepresentationHelper) {
        //noinspection JSUnusedLocalSymbols
        return declare("mobilehr.widgets.login.LoginView",
            [ScrollableView, WidgetHelper, RepresentationHelper], {
                constructor:function () {
                    this.loginHeading = null;
                    this.email = null;
                    this.password = null;
                    this.loginListItem = null;
                    this.errorPlaceHolder = null;
                    this.loginInstructions = null;
                    this.loginEmailTitle = null;
                    this.loginPasswordTitle = null;
                    this._subscriptions = [];
                },
                /**
                 * When the widget is started up get handles to all children and connect up the dynamic behaviour.
                 */
                startup:function () {
                    this.inherited(arguments);
                    this.loginHeading = registry.byId("loginHeading");
                    this.loginHeading._setLabelAttr(_lexicon.applicationTitle);
                    this.email = registry.byId("email");
                    this.password = registry.byId("password");
                    this.loginListItem = registry.byId("loginListItem");
                    this.errorPlaceHolder = this.$("loginError");
                    this.loginInstructions = this.$("loginInstructions");
                    this.loginEmailTitle = this.$("loginEmailTitle");
                    this.loginPasswordTitle = this.$("loginPasswordTitle");
                    this.loginInstructions.innerHTML = _lexicon.loginInstructions;
                    this.loginEmailTitle.innerHTML = _lexicon.loginEmailTitle;
                    this.loginPasswordTitle.innerHTML = _lexicon.loginPasswordTitle;
                    this.email.set("placeholder", _lexicon.emailInputPlaceholder);
                    this.loginListItem._setLabelAttr(_lexicon.loginListItemLabel);
                    this._subscriptions.push([
                        connect.connect(this.email.domNode, "onclick", lang.hitch(this, "_emailClicked")),
                        connect.connect(this.loginListItem.domNode, "onclick", lang.hitch(this, "_loginClicked"))]);
                },
                /**
                 * When the login transition is clicked, get the email and password details provided, and POST our credentials
                 * to the login resource on the API service .  On response, our registered callback _postLogin will be called,
                 * from where we process the response from the API Service.
                 */
                _loginClicked:function () {
                    var email = this.email.get("value");
                    var password = this.password.get("value");
                    if (email && password) {
                        _resourceController.registerPostCreateCallback(lang.hitch(this, "_postLogin"));
                        _resourceController.doCreate({email:email, password:password}, "services/mobile/login");
                    } else {
                        this.createMessageNodeContent(this.errorPlaceHolder, "loginInstructions");
                        this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                    }
                },
                /**
                 * Process the API service response to a login request and display it as returned in the
                 * errorPlaceHolder without navigating away from the view.
                 */
                _postLogin:function () {
                    switch (_resourceController.responseCode) {
                        case 0 :
                            this.errorPlaceHolder.innerHTML = this.getUnreachableURIDetailsForNode();
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        case 201 :
                            // Populate the ActionView with the set of home links we got in our authentication response
                            // and navigate to the view using slide.
                            var dto = _resourceController.responseData;
                            if (this.validAuthenticationResponse(dto)) {
                                var toView = registry.byId("actions");
                                toView.createContent(dto);
                                this.performTransition(toView.id, 1, "slide");
                            } else {
                                this.create400SeriesErrorNodeContent(this.errorPlaceHolder, "errorUnreadableAuthResponse");
                                this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            }
                            break;
                        case 400 :
                            this.create400ErrorNodeContent(this.errorPlaceHolder, _resourceController.responseData);
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        case 401 :
                            this.create400SeriesErrorNodeContent(this.errorPlaceHolder, "error401");
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        case 403:
                            this.create400SeriesErrorNodeContent(this.errorPlaceHolder, "error403");
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        case 404 :
                            this.create400SeriesErrorNodeContent(this.errorPlaceHolder, "error404");
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        case 500 :
                            this.create500SeriesErrorNodeContent(this.errorPlaceHolder, _resourceController.responseData);
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                        default:
                            this.create400SeriesErrorNodeContent(this.errorPlaceHolder, "errorUnknown");
                            this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusRevealed", "mobilehrErrorStatusHidden");
                            break;
                    }
                },
                /**
                 * Reset the email and password settings and clear any error messages when coming back into this
                 * view by overriding the right plugin point provided by the base class View to clear out our fields
                 * and reset the content.
                 *
                 * @param moveTo destination view id
                 * @param dir direction (1 = forwards,-1 = reverse)
                 * @param transition "slide", "fade", or "flip"
                 * @param context what will the callback function receive as this
                 * @param method callback function on transition finish
                 */
                onBeforeTransitionIn:function (moveTo, dir, transition, context, method) {
                    this.email.reset();
                    this.password.reset();
                    this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusHidden", "mobilehrErrorStatusRevealed");
                    this.errorPlaceHolder.innerHTML = "";
                },
                /**
                 * Clear out any displayed error message if our user is trying to provide credentials
                 */
                _emailClicked:function () {
                    if (this.errorPlaceHolder.innerHTML !== "") {
                        this.switchClassesOnNode(this.errorPlaceHolder, "mobilehrErrorStatusHidden",
                            "mobilehrErrorStatusRevealed");
                        this.errorPlaceHolder.innerHTML = "";
                    }
                },
                /**
                 * When the widget is destroyed
                 */
                destroy:function () {
                    array.forEach(this._subscriptions, connect.disconnect);
                    this.inherited(arguments);
                }
            });
    });