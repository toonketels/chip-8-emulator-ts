module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  reporters: [
    "default",
    [
        "jest-junit", {
            suiteName: "chip8 cli tests",
            outputDirectory: "../reports/junit/",
            outputName: "chip8-cli.xml"
        }
    ]
  ],
  coverageDirectory: '<rootDir>/../../reports/chip8-cli-coverage'
};