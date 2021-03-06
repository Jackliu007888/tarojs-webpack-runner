"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apis = require("@tarojs/taro-h5/dist/taroApis");
const runner_utils_1 = require("@tarojs/runner-utils");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const csso_webpack_plugin_1 = require("csso-webpack-plugin");
const sass = require("sass");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const lodash_1 = require("lodash");
const fp_1 = require("lodash/fp");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path_1 = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const _1 = require(".");
const postcss_conf_1 = require("../config/postcss.conf");
const makeConfig = (buildConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const sassLoaderOption = yield runner_utils_1.getSassLoaderOption(buildConfig);
    return Object.assign(Object.assign({}, buildConfig), { sassLoaderOption });
});
exports.makeConfig = makeConfig;
const defaultUglifyJsOption = {
    keep_fnames: true,
    output: {
        comments: false,
        keep_quoted_props: true,
        quote_keys: true,
        beautify: false
    },
    warnings: false
};
const defaultCSSCompressOption = {
    mergeRules: false,
    mergeIdents: false,
    reduceIdents: false,
    discardUnused: false,
    minifySelectors: false
};
const defaultBabelLoaderOption = {
    babelrc: false,
    plugins: [
        require.resolve('babel-plugin-syntax-dynamic-import'),
        [
            require.resolve('babel-plugin-transform-react-jsx'),
            {
                pragma: 'Nerv.createElement'
            }
        ],
        [
            require.resolve('babel-plugin-transform-taroapi'),
            {
                apis,
                packageName: '@tarojs/taro-h5'
            }
        ]
    ]
};
const defaultMediaUrlLoaderOption = {
    limit: 10240
};
const defaultFontUrlLoaderOption = {
    limit: 10240
};
const defaultImageUrlLoaderOption = {
    limit: 10240
};
const defaultCssModuleOption = {
    enable: false,
    config: {
        namingPattern: 'global',
        generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
};
const getLoader = (loaderName, options) => {
    return {
        loader: require.resolve(loaderName),
        options: options || {}
    };
};
const listify = listOrItem => {
    if (Array.isArray(listOrItem)) {
        return listOrItem;
    }
    return [listOrItem];
};
const getPlugin = (plugin, args) => {
    return {
        plugin,
        args
    };
};
const mergeOption = ([...options]) => {
    return _1.recursiveMerge({}, ...options);
};
const processEnvOption = lodash_1.partial(fp_1.mapKeys, key => `process.env.${key}`);
exports.processEnvOption = processEnvOption;
const getStyleLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'style-loader'));
const getCssLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'css-loader'));
const getPostcssLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'postcss-loader'));
const getResolveUrlLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'resolve-url-loader'));
const getSassLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'sass-loader'));
const getLessLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'less-loader'));
const getStylusLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'stylus-loader'));
const getBabelLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'babel-loader'));
const getUrlLoader = fp_1.pipe(mergeOption, lodash_1.partial(getLoader, 'url-loader'));
const getExtractCssLoader = () => {
    return {
        loader: MiniCssExtractPlugin.loader
    };
};
const getMiniCssExtractPlugin = fp_1.pipe(mergeOption, listify, lodash_1.partial(getPlugin, MiniCssExtractPlugin));
exports.getMiniCssExtractPlugin = getMiniCssExtractPlugin;
const getHtmlWebpackPlugin = fp_1.pipe(mergeOption, listify, lodash_1.partial(getPlugin, HtmlWebpackPlugin));
exports.getHtmlWebpackPlugin = getHtmlWebpackPlugin;
const getDefinePlugin = fp_1.pipe(mergeOption, listify, lodash_1.partial(getPlugin, webpack.DefinePlugin));
exports.getDefinePlugin = getDefinePlugin;
const getHotModuleReplacementPlugin = lodash_1.partial(getPlugin, webpack.HotModuleReplacementPlugin, []);
exports.getHotModuleReplacementPlugin = getHotModuleReplacementPlugin;
const getUglifyPlugin = ([enableSourceMap, uglifyOptions]) => {
    return new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: enableSourceMap,
        uglifyOptions: _1.recursiveMerge({}, defaultUglifyJsOption, uglifyOptions)
    });
};
exports.getUglifyPlugin = getUglifyPlugin;
const getCssoWebpackPlugin = ([cssoOption]) => {
    return fp_1.pipe(mergeOption, listify, lodash_1.partial(getPlugin, csso_webpack_plugin_1.default))([defaultCSSCompressOption, cssoOption]);
};
exports.getCssoWebpackPlugin = getCssoWebpackPlugin;
const getCopyWebpackPlugin = ({ copy, appPath }) => {
    const args = [
        copy.patterns.map(({ from, to }) => {
            return {
                from,
                to: path_1.resolve(appPath, to),
                context: appPath
            };
        }),
        copy.options
    ];
    return lodash_1.partial(getPlugin, CopyWebpackPlugin)(args);
};
exports.getCopyWebpackPlugin = getCopyWebpackPlugin;
const sassReg = /\.(s[ac]ss)\b/;
const lessReg = /\.less\b/;
const stylReg = /\.styl\b/;
const styleReg = /\.(css|s[ac]ss|less|styl)\b/;
const styleModuleReg = /(.*\.module).*\.(css|s[ac]ss|less|styl)\b/;
const styleGlobalReg = /(.*\.global).*\.(css|s[ac]ss|less|styl)\b/;
const jsxReg = /\.jsx?$/;
const mediaReg = /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/;
const fontReg = /\.(woff2?|eot|ttf|otf)(\?.*)?$/;
const imageReg = /\.(png|jpe?g|gif|bpm|svg)(\?.*)?$/;
const isNodeModule = (filename) => /\bnode_modules\b/.test(filename);
exports.isNodeModule = isNodeModule;
const taroModuleRegs = [
    /@tarojs[/\\_]components/, /\btaro-components\b/
];
const isTaroModule = (filename) => taroModuleRegs.some(reg => reg.test(filename));
exports.isTaroModule = isTaroModule;
const defaultEsnextModuleRegs = [
    /@tarojs[/\\_]components/, /\btaro-components\b/,
    /@tarojs[/\\_]taro-h5/, /\btaro-h5\b/,
    /@tarojs[/\\_]router/, /\btaro-router\b/,
    /@tarojs[/\\_]redux-h5/, /\btaro-redux-h5\b/,
    /@tarojs[/\\_]mobx-h5/, /\btaro-mobx-h5\b/
];
const getEsnextModuleRules = esnextModules => {
    return [
        ...defaultEsnextModuleRegs,
        ...esnextModules
    ];
};
exports.getEsnextModuleRules = getEsnextModuleRules;
const getModule = (appPath, { staticDirectory, designWidth, deviceRatio, enableExtract, enableSourceMap, styleLoaderOption, cssLoaderOption, lessLoaderOption, sassLoaderOption, stylusLoaderOption, fontUrlLoaderOption, imageUrlLoaderOption, mediaUrlLoaderOption, esnextModules = [], postcss, babel }) => {
    const postcssOption = postcss || {};
    const defaultStyleLoaderOption = {
        sourceMap: enableSourceMap
        /**
         * 移除singleton设置，会导致样式库优先级发生错误
         * singleton: true
         */
    };
    const cssModuleOptions = _1.recursiveMerge({}, defaultCssModuleOption, postcssOption.cssModules);
    const { namingPattern, generateScopedName } = cssModuleOptions.config;
    const cssOptions = [
        {
            importLoaders: 1,
            sourceMap: enableSourceMap,
            modules: false
        },
        cssLoaderOption
    ];
    const cssOptionsWithModule = [
        Object.assign({
            importLoaders: 1,
            sourceMap: enableSourceMap,
            modules: namingPattern === 'module' ? true : 'global'
        }, typeof generateScopedName === 'function'
            ? { getLocalIdent: (context, _, localName) => generateScopedName(localName, context.resourcePath) }
            : { localIdentName: generateScopedName }),
        cssLoaderOption
    ];
    const additionalBabelOptions = Object.assign(Object.assign({}, babel), { sourceMap: enableSourceMap });
    const esnextModuleRules = getEsnextModuleRules(esnextModules);
    /**
     * isEsnextModule
     *
     * 使用正则匹配判断是否是es模块
     * 规则参考：https://github.com/webpack/webpack/blob/master/lib/RuleSet.js#L413
     */
    const isEsnextModule = (filename) => esnextModuleRules.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        else {
            return filename.indexOf(pattern) > -1;
        }
    });
    const styleLoader = getStyleLoader([
        defaultStyleLoaderOption,
        styleLoaderOption
    ]);
    const topStyleLoader = getStyleLoader([
        defaultStyleLoaderOption,
        { insertAt: 'top' },
        styleLoaderOption
    ]);
    const extractCssLoader = getExtractCssLoader();
    const lastStyleLoader = enableExtract ? extractCssLoader : styleLoader;
    /**
     * css-loader 1.0.0版本移除了minimize选项...升级需谨慎
     *
     * https://github.com/webpack-contrib/css-loader/releases/tag/v1.0.0
     */
    const cssLoader = getCssLoader(cssOptions);
    const cssLoaders = [{
            use: [cssLoader]
        }];
    if (cssModuleOptions.enable) {
        const cssLoaderWithModule = getCssLoader(cssOptionsWithModule);
        let cssModuleCondition;
        if (cssModuleOptions.config.namingPattern === 'module') {
            /* 不排除 node_modules 内的样式 */
            cssModuleCondition = styleModuleReg;
        }
        else {
            cssModuleCondition = {
                and: [
                    { exclude: styleGlobalReg },
                    { exclude: [isNodeModule] }
                ]
            };
        }
        cssLoaders.unshift({
            include: [cssModuleCondition],
            use: [cssLoaderWithModule]
        });
    }
    const postcssLoader = getPostcssLoader([
        { sourceMap: enableSourceMap },
        {
            ident: 'postcss',
            plugins: postcss_conf_1.getPostcssPlugins(appPath, {
                designWidth,
                deviceRatio,
                postcssOption
            })
        }
    ]);
    const resolveUrlLoader = getResolveUrlLoader([]);
    const sassLoader = getSassLoader([{
            sourceMap: true,
            implementation: sass
        }, sassLoaderOption]);
    const lessLoader = getLessLoader([{ sourceMap: enableSourceMap }, lessLoaderOption]);
    const stylusLoader = getStylusLoader([{ sourceMap: enableSourceMap }, stylusLoaderOption]);
    const rule = {};
    rule.sass = {
        test: sassReg,
        enforce: 'pre',
        use: [resolveUrlLoader, sassLoader]
    };
    rule.less = {
        test: lessReg,
        enforce: 'pre',
        use: [lessLoader]
    };
    rule.styl = {
        test: stylReg,
        enforce: 'pre',
        use: [stylusLoader]
    };
    rule.css = {
        test: styleReg,
        oneOf: cssLoaders
    };
    rule.postcss = {
        test: styleReg,
        use: [postcssLoader],
        exclude: [filename => {
                if (isTaroModule(filename)) {
                    return true;
                }
                else if (isEsnextModule(filename)) {
                    return false;
                }
                else {
                    return isNodeModule(filename);
                }
            }]
    };
    rule.taroStyle = {
        test: styleReg,
        enforce: 'post',
        use: [topStyleLoader],
        include: [(filename) => isTaroModule(filename)]
    };
    rule.customStyle = {
        test: styleReg,
        enforce: 'post',
        use: [lastStyleLoader],
        exclude: [(filename) => isTaroModule(filename)]
    };
    rule.jsx = {
        test: jsxReg,
        use: {
            babelLoader: getBabelLoader([defaultBabelLoaderOption, additionalBabelOptions])
        }
    };
    rule.media = {
        test: mediaReg,
        use: {
            urlLoader: getUrlLoader([defaultMediaUrlLoaderOption, Object.assign({ name: `${staticDirectory}/media/[name].[ext]` }, mediaUrlLoaderOption)])
        }
    };
    rule.font = {
        test: fontReg,
        use: {
            urlLoader: getUrlLoader([defaultFontUrlLoaderOption, Object.assign({ name: `${staticDirectory}/fonts/[name].[ext]` }, fontUrlLoaderOption)])
        }
    };
    rule.image = {
        test: imageReg,
        use: {
            urlLoader: getUrlLoader([defaultImageUrlLoaderOption, Object.assign({ name: `${staticDirectory}/images/[name].[ext]` }, imageUrlLoaderOption)])
        }
    };
    return { rule };
};
exports.getModule = getModule;
const getOutput = (appPath, [{ outputRoot, publicPath, chunkDirectory }, customOutput]) => {
    return Object.assign({ path: path_1.join(appPath, outputRoot), filename: 'js/[name].js', chunkFilename: `${chunkDirectory}/[name].js`, publicPath }, customOutput);
};
exports.getOutput = getOutput;
const getDevtool = ({ enableSourceMap, sourceMapType }) => {
    return enableSourceMap ? sourceMapType || 'cheap-module-eval-source-map' : 'none';
};
exports.getDevtool = getDevtool;
