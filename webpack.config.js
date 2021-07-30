const path = require("path");
const PrettierPlugin = require('prettier-webpack-plugin');

module.exports = () => ({
    mode: 'development',
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].bundle.js",
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist')
    },
    module: {
        rules: [{
                test: /\.(js)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    edge: "17",
                                    firefox: "60",
                                    chrome: "67",
                                    safari: "11.1"
                                }
                            }]
                        ],
                    }
                }
       },]
    },
    plugins: [
        new PrettierPlugin(),
    ]
});