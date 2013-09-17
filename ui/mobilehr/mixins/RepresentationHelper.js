/**
 * Mixin for representation handling that any widget can use if needed. Put common representation handling code in
 * here.
 *
 * @author Jim Ball
 */
define(["dojo/_base/declare", "dojo/_base/array"],
    function (declare, array) {
        return declare("mobilehr.mixins.RepresentationHelper", null, {
            /**
             * The UUID of our imaginary "ALL" leave type a back-end doesn't provide but we have to display
             */
            ALL_LEAVE_TYPE_UUID:-99,
            /**
             * Check the authentication details structure we've been given is valid.
             *
             * @param authenticationDetails authentication details
             */
            validAuthenticationDetails:function (authenticationDetails) {
                if (authenticationDetails) {
                    return authenticationDetails.hasOwnProperty('email')
                        && authenticationDetails.hasOwnProperty('password')
                        && authenticationDetails.hasOwnProperty('links')
                        && this.validLinkStructure(authenticationDetails.links[0]);
                } else {
                    return false;
                }
            },
            /**
             * Check the validity of the authentication response provided
             *
             * @param authenticationResponse authentication response
             */
            validAuthenticationResponse:function (authenticationResponse) {
                if (authenticationResponse) {
                    return authenticationResponse.hasOwnProperty('token')
                        && authenticationResponse.hasOwnProperty('links')
                        && this.validLinksStructure(authenticationResponse.links);
                } else {
                    return false;
                }
            },
            /**
             * Check the validity of a service error response returned.  report the errorIdentifier to the
             * user, as this value will be used to trace to the bufferedWrite log, and provide additional description
             * information if needed.
             *
             * @param serviceError service error from remote API Service instance
             */
            validServiceError:function (serviceError) {
                if (serviceError) {
                    return serviceError.hasOwnProperty('errorIdentifier')
                        && serviceError.hasOwnProperty('description');
                } else {
                    return false;
                }
            },
            /**
             * Check all the input links are valid
             *
             * @param links links
             */
            validLinksStructure:function (links) {
                var validLink = true;
                array.forEach(links, function (link) {
                    validLink = this.validLinkStructure(link);
                    if (!validLink) {
                        return false;
                    }
                }, this);
                return true;
            },
            /**
             * Check the input link structure is valid
             *
             * @param link to check
             */
            validLinkStructure:function (link) {
                if (link) {
                    return link.hasOwnProperty('type')
                        && link.hasOwnProperty('href')
                        && link.hasOwnProperty('rel')
                        && link.hasOwnProperty('title')
                        && link.hasOwnProperty('verb');
                } else {
                    return false;
                }
            },
            /**
             * LeaveType structure used to select "All" types of leave when filtering the display of leave requests
             * on the basis of a user's choice of leave type(s) to display.  The API doesn't actually return a type
             * for "All" leave types, it isn't that clever, but we still need to give our UI users a chance to select
             * "All" leave types when filtering the display.
             */
            getAllLeaveType:function () {
                return {uuid:this.ALL_LEAVE_TYPE_UUID, leaveTypeName:_lexicon.missingAllCategory};
            },
            /**
             * Build a simple leave request authorisation or rejection structure that maps to the expected
             * format required at the API.
             *
             * @param leaveRequestUUID leave request UUID
             * @param submissionDate submission date
             * @param comments comments (may be null)
             */
            getLeaveRequestAuthStructure:function (leaveRequestUUID, submissionDate, comments) {
                if (comments && comments !== "") {
                    return {uuid:leaveRequestUUID, submissionDate:submissionDate, comments:comments};
                } else {
                    return {uuid:leaveRequestUUID, submissionDate:submissionDate, comments:null};
                }
            },
            /**
             * Given the input array of actions to authorise, build a completed leave requests authorisations
             * structure that can be passed back to the API.
             *
             * @param actions array of actions
             */
            getLeaveRequestAuthorisationsStructure:function (actions) {
                return {authoriseLeaveRequestActions:actions};
            },
            /**
             * Given the input array of actions to reject, build a completed leave requests rejections
             * structure that can be passed back to the API.
             *
             * @param actions array of actions
             */
            getLeaveRequestRejectionsStructure:function (actions) {
                return {rejectLeaveRequestActions:actions};
            },
            /**
             * Given the input entitlements that come back from the API, create an entitlements by leave types
             * structure, which is re-organised by leave type.  At our UI we need to organise our display on
             * the basis of entitlements applicable to leave types.  So, all entitlements of type "holiday"
             * for example.  This means re-arranging the data returned from the API accordingly, so its obvious
             * what entitlements there are for a given leave type.
             *
             * Here we create the basic structure without any associated entitlements, then we loop through the
             * set of entitlements again adding ones to the applicable entitlements array if the type matches.
             *
             * @param allEntitlements all applicable entitlements
             */
            createEntitlementsByTypesStructure:function (allEntitlements) {
                var entitlementsByTypes = [];
                array.forEach(allEntitlements, function (entitlement) {
                    if (!this.containsLeaveType(entitlementsByTypes, entitlement.leaveType)) {
                        entitlementsByTypes.push(this.createEntitlementsByTypeStructure(entitlement));
                    }
                }, this);
                array.forEach(allEntitlements, function (entitlement) {
                    this.addEntitlementToType(entitlementsByTypes, entitlement.leaveType, entitlement);
                }, this);
                return entitlementsByTypes;
            },
            /**
             * Does the input structure already hold a record whose leave type UUID matches the input leave type UUID?
             *
             * @param entitlementsByTypes entitlements mapped to leave types structure to search
             * @param leaveType type to match against
             */
            containsLeaveType:function (entitlementsByTypes, leaveType) {
                var isMember = false;
                for (var i = 0; i < entitlementsByTypes.length; i += 1) {
                    var entitlementsByType = entitlementsByTypes[i];
                    if (entitlementsByType.leaveType.uuid === leaveType.uuid) {
                        isMember = true;
                        break;
                    }
                }
                return isMember;
            },
            /**
             * Add the input entitlement to the appropriate record in the entitlementsByTypes structure
             * given the input leave type .
             *
             * @param entitlementsByTypes entitlements organised by leave types structure
             * @param leaveType leave type
             * @param entitlement entitlement
             */
            addEntitlementToType:function (entitlementsByTypes, leaveType, entitlement) {
                for (var i = 0; i < entitlementsByTypes.length; i += 1) {
                    var entitlementsByType = entitlementsByTypes[i];
                    if (entitlementsByType.leaveType.uuid === leaveType.uuid) {
                        entitlementsByType.entitlements.push(entitlement);
                    }
                }
            },
            /**
             * Create an individual empty entitlements by leave type structure.
             *
             * @param entitlement entitlement
             */
            createEntitlementsByTypeStructure:function (entitlement) {
                var entitlementsByType = {};
                entitlementsByType.leaveType = entitlement.leaveType;
                entitlementsByType.entitlements = [];
                return entitlementsByType;
            },
            /**
             * Get a leave request create action structure
             *
             * @param submissionDate
             * @param leaveEntitlementUuid
             * @param startDate
             * @param endDate
             * @param startDayType
             * @param endDayType
             * @param startTime
             * @param endTime
             * @param comments
             * @param actionFields
             */
            getLeaveRequestCreateActionStructure:function (submissionDate, leaveEntitlementUuid, startDate, endDate, startDayType, endDayType, startTime, endTime, comments, actionFields) {
                return {
                    submissionDate:submissionDate,
                    leaveEntitlementUuid:leaveEntitlementUuid,
                    startDate:startDate,
                    endDate:endDate,
                    startDayType:startDayType,
                    endDayType:endDayType,
                    startTime:startTime,
                    endTime:endTime,
                    comments:comments,
                    actionFields:actionFields};
            },
            /**
             * Get the leave request cancellation structure for submission to the service.
             *
             * @param uuid
             * @param submissionDate
             * @param comments
             */
            getLeaveRequestCancelActionStructure:function (uuid, submissionDate, comments) {
                if (comments && comments !== "") {
                    return {
                        uuid:uuid,
                        submissionDate:submissionDate,
                        comments:comments
                    }
                } else {
                    return {
                        uuid:uuid,
                        submissionDate:submissionDate,
                        comments:null
                    }
                }
            },
            /**
             * Return an action field
             * @param requiredFieldUuid
             * @param requiredFieldOptionUuid
             */
            getActionField:function (requiredFieldUuid, requiredFieldOptionUuid) {
                return {requiredFieldUuid:requiredFieldUuid, requiredFieldOptionUuid:requiredFieldOptionUuid};
            },

            /**
             * Dynamically determine the "view" that should be used to display a given representation based on
             * its "is" property. Typically views that display a single representation provide consistent
             * createContent functions so we can pass a representation of that type plus a back destination
             * without worrying about the mechanics of how that view actually works.
             *
             * If a suitable view is not located then null is returned to indicate to the client code that
             * we could not determine a suitable view for the representation provided.
             *
             * @param representation
             */
            getDestinationViewForRepresentation:function (representation) {
                if (representation.is) {
                    switch (representation.is) {
                        case "leaveRequest":
                            return "leaveRequest";
                        case "expenseAdvice":
                            return "expenseAdvice";
                        case "payAdvice":
                            return "payAdvice";
                        default :
                            return null;
                    }
                } else {
                    // return null to indicate we don't know of a view that supports the representation
                    return null;
                }
            }
        });
    });