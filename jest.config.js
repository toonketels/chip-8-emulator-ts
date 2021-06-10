module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  reporters: [
    "default",
    [
        "jest-junit", { outputDirectory: "reports/junit/" }
    ]
  ],
  coverageDirectory: '<rootDir>/../reports/coverage'
};