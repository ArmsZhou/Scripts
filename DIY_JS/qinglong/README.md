学习在 qx 上编写 js 脚本，以下为踩过的坑。😭

1. `console.log`

在 qx 的 js 环境中，并不支持 `console.log` 的格式化输出

```js
console.log("apps:%o", apps); // app 的值无法输出
```

只支持直接输出

```js
console.log(apps); // app 的值可以输出
```

2. 缓存读取

为了方便开发，我使用了 `Peng-YM` 开发的 `OpenAPI`，请查看 下面链接对应的 `持久化` 相关内容。值得注意是以下这一点。

如果希望在脚本里直接存取$prefs或者$persistentStore里面的缓存，可以通过在KEY前面加#号实现：

```js
/**
 * OpenAPI
 * @author: Peng-YM
 * https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
 */

$.read("#KEY");
$.write(value, "#KEY");
```
