module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    clearMocks: true,
    coverageDirectory: "coverage",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    testMatch: ["**/tests/**/*.test.ts", "**/__tests__/**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

