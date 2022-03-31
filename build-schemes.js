
const bundlerBabelPlugins = [
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
    ["@babel/plugin-syntax-class-properties"],
    ["@babel/plugin-transform-typescript"],
    ["@babel/plugin-transform-runtime"],
]

const bundlerConfig = {
    cacheSection: "no-external-modules"
}

const compilerConfig = {
    includeExternalModules: false,
    babelPlugins: bundlerBabelPlugins,
    babelPresets: [
        ['@babel/preset-env', { "targets": "node 10", "loose": false }]
    ]
}

const buildScheme = {
    steps: [{
        action: "bundle-javascript",
        source: "src/server/index.ts",
        target: `#server-build = dist/server.js`,
        compilerOptions: compilerConfig,
        ...bundlerConfig
    }, {
        action: "bundle-javascript",
        source: "src/client/index.ts",
        target: `#client-build = dist/client.js`,
        compilerOptions: compilerConfig,
        ...bundlerConfig
    }]
}

module.exports = {
    schemes: {
        build: buildScheme
    }
}