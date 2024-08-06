/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(
    [
        'N/query',
        'N/ui/dialog',
        'N/ui/message'
    ],
    /**
     * @param {N_query} nsQuery
     * @param {N_ui_dialog} nsUiDialog
     * @param {N_ui_message} nsUiMessage
     */
    function (nsQuery, nsUiDialog, nsUiMessage) {

        function getContacts(customerId) {

            return nsQuery.runSuiteQL({
                query: `
                    SELECT
                        cont.firstname,
                        cont.middlename,
                        cont.lastname,
                        cont.email
                    FROM
                        customer AS cust
                    INNER JOIN
                        companycontactrelationship AS ccc ON cust.id = ccc.company
                    INNER JOIN
                        contact AS cont ON cont.id = ccc.contact
                    WHERE
                        cust.id = ${customerId}
                `
            }).asMappedResults();
        }

        function sendEmailToContacts(customerId) {
            const contacts = getContacts(customerId);
            let message = '';
            let promise;

            contacts.forEach(function(res) {
                message += `${res.firstname} ${res.middlename || ''} ${res.lastname} (${res.email})<br>`;
            });

            nsUiDialog.confirm({
                title: 'Send Email to the Following Contacts?',
                message: message
            }).then(function() {

                promise = new Promise(function(resolve, reject) {

                    const info = nsUiMessage.create({
                        type: nsUiMessage.Type.INFORMATION,
                        title: 'Sending Email',
                        message: 'We\'re working on sending that email...'
                    });

                    info.show();

                    // TODO: Replace with logic for sending email
                    setTimeout(function() {
                        info.hide();
                        resolve();
                    }, 4000);
                });

                promise.then(function() {
                    nsUiMessage.create({
                        type: nsUiMessage.Type.CONFIRMATION,
                        title: 'Email Sent',
                        message: 'Successfully sent email to contacts'
                    }).show();
                }).catch(function() {
                    nsUiMessage.create({
                        type: nsUiMessage.Type.ERROR,
                        title: 'Error Sending Email',
                        message: 'Sorry, we couldn\'t send that email'
                    }).show();
                });
            });
        }

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {}

        return {
            sendEmailToContacts: sendEmailToContacts,
            pageInit: pageInit
        };
    }
);

