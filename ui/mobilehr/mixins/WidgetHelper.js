/**
 * Mixin for common widget functions.  So, error handling, error display, date localisation, spin wheel
 * management.  Put common routines in here if they will be used by more than one widget, and are not
 * representation specific bits of code (which go in RepresentationHelper).
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/dom-class", "dojo/_base/window", "dojo/date/locale", "dojo/dom-construct",
    "dojo/date", "dojox/mobile/RoundRectList", "dojox/mobile/TransitionEvent", "mobilehr/mixins/ServiceErrorHelper"],
    function (declare, domClass, win, dateLocale, domConstruct, dojoDate, RoundRectList, TransitionEvent, ServiceErrorHelper) {
        return declare("mobilehr.mixins.WidgetHelper", [ServiceErrorHelper], {
            /**
             * Common behaviour for going back to the login view using a transition event on 401 UNAUTHORIZED
             */
            BACK_TO_LOGIN_VIEW_TRANSITION:{moveTo:"login", href:null, url:null, scene:null, transition:"slide", transitionDir:-1},
            /**
             * Given the input domNode switch classes on the node.  Useful for doing things like a simple
             * reveal or a simple hide of a given DOM node.  We remove the remove class first, and then add
             * the add class.
             *
             * @param domNode dom node
             * @param addCssClass add CSS class
             * @param removeCssClass remove CSS class
             */
            switchClassesOnNode:function (domNode, addCssClass, removeCssClass) {
                domClass.toggle(domNode, removeCssClass, false);
                domClass.toggle(domNode, addCssClass, true);
            },
            /**
             * Substitute objects into a template without using DOJO templates for performance reasons.
             * The substitution here uses regular expressions to do a global replace, avoiding the XHR
             * synchronous get on "cached" template files the Dojo template system uses which may/may not work
             * on mobiles.
             *
             * @param template template
             * @param obj objects to push in
             */
            substitute:function (template, obj) {
                return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
                    return obj[key];
                });
            },
            /**
             * Find all elements on the basis of class name under an input parent or root node
             *
             * @param cssClass CSS class
             * @param rootNode parent or root node
             */
            getElements:function (cssClass, rootNode) {
                return (rootNode || win.body()).getElementsByClassName(cssClass);
            },
            /**
             * Get a document DOM element given its input identifier
             *
             * @param id identifier
             */
            $:function (id) {
                return document.getElementById(id);
            },
            /**
             * Convert the input timestamp into a locale specific date and time string
             *
             * @param timestamp timestamp to convert
             */
            convertToFullDate:function (timestamp) {
                if (timestamp && timestamp !== "") {
                    var date = new Date(timestamp);
                    return dateLocale.format(date, {formatLength:"short"});
                } else {
                    return null;
                }
            },
            /**
             * Convert the input timestamp into a locale specific date only string
             *
             * @param timestamp timestamp to convert
             */
            convertToDateOnly:function (timestamp) {
                if (timestamp && timestamp !== "") {
                    var date = new Date(timestamp);
                    return dateLocale.format(date, {selector:"date", formatLength:"short"});
                } else {
                    return null;
                }
            },
            /**
             * Provide a UTC timestamp date regardless of the locale of the client.  This maps perfectly
             * to a UTC java.util.Date at the API which is exactly what we want for any timestamps that
             * come in from various locales around the world given we are an i18n application.
             */
            getUTCTimestamp:function () {
                return new Date().toUTCString();
            },
            /**
             * Ensure that the currency string supplied is formatted to 2 d.p.
             *
             * @param currencyString    a string that should represent a currency value
             */
            convertToCurrency:function (currencyString) {
                if (isNaN(currencyString)) {
                    return  "0.00";
                }
                return parseFloat(currencyString).toFixed(2);
            },
            /**
             * Return whether the input array of objects already contains a member holding the
             * input member's variable name at the input value.  So, if you will, deep comparison of
             * complex objects in terms of any equality measure you can state via a member and
             * via a member's value.
             *
             * Obviously the assumption is that the set of values for all the array members of the given
             * member variable holds unique values across the set, else you are not comparing unique
             * things.
             *
             * @param arr array to work on
             * @param member variable of array members to compare for equality
             * @param value to compare the input member variable against
             */
            contains:function (arr, member, value) {
                var isMember = false;
                for (var i = 0; i < arr.length; i += 1) {
                    var item = arr[i];
                    if (item[member] === value) {
                        isMember = true;
                        break;
                    }
                }
                return isMember;
            },
            /**
             * Translate from the default Dojox date spinner format of "yyyy-MMM-d" to the API format of "yyyy-MM-dd".
             *
             * @param year in yyyy
             * @param month in MMM abbreviated format
             * @param day in d format
             * @return Date in the format of yyyy-MMM-d (e.g. 2012-May-1)
             */
            getDateProvidedFromSpinner:function (year, month, day) {
                return dateLocale.parse([year, "-", month, "-", day].join(""), {datePattern:"yyyy-MMM-d", selector:"date"});
            },
            /**
             * A valid date range is when the end date is greater than or equal to the start date.
             *
             * @param startDate
             * @param endDate
             */
            validDateRange:function (startDate, endDate) {
                var endDateIsGreaterOrEqualToStartDate = dojoDate.compare(endDate, startDate, "date");
                return (endDateIsGreaterOrEqualToStartDate === 0 || endDateIsGreaterOrEqualToStartDate === 1);
            },
            /**
             * Return a structure holding whether the start and end dates are on the weekend
             *
             * @param startDate startDate
             * @param endDate endDate
             */
            areOnTheWeekend:function (startDate, endDate) {
                var startOnWeekend = this.isOnTheWeekend(startDate);
                var endOnWeekend = this.isOnTheWeekend(endDate);
                return startOnWeekend === true && endOnWeekend === true ? "both" :
                    startOnWeekend === true ? "start" : endOnWeekend === true ? "end" : "neither";
            },
            /**
             * Return whether or not the input date is on the weekend or not.
             *
             * @param date
             * @return true if the input date falls on the weekend, false otherwise
             */
            isOnTheWeekend:function (date) {
                return dateLocale.isWeekend(date);
            },
            /**
             * We have to compare 24 hour clock times on the same day to ensure the end time is greater than the start
             * time.  For example, booking leave on the same day where end time is 9:00 and start time is 13:00 is just
             * plain wrong.
             *
             * @param startHours start hours
             * @param startMinutes start minutes
             * @param endHours end hours
             * @param endMinutes end minutes
             */
            validSameDayTimeRange:function (startHours, startMinutes, endHours, endMinutes) {
                return endHours > startHours ? true : endMinutes > startMinutes;
            },
            /**
             * Translate from a JavaScript date in the default Dojox date spinner format of "yyyy-MMM-d" to the API
             * date string format of "yyyy-MM-dd".
             *
             * @param date JavaScript date in "yyyy-MMM-d" format
             * @return date string in the format of yyyy-MM-dd (e.g. 2012-07-01) as required by the API
             */
            translateToAPIDateString:function (date) {
                return dateLocale.format(date, {datePattern:"yyyy-MM-dd", selector:"date"});
            },
            /**
             * Translate from a yyyy-MM-dd date string into something localised a user will see the
             * day name in. But, there is a bug in dojo.date.locale.format meaning the most direct
             * route of using:-
             *
             * locale.format(locale.parse(dateString, {selector: "date", datePattern: "yyyy-MM-dd"}),{selector: "date", datePattern:"EEEE, MMMM dd, yyyy"});
             *
             * doesn't work inside a minimised build in dojo 1.7.2. So we have had to go the long way round.
             *
             * @param dateString in short format yyyy-MM-dd
             * @return dateString in long format that also holds the day details EEEE, MMMM dd, yyyy
             */
            translateToFullDateString:function (dateString) {
                var parsedDate = dateLocale.parse(dateString, {selector:"date", datePattern:"yyyy-MM-dd"});
                var year = parsedDate.getFullYear();
                var dayOfMonth = parsedDate.getDate();
                var day = dateLocale.getNames("days", "wide", "standAlone")[parsedDate.getDay()];
                var month = dateLocale.getNames("months", "wide", "standAlone")[parsedDate.getMonth()];
                return [day, ", ", dayOfMonth, " ", month, ", ", year].join("");
            },
            /**
             * Create a list widget of the given identifier
             *
             * @param identifier identifier
             */
            createListWidget:function (identifier) {
                return new RoundRectList({id:identifier});
            },
            /**
             * Display an API service error in the provided DOM error node.
             *
             * Special case 0 is what XHR returns in both Firefox and Chrome when a URI is unreachable from the XHR
             * request used to talk to the service.
             *
             * @param errorNode error node for displaying an error
             * @param serviceError service error
             * @param custom404Message custom 404 message to display if a 404 NOT FOUND has been returned. If null
             * display the standard 404 details from the lexicon
             */
            displayServiceErrorNodeContent:function (responseCode, errorNode, serviceError, custom404Message) {
                switch (responseCode) {
                    case 0:
                        errorNode.innerHTML = this.getUnreachableURIDetailsForNode();
                        break;
                    case 400 :
                        errorNode.innerHTML = this.create400ErrorContent(serviceError);
                        break;
                    case 403:
                        errorNode.innerHTML = this.create400SeriesErrorContent("error403");
                        break;
                    case 404 :
                        if (custom404Message !== null && (typeof custom404Message !== 'undefined')) {
                            errorNode.innerHTML = this.create400SeriesErrorContent(custom404Message);
                        } else {
                            errorNode.innerHTML = this.create400SeriesErrorContent("error404");
                        }
                        break;
                    case 500 :
                        errorNode.innerHTML = this.create500SeriesErrorContent(serviceError);
                        break;
                    default:
                        errorNode.innerHTML = this.create400SeriesErrorContent("errorUnknown");
                        break;
                }
            },
            /**
             * Display a standard error dialog on the basis of the return status of the service and the contents of
             * the lexicon.
             *
             * Special case 0 is what XHR returns in both Firefox and Chrome when a URI is unreachable from the XHR
             * request used to talk to the service.
             *
             * @param dialogTitle title of dialog
             * @param confirmationLabel confirmation label to display
             * @param dialog handle to dialog to use
             * @param custom404Message custom 404 message to display if a 404 NOT FOUND has been returned. If null
             * display the standard 404 message.
             */
            displayServiceErrorDialog:function (dialogTitle, confirmationLabel, dialog,
                                                custom404Message, custom400Message) {
                switch (_resourceController.responseCode) {
                    case 0:
                        dialog.show(dialogTitle, [_lexicon.error0, _resourceController.xhrArgs.url].join(""),
                            _lexicon.dialogConfirmationButtonLabel);
                        break;
                    case 400:
                        if (custom400Message !== null && (typeof custom400Message !== 'undefined')) {
                            dialog.show(dialogTitle, _lexicon[custom400Message], _lexicon.dialogConfirmationButtonLabel);
                        } else {
                            dialog.show(dialogTitle, this.create400ErrorContent(_resourceController.responseData), confirmationLabel);
                        }
                        break;
                    case 403:
                        dialog.show(dialogTitle, _lexicon.error403, _lexicon.dialogConfirmationButtonLabel);
                        break;
                    case 404 :
                        if (custom404Message !== null && (typeof custom404Message !== 'undefined')) {
                            dialog.show(dialogTitle, _lexicon[custom404Message], _lexicon.dialogConfirmationButtonLabel);
                        } else {
                            dialog.show(dialogTitle, _lexicon.error404, _lexicon.dialogConfirmationButtonLabel);
                        }
                        break;
                    case 500 :
                        dialog.show(dialogTitle, this.create500SeriesErrorContent(_resourceController.responseData), confirmationLabel);
                        break;
                    default:
                        dialog.show(dialogTitle, _lexicon.errorUnknown, confirmationLabel);
                        break;
                }
            },
            /**
             * Build the DOM details of an unreachable URI
             *
             * @return the details of an unreachable URI
             */
            getUnreachableURIDetailsForNode: function () {
            return ['<div style="text-align: center;">', _lexicon.error0, _resourceController.xhrArgs.url , '</div>'].join("");
            },
            /**
             * Provide a simple message to the user in the event of a 400 series error response from the service
             * within the input node's inner HTML formatted in the centre of the input DOM
             *
             * @param node DOM node whose innerHTML we will update
             * @param lexiconIdentifier lexicon parameter identifier
             */
            create400SeriesErrorNodeContent:function (node, lexiconIdentifier) {
                node.innerHTML = this.create400SeriesErrorContent(lexiconIdentifier);
            },
            /**
             * Build the HTML content for a 400 series error
             *
             * @param lexiconIdentifier lexicon parameter identifier
             */
            create400SeriesErrorContent:function (lexiconIdentifier) {
                return this.createMessageContent(lexiconIdentifier);
            },
            /**
             * Given the input lexicon identifier, return a simple DIV holding the message details
             *
             * @param lexiconIdentifier lexicon parameter identifier
             * @param contentClass      CSS class to apply to message content
             */
            createMessageContent:function (lexiconIdentifier, contentClass) {
                if (contentClass !== null) {
                    return  ['<div class="', contentClass,'">', _lexicon[lexiconIdentifier], '</div>'].join("");
                }
                return ['<div style="text-align: center;">', _lexicon[lexiconIdentifier], '</div>'].join("");
            },
            /**
             * Given the input node and lexicon identifier, put the content inside the HTML node
             *
             * @param node DOM node
             * @param lexiconIdentifier lexicon identifier
             * @param contentClass an optional CSS class we can use to style the content of the message node (optional)
             */
            createMessageNodeContent:function (node, lexiconIdentifier, contentClass) {
                node.innerHTML = this.createMessageContent(lexiconIdentifier, contentClass);
            },
            /**
             * Given the input node and service error, update the node's inner HTML with details of the message
             *
             * @param node HTML node
             * @param serviceError service error
             */
            create500SeriesErrorNodeContent:function (node, serviceError) {
                node.innerHTML = this.create500SeriesErrorContent(serviceError);
            },
            /**
             * Given the input node and service error, update the node's inner HTML with details of the message
             *
             * @param node HTML node
             * @param serviceError service error
             */
            create400ErrorNodeContent:function (node, serviceError) {
                node.innerHTML = this.create400ErrorContent(serviceError);
            },
            /**
             * Return standard HTML content for a 500 series service error, so when the API hits an unexpected error.
             * The key thing here is we need to communicate the errorIdentifier to the user, so when they ring support
             * they can give customer support the key they need to look in the bufferedWrite log and so begin the diagnosis
             * of the error.
             *
             * @param serviceError service error
             */
            create500SeriesErrorContent:function (serviceError) {
                // check whether the key we expect the user to pass to support is available, the response should contain
                // this data if the API code constructed the response
                if (serviceError.errorIdentifier != null) {
                    return ['<div style="text-align: center;">', _lexicon.error500Start,
                        serviceError.errorIdentifier, _lexicon.error500End, serviceError.description, '</div>'].join("");
                } else {
                    // if the key was not available then something has gone wrong with our request handling and the
                    // server has returned the response on behalf of the API, ask the user to note the time if they
                    // wish to report the error
                    return ['<div style="text-align: center;">', _lexicon.error500ServerError, '</div>'].join("");
                }
            },
            /**
             * Return standard HTML content for a 400 (Bad Request) service error, so when the API hits a validation
             * error.
             *
             * @param serviceError service error
             */
            create400ErrorContent:function (serviceError) {
                var i18nServiceErrorMessage = this.getServiceErrorMessage(serviceError);
                if (i18nServiceErrorMessage != null && i18nServiceErrorMessage != 'undefined') {
                    return ['<div style="text-align: center;">', i18nServiceErrorMessage, '</div>'].join("");
                } else {
                    return ['<div style="text-align: center;">', _lexicon.error400Start,
                        serviceError.errorIdentifier, _lexicon.error400End, serviceError.description, '</div>'].join("");
                }
            },
            /**
             * Given the booking type return an i18n label to use for display of that type
             *
             * @param type FULL, AM, PM, TIME
             */
            getBookingTypeLabel:function (type) {
                return _lexicon[["bookLeaveBookingType", type].join("")];
            },
            /**
             * Get the standard time format string required by the API
             *
             * @param hours hours
             * @param minutes minutes
             */
            getAPITimeString:function (/*Integer*/hours, /*Integer*/minutes) {
                return [this.padTimeComponentWithZero(hours) + ":" + this.padTimeComponentWithZero(minutes)].join("");
            },
            /**
             * Go from a numeric minutes/hours value and turn it into a string that is prefixed with zero if less
             * than 10.
             *
             * @param timeComponent minutes/hours string
             * @return timeComponent string prefixed with zero if less than 10.
             */
            padTimeComponentWithZero:function (/*Integer*/timeComponent) {
                return (timeComponent < 10 ? "0" : "") + timeComponent;
            },
            /**
             * Go from an input hours/minutes formatted string and return a hours/minutes integer value
             *
             * @param timeComponent string
             * @return the timeComponent as an integer
             */
            stripTimeComponentToInteger:function (timeComponent) {
                if (typeof timeComponent === "string") {
                    var startingCharacter = timeComponent.substring(0, 1);
                    if (startingCharacter === '0') {
                        return parseInt(timeComponent.substring(1));
                    } else {
                        return parseInt(timeComponent);
                    }
                } else {
                    return timeComponent;
                }
            },
            /**
             * Navigate using a "slide" transition "backwards" to the login view from the input domNode used for
             * common navigation "back" to the login view in the event of the API service returning a 401 UNAUTHORIZED
             *
             * @param domNode to transition back from
             */
            goBackToLoginView:function (domNode) {
                new TransitionEvent(domNode, this.BACK_TO_LOGIN_VIEW_TRANSITION).dispatch();
            },
            /**
             * Determine whether the UI has been launched from an iPhone home page in web-app mode as opposed to
             * manually from the Safari browser.
             *
             * When the application is launched by an iPhone via a home page item (WebClip) iOS launches
             * the bookmarked web site as a pseudo-application. Safari is launched with its top and bottom
             * bars hidden, this is known as App Mode as enabled by the apps apple-mobile-web-app-capable
             * setting (see index.jsp).
             *
             * @return true if we detect that the app has been launched in "standalone" mode, false otherwise
             */
            detectiPhoneStandaloneAppMode:function() {
                return (("standalone" in window.navigator) && window.navigator.standalone);
            },
            /**
             * Utility function to determine whether a map is empty (can be used on any object as all Js objects
             * are associative arrays i.e. maps).
             *
             * @param map the map we want to know is empty or not
             */
            isEmpty: function(map) {
                for(var key in map) {
                    if (map.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            },
            /**
             * Utility wrapper for the empty function of the dom-construct module. It empties the contents of a DOM
             * element, deleting all the children but keeping the node there.
             *
             * @param nodeToEmpty the node whose children we wish to remove
             */
            emptyNode: function(nodeToEmpty) {
                domConstruct.empty(nodeToEmpty);
            },
            /**
             * Resets the list based view by removing all of the child widgets in a safe manner. Sometimes we add
             * messages to our RoundRectLists as well as actual list items so if we call destroyDescendants we will
             * remove all sub widgets but may leave these extra messages. This function ensures that the list is
             * cleared out completely.
             *
             * @param listNode an instance of dojox.mobile.RoundRectList
             */
            clearListWidget : function(/*dojox.mobile.RoundRectList*/ listNode) {
                // destroy the child list item widgets
                listNode.destroyDescendants();
                // clear out any hangers on
                this.emptyNode(listNode.containerNode);
            }
        });
    });