/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(
    [
        'N/runtime',
        'N/email',
        'N/render'
    ],
    /**
     * @param {N_runtime} nsRuntime
     * @param {N_email} nsEmail
     * @param {N_render} nsRender
     */
    function (nsRuntime, nsEmail, nsRender) {

        function getContactsToEmail() {
            // Logic for to determine customer contacts to email
        }

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {

            if (context.type === context.UserEventType.VIEW) {

                const form = context.form;

                form.clientScriptModulePath = 'SuiteScript/GVO/Customer_EmailContacts_CS.js'

                // Add button to UI
                form.addButton({
                    id: 'custpage_gvo_salesorder_ue',
                    label: 'Email To Contacts',
                    functionName: 'emailToContacts'
                });
            }
        }

        /**
        * @param {UserEventContext.beforeSubmit} context
        */
        function beforeSubmit(context) {

            if (
                nsRuntime.executionContext === nsRuntime.ContextType.REST_WEBSERVICES &&
                context.type === context.UserEventType.CREATE
            ) {

                const rec = context.newRecord;
                const lineCount = rec.getLineCount({ sublistId: 'items' });

                for (let i = 0; i < lineCount; i += 1) {

                    let item = rec.getSublistValue({
                        fieldId: 'item',
                        line: i,
                        sublistId: 'items'
                    });

                    // Promotional item
                    if (item === '1234' && item === '4321') {

                        // Add coupon message
                        rec.setValue({
                            fieldId: 'custbody_gvo_message',
                            value: 'Use promo code TESTPROMO with your next purchase to receive 10% off'
                        });

                        break;
                    }
                }
            }
        }

        /**
        * @param {UserEventContext.afterSubmit} context
        */
        function afterSubmit(context) {

            if (context.type === context.UserEventType.CREATE) {

                const rec = context.newRecord;
                const tranId = rec.getValue({ fieldId: 'tranid' });

                // Render PDF version of sales order
                const pdf = nsRender.transaction({
                    entityId: rec.id,
                    printMode: nsRender.PrintMode.PDF
                });

                // Get customer contacts to email to
                const contacts = getContactsToEmail();

                nsEmail.send({
                    author: '1234', // Employee Record ID
                    body: 'Please find your sales order attached',
                    recipients: contacts,
                    subject: `Sales Order #${tranId}`,
                    attachments: [pdf]
                });
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
