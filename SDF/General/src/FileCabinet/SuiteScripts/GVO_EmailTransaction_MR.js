/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/search',
        'N/runtime',
        'N/render',
        'N/email',
        'N/format',
        'N/record'
    ],
    /**
     * @param {N_search} nsSearch
     * @param {N_runtime} nsRuntime
     * @param {N_render} nsRender
     * @param {N_email} nsEmail
     * @param {N_format} nsFormat
     * @param {N_record} nsRecord
     */
    function (nsSearch, nsRuntime, nsRender, nsEmail, nsFormat, nsRecord) {

        function getEmails(customer, emailMap) {

            var response;
            var contactEmails;
            var contactsMissingAddresses;

            contactEmails = [];
            contactsMissingAddresses = [];

            // Find customer contacts with matching email group from transaction email map record
            nsSearch.create({
                type: nsSearch.Type.CUSTOMER,
                filters:
                [
                    ['internalid', 'anyof', customer],
                    'AND',
                    ['contact.custentity_gvo_emailgroup', 'anyof', emailMap.emailGroup]
                ],
                columns:
                [
                    { name: 'email', join: 'contact' },
                    { name: 'entityid', join: 'contact' }
                ]

            }).run().each(function (result) {

                var curContactEmailAddress = result.getValue({
                    name: 'email',
                    join: 'contact'
                });

                if (curContactEmailAddress) {
                    contactEmails.push(curContactEmailAddress);
                } else {
                    contactsMissingAddresses.push(
                        result.getValue({
                            name: 'entityid',
                            join: 'contact'
                        })
                    );
                }

                return true;

            });

            if (contactsMissingAddresses.length) {
                log.error('No email addresses were found for the following contacts', contactsMissingAddresses.join(', '));
            }

            if (!contactEmails.length) {
                throw new Error ('Email not sent. No contacts were found for customer internal ID ' + customer + ' to send email.');
            } else if (contactEmails.length > 10) {
                throw new Error (
                    'Email not sent. ' +
                    contactEmails.length.toString() +
                    ' contacts to be emailed for customer internal ID ' + customer + '. NetSuite limit is 10.'
                );
            } else {
                response = contactEmails;
            }

            return response;
        }

        function getTranType(tranType) {

            var tranText;
            var tranEnum;

            tranText = tranType && tranType.toUpperCase();
            tranEnum = tranText && tranText.split(' ').join('_');

            log.debug('tranEnum', tranEnum);

            return tranEnum && nsSearch.Type[tranEnum];
        }

        /**
         * Finds the associated transaction email map record for
         * the current transaction type.
         */

        function getTransactionEmailMapInfo(transTypeId) {

            var emailMapSearch;
            var returnValue;
            var defaultTemplate;
            var tranTypeText;

            defaultTemplate = -101;

            emailMapSearch = nsSearch.create({
                type: 'customrecord_gvo_transemailmap',
                filters: [
                    ['custrecord_gvo_transemailmap_type', 'anyof', transTypeId]
                ],

                columns: [
                    'custrecord_gvo_transemailmap_group',
                    'custrecord_gvo_transemailmap_temp',
                    'custrecord_gvo_transemailmap_type'
                ]

            }).run().getRange({
                start: 0,
                end: 1
            });

            if (emailMapSearch.length) {

                tranTypeText = emailMapSearch[0].getText('custrecord_gvo_transemailmap_type');

                returnValue = {
                    tranType: getTranType(tranTypeText),
                    emailGroup: emailMapSearch[0].getValue('custrecord_gvo_transemailmap_group'),
                    template: emailMapSearch[0].getValue('custrecord_gvo_transemailmap_temp') || defaultTemplate
                };
            } else {
                throw new Error('There is no Transaction Email Mapping record for this transaction type.');
            }

            return returnValue;

        }

        function getInputData() {

            var tranTypeId;
            var tranDate;
            var tranSearch;
            var emailAuthor;
            var isTestMode;
            var emailMapValues;
            var result;

            tranTypeId = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_mcte_mr_type' });
            tranDate = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_mcte_mr_date' });
            emailAuthor = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_mcte_mr_auth' });
            isTestMode = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_mcte_mr_test' });

            // log.debug('Transaction Type', tranTypeId);
            log.debug('Is Test Mode', isTestMode);

            if (!tranTypeId) {
                throw new Error('Transaction type is not set on the script deployment');
            } else if (!emailAuthor) {
                throw new Error('Email author has not been set on the script deployment');
            }

            emailMapValues = getTransactionEmailMapInfo(tranTypeId);
            emailMapValues.author = emailAuthor;
            emailMapValues.isTestMode = isTestMode;

            log.debug('emailMapValues', emailMapValues);

            result = [];

            tranSearch = nsSearch.create({
                type: emailMapValues.tranType,
                filters: [
                    ['trandate', 'on', (tranDate ?  nsFormat.format({ value: tranDate, type: nsFormat.Type.DATE }) : 'yesterday')],
                    'AND',
                    ['custbody_gvo_mcte_sent', 'is', 'F'],
                    'AND',
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    'entity'
                ]
            });

            tranSearch.run().each(function(tran) {
                result.push({
                    id: tran.id,
                    entity: tran.getValue('entity'),
                    emailMapValues: emailMapValues
                });

                return true;
            });

            return result;
        }

        /**
        * Map transactions by customer
        * @param {MapReduceContext.map} context
        */
        function map(context) {

            var result;
            var customer;
            var reduceData;

            log.debug('map value', context.value);

            result = JSON.parse(context.value);
            customer = result.entity;

            reduceData = {
                tranId: result.id,
                emailMap: result.emailMapValues
            };

            context.write(customer, reduceData);
        }

        /**
        * @param {MapReduceContext.reduce} context
        */
        function reduce(context) {

            var customer;
            var tranId;
            var emailInfo;
            var emails;
            var transPdf;
            var mailBodyAndSubject;
            var i;

            log.debug('reduce context key', context.key);
            log.debug('reduce context values', context.values);

            customer = context.key;
            emailInfo = JSON.parse(context.values[0]).emailMap;
            emails = getEmails(customer, emailInfo);

            // Send email for each customer transaction
            for (i = 0; i < context.values.length; i += 1) {

                tranId = JSON.parse(context.values[i]).tranId;

                if (emailInfo.isTestMode) {

                    log.debug(
                        'Transaction ID: ' + tranId + ', Customer ID: ' + customer,
                        JSON.stringify({
                            emailInfo: emailInfo,
                            emails: emails
                        })
                    );

                } else {

                    transPdf = nsRender.transaction({
                        entityId: +tranId,
                        printMode: nsRender.PrintMode.PDF
                    });

                    mailBodyAndSubject = nsRender.mergeEmail({
                        templateId: emailInfo.template,
                        transactionId: +tranId
                    });

                    nsEmail.send({
                        author: emailInfo.author,
                        recipients: emails,
                        subject: mailBodyAndSubject.subject,
                        body: mailBodyAndSubject.body,
                        attachments: [transPdf],
                        relatedRecords: {
                            transactionId: +tranId
                        }
                    });

                    // TODO: set email sent checkbox
                    nsRecord.submitFields({
                        type: emailInfo.tranType,
                        id: +tranId,
                        values: {
                            custbody_gvo_mcte_sent: true
                        }
                    });

                    context.write(tranId, {
                        emails: emails,
                        emailInfo: emailInfo,
                        customer: customer
                    });
                }
            }
        }

        /**
        * @param {MapReduceContext.summarize} summary
        */
        function summarize(summary) {

            var processedCount = 0;

            summary.mapSummary.errors.iterator().each(function (key, value) {
                log.debug('map key = ' + key, 'message is: ' + JSON.parse(value).message);
            });
            summary.reduceSummary.errors.iterator().each(function (key, value) {
                log.debug('reduce key = ' + key, 'message is: ' + JSON.parse(value).message);
            });
            summary.output.iterator().each(function(key, value) {

                var vals = JSON.parse(value);
                var emailInfo = vals && vals.emailInfo;

                log.audit(
                    emailInfo.tranType + ' ID: ' + key,
                    'customer ID ' + vals.customer + ': ' + vals.emails
                );
                processedCount += 1;

                return true;
            });

            log.debug('summary', JSON.stringify(summary));
            log.audit('Records Processed', processedCount);
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });
