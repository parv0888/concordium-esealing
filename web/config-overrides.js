const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    // The Webpack config to use when compiling your react app for development or production.
    webpack: function (config, env) {
        // ...add your webpack config
        return {
            ...config,
            resolve: {
                ...config.resolve,
                fallback: {
                    ...config.resolve.fallback,
                    "fs": require.resolve("browserify-fs"),
                    "crypto": require.resolve("crypto-browserify"),
                }
            },
            plugins: [
                new NodePolyfillPlugin(),
                ...config.plugins,
            ]
        };
    },
}