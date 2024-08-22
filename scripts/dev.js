//打包packages下的所有包

import minimist from "minimist"; //处理命令行参数

import { resolve, dirname } from "path"; //resolve用于拼接路径，dirname用于获取当前文件的目录
import { fileURLToPath } from "url"; //将file://url 转换为 /url 的形式

import { createRequire } from "module"; //用于加载node_modules中的包
import esbuild from "esbuild"; //打包工具

//1、解析打包文件的路径
const __filename = fileURLToPath(import.meta.url); //获取当前文件的绝对路径,将file://url 转换为 /url 的形式
const __dirname = dirname(__filename); //获取当前文件所在的目录

//2、解析命令行参数
const args = minimist(process.argv.slice(2)); //获取命令行参数
const target = args._[0] || "reactivity"; //打包哪个项目
const format = args.f || "iife"; //打包格式，默认为自执行函数

//3、esbuild打包
const requere = createRequire(import.meta.url);
const pgk = requere(`../packages/${target}/package.json`); //获取独立模块下的package.json
const entry = resolve(__dirname, "../packages", target, "src", "index.ts"); //打包入口文件的绝对路径
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.js`); //打包后的文件路径

//console.log(__filename, __dirname, target, format, entry);

esbuild
    .context({
        //打包上下文
        entryPoints: [entry], //打包入口文件
        outfile, //打包后的文件路径
        bundle: true, //是否打包在一个文件中，一个模块依赖其它多个模块时，会将这些模块打包在一个文件中
        platform: "browser", //打包平台
        format, //打包格式：esm、iife、cjs
        sourcemap: true, //是否生成sourceMap，方便调试
        globalName: pgk.buildOptions?.name, //打包后的全局变量名，iife打包格式下使用
    })
    .then((ctx) => {
        console.log(">>>打包：" + outfile + " 成功");
        return ctx.watch(); //监听文件变化，自动重新打包
    });
