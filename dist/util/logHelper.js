"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const ora = require("ora");
const fp_1 = require("lodash/fp");
const formatMessages = require("webpack-format-messages");
// const syntaxErrorLabel = 'Syntax error:';
const getServeSpinner = (() => {
    let spinner;
    return () => {
        if (!spinner)
            spinner = ora(`Starting development server, please wait~`);
        return spinner;
    };
})();
exports.getServeSpinner = getServeSpinner;
const printCompiling = () => {
    getServeSpinner().text = 'Compiling...';
    getServeSpinner().start();
};
exports.printCompiling = printCompiling;
const printBuildError = (err) => {
    const message = err.message;
    const stack = err.stack;
    if (stack && message.indexOf('from UglifyJs') !== -1) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);
            if (!matched) {
                throw new Error('Using errors for control flow is bad.');
            }
            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];
            console.log('Failed to minify the code from this file: \n\n', chalk_1.default.yellow(`\t${problemPath}:${line}${column !== '0' ? ':' + column : ''}`), '\n');
        }
        catch (ignored) {
            console.log('Failed to minify the bundle.', err);
        }
    }
    else {
        console.log((message || err) + '\n');
    }
    console.log();
};
exports.printBuildError = printBuildError;
const printSuccess = () => {
    getServeSpinner().stopAndPersist({
        symbol: '✅ ',
        text: chalk_1.default.green('Compiled successfully!\n')
    });
};
const printWarning = () => {
    getServeSpinner().stopAndPersist({
        symbol: '⚠️ ',
        text: chalk_1.default.yellow('Compiled with warnings.\n')
    });
};
const printFailed = () => {
    getServeSpinner().stopAndPersist({
        symbol: '🙅  ',
        text: chalk_1.default.red('Failed to compile.\n')
    });
};
const printWhenBeforeCompile = compiler => {
    compiler.hooks.beforeCompile.tap('taroBeforeCompile', filepath => {
        printCompiling();
    });
    return compiler;
};
const printWhenInvalid = compiler => {
    compiler.hooks.invalid.tap('taroInvalid', filepath => {
        printCompiling();
    });
    return compiler;
};
const printWhenFailed = compiler => {
    compiler.hooks.failed.tap('taroFailed', error => {
        printBuildError(error);
    });
    return compiler;
};
let isFirst = true;
const printWhenFirstDone = (devUrl, compiler) => {
    compiler.hooks.done.tap('taroDone', stats => {
        if (isFirst) {
            isFirst = false;
            getServeSpinner().clear();
            console.log();
            console.log(chalk_1.default.cyan(`ℹ️  Listening at ${devUrl}`));
            console.log(chalk_1.default.gray('\n监听文件修改中...\n'));
        }
    });
    return compiler;
};
const _printWhenDone = ({ verbose = false }, compiler) => {
    compiler.hooks.done.tap('taroDone', stats => {
        const { errors, warnings } = formatMessages(stats);
        if (!stats.hasErrors() && !stats.hasWarnings()) {
            printSuccess();
        }
        if (stats.hasErrors()) {
            printFailed();
            errors.forEach(e => console.log(e + '\n'));
            verbose && process.exit(1);
            return;
        }
        if (stats.hasWarnings()) {
            printWarning();
            warnings.forEach(w => console.log(w + '\n'));
        }
        verbose && console.log(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
            warnings: verbose
        }) + '\n');
    });
    return compiler;
};
const printWhenDone = fp_1.partial(_printWhenDone, [{ verbose: false }]);
const printWhenDoneVerbosely = fp_1.partial(_printWhenDone, [{ verbose: true }]);
const bindDevLogger = (devUrl, compiler) => {
    console.log();
    fp_1.pipe(printWhenBeforeCompile, fp_1.partial(printWhenFirstDone, [devUrl]), printWhenDone, printWhenFailed, printWhenInvalid)(compiler);
    return compiler;
};
exports.bindDevLogger = bindDevLogger;
const bindProdLogger = (compiler) => {
    console.log();
    fp_1.pipe(printWhenBeforeCompile, printWhenDoneVerbosely, printWhenFailed)(compiler);
    return compiler;
};
exports.bindProdLogger = bindProdLogger;
