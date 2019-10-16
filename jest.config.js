module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(ts)$': '<rootDir>/node_modules/ts-jest'
  }
  // testMatch: ['<rootDir>/test/**/*.js']
}
