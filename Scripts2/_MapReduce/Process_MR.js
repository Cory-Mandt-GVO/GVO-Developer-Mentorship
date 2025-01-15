/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(
    [

    ],
    function () {

        function getInputData() {

            const query = `
                SELECT
                    t.entity AS customer,
                    t.id AS soid,
                    c.email AS email
                FROM
                    transaction AS t
                    INNER JOIN customer AS c ON t.entity = c.id
                WHERE
                    t.trandate > (SYSDATE - 30) AND
                    t.type = 'SalesOrd'
            `;

            return {
                type: 'suiteql',
                query: query
            };
        }

        /**
        * @param {MapReduceContext.map} context
        */
        function map(context) {

            const fMap = [
                'customer',
                'soid',
                'email'
            ];

            const results = JSON.parse(context.value).values.reduce(function (p, c, i) {
                p[fMap[i]] = c;
                return p;
            }, {});

            // Group transactions by customer
            context.write({
                key: results.customer,
                value: {
                    soId: results.soid,
                    email: results.email
                }
            });
        }

        /**
        * @param {MapReduceContext.reduce} context
        */
        function reduce(context) {

            // Contains each transaction to send to customer
            const customer = context.key;
            const transactions = context.value;

            // TODO: Add logic for emailing transactions to customer
        }

        /**
        * @param {MapReduceContext.summarize} summary
        */
        function summarize(summary) {

            log.debug('summary', JSON.stringify(summary));

            summary.mapSummary.errors.iterator().each(function (key, value) {
                log.debug('map key = ' + key, 'message is ' + JSON.parse(value).message);
            });

            summary.reduceSummary.errors.iterator().each(function (key, value) {
                log.debug('reduce key = ' + key, 'message is ' + JSON.parse(value).message);
            });
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    }
);
