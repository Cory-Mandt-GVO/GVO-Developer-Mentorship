const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");
const cliConfig = require("./suitecloud.config");

module.exports = {
    ...SuiteCloudJestConfiguration.build({
        projectFolder: cliConfig.defaultProjectFolder,
        projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
    }),
    moduleNameMapper: {
        '^N/(.*)$': '<rootDir>/src/FileCabinet/SuiteScripts/lib/mocks/$1.js'
    },
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],
    verbose: true
};
