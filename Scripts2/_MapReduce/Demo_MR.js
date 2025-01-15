/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAMDConfig RequireConfig.json
 */
define(
    [
        'N/dataset',
        'N/file',
        'N/search'
    ],
    /**
     * @param {N_dataset} nsDataset
     * @param {N_file} nsFile
     * @param {N_search} nsSearch
     */
    function (
        nsDataset,
        nsFile,
        nsSearch
    ) {

        function getInputData() {

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
                testFile1: nsFile.load({
                    id: 'FileID'
                }),
                testFile2: {
                    type: 'file',
                    id: 123
                },
                testFile3: {
                    type: 'file',
                    path: '/SuiteScripts/test.csv'
                },

                // Option 4: Return an object array with keys
                testObject: {
                    custkey1: { value: 'data1' },
                    custkey2: { value: 'data2' }
                },

                // Option 5: Return a query object
                testQuery: {
                    type: 'suiteql',
                    query: 'SELECT id, name FROM customers'
                },

                // Option 6: Return a dataset object
                testDataset: nsDataset.load({ id: 'datasetId' })
            };

            return inputData.testQuery;
        }

        /**
         * @param {MapReduceContext.map} context
         */
        function map(context) {

            log.debug('map context', JSON.stringify(context));
        }

        /**
         * @param {MapReduceContext.reduce} context
         */
        function reduce(context) {

            log.debug('reduce context', JSON.stringify(context));
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
