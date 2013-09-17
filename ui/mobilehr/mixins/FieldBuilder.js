/**
 * Mixin for building field display DOM fragments using representations that are returned
 * from the API service. The widget provides functionality for processing standard and
 * required fields and makes use of an arbitrary field definition descriptors of the form:
 *
 * {
 *  fieldId: "payDate",
 *  fieldLabel: "Pay Date",
 *  dataType: "date"
 * }
 *
 * The properties of the descriptor are described thus
 * fieldId          - the name of the field that was returned in the representation
 * fieldLabel       - the text label to be displayed to the user
 * dataType          - the data type of this field (lets us format its value appropriately)
 * layout           - the way we should lay out this field, default formatting currently
 *                    positions a fields label above it value, we can override this by specifying
 *                    a format of "single" that place a fields label and value on a single row or
 *                    a format of "fullWidth" where a fields value spans the entire layout
 * descriptorField  - an extra piece of information that can be displayed with a field, it is placed
 *                    on the same row as the value but is not labelled (being part of the field that
 *                    already has a label)
 *
 * @author Rhys Evans
 */
define(["dojo/_base/declare", "mobilehr/mixins/WidgetHelper", "dojo/currency"],
    function (declare, WidgetHelper, currency) {
        return declare("mobilehr.mixins.FieldBuilder", [WidgetHelper], {

            /* Define static template members so they are evaluated once, please read the descriptions before use */

            /**
             * The table template that we populate our content with.
             */
            displayFieldTemplate:'<table width="100%" class="fieldDisplayTable"><tbody>${content}</tbody></table>',

            /**
             * Field row template to show two fields with each fields labels on the top row and their values
             * directly below the respective labels. This is the default layout applied to fields.
             *
             * |Field1Label      | Field2Label |
             * |Field1Value      | Field2Value |
             */
            twoRowTwoFieldTemplate:  ['<tr class="uiRowItem"><td valign="top"><span class="uiRowItemLabel">',
                '${label1}',
                '</span></td>',
                '<td align="right" class="uiRowItemLabel"><span>',
                '${label2}',
                '</span></td></tr>',
                '<tr><td valign="top"><span>',
                '${val1}',
                '</span></td>',
                '<td align="right"><span>',
                '${val2}',
                '</span></td></tr>'
            ].join(""),

            /**
             * Field row template to show a single field over two rows, with the value below the label. This
             * template is used when we have reached the end of a regular layout or when a single row field
             * is used in the middle of a field set.
             *
             * |FieldLabel      |    <Empty>|
             * |FieldValue      |    <Empty>|
             */
            twoRowOneFieldTemplate: ['<tr class="uiRowItem"><td valign="top"><span class="uiRowItemLabel">',
                '${label}',
                '</span></td>',
                '<td align="right"><span>',
                '</span></td></tr>',
                '<tr><td valign="top"><span>',
                '${value}',
                '</span></td>',
                '<td align="right"><span>',
                '</span></td></tr>'
            ].join(""),

            /**
             * Field row template to show a single field with a descriptor over two rows, descriptors allow
             * us to display extra related information about a field without describing that extra information.
             * Field definitions use the descriptorField property to indicate that this layout should be used.
             *
             * |FieldLabel      |           <Empty>|
             * |FieldValue      |   DescriptorValue|
             */
            twoRowOneFieldWithDescriptorTemplate:  ['<tr class="uiRowItem"><td valign="top"><span class="uiRowItemLabel">',
                '${label}',
                '</span></td>',
                '<td align="right"><span>',
                '</span></td></tr>',
                '<tr><td valign="top"><span>',
                '${value}',
                '</span></td>',
                '<td align="right"><span>',
                '${additionalInfo}',
                '</span></td></tr>'
            ].join(""),

            /**
             * Field row template to display a fields on a single row i.e.
             *
             * |FieldLabel  |   FieldValue|
             *
             * Corresponds to layout: "single" in a field descriptor object
             */
            singleRowTemplate: ['<tr><td valign="top"><span class="uiRowItemLabel">',
                '${label}',
                '</span></td>',
                '<td align="right"><span>',
                '${value}',
                '</span></td></tr>'
            ].join(""),

            /**
             * Field row template to display a field that spans the entire width of the display.
             * 
             * | FieldLabel             |
             * | FieldValue             |
             *
             * Corresponds to layout: "fullWidth" in a field descriptor object
             */
            twoRowSingleColumnTemplate: ['<tr><td valign="top" colspan="2"><span class="uiRowItemLabel">',
                '${label}',
                '</span></td>',
                '</tr>',
                '<tr><td colspan="2"><span>',
                '${value}',
                '</span></td></tr>'
            ].join(""),

            /**
             * Create the DOM elements for the supplied display fields array. A number of table row HTML
             * elements are created using the content of the DTO and returned as a String.
             *
             * @param displayFields an array of display fields objects that contain info on how to
             *                      display a particular piece of data within the dto that may or may not
             *                      exist
             * @param dto           a complex data object containing data that was returned from the API REST
             *                      service
             * @returns a collection of table row elements containing label : value pairs
             */
            createDisplayFields:function(/*Array*/displayFields, /*Object*/dto) {
                // HTML string that represents the fields plus data
                var displayFieldsContent = "";

                // store array length in var to prevent wasteful reevaluation upon iteration
                var displayFieldArrayLength = displayFields.length;
                for(var i = 0; i < displayFieldArrayLength; i++) {

                    var displayField = displayFields[i];

                    // evaluation of a field descriptor with regard to its layout follows a strict order
                    // - determine whether we have a descriptor type field as this needs two rows to itself
                    // - if not then determine whether the field has an alternative layout specified that we have to
                    //   adhere to
                    // - if there is no special layout info apply the default layout, this means taking two rows at
                    //   a time and displaying them side by side

                    // if a descriptor field is required then this field gets its own set of rows
                    if (displayField.descriptorField) {
                        // create a two row layout where there is a single label
                        displayFieldsContent = [
                            displayFieldsContent,
                            this.processFieldWithDescriptor(displayField, dto)
                        ].join("");
                    } else {
                        if (displayField.layout) {
                            displayFieldsContent =
                                this.processAlternativeLayoutFields(displayField, dto, displayFieldsContent);
                        } else {
                            // assume default layout
                            // no descriptor so this field will share a two row layout

                            // grab the next field
                            var secondField = displayFields[i + 1];
                            // there may not be another field, but if there is use it as long as our next
                            // field doesn't demand its own double row (i.e. a field with a descriptor) or
                            // its own single row
                            if (secondField && !(secondField.descriptorField) &&
                                !(secondField.layout)) {
                                // bump the loop counter as we have pinched the next field
                                i++;
                                // process these guys together
                                displayFieldsContent = [
                                    displayFieldsContent,
                                    this.processTwoFieldsTogether(displayField, secondField, dto)
                                ].join("");
                            } else {
                                // just process the last field on its own using the default layout
                                displayFieldsContent = [
                                    displayFieldsContent,
                                    this.processSingleField(displayField, dto)
                                ].join("");
                            }
                        }
                    }
                }

                var requiredFields = this.processRequiredFields(dto);

                // sandwich the content between the "T"OP and "B"OTTOM required fields
                var content = [requiredFields[0], displayFieldsContent, requiredFields[1]].join("");

                return this.substitute(this.displayFieldTemplate,
                    {content: content});
            },

            /**
             * Process fields whose descriptor indicates that they should have an alternative layout.
             *
             * @param displayField         field descriptor object
             * @param dto                  the object that contains our fields value
             * @param displayFieldsContent the current content we will be amending our new content to
             */
            processAlternativeLayoutFields: function(/*Object*/displayField, /*Object*/dto,
                /*String*/displayFieldsContent) {
                var fieldProps = null;
                var fieldHTML = "";
                if (displayField.layout === "single") {
                    // render field on single row
                    fieldProps = this.getFieldLabelAndValue(displayField, dto);
                    if (fieldProps !== null && fieldProps.length === 2) {
                        fieldHTML = this.substitute(this.singleRowTemplate,
                            {label: fieldProps[0], value: fieldProps[1]});
                        displayFieldsContent = [displayFieldsContent, fieldHTML
                        ].join("");
                    }
                } else if (displayField.layout === "fullWidth") {
                    // render a two row field where each field spans the entire display (one column)
                    fieldProps = this.getFieldLabelAndValue(displayField, dto);
                    if (fieldProps !== null && fieldProps.length === 2) {
                        fieldHTML = this.substitute(this.twoRowSingleColumnTemplate,
                            {label: fieldProps[0], value: fieldProps[1]});
                        displayFieldsContent = [displayFieldsContent, fieldHTML
                        ].join("");
                    }
                }
                return displayFieldsContent;
            },

            /**
             * Process the field descriptors provided using the dto and twoRowTwoFieldTemplate.
             *
             * @param field1 field descriptor object
             * @param field2 field descriptor object
             * @param dto    object that contains the fields actual values
             */
            processTwoFieldsTogether: function(/*Object*/field1, /*Object*/field2, /*Object*/dto) {
                try {
                    var field1Props = this.getFieldLabelAndValue(field1, dto);
                    var field2Props = this.getFieldLabelAndValue(field2, dto);

                    if (field1Props !== null && field1Props.length === 2
                        && field2Props !== null && field2Props.length === 2) {

                        return this.substitute(this.twoRowTwoFieldTemplate,
                        {
                            label1: field1Props[0],
                            label2: field2Props[0],
                            val1: field1Props[1],
                            val2: field2Props[1]
                        });
                    } else {
                        return "";
                    }
                } catch (e) {
                    // return an empty String if something goes awry just to be safe
                    return "";
                }
            },

            /**
             * Process the field descriptor provided using the dto and twoRowOneFieldTemplate template.
             *
             * @param field a field descriptor
             * @param dto   object that contains the fields value
             */
            processSingleField: function(/*Object*/field, /*Object*/dto) {
                try {
                    var fieldProps = this.getFieldLabelAndValue(field, dto);

                    if (fieldProps !== null) {
                        // return the two row layout with just the left hand side populated
                        return this.substitute(this.twoRowOneFieldTemplate, {
                            label: fieldProps[0], value: fieldProps[1]
                        });
                    } else {
                        return "";
                    }
                } catch (e) {
                    // return an empty String if something goes awry just to be safe
                    return "";
                }
            },

            /**
             * Process the field descriptor provided using the dto and the twoRowOneFieldWithDescriptorTemplate
             * template.
             *
             * @param field a field descriptor that has a descriptorField property specifying an additional value
             * @param dto   object that contains the fields values
             */
            processFieldWithDescriptor: function(/*Object*/field, /*Object*/dto) {
                // get field label and value
                var fieldProps = this.getFieldLabelAndValue(field, dto);

                if (fieldProps !== null) {
                    // get descriptor value
                    var descriptorValue = this.getFieldValue(field.descriptorField, dto);
                    // create fragment
                    return this.substitute(this.twoRowOneFieldWithDescriptorTemplate, {
                        label: fieldProps[0], value: fieldProps[1], additionalInfo: descriptorValue
                    });
                } else {
                    return "";
                }
            },

            /**
             * Retrieve the label and formatted value for the field provided using the
             * dto.
             *
             * @param field a field descriptor
             * @param dto   an object containing the fields value
             * @return an array holding the label and value
             */
            getFieldLabelAndValue: function(/*Object*/field, /*Object*/dto) {
                // the name of the field we are processing
                var fieldId = field.fieldId;

                // get the value from the dto
                var fieldValue = this.getFieldValue(fieldId, dto);

                // check we have a type in the displayField
                if (field.dataType) {
                    fieldValue = this.formatValueByType(field.dataType, fieldValue, dto);
                }

                return [field.fieldLabel, fieldValue];
            },

            /**
             * Retrieve a field from a dto.
             *
             * @param fieldId the name of the field/member
             * @param dto     the object we are looking for the field within
             */
            getFieldValue: function(/*String*/fieldId, /*Object*/dto) {
                var fieldValue = "";
                if (this.isNestedProperty(fieldId)) {
                    // search the dto structure for nested properties
                    fieldValue = this.getNestedPropertyValueFromDTO(fieldId,  dto);
                } else {
                    fieldValue = this.getPropertyValueFromDTO(fieldId, dto);
                }
                return fieldValue;
            },

            /**
             * Determine whether the field id supplied represents a nested property, for example
             * "property1.nestedProperty".
             *
             * @param fieldId a String representing a field
             */
            isNestedProperty:function(/*String*/fieldId) {
                if (fieldId !== null) {
                    return  fieldId.split(".").length > 1;
                } else {
                    return false;
                }
            },

            /**
             * Retrieve the value of the property specified from the dto provided.
             *
             * @param dto           a complex dto object
             * @param propertyName  the name of the property whose value we want
             */
            getPropertyValueFromDTO:function(propertyName, /*Object*/dto) {
                var value = "";
                for (var property in dto) {
                    if (dto.hasOwnProperty(property)) {
                        if (property == propertyName) {
                            value = dto[property];
                            break;
                        }
                    }
                }
                return value;
            },

            /**
             * Get the value of the nested property from the dto provided. This function uses
             * the dot operator as the delimiter in this property String.
             *
             * @param propertyString the name of the property we are looking for
             * @param dto            the dto we are searching for the property within
             */
            getNestedPropertyValueFromDTO:function(/*String*/propertyString, /*Object*/dto) {
                // separate property names and determine search depth
                var properties = propertyString.split(".");

                var property = dto;
                for (var i = 0; i < properties.length; i++) {
                    // retrieve the object for this level of the dto structure
                    property = this.getPropertyValueFromDTO(properties[i], property);
                }

                return property;
            },

            /**
             * Process the value supplied so that we return it as a string appropriate to the data type
             * supplied. Makes use of the conversion functions supplied by WidgetHelper.
             *
             * @param dataType          data type of the value
             * @param valueToProcess    the actual value
             * @param dto               the dto, we may need some extra info from it when forming a fields value
             */
            formatValueByType: function(/*String*/dataType, /*Object*/valueToProcess, /*Object*/dto) {
                // switch on data type using the other members of the WidgetHelper to do the work
                switch (dataType) {
                    case 'date':
                        return this.convertToDateOnly(valueToProcess);
                    case 'currency':
                        return this._processCurrencyData(valueToProcess, dto);
                    case 'telephone':
                        return this._processTelephoneData(valueToProcess);
                    case 'email':
                        return this._processEmailAddressData(valueToProcess);
                    default:
                        // string value so just return
                        return valueToProcess;
                }
            },

            /**
             * Format value and append currency description or symbol.
             *
             * @param currencyString a monetary value we wish to format as a currency
             * @param dto            our dto that may or may not contain currency symbol/description info
             */
            _processCurrencyData: function(/*String*/currencyString, /*Object*/dto) {
                // use the widget builder to format our currency string initially
                var currencyValue = this.convertToCurrency(currencyString);

                // the service may provide an iso 4217 currency code that the Dojo currency module can handle
                var currencyCode = this.getPropertyValueFromDTO("currencyType", dto);
                if (currencyCode != null) {
                    currencyValue = currency.format(currencyValue, {currency:currencyCode});
                }

                return currencyValue;
            },

            /**
             * Surround the supplied telephone number value with a device agnostic link that should
             * allow them to select the number and make a call to that actual number using the
             * devices native functionality.
             *
             * @param telephoneNumber
             */
            _processTelephoneData: function(/*String*/telephoneNumber) {
                return ["<a href='tel:",
                    telephoneNumber,
                    "'>",
                    telephoneNumber,
                    "</a>"].join("");
            },

            /**
             * Surround the supplied email address with a device agnostic link that should
             * allow the user to select the link and send an email to the actual address listed.
             *
             * @param emailAddress an email address
             */
            _processEmailAddressData: function(/*String*/ emailAddress) {
                return ["<a href='mailto:",
                    emailAddress,
                    "'>",
                    emailAddress,
                    "</a>"].join("");
            },
            
            /**
             * Create a sub table DOM fragments containing the required fields data passed in the dto. The
             * required fields can appear in two places in the display, at the top or bottom. A set of
             * required fields can contain items that are to be placed in either position.
             *
             * Required field items also have a sequence property that determines how they are ordered
             * within their respective area (top or bottom) which we must use when creating the HTML
             * for the fields.
             *
             * @param dto   a dto that may contain required fields
             * @return      an array contains the String HTML fragment for required fields positioned at the
             *              'T'OP in the first member, and those positioned at the 'B'OTTOM in the second member
             */
            processRequiredFields: function(/*Object*/dto) {
                // an array that will hold our 'T'OP and 'B'OTTOM required field HTML fragments
                var requiredFieldsArray = [];
                var requiredFields = this.getPropertyValueFromDTO("requiredFieldValues", dto);
                // determine if there are any fields by retrieving the array of required fields
                if (requiredFields !== null && requiredFields.length > 0) {
                    var topFields = this.formatRequiredFieldForDisplay(
                        this.getRequiredFieldsWithPosition(requiredFields, "T"));
                    var bottomFields = this.formatRequiredFieldForDisplay(
                        this.getRequiredFieldsWithPosition(requiredFields, "B"));
                    requiredFieldsArray.push(topFields, bottomFields);
                }

                return requiredFieldsArray;
            },

            /**
             * Required fields can be positioned at the "T"OP or "B"OTTOM of a display i.e. above or below
             * the main body of fields. This function will retrieve all of the required fields from the
             * array supplied whose position property matches the one passed in.
             *
             * @param requiredFields an array of required fields objects
             * @param position       the position "T"OP or "B"OTTOM
             */
            getRequiredFieldsWithPosition: function(/*Array*/requiredFields, /*String*/position) {
                var returnArray = [];

                // store array length in var to prevent reevaluation on iteration
                var arrayLength = requiredFields.length;
                for (var i = 0; i < arrayLength; i++) {
                    var requiredField = requiredFields[i];
                    if (requiredField !== null && requiredField.position !== null
                        && requiredField.position === position) {
                        returnArray.push(requiredField);
                    }
                }
                // now we have the items in the specified position we might as well encapsulate
                // the ordering within the position
                if (returnArray.length > 0) {
                    returnArray.sort(
                        // inline sort function that makes use of a fields sequence property
                        function(fieldA, fieldB) {
                            try {
                            // sort the fields based on their sequence property
                            return fieldA.sequence - fieldB.sequence;
                            } catch(e) {
                                // if there isn't a sequence available on the objects we are comparing
                                // refer to the items as equal
                                return 0;
                            }
                    });
                }

                return returnArray;
            },

            /**
             * Render a table row per required field we receive in the supplied array.
             *
             * TODO this is for the view only, plain text type fields at the moment, we will need
             * TODO some new code to deal with the transitions required for selecting a required field
             * TODO option but Jim is going to be working on that probably
             *
             * @param requiredFieldsToFormat a set of required field objects
             */
            formatRequiredFieldForDisplay: function(/*Array*/requiredFieldsToFormat) {
                var displayFieldFragment = "";
                // store array length in var to stop us reevaluating its value each iteration
                var fieldsLength = requiredFieldsToFormat.length;
                for (var i = 0; i < fieldsLength; i++) {
                    var label = null;
                    var value= null;
                    try {
                        // attempt to retrieve the label for a requiredField
                        if (requiredFieldsToFormat[i].requiredFieldName) {
                            label = requiredFieldsToFormat[i].requiredFieldName;
                        } else {
                            // we may be reading a requiredFieldValue as opposed to a requiredField so access the label
                            // in a slightly different way
                            label = requiredFieldsToFormat[i].requiredField.name;
                        }

                        value = requiredFieldsToFormat[i].requiredFieldOption.value;
                    } catch(e) {
                        // do nothing, we don't want the UI to fall over due to required fields
                    }
                    if (label !== null && value !== null) {
                        displayFieldFragment = [displayFieldFragment,
                            this.substitute(this.singleRowTemplate, {label: label, value: value})].join("");
                    }
                }
                return displayFieldFragment;
            }

        });
});
