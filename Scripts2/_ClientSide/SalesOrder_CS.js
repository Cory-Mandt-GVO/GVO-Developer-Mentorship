/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
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
        * @param {ClientScriptContext.fieldChanged} context
        */
        function fieldChanged(context) {

            if (context.fieldId === 'custbody_gvo_order_owner') {
                nsUiDialog.alert({
                    title: 'Field Has Changed',
                    message: 'Order Owner Email field has been changed'
                });
            }
        }

        /**
        * @param {ClientScriptContext.lineInit} context
        */
        function lineInit(context) {
            nsUiDialog.alert({
                title: 'Line Init Fired',
                message: `${context.sublistId} sublist has triggered a line init. Just sayin'...`
            });
        }

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {
            nsUiDialog.alert({
                title: 'Page Init Fired',
                message: `This is when the page init event is triggered.`
            });
        }

        /**
        * @param {ClientScriptContext.postSourcing} context
        */
        function postSourcing(context) {

            if (context.fieldId === 'shipmethod') {
                nsUiDialog.alert({
                    title: 'Post Sourcing',
                    message: `Shipping method field is done sourcing.`
                });
            }
        }

        /**
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {

            const rec = context.currentRecord;
            const salesRep = rec.getValue({ fieldId: 'salesrep' });

            let doSave = true;

            if (!salesRep) {
                doSave = false;
                nsUiDialog.alert({
                    title: 'Cannot Save Sales Order',
                    message: `Please add a sales rep to the sales order`
                });
            }

            return doSave;
        }

        /**
        * @param {ClientScriptContext.sublistChanged} context
        */
        function sublistChanged(context) {
            nsUiDialog.alert({
                title: 'Sublist Changed',
                message: `${context.sublistId} sublist has changed from a ${context.operation}`
            });
        }

        /**
        * @param {ClientScriptContext.validateDelete} context
        */
        function validateDelete(context) {

            if (context.sublistId === 'item') {
                alert('This is when we would validate removing the line');
            }

            return true;
        }

        /**
        * @param {ClientScriptContext.validateField} context
        */
        function validateField(context) {

            if (context.fieldId === 'custbody_gvo_order_owner') {
                alert('This is when we would validate the field');
            }

            return true;
        }

        /**
        * @param {ClientScriptContext.validateInsert} context
        */
        function validateInsert(context) {

            if (context.sublistId === 'item') {
                alert('This is when we would validate inserting a line');
            }

            return true;
        }

        /**
        * @param {ClientScriptContext.validateLine} context
        */
        function validateLine(context) {

            if (context.sublistId === 'item') {
                alert('This is when we would validate the line');
            }

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

