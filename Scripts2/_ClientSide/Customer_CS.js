/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NAMDConfig RequireConfig.json
 */
define(
    [
        'N/ui/dialog'
    ],
    /**
     * @param {N_ui_dialog} nsUiDialog
     */
    function (nsUiDialog) {

        /**
        * Defines the function that is executed when a field is changed by a user or client call.
        * @param {ClientScriptContext.fieldChanged} context
        */
        function fieldChanged(context) {
            nsUiDialog.alert({
                title: `Field ID ${context.fieldId} Value Changed!`,
                message: 'This message is triggered when a fields value changes.'
            });
        }

        /**
        * Defines the function that is executed when an existing line is selected.
        * @param {ClientScriptContext.lineInit} context
        */
        function lineInit(context) {
            nsUiDialog.alert({
                title: `Line Selected from ${context.sublistId} Sublist!`,
                message: 'This message is triggered when existing line is selected.'
            });
        }

        /**
        * Defines the function that is executed when the page completes loading or when the form is reset.
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {
            nsUiDialog.alert({
                title: 'Form Loaded!',
                message: 'This message is triggered when the form loads.'
            });
        }

        /**
        * Defines the function that is executed when a field that sources information from another field is modified. Executes on transaction forms only.
        * @param {ClientScriptContext.postSourcing} context
        */
        function postSourcing(context) {
            nsUiDialog.alert({
                title: `${context.fieldId} Field Changed!`,
                message: 'This message is triggered when a field the sources from another field changes.'
            });
        }

        /**
        * Defines the function that is executed when a record is saved (after the submit button is pressed but before the form is submitted).
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {

            // Validation logic goes here

            return true;
        }

        /**
        * Defines the function that is executed after a sublist has been inserted, removed, or edited.
        * @param {ClientScriptContext.sublistChanged} context
        */
        function sublistChanged(context) {
            nsUiDialog.alert({
                title: `${context.sublistId} Sublist Changed! Operation was ${context.operation}`,
                message: 'This message is triggered when a sublist changes.'
            });
        }

        /**
        * Defines the validation function that is executed when an existing line in an edit sublist is deleted.
        * @param {ClientScriptContext.validateDelete} context
        */
        function validateDelete(context) {

            // validation logic goes here

            return true;
        }

        /**
        * Defines the validation function that is executed when a field is changed by a user or client call.
        * @param {ClientScriptContext.validateField} context
        */
        function validateField(context) {

            // validation logic goes here

            return true;
        }

        /**
        * Defines the validation function that is executed when a sublist line is inserted into an edit sublist.
        * @param {ClientScriptContext.validateInsert} context
        */
        function validateInsert(context) {

            // validation logic goes here

            return true;
        }

        /**
        * Defines the validation function that is executed before a line is added to an inline editor sublist or editor sublist.
        * @param {ClientScriptContext.validateLine} context
        */
        function validateLine(context) {

            // validation logic goes here

            return true;
        }

        return {
            fieldChanged: fieldChanged,
            lineInit: lineInit,
            pageInit: pageInit,
            postSourcing: postSourcing,
            saveRecord: saveRecord,
            sublistChanged: sublistChanged,
            validateDelete: validateDelete,
            validateField: validateField,
            validateInsert: validateInsert,
            validateLine: validateLine
        };
    }
);

