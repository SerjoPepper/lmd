(function /*if ($P.CACHE) {*/lmd/*}*/(global, main, modules, sandboxed_modules/*if ($P.CACHE) {*/, version/*}*/) {
    var initialized_modules = {},
        global_eval = function (code) {
            return Function('return ' + code)();
        },
        /*if ($P.CSS || $P.JS || $P.ASYNC) {*/global_noop = function () {},/*}*/
        /*if ($P.CSS || $P.JS) {*/global_document = global.document,/*}*/
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(sandboxed_modules[moduleName] ? local_undefined : require, output.exports, output) || output.exports;
            }
            if ($P.STATS) {
                stats_initEnd(moduleName);
            }

            return modules[moduleName] = module;
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                if ($P.STATS) {
                    stats_require(moduleName);
                }
                return module;
            }

            if ($P.SHORTCUTS) {
                // Do not init shortcut as module!
                // return shortcut as is
                if (is_shortcut(moduleName, module)) {
                    if ($P.STATS) {
                        // assign shortcut name for module
                        stats_shortcut(module, moduleName);
                    }
                    // return as is w/ checking globals
                    return modules[module.replace('@', '')];
                }
            }

            if ($P.STATS) {
                stats_require(moduleName);
            }
            
            if ($P.STATS) {
                stats_initStart(moduleName);
            }
            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/*if ($P.RACE) include('race.js');*/
/*if ($P.STATS) include('stats.js');*/
/*if ($P.SHORTCUTS) include('shortcuts.js');*/
/*if ($P.PARALLEL) include('parallel.js');*/
/*if ($P.CACHE_ASYNC) include('cache_async.js');*/
/*if ($P.ASYNC) include('async.js');*/
/*if ($P.JS) include('js.js');*/
/*if ($P.CSS) include('css.js');*/
/*if ($P.CACHE) include('cache.js');*/
    main(require, output.exports, output);
})