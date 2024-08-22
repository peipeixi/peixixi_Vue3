# peixixi_Vue3

手写 vue3 源码
monorepo 仓库管理
pnpm 9.7.1
node 18.18.0

测试环境打包 packages 下的某个模块：
根目录下的 package.json 文件修改"scripts": dev 对应的模块名称:如 reactivity、compiler-core
"scripts": {
"dev": "node scripts/dev.js reactivity -f esm",
},
