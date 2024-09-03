/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(
    [
        'N/query',
        'N/email',
        'N/render',
        'N/runtime'
    ],
    /**
     * @param {N_query} nsQuery
     * @param {N_email} nsEmail
     * @param {N_render} nsRender
     * @param {N_runtime} nsRuntime
     */
    function (nsQuery, nsEmail, nsRender, nsRuntime) {

        function throwEmailSearchError(message) {
            const emailSearchError = new Error(message);
            emailSearchError.name = 'EMAIL_SEARCH_ERROR';
            throw emailSearchError;
        }

        function getEmailInfo(transId) {

            let response;
            let tranId;

            const contacts = [];
            const contactEmails = [];
            const contactsMissingAddresses = [];

            // Find customer contacts with matching email group from transaction email map record
            nsQuery.runSuiteQL({
                query: `
                    SELECT
                        cont.firstname AS firstname,
                        cont.middlename AS middlename,
                        cont.lastname AS lastname,
                        cont.email AS email,
                        t.tranid AS tranid
                    FROM
                        customer AS cust
                    INNER JOIN
                        companycontactrelationship AS ccc ON cust.id = ccc.company
                    INNER JOIN
                        contact AS cont ON cont.id = ccc.contact
                    INNER JOIN
                        transaction AS t ON t.id = ${transId}
                    WHERE
                        cust.id = t.entity
                `
            }).iterator().each(function (result) {

                const mapRes = result.value.asMap();
                tranId = mapRes.tranid;

                if (mapRes.email) {
                    contacts.push({
                        firstname: mapRes.firstname,
                        middlename: mapRes.middlename,
                        lastname: mapRes.lastname,
                        email: mapRes.email,
                    });
                    contactEmails.push(mapRes.email);
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
                throwEmailSearchError('No email addresses were found for the following contacts: ' + contactsMissingAddresses.join(', '));
            } else if (!contactEmails.length) {
                throwEmailSearchError('No contacts were found to send email.');
            } else if (contactEmails.length > 10) {
                throwEmailSearchError(contactEmails.length.toString() + ' contacts to be emailed. NetSuite limit is 10.');
            } else {

                response = {
                    contacts: contacts,
                    emails: contactEmails,
                    transNum: tranId
                };
            }

            return response;
        }

        function sendEmail(transId) {

            const emailInfo = getEmailInfo(transId);
            const author = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_emailcontacts_auth' });

            const transPdf = nsRender.transaction({
                entityId: +transId,
                printMode: nsRender.PrintMode.PDF
            });

            nsEmail.send({
                author: author || nsRuntime.getCurrentUser().id,
                recipients: emailInfo.emails,
                subject: `Sales Order #${emailInfo.transNum}`,
                body: `Here's a copy of Sales Order #${emailInfo.transNum} for ya.`,
                attachments: [transPdf],
                relatedRecords: {
                    transactionId: transId
                }
            });
        }

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {

            const response = {};

            try {
                const params = context.request.parameters;
                const transId = params['custpage_gvo_emailcontacts_id'];

                if (!transId) {
                    throw new Error('Missing parameters');
                }

                if (context.request.method === 'POST') {
                    sendEmail(transId);
                } else if (context.request.method === 'GET') {
                    const emailInfo = getEmailInfo(transId);
                    response.contacts = emailInfo.contacts;
                    response.emails = emailInfo.emails;
                }

                response.success = true;

            } catch (ex) {
                response.success = false;
                response.errorName = ex.name === 'EMAIL_SEARCH_ERROR' ? ex.name : 'UNEXPECTED';
                response.errorMessage = ex.name === 'EMAIL_SEARCH_ERROR' ? ex.message : 'An unexpected error occurred';
                log.error('Error', ex);
            }

            context.response.write(JSON.stringify(response));
        }

        return {
            onRequest: onRequest
        };
    });
