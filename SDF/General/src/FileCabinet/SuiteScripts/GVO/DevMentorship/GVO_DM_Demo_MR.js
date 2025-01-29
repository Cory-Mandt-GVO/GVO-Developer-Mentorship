/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(
    [
        'N/dataset',
        'N/runtime',
        'N/search'
    ],
    /**
     * @param {N_dataset} nsDataset
     * @param {N_runtime} nsRuntime
     * @param {N_search} nsSearch
     */
    function (
        nsDataset,
        nsRuntime,
        nsSearch
    ) {

        function getInputData() {

            const testStr = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_gvo_dmdemo_test' });
            const inputData = {
                // Option 1: Return an array of values
                testArray: [
                    { id: 1, name: 'First' },
                    { id: 2, name: 'Second' }
                ],

                // Option 2: Return a search object
                testSearch: nsSearch.create({
                    type: nsSearch.Type.CUSTOMER,
                    filters: [],
                    columns: ['entityid', 'email']
                }),
                
                // Option 3: Return a file object (CSV/TXT)
                // testFile: nsFile.load({
                //     id: 'FileID'
                // }),
                testFile: {
                    type: 'file',
                    id: 336810
                },
                // testFile: {
                //     type: 'file',
                //     path: '/SuiteScripts/test.csv'
                // },

                // Option 4: Return an object array with keys
                testObject: {
                    custkey1: { value: 'data1' },
                    custkey2: { value: 'data2' }
                },

                // Option 5: Return a query object
                testQuery: {
                    type: 'suiteql',
                    query: `
                        SELECT TOP 10
                            t.entity,
                            t.tranid,
                            tl.item
                        FROM
                            transaction t
                            INNER JOIN transactionline tl ON t.id = tl.transaction
                        WHERE
                            t.recordtype = 'salesorder'
                            AND tl.item IS NOT NULL
                    `
                },

                // Option 6: Return a dataset object
                testDataset: nsDataset.load({ id: 'TransactionDetailDataSet' })
            };

            return inputData[testStr];
        }

        /**
         * @param {MapReduceContext.map} context
         */
        function map(context) {

            log.debug('map context', context);
            const values = JSON.parse(context.value).values;

            context.write({
                key: values[0],
                value: context.value
            });
        }

        /**
         * @param {MapReduceContext.reduce} context
         */
        function reduce(context) {

            log.debug('reduce context', context);
        }

        /**
         * @param {MapReduceContext.summarize} summary
         */
        function summarize(summary) {

            log.debug('summary', JSON.stringify(summary));

            if (summary.inputSummary.error) {
                log.error('GetInputData Error', summary.inputSummary.error);
            }

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
