// for resolving the absolute path to our project
// necessary for webpack
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    // where our app "starts"
    entry: {
        index: './js/main.js',
        info: './js/restaurant_info.js',
        sw: './js/sw.js'
    },
    // where to put the transpiled javascript
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]_bundle.js'
    },
    plugins: [
        new UglifyJsPlugin()
    ],
    // babel config
    module: {
        rules: [
            {
                // anything file that ends with '.js'
                test: /\.js$/,
                // except those in "node_modules"
                exclude: /node_modules/,
                // transform with babel
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },

    // allows us to see how the transpiled js relates to the untranspiled js
    devtool: 'source-map'
};
