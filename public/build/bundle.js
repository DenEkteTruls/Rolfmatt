
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function empty() {
        return text('');
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.57.0' }, detail), { bubbles: true }));
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var pageExports = {};
    var page = {
      get exports(){ return pageExports; },
      set exports(v){ pageExports = v; },
    };

    (function (module, exports) {
    	(function (global, factory) {
    		module.exports = factory() ;
    	}(commonjsGlobal, (function () {
    	var isarray = Array.isArray || function (arr) {
    	  return Object.prototype.toString.call(arr) == '[object Array]';
    	};

    	/**
    	 * Expose `pathToRegexp`.
    	 */
    	var pathToRegexp_1 = pathToRegexp;
    	var parse_1 = parse;
    	var compile_1 = compile;
    	var tokensToFunction_1 = tokensToFunction;
    	var tokensToRegExp_1 = tokensToRegExp;

    	/**
    	 * The main path matching regexp utility.
    	 *
    	 * @type {RegExp}
    	 */
    	var PATH_REGEXP = new RegExp([
    	  // Match escaped characters that would otherwise appear in future matches.
    	  // This allows the user to escape special characters that won't transform.
    	  '(\\\\.)',
    	  // Match Express-style parameters and un-named parameters with a prefix
    	  // and optional suffixes. Matches appear as:
    	  //
    	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    	].join('|'), 'g');

    	/**
    	 * Parse a string for the raw tokens.
    	 *
    	 * @param  {String} str
    	 * @return {Array}
    	 */
    	function parse (str) {
    	  var tokens = [];
    	  var key = 0;
    	  var index = 0;
    	  var path = '';
    	  var res;

    	  while ((res = PATH_REGEXP.exec(str)) != null) {
    	    var m = res[0];
    	    var escaped = res[1];
    	    var offset = res.index;
    	    path += str.slice(index, offset);
    	    index = offset + m.length;

    	    // Ignore already escaped sequences.
    	    if (escaped) {
    	      path += escaped[1];
    	      continue
    	    }

    	    // Push the current path onto the tokens.
    	    if (path) {
    	      tokens.push(path);
    	      path = '';
    	    }

    	    var prefix = res[2];
    	    var name = res[3];
    	    var capture = res[4];
    	    var group = res[5];
    	    var suffix = res[6];
    	    var asterisk = res[7];

    	    var repeat = suffix === '+' || suffix === '*';
    	    var optional = suffix === '?' || suffix === '*';
    	    var delimiter = prefix || '/';
    	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

    	    tokens.push({
    	      name: name || key++,
    	      prefix: prefix || '',
    	      delimiter: delimiter,
    	      optional: optional,
    	      repeat: repeat,
    	      pattern: escapeGroup(pattern)
    	    });
    	  }

    	  // Match any characters still remaining.
    	  if (index < str.length) {
    	    path += str.substr(index);
    	  }

    	  // If the path exists, push it onto the end.
    	  if (path) {
    	    tokens.push(path);
    	  }

    	  return tokens
    	}

    	/**
    	 * Compile a string to a template function for the path.
    	 *
    	 * @param  {String}   str
    	 * @return {Function}
    	 */
    	function compile (str) {
    	  return tokensToFunction(parse(str))
    	}

    	/**
    	 * Expose a method for transforming tokens into the path function.
    	 */
    	function tokensToFunction (tokens) {
    	  // Compile all the tokens into regexps.
    	  var matches = new Array(tokens.length);

    	  // Compile all the patterns before compilation.
    	  for (var i = 0; i < tokens.length; i++) {
    	    if (typeof tokens[i] === 'object') {
    	      matches[i] = new RegExp('^' + tokens[i].pattern + '$');
    	    }
    	  }

    	  return function (obj) {
    	    var path = '';
    	    var data = obj || {};

    	    for (var i = 0; i < tokens.length; i++) {
    	      var token = tokens[i];

    	      if (typeof token === 'string') {
    	        path += token;

    	        continue
    	      }

    	      var value = data[token.name];
    	      var segment;

    	      if (value == null) {
    	        if (token.optional) {
    	          continue
    	        } else {
    	          throw new TypeError('Expected "' + token.name + '" to be defined')
    	        }
    	      }

    	      if (isarray(value)) {
    	        if (!token.repeat) {
    	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
    	        }

    	        if (value.length === 0) {
    	          if (token.optional) {
    	            continue
    	          } else {
    	            throw new TypeError('Expected "' + token.name + '" to not be empty')
    	          }
    	        }

    	        for (var j = 0; j < value.length; j++) {
    	          segment = encodeURIComponent(value[j]);

    	          if (!matches[i].test(segment)) {
    	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
    	          }

    	          path += (j === 0 ? token.prefix : token.delimiter) + segment;
    	        }

    	        continue
    	      }

    	      segment = encodeURIComponent(value);

    	      if (!matches[i].test(segment)) {
    	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
    	      }

    	      path += token.prefix + segment;
    	    }

    	    return path
    	  }
    	}

    	/**
    	 * Escape a regular expression string.
    	 *
    	 * @param  {String} str
    	 * @return {String}
    	 */
    	function escapeString (str) {
    	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    	}

    	/**
    	 * Escape the capturing group by escaping special characters and meaning.
    	 *
    	 * @param  {String} group
    	 * @return {String}
    	 */
    	function escapeGroup (group) {
    	  return group.replace(/([=!:$\/()])/g, '\\$1')
    	}

    	/**
    	 * Attach the keys as a property of the regexp.
    	 *
    	 * @param  {RegExp} re
    	 * @param  {Array}  keys
    	 * @return {RegExp}
    	 */
    	function attachKeys (re, keys) {
    	  re.keys = keys;
    	  return re
    	}

    	/**
    	 * Get the flags for a regexp from the options.
    	 *
    	 * @param  {Object} options
    	 * @return {String}
    	 */
    	function flags (options) {
    	  return options.sensitive ? '' : 'i'
    	}

    	/**
    	 * Pull out keys from a regexp.
    	 *
    	 * @param  {RegExp} path
    	 * @param  {Array}  keys
    	 * @return {RegExp}
    	 */
    	function regexpToRegexp (path, keys) {
    	  // Use a negative lookahead to match only capturing groups.
    	  var groups = path.source.match(/\((?!\?)/g);

    	  if (groups) {
    	    for (var i = 0; i < groups.length; i++) {
    	      keys.push({
    	        name: i,
    	        prefix: null,
    	        delimiter: null,
    	        optional: false,
    	        repeat: false,
    	        pattern: null
    	      });
    	    }
    	  }

    	  return attachKeys(path, keys)
    	}

    	/**
    	 * Transform an array into a regexp.
    	 *
    	 * @param  {Array}  path
    	 * @param  {Array}  keys
    	 * @param  {Object} options
    	 * @return {RegExp}
    	 */
    	function arrayToRegexp (path, keys, options) {
    	  var parts = [];

    	  for (var i = 0; i < path.length; i++) {
    	    parts.push(pathToRegexp(path[i], keys, options).source);
    	  }

    	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

    	  return attachKeys(regexp, keys)
    	}

    	/**
    	 * Create a path regexp from string input.
    	 *
    	 * @param  {String} path
    	 * @param  {Array}  keys
    	 * @param  {Object} options
    	 * @return {RegExp}
    	 */
    	function stringToRegexp (path, keys, options) {
    	  var tokens = parse(path);
    	  var re = tokensToRegExp(tokens, options);

    	  // Attach keys back to the regexp.
    	  for (var i = 0; i < tokens.length; i++) {
    	    if (typeof tokens[i] !== 'string') {
    	      keys.push(tokens[i]);
    	    }
    	  }

    	  return attachKeys(re, keys)
    	}

    	/**
    	 * Expose a function for taking tokens and returning a RegExp.
    	 *
    	 * @param  {Array}  tokens
    	 * @param  {Array}  keys
    	 * @param  {Object} options
    	 * @return {RegExp}
    	 */
    	function tokensToRegExp (tokens, options) {
    	  options = options || {};

    	  var strict = options.strict;
    	  var end = options.end !== false;
    	  var route = '';
    	  var lastToken = tokens[tokens.length - 1];
    	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

    	  // Iterate over the tokens and create our regexp string.
    	  for (var i = 0; i < tokens.length; i++) {
    	    var token = tokens[i];

    	    if (typeof token === 'string') {
    	      route += escapeString(token);
    	    } else {
    	      var prefix = escapeString(token.prefix);
    	      var capture = token.pattern;

    	      if (token.repeat) {
    	        capture += '(?:' + prefix + capture + ')*';
    	      }

    	      if (token.optional) {
    	        if (prefix) {
    	          capture = '(?:' + prefix + '(' + capture + '))?';
    	        } else {
    	          capture = '(' + capture + ')?';
    	        }
    	      } else {
    	        capture = prefix + '(' + capture + ')';
    	      }

    	      route += capture;
    	    }
    	  }

    	  // In non-strict mode we allow a slash at the end of match. If the path to
    	  // match already ends with a slash, we remove it for consistency. The slash
    	  // is valid at the end of a path match, not in the middle. This is important
    	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
    	  if (!strict) {
    	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
    	  }

    	  if (end) {
    	    route += '$';
    	  } else {
    	    // In non-ending mode, we need the capturing groups to match as much as
    	    // possible by using a positive lookahead to the end or next path segment.
    	    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
    	  }

    	  return new RegExp('^' + route, flags(options))
    	}

    	/**
    	 * Normalize the given path string, returning a regular expression.
    	 *
    	 * An empty array can be passed in for the keys, which will hold the
    	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
    	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
    	 *
    	 * @param  {(String|RegExp|Array)} path
    	 * @param  {Array}                 [keys]
    	 * @param  {Object}                [options]
    	 * @return {RegExp}
    	 */
    	function pathToRegexp (path, keys, options) {
    	  keys = keys || [];

    	  if (!isarray(keys)) {
    	    options = keys;
    	    keys = [];
    	  } else if (!options) {
    	    options = {};
    	  }

    	  if (path instanceof RegExp) {
    	    return regexpToRegexp(path, keys)
    	  }

    	  if (isarray(path)) {
    	    return arrayToRegexp(path, keys, options)
    	  }

    	  return stringToRegexp(path, keys, options)
    	}

    	pathToRegexp_1.parse = parse_1;
    	pathToRegexp_1.compile = compile_1;
    	pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    	pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    	/**
    	   * Module dependencies.
    	   */

    	  

    	  /**
    	   * Short-cuts for global-object checks
    	   */

    	  var hasDocument = ('undefined' !== typeof document);
    	  var hasWindow = ('undefined' !== typeof window);
    	  var hasHistory = ('undefined' !== typeof history);
    	  var hasProcess = typeof process !== 'undefined';

    	  /**
    	   * Detect click event
    	   */
    	  var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

    	  /**
    	   * To work properly with the URL
    	   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
    	   */

    	  var isLocation = hasWindow && !!(window.history.location || window.location);

    	  /**
    	   * The page instance
    	   * @api private
    	   */
    	  function Page() {
    	    // public things
    	    this.callbacks = [];
    	    this.exits = [];
    	    this.current = '';
    	    this.len = 0;

    	    // private things
    	    this._decodeURLComponents = true;
    	    this._base = '';
    	    this._strict = false;
    	    this._running = false;
    	    this._hashbang = false;

    	    // bound functions
    	    this.clickHandler = this.clickHandler.bind(this);
    	    this._onpopstate = this._onpopstate.bind(this);
    	  }

    	  /**
    	   * Configure the instance of page. This can be called multiple times.
    	   *
    	   * @param {Object} options
    	   * @api public
    	   */

    	  Page.prototype.configure = function(options) {
    	    var opts = options || {};

    	    this._window = opts.window || (hasWindow && window);
    	    this._decodeURLComponents = opts.decodeURLComponents !== false;
    	    this._popstate = opts.popstate !== false && hasWindow;
    	    this._click = opts.click !== false && hasDocument;
    	    this._hashbang = !!opts.hashbang;

    	    var _window = this._window;
    	    if(this._popstate) {
    	      _window.addEventListener('popstate', this._onpopstate, false);
    	    } else if(hasWindow) {
    	      _window.removeEventListener('popstate', this._onpopstate, false);
    	    }

    	    if (this._click) {
    	      _window.document.addEventListener(clickEvent, this.clickHandler, false);
    	    } else if(hasDocument) {
    	      _window.document.removeEventListener(clickEvent, this.clickHandler, false);
    	    }

    	    if(this._hashbang && hasWindow && !hasHistory) {
    	      _window.addEventListener('hashchange', this._onpopstate, false);
    	    } else if(hasWindow) {
    	      _window.removeEventListener('hashchange', this._onpopstate, false);
    	    }
    	  };

    	  /**
    	   * Get or set basepath to `path`.
    	   *
    	   * @param {string} path
    	   * @api public
    	   */

    	  Page.prototype.base = function(path) {
    	    if (0 === arguments.length) return this._base;
    	    this._base = path;
    	  };

    	  /**
    	   * Gets the `base`, which depends on whether we are using History or
    	   * hashbang routing.

    	   * @api private
    	   */
    	  Page.prototype._getBase = function() {
    	    var base = this._base;
    	    if(!!base) return base;
    	    var loc = hasWindow && this._window && this._window.location;

    	    if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
    	      base = loc.pathname;
    	    }

    	    return base;
    	  };

    	  /**
    	   * Get or set strict path matching to `enable`
    	   *
    	   * @param {boolean} enable
    	   * @api public
    	   */

    	  Page.prototype.strict = function(enable) {
    	    if (0 === arguments.length) return this._strict;
    	    this._strict = enable;
    	  };


    	  /**
    	   * Bind with the given `options`.
    	   *
    	   * Options:
    	   *
    	   *    - `click` bind to click events [true]
    	   *    - `popstate` bind to popstate [true]
    	   *    - `dispatch` perform initial dispatch [true]
    	   *
    	   * @param {Object} options
    	   * @api public
    	   */

    	  Page.prototype.start = function(options) {
    	    var opts = options || {};
    	    this.configure(opts);

    	    if (false === opts.dispatch) return;
    	    this._running = true;

    	    var url;
    	    if(isLocation) {
    	      var window = this._window;
    	      var loc = window.location;

    	      if(this._hashbang && ~loc.hash.indexOf('#!')) {
    	        url = loc.hash.substr(2) + loc.search;
    	      } else if (this._hashbang) {
    	        url = loc.search + loc.hash;
    	      } else {
    	        url = loc.pathname + loc.search + loc.hash;
    	      }
    	    }

    	    this.replace(url, null, true, opts.dispatch);
    	  };

    	  /**
    	   * Unbind click and popstate event handlers.
    	   *
    	   * @api public
    	   */

    	  Page.prototype.stop = function() {
    	    if (!this._running) return;
    	    this.current = '';
    	    this.len = 0;
    	    this._running = false;

    	    var window = this._window;
    	    this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
    	    hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
    	    hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
    	  };

    	  /**
    	   * Show `path` with optional `state` object.
    	   *
    	   * @param {string} path
    	   * @param {Object=} state
    	   * @param {boolean=} dispatch
    	   * @param {boolean=} push
    	   * @return {!Context}
    	   * @api public
    	   */

    	  Page.prototype.show = function(path, state, dispatch, push) {
    	    var ctx = new Context(path, state, this),
    	      prev = this.prevContext;
    	    this.prevContext = ctx;
    	    this.current = ctx.path;
    	    if (false !== dispatch) this.dispatch(ctx, prev);
    	    if (false !== ctx.handled && false !== push) ctx.pushState();
    	    return ctx;
    	  };

    	  /**
    	   * Goes back in the history
    	   * Back should always let the current route push state and then go back.
    	   *
    	   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
    	   * @param {Object=} state
    	   * @api public
    	   */

    	  Page.prototype.back = function(path, state) {
    	    var page = this;
    	    if (this.len > 0) {
    	      var window = this._window;
    	      // this may need more testing to see if all browsers
    	      // wait for the next tick to go back in history
    	      hasHistory && window.history.back();
    	      this.len--;
    	    } else if (path) {
    	      setTimeout(function() {
    	        page.show(path, state);
    	      });
    	    } else {
    	      setTimeout(function() {
    	        page.show(page._getBase(), state);
    	      });
    	    }
    	  };

    	  /**
    	   * Register route to redirect from one path to other
    	   * or just redirect to another route
    	   *
    	   * @param {string} from - if param 'to' is undefined redirects to 'from'
    	   * @param {string=} to
    	   * @api public
    	   */
    	  Page.prototype.redirect = function(from, to) {
    	    var inst = this;

    	    // Define route from a path to another
    	    if ('string' === typeof from && 'string' === typeof to) {
    	      page.call(this, from, function(e) {
    	        setTimeout(function() {
    	          inst.replace(/** @type {!string} */ (to));
    	        }, 0);
    	      });
    	    }

    	    // Wait for the push state and replace it with another
    	    if ('string' === typeof from && 'undefined' === typeof to) {
    	      setTimeout(function() {
    	        inst.replace(from);
    	      }, 0);
    	    }
    	  };

    	  /**
    	   * Replace `path` with optional `state` object.
    	   *
    	   * @param {string} path
    	   * @param {Object=} state
    	   * @param {boolean=} init
    	   * @param {boolean=} dispatch
    	   * @return {!Context}
    	   * @api public
    	   */


    	  Page.prototype.replace = function(path, state, init, dispatch) {
    	    var ctx = new Context(path, state, this),
    	      prev = this.prevContext;
    	    this.prevContext = ctx;
    	    this.current = ctx.path;
    	    ctx.init = init;
    	    ctx.save(); // save before dispatching, which may redirect
    	    if (false !== dispatch) this.dispatch(ctx, prev);
    	    return ctx;
    	  };

    	  /**
    	   * Dispatch the given `ctx`.
    	   *
    	   * @param {Context} ctx
    	   * @api private
    	   */

    	  Page.prototype.dispatch = function(ctx, prev) {
    	    var i = 0, j = 0, page = this;

    	    function nextExit() {
    	      var fn = page.exits[j++];
    	      if (!fn) return nextEnter();
    	      fn(prev, nextExit);
    	    }

    	    function nextEnter() {
    	      var fn = page.callbacks[i++];

    	      if (ctx.path !== page.current) {
    	        ctx.handled = false;
    	        return;
    	      }
    	      if (!fn) return unhandled.call(page, ctx);
    	      fn(ctx, nextEnter);
    	    }

    	    if (prev) {
    	      nextExit();
    	    } else {
    	      nextEnter();
    	    }
    	  };

    	  /**
    	   * Register an exit route on `path` with
    	   * callback `fn()`, which will be called
    	   * on the previous context when a new
    	   * page is visited.
    	   */
    	  Page.prototype.exit = function(path, fn) {
    	    if (typeof path === 'function') {
    	      return this.exit('*', path);
    	    }

    	    var route = new Route(path, null, this);
    	    for (var i = 1; i < arguments.length; ++i) {
    	      this.exits.push(route.middleware(arguments[i]));
    	    }
    	  };

    	  /**
    	   * Handle "click" events.
    	   */

    	  /* jshint +W054 */
    	  Page.prototype.clickHandler = function(e) {
    	    if (1 !== this._which(e)) return;

    	    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    	    if (e.defaultPrevented) return;

    	    // ensure link
    	    // use shadow dom when available if not, fall back to composedPath()
    	    // for browsers that only have shady
    	    var el = e.target;
    	    var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

    	    if(eventPath) {
    	      for (var i = 0; i < eventPath.length; i++) {
    	        if (!eventPath[i].nodeName) continue;
    	        if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
    	        if (!eventPath[i].href) continue;

    	        el = eventPath[i];
    	        break;
    	      }
    	    }

    	    // continue ensure link
    	    // el.nodeName for svg links are 'a' instead of 'A'
    	    while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
    	    if (!el || 'A' !== el.nodeName.toUpperCase()) return;

    	    // check if link is inside an svg
    	    // in this case, both href and target are always inside an object
    	    var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

    	    // Ignore if tag has
    	    // 1. "download" attribute
    	    // 2. rel="external" attribute
    	    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    	    // ensure non-hash for the same path
    	    var link = el.getAttribute('href');
    	    if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

    	    // Check for mailto: in the href
    	    if (link && link.indexOf('mailto:') > -1) return;

    	    // check target
    	    // svg target is an object and its desired value is in .baseVal property
    	    if (svg ? el.target.baseVal : el.target) return;

    	    // x-origin
    	    // note: svg links that are not relative don't call click events (and skip page.js)
    	    // consequently, all svg links tested inside page.js are relative and in the same origin
    	    if (!svg && !this.sameOrigin(el.href)) return;

    	    // rebuild path
    	    // There aren't .pathname and .search properties in svg links, so we use href
    	    // Also, svg href is an object and its desired value is in .baseVal property
    	    var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

    	    path = path[0] !== '/' ? '/' + path : path;

    	    // strip leading "/[drive letter]:" on NW.js on Windows
    	    if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
    	      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    	    }

    	    // same page
    	    var orig = path;
    	    var pageBase = this._getBase();

    	    if (path.indexOf(pageBase) === 0) {
    	      path = path.substr(pageBase.length);
    	    }

    	    if (this._hashbang) path = path.replace('#!', '');

    	    if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
    	      return;
    	    }

    	    e.preventDefault();
    	    this.show(orig);
    	  };

    	  /**
    	   * Handle "populate" events.
    	   * @api private
    	   */

    	  Page.prototype._onpopstate = (function () {
    	    var loaded = false;
    	    if ( ! hasWindow ) {
    	      return function () {};
    	    }
    	    if (hasDocument && document.readyState === 'complete') {
    	      loaded = true;
    	    } else {
    	      window.addEventListener('load', function() {
    	        setTimeout(function() {
    	          loaded = true;
    	        }, 0);
    	      });
    	    }
    	    return function onpopstate(e) {
    	      if (!loaded) return;
    	      var page = this;
    	      if (e.state) {
    	        var path = e.state.path;
    	        page.replace(path, e.state);
    	      } else if (isLocation) {
    	        var loc = page._window.location;
    	        page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
    	      }
    	    };
    	  })();

    	  /**
    	   * Event button.
    	   */
    	  Page.prototype._which = function(e) {
    	    e = e || (hasWindow && this._window.event);
    	    return null == e.which ? e.button : e.which;
    	  };

    	  /**
    	   * Convert to a URL object
    	   * @api private
    	   */
    	  Page.prototype._toURL = function(href) {
    	    var window = this._window;
    	    if(typeof URL === 'function' && isLocation) {
    	      return new URL(href, window.location.toString());
    	    } else if (hasDocument) {
    	      var anc = window.document.createElement('a');
    	      anc.href = href;
    	      return anc;
    	    }
    	  };

    	  /**
    	   * Check if `href` is the same origin.
    	   * @param {string} href
    	   * @api public
    	   */
    	  Page.prototype.sameOrigin = function(href) {
    	    if(!href || !isLocation) return false;

    	    var url = this._toURL(href);
    	    var window = this._window;

    	    var loc = window.location;

    	    /*
    	       When the port is the default http port 80 for http, or 443 for
    	       https, internet explorer 11 returns an empty string for loc.port,
    	       so we need to compare loc.port with an empty string if url.port
    	       is the default port 80 or 443.
    	       Also the comparition with `port` is changed from `===` to `==` because
    	       `port` can be a string sometimes. This only applies to ie11.
    	    */
    	    return loc.protocol === url.protocol &&
    	      loc.hostname === url.hostname &&
    	      (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
    	  };

    	  /**
    	   * @api private
    	   */
    	  Page.prototype._samePath = function(url) {
    	    if(!isLocation) return false;
    	    var window = this._window;
    	    var loc = window.location;
    	    return url.pathname === loc.pathname &&
    	      url.search === loc.search;
    	  };

    	  /**
    	   * Remove URL encoding from the given `str`.
    	   * Accommodates whitespace in both x-www-form-urlencoded
    	   * and regular percent-encoded form.
    	   *
    	   * @param {string} val - URL component to decode
    	   * @api private
    	   */
    	  Page.prototype._decodeURLEncodedURIComponent = function(val) {
    	    if (typeof val !== 'string') { return val; }
    	    return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
    	  };

    	  /**
    	   * Create a new `page` instance and function
    	   */
    	  function createPage() {
    	    var pageInstance = new Page();

    	    function pageFn(/* args */) {
    	      return page.apply(pageInstance, arguments);
    	    }

    	    // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
    	    pageFn.callbacks = pageInstance.callbacks;
    	    pageFn.exits = pageInstance.exits;
    	    pageFn.base = pageInstance.base.bind(pageInstance);
    	    pageFn.strict = pageInstance.strict.bind(pageInstance);
    	    pageFn.start = pageInstance.start.bind(pageInstance);
    	    pageFn.stop = pageInstance.stop.bind(pageInstance);
    	    pageFn.show = pageInstance.show.bind(pageInstance);
    	    pageFn.back = pageInstance.back.bind(pageInstance);
    	    pageFn.redirect = pageInstance.redirect.bind(pageInstance);
    	    pageFn.replace = pageInstance.replace.bind(pageInstance);
    	    pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
    	    pageFn.exit = pageInstance.exit.bind(pageInstance);
    	    pageFn.configure = pageInstance.configure.bind(pageInstance);
    	    pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
    	    pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

    	    pageFn.create = createPage;

    	    Object.defineProperty(pageFn, 'len', {
    	      get: function(){
    	        return pageInstance.len;
    	      },
    	      set: function(val) {
    	        pageInstance.len = val;
    	      }
    	    });

    	    Object.defineProperty(pageFn, 'current', {
    	      get: function(){
    	        return pageInstance.current;
    	      },
    	      set: function(val) {
    	        pageInstance.current = val;
    	      }
    	    });

    	    // In 2.0 these can be named exports
    	    pageFn.Context = Context;
    	    pageFn.Route = Route;

    	    return pageFn;
    	  }

    	  /**
    	   * Register `path` with callback `fn()`,
    	   * or route `path`, or redirection,
    	   * or `page.start()`.
    	   *
    	   *   page(fn);
    	   *   page('*', fn);
    	   *   page('/user/:id', load, user);
    	   *   page('/user/' + user.id, { some: 'thing' });
    	   *   page('/user/' + user.id);
    	   *   page('/from', '/to')
    	   *   page();
    	   *
    	   * @param {string|!Function|!Object} path
    	   * @param {Function=} fn
    	   * @api public
    	   */

    	  function page(path, fn) {
    	    // <callback>
    	    if ('function' === typeof path) {
    	      return page.call(this, '*', path);
    	    }

    	    // route <path> to <callback ...>
    	    if ('function' === typeof fn) {
    	      var route = new Route(/** @type {string} */ (path), null, this);
    	      for (var i = 1; i < arguments.length; ++i) {
    	        this.callbacks.push(route.middleware(arguments[i]));
    	      }
    	      // show <path> with [state]
    	    } else if ('string' === typeof path) {
    	      this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
    	      // start [options]
    	    } else {
    	      this.start(path);
    	    }
    	  }

    	  /**
    	   * Unhandled `ctx`. When it's not the initial
    	   * popstate then redirect. If you wish to handle
    	   * 404s on your own use `page('*', callback)`.
    	   *
    	   * @param {Context} ctx
    	   * @api private
    	   */
    	  function unhandled(ctx) {
    	    if (ctx.handled) return;
    	    var current;
    	    var page = this;
    	    var window = page._window;

    	    if (page._hashbang) {
    	      current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
    	    } else {
    	      current = isLocation && window.location.pathname + window.location.search;
    	    }

    	    if (current === ctx.canonicalPath) return;
    	    page.stop();
    	    ctx.handled = false;
    	    isLocation && (window.location.href = ctx.canonicalPath);
    	  }

    	  /**
    	   * Escapes RegExp characters in the given string.
    	   *
    	   * @param {string} s
    	   * @api private
    	   */
    	  function escapeRegExp(s) {
    	    return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    	  }

    	  /**
    	   * Initialize a new "request" `Context`
    	   * with the given `path` and optional initial `state`.
    	   *
    	   * @constructor
    	   * @param {string} path
    	   * @param {Object=} state
    	   * @api public
    	   */

    	  function Context(path, state, pageInstance) {
    	    var _page = this.page = pageInstance || page;
    	    var window = _page._window;
    	    var hashbang = _page._hashbang;

    	    var pageBase = _page._getBase();
    	    if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
    	    var i = path.indexOf('?');

    	    this.canonicalPath = path;
    	    var re = new RegExp('^' + escapeRegExp(pageBase));
    	    this.path = path.replace(re, '') || '/';
    	    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    	    this.title = (hasDocument && window.document.title);
    	    this.state = state || {};
    	    this.state.path = path;
    	    this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    	    this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    	    this.params = {};

    	    // fragment
    	    this.hash = '';
    	    if (!hashbang) {
    	      if (!~this.path.indexOf('#')) return;
    	      var parts = this.path.split('#');
    	      this.path = this.pathname = parts[0];
    	      this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
    	      this.querystring = this.querystring.split('#')[0];
    	    }
    	  }

    	  /**
    	   * Push state.
    	   *
    	   * @api private
    	   */

    	  Context.prototype.pushState = function() {
    	    var page = this.page;
    	    var window = page._window;
    	    var hashbang = page._hashbang;

    	    page.len++;
    	    if (hasHistory) {
    	        window.history.pushState(this.state, this.title,
    	          hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    	    }
    	  };

    	  /**
    	   * Save the context state.
    	   *
    	   * @api public
    	   */

    	  Context.prototype.save = function() {
    	    var page = this.page;
    	    if (hasHistory) {
    	        page._window.history.replaceState(this.state, this.title,
    	          page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    	    }
    	  };

    	  /**
    	   * Initialize `Route` with the given HTTP `path`,
    	   * and an array of `callbacks` and `options`.
    	   *
    	   * Options:
    	   *
    	   *   - `sensitive`    enable case-sensitive routes
    	   *   - `strict`       enable strict matching for trailing slashes
    	   *
    	   * @constructor
    	   * @param {string} path
    	   * @param {Object=} options
    	   * @api private
    	   */

    	  function Route(path, options, page) {
    	    var _page = this.page = page || globalPage;
    	    var opts = options || {};
    	    opts.strict = opts.strict || _page._strict;
    	    this.path = (path === '*') ? '(.*)' : path;
    	    this.method = 'GET';
    	    this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
    	  }

    	  /**
    	   * Return route middleware with
    	   * the given callback `fn()`.
    	   *
    	   * @param {Function} fn
    	   * @return {Function}
    	   * @api public
    	   */

    	  Route.prototype.middleware = function(fn) {
    	    var self = this;
    	    return function(ctx, next) {
    	      if (self.match(ctx.path, ctx.params)) {
    	        ctx.routePath = self.path;
    	        return fn(ctx, next);
    	      }
    	      next();
    	    };
    	  };

    	  /**
    	   * Check if this route matches `path`, if so
    	   * populate `params`.
    	   *
    	   * @param {string} path
    	   * @param {Object} params
    	   * @return {boolean}
    	   * @api private
    	   */

    	  Route.prototype.match = function(path, params) {
    	    var keys = this.keys,
    	      qsIndex = path.indexOf('?'),
    	      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
    	      m = this.regexp.exec(decodeURIComponent(pathname));

    	    if (!m) return false;

    	    delete params[0];

    	    for (var i = 1, len = m.length; i < len; ++i) {
    	      var key = keys[i - 1];
    	      var val = this.page._decodeURLEncodedURIComponent(m[i]);
    	      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
    	        params[key.name] = val;
    	      }
    	    }

    	    return true;
    	  };


    	  /**
    	   * Module exports.
    	   */

    	  var globalPage = createPage();
    	  var page_js = globalPage;
    	  var default_1 = globalPage;

    	page_js.default = default_1;

    	return page_js;

    	})));
    } (page));

    var router = pageExports;

    class Piece{
        constructor(start_pos, color)
        {
            // {x: 0, y: 0}
            this.pos = start_pos;
            this.dragging_pos = start_pos;
            this.posibilities = [];
            this.color = color;
            this.dragging = false;
            this.has_moved = false;

            this.factor = this.color == "w" ? -1 : 1;
        }


        __draw(context, piecesize, image)
        {
            if(!this.dragging) {
                context.drawImage(image, piecesize*this.pos.x+10, piecesize*this.pos.y+10, piecesize-20, piecesize-20);

            } else {
                context.drawImage(image, this.dragging_pos.x-piecesize/2, this.dragging_pos.y-piecesize/2, piecesize, piecesize);
            }
        }
    }



    class Pawn extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/pawn_"+this.color+".png";
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }


        AllowedMoves(board)
        {
            this.posibilities = [];

            if(this.pos.y < 7 && this.pos.y > 0) {
                if(!this.has_moved && board[this.pos.y+(this.factor*2)][this.pos.x] == 0 && board[this.pos.y+(this.factor*2)][this.pos.x] == 0) {
                    this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*1)});
                    this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*2)});
                }
                else if(board[this.pos.y+(this.factor*1)][this.pos.x] == 0) {
                    this.posibilities.push({x: this.pos.x, y: this.pos.y+(this.factor*1)});
                }
                if(this.pos.x < 7) {
                    let a = board[this.pos.y+(this.factor*1)][this.pos.x+1];
                    if(a != 0 && a.color != this.color) {
                        this.posibilities.push({x: this.pos.x+1, y: this.pos.y+(this.factor*1)});
                    }
                }
                if(this.pos.x > 0) {
                    let a = board[this.pos.y+(this.factor*1)][this.pos.x-1];
                    if(a != 0 && a.color != this.color) {
                        this.posibilities.push({x: this.pos.x-1, y: this.pos.y+(this.factor*1)});
                    }
                }
            }
        }
    }



    class Bishop extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/bishop_"+this.color+".png";

            this.radar = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }

        
        AllowedMoves(board)
        {
            this.posibilities = [];
            let stopped = [0, 0, 0, 0];
            for(let z = 1; z < 8; z++) {
                for(let i = 0; i < this.radar.length; i++) {
                    let x = this.pos.x + this.radar[i][0] * z;
                    let y = this.pos.y + this.radar[i][1] * z;
                    if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                        let b = board[y][x];
                        if(b != 0 && b.color == this.color) stopped[i] = 1;
                        if(!stopped[i]) this.posibilities.push({x: x, y: y});
                        if(b != 0 && b.color != this.color) stopped[i] = 1;
                    }
                }
            }
        }
    }



    class Knight extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/knight_"+this.color+".png";

            this.dx = [-2, -1, 1, 2, -2, -1, 1, 2];
            this.dy = [-1, -2, -2, -1, 1, 2, 2, 1];
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }


        AllowedMoves(board)
        {
            this.posibilities = [];

            for(let i = 0; i < 8;i++) {
                let x = this.pos.x+this.dx[i];
                let y = this.pos.y+this.dy[i];

                if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    let a = board[y][x];
                    if(a != 0) {
                        if(a.color == this.color) continue;
                    }
                    this.posibilities.push({x: x, y: y});
                }
            }
        }
    }



    class Rook extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/rook_"+this.color+".png";

            this.radar = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }


        AllowedMoves(board)
        {
            this.posibilities = [];
            let stopped = [0, 0, 0, 0];
            for(let z = 1; z < 8; z++) {
                for(let i = 0; i < this.radar.length; i++) {
                    let x = this.pos.x + this.radar[i][0] * z;
                    let y = this.pos.y + this.radar[i][1] * z;
                    if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                        let b = board[y][x];
                        if(b != 0 && b.color == this.color) stopped[i] = 1;
                        if(!stopped[i]) this.posibilities.push({x: x, y: y});
                        if(b != 0 && b.color != this.color) stopped[i] = 1;
                    }
                }
            }
        }
    }



    class Queen extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/queen_"+this.color+".png";

            this.radar = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }


        AllowedMoves(board)
        {
            this.posibilities = [];
            let stopped = [0, 0, 0, 0, 0, 0, 0, 0];
            for(let z = 1; z < 8; z++) {
                for(let i = 0; i < this.radar.length; i++) {
                    let x = this.pos.x + this.radar[i][0] * z;
                    let y = this.pos.y + this.radar[i][1] * z;
                    if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                        let b = board[y][x];
                        if(b != 0 && b.color == this.color) stopped[i] = 1;
                        if(!stopped[i]) this.posibilities.push({x: x, y: y});
                        if(b != 0 && b.color != this.color) stopped[i] = 1;
                    }
                }
            }
        }
    }



    class King extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
            this.image = new Image(50, 50);
            this.image.src = "media/king_"+this.color+".png";

            this.radar = [[1, 0], [1, 1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];
        }

        
        draw(context, piecesize)
        {
            this.__draw(context, piecesize, this.image);
        }


        AllowedMoves(board)
        {
            this.posibilities = [];
            for(let i = 0; i < this.radar.length; i++) {
                let x = this.pos.x + this.radar[i][0];
                let y = this.pos.y + this.radar[i][1];

                if(x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    let b = board[y][x];
                    if(!(b != 0 && b.color == this.color)) {
                        this.posibilities.push({x: x, y: y});
                    }
                }
            }
        }
    }

    let Board$1 = class Board
    {
        constructor(canvasID)
        {
            this.canvas = document.getElementById(canvasID);
            this.ctx = this.canvas.getContext("2d");

            this.__setMouseEvents();

            this.running = true;
            this.pieceSize = 600/8;
            this.dark_color = "#8877b7";
            this.light_color = "#efefef";
            this.mouse_pos = {x: 0, y: 0};

            this.is_dragging = false;
            this.dragging_piece = undefined;
            this.dragging_mouse_pos = {x: 0, y: 0};

            this.board = [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];
        }


        __setMouseEvents()
        {
            let rect = this.canvas.getBoundingClientRect();
            this.canvas.onmousedown = (e) => {
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;

                this.mouse_pos = this.translate_mouse_pos(x, y);
                this.dragging_piece = this.getCurrentPiece();
                if(this.dragging_piece) this.dragging_piece.AllowedMoves(this.board);

                if(this.dragging_piece != 0) {
                    this.is_dragging = true;
                    this.dragging_mouse_pos.x = x;
                    this.dragging_mouse_pos.y = y;
                    this.dragging_piece.dragging = true;
                    this.dragging_piece.dragging_pos = this.dragging_mouse_pos;
                }
            };

            this.canvas.onmousemove = (e) => {
                if(this.is_dragging) {
                    let x = e.clientX - rect.left;
                    let y = e.clientY - rect.top;
                    this.dragging_mouse_pos.x = x;
                    this.dragging_mouse_pos.y = y;
                    this.dragging_piece.dragging_pos = this.dragging_mouse_pos;
                }
            };

            this.canvas.onmouseup = (e) => {
                if(this.is_dragging && this.dragging_piece) {
                    this.is_dragging = false;
                    this.movePiece(this.dragging_piece, this.dragging_mouse_pos.x, this.dragging_mouse_pos.y);
                    this.dragging_piece.dragging = false;
                }

                this.dragging_mouse_pos = {x: 0, y: 0};
                this.dragging_piece = undefined;
            };
        }


        translate_mouse_pos(x, y)
        {
            let ix = 0;
            let iy = 0;

            let min_x_diff = 1000;
            let min_y_diff = 1000;

            for(let i = this.pieceSize/2; i < this.pieceSize*9; i += this.pieceSize)
            {
                let xdiff = Math.abs(x - i);
                let ydiff = Math.abs(y - i);

                if(xdiff < min_x_diff) {
                    min_x_diff = xdiff;
                    ix = i/this.pieceSize-.5;
                } if(ydiff < min_y_diff) {
                    min_y_diff = ydiff;
                    iy = i/this.pieceSize-.5;
                }
            }

            return {x: ix, y: iy}
        }



        movePiece(piece, x, y)
        {
            let new_pos = this.translate_mouse_pos(x, y);
            //console.log(piece.posibilities, new_pos);
            for(let i = 0; i < piece.posibilities.length; i++)
            {
                if(piece.posibilities[i].x == new_pos.x && piece.posibilities[i].y == new_pos.y) {
                    this.board[piece.pos.y][piece.pos.x] = 0;
                    this.board[new_pos.y][new_pos.x] = piece;
                    if(!piece.has_moved) piece.has_moved = true;
                    
                    piece.pos.x = new_pos.x;
                    piece.pos.y = new_pos.y;
                }
            }
            // console.log(piece.pos, new_pos)
        }



        renderBoard()
        {
            let last_color = 1;
            for(let y = 0; y < 8; y++) {
                
                last_color = !last_color;

                //drawing board
                for(let x = 0; x < 8; x++) {
                    this.ctx.fillStyle = (last_color ? this.dark_color : this.light_color);
                    if(this.dragging_piece) {
                        let new_pos = this.translate_mouse_pos(this.dragging_mouse_pos.x, this.dragging_mouse_pos.y);
                        if(new_pos.x == x && new_pos.y == y) {
                            this.ctx.fillStyle = "lightgreen";    
                        }
                    }
                    this.ctx.fillRect(x * this.pieceSize, y * this.pieceSize, this.pieceSize, this.pieceSize);
                    last_color = !last_color;

                    //drawing characters
                    this.ctx.fillStyle = (last_color ? this.dark_color : this.light_color);
                    this.ctx.font = "20px Arial";
                    this.ctx.fillText(String.fromCharCode(97 + x), (this.pieceSize * x+55), (this.pieceSize * 8 - 10));
                }

                // drawing numbers
                this.ctx.fillStyle = (!last_color ? this.dark_color : this.light_color);
                this.ctx.font = "20px Arial";
                this.ctx.fillText(8-y, 5, (this.pieceSize * y)+25);
            }
        }


        addPieces()
        {
            /*   --- PAWNs ----   */
            for(let i = 0; i < 8; i++) {
                let pawn = new Pawn({x: i, y: 6}, 'w');
                this.board[pawn.pos.y][pawn.pos.x] = pawn;
            }

            for(let i = 0; i < 8; i++) {
                let pawn = new Pawn({x: i, y: 1}, 'b');
                this.board[pawn.pos.y][pawn.pos.x] = pawn;
            }

            /*   --- BISHOPs ----   */
            let bishop1 = new Bishop({x: 2, y: 7}, 'w'); let bishop2 = new Bishop({x: 5, y: 7}, 'w');
            this.board[bishop1.pos.y][bishop1.pos.x] = bishop1; this.board[bishop2.pos.y][bishop2.pos.x] = bishop2;
            let bishop11 = new Bishop({x: 2, y: 0}, 'b'); let bishop21 = new Bishop({x: 5, y: 0}, 'b');
            this.board[bishop11.pos.y][bishop11.pos.x] = bishop11; this.board[bishop21.pos.y][bishop21.pos.x] = bishop21;


            /*   --- KNIGHTs ----   */
            let knight1 = new Knight({x: 1, y: 7}, 'w'); let knight2 = new Knight({x: 6, y: 7}, 'w');
            this.board[knight1.pos.y][knight1.pos.x] = knight1; this.board[knight2.pos.y][knight2.pos.x] = knight2;
            let knight11 = new Knight({x: 1, y: 0}, 'b'); let knight21 = new Knight({x: 6, y: 0}, 'b');
            this.board[knight11.pos.y][knight11.pos.x] = knight11; this.board[knight21.pos.y][knight21.pos.x] = knight21;


            /*   --- ROOKs ----   */
            let rook1 = new Rook({x: 0, y: 7}, 'w'); let rook2 = new Rook({x: 7, y: 7}, 'w');
            this.board[rook1.pos.y][rook1.pos.x] = rook1; this.board[rook2.pos.y][rook2.pos.x] = rook2;
            let rook11 = new Rook({x: 0, y: 0}, 'b'); let rook21 = new Rook({x: 7, y: 0}, 'b');
            this.board[rook11.pos.y][rook11.pos.x] = rook11; this.board[rook21.pos.y][rook21.pos.x] = rook21;


            /*   --- QUEENs ----   */
            let queen1 = new Queen({x: 3, y: 7}, 'w'); let queen2 = new Queen({x: 3, y: 0}, 'b');
            this.board[queen1.pos.y][queen1.pos.x] = queen1; this.board[queen2.pos.y][queen2.pos.x] = queen2;


            /*   --- KINGs ----   */
            let king1 = new King({x: 4, y: 7}, 'w'); let king2 = new King({x: 4, y: 0}, 'b');
            this.board[king1.pos.y][king1.pos.x] = king1; this.board[king2.pos.y][king2.pos.x] = king2;

        }



        getCurrentPiece()
        {
            return this.board[this.mouse_pos.y][this.mouse_pos.x];
        }


        renderAllowedMoves()
        {
            if(this.dragging_piece) {
                for(let i =  0; i < this.dragging_piece.posibilities.length; i++)
                {
                    this.ctx.fillStyle = 'lightgreen';
                    this.ctx.beginPath();
                    this.ctx.arc(this.dragging_piece.posibilities[i].x * this.pieceSize + this.pieceSize/2, this.dragging_piece.posibilities[i].y * this.pieceSize + this.pieceSize/2, 10, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }



        renderPieces()
        {
            for(let y = 0; y < this.board.length; y++)
            {
                for(let x = 0; x < this.board.length; x++)
                {
                    if(this.board[y][x] != 0) {
                        this.board[y][x].draw(this.ctx, this.pieceSize);
                    }
                }
            }
        }

        

        render()
        {
            this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            this.renderBoard();
            this.renderPieces();
            this.renderAllowedMoves();
        }
    };

    let board = new Board$1("board");
    board.addPieces();


    function gameLoop()
    {

        board.render();

        if(board.running) {
            window.requestAnimationFrame(gameLoop);
        } else {
            console.log("CLOSED!");
        }
    }


    // gameLoop();

    /* src\components\Board.svelte generated by Svelte v3.57.0 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Board', slots, []);
    	gameLoop();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ gameLoop });
    	return [];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.57.0 */

    function create_fragment$1(ctx) {
    	let board;
    	let current;
    	board = new Board({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(board.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(board, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(board, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Board });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.57.0 */

    function create_fragment(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page*/ 1 && switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page = Home;
    	router("/", () => $$invalidate(0, page = Home));
    	router.start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ router, Home, page });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
