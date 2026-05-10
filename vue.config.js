// const { defineConfig } = require("@vue/cli-service");
// module.exports = defineConfig({
//   transpileDependencies: true,
// });
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const configPath = path.resolve("./.vue-svgicon.config.js");

let options = {};

if (fs.existsSync(configPath)) {
  options = require(configPath);
}

module.exports = {
  // publicPath can be set via VUE_APP_PUBLIC_PATH env var for GitHub Pages (e.g. '/repo-name/')
  publicPath:
    process.env.NODE_ENV === "production"
      ? process.env.VUE_APP_PUBLIC_PATH || "/"
      : "/",
  pluginOptions: {},
  chainWebpack: (config) => {
    const svgFilePath = options.svgFilePath;
    const svgoConfig = options.svgoConfig;

    if (!svgFilePath) {
      console.error("@yzfe/vue-cli-plugin-svgicon: svgFilePath no set.");
      return;
    }

    config.module
      .rule("vue-svgicon")
      .include.add(svgFilePath)
      .end()
      .test(/\.svg$/)
      .use("svgicon")
      .loader("@yzfe/svgicon-loader")
      .options({
        svgFilePath,
        svgoConfig,
      });

    config.module.rule("svg").exclude.add(svgFilePath).end();
  },
};
