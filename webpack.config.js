// for resolving the absolute path to our project
// necessary for webpack
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    mode: 'development',
    // where our app "starts"
    entry: {
        index: './js/main.js',
        info: './js/restaurant_info.js'
    },
    // where to put the transpiled javascript
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]_bundle.js'
    },
    plugins: [
        new UglifyJsPlugin(),
        new CompressionPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.js$|\.css$|\.html$/,
                threshold: 10240,
                minRatio: 0.8
            })
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
            },
            {
                test: /\.css/,
                loaders: ['style-loader', 'css-loader'],
                include: __dirname + '/css'
            }
        ]
    },

    // allows us to see how the transpiled js relates to the untranspiled js
    devtool: 'source-map'
};
