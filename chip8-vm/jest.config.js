module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  reporters: [
    "default",
    [
      "jest-junit", {
      suiteName: "chip8 vm tests",
      outputDirectory: "../reports/junit/",
      outputName: "chip8-vm.xml"
    }
    ]
  ],
  coverageDirectory: '<rootDir>/../../reports/chip8-vm-coverage'
};