/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(
    [
        'N/record',
        'N/query'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_query} nsQuery
     */
    function (nsRecord, nsQuery) {

        function doDelete(req) {
            const data = JSON.parse(req);

            nsRecord.delete({
                id: data.id,
                type: nsRecord.Type.CONTACT
            });

            log.audit({
                title: 'doDelete',
                details: `contact ID ${data.id} has been deleted`
            });

            return { status: 'success'};
        }

        function doGet(req) {
            const data = JSON.parse(req);

            const results = nsQuery.runSuiteQL({
                query: `
                    SELECT
                        firstname,
                        lastname,
                        email
                    FROM
                        contact
                    WHERE
                        id = ${data.id}
                `
            }).asMappedResults();

            return (results.length && results[0]) || 'Contact does not exist';
        }

        function doPost(req) {
            const data = JSON.parse(req);

            const contactRec = nsRecord.create({
                type: nsRecord.Type.CONTACT
            });

            contactRec.setValue({
                fieldId: 'firstname',
                value: data.firstName
            });

            contactRec.setValue({
                fieldId: 'lastname',
                value: data.lastName
            });

            contactRec.setValue({
                fieldId: 'email',
                value: data.email
            });

            const contactId = contactRec.save();

            return { id: contactId };
        }

        function doPut(req) {
            const data = JSON.parse(req);

            const contactRec = nsRecord.load({
                id: req.id,
                type: nsRecord.Type.CONTACT
            });

            if (data.firstName) {
                contactRec.setValue({
                    fieldId: 'firstname',
                    value: data.firstName
                });
            }
            if (data.lastName) {
                contactRec.setValue({
                    fieldId: 'lastname',
                    value: data.lastName
                });
            }
            if (data.email) {
                contactRec.setValue({
                    fieldId: 'email',
                    value: data.email
                });
            }

            contactRec.save();

            return { status: 'success' }
        }

        return {
            delete: doDelete,
            get: doGet,
            post: doPost,
            put: doPut
        };
    }
);

