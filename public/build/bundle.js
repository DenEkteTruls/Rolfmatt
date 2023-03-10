
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
            update: noop$1,
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
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$1;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.56.0' }, detail), { bubbles: true }));
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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
            this.posibilities = [];
            this.color = color;
        }

        _draw(context, piecesize, piece) {
            let image = new Image(50, 50);
            image.src = "media/"+piece+"_"+this.color+".png";
            image.onload = () =>
            {
                context.drawImage(image, piecesize*this.pos.x+10, (piecesize*8)-piecesize*this.pos.y+10, piecesize-20, piecesize-20);
            };
        }
    }



    class Pawn extends Piece
    {
        constructor(start_pos, color)
        {
            super(start_pos, color);
        }


        draw(context, piecesize)
        {
            this._draw(context, piecesize, "pawn");
        }


        AllowedMoves()
        {
            if(board[this.pos.y+1][this.AllowedMoves.x] === 0 && this.pos.y < 8) {
                let y = this.pos.y + 1;
                console.log("the pawn is able to move");
                pos_list.push({x: this.pos.x, y: y});
            } else {
                console.log("this promotes");
            }
        }
    }

    class Board
    {
        constructor()
        {
            this.pieceSize = 600/8;
            this.dark_color = "#8877b7";
            this.light_color = "#efefef";

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



        addPieces(context)
        {
            for(let i = 0; i < 8; i++) {
                let pawn = new Pawn({x: i, y: 2}, 'w');
                pawn.draw(context, this.pieceSize);
            }

            for(let i = 0; i < 8; i++) {
                let pawn = new Pawn({x: i, y: 7}, 'b');
                pawn.draw(context, this.pieceSize);
            }
        }
    }

    class LayerManager {
        currentLayerId;
        setups;
        renderers;
        dispatchers;
        needsSetup;
        needsRedraw;
        context;
        width;
        height;
        autoclear;
        pixelRatio;
        renderLoop;
        layerObserver;
        layerRef;
        layerSequence;
        renderingLayerId;
        activeLayerId;
        activeLayerDispatcher;
        constructor() {
            this.register = this.register.bind(this);
            this.unregister = this.unregister.bind(this);
            this.redraw = this.redraw.bind(this);
            this.getRenderingLayerId = this.getRenderingLayerId.bind(this);
            this.currentLayerId = 1;
            this.setups = new Map();
            this.renderers = new Map();
            this.dispatchers = new Map();
            this.needsSetup = false;
            this.needsRedraw = true;
            this.renderingLayerId = 0;
            this.activeLayerId = 0;
            this.layerSequence = [];
        }
        redraw() {
            this.needsRedraw = true;
        }
        register({ setup, render, dispatcher, }) {
            if (setup) {
                this.setups.set(this.currentLayerId, setup);
                this.needsSetup = true;
            }
            this.renderers.set(this.currentLayerId, render);
            this.dispatchers.set(this.currentLayerId, dispatcher);
            this.needsRedraw = true;
            return this.currentLayerId++;
        }
        unregister(layerId) {
            this.renderers.delete(layerId);
            this.dispatchers.delete(layerId);
            this.needsRedraw = true;
        }
        setup(context, layerRef) {
            this.context = context;
            this.layerRef = layerRef;
            this.observeLayerSequence();
            this.startRenderLoop();
        }
        observeLayerSequence() {
            this.layerObserver = new MutationObserver(this.getLayerSequence.bind(this));
            this.layerObserver.observe(this.layerRef, { childList: true });
            this.getLayerSequence();
        }
        getLayerSequence() {
            const layers = [...this.layerRef.children];
            this.layerSequence = layers.map((layer) => +(layer.dataset.layerId ?? -1));
            this.redraw();
        }
        startRenderLoop() {
            this.render();
            this.renderLoop = requestAnimationFrame(() => this.startRenderLoop());
        }
        render() {
            const context = this.context;
            const width = this.width;
            const height = this.height;
            const pixelRatio = this.pixelRatio;
            if (this.needsSetup) {
                for (const [layerId, setup] of this.setups) {
                    setup({ context, width, height });
                    this.setups.delete(layerId);
                }
                this.needsSetup = false;
            }
            if (this.needsRedraw) {
                context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                if (this.autoclear) {
                    context.clearRect(0, 0, width, height);
                }
                for (const layerId of this.layerSequence) {
                    this.renderingLayerId = layerId;
                    this.renderers.get(layerId)?.({ context, width, height });
                }
                this.needsRedraw = false;
            }
        }
        setActiveLayer(layer, e) {
            if (this.activeLayerId === layer)
                return;
            if (e instanceof MouseEvent) {
                this.dispatchLayerEvent(new PointerEvent('pointerleave', e));
                this.dispatchLayerEvent(new MouseEvent('mouseleave', e));
            }
            this.activeLayerId = layer;
            this.activeLayerDispatcher = this.dispatchers.get(layer);
            if (e instanceof MouseEvent) {
                this.dispatchLayerEvent(new PointerEvent('pointerenter', e));
                this.dispatchLayerEvent(new MouseEvent('mouseenter', e));
            }
        }
        dispatchLayerEvent(e) {
            if (!this.activeLayerDispatcher)
                return;
            if (window.TouchEvent && e instanceof TouchEvent) {
                const { left, top } = e.target.getBoundingClientRect();
                const { clientX, clientY } = e.changedTouches[0];
                const detail = {
                    x: clientX - left,
                    y: clientY - top,
                    originalEvent: e,
                };
                this.activeLayerDispatcher(e.type, detail);
            }
            else if (e instanceof MouseEvent) {
                const detail = {
                    x: e.offsetX,
                    y: e.offsetY,
                    originalEvent: e,
                };
                this.activeLayerDispatcher(e.type, detail);
            }
        }
        getRenderingLayerId() {
            return this.renderingLayerId;
        }
        destroy() {
            if (typeof window === 'undefined')
                return;
            this.layerObserver.disconnect();
            cancelAnimationFrame(this.renderLoop);
        }
    }

    const idToRgb = (id) => {
        const id2 = id * 2;
        const r = (id2 >> 16) & 0xff;
        const g = (id2 >> 8) & 0xff;
        const b = id2 & 0xff;
        return `rgb(${r}, ${g}, ${b})`;
    };
    const rgbToId = (r, g, b) => {
        const id = ((r << 16) | (g << 8) | b) / 2;
        return id % 1 ? 0 : id;
    };

    const EXCLUDED_GETTERS = ['drawImage'];
    const EXCLUDED_SETTERS = [
        'filter',
        'shadowBlur',
        'globalCompositeOperation',
        'globalAlpha',
    ];
    const COLOR_OVERRIDES = [
        'drawImage',
        'fill',
        'fillRect',
        'fillText',
        'stroke',
        'strokeRect',
        'strokeText',
    ];
    const createContextProxy = (context) => {
        let renderingLayerId;
        const canvas = document.createElement('canvas');
        const proxyContext = canvas.getContext('2d', {
            willReadFrequently: true,
        });
        const resizeCanvas = () => {
            canvas.width = context.canvas.width;
            canvas.height = context.canvas.height;
        };
        const canvasSizeObserver = new MutationObserver(resizeCanvas);
        canvasSizeObserver.observe(context.canvas, {
            attributeFilter: ['width', 'height'],
        });
        resizeCanvas();
        return new Proxy(context, {
            get(target, property) {
                if (property === '_getLayerIdAtPixel') {
                    return (x, y) => {
                        const [r, g, b] = proxyContext.getImageData(x, y, 1, 1).data;
                        return rgbToId(r, g, b);
                    };
                }
                const val = target[property];
                if (typeof val !== 'function')
                    return val;
                return function (...args) {
                    if (COLOR_OVERRIDES.includes(property)) {
                        const layerColor = idToRgb(renderingLayerId());
                        proxyContext.fillStyle = layerColor;
                        proxyContext.strokeStyle = layerColor;
                    }
                    if (property === 'drawImage') {
                        const rectArgs = args.slice(1);
                        proxyContext.fillRect(...rectArgs);
                    }
                    if (!EXCLUDED_GETTERS.includes(property)) {
                        Reflect.apply(val, proxyContext, args);
                    }
                    return Reflect.apply(val, target, args);
                };
            },
            set(target, property, newValue) {
                if (property === '_renderingLayerId') {
                    renderingLayerId = newValue;
                    return true;
                }
                target[property] = newValue;
                if (!EXCLUDED_SETTERS.includes(property)) {
                    proxyContext[property] = newValue;
                }
                return true;
            },
        });
    };

    /* node_modules\svelte-canvas\dist\components\Canvas.svelte generated by Svelte v3.56.0 */
    const file$3 = "node_modules\\svelte-canvas\\dist\\components\\Canvas.svelte";

    function create_fragment$4(ctx) {
    	let canvas_1;
    	let canvas_1_width_value;
    	let canvas_1_height_value;
    	let style_width = `${/*width*/ ctx[0]}px`;
    	let style_height = `${/*height*/ ctx[1]}px`;
    	let t;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(canvas_1, "width", canvas_1_width_value = /*width*/ ctx[0] * /*_pixelRatio*/ ctx[5]);
    			attr_dev(canvas_1, "height", canvas_1_height_value = /*height*/ ctx[1] * /*_pixelRatio*/ ctx[5]);
    			attr_dev(canvas_1, "class", /*clazz*/ ctx[4]);
    			attr_dev(canvas_1, "style", /*style*/ ctx[2]);
    			set_style(canvas_1, "display", `block`);
    			set_style(canvas_1, "width", style_width);
    			set_style(canvas_1, "height", style_height);
    			add_location(canvas_1, file$3, 78, 0, 2339);
    			set_style(div, "display", `none`);
    			add_location(div, file$3, 153, 0, 4330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[64](canvas_1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[65](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						canvas_1,
    						"touchstart",
    						prevent_default(function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerTouchStart*/ ctx[9]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerTouchStart*/ ctx[9]
    							: null).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"mousemove",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerMouseMove*/ ctx[8]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerMouseMove*/ ctx[8]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointermove",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerMouseMove*/ ctx[8]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerMouseMove*/ ctx[8]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"click",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"contextmenu",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"dblclick",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"mousedown",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"mouseenter",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"mouseleave",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"mouseup",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"wheel",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"touchcancel",
    						prevent_default(function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"touchend",
    						prevent_default(function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"touchmove",
    						prevent_default(function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						}),
    						false,
    						true,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointerenter",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointerleave",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointerdown",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointerup",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						canvas_1,
    						"pointercancel",
    						function () {
    							if (is_function(/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null)) (/*layerEvents*/ ctx[3]
    							? /*handleLayerEvent*/ ctx[10]
    							: null).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(canvas_1, "focus", /*focus_handler*/ ctx[19], false, false, false, false),
    					listen_dev(canvas_1, "blur", /*blur_handler*/ ctx[20], false, false, false, false),
    					listen_dev(canvas_1, "fullscreenchange", /*fullscreenchange_handler*/ ctx[21], false, false, false, false),
    					listen_dev(canvas_1, "fullscreenerror", /*fullscreenerror_handler*/ ctx[22], false, false, false, false),
    					listen_dev(canvas_1, "scroll", /*scroll_handler*/ ctx[23], false, false, false, false),
    					listen_dev(canvas_1, "cut", /*cut_handler*/ ctx[24], false, false, false, false),
    					listen_dev(canvas_1, "copy", /*copy_handler*/ ctx[25], false, false, false, false),
    					listen_dev(canvas_1, "paste", /*paste_handler*/ ctx[26], false, false, false, false),
    					listen_dev(canvas_1, "keydown", /*keydown_handler*/ ctx[27], false, false, false, false),
    					listen_dev(canvas_1, "keypress", /*keypress_handler*/ ctx[28], false, false, false, false),
    					listen_dev(canvas_1, "keyup", /*keyup_handler*/ ctx[29], false, false, false, false),
    					listen_dev(canvas_1, "auxclick", /*auxclick_handler*/ ctx[30], false, false, false, false),
    					listen_dev(canvas_1, "click", /*click_handler*/ ctx[31], false, false, false, false),
    					listen_dev(canvas_1, "contextmenu", /*contextmenu_handler*/ ctx[32], false, false, false, false),
    					listen_dev(canvas_1, "dblclick", /*dblclick_handler*/ ctx[33], false, false, false, false),
    					listen_dev(canvas_1, "mousedown", /*mousedown_handler*/ ctx[34], false, false, false, false),
    					listen_dev(canvas_1, "mouseenter", /*mouseenter_handler*/ ctx[35], false, false, false, false),
    					listen_dev(canvas_1, "mouseleave", /*mouseleave_handler*/ ctx[36], false, false, false, false),
    					listen_dev(canvas_1, "mousemove", /*mousemove_handler*/ ctx[37], false, false, false, false),
    					listen_dev(canvas_1, "mouseover", /*mouseover_handler*/ ctx[38], false, false, false, false),
    					listen_dev(canvas_1, "mouseout", /*mouseout_handler*/ ctx[39], false, false, false, false),
    					listen_dev(canvas_1, "mouseup", /*mouseup_handler*/ ctx[40], false, false, false, false),
    					listen_dev(canvas_1, "select", /*select_handler*/ ctx[41], false, false, false, false),
    					listen_dev(canvas_1, "wheel", /*wheel_handler*/ ctx[42], false, false, false, false),
    					listen_dev(canvas_1, "drag", /*drag_handler*/ ctx[43], false, false, false, false),
    					listen_dev(canvas_1, "dragend", /*dragend_handler*/ ctx[44], false, false, false, false),
    					listen_dev(canvas_1, "dragenter", /*dragenter_handler*/ ctx[45], false, false, false, false),
    					listen_dev(canvas_1, "dragstart", /*dragstart_handler*/ ctx[46], false, false, false, false),
    					listen_dev(canvas_1, "dragleave", /*dragleave_handler*/ ctx[47], false, false, false, false),
    					listen_dev(canvas_1, "dragover", /*dragover_handler*/ ctx[48], false, false, false, false),
    					listen_dev(canvas_1, "drop", /*drop_handler*/ ctx[49], false, false, false, false),
    					listen_dev(canvas_1, "touchcancel", /*touchcancel_handler*/ ctx[50], false, false, false, false),
    					listen_dev(canvas_1, "touchend", /*touchend_handler*/ ctx[51], false, false, false, false),
    					listen_dev(canvas_1, "touchmove", /*touchmove_handler*/ ctx[52], false, false, false, false),
    					listen_dev(canvas_1, "touchstart", /*touchstart_handler*/ ctx[53], false, false, false, false),
    					listen_dev(canvas_1, "pointerover", /*pointerover_handler*/ ctx[54], false, false, false, false),
    					listen_dev(canvas_1, "pointerenter", /*pointerenter_handler*/ ctx[55], false, false, false, false),
    					listen_dev(canvas_1, "pointerdown", /*pointerdown_handler*/ ctx[56], false, false, false, false),
    					listen_dev(canvas_1, "pointermove", /*pointermove_handler*/ ctx[57], false, false, false, false),
    					listen_dev(canvas_1, "pointerup", /*pointerup_handler*/ ctx[58], false, false, false, false),
    					listen_dev(canvas_1, "pointercancel", /*pointercancel_handler*/ ctx[59], false, false, false, false),
    					listen_dev(canvas_1, "pointerout", /*pointerout_handler*/ ctx[60], false, false, false, false),
    					listen_dev(canvas_1, "pointerleave", /*pointerleave_handler*/ ctx[61], false, false, false, false),
    					listen_dev(canvas_1, "gotpointercapture", /*gotpointercapture_handler*/ ctx[62], false, false, false, false),
    					listen_dev(canvas_1, "lostpointercapture", /*lostpointercapture_handler*/ ctx[63], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*width, _pixelRatio*/ 33 && canvas_1_width_value !== (canvas_1_width_value = /*width*/ ctx[0] * /*_pixelRatio*/ ctx[5])) {
    				attr_dev(canvas_1, "width", canvas_1_width_value);
    			}

    			if (!current || dirty[0] & /*height, _pixelRatio*/ 34 && canvas_1_height_value !== (canvas_1_height_value = /*height*/ ctx[1] * /*_pixelRatio*/ ctx[5])) {
    				attr_dev(canvas_1, "height", canvas_1_height_value);
    			}

    			if (!current || dirty[0] & /*clazz*/ 16) {
    				attr_dev(canvas_1, "class", /*clazz*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*style*/ 4) {
    				attr_dev(canvas_1, "style", /*style*/ ctx[2]);
    			}

    			if (dirty[0] & /*width*/ 1 && style_width !== (style_width = `${/*width*/ ctx[0]}px`)) {
    				set_style(canvas_1, "width", style_width);
    			}

    			if (dirty[0] & /*height*/ 2 && style_height !== (style_height = `${/*height*/ ctx[1]}px`)) {
    				set_style(canvas_1, "height", style_height);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[64](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[65](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const KEY = Symbol();
    const getTypedContext = () => getContext(KEY);

    function instance$4($$self, $$props, $$invalidate) {
    	let _pixelRatio;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Canvas', slots, ['default']);
    	let { width = 640, height = 640, pixelRatio = null, style = '', autoclear = true, layerEvents = false } = $$props;
    	let { class: clazz = '' } = $$props;
    	let canvas;
    	let context = null;
    	let layerRef;
    	const manager = new LayerManager();

    	function redraw() {
    		manager.redraw();
    	}

    	function getCanvas() {
    		return canvas;
    	}

    	function getContext$1() {
    		return context;
    	}

    	if (pixelRatio === undefined || pixelRatio === null) {
    		if (typeof window !== 'undefined') {
    			pixelRatio = window.devicePixelRatio;
    		} else {
    			pixelRatio = 2;
    		}
    	}

    	setContext(KEY, {
    		register: manager.register,
    		unregister: manager.unregister,
    		redraw: manager.redraw
    	});

    	onMount(() => {
    		const ctx = canvas.getContext('2d');

    		if (layerEvents) {
    			context = createContextProxy(ctx);
    			context._renderingLayerId = manager.getRenderingLayerId;
    		} else {
    			context = ctx;
    		}

    		manager.setup(context, layerRef);
    	});

    	onDestroy(() => manager.destroy());

    	const handleLayerMouseMove = e => {
    		const x = e.offsetX * _pixelRatio;
    		const y = e.offsetY * _pixelRatio;
    		const id = context._getLayerIdAtPixel(x, y);
    		manager.setActiveLayer(id, e);
    		manager.dispatchLayerEvent(e);
    	};

    	const handleLayerTouchStart = e => {
    		const { clientX, clientY } = e.changedTouches[0];
    		const { left, top } = canvas.getBoundingClientRect();
    		const x = (clientX - left) * _pixelRatio;
    		const y = (clientY - top) * _pixelRatio;
    		const id = context._getLayerIdAtPixel(x, y);
    		manager.setActiveLayer(id, e);
    		manager.dispatchLayerEvent(e);
    	};

    	const handleLayerEvent = e => {
    		if (window.TouchEvent && e instanceof TouchEvent) e.preventDefault();
    		manager.dispatchLayerEvent(e);
    	};

    	const writable_props = ['width', 'height', 'pixelRatio', 'style', 'autoclear', 'layerEvents', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function fullscreenchange_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function fullscreenerror_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function scroll_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function cut_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function copy_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function paste_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function auxclick_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousemove_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseout_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function wheel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function drag_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function drop_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchcancel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchmove_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function touchstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerdown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointermove_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointercancel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerout_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function pointerleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function gotpointercapture_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function lostpointercapture_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(6, canvas);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			layerRef = $$value;
    			$$invalidate(7, layerRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('pixelRatio' in $$props) $$invalidate(11, pixelRatio = $$props.pixelRatio);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('autoclear' in $$props) $$invalidate(12, autoclear = $$props.autoclear);
    		if ('layerEvents' in $$props) $$invalidate(3, layerEvents = $$props.layerEvents);
    		if ('class' in $$props) $$invalidate(4, clazz = $$props.class);
    		if ('$$scope' in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		LayerManager,
    		getCTX: getContext,
    		KEY,
    		getTypedContext,
    		createContextProxy,
    		onMount,
    		onDestroy,
    		setContext,
    		width,
    		height,
    		pixelRatio,
    		style,
    		autoclear,
    		layerEvents,
    		clazz,
    		canvas,
    		context,
    		layerRef,
    		manager,
    		redraw,
    		getCanvas,
    		getContext: getContext$1,
    		handleLayerMouseMove,
    		handleLayerTouchStart,
    		handleLayerEvent,
    		_pixelRatio
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('pixelRatio' in $$props) $$invalidate(11, pixelRatio = $$props.pixelRatio);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('autoclear' in $$props) $$invalidate(12, autoclear = $$props.autoclear);
    		if ('layerEvents' in $$props) $$invalidate(3, layerEvents = $$props.layerEvents);
    		if ('clazz' in $$props) $$invalidate(4, clazz = $$props.clazz);
    		if ('canvas' in $$props) $$invalidate(6, canvas = $$props.canvas);
    		if ('context' in $$props) context = $$props.context;
    		if ('layerRef' in $$props) $$invalidate(7, layerRef = $$props.layerRef);
    		if ('_pixelRatio' in $$props) $$invalidate(5, _pixelRatio = $$props._pixelRatio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pixelRatio*/ 2048) {
    			$$invalidate(5, _pixelRatio = pixelRatio ?? 1);
    		}

    		if ($$self.$$.dirty[0] & /*width*/ 1) {
    			$$invalidate(16, manager.width = width, manager);
    		}

    		if ($$self.$$.dirty[0] & /*height*/ 2) {
    			$$invalidate(16, manager.height = height, manager);
    		}

    		if ($$self.$$.dirty[0] & /*_pixelRatio*/ 32) {
    			$$invalidate(16, manager.pixelRatio = _pixelRatio, manager);
    		}

    		if ($$self.$$.dirty[0] & /*autoclear*/ 4096) {
    			$$invalidate(16, manager.autoclear = autoclear, manager);
    		}

    		if ($$self.$$.dirty[0] & /*width, height, pixelRatio, autoclear, manager*/ 71683) {
    			(manager.redraw());
    		}
    	};

    	return [
    		width,
    		height,
    		style,
    		layerEvents,
    		clazz,
    		_pixelRatio,
    		canvas,
    		layerRef,
    		handleLayerMouseMove,
    		handleLayerTouchStart,
    		handleLayerEvent,
    		pixelRatio,
    		autoclear,
    		redraw,
    		getCanvas,
    		getContext$1,
    		manager,
    		$$scope,
    		slots,
    		focus_handler,
    		blur_handler,
    		fullscreenchange_handler,
    		fullscreenerror_handler,
    		scroll_handler,
    		cut_handler,
    		copy_handler,
    		paste_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		auxclick_handler,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mousedown_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		mousemove_handler,
    		mouseover_handler,
    		mouseout_handler,
    		mouseup_handler,
    		select_handler,
    		wheel_handler,
    		drag_handler,
    		dragend_handler,
    		dragenter_handler,
    		dragstart_handler,
    		dragleave_handler,
    		dragover_handler,
    		drop_handler,
    		touchcancel_handler,
    		touchend_handler,
    		touchmove_handler,
    		touchstart_handler,
    		pointerover_handler,
    		pointerenter_handler,
    		pointerdown_handler,
    		pointermove_handler,
    		pointerup_handler,
    		pointercancel_handler,
    		pointerout_handler,
    		pointerleave_handler,
    		gotpointercapture_handler,
    		lostpointercapture_handler,
    		canvas_1_binding,
    		div_binding
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				width: 0,
    				height: 1,
    				pixelRatio: 11,
    				style: 2,
    				autoclear: 12,
    				layerEvents: 3,
    				class: 4,
    				redraw: 13,
    				getCanvas: 14,
    				getContext: 15
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get width() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pixelRatio() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pixelRatio(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoclear() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoclear(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layerEvents() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layerEvents(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redraw() {
    		return this.$$.ctx[13];
    	}

    	set redraw(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getCanvas() {
    		return this.$$.ctx[14];
    	}

    	set getCanvas(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getContext() {
    		return this.$$.ctx[15];
    	}

    	set getContext(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-canvas\dist\components\Layer.svelte generated by Svelte v3.56.0 */
    const file$2 = "node_modules\\svelte-canvas\\dist\\components\\Layer.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "data-layer-id", /*layerId*/ ctx[0]);
    			add_location(div, file$2, 11, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Layer', slots, []);
    	const { register, unregister, redraw } = getTypedContext();
    	const dispatcher = createEventDispatcher();
    	let { setup = undefined } = $$props;
    	let { render = () => undefined } = $$props;
    	const layerId = register({ setup, render, dispatcher });
    	onDestroy(() => unregister(layerId));
    	const writable_props = ['setup', 'render'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('setup' in $$props) $$invalidate(1, setup = $$props.setup);
    		if ('render' in $$props) $$invalidate(2, render = $$props.render);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		createEventDispatcher,
    		getTypedContext,
    		register,
    		unregister,
    		redraw,
    		dispatcher,
    		setup,
    		render,
    		layerId
    	});

    	$$self.$inject_state = $$props => {
    		if ('setup' in $$props) $$invalidate(1, setup = $$props.setup);
    		if ('render' in $$props) $$invalidate(2, render = $$props.render);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*render*/ 4) {
    			(redraw());
    		}
    	};

    	return [layerId, setup, render];
    }

    class Layer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { setup: 1, render: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get setup() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setup(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get render() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set render(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let frame;
    const now = Date.now();
    const start = (set) => {
        set(Date.now() - now);
        frame = window.requestAnimationFrame(() => start(set));
        return () => window.cancelAnimationFrame(frame);
    };
    function noop() {
    }
    const timer = readable(Date.now() - now, typeof window === 'undefined' ? noop : start);

    /* src\components\Board.svelte generated by Svelte v3.56.0 */
    const file$1 = "src\\components\\Board.svelte";

    // (42:4) <Canvas width={600} height={600}>
    function create_default_slot(ctx) {
    	let layer;
    	let current;

    	layer = new Layer({
    			props: { render: /*render*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const layer_changes = {};
    			if (dirty & /*render*/ 1) layer_changes.render = /*render*/ ctx[0];
    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(42:4) <Canvas width={600} height={600}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let canvas;
    	let current;

    	canvas = new Canvas({
    			props: {
    				width: 600,
    				height: 600,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(canvas.$$.fragment);
    			attr_dev(div, "class", "container");
    			add_location(div, file$1, 40, 0, 1400);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(canvas, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const canvas_changes = {};

    			if (dirty & /*$$scope, render*/ 5) {
    				canvas_changes.$$scope = { dirty, ctx };
    			}

    			canvas.$set(canvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(canvas);
    		}
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
    	let render;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Board', slots, []);
    	let board = new Board();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Board, Canvas, Layer, t: timer, board, render });

    	$$self.$inject_state = $$props => {
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('render' in $$props) $$invalidate(0, render = $$props.render);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	render = ({ context, width, height }) => {
    		context.clearRect(0, 0, width, height);
    		let last_color = 1;

    		for (let y = 0; y < 8; y++) {
    			last_color = !last_color;

    			//drawing board
    			for (let x = 0; x < 8; x++) {
    				context.fillStyle = last_color ? board.dark_color : board.light_color;

    				if (board.board[y][x] == 1) {
    					context.fillStyle = "red";
    				}

    				context.fillRect(x * board.pieceSize, y * board.pieceSize, board.pieceSize, board.pieceSize);
    				last_color = !last_color;

    				//drawing characters
    				context.fillStyle = last_color ? board.dark_color : board.light_color;

    				context.font = "20px Arial";
    				context.fillText(String.fromCharCode(97 + x), board.pieceSize * x + 55, board.pieceSize * 8 - 10);
    			}

    			// drawing numbers
    			context.fillStyle = !last_color ? board.dark_color : board.light_color;

    			context.font = "20px Arial";
    			context.fillText(8 - y, 5, board.pieceSize * y + 25);
    		}

    		board.addPieces(context);
    	};

    	return [render];
    }

    class Board_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.56.0 */
    const file = "src\\pages\\Home.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let board;
    	let current;
    	board = new Board_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(board.$$.fragment);
    			attr_dev(div, "class", "container svelte-jguock");
    			add_location(div, file, 6, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(board, div, null);
    			current = true;
    		},
    		p: noop$1,
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
    			if (detaching) detach_dev(div);
    			destroy_component(board);
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

    	$$self.$capture_state = () => ({ Board: Board_1 });
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

    /* src\App.svelte generated by Svelte v3.56.0 */

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
