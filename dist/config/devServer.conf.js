"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devServerConf = {
    compress: true,
    disableHostCheck: true,
    historyApiFallback: {
        disableDotRule: true
    },
    host: '0.0.0.0',
    hot: true,
    https: false,
    inline: true,
    open: true,
    overlay: true,
    port: 10086,
    quiet: true,
    watchContentBase: true,
    writeToDisk: false
};
exports.default = devServerConf;
