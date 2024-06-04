/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NAMDConfig RequireConfig.json
 */
define(
    [
        'N/ui/serverWidget'
    ],
    /**
     * @param {N_ui_serverWidget} nsUiServerWidget
     */
    function (nsUiServerWidget) {

        function sendEmail(customerId) {
            // Add logic for sending email to customer
        }

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {

            if (context.request.method === 'GET') {

                // Build the form on GET request
                var form = nsUiServerWidget.createForm({
                    title: 'Select Customer for Email'
                });

                form.addLookupField({
                    id: 'custpage_customer',
                    type: search.Type.CUSTOMER,
                    label: 'Customer',
                    container: 'inline'
                });

                form.addSubmitButton({
                    label: 'Send Email'
                });

                context.response.write(form);

            } else if (context.request.method === 'POST') {

                // Handle form submission on POST request
                var customerId = context.request.parameters.custpage_customer;

                // Implement your logic to send email to the selected customer
                sendEmail(customerId);

                context.response.write('Email sent to customer (ID: ' + customerId + ')!');
            }
        }

        return {
            onRequest: onRequest
        };
    }
);

