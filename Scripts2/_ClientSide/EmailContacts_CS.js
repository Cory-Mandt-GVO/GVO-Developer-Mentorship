/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(
    [
        'N/ui/dialog',
        'N/ui/message',
        'N/currentRecord',
        'N/url',
        'N/https'
    ],
    /**
     * @param {N_ui_dialog} nsUiDialog
     * @param {N_ui_message} nsUiMessage
     * @param {N_currentRecord} nsCurrentRecord
     * @param {N_url} nsUrl
     * @param {N_http} nsHttps
     */
    function (nsUiDialog, nsUiMessage, nsCurrentRecord, nsUrl, nsHttps) {

        function callSuitelet(method) {

            const rec = nsCurrentRecord.get();

            const url = nsUrl.resolveScript({
                scriptId: 'customscript_gvo_emailcontacts_sl',
                deploymentId: 'customdeploy_gvo_emailcontacts_sl',
                returnExternalUrl: false,
                params: {
                    custpage_gvo_emailcontacts_id: rec.id
                }
            });

            const promise = nsHttps.request.promise({
                method: method,
                url: url,
                body: JSON.stringify({
                    id: rec.id
                })
            });

            return promise;
        }

        function sendEmailToContacts() {

            callSuitelet(nsHttps.Method.GET).then(function(res) {

                let message = '';
                let promise;

                const body = JSON.parse(res.body);

                const contacts = body && body.success && body.contacts;
                contacts.forEach(function(contact) {
                    message += `${contact.firstname} ${contact.middlename || ''} ${contact.lastname} (${contact.email})<br>`;
                });

                nsUiDialog.confirm({
                    title: 'Send Email to the Following Contacts?',
                    message: message
                }).then(function(data) {

                    // If confirmed by user
                    if (data === true) {

                        const info = nsUiMessage.create({
                            type: nsUiMessage.Type.INFORMATION,
                            title: 'Sending Email',
                            message: 'We\'re working on sending that email...'
                        });

                        info.show();

                        promise = new Promise(function(resolve, reject) {

                            callSuitelet(nsHttps.Method.POST).then(function (postRes) {

                                const postBody = JSON.parse(postRes.body);

                                if (postBody && postBody.success) {
                                    info.hide();
                                    resolve();
                                } else if (body && !body.success) {
                                    reject();
                                }
                            });
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
                    }
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

