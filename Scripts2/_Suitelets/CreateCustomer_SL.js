/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(
    [
        'N/ui/serverWidget',
        'N/record'
    ],
    function (nsUiServerWidget, nsRecord) {

        function onRequest(context) {

            if (context.request.method === 'GET') {

                const form = nsUiServerWidget.createForm({
                    title: 'Customer Information Form'
                });

                form.addField({
                    id: 'custpage_firstname',
                    type: nsUiServerWidget.FieldType.TEXT,
                    label: 'First Name'
                });

                form.addField({
                    id: 'custpage_lastname',
                    type: nsUiServerWidget.FieldType.TEXT,
                    label: 'Last Name'
                });

                form.addField({
                    id: 'custpage_email',
                    type: nsUiServerWidget.FieldType.EMAIL,
                    label: 'Email'
                });

                form.addSubmitButton({
                    label: 'Submit'
                });

                context.response.writePage(form);

            } else {

                const firstName = context.request.parameters.custpage_firstname;
                const lastName = context.request.parameters.custpage_lastname;
                const email = context.request.parameters.custpage_email;

                try {

                    const customerRecord = nsRecord.create({
                        type: nsRecord.Type.CUSTOMER,
                        isDynamic: true
                    });

                    customerRecord.setValue({
                        fieldId: 'firstname',
                        value: firstName
                    });

                    customerRecord.setValue({
                        fieldId: 'lastname',
                        value: lastName
                    });

                    customerRecord.setValue({
                        fieldId: 'email',
                        value: email
                    });

                    const customerId = customerRecord.save();

                    context.response.write('Customer nsRecord created successfully with ID: ' + customerId);

                } catch (e) {

                    log.error({
                        title: 'Error creating customer nsRecord',
                        details: e.message
                    });
                    context.response.write('Error creating customer nsRecord: ' + e.message);
                }
            }
        }

        return {
            onRequest: onRequest
        };
    }
);
