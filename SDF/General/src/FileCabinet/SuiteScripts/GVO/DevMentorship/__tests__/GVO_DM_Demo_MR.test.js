jest.mock('N/dataset');
jest.mock('N/runtime');
jest.mock('N/search');

const nsDataset = require('N/dataset');
const nsRuntime = require('N/runtime');
const nsSearch = require('N/search');

// Import the script to test
const scriptPath = '../GVO_DM_Demo_MR';
let script;

describe('GVO_DM_Demo_MR', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Mock the runtime parameter
        nsRuntime.getCurrentScript.mockReturnValue({
            getParameter: jest.fn()
        });

        // Load the script fresh for each test
        script = require(scriptPath);
    });

    describe('getInputData', () => {
        it('should return array data when testArray is selected', () => {
            nsRuntime.getCurrentScript().getParameter.mockReturnValue('testArray');
            
            const result = script.getInputData();
            
            expect(Array.isArray(result)).toBeTruthy();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ id: 1, name: 'First' });
        });

        it('should return search object when testSearch is selected', () => {
            nsRuntime.getCurrentScript().getParameter.mockReturnValue('testSearch');
            nsSearch.create.mockReturnValue({ run: jest.fn() });
            
            const result = script.getInputData();
            
            expect(nsSearch.create).toHaveBeenCalledWith({
                type: nsSearch.Type.CUSTOMER,
                filters: [],
                columns: ['entityid', 'email']
            });
        });

        it('should return file object when testFile is selected', () => {
            nsRuntime.getCurrentScript().getParameter.mockReturnValue('testFile');
            
            const result = script.getInputData();
            
            expect(result).toEqual({
                type: 'file',
                id: 336810
            });
        });
    });

    describe('map', () => {
        it('should write the same key/value pair', () => {
            const context = {
                key: 'testKey',
                value: 'testValue',
                write: jest.fn()
            };

            script.map(context);

            expect(context.write).toHaveBeenCalledWith({
                key: 'testKey',
                value: 'testValue'
            });
        });
    });

    describe('reduce', () => {
        it('should handle reduce context', () => {
            global.log = { debug: jest.fn() };
            const context = {
                key: 'testKey',
                values: ['testValue']
            };

            script.reduce(context);

            expect(global.log.debug).toHaveBeenCalled();
        });
    });

    describe('summarize', () => {
        it('should handle errors properly', () => {
            global.log = { debug: jest.fn(), error: jest.fn() };
            const summary = {
                inputSummary: { error: new Error('Test error') },
                mapSummary: {
                    errors: {
                        iterator: () => ({
                            each: jest.fn()
                        })
                    }
                },
                reduceSummary: {
                    errors: {
                        iterator: () => ({
                            each: jest.fn()
                        })
                    }
                }
            };

            script.summarize(summary);

            expect(global.log.error).toHaveBeenCalledWith(
                'GetInputData Error',
                expect.any(Error)
            );
        });
    });
});
