/******
 
【Quantumult X】
————————————————
30 * * * * https://raw.githubusercontent.com/ArmsZhou/Scripts/main/DIY_JS/qinglong/ql_env.js, tag=青龙同步JD_Cookies, img-url=https://raw.githubusercontent.com/ArmsZhou/Scripts/main/IMG/ql.png, enabled=true

******/

//const $ = API("sync_jd_cookies_to_ql"); // 创建一个名字为weather的脚本。默认为product环境，抑制所有log输出，保持error信息。。
const $ = API("Sync_JD_Cookies_To_Qinglong", true); // 打开debug环境，打开所有log输出
// 请修改为自己的青龙后台应用密钥
let client_id = "Ky-fuMZn0wfG"
let client_secret = "vpdUTSrbReTo8soaesXwA_6J"
let ql_server_url = "http://astroman.myddns.me:10066/open"
let timeout = 15000

let notifys = [];

function getQinglongAuth() {
    return new Promise((resolve) => {
        let url = ql_server_url + "/auth/token?client_id=" + client_id + "&client_secret=" + client_secret
        $.http
            .get({
                url: url,
                timeout: timeout
            })
            .then((response) => {
                try {
                    let body = JSON.parse(response.body);
                    let code = body.code;
                    if (code != 200) {
                        let message = body.message;
                        throw new Error("🐉 接口请求错误!!! \nGET: " + url + "\ncode: " + code + "\nmessage: " + message);

                    } else {
                        let tokenType = body.data.token_type
                        let token = body.data.token
                        resolve(tokenType + " " + token);
                    }

                } catch (error) {
                    handleError(error.message);
                }
            })
            .catch((error) => {
                handleError("🐉 接口请求错误!!! \nGET: " + url + "\nerror: " + JSON.stringify(error));
            })
    })
}

function getAllJdCookieEnv() {
    return new Promise((resolve) => {
        let url = "/envs"
        $.http
            .get(url)
            .then((response) => {
                try {
                    let body = JSON.parse(response.body);
                    let code = body.code;
                    if (code != 200) {
                        let message = body.message;
                        throw new Error("🐉 接口请求错误!!! \nGET: " + url + "\ncode: " + code + "\nmessage: " + message);

                    } else {
                        let envs = body.data
                        let jdCookieEnvs = []
                        envs.forEach((env) => {
                            if(env.name == "JD_COOKIE") {
                                jdCookieEnvs.push(env)
                            }
                        });
                        resolve(jdCookieEnvs);
                    }

                } catch (error) {
                    handleError(error.message);
                }
            })
            .catch((error) => {
                handleError("🐉 接口请求错误!!! \nGET: " + url + "\nerror: " + JSON.stringify(error));
            })
    })
}

function addEnv(env) {
    return new Promise((resolve) => {
        let url = "/envs"
        let jsonBody = [env]
        $.http
            .post({
                url: url,
                body: JSON.stringify(jsonBody)
            })
            .then((response) => {
                try {
                    let body = JSON.parse(response.body);
                    let code = body.code;
                    if (code != 200) {
                        let message = body.message;
                        throw new Error("🐉 接口请求错误!!! \nPOST: " + url + "\ncode: " + code + "\nmessage: " + message);

                    } else {
                        let env = body.data[0]
                        resolve(env);
                    }

                } catch (error) {
                    handleError(error.message);
                }
            })
            .catch((error) => {
                handleError("🐉 接口请求错误!!! \nPOST: " + url + "\nerror: " + JSON.stringify(error));
            })
    })
}

function updateEnv(env) {
    return new Promise((resolve) => {
        let url = "/envs"
        let jsonBody = env
        $.http
            .put({
                url: url,
                body: JSON.stringify(jsonBody)
            })
            .then((response) => {
                try {
                    let body = JSON.parse(response.body);
                    let code = body.code;
                    if (code != 200) {
                        let message = body.message;
                        throw new Error("🐉 接口请求错误!!! \nPUT: " + url + "\ncode: " + code + "\nmessage: " + message);

                    } else {
                        resolve(true);
                    }

                } catch (error) {
                    handleError(error.message);
                }
            })
            .catch((error) => {
                handleError("🐉 接口请求错误!!! \nPUT: " + url + "\nerror: " + JSON.stringify(error));
            })
    })
}

