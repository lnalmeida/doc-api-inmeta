module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: ['.*\\.spec\\.ts$', '.*\\.test\\.ts$'], 
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  // env: {
  //   NODE_ENV: 'test',
  // },
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/test/'], 
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', 
  },
};

// Parte removida do package.json pra resolver a incompatibilidade com o ts-jest

  // "jest": {
  //   "moduleFileExtensions": [
  //     "js",
  //     "json",
  //     "ts"
  //   ],
  //   "rootDir": "src",
  //   "testRegex": ".*\\.spec\\.ts$",
  //   "transform": {
  //     "^.+\\.(t|j)s$": "ts-jest"
  //   },
  //   "collectCoverageFrom": [
  //     "**/*.(t|j)s"
  //   ],
  //   "coverageDirectory": "../coverage",
  //   "testEnvironment": "node"
  // }