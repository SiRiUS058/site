const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = (env, options) => {
    const devMode = options.mode !== "production";
    return {
        entry: './src/index.js',
        mode: options.mode,
        output: {
            filename: 'js/build.js',
            path: path.resolve(__dirname, 'assets'),
            //clean: true,
            assetModuleFilename: 'img/[name][ext]',
            publicPath: "auto",
        },
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: devMode,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        [
                                            "postcss-preset-env",
                                            {
                                                browsers: 'last 2 versions',
                                                autoprefixer: { grid: true }
                                            },
                                        ],
                                    ],
                                }
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass"),
                                sourceMap: devMode,
                            },
                        },
                        {
                            loader: "sass-resources-loader",
                            options: {
                                resources: [
                                    './node_modules/normalize-scss/sass/_normalize.scss',
                                    './src/scss/mixins.scss',
                                    './src/scss/variables.scss',
                                ]
                            }
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                },
            ],
        },
        optimization: {
            minimize: !devMode,
            minimizer: [
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        minify: CssMinimizerPlugin.cleanCssMinify,
                        preset: [
                            "default",
                            {
                                discardComments: { removeAll: true },
                            },
                        ],
                    },
                }),
            ],
        },
        plugins: []
            .concat(new ImageMinimizerPlugin({
                minimizerOptions: {
                    plugins: [
                        ["gifsicle", { interlaced: true }],
                        ["mozjpeg", { progressive: true }],
                        ["pngquant", { optimizationLevel: 5 }],
                        ["svgo",
                            {
                                plugins: extendDefaultPlugins([
                                    {name: "removeViewBox", active: false,},
                                    {
                                        name: "addAttributesToSVGElement",
                                        params: {
                                            attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                                        },
                                    },
                                ]),
                            },
                        ],
                    ],
                },
                loader: false,
            }))
            .concat(devMode ? [] : [new MiniCssExtractPlugin({filename: "css/build.css", chunkFilename: "css/[id].css"})])
            .concat(new MinifyPlugin()),
    }
};
