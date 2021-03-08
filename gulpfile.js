const { src, dest, parallel, series, watch } = require("gulp");

const del = require("del");
const browserSync = require("browser-sync");

// const babel = require("gulp-babel");
// const scss = require("gulp-sass");
// const swig = require("gulp-swig");
// const imagemin = require("gulp-imagemin");

const loadPlugins = require("gulp-load-plugins"); //通过require手动导入插件，后期使用插件越来越多，操作会越来越多，不利于后期维护，可通过这个插件解决这个问题。自动加载所有gulp插件(插件名为 gulp- 后面的名字,如果是多个-就用驼峰命名)
const plugins = loadPlugins();
const bs = browserSync.create();

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "Features",
      link: "features.html",
    },
    {
      name: "About",
      link: "about.html",
    },
    {
      name: "Contact",
      link: "#",
      children: [
        {
          name: "Twitter",
          link: "https://twitter.com/w_zce",
        },
        {
          name: "About",
          link: "https://weibo.com/zceme",
        },
        {
          name: "divider",
        },
        {
          name: "About",
          link: "https://github.com/zce",
        },
      ],
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};
const clean = () => {
  return del(["dist", "temp"]); //返回promise
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const script = () => {
  //babel默认只是es转换的平台，不做任何事情，具体做什么要靠里面的插件，而presets就是插件的集合
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
//其他文件
const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};
const useref = () => {
  return src("temp/*.html", { base: "temp" })
    .pipe(plugins.useref({ searchPath: ["temp", "."] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true, //空白字符
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest("dist"));
};
const serve = () => {
  //可通过监听文件变化，bs.reload 刷新页面
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );
  bs.init({
    notify: false, //页面打开会弹出一提示，可关闭
    port: 9999,
    // open:false,
    // files: "temp/**", //监听路径热更新
    server: {
      // baseDir: "temp",
      baseDir: ["temp", "src", "public"], //从temp目录开始依次往下找
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};
const compile = parallel(style, script, page);
const build = series(
  clean,
  parallel(series(compile, useref), extra, image, font)
);
const develop = series(compile, serve);
module.exports = {
  // style,
  // script,
  // page,
  // image,
  // font,
  // compile,
  clean,
  build,
  // serve,
  develop,
  // useref,
};
