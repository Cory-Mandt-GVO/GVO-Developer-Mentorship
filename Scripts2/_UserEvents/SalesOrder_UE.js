/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(
    [
        'N/runtime',
        'N/email',
        'N/query'
    ],
    /**
     * @param {N_runtime} nsRuntime
     * @param {N_email} nsEmail
     * @param {N_query} nsQuery
     */
    function (nsRuntime, nsEmail, nsQuery) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {

            if (context.type === context.UserEventType.VIEW) {

                const form = context.form;
                const rec = context.newRecord;
                const customerId = rec.getValue({ fieldId: 'entity' });

                form.clientScriptModulePath = 'SuiteScripts/DevMentorship/DevMentorship_EmailContacts_CS.js';

                // Add button to UI
                form.addButton({
                    id: 'custpage_gvo_salesorder_ue',
                    label: 'Email To Contacts',
                    functionName: `sendEmailToContacts(${customerId})`
                });
            }
        }

        /**
        * @param {UserEventContext.beforeSubmit} context
        */
        function beforeSubmit(context) {

            const isTesting = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_devment_salesorder_ue_test' });

            if (
                (isTesting || nsRuntime.executionContext === nsRuntime.ContextType.REST_WEBSERVICES) &&
                context.type === context.UserEventType.CREATE
            ) {

                const rec = context.newRecord;
                const lineCount = rec.getLineCount({ sublistId: 'item' });

                for (let i = 0; i < lineCount; i += 1) {

                    let item = rec.getSublistValue({
                        fieldId: 'item',
                        line: i,
                        sublistId: 'item'
                    });

                    // Promotional item
                    if (item === '359') {

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

                const emailQuery = nsQuery.runSuiteQL({
                    query: `
                        SELECT
                            email,
                            custbody_gvo_message AS message
                        FROM
                            transaction AS t
                        WHERE
                            t.type = 'SalesOrd' AND
                            t.id = ${rec.id} AND
                            t.custbody_gvo_message IS NOT NULL
                    `
                }).asMappedResults();

                if (emailQuery.length) {

                    nsEmail.send({
                        author: '37', // Employee Record ID
                        body: emailQuery[0].message,
                        recipients: emailQuery[0].email,
                        subject: `A Little Something Extra for Purchasing from us...`,
                        relatedRecords: {
                            transactionId: rec.id
                        }
                    });
                }
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
