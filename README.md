


### 使用

1. `git clone https://github.com/Liting1/electron-vue-template.git`
2. `npm install`
3. `npm run dev` 开发
4. `npm run build` 生产打包

> 打包应用程序时需要下载 electron-v11.2.0-win32-x64.zip 文件，下载速度很慢，下载失败。
> 如果时window系统，可以将 /doc/electron-v11.2.0-win32-x64.zip 已经下载好的文件直接复制到 `C:\Users\liting\AppData\Local\electron\Cache`文件夹下, 注：第二个目录时对应用户的目录，每个人的可能不一样


### 功能
1. 热加载开发
2. 打包生成App

### 项目目录结构

```
|—— app
|—— pack
|—— builder
|—— config
|—— src
|	 |—— main
|	 |—— pages
|	 |—— renderer	
|—— .babelrc
|—— .gitignore
|—— package-lock.json
|—— package.json
|—— README.md

```

SourceMap: 配置参考地址：
1. https://juejin.im/post/6844903450644316174
2. https://webpack.js.org/configuration/devtool/#development

node: 配置参考：


## css-loader
1. https://vue-loader.vuejs.org/zh/guide/extract-css.html#webpack-4


1. 打包App
2. 热更新
3. 路由模式History

参考网站： https://github.com/mubaidr/vue-electron-template

https://www.cnblogs.com/kakayang/p/11766273.html