function enableEnv(env) {
    return new Promise((resolve) => {
        let url = "/envs/enable"
        let jsonBody = [env.id]
        $.http
            .put({
                url: url,
                body: JSON.stringify(jsonBody)
            })
            .then((response) => {
                try {
                    let body = JSON.parse(response.body);
                    let code = body.code;
                    if (code != 200) {
                        let message = body.message;
                        throw new Error("🐉 接口请求错误!!! \nPUT: " + url + "\ncode: " + code + "\nmessage: " + message);

                    } else {
                        resolve(true);
                    }

                } catch (error) {
                    $.error(error.message)
                    $.done()
                }
            })
            .catch((error) => {
                $.error("🐉 接口请求错误!!! \nPUT: " + url + "\nerror: " + JSON.stringify(error));
                $.done()
            })
    })
}

(async function () {
    let auth = await getQinglongAuth();
    $.log("🐉 授权获取成功: " + auth)

    // 统一设置后续请求，带 auth
    $.http = HTTP({
        baseURL: ql_server_url,
        timeout: timeout,
        headers: {
            Authorization: auth,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
            "Content-Type": "application/json"
        }
    });

    let jdCookieEnvs = await getAllJdCookieEnv();
    $.log("🐉 青龙现有👉【" + jdCookieEnvs.length + "】个 JD_COOKIE 环境变量:\n" + JSON.stringify(jdCookieEnvs));

    let value = $.read("#CookiesJD");
    var jd_users;
    if (value != "" && value != undefined) {
        jd_users = JSON.parse(value);
        $.log("🐉 本地发现👉【" + jd_users.length + "】个 JD Cookies:\n" + JSON.stringify(jd_users));

    } else {
        throw ("🐉 未找到 JD Cookie，请先获取 JD Cookie 后再尝试");
    }

    var jd_user_names = []
    jd_users.forEach((user) => {
        jd_user_names.push(user.userName);
    });
    $.log("\n🐉 本地共发现👉【" + jd_users.length + "】个🐶京东账号：\n--------\n" + jd_user_names.join("\n") + "\n--------");
    $.log("🐉 开始同步京东 Cookie 到青龙 ⬆️⬆️⬆️");
    $.log("--------");
    // 对比 JD Cookie 和 青龙 Env 来决定是新增还是更新
    for (const user of jd_users) {
        $.log("🐉 开始同步京东账号【" + user.userName + "】");
        var env = undefined;
        for (const e of jdCookieEnvs) {
            let regex = /pt_pin=([^;]+)/;
            let match = regex.exec(e.value);
            let pt_pin = match[1];
            if (user.userName === pt_pin) {
                env = e;
                break;
            }
        }

        if (env === undefined) {
            $.log("🐉 Cookie 不存在，开始添加 ⬆️");
            env = {
                value: user.cookie,
                name: "JD_COOKIE",
                remarks: user.userName
            }
            env = await addEnv(env);

            if (env === undefined) {
                $.log("🐉 Cookie 添加失败 ❌");
            } else {
                $.log("🐉 Cookie 添加成功 ✅");
            }

        } else if (user.cookie === env.value) {
            $.log("🐉 Cookie 未变化 ⏸️");

        } else {
            $.log("🐉 Cookie 发生变化，开始更新 🔁");
            // 不能传过多参数，后台会判断错误
            newEnv = {
                value: user.cookie,
                name: "JD_COOKIE",
                remarks: user.userName,
                id: env.id
            }
            let success = await updateEnv(newEnv);
            if (success) {
                $.log("🐉 Cookie 更新成功 ✅");
            } else {
                $.log("🐉 Cookie 更新失败 ❌");
            }
        }

        if (env.status == 1) {
            $.log("🐉 环境变量被禁用，开始启用");
            let enable = await enableEnv(env);
            if (enable) {
                $.log("🐉 环境变量启用成功 ✅");
            } else {
                $.log("🐉 环境变量启用失败 ❌");
            }

        } else {
            $.log("🐉 环境变量当前启用中 ✅");
        }

        $.log("--------");
    }

})().catch(e => {
    handleError("🐉 JD Cookie 同步青龙失败", "", e.message || JSON.stringify(e));

}).finally(() => {
    notify(notifys);
});

