/**
 * Helper mixin that translates the service error messages returned from the service. The service
 * speaks English but not all of our users do :(
 *
 * If there is something noteworthy in a service error message then we should be recorded and
 * retrieved by this helper.
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare"],
    function (declare) {
        return declare("mobilehr.mixins.ServiceErrorHelper", null, {

            /**
             * A map of service error message fragments and their corresponding lexicon entries.
             */
            SERVICE_ERROR_MATCHERS : {
                "email:must match" : "error400ForEmailValidation",
                "comments:must match": "error400ForCommentsValidation"
            },

            /**
             * Get an I18N service error message if one can be matched based on the serviceError's
             * description content.
             *
             * @param serviceError a service error representation returned from the service
             */
            getServiceErrorMessage: function(serviceError) {
                var errorMessage = null;
                // try and locate a match for the content of the supplied service error
                for (var matcher in this.SERVICE_ERROR_MATCHERS) {
                    if (this.SERVICE_ERROR_MATCHERS.hasOwnProperty(matcher)) {
                        if (serviceError.description && serviceError.description.search(matcher) == 0) {
                            errorMessage = _lexicon[this.SERVICE_ERROR_MATCHERS[matcher]];
                            break;
                        }
                    }
                }
                return errorMessage;
            }
    });
});