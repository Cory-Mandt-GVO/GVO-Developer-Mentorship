/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(
    [
        'N/query',
        'N/ui/serverWidget'
    ],
    /**
     * @param {N_query} nsQuery
     * @param {N_ui_serverWidget} nsUIserverWidget
     */
    function (
        nsQuery,
        nsUIserverWidget
    ) {

        function createForm() {

            const form = nsUIserverWidget.createForm({ title: 'Customer Purchase History' });

            form.addField({
                id: 'custpage_gvo_customer',
                type: nsUIserverWidget.FieldType.SELECT,
                label: 'Customer',
                source: 'customer'
            });

            form.addField({
                id: 'custpage_gvo_item',
                type: nsUIserverWidget.FieldType.SELECT,
                label: 'Item',
                source: 'item'
            });

            form.addField({
                id: 'custpage_gvo_startdate',
                type: nsUIserverWidget.FieldType.DATE,
                label: 'Start Date'
            });

            form.addField({
                id: 'custpage_gvo_enddate',
                type: nsUIserverWidget.FieldType.DATE,
                label: 'End Date'
            });

            form.addSubmitButton({ label: 'Submit' });

            const resultsSublist = form.addSublist({
                id: 'custpage_gvo_results',
                type: nsUIserverWidget.SublistType.LIST,
                label: 'Results'
            });

            resultsSublist.addField({
                id: 'custpage_gvo_customer',
                type: nsUIserverWidget.FieldType.TEXT,
                label: 'Customer'
            });

            resultsSublist.addField({
                id: 'custpage_gvo_item',
                type: nsUIserverWidget.FieldType.TEXT,
                label: 'Item'
            });

            resultsSublist.addField({
                id: 'custpage_gvo_quantity',
                type: nsUIserverWidget.FieldType.FLOAT,
                label: 'Quantity'
            });

            resultsSublist.addField({
                id: 'custpage_gvo_amount',
                type: nsUIserverWidget.FieldType.CURRENCY,
                label: 'Amount'
            });

            return form;
        }

        /**
         * @param {Object} args
         * @param {N_ui_serverWidget.Form} args.form
         * @param {Number} args.customer
         * @param {Number} args.item
         * @param {String} args.startDate
         * @param {String} args.endDate
         */
        function populateResults(args) {

            const sublist = args.form.getSublist({ id: 'custpage_gvo_results' });

            const sql = `
                    SELECT
                        BUILTIN.DF(t.entity) AS customer,
                        ${args.item ? 'BUILTIN.DF(tl.item)': `'All'`} AS item,
                        SUM(0 - tl.quantity) AS quantity, /* line quantities are negative on orders */
                        SUM(0 - tal.amount) AS amount
                    FROM
                        transaction t
                        INNER JOIN transactionline tl ON t.id = tl.transaction
                        INNER JOIN transactionaccountingline tal ON t.id = tal.transaction AND tl.id = tal.transactionline
                    WHERE
                        t.recordtype = 'salesorder'
                        AND tl.mainline = 'F'
                        ${args.customer ? `AND t.entity = ${args.customer}` : ''}
                        ${args.item ? `AND tl.item = ${args.item}` : ''}
                        ${args.start || args.end ? `AND t.trandate BETWEEN
                            TO_DATE(${args.start || '1/1/1970'}
                            AND TO_DATE(${args.end || '1/1/2999'})` : ''}
                    GROUP BY
                        BUILTIN.DF(t.entity),
                        ${args.item ? 'BUILTIN.DF(tl.item)' : `'All'`}
                `;

            log.debug('SQL', sql);

            nsQuery.runSuiteQL({
                query: sql
            }).asMappedResults().forEach((r, i) => {

                sublist.setSublistValue({
                    id: 'custpage_gvo_customer',
                    line: i,
                    value: r.customer
                });

                sublist.setSublistValue({
                    id: 'custpage_gvo_item',
                    line: i,
                    value: r.item
                });

                sublist.setSublistValue({
                    id: 'custpage_gvo_quantity',
                    line: i,
                    value: r.quantity
                });

                sublist.setSublistValue({
                    id: 'custpage_gvo_amount',
                    line: i,
                    value: r.amount
                });

            });

            return args.form;
        }

        /**
         * @param {SuiteletContext.onRequest} context
         */
        function onRequest(context) {

            if (context.request.method === 'GET') {

                context.response.writePage({ pageObject: createForm() });

            } else if (context.request.method === 'POST') {

                context.response.writePage({
                    pageObject: populateResults({
                        form: createForm(),
                        customer: context.request.parameters.custpage_gvo_customer,
                        item: context.request.parameters.custpage_gvo_item,
                        startDate: context.request.parameters.custpage_gvo_startdate,
                        endDate: context.request.parameters.custpage_gvo_enddate
                    })
                });

            } else {

                context.response.write({ output: 'METHOD NOT ALLOWED' });
            }
        }

        return {
            onRequest: onRequest
        };
    });