function handleError(message) {
    notifys.push(message);
    notify(notifys);
}

function notify(notifys) {
    if (notifys.length > 0) {
        notifys = notifys.join("\n");
        $.log(notifys);
        $.notify("Sync_JD_Cookies_To_Qinglong", "", notifys);
    }

    $.log("🐉 脚本执行完毕")
    $.done();
}

/**
 * OpenAPI
 * @author: Peng-YM
 * https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
 */

function ENV() {
    const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
    return {
        isQX: typeof $task !== "undefined",
        isLoon: typeof $loon !== "undefined",
        isSurge: typeof $httpClient !== "undefined" && typeof $utils !== "undefined",
        isBrowser: typeof document !== "undefined",
        isNode: typeof require == "function" && !isJSBox,
        isJSBox,
        isRequest: typeof $request !== "undefined",
        isScriptable: typeof importModule !== "undefined",
    };
}

function HTTP(defaultOptions = {
    baseURL: ""
}) {
    const {
        isQX,
        isLoon,
        isSurge,
        isScriptable,
        isNode,
        isBrowser
    } = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
    const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

    function send(method, options) {
        options = typeof options === "string" ? {
            url: options
        } : options;
        const baseURL = defaultOptions.baseURL;
        if (baseURL && !URL_REGEX.test(options.url || "")) {
            options.url = baseURL ? baseURL + options.url : options.url;
        }
        if (options.body && options.headers && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        options = {
            ...defaultOptions,
            ...options
        };
        const timeout = options.timeout;
        const events = {
            ...{
                onRequest: () => {
                },
                onResponse: (resp) => resp,
                onTimeout: () => {
                },
            },
            ...options.events,
        };

        events.onRequest(method, options);

        let worker;
        if (isQX) {
            worker = $task.fetch({
                method,
                ...options
            });
        } else if (isLoon || isSurge || isNode) {
            worker = new Promise((resolve, reject) => {
                const request = isNode ? require("request") : $httpClient;
                request[method.toLowerCase()](options, (err, response, body) => {
                    if (err) reject(err);
                    else
                        resolve({
                            statusCode: response.status || response.statusCode,
                            headers: response.headers,
                            body,
                        });
                });
            });
        } else if (isScriptable) {
            const request = new Request(options.url);
            request.method = method;
            request.headers = options.headers;
            request.body = options.body;
            worker = new Promise((resolve, reject) => {
                request
                    .loadString()
                    .then((body) => {
                        resolve({
                            statusCode: request.response.statusCode,
                            headers: request.response.headers,
                            body,
                        });
                    })
                    .catch((err) => reject(err));
            });
        } else if (isBrowser) {
            worker = new Promise((resolve, reject) => {
                fetch(options.url, {
                    method,
                    headers: options.headers,
                    body: options.body,
                })
                    .then(response => response.json())
                    .then(response => resolve({
                        statusCode: response.status,
                        headers: response.headers,
                        body: response.data,
                    })).catch(reject);
            });
        }

        let timeoutid;
        const timer = timeout ?
            new Promise((_, reject) => {
                timeoutid = setTimeout(() => {
                    events.onTimeout();
                    return reject(
                        `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
                    );
                }, timeout);
            }) :
            null;

        return (timer ?
            Promise.race([timer, worker]).then((res) => {
                clearTimeout(timeoutid);
                return res;
            }) :
            worker
        ).then((resp) => events.onResponse(resp));
    }

    const http = {};
    methods.forEach(
        (method) =>
            (http[method.toLowerCase()] = (options) => send(method, options))
    );
    return http;
}

function API(name = "untitled", debug = false) {
    const {
        isQX,
        isLoon,
        isSurge,
        isNode,
        isJSBox,
        isScriptable
    } = ENV();
    return new (class {
        constructor(name, debug) {
            this.name = name;
            this.debug = debug;

            this.http = HTTP();
            this.env = ENV();

            this.node = (() => {
                if (isNode) {
                    const fs = require("fs");

                    return {
                        fs,
                    };
                } else {
                    return null;
                }
            })();
            this.initCache();

            const delay = (t, v) =>
                new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, v), t);
                });

            Promise.prototype.delay = function (t) {
                return this.then(function (v) {
                    return delay(t, v);
                });
            };
        }

        // persistence
        // initialize cache
        initCache() {
            if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
            if (isLoon || isSurge)
                this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

            if (isNode) {
                // create a json for root cache
                let fpath = "root.json";
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}), {
                        flag: "wx"
                    },
                        (err) => console.log(err)
                    );
                }
                this.root = {};

                // create a json file with the given name if not exists
                fpath = `${this.name}.json`;
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}), {
                        flag: "wx"
                    },
                        (err) => console.log(err)
                    );
                    this.cache = {};
                } else {
                    this.cache = JSON.parse(
                        this.node.fs.readFileSync(`${this.name}.json`)
                    );
                }
            }
        }

        // store cache
        persistCache() {
            const data = JSON.stringify(this.cache, null, 2);
            if (isQX) $prefs.setValueForKey(data, this.name);
            if (isLoon || isSurge) $persistentStore.write(data, this.name);
            if (isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data, {
                    flag: "w"
                },
                    (err) => console.log(err)
                );
                this.node.fs.writeFileSync(
                    "root.json",
                    JSON.stringify(this.root, null, 2), {
                    flag: "w"
                },
                    (err) => console.log(err)
                );
            }
        }

        write(data, key) {
            this.log(`SET ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(data, key);
                }
                if (isQX) {
                    return $prefs.setValueForKey(data, key);
                }
                if (isNode) {
                    this.root[key] = data;
                }
            } else {
                this.cache[key] = data;
            }
            this.persistCache();
        }

        read(key) {
            this.log(`READ ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.read(key);
                }
                if (isQX) {
                    return $prefs.valueForKey(key);
                }
                if (isNode) {
                    return this.root[key];
                }
            } else {
                return this.cache[key];
            }
        }

        delete(key) {
            this.log(`DELETE ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(null, key);
                }
                if (isQX) {
                    return $prefs.removeValueForKey(key);
                }
                if (isNode) {
                    delete this.root[key];
                }
            } else {
                delete this.cache[key];
            }
            this.persistCache();
        }

        // notification
        notify(title, subtitle = "", content = "", options = {}) {
            const openURL = options["open-url"];
            const mediaURL = options["media-url"];

            if (isQX) $notify(title, subtitle, content, options);
            if (isSurge) {
                $notification.post(
                    title,
                    subtitle,
                    content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`, {
                    url: openURL,
                }
                );
            }
            if (isLoon) {
                let opts = {};
                if (openURL) opts["openUrl"] = openURL;
                if (mediaURL) opts["mediaUrl"] = mediaURL;
                if (JSON.stringify(opts) === "{}") {
                    $notification.post(title, subtitle, content);
                } else {
                    $notification.post(title, subtitle, content, opts);
                }
            }
            if (isNode || isScriptable) {
                const content_ =
                    content +
                    (openURL ? `\n点击跳转: ${openURL}` : "") +
                    (mediaURL ? `\n多媒体: ${mediaURL}` : "");
                if (isJSBox) {
                    const push = require("push");
                    push.schedule({
                        title: title,
                        body: (subtitle ? subtitle + "\n" : "") + content_,
                    });
                } else {
                    console.log(`${title}\n${subtitle}\n${content_}\n\n`);
                }
            }
        }

        // other helper functions
        log(msg) {
            if (this.debug) console.log(`[${this.name}] LOG: \n${this.stringify(msg)}`);
        }

        info(msg) {
            console.log(`[${this.name}] INFO: \n${this.stringify(msg)}`);
        }

        error(msg) {
            console.log(`[${this.name}] ERROR: \n${this.stringify(msg)}`);
        }

        wait(millisec) {
            return new Promise((resolve) => setTimeout(resolve, millisec));
        }

        done(value = {}) {
            if (isQX || isLoon || isSurge) {
                $done(value);
            } else if (isNode && !isJSBox) {
                if (typeof $context !== "undefined") {
                    $context.headers = value.headers;
                    $context.statusCode = value.statusCode;
                    $context.body = value.body;
                }
            }
        }

        stringify(obj_or_str) {
            if (typeof obj_or_str === 'string' || obj_or_str instanceof String)
                return obj_or_str;
            else
                try {
                    return JSON.stringify(obj_or_str, null, 2);
                } catch (err) {
                    return "[object Object]";
                }
        }
    })(name, debug);
}