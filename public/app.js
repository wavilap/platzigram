(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function bel_onload () {
      load(el)
    }, function bel_onunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          el.setAttributeNS(null, p, val)
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement)
module.exports.createElement = belCreateElement

},{"global/document":5,"hyperx":8,"on-load":11}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
/* global HTMLElement */

'use strict'

module.exports = function emptyElement (element) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('Expected an element')
  }

  var node
  while ((node = element.lastChild)) element.removeChild(node)
  return element
}

},{}],5:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":2}],6:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],8:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12

module.exports = function (h, opts) {
  h = attrToProp(h)
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state)) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === TEXT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[\w-]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":7}],9:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],10:[function(require,module,exports){
// Create a range object for efficently rendering strings to elements.
var range;

var testEl = (typeof document !== 'undefined') ?
    document.body || document.createElement('div') :
    {};

var XHTML = 'http://www.w3.org/1999/xhtml';
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var hasAttributeNS;

if (testEl.hasAttributeNS) {
    hasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    hasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    hasAttributeNS = function(el, namespaceURI, name) {
        return !!el.getAttributeNode(name);
    };
}

function empty(o) {
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
}

function toElement(str) {
    if (!range && document.createRange) {
        range = document.createRange();
        range.selectNode(document.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = document.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        fromEl.selected = toEl.selected;
        if (fromEl.selected) {
            fromEl.setAttribute('selected', '');
        } else {
            fromEl.removeAttribute('selected', '');
        }
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        fromEl.checked = toEl.checked;
        if (fromEl.checked) {
            fromEl.setAttribute('checked', '');
        } else {
            fromEl.removeAttribute('checked');
        }

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }

        fromEl.disabled = toEl.disabled;
        if (fromEl.disabled) {
            fromEl.setAttribute('disabled', '');
        } else {
            fromEl.removeAttribute('disabled');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        if (fromEl.firstChild) {
            fromEl.firstChild.nodeValue = newValue;
        }
    }
};

function noop() {}

/**
 * Returns true if two node's names and namespace URIs are the same.
 *
 * @param {Element} a
 * @param {Element} b
 * @return {boolean}
 */
var compareNodeNames = function(a, b) {
    return a.nodeName === b.nodeName &&
           a.namespaceURI === b.namespaceURI;
};

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === XHTML ?
        document.createElement(name) :
        document.createElementNS(namespaceURI, name);
}

/**
 * Loop over all of the attributes on the target node and make sure the original
 * DOM node has the same attributes. If an attribute found on the original node
 * is not on the new node then remove it from the original node.
 *
 * @param  {Element} fromNode
 * @param  {Element} toNode
 */
function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; i--) {
        attr = attrs[i];
        attrName = attr.name;
        attrValue = attr.value;
        attrNamespaceURI = attr.namespaceURI;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        } else {
            fromValue = fromNode.getAttribute(attrName);
        }

        if (fromValue !== attrValue) {
            if (attrNamespaceURI) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            } else {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; i--) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (!hasAttributeNS(toNode, attrNamespaceURI, attrNamespaceURI ? attrName = attr.localName || attrName : attrName)) {
                if (attrNamespaceURI) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attr.localName);
                } else {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdom(fromNode, toNode, options) {
    if (!options) {
        options = {};
    }

    if (typeof toNode === 'string') {
        if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
            var toNodeHtml = toNode;
            toNode = document.createElement('html');
            toNode.innerHTML = toNodeHtml;
        } else {
            toNode = toElement(toNode);
        }
    }

    // XXX optimization: if the nodes are equal, don't morph them
    /*
    if (fromNode.isEqualNode(toNode)) {
      return fromNode;
    }
    */

    var savedEls = {}; // Used to save off DOM elements with IDs
    var unmatchedEls = {};
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || options.onBeforeMorphEl || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || options.onBeforeMorphElChildren || noop;
    var childrenOnly = options.childrenOnly === true;
    var movedEls = [];

    function removeNodeHelper(node, nestedInSavedEl) {
        var id = getNodeKey(node);
        // If the node has an ID then save it off since we will want
        // to reuse it in case the target DOM tree has a DOM element
        // with the same ID
        if (id) {
            savedEls[id] = node;
        } else if (!nestedInSavedEl) {
            // If we are not nested in a saved element then we know that this node has been
            // completely discarded and will not exist in the final DOM.
            onNodeDiscarded(node);
        }

        if (node.nodeType === ELEMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {
                removeNodeHelper(curChild, nestedInSavedEl || id);
                curChild = curChild.nextSibling;
            }
        }
    }

    function walkDiscardedChildNodes(node) {
        if (node.nodeType === ELEMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {


                if (!getNodeKey(curChild)) {
                    // We only want to handle nodes that don't have an ID to avoid double
                    // walking the same saved element.

                    onNodeDiscarded(curChild);

                    // Walk recursively
                    walkDiscardedChildNodes(curChild);
                }

                curChild = curChild.nextSibling;
            }
        }
    }

    function removeNode(node, parentNode, alreadyVisited) {
        if (onBeforeNodeDiscarded(node) === false) {
            return;
        }

        parentNode.removeChild(node);
        if (alreadyVisited) {
            if (!getNodeKey(node)) {
                onNodeDiscarded(node);
                walkDiscardedChildNodes(node);
            }
        } else {
            removeNodeHelper(node);
        }
    }

    function morphEl(fromEl, toEl, alreadyVisited, childrenOnly) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
            // If an element with an ID is being morphed then it is will be in the final
            // DOM so clear it out of the saved elements collection
            delete savedEls[toElKey];
        }

        if (!childrenOnly) {
            if (onBeforeElUpdated(fromEl, toEl) === false) {
                return;
            }

            morphAttrs(fromEl, toEl);
            onElUpdated(fromEl);

            if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                return;
            }
        }

        if (fromEl.nodeName !== 'TEXTAREA') {
            var curToNodeChild = toEl.firstChild;
            var curFromNodeChild = fromEl.firstChild;
            var curToNodeId;

            var fromNextSibling;
            var toNextSibling;
            var savedEl;
            var unmatchedEl;

            outer: while (curToNodeChild) {
                toNextSibling = curToNodeChild.nextSibling;
                curToNodeId = getNodeKey(curToNodeChild);

                while (curFromNodeChild) {
                    var curFromNodeId = getNodeKey(curFromNodeChild);
                    fromNextSibling = curFromNodeChild.nextSibling;

                    if (!alreadyVisited) {
                        if (curFromNodeId && (unmatchedEl = unmatchedEls[curFromNodeId])) {
                            unmatchedEl.parentNode.replaceChild(curFromNodeChild, unmatchedEl);
                            morphEl(curFromNodeChild, unmatchedEl, alreadyVisited);
                            curFromNodeChild = fromNextSibling;
                            continue;
                        }
                    }

                    var curFromNodeType = curFromNodeChild.nodeType;

                    if (curFromNodeType === curToNodeChild.nodeType) {
                        var isCompatible = false;

                        // Both nodes being compared are Element nodes
                        if (curFromNodeType === ELEMENT_NODE) {
                            if (compareNodeNames(curFromNodeChild, curToNodeChild)) {
                                // We have compatible DOM elements
                                if (curFromNodeId || curToNodeId) {
                                    // If either DOM element has an ID then we
                                    // handle those differently since we want to
                                    // match up by ID
                                    if (curToNodeId === curFromNodeId) {
                                        isCompatible = true;
                                    }
                                } else {
                                    isCompatible = true;
                                }
                            }

                            if (isCompatible) {
                                // We found compatible DOM elements so transform
                                // the current "from" node to match the current
                                // target DOM node.
                                morphEl(curFromNodeChild, curToNodeChild, alreadyVisited);
                            }
                        // Both nodes being compared are Text or Comment nodes
                    } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                            isCompatible = true;
                            // Simply update nodeValue on the original node to
                            // change the text value
                            curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                        }

                        if (isCompatible) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }
                    }

                    // No compatible match so remove the old node from the DOM
                    // and continue trying to find a match in the original DOM
                    removeNode(curFromNodeChild, fromEl, alreadyVisited);
                    curFromNodeChild = fromNextSibling;
                }

                if (curToNodeId) {
                    if ((savedEl = savedEls[curToNodeId])) {
                        if (compareNodeNames(savedEl, curToNodeChild)) {
                            morphEl(savedEl, curToNodeChild, true);
                            // We want to append the saved element instead
                            curToNodeChild = savedEl;
                        } else {
                            delete savedEls[curToNodeId];
                            onNodeDiscarded(savedEl);
                        }
                    } else {
                        // The current DOM element in the target tree has an ID
                        // but we did not find a match in any of the
                        // corresponding siblings. We just put the target
                        // element in the old DOM tree but if we later find an
                        // element in the old DOM tree that has a matching ID
                        // then we will replace the target element with the
                        // corresponding old element and morph the old element
                        unmatchedEls[curToNodeId] = curToNodeChild;
                    }
                }

                // If we got this far then we did not find a candidate match for
                // our "to node" and we exhausted all of the children "from"
                // nodes. Therefore, we will just append the current "to node"
                // to the end
                if (onBeforeNodeAdded(curToNodeChild) !== false) {
                    fromEl.appendChild(curToNodeChild);
                    onNodeAdded(curToNodeChild);
                }

                if (curToNodeChild.nodeType === ELEMENT_NODE &&
                    (curToNodeId || curToNodeChild.firstChild)) {
                    // The element that was just added to the original DOM may
                    // have some nested elements with a key/ID that needs to be
                    // matched up with other elements. We'll add the element to
                    // a list so that we can later process the nested elements
                    // if there are any unmatched keyed elements that were
                    // discarded
                    movedEls.push(curToNodeChild);
                }

                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
            }

            // We have processed all of the "to nodes". If curFromNodeChild is
            // non-null then we still have some from nodes left over that need
            // to be removed
            while (curFromNodeChild) {
                fromNextSibling = curFromNodeChild.nextSibling;
                removeNode(curFromNodeChild, fromEl, alreadyVisited);
                curFromNodeChild = fromNextSibling;
            }
        }

        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
            specialElHandler(fromEl, toEl);
        }
    } // END: morphEl(...)

    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;

    if (!childrenOnly) {
        // Handle the case where we are given two DOM nodes that are not
        // compatible (e.g. <div> --> <span> or <div> --> TEXT)
        if (morphedNodeType === ELEMENT_NODE) {
            if (toNodeType === ELEMENT_NODE) {
                if (!compareNodeNames(fromNode, toNode)) {
                    onNodeDiscarded(fromNode);
                    morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                }
            } else {
                // Going from an element node to a text node
                morphedNode = toNode;
            }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
            if (toNodeType === morphedNodeType) {
                morphedNode.nodeValue = toNode.nodeValue;
                return morphedNode;
            } else {
                // Text node to something else
                morphedNode = toNode;
            }
        }
    }

    if (morphedNode === toNode) {
        // The "to node" was not compatible with the "from node" so we had to
        // toss out the "from node" and use the "to node"
        onNodeDiscarded(fromNode);
    } else {
        morphEl(morphedNode, toNode, false, childrenOnly);

        /**
         * What we will do here is walk the tree for the DOM element that was
         * moved from the target DOM tree to the original DOM tree and we will
         * look for keyed elements that could be matched to keyed elements that
         * were earlier discarded.  If we find a match then we will move the
         * saved element into the final DOM tree.
         */
        var handleMovedEl = function(el) {
            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var savedEl = savedEls[key];
                    if (savedEl && compareNodeNames(curChild, savedEl)) {
                        curChild.parentNode.replaceChild(savedEl, curChild);
                        // true: already visited the saved el tree
                        morphEl(savedEl, curChild, true);
                        curChild = nextSibling;
                        if (empty(savedEls)) {
                            return false;
                        }
                        continue;
                    }
                }

                if (curChild.nodeType === ELEMENT_NODE) {
                    handleMovedEl(curChild);
                }

                curChild = nextSibling;
            }
        };

        // The loop below is used to possibly match up any discarded
        // elements in the original DOM tree with elemenets from the
        // target tree that were moved over without visiting their
        // children
        if (!empty(savedEls)) {
            handleMovedElsLoop:
            while (movedEls.length) {
                var movedElsTemp = movedEls;
                movedEls = [];
                for (var i=0; i<movedElsTemp.length; i++) {
                    if (handleMovedEl(movedElsTemp[i]) === false) {
                        // There are no more unmatched elements so completely end
                        // the loop
                        break handleMovedElsLoop;
                    }
                }
            }
        }

        // Fire the "onNodeDiscarded" event for any saved elements
        // that never found a new home in the morphed DOM
        for (var savedElId in savedEls) {
            if (savedEls.hasOwnProperty(savedElId)) {
                var savedEl = savedEls[savedElId];
                onNodeDiscarded(savedEl);
                walkDiscardedChildNodes(savedEl);
            }
        }
    }

    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        // If we had to swap out the from node with a new node because the old
        // node was not compatible with the target node then we need to
        // replace the old DOM node in the original DOM tree. This is only
        // possible if the original DOM node was part of a DOM tree which
        // we know is the case if it has a parent node.
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }

    return morphedNode;
}

module.exports = morphdom;

},{}],11:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":5,"global/window":6}],12:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

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
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
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

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
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

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
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

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
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
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
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


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

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
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

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

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
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

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
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

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

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
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
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

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
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
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":3,"path-to-regexp":13}],13:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

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
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
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
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

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
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
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
  re.keys = keys
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
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
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
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

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
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
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
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
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
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":9}],14:[function(require,module,exports){

var orig = document.title;

exports = module.exports = set;

function set(str) {
  var i = 1;
  var args = arguments;
  document.title = str.replace(/%[os]/g, function(_){
    switch (_) {
      case '%o':
        return orig;
      case '%s':
        return args[i++];
    }
  });
}

exports.reset = function(){
  set(orig);
};

},{}],15:[function(require,module,exports){
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeMorphEl) opts.onBeforeMorphEl = copier
  }

  return morphdom(fromNode, toNode, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'TEXTAREA' || f.nodeName === 'SELECT') {
      if (t.getAttribute('value') === null) t.value = f.value
    }
  }
}

},{"./update-events.js":16,"bel":1,"morphdom":10}],16:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],17:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
  title('Platzigram');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":18,"empty-element":4,"page":12,"title":14}],18:[function(require,module,exports){
var yo = require('yo-yo');
var layout = require('../layout');

var template = yo`<div class="container timeline">
  <div class="row">
    <div class="col s12 m10 offset-m1 l6 offset-l3">
      content
    </div>
  </div>
</div>`;

module.exports = layout(template);

},{"../layout":21,"yo-yo":15}],19:[function(require,module,exports){
var page = require('page');

require('./homepage');
require('./signup');
require('./signin');

page();

},{"./homepage":17,"./signin":22,"./signup":24,"page":12}],20:[function(require,module,exports){
var yo = require('yo-yo');

module.exports = function landing(box) {
  return yo`<div class="container landing">
    <div class="row">
      <div class="col s10 push-s1">
        <div class="row">
          <div class="col m5 hide-on-small-only">
            <img src="iphone.png" alt="" class="iphone responsive-img">
          </div>
          ${ box }
        </div>
      </div>
    </div>
  </div>`;
};

},{"yo-yo":15}],21:[function(require,module,exports){
var yo = require('yo-yo');

module.exports = function layout(content) {
  return yo`<div>
    <nav class="header">
      <div class="nav-wrapper">
        <div class="container">
          <div class="row">
            <div class="col s12 m6 offset-m1">
              <a href="/" class="brand-logo platzigram">Platzigram</a>
            </div>
            <div class="col s2 m6 push-s10 push-m10">
              <a href="#" class="btn btn-large btn-flat dropdown-button" data-activates="drop-user">
                <i class="fa fa-user" area-hidden="true"></i>
              </a>
              <ul id="drop-user" class="dropdown-content">
                <li><a href="#">Salir</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div class="content">
      ${ content }
    </div>
  </div>`;
};

},{"yo-yo":15}],22:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signin', function (ctx, next) {
  title('Platzigram - Signin');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":23,"empty-element":4,"page":12,"title":14}],23:[function(require,module,exports){
var yo = require('yo-yo');
var landing = require('../landing');

var signinForm = yo`<div class="col s12 m7">
  <div class="row">
    <div class="signup-box">
      <h1 class="platzigram">Platzigram</h1>
      <form action="" class="signup-form">
        <div class="section">
          <a href="" class="btn btn-fb hide-on-small-only">Iniciar sesión con Facebook</a>
          <a href="" class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i>Iniciar sesión</a>
        </div>
        <div class="divider"></div>
        <div class="section">
          <input type="text" name="username" placeholder="Nombre de usuario">
          <input type="password" name="password" placeholder="Contraseña">
          <button type="submit" class="btn waves-effect waves-light btn-signup">Inicia sesión</button>
        </div>
      </form>
    </div>
  </div>
  <div class="row">
    <div class="login-box">
      ¿No tienes una cuenta? <a href="/signup">Registrate</a>
    </div>
  </div>
</div>`;

module.exports = landing(signinForm);

},{"../landing":20,"yo-yo":15}],24:[function(require,module,exports){
var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signup', function (ctx, next) {
  title('Platzigram - Signup');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":25,"empty-element":4,"page":12,"title":14}],25:[function(require,module,exports){
var yo = require('yo-yo');
var landing = require('../landing');

var signupForm = yo`<div class="col s12 m7">
  <div class="row">
    <div class="signup-box">
      <h1 class="platzigram">Platzigram</h1>
      <form action="" class="signup-form">
        <h2>Regístrate para ver fotos de tus amigos estudiando en Platzi</h2>
        <div class="section">
          <a href="" class="btn btn-fb hide-on-small-only">Iniciar sesión con Facebook</a>
          <a href="" class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i>Iniciar sesión</a>
        </div>
        <div class="divider"></div>
        <div class="section">
          <input type="email" name="email" placeholder="Correo electrónico">
          <input type="text" name="name" placeholder="Nombre completo">
          <input type="text" name="username" placeholder="Nombre de usuario">
          <input type="password" name="password" placeholder="Contraseña">
          <button type="submit" class="btn waves-effect waves-light btn-signup">Regístrate</button>
        </div>
      </form>
    </div>
  </div>
  <div class="row">
    <div class="login-box">
      ¿Tienes una cuenta? <a href="/signin">Entrar</a>
    </div>
  </div>
</div>`;

module.exports = landing(signupForm);

},{"../landing":20,"yo-yo":15}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmVsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZW1wdHktZWxlbWVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC1hdHRyaWJ1dGUtdG8tcHJvcGVydHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaHlwZXJ4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbW9ycGhkb20vbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29uLWxvYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFnZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL25vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90aXRsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy95by15by9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy95by15by91cGRhdGUtZXZlbnRzLmpzIiwic3JjL2hvbWVwYWdlL2luZGV4LmpzIiwic3JjL2hvbWVwYWdlL3RlbXBsYXRlLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2xhbmRpbmcvaW5kZXguanMiLCJzcmMvbGF5b3V0L2luZGV4LmpzIiwic3JjL3NpZ25pbi9pbmRleC5qcyIsInNyYy9zaWduaW4vdGVtcGxhdGUuanMiLCJzcmMvc2lnbnVwL2luZGV4LmpzIiwic3JjL3NpZ251cC90ZW1wbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOW1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQSxJQUFJLE9BQU8sUUFBUSxNQUFSLENBQVg7QUFDQSxJQUFJLFFBQVEsUUFBUSxlQUFSLENBQVo7QUFDQSxJQUFJLFdBQVcsUUFBUSxZQUFSLENBQWY7QUFDQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsS0FBSyxHQUFMLEVBQVUsVUFBVSxHQUFWLEVBQWUsSUFBZixFQUFxQjtBQUM5QixRQUFNLFlBQU47QUFDQyxNQUFJLE9BQU8sU0FBUyxjQUFULENBQXdCLGdCQUF4QixDQUFYO0FBQ0EsUUFBTSxJQUFOLEVBQVksV0FBWixDQUF3QixRQUF4QjtBQUNELENBSkQ7OztBQ0xBLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDtBQUNBLElBQUksU0FBUyxRQUFRLFdBQVIsQ0FBYjs7QUFFQSxJQUFJLFdBQVcsRUFBRzs7Ozs7O09BQWxCOztBQVFBLE9BQU8sT0FBUCxHQUFpQixPQUFPLFFBQVAsQ0FBakI7OztBQ1hBLElBQUksT0FBTyxRQUFRLE1BQVIsQ0FBWDs7QUFFQSxRQUFRLFlBQVI7QUFDQSxRQUFRLFVBQVI7QUFDQSxRQUFRLFVBQVI7O0FBRUE7OztBQ05BLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQUFULENBQWtCLEdBQWxCLEVBQXVCO0FBQ3RDLFNBQU8sRUFBRzs7Ozs7OztZQUFBLENBT0EsR0FBSTs7OztTQVBkO0FBWUQsQ0FiRDs7O0FDRkEsSUFBSSxLQUFLLFFBQVEsT0FBUixDQUFUOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFTLE1BQVQsQ0FBZ0IsT0FBaEIsRUFBeUI7QUFDeEMsU0FBTyxFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQSxDQXFCSixPQUFROztTQXJCZDtBQXdCRCxDQXpCRDs7O0FDRkEsSUFBSSxPQUFPLFFBQVEsTUFBUixDQUFYO0FBQ0EsSUFBSSxRQUFRLFFBQVEsZUFBUixDQUFaO0FBQ0EsSUFBSSxXQUFXLFFBQVEsWUFBUixDQUFmO0FBQ0EsSUFBSSxRQUFRLFFBQVEsT0FBUixDQUFaOztBQUVBLEtBQUssU0FBTCxFQUFnQixVQUFVLEdBQVYsRUFBZSxJQUFmLEVBQXFCO0FBQ3BDLFFBQU0scUJBQU47QUFDQyxNQUFJLE9BQU8sU0FBUyxjQUFULENBQXdCLGdCQUF4QixDQUFYO0FBQ0EsUUFBTSxJQUFOLEVBQVksV0FBWixDQUF3QixRQUF4QjtBQUNELENBSkQ7OztBQ0xBLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDtBQUNBLElBQUksVUFBVSxRQUFRLFlBQVIsQ0FBZDs7QUFFQSxJQUFJLGFBQWEsRUFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FBcEI7O0FBeUJBLE9BQU8sT0FBUCxHQUFpQixRQUFRLFVBQVIsQ0FBakI7OztBQzVCQSxJQUFJLE9BQU8sUUFBUSxNQUFSLENBQVg7QUFDQSxJQUFJLFFBQVEsUUFBUSxlQUFSLENBQVo7QUFDQSxJQUFJLFdBQVcsUUFBUSxZQUFSLENBQWY7QUFDQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsS0FBSyxTQUFMLEVBQWdCLFVBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDcEMsUUFBTSxxQkFBTjtBQUNDLE1BQUksT0FBTyxTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQVg7QUFDQSxRQUFNLElBQU4sRUFBWSxXQUFaLENBQXdCLFFBQXhCO0FBQ0QsQ0FKRDs7O0FDTEEsSUFBSSxLQUFLLFFBQVEsT0FBUixDQUFUO0FBQ0EsSUFBSSxVQUFVLFFBQVEsWUFBUixDQUFkOztBQUVBLElBQUksYUFBYSxFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQUFwQjs7QUE0QkEsT0FBTyxPQUFQLEdBQWlCLFFBQVEsVUFBUixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCdnbG9iYWwvZG9jdW1lbnQnKVxudmFyIGh5cGVyeCA9IHJlcXVpcmUoJ2h5cGVyeCcpXG52YXIgb25sb2FkID0gcmVxdWlyZSgnb24tbG9hZCcpXG5cbnZhciBTVkdOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydcbnZhciBCT09MX1BST1BTID0ge1xuICBhdXRvZm9jdXM6IDEsXG4gIGNoZWNrZWQ6IDEsXG4gIGRlZmF1bHRjaGVja2VkOiAxLFxuICBkaXNhYmxlZDogMSxcbiAgZm9ybW5vdmFsaWRhdGU6IDEsXG4gIGluZGV0ZXJtaW5hdGU6IDEsXG4gIHJlYWRvbmx5OiAxLFxuICByZXF1aXJlZDogMSxcbiAgc2VsZWN0ZWQ6IDEsXG4gIHdpbGx2YWxpZGF0ZTogMVxufVxudmFyIFNWR19UQUdTID0gW1xuICAnc3ZnJyxcbiAgJ2FsdEdseXBoJywgJ2FsdEdseXBoRGVmJywgJ2FsdEdseXBoSXRlbScsICdhbmltYXRlJywgJ2FuaW1hdGVDb2xvcicsXG4gICdhbmltYXRlTW90aW9uJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2NsaXBQYXRoJywgJ2NvbG9yLXByb2ZpbGUnLFxuICAnY3Vyc29yJywgJ2RlZnMnLCAnZGVzYycsICdlbGxpcHNlJywgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsXG4gICdmZUNvbXBvbmVudFRyYW5zZmVyJywgJ2ZlQ29tcG9zaXRlJywgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLFxuICAnZmVEaXNwbGFjZW1lbnRNYXAnLCAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsICdmZUZ1bmNSJywgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZScsICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLCAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLCAnZmVUdXJidWxlbmNlJywgJ2ZpbHRlcicsICdmb250JywgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS1zcmMnLCAnZm9udC1mYWNlLXVyaScsXG4gICdmb3JlaWduT2JqZWN0JywgJ2cnLCAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsXG4gICdsaW5lYXJHcmFkaWVudCcsICdtYXJrZXInLCAnbWFzaycsICdtZXRhZGF0YScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncGF0dGVybicsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JhZGlhbEdyYWRpZW50JywgJ3JlY3QnLFxuICAnc2V0JywgJ3N0b3AnLCAnc3dpdGNoJywgJ3N5bWJvbCcsICd0ZXh0JywgJ3RleHRQYXRoJywgJ3RpdGxlJywgJ3RyZWYnLFxuICAndHNwYW4nLCAndXNlJywgJ3ZpZXcnLCAndmtlcm4nXG5dXG5cbmZ1bmN0aW9uIGJlbENyZWF0ZUVsZW1lbnQgKHRhZywgcHJvcHMsIGNoaWxkcmVuKSB7XG4gIHZhciBlbFxuXG4gIC8vIElmIGFuIHN2ZyB0YWcsIGl0IG5lZWRzIGEgbmFtZXNwYWNlXG4gIGlmIChTVkdfVEFHUy5pbmRleE9mKHRhZykgIT09IC0xKSB7XG4gICAgcHJvcHMubmFtZXNwYWNlID0gU1ZHTlNcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSB1c2luZyBhIG5hbWVzcGFjZVxuICB2YXIgbnMgPSBmYWxzZVxuICBpZiAocHJvcHMubmFtZXNwYWNlKSB7XG4gICAgbnMgPSBwcm9wcy5uYW1lc3BhY2VcbiAgICBkZWxldGUgcHJvcHMubmFtZXNwYWNlXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIGVsZW1lbnRcbiAgaWYgKG5zKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHRhZylcbiAgfSBlbHNlIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKVxuICB9XG5cbiAgLy8gSWYgYWRkaW5nIG9ubG9hZCBldmVudHNcbiAgaWYgKHByb3BzLm9ubG9hZCB8fCBwcm9wcy5vbnVubG9hZCkge1xuICAgIHZhciBsb2FkID0gcHJvcHMub25sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgdmFyIHVubG9hZCA9IHByb3BzLm9udW5sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgb25sb2FkKGVsLCBmdW5jdGlvbiBiZWxfb25sb2FkICgpIHtcbiAgICAgIGxvYWQoZWwpXG4gICAgfSwgZnVuY3Rpb24gYmVsX29udW5sb2FkICgpIHtcbiAgICAgIHVubG9hZChlbClcbiAgICB9LFxuICAgIC8vIFdlIGhhdmUgdG8gdXNlIG5vbi1zdGFuZGFyZCBgY2FsbGVyYCB0byBmaW5kIHdobyBpbnZva2VzIGBiZWxDcmVhdGVFbGVtZW50YFxuICAgIGJlbENyZWF0ZUVsZW1lbnQuY2FsbGVyLmNhbGxlci5jYWxsZXIpXG4gICAgZGVsZXRlIHByb3BzLm9ubG9hZFxuICAgIGRlbGV0ZSBwcm9wcy5vbnVubG9hZFxuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSBwcm9wZXJ0aWVzXG4gIGZvciAodmFyIHAgaW4gcHJvcHMpIHtcbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocCkpIHtcbiAgICAgIHZhciBrZXkgPSBwLnRvTG93ZXJDYXNlKClcbiAgICAgIHZhciB2YWwgPSBwcm9wc1twXVxuICAgICAgLy8gTm9ybWFsaXplIGNsYXNzTmFtZVxuICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzbmFtZScpIHtcbiAgICAgICAga2V5ID0gJ2NsYXNzJ1xuICAgICAgICBwID0gJ2NsYXNzJ1xuICAgICAgfVxuICAgICAgLy8gVGhlIGZvciBhdHRyaWJ1dGUgZ2V0cyB0cmFuc2Zvcm1lZCB0byBodG1sRm9yLCBidXQgd2UganVzdCBzZXQgYXMgZm9yXG4gICAgICBpZiAocCA9PT0gJ2h0bWxGb3InKSB7XG4gICAgICAgIHAgPSAnZm9yJ1xuICAgICAgfVxuICAgICAgLy8gSWYgYSBwcm9wZXJ0eSBpcyBib29sZWFuLCBzZXQgaXRzZWxmIHRvIHRoZSBrZXlcbiAgICAgIGlmIChCT09MX1BST1BTW2tleV0pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gJ3RydWUnKSB2YWwgPSBrZXlcbiAgICAgICAgZWxzZSBpZiAodmFsID09PSAnZmFsc2UnKSBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gSWYgYSBwcm9wZXJ0eSBwcmVmZXJzIGJlaW5nIHNldCBkaXJlY3RseSB2cyBzZXRBdHRyaWJ1dGVcbiAgICAgIGlmIChrZXkuc2xpY2UoMCwgMikgPT09ICdvbicpIHtcbiAgICAgICAgZWxbcF0gPSB2YWxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChucykge1xuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIHAsIHZhbClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUocCwgdmFsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXBwZW5kQ2hpbGQgKGNoaWxkcykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjaGlsZHMpKSByZXR1cm5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5vZGUgPSBjaGlsZHNbaV1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgICAgIGFwcGVuZENoaWxkKG5vZGUpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgdHlwZW9mIG5vZGUgPT09ICdib29sZWFuJyB8fFxuICAgICAgICBub2RlIGluc3RhbmNlb2YgRGF0ZSB8fFxuICAgICAgICBub2RlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLnRvU3RyaW5nKClcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBub2RlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoZWwubGFzdENoaWxkICYmIGVsLmxhc3RDaGlsZC5ub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgICAgICAgIGVsLmxhc3RDaGlsZC5ub2RlVmFsdWUgKz0gbm9kZVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlICYmIG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYXBwZW5kQ2hpbGQoY2hpbGRyZW4pXG5cbiAgcmV0dXJuIGVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaHlwZXJ4KGJlbENyZWF0ZUVsZW1lbnQpXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gYmVsQ3JlYXRlRWxlbWVudFxuIiwiIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgfVxufSAoKSlcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IGNhY2hlZFNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNhY2hlZENsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBnbG9iYWwgSFRNTEVsZW1lbnQgKi9cblxuJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1wdHlFbGVtZW50IChlbGVtZW50KSB7XG4gIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbiBlbGVtZW50JylcbiAgfVxuXG4gIHZhciBub2RlXG4gIHdoaWxlICgobm9kZSA9IGVsZW1lbnQubGFzdENoaWxkKSkgZWxlbWVudC5yZW1vdmVDaGlsZChub2RlKVxuICByZXR1cm4gZWxlbWVudFxufVxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYXR0cmlidXRlVG9Qcm9wZXJ0eVxuXG52YXIgdHJhbnNmb3JtID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2Zvcic6ICdodG1sRm9yJyxcbiAgJ2h0dHAtZXF1aXYnOiAnaHR0cEVxdWl2J1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVUb1Byb3BlcnR5IChoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGFnTmFtZSwgYXR0cnMsIGNoaWxkcmVuKSB7XG4gICAgZm9yICh2YXIgYXR0ciBpbiBhdHRycykge1xuICAgICAgaWYgKGF0dHIgaW4gdHJhbnNmb3JtKSB7XG4gICAgICAgIGF0dHJzW3RyYW5zZm9ybVthdHRyXV0gPSBhdHRyc1thdHRyXVxuICAgICAgICBkZWxldGUgYXR0cnNbYXR0cl1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGgodGFnTmFtZSwgYXR0cnMsIGNoaWxkcmVuKVxuICB9XG59XG4iLCJ2YXIgYXR0clRvUHJvcCA9IHJlcXVpcmUoJ2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eScpXG5cbnZhciBWQVIgPSAwLCBURVhUID0gMSwgT1BFTiA9IDIsIENMT1NFID0gMywgQVRUUiA9IDRcbnZhciBBVFRSX0tFWSA9IDUsIEFUVFJfS0VZX1cgPSA2XG52YXIgQVRUUl9WQUxVRV9XID0gNywgQVRUUl9WQUxVRSA9IDhcbnZhciBBVFRSX1ZBTFVFX1NRID0gOSwgQVRUUl9WQUxVRV9EUSA9IDEwXG52YXIgQVRUUl9FUSA9IDExLCBBVFRSX0JSRUFLID0gMTJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaCwgb3B0cykge1xuICBoID0gYXR0clRvUHJvcChoKVxuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxuICB2YXIgY29uY2F0ID0gb3B0cy5jb25jYXQgfHwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gU3RyaW5nKGEpICsgU3RyaW5nKGIpXG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZ3MpIHtcbiAgICB2YXIgc3RhdGUgPSBURVhULCByZWcgPSAnJ1xuICAgIHZhciBhcmdsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgdmFyIHBhcnRzID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPCBhcmdsZW4gLSAxKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaSsxXVxuICAgICAgICB2YXIgcCA9IHBhcnNlKHN0cmluZ3NbaV0pXG4gICAgICAgIHZhciB4c3RhdGUgPSBzdGF0ZVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfU1EpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFIpIHhzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgIHAucHVzaChbIFZBUiwgeHN0YXRlLCBhcmcgXSlcbiAgICAgICAgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcClcbiAgICAgIH0gZWxzZSBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwYXJzZShzdHJpbmdzW2ldKSlcbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IFtudWxsLHt9LFtdXVxuICAgIHZhciBzdGFjayA9IFtbdHJlZSwtMV1dXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVxuICAgICAgdmFyIHAgPSBwYXJ0c1tpXSwgcyA9IHBbMF1cbiAgICAgIGlmIChzID09PSBPUEVOICYmIC9eXFwvLy50ZXN0KHBbMV0pKSB7XG4gICAgICAgIHZhciBpeCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVsxXVxuICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdWzJdW2l4XSA9IGgoXG4gICAgICAgICAgICBjdXJbMF0sIGN1clsxXSwgY3VyWzJdLmxlbmd0aCA/IGN1clsyXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBPUEVOKSB7XG4gICAgICAgIHZhciBjID0gW3BbMV0se30sW11dXG4gICAgICAgIGN1clsyXS5wdXNoKGMpXG4gICAgICAgIHN0YWNrLnB1c2goW2MsY3VyWzJdLmxlbmd0aC0xXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkgfHwgKHMgPT09IFZBUiAmJiBwWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgdmFyIGtleSA9ICcnXG4gICAgICAgIHZhciBjb3B5S2V5XG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsxXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldWzBdID09PSBWQVIgJiYgcGFydHNbaV1bMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnRzW2ldWzJdID09PSAnb2JqZWN0JyAmJiAha2V5KSB7XG4gICAgICAgICAgICAgIGZvciAoY29weUtleSBpbiBwYXJ0c1tpXVsyXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1tpXVsyXS5oYXNPd25Qcm9wZXJ0eShjb3B5S2V5KSAmJiAhY3VyWzFdW2NvcHlLZXldKSB7XG4gICAgICAgICAgICAgICAgICBjdXJbMV1bY29weUtleV0gPSBwYXJ0c1tpXVsyXVtjb3B5S2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAga2V5ID0gY29uY2F0KGtleSwgcGFydHNbaV1bMl0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX0VRKSBpKytcbiAgICAgICAgdmFyIGogPSBpXG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfVkFMVUUgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzFdKVxuICAgICAgICAgICAgZWxzZSBjdXJbMV1ba2V5XSA9IGNvbmNhdChjdXJbMV1ba2V5XSwgcGFydHNbaV1bMV0pXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1tpXVswXSA9PT0gVkFSXG4gICAgICAgICAgJiYgKHBhcnRzW2ldWzFdID09PSBBVFRSX1ZBTFVFIHx8IHBhcnRzW2ldWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMl0pXG4gICAgICAgICAgICBlbHNlIGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsyXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggJiYgIWN1clsxXVtrZXldICYmIGkgPT09IGpcbiAgICAgICAgICAgICYmIChwYXJ0c1tpXVswXSA9PT0gQ0xPU0UgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfQlJFQUspKSB7XG4gICAgICAgICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZnJhc3RydWN0dXJlLmh0bWwjYm9vbGVhbi1hdHRyaWJ1dGVzXG4gICAgICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBpcyBmYWxzeSwgbm90IHdlbGwgYmVoYXZlZCB2YWx1ZSBpbiBicm93c2VyXG4gICAgICAgICAgICAgIGN1clsxXVtrZXldID0ga2V5LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzFdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzJdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQ0xPU0UpIHtcbiAgICAgICAgaWYgKHNlbGZDbG9zaW5nKGN1clswXSkgJiYgc3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFZBUiAmJiBwWzFdID09PSBURVhUKSB7XG4gICAgICAgIGlmIChwWzJdID09PSB1bmRlZmluZWQgfHwgcFsyXSA9PT0gbnVsbCkgcFsyXSA9ICcnXG4gICAgICAgIGVsc2UgaWYgKCFwWzJdKSBwWzJdID0gY29uY2F0KCcnLCBwWzJdKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwWzJdWzBdKSkge1xuICAgICAgICAgIGN1clsyXS5wdXNoLmFwcGx5KGN1clsyXSwgcFsyXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJbMl0ucHVzaChwWzJdKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFRFWFQpIHtcbiAgICAgICAgY3VyWzJdLnB1c2gocFsxXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9FUSB8fCBzID09PSBBVFRSX0JSRUFLKSB7XG4gICAgICAgIC8vIG5vLW9wXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZDogJyArIHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRyZWVbMl0ubGVuZ3RoID4gMSAmJiAvXlxccyokLy50ZXN0KHRyZWVbMl1bMF0pKSB7XG4gICAgICB0cmVlWzJdLnNoaWZ0KClcbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAyXG4gICAgfHwgKHRyZWVbMl0ubGVuZ3RoID09PSAyICYmIC9cXFMvLnRlc3QodHJlZVsyXVsxXSkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdtdWx0aXBsZSByb290IGVsZW1lbnRzIG11c3QgYmUgd3JhcHBlZCBpbiBhbiBlbmNsb3NpbmcgdGFnJ1xuICAgICAgKVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmVlWzJdWzBdKSAmJiB0eXBlb2YgdHJlZVsyXVswXVswXSA9PT0gJ3N0cmluZydcbiAgICAmJiBBcnJheS5pc0FycmF5KHRyZWVbMl1bMF1bMl0pKSB7XG4gICAgICB0cmVlWzJdWzBdID0gaCh0cmVlWzJdWzBdWzBdLCB0cmVlWzJdWzBdWzFdLCB0cmVlWzJdWzBdWzJdKVxuICAgIH1cbiAgICByZXR1cm4gdHJlZVsyXVswXVxuXG4gICAgZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICAgICAgdmFyIHJlcyA9IFtdXG4gICAgICBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVykgc3RhdGUgPSBBVFRSXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQXQoaSlcbiAgICAgICAgaWYgKHN0YXRlID09PSBURVhUICYmIGMgPT09ICc8Jykge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbVEVYVCwgcmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gT1BFTlxuICAgICAgICB9IGVsc2UgaWYgKGMgPT09ICc+JyAmJiAhcXVvdChzdGF0ZSkpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLHJlZ10pXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnB1c2goW0NMT1NFXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBURVhUKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW09QRU4sIHJlZ10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTikge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1tcXHctXS8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0YXRlID09PSBBVFRSX0tFWV9XIHx8IHN0YXRlID09PSBBVFRSKSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9FUV0pXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1dcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmICEvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIGlmICgvW1xcdy1dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgICByZWcgKz0gY1xuICAgICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIH0gZWxzZSBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09ICdcIicpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfRFFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgICBpLS1cbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUVxuICAgICAgICB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtURVhULHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdHJmbiAoeCkge1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHJldHVybiB4XG4gICAgZWxzZSBpZiAoeCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcpIHJldHVybiB4XG4gICAgZWxzZSByZXR1cm4gY29uY2F0KCcnLCB4KVxuICB9XG59XG5cbmZ1bmN0aW9uIHF1b3QgKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUVxufVxuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuZnVuY3Rpb24gaGFzIChvYmosIGtleSkgeyByZXR1cm4gaGFzT3duLmNhbGwob2JqLCBrZXkpIH1cblxudmFyIGNsb3NlUkUgPSBSZWdFeHAoJ14oJyArIFtcbiAgJ2FyZWEnLCAnYmFzZScsICdiYXNlZm9udCcsICdiZ3NvdW5kJywgJ2JyJywgJ2NvbCcsICdjb21tYW5kJywgJ2VtYmVkJyxcbiAgJ2ZyYW1lJywgJ2hyJywgJ2ltZycsICdpbnB1dCcsICdpc2luZGV4JywgJ2tleWdlbicsICdsaW5rJywgJ21ldGEnLCAncGFyYW0nLFxuICAnc291cmNlJywgJ3RyYWNrJywgJ3dicicsXG4gIC8vIFNWRyBUQUdTXG4gICdhbmltYXRlJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2N1cnNvcicsICdkZXNjJywgJ2VsbGlwc2UnLFxuICAnZmVCbGVuZCcsICdmZUNvbG9yTWF0cml4JywgJ2ZlQ29tcG9uZW50VHJhbnNmZXInLCAnZmVDb21wb3NpdGUnLFxuICAnZmVDb252b2x2ZU1hdHJpeCcsICdmZURpZmZ1c2VMaWdodGluZycsICdmZURpc3BsYWNlbWVudE1hcCcsXG4gICdmZURpc3RhbnRMaWdodCcsICdmZUZsb29kJywgJ2ZlRnVuY0EnLCAnZmVGdW5jQicsICdmZUZ1bmNHJywgJ2ZlRnVuY1InLFxuICAnZmVHYXVzc2lhbkJsdXInLCAnZmVJbWFnZScsICdmZU1lcmdlTm9kZScsICdmZU1vcnBob2xvZ3knLFxuICAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLFxuICAnZmVUdXJidWxlbmNlJywgJ2ZvbnQtZmFjZS1mb3JtYXQnLCAnZm9udC1mYWNlLW5hbWUnLCAnZm9udC1mYWNlLXVyaScsXG4gICdnbHlwaCcsICdnbHlwaFJlZicsICdoa2VybicsICdpbWFnZScsICdsaW5lJywgJ21pc3NpbmctZ2x5cGgnLCAnbXBhdGgnLFxuICAncGF0aCcsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JlY3QnLCAnc2V0JywgJ3N0b3AnLCAndHJlZicsICd1c2UnLCAndmlldycsXG4gICd2a2Vybidcbl0uam9pbignfCcpICsgJykoPzpbXFwuI11bYS16QS1aMC05XFx1MDA3Ri1cXHVGRkZGXzotXSspKiQnKVxuZnVuY3Rpb24gc2VsZkNsb3NpbmcgKHRhZykgeyByZXR1cm4gY2xvc2VSRS50ZXN0KHRhZykgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ3JlYXRlIGEgcmFuZ2Ugb2JqZWN0IGZvciBlZmZpY2VudGx5IHJlbmRlcmluZyBzdHJpbmdzIHRvIGVsZW1lbnRzLlxudmFyIHJhbmdlO1xuXG52YXIgdGVzdEVsID0gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpID9cbiAgICBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIDpcbiAgICB7fTtcblxudmFyIFhIVE1MID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xudmFyIEVMRU1FTlRfTk9ERSA9IDE7XG52YXIgVEVYVF9OT0RFID0gMztcbnZhciBDT01NRU5UX05PREUgPSA4O1xuXG4vLyBGaXhlcyA8aHR0cHM6Ly9naXRodWIuY29tL3BhdHJpY2stc3RlZWxlLWlkZW0vbW9ycGhkb20vaXNzdWVzLzMyPlxuLy8gKElFNysgc3VwcG9ydCkgPD1JRTcgZG9lcyBub3Qgc3VwcG9ydCBlbC5oYXNBdHRyaWJ1dGUobmFtZSlcbnZhciBoYXNBdHRyaWJ1dGVOUztcblxuaWYgKHRlc3RFbC5oYXNBdHRyaWJ1dGVOUykge1xuICAgIGhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuaGFzQXR0cmlidXRlTlMobmFtZXNwYWNlVVJJLCBuYW1lKTtcbiAgICB9O1xufSBlbHNlIGlmICh0ZXN0RWwuaGFzQXR0cmlidXRlKSB7XG4gICAgaGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbC5oYXNBdHRyaWJ1dGUobmFtZSk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgaGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiAhIWVsLmdldEF0dHJpYnV0ZU5vZGUobmFtZSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZW1wdHkobykge1xuICAgIGZvciAodmFyIGsgaW4gbykge1xuICAgICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB0b0VsZW1lbnQoc3RyKSB7XG4gICAgaWYgKCFyYW5nZSAmJiBkb2N1bWVudC5jcmVhdGVSYW5nZSkge1xuICAgICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuYm9keSk7XG4gICAgfVxuXG4gICAgdmFyIGZyYWdtZW50O1xuICAgIGlmIChyYW5nZSAmJiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQpIHtcbiAgICAgICAgZnJhZ21lbnQgPSByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoc3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JvZHknKTtcbiAgICAgICAgZnJhZ21lbnQuaW5uZXJIVE1MID0gc3RyO1xuICAgIH1cbiAgICByZXR1cm4gZnJhZ21lbnQuY2hpbGROb2Rlc1swXTtcbn1cblxudmFyIHNwZWNpYWxFbEhhbmRsZXJzID0ge1xuICAgIC8qKlxuICAgICAqIE5lZWRlZCBmb3IgSUUuIEFwcGFyZW50bHkgSUUgZG9lc24ndCB0aGluayB0aGF0IFwic2VsZWN0ZWRcIiBpcyBhblxuICAgICAqIGF0dHJpYnV0ZSB3aGVuIHJlYWRpbmcgb3ZlciB0aGUgYXR0cmlidXRlcyB1c2luZyBzZWxlY3RFbC5hdHRyaWJ1dGVzXG4gICAgICovXG4gICAgT1BUSU9OOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgZnJvbUVsLnNlbGVjdGVkID0gdG9FbC5zZWxlY3RlZDtcbiAgICAgICAgaWYgKGZyb21FbC5zZWxlY3RlZCkge1xuICAgICAgICAgICAgZnJvbUVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9tRWwucmVtb3ZlQXR0cmlidXRlKCdzZWxlY3RlZCcsICcnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIFwidmFsdWVcIiBhdHRyaWJ1dGUgaXMgc3BlY2lhbCBmb3IgdGhlIDxpbnB1dD4gZWxlbWVudCBzaW5jZSBpdCBzZXRzXG4gICAgICogdGhlIGluaXRpYWwgdmFsdWUuIENoYW5naW5nIHRoZSBcInZhbHVlXCIgYXR0cmlidXRlIHdpdGhvdXQgY2hhbmdpbmcgdGhlXG4gICAgICogXCJ2YWx1ZVwiIHByb3BlcnR5IHdpbGwgaGF2ZSBubyBlZmZlY3Qgc2luY2UgaXQgaXMgb25seSB1c2VkIHRvIHRoZSBzZXQgdGhlXG4gICAgICogaW5pdGlhbCB2YWx1ZS4gIFNpbWlsYXIgZm9yIHRoZSBcImNoZWNrZWRcIiBhdHRyaWJ1dGUsIGFuZCBcImRpc2FibGVkXCIuXG4gICAgICovXG4gICAgSU5QVVQ6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICBmcm9tRWwuY2hlY2tlZCA9IHRvRWwuY2hlY2tlZDtcbiAgICAgICAgaWYgKGZyb21FbC5jaGVja2VkKSB7XG4gICAgICAgICAgICBmcm9tRWwuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbUVsLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZyb21FbC52YWx1ZSAhPT0gdG9FbC52YWx1ZSkge1xuICAgICAgICAgICAgZnJvbUVsLnZhbHVlID0gdG9FbC52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzQXR0cmlidXRlTlModG9FbCwgbnVsbCwgJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIGZyb21FbC5yZW1vdmVBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmcm9tRWwuZGlzYWJsZWQgPSB0b0VsLmRpc2FibGVkO1xuICAgICAgICBpZiAoZnJvbUVsLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBmcm9tRWwuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb21FbC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgVEVYVEFSRUE6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSB0b0VsLnZhbHVlO1xuICAgICAgICBpZiAoZnJvbUVsLnZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgZnJvbUVsLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnJvbUVsLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGZyb21FbC5maXJzdENoaWxkLm5vZGVWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHR3byBub2RlJ3MgbmFtZXMgYW5kIG5hbWVzcGFjZSBVUklzIGFyZSB0aGUgc2FtZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGFcbiAqIEBwYXJhbSB7RWxlbWVudH0gYlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudmFyIGNvbXBhcmVOb2RlTmFtZXMgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGEubm9kZU5hbWUgPT09IGIubm9kZU5hbWUgJiZcbiAgICAgICAgICAgYS5uYW1lc3BhY2VVUkkgPT09IGIubmFtZXNwYWNlVVJJO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gZWxlbWVudCwgb3B0aW9uYWxseSB3aXRoIGEga25vd24gbmFtZXNwYWNlIFVSSS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgZWxlbWVudCBuYW1lLCBlLmcuICdkaXYnIG9yICdzdmcnXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVzcGFjZVVSSV0gdGhlIGVsZW1lbnQncyBuYW1lc3BhY2UgVVJJLCBpLmUuIHRoZSB2YWx1ZSBvZlxuICogaXRzIGB4bWxuc2AgYXR0cmlidXRlIG9yIGl0cyBpbmZlcnJlZCBuYW1lc3BhY2UuXG4gKlxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWUsIG5hbWVzcGFjZVVSSSkge1xuICAgIHJldHVybiAhbmFtZXNwYWNlVVJJIHx8IG5hbWVzcGFjZVVSSSA9PT0gWEhUTUwgP1xuICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpIDpcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgbmFtZSk7XG59XG5cbi8qKlxuICogTG9vcCBvdmVyIGFsbCBvZiB0aGUgYXR0cmlidXRlcyBvbiB0aGUgdGFyZ2V0IG5vZGUgYW5kIG1ha2Ugc3VyZSB0aGUgb3JpZ2luYWxcbiAqIERPTSBub2RlIGhhcyB0aGUgc2FtZSBhdHRyaWJ1dGVzLiBJZiBhbiBhdHRyaWJ1dGUgZm91bmQgb24gdGhlIG9yaWdpbmFsIG5vZGVcbiAqIGlzIG5vdCBvbiB0aGUgbmV3IG5vZGUgdGhlbiByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luYWwgbm9kZS5cbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBmcm9tTm9kZVxuICogQHBhcmFtICB7RWxlbWVudH0gdG9Ob2RlXG4gKi9cbmZ1bmN0aW9uIG1vcnBoQXR0cnMoZnJvbU5vZGUsIHRvTm9kZSkge1xuICAgIHZhciBhdHRycyA9IHRvTm9kZS5hdHRyaWJ1dGVzO1xuICAgIHZhciBpO1xuICAgIHZhciBhdHRyO1xuICAgIHZhciBhdHRyTmFtZTtcbiAgICB2YXIgYXR0ck5hbWVzcGFjZVVSSTtcbiAgICB2YXIgYXR0clZhbHVlO1xuICAgIHZhciBmcm9tVmFsdWU7XG5cbiAgICBmb3IgKGkgPSBhdHRycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lO1xuICAgICAgICBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgICBhdHRyTmFtZXNwYWNlVVJJID0gYXR0ci5uYW1lc3BhY2VVUkk7XG5cbiAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5sb2NhbE5hbWUgfHwgYXR0ck5hbWU7XG4gICAgICAgICAgICBmcm9tVmFsdWUgPSBmcm9tTm9kZS5nZXRBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9tVmFsdWUgPSBmcm9tTm9kZS5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZyb21WYWx1ZSAhPT0gYXR0clZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoYXR0ck5hbWVzcGFjZVVSSSkge1xuICAgICAgICAgICAgICAgIGZyb21Ob2RlLnNldEF0dHJpYnV0ZU5TKGF0dHJOYW1lc3BhY2VVUkksIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcm9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgYW55IGV4dHJhIGF0dHJpYnV0ZXMgZm91bmQgb24gdGhlIG9yaWdpbmFsIERPTSBlbGVtZW50IHRoYXRcbiAgICAvLyB3ZXJlbid0IGZvdW5kIG9uIHRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICBhdHRycyA9IGZyb21Ob2RlLmF0dHJpYnV0ZXM7XG5cbiAgICBmb3IgKGkgPSBhdHRycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgICAgIGlmIChhdHRyLnNwZWNpZmllZCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lO1xuICAgICAgICAgICAgYXR0ck5hbWVzcGFjZVVSSSA9IGF0dHIubmFtZXNwYWNlVVJJO1xuXG4gICAgICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvTm9kZSwgYXR0ck5hbWVzcGFjZVVSSSwgYXR0ck5hbWVzcGFjZVVSSSA/IGF0dHJOYW1lID0gYXR0ci5sb2NhbE5hbWUgfHwgYXR0ck5hbWUgOiBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0ck5hbWVzcGFjZVVSSSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZS5yZW1vdmVBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyLmxvY2FsTmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbU5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSBjaGlsZHJlbiBvZiBvbmUgRE9NIGVsZW1lbnQgdG8gYW5vdGhlciBET00gZWxlbWVudFxuICovXG5mdW5jdGlvbiBtb3ZlQ2hpbGRyZW4oZnJvbUVsLCB0b0VsKSB7XG4gICAgdmFyIGN1ckNoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgd2hpbGUgKGN1ckNoaWxkKSB7XG4gICAgICAgIHZhciBuZXh0Q2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgdG9FbC5hcHBlbmRDaGlsZChjdXJDaGlsZCk7XG4gICAgICAgIGN1ckNoaWxkID0gbmV4dENoaWxkO1xuICAgIH1cbiAgICByZXR1cm4gdG9FbDtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEdldE5vZGVLZXkobm9kZSkge1xuICAgIHJldHVybiBub2RlLmlkO1xufVxuXG5mdW5jdGlvbiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRvTm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGZyb21Ob2RlLm5vZGVOYW1lID09PSAnI2RvY3VtZW50JyB8fCBmcm9tTm9kZS5ub2RlTmFtZSA9PT0gJ0hUTUwnKSB7XG4gICAgICAgICAgICB2YXIgdG9Ob2RlSHRtbCA9IHRvTm9kZTtcbiAgICAgICAgICAgIHRvTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICAgICAgICAgIHRvTm9kZS5pbm5lckhUTUwgPSB0b05vZGVIdG1sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9Ob2RlID0gdG9FbGVtZW50KHRvTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBYWFggb3B0aW1pemF0aW9uOiBpZiB0aGUgbm9kZXMgYXJlIGVxdWFsLCBkb24ndCBtb3JwaCB0aGVtXG4gICAgLypcbiAgICBpZiAoZnJvbU5vZGUuaXNFcXVhbE5vZGUodG9Ob2RlKSkge1xuICAgICAgcmV0dXJuIGZyb21Ob2RlO1xuICAgIH1cbiAgICAqL1xuXG4gICAgdmFyIHNhdmVkRWxzID0ge307IC8vIFVzZWQgdG8gc2F2ZSBvZmYgRE9NIGVsZW1lbnRzIHdpdGggSURzXG4gICAgdmFyIHVubWF0Y2hlZEVscyA9IHt9O1xuICAgIHZhciBnZXROb2RlS2V5ID0gb3B0aW9ucy5nZXROb2RlS2V5IHx8IGRlZmF1bHRHZXROb2RlS2V5O1xuICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZCA9IG9wdGlvbnMub25CZWZvcmVOb2RlQWRkZWQgfHwgbm9vcDtcbiAgICB2YXIgb25Ob2RlQWRkZWQgPSBvcHRpb25zLm9uTm9kZUFkZGVkIHx8IG5vb3A7XG4gICAgdmFyIG9uQmVmb3JlRWxVcGRhdGVkID0gb3B0aW9ucy5vbkJlZm9yZUVsVXBkYXRlZCB8fCBvcHRpb25zLm9uQmVmb3JlTW9ycGhFbCB8fCBub29wO1xuICAgIHZhciBvbkVsVXBkYXRlZCA9IG9wdGlvbnMub25FbFVwZGF0ZWQgfHwgbm9vcDtcbiAgICB2YXIgb25CZWZvcmVOb2RlRGlzY2FyZGVkID0gb3B0aW9ucy5vbkJlZm9yZU5vZGVEaXNjYXJkZWQgfHwgbm9vcDtcbiAgICB2YXIgb25Ob2RlRGlzY2FyZGVkID0gb3B0aW9ucy5vbk5vZGVEaXNjYXJkZWQgfHwgbm9vcDtcbiAgICB2YXIgb25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCA9IG9wdGlvbnMub25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCB8fCBvcHRpb25zLm9uQmVmb3JlTW9ycGhFbENoaWxkcmVuIHx8IG5vb3A7XG4gICAgdmFyIGNoaWxkcmVuT25seSA9IG9wdGlvbnMuY2hpbGRyZW5Pbmx5ID09PSB0cnVlO1xuICAgIHZhciBtb3ZlZEVscyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZUhlbHBlcihub2RlLCBuZXN0ZWRJblNhdmVkRWwpIHtcbiAgICAgICAgdmFyIGlkID0gZ2V0Tm9kZUtleShub2RlKTtcbiAgICAgICAgLy8gSWYgdGhlIG5vZGUgaGFzIGFuIElEIHRoZW4gc2F2ZSBpdCBvZmYgc2luY2Ugd2Ugd2lsbCB3YW50XG4gICAgICAgIC8vIHRvIHJldXNlIGl0IGluIGNhc2UgdGhlIHRhcmdldCBET00gdHJlZSBoYXMgYSBET00gZWxlbWVudFxuICAgICAgICAvLyB3aXRoIHRoZSBzYW1lIElEXG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgc2F2ZWRFbHNbaWRdID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIGlmICghbmVzdGVkSW5TYXZlZEVsKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgbm90IG5lc3RlZCBpbiBhIHNhdmVkIGVsZW1lbnQgdGhlbiB3ZSBrbm93IHRoYXQgdGhpcyBub2RlIGhhcyBiZWVuXG4gICAgICAgICAgICAvLyBjb21wbGV0ZWx5IGRpc2NhcmRlZCBhbmQgd2lsbCBub3QgZXhpc3QgaW4gdGhlIGZpbmFsIERPTS5cbiAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIHdoaWxlIChjdXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGVIZWxwZXIoY3VyQ2hpbGQsIG5lc3RlZEluU2F2ZWRFbCB8fCBpZCk7XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhbGtEaXNjYXJkZWRDaGlsZE5vZGVzKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgdmFyIGN1ckNoaWxkID0gbm9kZS5maXJzdENoaWxkO1xuICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG5cblxuICAgICAgICAgICAgICAgIGlmICghZ2V0Tm9kZUtleShjdXJDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGhhbmRsZSBub2RlcyB0aGF0IGRvbid0IGhhdmUgYW4gSUQgdG8gYXZvaWQgZG91YmxlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhbGtpbmcgdGhlIHNhbWUgc2F2ZWQgZWxlbWVudC5cblxuICAgICAgICAgICAgICAgICAgICBvbk5vZGVEaXNjYXJkZWQoY3VyQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUsIHBhcmVudE5vZGUsIGFscmVhZHlWaXNpdGVkKSB7XG4gICAgICAgIGlmIChvbkJlZm9yZU5vZGVEaXNjYXJkZWQobm9kZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICBpZiAoYWxyZWFkeVZpc2l0ZWQpIHtcbiAgICAgICAgICAgIGlmICghZ2V0Tm9kZUtleShub2RlKSkge1xuICAgICAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChub2RlKTtcbiAgICAgICAgICAgICAgICB3YWxrRGlzY2FyZGVkQ2hpbGROb2Rlcyhub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbW92ZU5vZGVIZWxwZXIobm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3JwaEVsKGZyb21FbCwgdG9FbCwgYWxyZWFkeVZpc2l0ZWQsIGNoaWxkcmVuT25seSkge1xuICAgICAgICB2YXIgdG9FbEtleSA9IGdldE5vZGVLZXkodG9FbCk7XG4gICAgICAgIGlmICh0b0VsS2V5KSB7XG4gICAgICAgICAgICAvLyBJZiBhbiBlbGVtZW50IHdpdGggYW4gSUQgaXMgYmVpbmcgbW9ycGhlZCB0aGVuIGl0IGlzIHdpbGwgYmUgaW4gdGhlIGZpbmFsXG4gICAgICAgICAgICAvLyBET00gc28gY2xlYXIgaXQgb3V0IG9mIHRoZSBzYXZlZCBlbGVtZW50cyBjb2xsZWN0aW9uXG4gICAgICAgICAgICBkZWxldGUgc2F2ZWRFbHNbdG9FbEtleV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNoaWxkcmVuT25seSkge1xuICAgICAgICAgICAgaWYgKG9uQmVmb3JlRWxVcGRhdGVkKGZyb21FbCwgdG9FbCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtb3JwaEF0dHJzKGZyb21FbCwgdG9FbCk7XG4gICAgICAgICAgICBvbkVsVXBkYXRlZChmcm9tRWwpO1xuXG4gICAgICAgICAgICBpZiAob25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZChmcm9tRWwsIHRvRWwpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmcm9tRWwubm9kZU5hbWUgIT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgIHZhciBjdXJUb05vZGVDaGlsZCA9IHRvRWwuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICB2YXIgY3VyVG9Ob2RlSWQ7XG5cbiAgICAgICAgICAgIHZhciBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB2YXIgdG9OZXh0U2libGluZztcbiAgICAgICAgICAgIHZhciBzYXZlZEVsO1xuICAgICAgICAgICAgdmFyIHVubWF0Y2hlZEVsO1xuXG4gICAgICAgICAgICBvdXRlcjogd2hpbGUgKGN1clRvTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgdG9OZXh0U2libGluZyA9IGN1clRvTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIGN1clRvTm9kZUlkID0gZ2V0Tm9kZUtleShjdXJUb05vZGVDaGlsZCk7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyRnJvbU5vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyRnJvbU5vZGVJZCA9IGdldE5vZGVLZXkoY3VyRnJvbU5vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbHJlYWR5VmlzaXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlSWQgJiYgKHVubWF0Y2hlZEVsID0gdW5tYXRjaGVkRWxzW2N1ckZyb21Ob2RlSWRdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubWF0Y2hlZEVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGN1ckZyb21Ob2RlQ2hpbGQsIHVubWF0Y2hlZEVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3JwaEVsKGN1ckZyb21Ob2RlQ2hpbGQsIHVubWF0Y2hlZEVsLCBhbHJlYWR5VmlzaXRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZVR5cGUgPSBjdXJGcm9tTm9kZUNoaWxkLm5vZGVUeXBlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZVR5cGUgPT09IGN1clRvTm9kZUNoaWxkLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXNDb21wYXRpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvdGggbm9kZXMgYmVpbmcgY29tcGFyZWQgYXJlIEVsZW1lbnQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wYXJlTm9kZU5hbWVzKGN1ckZyb21Ob2RlQ2hpbGQsIGN1clRvTm9kZUNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGNvbXBhdGlibGUgRE9NIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZUlkIHx8IGN1clRvTm9kZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBlaXRoZXIgRE9NIGVsZW1lbnQgaGFzIGFuIElEIHRoZW4gd2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsZSB0aG9zZSBkaWZmZXJlbnRseSBzaW5jZSB3ZSB3YW50IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCB1cCBieSBJRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1clRvTm9kZUlkID09PSBjdXJGcm9tTm9kZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNDb21wYXRpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGZvdW5kIGNvbXBhdGlibGUgRE9NIGVsZW1lbnRzIHNvIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBcImZyb21cIiBub2RlIHRvIG1hdGNoIHRoZSBjdXJyZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRhcmdldCBET00gbm9kZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbChjdXJGcm9tTm9kZUNoaWxkLCBjdXJUb05vZGVDaGlsZCwgYWxyZWFkeVZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvdGggbm9kZXMgYmVpbmcgY29tcGFyZWQgYXJlIFRleHQgb3IgQ29tbWVudCBub2Rlc1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IGN1ckZyb21Ob2RlVHlwZSA9PSBDT01NRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBhdGlibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbXBseSB1cGRhdGUgbm9kZVZhbHVlIG9uIHRoZSBvcmlnaW5hbCBub2RlIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIHRoZSB0ZXh0IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZC5ub2RlVmFsdWUgPSBjdXJUb05vZGVDaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0NvbXBhdGlibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJUb05vZGVDaGlsZCA9IHRvTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGNvbXBhdGlibGUgbWF0Y2ggc28gcmVtb3ZlIHRoZSBvbGQgbm9kZSBmcm9tIHRoZSBET01cbiAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGNvbnRpbnVlIHRyeWluZyB0byBmaW5kIGEgbWF0Y2ggaW4gdGhlIG9yaWdpbmFsIERPTVxuICAgICAgICAgICAgICAgICAgICByZW1vdmVOb2RlKGN1ckZyb21Ob2RlQ2hpbGQsIGZyb21FbCwgYWxyZWFkeVZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbU5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVJZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNhdmVkRWwgPSBzYXZlZEVsc1tjdXJUb05vZGVJZF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGFyZU5vZGVOYW1lcyhzYXZlZEVsLCBjdXJUb05vZGVDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3JwaEVsKHNhdmVkRWwsIGN1clRvTm9kZUNoaWxkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSB3YW50IHRvIGFwcGVuZCB0aGUgc2F2ZWQgZWxlbWVudCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSBzYXZlZEVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgc2F2ZWRFbHNbY3VyVG9Ob2RlSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChzYXZlZEVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjdXJyZW50IERPTSBlbGVtZW50IGluIHRoZSB0YXJnZXQgdHJlZSBoYXMgYW4gSURcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB3ZSBkaWQgbm90IGZpbmQgYSBtYXRjaCBpbiBhbnkgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb3JyZXNwb25kaW5nIHNpYmxpbmdzLiBXZSBqdXN0IHB1dCB0aGUgdGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGVtZW50IGluIHRoZSBvbGQgRE9NIHRyZWUgYnV0IGlmIHdlIGxhdGVyIGZpbmQgYW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVsZW1lbnQgaW4gdGhlIG9sZCBET00gdHJlZSB0aGF0IGhhcyBhIG1hdGNoaW5nIElEXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIHdpbGwgcmVwbGFjZSB0aGUgdGFyZ2V0IGVsZW1lbnQgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgb2xkIGVsZW1lbnQgYW5kIG1vcnBoIHRoZSBvbGQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5tYXRjaGVkRWxzW2N1clRvTm9kZUlkXSA9IGN1clRvTm9kZUNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZ290IHRoaXMgZmFyIHRoZW4gd2UgZGlkIG5vdCBmaW5kIGEgY2FuZGlkYXRlIG1hdGNoIGZvclxuICAgICAgICAgICAgICAgIC8vIG91ciBcInRvIG5vZGVcIiBhbmQgd2UgZXhoYXVzdGVkIGFsbCBvZiB0aGUgY2hpbGRyZW4gXCJmcm9tXCJcbiAgICAgICAgICAgICAgICAvLyBub2Rlcy4gVGhlcmVmb3JlLCB3ZSB3aWxsIGp1c3QgYXBwZW5kIHRoZSBjdXJyZW50IFwidG8gbm9kZVwiXG4gICAgICAgICAgICAgICAgLy8gdG8gdGhlIGVuZFxuICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVBZGRlZChjdXJUb05vZGVDaGlsZCkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21FbC5hcHBlbmRDaGlsZChjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSAmJlxuICAgICAgICAgICAgICAgICAgICAoY3VyVG9Ob2RlSWQgfHwgY3VyVG9Ob2RlQ2hpbGQuZmlyc3RDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGVsZW1lbnQgdGhhdCB3YXMganVzdCBhZGRlZCB0byB0aGUgb3JpZ2luYWwgRE9NIG1heVxuICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHNvbWUgbmVzdGVkIGVsZW1lbnRzIHdpdGggYSBrZXkvSUQgdGhhdCBuZWVkcyB0byBiZVxuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaGVkIHVwIHdpdGggb3RoZXIgZWxlbWVudHMuIFdlJ2xsIGFkZCB0aGUgZWxlbWVudCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhIGxpc3Qgc28gdGhhdCB3ZSBjYW4gbGF0ZXIgcHJvY2VzcyB0aGUgbmVzdGVkIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBhbnkgdW5tYXRjaGVkIGtleWVkIGVsZW1lbnRzIHRoYXQgd2VyZVxuICAgICAgICAgICAgICAgICAgICAvLyBkaXNjYXJkZWRcbiAgICAgICAgICAgICAgICAgICAgbW92ZWRFbHMucHVzaChjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSB0b05leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgcHJvY2Vzc2VkIGFsbCBvZiB0aGUgXCJ0byBub2Rlc1wiLiBJZiBjdXJGcm9tTm9kZUNoaWxkIGlzXG4gICAgICAgICAgICAvLyBub24tbnVsbCB0aGVuIHdlIHN0aWxsIGhhdmUgc29tZSBmcm9tIG5vZGVzIGxlZnQgb3ZlciB0aGF0IG5lZWRcbiAgICAgICAgICAgIC8vIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgIHdoaWxlIChjdXJGcm9tTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgZnJvbU5leHRTaWJsaW5nID0gY3VyRnJvbU5vZGVDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICByZW1vdmVOb2RlKGN1ckZyb21Ob2RlQ2hpbGQsIGZyb21FbCwgYWxyZWFkeVZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3BlY2lhbEVsSGFuZGxlciA9IHNwZWNpYWxFbEhhbmRsZXJzW2Zyb21FbC5ub2RlTmFtZV07XG4gICAgICAgIGlmIChzcGVjaWFsRWxIYW5kbGVyKSB7XG4gICAgICAgICAgICBzcGVjaWFsRWxIYW5kbGVyKGZyb21FbCwgdG9FbCk7XG4gICAgICAgIH1cbiAgICB9IC8vIEVORDogbW9ycGhFbCguLi4pXG5cbiAgICB2YXIgbW9ycGhlZE5vZGUgPSBmcm9tTm9kZTtcbiAgICB2YXIgbW9ycGhlZE5vZGVUeXBlID0gbW9ycGhlZE5vZGUubm9kZVR5cGU7XG4gICAgdmFyIHRvTm9kZVR5cGUgPSB0b05vZGUubm9kZVR5cGU7XG5cbiAgICBpZiAoIWNoaWxkcmVuT25seSkge1xuICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGdpdmVuIHR3byBET00gbm9kZXMgdGhhdCBhcmUgbm90XG4gICAgICAgIC8vIGNvbXBhdGlibGUgKGUuZy4gPGRpdj4gLS0+IDxzcGFuPiBvciA8ZGl2PiAtLT4gVEVYVClcbiAgICAgICAgaWYgKG1vcnBoZWROb2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wYXJlTm9kZU5hbWVzKGZyb21Ob2RlLCB0b05vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChmcm9tTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW92ZUNoaWxkcmVuKGZyb21Ob2RlLCBjcmVhdGVFbGVtZW50TlModG9Ob2RlLm5vZGVOYW1lLCB0b05vZGUubmFtZXNwYWNlVVJJKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBHb2luZyBmcm9tIGFuIGVsZW1lbnQgbm9kZSB0byBhIHRleHQgbm9kZVxuICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gdG9Ob2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG1vcnBoZWROb2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IG1vcnBoZWROb2RlVHlwZSA9PT0gQ09NTUVOVF9OT0RFKSB7IC8vIFRleHQgb3IgY29tbWVudCBub2RlXG4gICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gbW9ycGhlZE5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgbW9ycGhlZE5vZGUubm9kZVZhbHVlID0gdG9Ob2RlLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRleHQgbm9kZSB0byBzb21ldGhpbmcgZWxzZVxuICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gdG9Ob2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1vcnBoZWROb2RlID09PSB0b05vZGUpIHtcbiAgICAgICAgLy8gVGhlIFwidG8gbm9kZVwiIHdhcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBcImZyb20gbm9kZVwiIHNvIHdlIGhhZCB0b1xuICAgICAgICAvLyB0b3NzIG91dCB0aGUgXCJmcm9tIG5vZGVcIiBhbmQgdXNlIHRoZSBcInRvIG5vZGVcIlxuICAgICAgICBvbk5vZGVEaXNjYXJkZWQoZnJvbU5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1vcnBoRWwobW9ycGhlZE5vZGUsIHRvTm9kZSwgZmFsc2UsIGNoaWxkcmVuT25seSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoYXQgd2Ugd2lsbCBkbyBoZXJlIGlzIHdhbGsgdGhlIHRyZWUgZm9yIHRoZSBET00gZWxlbWVudCB0aGF0IHdhc1xuICAgICAgICAgKiBtb3ZlZCBmcm9tIHRoZSB0YXJnZXQgRE9NIHRyZWUgdG8gdGhlIG9yaWdpbmFsIERPTSB0cmVlIGFuZCB3ZSB3aWxsXG4gICAgICAgICAqIGxvb2sgZm9yIGtleWVkIGVsZW1lbnRzIHRoYXQgY291bGQgYmUgbWF0Y2hlZCB0byBrZXllZCBlbGVtZW50cyB0aGF0XG4gICAgICAgICAqIHdlcmUgZWFybGllciBkaXNjYXJkZWQuICBJZiB3ZSBmaW5kIGEgbWF0Y2ggdGhlbiB3ZSB3aWxsIG1vdmUgdGhlXG4gICAgICAgICAqIHNhdmVkIGVsZW1lbnQgaW50byB0aGUgZmluYWwgRE9NIHRyZWUuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaGFuZGxlTW92ZWRFbCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSBlbC5maXJzdENoaWxkO1xuICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRTaWJsaW5nID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZ2V0Tm9kZUtleShjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2F2ZWRFbCA9IHNhdmVkRWxzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlZEVsICYmIGNvbXBhcmVOb2RlTmFtZXMoY3VyQ2hpbGQsIHNhdmVkRWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJDaGlsZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzYXZlZEVsLCBjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlOiBhbHJlYWR5IHZpc2l0ZWQgdGhlIHNhdmVkIGVsIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwoc2F2ZWRFbCwgY3VyQ2hpbGQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBuZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbXB0eShzYXZlZEVscykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJDaGlsZC5ub2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZU1vdmVkRWwoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gbmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGhlIGxvb3AgYmVsb3cgaXMgdXNlZCB0byBwb3NzaWJseSBtYXRjaCB1cCBhbnkgZGlzY2FyZGVkXG4gICAgICAgIC8vIGVsZW1lbnRzIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZSB3aXRoIGVsZW1lbmV0cyBmcm9tIHRoZVxuICAgICAgICAvLyB0YXJnZXQgdHJlZSB0aGF0IHdlcmUgbW92ZWQgb3ZlciB3aXRob3V0IHZpc2l0aW5nIHRoZWlyXG4gICAgICAgIC8vIGNoaWxkcmVuXG4gICAgICAgIGlmICghZW1wdHkoc2F2ZWRFbHMpKSB7XG4gICAgICAgICAgICBoYW5kbGVNb3ZlZEVsc0xvb3A6XG4gICAgICAgICAgICB3aGlsZSAobW92ZWRFbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vdmVkRWxzVGVtcCA9IG1vdmVkRWxzO1xuICAgICAgICAgICAgICAgIG1vdmVkRWxzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPG1vdmVkRWxzVGVtcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlTW92ZWRFbChtb3ZlZEVsc1RlbXBbaV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlcmUgYXJlIG5vIG1vcmUgdW5tYXRjaGVkIGVsZW1lbnRzIHNvIGNvbXBsZXRlbHkgZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgbG9vcFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgaGFuZGxlTW92ZWRFbHNMb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyZSB0aGUgXCJvbk5vZGVEaXNjYXJkZWRcIiBldmVudCBmb3IgYW55IHNhdmVkIGVsZW1lbnRzXG4gICAgICAgIC8vIHRoYXQgbmV2ZXIgZm91bmQgYSBuZXcgaG9tZSBpbiB0aGUgbW9ycGhlZCBET01cbiAgICAgICAgZm9yICh2YXIgc2F2ZWRFbElkIGluIHNhdmVkRWxzKSB7XG4gICAgICAgICAgICBpZiAoc2F2ZWRFbHMuaGFzT3duUHJvcGVydHkoc2F2ZWRFbElkKSkge1xuICAgICAgICAgICAgICAgIHZhciBzYXZlZEVsID0gc2F2ZWRFbHNbc2F2ZWRFbElkXTtcbiAgICAgICAgICAgICAgICBvbk5vZGVEaXNjYXJkZWQoc2F2ZWRFbCk7XG4gICAgICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMoc2F2ZWRFbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNoaWxkcmVuT25seSAmJiBtb3JwaGVkTm9kZSAhPT0gZnJvbU5vZGUgJiYgZnJvbU5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAvLyBJZiB3ZSBoYWQgdG8gc3dhcCBvdXQgdGhlIGZyb20gbm9kZSB3aXRoIGEgbmV3IG5vZGUgYmVjYXVzZSB0aGUgb2xkXG4gICAgICAgIC8vIG5vZGUgd2FzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIHRhcmdldCBub2RlIHRoZW4gd2UgbmVlZCB0b1xuICAgICAgICAvLyByZXBsYWNlIHRoZSBvbGQgRE9NIG5vZGUgaW4gdGhlIG9yaWdpbmFsIERPTSB0cmVlLiBUaGlzIGlzIG9ubHlcbiAgICAgICAgLy8gcG9zc2libGUgaWYgdGhlIG9yaWdpbmFsIERPTSBub2RlIHdhcyBwYXJ0IG9mIGEgRE9NIHRyZWUgd2hpY2hcbiAgICAgICAgLy8gd2Uga25vdyBpcyB0aGUgY2FzZSBpZiBpdCBoYXMgYSBwYXJlbnQgbm9kZS5cbiAgICAgICAgZnJvbU5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobW9ycGhlZE5vZGUsIGZyb21Ob2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbW9ycGhkb207XG4iLCIvKiBnbG9iYWwgTXV0YXRpb25PYnNlcnZlciAqL1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnZ2xvYmFsL2RvY3VtZW50JylcbnZhciB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93JylcbnZhciB3YXRjaCA9IE9iamVjdC5jcmVhdGUobnVsbClcbnZhciBLRVlfSUQgPSAnb25sb2FkaWQnICsgKG5ldyBEYXRlKCkgJSA5ZTYpLnRvU3RyaW5nKDM2KVxudmFyIEtFWV9BVFRSID0gJ2RhdGEtJyArIEtFWV9JRFxudmFyIElOREVYID0gMFxuXG5pZiAod2luZG93ICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKSB7XG4gIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICBpZiAoT2JqZWN0LmtleXMod2F0Y2gpLmxlbmd0aCA8IDEpIHJldHVyblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXV0YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobXV0YXRpb25zW2ldLmF0dHJpYnV0ZU5hbWUgPT09IEtFWV9BVFRSKSB7XG4gICAgICAgIGVhY2hBdHRyKG11dGF0aW9uc1tpXSwgdHVybm9uLCB0dXJub2ZmKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZWFjaE11dGF0aW9uKG11dGF0aW9uc1tpXS5yZW1vdmVkTm9kZXMsIHR1cm5vZmYpXG4gICAgICBlYWNoTXV0YXRpb24obXV0YXRpb25zW2ldLmFkZGVkTm9kZXMsIHR1cm5vbilcbiAgICB9XG4gIH0pXG4gIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgYXR0cmlidXRlRmlsdGVyOiBbS0VZX0FUVFJdXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25sb2FkIChlbCwgb24sIG9mZiwgY2FsbGVyKSB7XG4gIG9uID0gb24gfHwgZnVuY3Rpb24gKCkge31cbiAgb2ZmID0gb2ZmIHx8IGZ1bmN0aW9uICgpIHt9XG4gIGVsLnNldEF0dHJpYnV0ZShLRVlfQVRUUiwgJ28nICsgSU5ERVgpXG4gIHdhdGNoWydvJyArIElOREVYXSA9IFtvbiwgb2ZmLCAwLCBjYWxsZXIgfHwgb25sb2FkLmNhbGxlcl1cbiAgSU5ERVggKz0gMVxuICByZXR1cm4gZWxcbn1cblxuZnVuY3Rpb24gdHVybm9uIChpbmRleCwgZWwpIHtcbiAgaWYgKHdhdGNoW2luZGV4XVswXSAmJiB3YXRjaFtpbmRleF1bMl0gPT09IDApIHtcbiAgICB3YXRjaFtpbmRleF1bMF0oZWwpXG4gICAgd2F0Y2hbaW5kZXhdWzJdID0gMVxuICB9XG59XG5cbmZ1bmN0aW9uIHR1cm5vZmYgKGluZGV4LCBlbCkge1xuICBpZiAod2F0Y2hbaW5kZXhdWzFdICYmIHdhdGNoW2luZGV4XVsyXSA9PT0gMSkge1xuICAgIHdhdGNoW2luZGV4XVsxXShlbClcbiAgICB3YXRjaFtpbmRleF1bMl0gPSAwXG4gIH1cbn1cblxuZnVuY3Rpb24gZWFjaEF0dHIgKG11dGF0aW9uLCBvbiwgb2ZmKSB7XG4gIHZhciBuZXdWYWx1ZSA9IG11dGF0aW9uLnRhcmdldC5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpXG4gIGlmIChzYW1lT3JpZ2luKG11dGF0aW9uLm9sZFZhbHVlLCBuZXdWYWx1ZSkpIHtcbiAgICB3YXRjaFtuZXdWYWx1ZV0gPSB3YXRjaFttdXRhdGlvbi5vbGRWYWx1ZV1cbiAgICByZXR1cm5cbiAgfVxuICBpZiAod2F0Y2hbbXV0YXRpb24ub2xkVmFsdWVdKSB7XG4gICAgb2ZmKG11dGF0aW9uLm9sZFZhbHVlLCBtdXRhdGlvbi50YXJnZXQpXG4gIH1cbiAgaWYgKHdhdGNoW25ld1ZhbHVlXSkge1xuICAgIG9uKG5ld1ZhbHVlLCBtdXRhdGlvbi50YXJnZXQpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2FtZU9yaWdpbiAob2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gIGlmICghb2xkVmFsdWUgfHwgIW5ld1ZhbHVlKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHdhdGNoW29sZFZhbHVlXVszXSA9PT0gd2F0Y2hbbmV3VmFsdWVdWzNdXG59XG5cbmZ1bmN0aW9uIGVhY2hNdXRhdGlvbiAobm9kZXMsIGZuKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMod2F0Y2gpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobm9kZXNbaV0gJiYgbm9kZXNbaV0uZ2V0QXR0cmlidXRlICYmIG5vZGVzW2ldLmdldEF0dHJpYnV0ZShLRVlfQVRUUikpIHtcbiAgICAgIHZhciBvbmxvYWRpZCA9IG5vZGVzW2ldLmdldEF0dHJpYnV0ZShLRVlfQVRUUilcbiAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICBpZiAob25sb2FkaWQgPT09IGspIHtcbiAgICAgICAgICBmbihrLCBub2Rlc1tpXSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKG5vZGVzW2ldLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgZWFjaE11dGF0aW9uKG5vZGVzW2ldLmNoaWxkTm9kZXMsIGZuKVxuICAgIH1cbiAgfVxufVxuIiwiICAvKiBnbG9iYWxzIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAgICovXG5cbiAgdmFyIHBhdGh0b1JlZ2V4cCA9IHJlcXVpcmUoJ3BhdGgtdG8tcmVnZXhwJyk7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBleHBvcnRzLlxuICAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IHBhZ2U7XG5cbiAgLyoqXG4gICAqIERldGVjdCBjbGljayBldmVudFxuICAgKi9cbiAgdmFyIGNsaWNrRXZlbnQgPSAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBkb2N1bWVudCkgJiYgZG9jdW1lbnQub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJztcblxuICAvKipcbiAgICogVG8gd29yayBwcm9wZXJseSB3aXRoIHRoZSBVUkxcbiAgICogaGlzdG9yeS5sb2NhdGlvbiBnZW5lcmF0ZWQgcG9seWZpbGwgaW4gaHR0cHM6Ly9naXRodWIuY29tL2Rldm90ZS9IVE1MNS1IaXN0b3J5LUFQSVxuICAgKi9cblxuICB2YXIgbG9jYXRpb24gPSAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cpICYmICh3aW5kb3cuaGlzdG9yeS5sb2NhdGlvbiB8fCB3aW5kb3cubG9jYXRpb24pO1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtIGluaXRpYWwgZGlzcGF0Y2guXG4gICAqL1xuXG4gIHZhciBkaXNwYXRjaCA9IHRydWU7XG5cblxuICAvKipcbiAgICogRGVjb2RlIFVSTCBjb21wb25lbnRzIChxdWVyeSBzdHJpbmcsIHBhdGhuYW1lLCBoYXNoKS5cbiAgICogQWNjb21tb2RhdGVzIGJvdGggcmVndWxhciBwZXJjZW50IGVuY29kaW5nIGFuZCB4LXd3dy1mb3JtLXVybGVuY29kZWQgZm9ybWF0LlxuICAgKi9cbiAgdmFyIGRlY29kZVVSTENvbXBvbmVudHMgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBCYXNlIHBhdGguXG4gICAqL1xuXG4gIHZhciBiYXNlID0gJyc7XG5cbiAgLyoqXG4gICAqIFJ1bm5pbmcgZmxhZy5cbiAgICovXG5cbiAgdmFyIHJ1bm5pbmc7XG5cbiAgLyoqXG4gICAqIEhhc2hCYW5nIG9wdGlvblxuICAgKi9cblxuICB2YXIgaGFzaGJhbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJldmlvdXMgY29udGV4dCwgZm9yIGNhcHR1cmluZ1xuICAgKiBwYWdlIGV4aXQgZXZlbnRzLlxuICAgKi9cblxuICB2YXIgcHJldkNvbnRleHQ7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGBwYXRoYCB3aXRoIGNhbGxiYWNrIGBmbigpYCxcbiAgICogb3Igcm91dGUgYHBhdGhgLCBvciByZWRpcmVjdGlvbixcbiAgICogb3IgYHBhZ2Uuc3RhcnQoKWAuXG4gICAqXG4gICAqICAgcGFnZShmbik7XG4gICAqICAgcGFnZSgnKicsIGZuKTtcbiAgICogICBwYWdlKCcvdXNlci86aWQnLCBsb2FkLCB1c2VyKTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCwgeyBzb21lOiAndGhpbmcnIH0pO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkKTtcbiAgICogICBwYWdlKCcvZnJvbScsICcvdG8nKVxuICAgKiAgIHBhZ2UoKTtcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8IUZ1bmN0aW9ufCFPYmplY3R9IHBhdGhcbiAgICogQHBhcmFtIHtGdW5jdGlvbj19IGZuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHBhZ2UocGF0aCwgZm4pIHtcbiAgICAvLyA8Y2FsbGJhY2s+XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBwYXRoKSB7XG4gICAgICByZXR1cm4gcGFnZSgnKicsIHBhdGgpO1xuICAgIH1cblxuICAgIC8vIHJvdXRlIDxwYXRoPiB0byA8Y2FsbGJhY2sgLi4uPlxuICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm4pIHtcbiAgICAgIHZhciByb3V0ZSA9IG5ldyBSb3V0ZSgvKiogQHR5cGUge3N0cmluZ30gKi8gKHBhdGgpKTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHBhZ2UuY2FsbGJhY2tzLnB1c2gocm91dGUubWlkZGxld2FyZShhcmd1bWVudHNbaV0pKTtcbiAgICAgIH1cbiAgICAgIC8vIHNob3cgPHBhdGg+IHdpdGggW3N0YXRlXVxuICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBwYXRoKSB7XG4gICAgICBwYWdlWydzdHJpbmcnID09PSB0eXBlb2YgZm4gPyAncmVkaXJlY3QnIDogJ3Nob3cnXShwYXRoLCBmbik7XG4gICAgICAvLyBzdGFydCBbb3B0aW9uc11cbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZS5zdGFydChwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25zLlxuICAgKi9cblxuICBwYWdlLmNhbGxiYWNrcyA9IFtdO1xuICBwYWdlLmV4aXRzID0gW107XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgcGF0aCBiZWluZyBwcm9jZXNzZWRcbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gIHBhZ2UuY3VycmVudCA9ICcnO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGFnZXMgbmF2aWdhdGVkIHRvLlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKlxuICAgKiAgICAgcGFnZS5sZW4gPT0gMDtcbiAgICogICAgIHBhZ2UoJy9sb2dpbicpO1xuICAgKiAgICAgcGFnZS5sZW4gPT0gMTtcbiAgICovXG5cbiAgcGFnZS5sZW4gPSAwO1xuXG4gIC8qKlxuICAgKiBHZXQgb3Igc2V0IGJhc2VwYXRoIHRvIGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5iYXNlID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGlmICgwID09PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYmFzZTtcbiAgICBiYXNlID0gcGF0aDtcbiAgfTtcblxuICAvKipcbiAgICogQmluZCB3aXRoIHRoZSBnaXZlbiBgb3B0aW9uc2AuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqICAgIC0gYGNsaWNrYCBiaW5kIHRvIGNsaWNrIGV2ZW50cyBbdHJ1ZV1cbiAgICogICAgLSBgcG9wc3RhdGVgIGJpbmQgdG8gcG9wc3RhdGUgW3RydWVdXG4gICAqICAgIC0gYGRpc3BhdGNoYCBwZXJmb3JtIGluaXRpYWwgZGlzcGF0Y2ggW3RydWVdXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc3RhcnQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKHJ1bm5pbmcpIHJldHVybjtcbiAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGlzcGF0Y2gpIGRpc3BhdGNoID0gZmFsc2U7XG4gICAgaWYgKGZhbHNlID09PSBvcHRpb25zLmRlY29kZVVSTENvbXBvbmVudHMpIGRlY29kZVVSTENvbXBvbmVudHMgPSBmYWxzZTtcbiAgICBpZiAoZmFsc2UgIT09IG9wdGlvbnMucG9wc3RhdGUpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIG9ucG9wc3RhdGUsIGZhbHNlKTtcbiAgICBpZiAoZmFsc2UgIT09IG9wdGlvbnMuY2xpY2spIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudCwgb25jbGljaywgZmFsc2UpO1xuICAgIH1cbiAgICBpZiAodHJ1ZSA9PT0gb3B0aW9ucy5oYXNoYmFuZykgaGFzaGJhbmcgPSB0cnVlO1xuICAgIGlmICghZGlzcGF0Y2gpIHJldHVybjtcbiAgICB2YXIgdXJsID0gKGhhc2hiYW5nICYmIH5sb2NhdGlvbi5oYXNoLmluZGV4T2YoJyMhJykpID8gbG9jYXRpb24uaGFzaC5zdWJzdHIoMikgKyBsb2NhdGlvbi5zZWFyY2ggOiBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCArIGxvY2F0aW9uLmhhc2g7XG4gICAgcGFnZS5yZXBsYWNlKHVybCwgbnVsbCwgdHJ1ZSwgZGlzcGF0Y2gpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmJpbmQgY2xpY2sgYW5kIHBvcHN0YXRlIGV2ZW50IGhhbmRsZXJzLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXJ1bm5pbmcpIHJldHVybjtcbiAgICBwYWdlLmN1cnJlbnQgPSAnJztcbiAgICBwYWdlLmxlbiA9IDA7XG4gICAgcnVubmluZyA9IGZhbHNlO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudCwgb25jbGljaywgZmFsc2UpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIG9ucG9wc3RhdGUsIGZhbHNlKTtcbiAgfTtcblxuICAvKipcbiAgICogU2hvdyBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBkaXNwYXRjaFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBwdXNoXG4gICAqIEByZXR1cm4geyFDb250ZXh0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnNob3cgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSwgZGlzcGF0Y2gsIHB1c2gpIHtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIHBhZ2UuY3VycmVudCA9IGN0eC5wYXRoO1xuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICBpZiAoZmFsc2UgIT09IGN0eC5oYW5kbGVkICYmIGZhbHNlICE9PSBwdXNoKSBjdHgucHVzaFN0YXRlKCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogR29lcyBiYWNrIGluIHRoZSBoaXN0b3J5XG4gICAqIEJhY2sgc2hvdWxkIGFsd2F5cyBsZXQgdGhlIGN1cnJlbnQgcm91dGUgcHVzaCBzdGF0ZSBhbmQgdGhlbiBnbyBiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIGZhbGxiYWNrIHBhdGggdG8gZ28gYmFjayBpZiBubyBtb3JlIGhpc3RvcnkgZXhpc3RzLCBpZiB1bmRlZmluZWQgZGVmYXVsdHMgdG8gcGFnZS5iYXNlXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5iYWNrID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAocGFnZS5sZW4gPiAwKSB7XG4gICAgICAvLyB0aGlzIG1heSBuZWVkIG1vcmUgdGVzdGluZyB0byBzZWUgaWYgYWxsIGJyb3dzZXJzXG4gICAgICAvLyB3YWl0IGZvciB0aGUgbmV4dCB0aWNrIHRvIGdvIGJhY2sgaW4gaGlzdG9yeVxuICAgICAgaGlzdG9yeS5iYWNrKCk7XG4gICAgICBwYWdlLmxlbi0tO1xuICAgIH0gZWxzZSBpZiAocGF0aCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGFnZS5zaG93KHBhdGgsIHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1lbHNle1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGFnZS5zaG93KGJhc2UsIHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciByb3V0ZSB0byByZWRpcmVjdCBmcm9tIG9uZSBwYXRoIHRvIG90aGVyXG4gICAqIG9yIGp1c3QgcmVkaXJlY3QgdG8gYW5vdGhlciByb3V0ZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZnJvbSAtIGlmIHBhcmFtICd0bycgaXMgdW5kZWZpbmVkIHJlZGlyZWN0cyB0byAnZnJvbSdcbiAgICogQHBhcmFtIHtzdHJpbmc9fSB0b1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgcGFnZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gICAgLy8gRGVmaW5lIHJvdXRlIGZyb20gYSBwYXRoIHRvIGFub3RoZXJcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBmcm9tICYmICdzdHJpbmcnID09PSB0eXBlb2YgdG8pIHtcbiAgICAgIHBhZ2UoZnJvbSwgZnVuY3Rpb24oZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHBhZ2UucmVwbGFjZSgvKiogQHR5cGUgeyFzdHJpbmd9ICovICh0bykpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIHRoZSBwdXNoIHN0YXRlIGFuZCByZXBsYWNlIGl0IHdpdGggYW5vdGhlclxuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZyb20gJiYgJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiB0bykge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGFnZS5yZXBsYWNlKGZyb20pO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGluaXRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZGlzcGF0Y2hcbiAgICogQHJldHVybiB7IUNvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG5cbiAgcGFnZS5yZXBsYWNlID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGluaXQsIGRpc3BhdGNoKSB7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBwYWdlLmN1cnJlbnQgPSBjdHgucGF0aDtcbiAgICBjdHguaW5pdCA9IGluaXQ7XG4gICAgY3R4LnNhdmUoKTsgLy8gc2F2ZSBiZWZvcmUgZGlzcGF0Y2hpbmcsIHdoaWNoIG1heSByZWRpcmVjdFxuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCB0aGUgZ2l2ZW4gYGN0eGAuXG4gICAqXG4gICAqIEBwYXJhbSB7Q29udGV4dH0gY3R4XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgcGFnZS5kaXNwYXRjaCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgIHZhciBwcmV2ID0gcHJldkNvbnRleHQsXG4gICAgICBpID0gMCxcbiAgICAgIGogPSAwO1xuXG4gICAgcHJldkNvbnRleHQgPSBjdHg7XG5cbiAgICBmdW5jdGlvbiBuZXh0RXhpdCgpIHtcbiAgICAgIHZhciBmbiA9IHBhZ2UuZXhpdHNbaisrXTtcbiAgICAgIGlmICghZm4pIHJldHVybiBuZXh0RW50ZXIoKTtcbiAgICAgIGZuKHByZXYsIG5leHRFeGl0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0RW50ZXIoKSB7XG4gICAgICB2YXIgZm4gPSBwYWdlLmNhbGxiYWNrc1tpKytdO1xuXG4gICAgICBpZiAoY3R4LnBhdGggIT09IHBhZ2UuY3VycmVudCkge1xuICAgICAgICBjdHguaGFuZGxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIWZuKSByZXR1cm4gdW5oYW5kbGVkKGN0eCk7XG4gICAgICBmbihjdHgsIG5leHRFbnRlcik7XG4gICAgfVxuXG4gICAgaWYgKHByZXYpIHtcbiAgICAgIG5leHRFeGl0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRFbnRlcigpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVW5oYW5kbGVkIGBjdHhgLiBXaGVuIGl0J3Mgbm90IHRoZSBpbml0aWFsXG4gICAqIHBvcHN0YXRlIHRoZW4gcmVkaXJlY3QuIElmIHlvdSB3aXNoIHRvIGhhbmRsZVxuICAgKiA0MDRzIG9uIHlvdXIgb3duIHVzZSBgcGFnZSgnKicsIGNhbGxiYWNrKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Q29udGV4dH0gY3R4XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gdW5oYW5kbGVkKGN0eCkge1xuICAgIGlmIChjdHguaGFuZGxlZCkgcmV0dXJuO1xuICAgIHZhciBjdXJyZW50O1xuXG4gICAgaWYgKGhhc2hiYW5nKSB7XG4gICAgICBjdXJyZW50ID0gYmFzZSArIGxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIyEnLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaDtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudCA9PT0gY3R4LmNhbm9uaWNhbFBhdGgpIHJldHVybjtcbiAgICBwYWdlLnN0b3AoKTtcbiAgICBjdHguaGFuZGxlZCA9IGZhbHNlO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBjdHguY2Fub25pY2FsUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBleGl0IHJvdXRlIG9uIGBwYXRoYCB3aXRoXG4gICAqIGNhbGxiYWNrIGBmbigpYCwgd2hpY2ggd2lsbCBiZSBjYWxsZWRcbiAgICogb24gdGhlIHByZXZpb3VzIGNvbnRleHQgd2hlbiBhIG5ld1xuICAgKiBwYWdlIGlzIHZpc2l0ZWQuXG4gICAqL1xuICBwYWdlLmV4aXQgPSBmdW5jdGlvbihwYXRoLCBmbikge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHBhZ2UuZXhpdCgnKicsIHBhdGgpO1xuICAgIH1cblxuICAgIHZhciByb3V0ZSA9IG5ldyBSb3V0ZShwYXRoKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgcGFnZS5leGl0cy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgVVJMIGVuY29kaW5nIGZyb20gdGhlIGdpdmVuIGBzdHJgLlxuICAgKiBBY2NvbW1vZGF0ZXMgd2hpdGVzcGFjZSBpbiBib3RoIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgKiBhbmQgcmVndWxhciBwZXJjZW50LWVuY29kZWQgZm9ybS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbCAtIFVSTCBjb21wb25lbnQgdG8gZGVjb2RlXG4gICAqL1xuICBmdW5jdGlvbiBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykgeyByZXR1cm4gdmFsOyB9XG4gICAgcmV0dXJuIGRlY29kZVVSTENvbXBvbmVudHMgPyBkZWNvZGVVUklDb21wb25lbnQodmFsLnJlcGxhY2UoL1xcKy9nLCAnICcpKSA6IHZhbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGEgbmV3IFwicmVxdWVzdFwiIGBDb250ZXh0YFxuICAgKiB3aXRoIHRoZSBnaXZlbiBgcGF0aGAgYW5kIG9wdGlvbmFsIGluaXRpYWwgYHN0YXRlYC5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gQ29udGV4dChwYXRoLCBzdGF0ZSkge1xuICAgIGlmICgnLycgPT09IHBhdGhbMF0gJiYgMCAhPT0gcGF0aC5pbmRleE9mKGJhc2UpKSBwYXRoID0gYmFzZSArIChoYXNoYmFuZyA/ICcjIScgOiAnJykgKyBwYXRoO1xuICAgIHZhciBpID0gcGF0aC5pbmRleE9mKCc/Jyk7XG5cbiAgICB0aGlzLmNhbm9uaWNhbFBhdGggPSBwYXRoO1xuICAgIHRoaXMucGF0aCA9IHBhdGgucmVwbGFjZShiYXNlLCAnJykgfHwgJy8nO1xuICAgIGlmIChoYXNoYmFuZykgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UoJyMhJywgJycpIHx8ICcvJztcblxuICAgIHRoaXMudGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgdGhpcy5zdGF0ZS5wYXRoID0gcGF0aDtcbiAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gfmkgPyBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KHBhdGguc2xpY2UoaSArIDEpKSA6ICcnO1xuICAgIHRoaXMucGF0aG5hbWUgPSBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KH5pID8gcGF0aC5zbGljZSgwLCBpKSA6IHBhdGgpO1xuICAgIHRoaXMucGFyYW1zID0ge307XG5cbiAgICAvLyBmcmFnbWVudFxuICAgIHRoaXMuaGFzaCA9ICcnO1xuICAgIGlmICghaGFzaGJhbmcpIHtcbiAgICAgIGlmICghfnRoaXMucGF0aC5pbmRleE9mKCcjJykpIHJldHVybjtcbiAgICAgIHZhciBwYXJ0cyA9IHRoaXMucGF0aC5zcGxpdCgnIycpO1xuICAgICAgdGhpcy5wYXRoID0gcGFydHNbMF07XG4gICAgICB0aGlzLmhhc2ggPSBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KHBhcnRzWzFdKSB8fCAnJztcbiAgICAgIHRoaXMucXVlcnlzdHJpbmcgPSB0aGlzLnF1ZXJ5c3RyaW5nLnNwbGl0KCcjJylbMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgQ29udGV4dGAuXG4gICAqL1xuXG4gIHBhZ2UuQ29udGV4dCA9IENvbnRleHQ7XG5cbiAgLyoqXG4gICAqIFB1c2ggc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBwYWdlLmxlbisrO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIGhhc2hiYW5nICYmIHRoaXMucGF0aCAhPT0gJy8nID8gJyMhJyArIHRoaXMucGF0aCA6IHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNhdmUgdGhlIGNvbnRleHQgc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIENvbnRleHQucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCBoYXNoYmFuZyAmJiB0aGlzLnBhdGggIT09ICcvJyA/ICcjIScgKyB0aGlzLnBhdGggOiB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGBSb3V0ZWAgd2l0aCB0aGUgZ2l2ZW4gSFRUUCBgcGF0aGAsXG4gICAqIGFuZCBhbiBhcnJheSBvZiBgY2FsbGJhY2tzYCBhbmQgYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgIC0gYHNlbnNpdGl2ZWAgICAgZW5hYmxlIGNhc2Utc2Vuc2l0aXZlIHJvdXRlc1xuICAgKiAgIC0gYHN0cmljdGAgICAgICAgZW5hYmxlIHN0cmljdCBtYXRjaGluZyBmb3IgdHJhaWxpbmcgc2xhc2hlc1xuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBSb3V0ZShwYXRoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5wYXRoID0gKHBhdGggPT09ICcqJykgPyAnKC4qKScgOiBwYXRoO1xuICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG4gICAgdGhpcy5yZWdleHAgPSBwYXRodG9SZWdleHAodGhpcy5wYXRoLFxuICAgICAgdGhpcy5rZXlzID0gW10sXG4gICAgICBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYFJvdXRlYC5cbiAgICovXG5cbiAgcGFnZS5Sb3V0ZSA9IFJvdXRlO1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gcm91dGUgbWlkZGxld2FyZSB3aXRoXG4gICAqIHRoZSBnaXZlbiBjYWxsYmFjayBgZm4oKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWlkZGxld2FyZSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgsIG5leHQpIHtcbiAgICAgIGlmIChzZWxmLm1hdGNoKGN0eC5wYXRoLCBjdHgucGFyYW1zKSkgcmV0dXJuIGZuKGN0eCwgbmV4dCk7XG4gICAgICBuZXh0KCk7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhpcyByb3V0ZSBtYXRjaGVzIGBwYXRoYCwgaWYgc29cbiAgICogcG9wdWxhdGUgYHBhcmFtc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFJvdXRlLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKHBhdGgsIHBhcmFtcykge1xuICAgIHZhciBrZXlzID0gdGhpcy5rZXlzLFxuICAgICAgcXNJbmRleCA9IHBhdGguaW5kZXhPZignPycpLFxuICAgICAgcGF0aG5hbWUgPSB+cXNJbmRleCA/IHBhdGguc2xpY2UoMCwgcXNJbmRleCkgOiBwYXRoLFxuICAgICAgbSA9IHRoaXMucmVnZXhwLmV4ZWMoZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lKSk7XG5cbiAgICBpZiAoIW0pIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG4gICAgICB2YXIgdmFsID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChtW2ldKTtcbiAgICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCB8fCAhKGhhc093blByb3BlcnR5LmNhbGwocGFyYW1zLCBrZXkubmFtZSkpKSB7XG4gICAgICAgIHBhcmFtc1trZXkubmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvKipcbiAgICogSGFuZGxlIFwicG9wdWxhdGVcIiBldmVudHMuXG4gICAqL1xuXG4gIHZhciBvbnBvcHN0YXRlID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9hZGVkID0gZmFsc2U7XG4gICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2Ygd2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICBsb2FkZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiBvbnBvcHN0YXRlKGUpIHtcbiAgICAgIGlmICghbG9hZGVkKSByZXR1cm47XG4gICAgICBpZiAoZS5zdGF0ZSkge1xuICAgICAgICB2YXIgcGF0aCA9IGUuc3RhdGUucGF0aDtcbiAgICAgICAgcGFnZS5yZXBsYWNlKHBhdGgsIGUuc3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZS5zaG93KGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uaGFzaCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpO1xuICAvKipcbiAgICogSGFuZGxlIFwiY2xpY2tcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uY2xpY2soZSkge1xuXG4gICAgaWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cbiAgICBpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cblxuICAgIC8vIGVuc3VyZSBsaW5rXG4gICAgLy8gdXNlIHNoYWRvdyBkb20gd2hlbiBhdmFpbGFibGVcbiAgICB2YXIgZWwgPSBlLnBhdGggPyBlLnBhdGhbMF0gOiBlLnRhcmdldDtcbiAgICB3aGlsZSAoZWwgJiYgJ0EnICE9PSBlbC5ub2RlTmFtZSkgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmICghZWwgfHwgJ0EnICE9PSBlbC5ub2RlTmFtZSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIElnbm9yZSBpZiB0YWcgaGFzXG4gICAgLy8gMS4gXCJkb3dubG9hZFwiIGF0dHJpYnV0ZVxuICAgIC8vIDIuIHJlbD1cImV4dGVybmFsXCIgYXR0cmlidXRlXG4gICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKSByZXR1cm47XG5cbiAgICAvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcbiAgICB2YXIgbGluayA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmICghaGFzaGJhbmcgJiYgZWwucGF0aG5hbWUgPT09IGxvY2F0aW9uLnBhdGhuYW1lICYmIChlbC5oYXNoIHx8ICcjJyA9PT0gbGluaykpIHJldHVybjtcblxuXG5cbiAgICAvLyBDaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuICAgIGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuICAgIC8vIGNoZWNrIHRhcmdldFxuICAgIGlmIChlbC50YXJnZXQpIHJldHVybjtcblxuICAgIC8vIHgtb3JpZ2luXG4gICAgaWYgKCFzYW1lT3JpZ2luKGVsLmhyZWYpKSByZXR1cm47XG5cblxuXG4gICAgLy8gcmVidWlsZCBwYXRoXG4gICAgdmFyIHBhdGggPSBlbC5wYXRobmFtZSArIGVsLnNlYXJjaCArIChlbC5oYXNoIHx8ICcnKTtcblxuICAgIC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcGF0aC5tYXRjaCgvXlxcL1thLXpBLVpdOlxcLy8pKSB7XG4gICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgJy8nKTtcbiAgICB9XG5cbiAgICAvLyBzYW1lIHBhZ2VcbiAgICB2YXIgb3JpZyA9IHBhdGg7XG5cbiAgICBpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG4gICAgICBwYXRoID0gcGF0aC5zdWJzdHIoYmFzZS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmIChoYXNoYmFuZykgcGF0aCA9IHBhdGgucmVwbGFjZSgnIyEnLCAnJyk7XG5cbiAgICBpZiAoYmFzZSAmJiBvcmlnID09PSBwYXRoKSByZXR1cm47XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcGFnZS5zaG93KG9yaWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGJ1dHRvbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gd2hpY2goZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICByZXR1cm4gbnVsbCA9PT0gZS53aGljaCA/IGUuYnV0dG9uIDogZS53aGljaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgaHJlZmAgaXMgdGhlIHNhbWUgb3JpZ2luLlxuICAgKi9cblxuICBmdW5jdGlvbiBzYW1lT3JpZ2luKGhyZWYpIHtcbiAgICB2YXIgb3JpZ2luID0gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdG5hbWU7XG4gICAgaWYgKGxvY2F0aW9uLnBvcnQpIG9yaWdpbiArPSAnOicgKyBsb2NhdGlvbi5wb3J0O1xuICAgIHJldHVybiAoaHJlZiAmJiAoMCA9PT0gaHJlZi5pbmRleE9mKG9yaWdpbikpKTtcbiAgfVxuXG4gIHBhZ2Uuc2FtZU9yaWdpbiA9IHNhbWVPcmlnaW47XG4iLCJ2YXIgaXNhcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG4vKipcbiAqIEV4cG9zZSBgcGF0aFRvUmVnZXhwYC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBwYXRoVG9SZWdleHBcbm1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2Vcbm1vZHVsZS5leHBvcnRzLmNvbXBpbGUgPSBjb21waWxlXG5tb2R1bGUuZXhwb3J0cy50b2tlbnNUb0Z1bmN0aW9uID0gdG9rZW5zVG9GdW5jdGlvblxubW9kdWxlLmV4cG9ydHMudG9rZW5zVG9SZWdFeHAgPSB0b2tlbnNUb1JlZ0V4cFxuXG4vKipcbiAqIFRoZSBtYWluIHBhdGggbWF0Y2hpbmcgcmVnZXhwIHV0aWxpdHkuXG4gKlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xudmFyIFBBVEhfUkVHRVhQID0gbmV3IFJlZ0V4cChbXG4gIC8vIE1hdGNoIGVzY2FwZWQgY2hhcmFjdGVycyB0aGF0IHdvdWxkIG90aGVyd2lzZSBhcHBlYXIgaW4gZnV0dXJlIG1hdGNoZXMuXG4gIC8vIFRoaXMgYWxsb3dzIHRoZSB1c2VyIHRvIGVzY2FwZSBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCB3b24ndCB0cmFuc2Zvcm0uXG4gICcoXFxcXFxcXFwuKScsXG4gIC8vIE1hdGNoIEV4cHJlc3Mtc3R5bGUgcGFyYW1ldGVycyBhbmQgdW4tbmFtZWQgcGFyYW1ldGVycyB3aXRoIGEgcHJlZml4XG4gIC8vIGFuZCBvcHRpb25hbCBzdWZmaXhlcy4gTWF0Y2hlcyBhcHBlYXIgYXM6XG4gIC8vXG4gIC8vIFwiLzp0ZXN0KFxcXFxkKyk/XCIgPT4gW1wiL1wiLCBcInRlc3RcIiwgXCJcXGQrXCIsIHVuZGVmaW5lZCwgXCI/XCIsIHVuZGVmaW5lZF1cbiAgLy8gXCIvcm91dGUoXFxcXGQrKVwiICA9PiBbdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgXCJcXGQrXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVxuICAvLyBcIi8qXCIgICAgICAgICAgICA9PiBbXCIvXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgXCIqXCJdXG4gICcoW1xcXFwvLl0pPyg/Oig/OlxcXFw6KFxcXFx3KykoPzpcXFxcKCgoPzpcXFxcXFxcXC58W14oKV0pKylcXFxcKSk/fFxcXFwoKCg/OlxcXFxcXFxcLnxbXigpXSkrKVxcXFwpKShbKyo/XSk/fChcXFxcKikpJ1xuXS5qb2luKCd8JyksICdnJylcblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBmb3IgdGhlIHJhdyB0b2tlbnMuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5mdW5jdGlvbiBwYXJzZSAoc3RyKSB7XG4gIHZhciB0b2tlbnMgPSBbXVxuICB2YXIga2V5ID0gMFxuICB2YXIgaW5kZXggPSAwXG4gIHZhciBwYXRoID0gJydcbiAgdmFyIHJlc1xuXG4gIHdoaWxlICgocmVzID0gUEFUSF9SRUdFWFAuZXhlYyhzdHIpKSAhPSBudWxsKSB7XG4gICAgdmFyIG0gPSByZXNbMF1cbiAgICB2YXIgZXNjYXBlZCA9IHJlc1sxXVxuICAgIHZhciBvZmZzZXQgPSByZXMuaW5kZXhcbiAgICBwYXRoICs9IHN0ci5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbS5sZW5ndGhcblxuICAgIC8vIElnbm9yZSBhbHJlYWR5IGVzY2FwZWQgc2VxdWVuY2VzLlxuICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICBwYXRoICs9IGVzY2FwZWRbMV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgLy8gUHVzaCB0aGUgY3VycmVudCBwYXRoIG9udG8gdGhlIHRva2Vucy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdG9rZW5zLnB1c2gocGF0aClcbiAgICAgIHBhdGggPSAnJ1xuICAgIH1cblxuICAgIHZhciBwcmVmaXggPSByZXNbMl1cbiAgICB2YXIgbmFtZSA9IHJlc1szXVxuICAgIHZhciBjYXB0dXJlID0gcmVzWzRdXG4gICAgdmFyIGdyb3VwID0gcmVzWzVdXG4gICAgdmFyIHN1ZmZpeCA9IHJlc1s2XVxuICAgIHZhciBhc3RlcmlzayA9IHJlc1s3XVxuXG4gICAgdmFyIHJlcGVhdCA9IHN1ZmZpeCA9PT0gJysnIHx8IHN1ZmZpeCA9PT0gJyonXG4gICAgdmFyIG9wdGlvbmFsID0gc3VmZml4ID09PSAnPycgfHwgc3VmZml4ID09PSAnKidcbiAgICB2YXIgZGVsaW1pdGVyID0gcHJlZml4IHx8ICcvJ1xuICAgIHZhciBwYXR0ZXJuID0gY2FwdHVyZSB8fCBncm91cCB8fCAoYXN0ZXJpc2sgPyAnLionIDogJ1teJyArIGRlbGltaXRlciArICddKz8nKVxuXG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgbmFtZTogbmFtZSB8fCBrZXkrKyxcbiAgICAgIHByZWZpeDogcHJlZml4IHx8ICcnLFxuICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsXG4gICAgICBvcHRpb25hbDogb3B0aW9uYWwsXG4gICAgICByZXBlYXQ6IHJlcGVhdCxcbiAgICAgIHBhdHRlcm46IGVzY2FwZUdyb3VwKHBhdHRlcm4pXG4gICAgfSlcbiAgfVxuXG4gIC8vIE1hdGNoIGFueSBjaGFyYWN0ZXJzIHN0aWxsIHJlbWFpbmluZy5cbiAgaWYgKGluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgIHBhdGggKz0gc3RyLnN1YnN0cihpbmRleClcbiAgfVxuXG4gIC8vIElmIHRoZSBwYXRoIGV4aXN0cywgcHVzaCBpdCBvbnRvIHRoZSBlbmQuXG4gIGlmIChwYXRoKSB7XG4gICAgdG9rZW5zLnB1c2gocGF0aClcbiAgfVxuXG4gIHJldHVybiB0b2tlbnNcbn1cblxuLyoqXG4gKiBDb21waWxlIGEgc3RyaW5nIHRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gZm9yIHRoZSBwYXRoLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gICBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBjb21waWxlIChzdHIpIHtcbiAgcmV0dXJuIHRva2Vuc1RvRnVuY3Rpb24ocGFyc2Uoc3RyKSlcbn1cblxuLyoqXG4gKiBFeHBvc2UgYSBtZXRob2QgZm9yIHRyYW5zZm9ybWluZyB0b2tlbnMgaW50byB0aGUgcGF0aCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gdG9rZW5zVG9GdW5jdGlvbiAodG9rZW5zKSB7XG4gIC8vIENvbXBpbGUgYWxsIHRoZSB0b2tlbnMgaW50byByZWdleHBzLlxuICB2YXIgbWF0Y2hlcyA9IG5ldyBBcnJheSh0b2tlbnMubGVuZ3RoKVxuXG4gIC8vIENvbXBpbGUgYWxsIHRoZSBwYXR0ZXJucyBiZWZvcmUgY29tcGlsYXRpb24uXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiB0b2tlbnNbaV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBtYXRjaGVzW2ldID0gbmV3IFJlZ0V4cCgnXicgKyB0b2tlbnNbaV0ucGF0dGVybiArICckJylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBwYXRoID0gJydcbiAgICB2YXIgZGF0YSA9IG9iaiB8fCB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXVxuXG4gICAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoICs9IHRva2VuXG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdmFyIHZhbHVlID0gZGF0YVt0b2tlbi5uYW1lXVxuICAgICAgdmFyIHNlZ21lbnRcblxuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIGJlIGRlZmluZWQnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc2FycmF5KHZhbHVlKSkge1xuICAgICAgICBpZiAoIXRva2VuLnJlcGVhdCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbm90IHJlcGVhdCwgYnV0IHJlY2VpdmVkIFwiJyArIHZhbHVlICsgJ1wiJylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbm90IGJlIGVtcHR5JylcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgc2VnbWVudCA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtqXSlcblxuICAgICAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbGwgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBtYXRjaCBcIicgKyB0b2tlbi5wYXR0ZXJuICsgJ1wiLCBidXQgcmVjZWl2ZWQgXCInICsgc2VnbWVudCArICdcIicpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcGF0aCArPSAoaiA9PT0gMCA/IHRva2VuLnByZWZpeCA6IHRva2VuLmRlbGltaXRlcikgKyBzZWdtZW50XG4gICAgICAgIH1cblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBzZWdtZW50ID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKVxuXG4gICAgICBpZiAoIW1hdGNoZXNbaV0udGVzdChzZWdtZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBcIicgKyBzZWdtZW50ICsgJ1wiJylcbiAgICAgIH1cblxuICAgICAgcGF0aCArPSB0b2tlbi5wcmVmaXggKyBzZWdtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhcbiAgfVxufVxuXG4vKipcbiAqIEVzY2FwZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcL10pL2csICdcXFxcJDEnKVxufVxuXG4vKipcbiAqIEVzY2FwZSB0aGUgY2FwdHVyaW5nIGdyb3VwIGJ5IGVzY2FwaW5nIHNwZWNpYWwgY2hhcmFjdGVycyBhbmQgbWVhbmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGdyb3VwXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUdyb3VwIChncm91cCkge1xuICByZXR1cm4gZ3JvdXAucmVwbGFjZSgvKFs9ITokXFwvKCldKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBBdHRhY2ggdGhlIGtleXMgYXMgYSBwcm9wZXJ0eSBvZiB0aGUgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge1JlZ0V4cH0gcmVcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBhdHRhY2hLZXlzIChyZSwga2V5cykge1xuICByZS5rZXlzID0ga2V5c1xuICByZXR1cm4gcmVcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZsYWdzIGZvciBhIHJlZ2V4cCBmcm9tIHRoZSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBmbGFncyAob3B0aW9ucykge1xuICByZXR1cm4gb3B0aW9ucy5zZW5zaXRpdmUgPyAnJyA6ICdpJ1xufVxuXG4vKipcbiAqIFB1bGwgb3V0IGtleXMgZnJvbSBhIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiByZWdleHBUb1JlZ2V4cCAocGF0aCwga2V5cykge1xuICAvLyBVc2UgYSBuZWdhdGl2ZSBsb29rYWhlYWQgdG8gbWF0Y2ggb25seSBjYXB0dXJpbmcgZ3JvdXBzLlxuICB2YXIgZ3JvdXBzID0gcGF0aC5zb3VyY2UubWF0Y2goL1xcKCg/IVxcPykvZylcblxuICBpZiAoZ3JvdXBzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGksXG4gICAgICAgIHByZWZpeDogbnVsbCxcbiAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICBvcHRpb25hbDogZmFsc2UsXG4gICAgICAgIHJlcGVhdDogZmFsc2UsXG4gICAgICAgIHBhdHRlcm46IG51bGxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocGF0aCwga2V5cylcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gYXJyYXkgaW50byBhIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIGFycmF5VG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnRzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBwYXJ0cy5wdXNoKHBhdGhUb1JlZ2V4cChwYXRoW2ldLCBrZXlzLCBvcHRpb25zKS5zb3VyY2UpXG4gIH1cblxuICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnKD86JyArIHBhcnRzLmpvaW4oJ3wnKSArICcpJywgZmxhZ3Mob3B0aW9ucykpXG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocmVnZXhwLCBrZXlzKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHBhdGggcmVnZXhwIGZyb20gc3RyaW5nIGlucHV0LlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gc3RyaW5nVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAgdmFyIHRva2VucyA9IHBhcnNlKHBhdGgpXG4gIHZhciByZSA9IHRva2Vuc1RvUmVnRXhwKHRva2Vucywgb3B0aW9ucylcblxuICAvLyBBdHRhY2gga2V5cyBiYWNrIHRvIHRoZSByZWdleHAuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiB0b2tlbnNbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlzLnB1c2godG9rZW5zW2ldKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlLCBrZXlzKVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIGZ1bmN0aW9uIGZvciB0YWtpbmcgdG9rZW5zIGFuZCByZXR1cm5pbmcgYSBSZWdFeHAuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICB0b2tlbnNcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvUmVnRXhwICh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICB2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3RcbiAgdmFyIGVuZCA9IG9wdGlvbnMuZW5kICE9PSBmYWxzZVxuICB2YXIgcm91dGUgPSAnJ1xuICB2YXIgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXVxuICB2YXIgZW5kc1dpdGhTbGFzaCA9IHR5cGVvZiBsYXN0VG9rZW4gPT09ICdzdHJpbmcnICYmIC9cXC8kLy50ZXN0KGxhc3RUb2tlbilcblxuICAvLyBJdGVyYXRlIG92ZXIgdGhlIHRva2VucyBhbmQgY3JlYXRlIG91ciByZWdleHAgc3RyaW5nLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXVxuXG4gICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJvdXRlICs9IGVzY2FwZVN0cmluZyh0b2tlbilcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHByZWZpeCA9IGVzY2FwZVN0cmluZyh0b2tlbi5wcmVmaXgpXG4gICAgICB2YXIgY2FwdHVyZSA9IHRva2VuLnBhdHRlcm5cblxuICAgICAgaWYgKHRva2VuLnJlcGVhdCkge1xuICAgICAgICBjYXB0dXJlICs9ICcoPzonICsgcHJlZml4ICsgY2FwdHVyZSArICcpKidcbiAgICAgIH1cblxuICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICBjYXB0dXJlID0gJyg/OicgKyBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJykpPydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYXB0dXJlID0gJygnICsgY2FwdHVyZSArICcpPydcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FwdHVyZSA9IHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSdcbiAgICAgIH1cblxuICAgICAgcm91dGUgKz0gY2FwdHVyZVxuICAgIH1cbiAgfVxuXG4gIC8vIEluIG5vbi1zdHJpY3QgbW9kZSB3ZSBhbGxvdyBhIHNsYXNoIGF0IHRoZSBlbmQgb2YgbWF0Y2guIElmIHRoZSBwYXRoIHRvXG4gIC8vIG1hdGNoIGFscmVhZHkgZW5kcyB3aXRoIGEgc2xhc2gsIHdlIHJlbW92ZSBpdCBmb3IgY29uc2lzdGVuY3kuIFRoZSBzbGFzaFxuICAvLyBpcyB2YWxpZCBhdCB0aGUgZW5kIG9mIGEgcGF0aCBtYXRjaCwgbm90IGluIHRoZSBtaWRkbGUuIFRoaXMgaXMgaW1wb3J0YW50XG4gIC8vIGluIG5vbi1lbmRpbmcgbW9kZSwgd2hlcmUgXCIvdGVzdC9cIiBzaG91bGRuJ3QgbWF0Y2ggXCIvdGVzdC8vcm91dGVcIi5cbiAgaWYgKCFzdHJpY3QpIHtcbiAgICByb3V0ZSA9IChlbmRzV2l0aFNsYXNoID8gcm91dGUuc2xpY2UoMCwgLTIpIDogcm91dGUpICsgJyg/OlxcXFwvKD89JCkpPydcbiAgfVxuXG4gIGlmIChlbmQpIHtcbiAgICByb3V0ZSArPSAnJCdcbiAgfSBlbHNlIHtcbiAgICAvLyBJbiBub24tZW5kaW5nIG1vZGUsIHdlIG5lZWQgdGhlIGNhcHR1cmluZyBncm91cHMgdG8gbWF0Y2ggYXMgbXVjaCBhc1xuICAgIC8vIHBvc3NpYmxlIGJ5IHVzaW5nIGEgcG9zaXRpdmUgbG9va2FoZWFkIHRvIHRoZSBlbmQgb3IgbmV4dCBwYXRoIHNlZ21lbnQuXG4gICAgcm91dGUgKz0gc3RyaWN0ICYmIGVuZHNXaXRoU2xhc2ggPyAnJyA6ICcoPz1cXFxcL3wkKSdcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHJvdXRlLCBmbGFncyhvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgdGhlIGdpdmVuIHBhdGggc3RyaW5nLCByZXR1cm5pbmcgYSByZWd1bGFyIGV4cHJlc3Npb24uXG4gKlxuICogQW4gZW1wdHkgYXJyYXkgY2FuIGJlIHBhc3NlZCBpbiBmb3IgdGhlIGtleXMsIHdoaWNoIHdpbGwgaG9sZCB0aGVcbiAqIHBsYWNlaG9sZGVyIGtleSBkZXNjcmlwdGlvbnMuIEZvciBleGFtcGxlLCB1c2luZyBgL3VzZXIvOmlkYCwgYGtleXNgIHdpbGxcbiAqIGNvbnRhaW4gYFt7IG5hbWU6ICdpZCcsIGRlbGltaXRlcjogJy8nLCBvcHRpb25hbDogZmFsc2UsIHJlcGVhdDogZmFsc2UgfV1gLlxuICpcbiAqIEBwYXJhbSAgeyhTdHJpbmd8UmVnRXhwfEFycmF5KX0gcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgICAgICAgICAgICBba2V5c11cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICAgICAgICAgICAgW29wdGlvbnNdXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHBhdGhUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICBrZXlzID0ga2V5cyB8fCBbXVxuXG4gIGlmICghaXNhcnJheShrZXlzKSkge1xuICAgIG9wdGlvbnMgPSBrZXlzXG4gICAga2V5cyA9IFtdXG4gIH0gZWxzZSBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuIHJlZ2V4cFRvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG4gIH1cblxuICBpZiAoaXNhcnJheShwYXRoKSkge1xuICAgIHJldHVybiBhcnJheVRvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG4gIH1cblxuICByZXR1cm4gc3RyaW5nVG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbn1cbiIsIlxudmFyIG9yaWcgPSBkb2N1bWVudC50aXRsZTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc2V0O1xuXG5mdW5jdGlvbiBzZXQoc3RyKSB7XG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIGRvY3VtZW50LnRpdGxlID0gc3RyLnJlcGxhY2UoLyVbb3NdL2csIGZ1bmN0aW9uKF8pe1xuICAgIHN3aXRjaCAoXykge1xuICAgICAgY2FzZSAnJW8nOlxuICAgICAgICByZXR1cm4gb3JpZztcbiAgICAgIGNhc2UgJyVzJzpcbiAgICAgICAgcmV0dXJuIGFyZ3NbaSsrXTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnRzLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgc2V0KG9yaWcpO1xufTtcbiIsInZhciBiZWwgPSByZXF1aXJlKCdiZWwnKSAvLyB0dXJucyB0ZW1wbGF0ZSB0YWcgaW50byBET00gZWxlbWVudHNcbnZhciBtb3JwaGRvbSA9IHJlcXVpcmUoJ21vcnBoZG9tJykgLy8gZWZmaWNpZW50bHkgZGlmZnMgKyBtb3JwaHMgdHdvIERPTSBlbGVtZW50c1xudmFyIGRlZmF1bHRFdmVudHMgPSByZXF1aXJlKCcuL3VwZGF0ZS1ldmVudHMuanMnKSAvLyBkZWZhdWx0IGV2ZW50cyB0byBiZSBjb3BpZWQgd2hlbiBkb20gZWxlbWVudHMgdXBkYXRlXG5cbm1vZHVsZS5leHBvcnRzID0gYmVsXG5cbi8vIFRPRE8gbW92ZSB0aGlzICsgZGVmYXVsdEV2ZW50cyB0byBhIG5ldyBtb2R1bGUgb25jZSB3ZSByZWNlaXZlIG1vcmUgZmVlZGJhY2tcbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIGlmIChvcHRzLmV2ZW50cyAhPT0gZmFsc2UpIHtcbiAgICBpZiAoIW9wdHMub25CZWZvcmVNb3JwaEVsKSBvcHRzLm9uQmVmb3JlTW9ycGhFbCA9IGNvcGllclxuICB9XG5cbiAgcmV0dXJuIG1vcnBoZG9tKGZyb21Ob2RlLCB0b05vZGUsIG9wdHMpXG5cbiAgLy8gbW9ycGhkb20gb25seSBjb3BpZXMgYXR0cmlidXRlcy4gd2UgZGVjaWRlZCB3ZSBhbHNvIHdhbnRlZCB0byBjb3B5IGV2ZW50c1xuICAvLyB0aGF0IGNhbiBiZSBzZXQgdmlhIGF0dHJpYnV0ZXNcbiAgZnVuY3Rpb24gY29waWVyIChmLCB0KSB7XG4gICAgLy8gY29weSBldmVudHM6XG4gICAgdmFyIGV2ZW50cyA9IG9wdHMuZXZlbnRzIHx8IGRlZmF1bHRFdmVudHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGV2ID0gZXZlbnRzW2ldXG4gICAgICBpZiAodFtldl0pIHsgLy8gaWYgbmV3IGVsZW1lbnQgaGFzIGEgd2hpdGVsaXN0ZWQgYXR0cmlidXRlXG4gICAgICAgIGZbZXZdID0gdFtldl0gLy8gdXBkYXRlIGV4aXN0aW5nIGVsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoZltldl0pIHsgLy8gaWYgZXhpc3RpbmcgZWxlbWVudCBoYXMgaXQgYW5kIG5ldyBvbmUgZG9lc250XG4gICAgICAgIGZbZXZdID0gdW5kZWZpbmVkIC8vIHJlbW92ZSBpdCBmcm9tIGV4aXN0aW5nIGVsZW1lbnRcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gY29weSB2YWx1ZXMgZm9yIGZvcm0gZWxlbWVudHNcbiAgICBpZiAoKGYubm9kZU5hbWUgPT09ICdJTlBVVCcgJiYgZi50eXBlICE9PSAnZmlsZScpIHx8IGYubm9kZU5hbWUgPT09ICdURVhUQVJFQScgfHwgZi5ub2RlTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIGlmICh0LmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PT0gbnVsbCkgdC52YWx1ZSA9IGYudmFsdWVcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAvLyBhdHRyaWJ1dGUgZXZlbnRzIChjYW4gYmUgc2V0IHdpdGggYXR0cmlidXRlcylcbiAgJ29uY2xpY2snLFxuICAnb25kYmxjbGljaycsXG4gICdvbm1vdXNlZG93bicsXG4gICdvbm1vdXNldXAnLFxuICAnb25tb3VzZW92ZXInLFxuICAnb25tb3VzZW1vdmUnLFxuICAnb25tb3VzZW91dCcsXG4gICdvbmRyYWdzdGFydCcsXG4gICdvbmRyYWcnLFxuICAnb25kcmFnZW50ZXInLFxuICAnb25kcmFnbGVhdmUnLFxuICAnb25kcmFnb3ZlcicsXG4gICdvbmRyb3AnLFxuICAnb25kcmFnZW5kJyxcbiAgJ29ua2V5ZG93bicsXG4gICdvbmtleXByZXNzJyxcbiAgJ29ua2V5dXAnLFxuICAnb251bmxvYWQnLFxuICAnb25hYm9ydCcsXG4gICdvbmVycm9yJyxcbiAgJ29ucmVzaXplJyxcbiAgJ29uc2Nyb2xsJyxcbiAgJ29uc2VsZWN0JyxcbiAgJ29uY2hhbmdlJyxcbiAgJ29uc3VibWl0JyxcbiAgJ29ucmVzZXQnLFxuICAnb25mb2N1cycsXG4gICdvbmJsdXInLFxuICAnb25pbnB1dCcsXG4gIC8vIG90aGVyIGNvbW1vbiBldmVudHNcbiAgJ29uY29udGV4dG1lbnUnLFxuICAnb25mb2N1c2luJyxcbiAgJ29uZm9jdXNvdXQnXG5dXG4iLCJ2YXIgcGFnZSA9IHJlcXVpcmUoJ3BhZ2UnKTtcbnZhciBlbXB0eSA9IHJlcXVpcmUoJ2VtcHR5LWVsZW1lbnQnKTtcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbnZhciB0aXRsZSA9IHJlcXVpcmUoJ3RpdGxlJyk7XG5cbnBhZ2UoJy8nLCBmdW5jdGlvbiAoY3R4LCBuZXh0KSB7XG5cdHRpdGxlKCdQbGF0emlncmFtJyk7XG4gIHZhciBtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY29udGFpbmVyJyk7XG4gIGVtcHR5KG1haW4pLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbn0pXG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xudmFyIGxheW91dCA9IHJlcXVpcmUoJy4uL2xheW91dCcpO1xuXG52YXIgdGVtcGxhdGUgPSB5b2A8ZGl2IGNsYXNzPVwiY29udGFpbmVyIHRpbWVsaW5lXCI+XG4gIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMiBtMTAgb2Zmc2V0LW0xIGw2IG9mZnNldC1sM1wiPlxuICAgICAgY29udGVudFxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvZGl2PmA7XG5cbm1vZHVsZS5leHBvcnRzID0gbGF5b3V0KHRlbXBsYXRlKTtcbiIsInZhciBwYWdlID0gcmVxdWlyZSgncGFnZScpO1xuXG5yZXF1aXJlKCcuL2hvbWVwYWdlJyk7XG5yZXF1aXJlKCcuL3NpZ251cCcpO1xucmVxdWlyZSgnLi9zaWduaW4nKTtcblxucGFnZSgpXG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxhbmRpbmcgKGJveCkge1xuICByZXR1cm4geW9gPGRpdiBjbGFzcz1cImNvbnRhaW5lciBsYW5kaW5nXCI+XG4gICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTAgcHVzaC1zMVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBtNSBoaWRlLW9uLXNtYWxsLW9ubHlcIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPVwiaXBob25lLnBuZ1wiIGFsdD1cIlwiIGNsYXNzPVwiaXBob25lIHJlc3BvbnNpdmUtaW1nXCI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgJHtib3h9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PmA7XG59IiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsYXlvdXQoY29udGVudCkge1xuICByZXR1cm4geW9gPGRpdj5cbiAgICA8bmF2IGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibmF2LXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wgczEyIG02IG9mZnNldC1tMVwiPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiL1wiIGNsYXNzPVwiYnJhbmQtbG9nbyBwbGF0emlncmFtXCI+UGxhdHppZ3JhbTwvYT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMiBtNiBwdXNoLXMxMCBwdXNoLW0xMFwiPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi1sYXJnZSBidG4tZmxhdCBkcm9wZG93bi1idXR0b25cIiBkYXRhLWFjdGl2YXRlcz1cImRyb3AtdXNlclwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtdXNlclwiIGFyZWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8dWwgaWQ9XCJkcm9wLXVzZXJcIiBjbGFzcz1cImRyb3Bkb3duLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5TYWxpcjwvYT48L2xpPlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9uYXY+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAgICAgICR7Y29udGVudH1cbiAgICA8L2Rpdj5cbiAgPC9kaXY+YDtcbn1cbiIsInZhciBwYWdlID0gcmVxdWlyZSgncGFnZScpO1xudmFyIGVtcHR5ID0gcmVxdWlyZSgnZW1wdHktZWxlbWVudCcpO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIHRpdGxlID0gcmVxdWlyZSgndGl0bGUnKTtcblxucGFnZSgnL3NpZ25pbicsIGZ1bmN0aW9uIChjdHgsIG5leHQpIHtcblx0dGl0bGUoJ1BsYXR6aWdyYW0gLSBTaWduaW4nKTtcbiAgdmFyIG1haW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbi1jb250YWluZXInKTtcbiAgZW1wdHkobWFpbikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xufSlcbiIsInZhciB5byA9IHJlcXVpcmUoJ3lvLXlvJyk7XG52YXIgbGFuZGluZyA9IHJlcXVpcmUoJy4uL2xhbmRpbmcnKTtcblxudmFyIHNpZ25pbkZvcm0gPSB5b2A8ZGl2IGNsYXNzPVwiY29sIHMxMiBtN1wiPlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cInNpZ251cC1ib3hcIj5cbiAgICAgIDxoMSBjbGFzcz1cInBsYXR6aWdyYW1cIj5QbGF0emlncmFtPC9oMT5cbiAgICAgIDxmb3JtIGFjdGlvbj1cIlwiIGNsYXNzPVwic2lnbnVwLWZvcm1cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiXCIgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tc21hbGwtb25seVwiPkluaWNpYXIgc2VzacOzbiBjb24gRmFjZWJvb2s8L2E+XG4gICAgICAgICAgPGEgaHJlZj1cIlwiIGNsYXNzPVwiYnRuIGJ0bi1mYiBoaWRlLW9uLW1lZC1hbmQtdXBcIj48aSBjbGFzcz1cImZhIGZhLWZhY2Vib29rLW9mZmljaWFsXCI+PC9pPkluaWNpYXIgc2VzacOzbjwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInVzZXJuYW1lXCIgcGxhY2Vob2xkZXI9XCJOb21icmUgZGUgdXN1YXJpb1wiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIkNvbnRyYXNlw7FhXCI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0bi1zaWdudXBcIj5JbmljaWEgc2VzacOzbjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwibG9naW4tYm94XCI+XG4gICAgICDCv05vIHRpZW5lcyB1bmEgY3VlbnRhPyA8YSBocmVmPVwiL3NpZ251cFwiPlJlZ2lzdHJhdGU8L2E+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcblxubW9kdWxlLmV4cG9ydHMgPSBsYW5kaW5nKHNpZ25pbkZvcm0pO1xuIiwidmFyIHBhZ2UgPSByZXF1aXJlKCdwYWdlJyk7XG52YXIgZW1wdHkgPSByZXF1aXJlKCdlbXB0eS1lbGVtZW50Jyk7XG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyk7XG52YXIgdGl0bGUgPSByZXF1aXJlKCd0aXRsZScpO1xuXG5wYWdlKCcvc2lnbnVwJywgZnVuY3Rpb24gKGN0eCwgbmV4dCkge1xuXHR0aXRsZSgnUGxhdHppZ3JhbSAtIFNpZ251cCcpO1xuICB2YXIgbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNvbnRhaW5lcicpO1xuICBlbXB0eShtYWluKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59KSIsInZhciB5byA9IHJlcXVpcmUoJ3lvLXlvJyk7XG52YXIgbGFuZGluZyA9IHJlcXVpcmUoJy4uL2xhbmRpbmcnKTtcblxudmFyIHNpZ251cEZvcm0gPSB5b2A8ZGl2IGNsYXNzPVwiY29sIHMxMiBtN1wiPlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cInNpZ251cC1ib3hcIj5cbiAgICAgIDxoMSBjbGFzcz1cInBsYXR6aWdyYW1cIj5QbGF0emlncmFtPC9oMT5cbiAgICAgIDxmb3JtIGFjdGlvbj1cIlwiIGNsYXNzPVwic2lnbnVwLWZvcm1cIj5cbiAgICAgICAgPGgyPlJlZ8Otc3RyYXRlIHBhcmEgdmVyIGZvdG9zIGRlIHR1cyBhbWlnb3MgZXN0dWRpYW5kbyBlbiBQbGF0emk8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICAgIDxhIGhyZWY9XCJcIiBjbGFzcz1cImJ0biBidG4tZmIgaGlkZS1vbi1zbWFsbC1vbmx5XCI+SW5pY2lhciBzZXNpw7NuIGNvbiBGYWNlYm9vazwvYT5cbiAgICAgICAgICA8YSBocmVmPVwiXCIgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tbWVkLWFuZC11cFwiPjxpIGNsYXNzPVwiZmEgZmEtZmFjZWJvb2stb2ZmaWNpYWxcIj48L2k+SW5pY2lhciBzZXNpw7NuPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb25cIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCIgbmFtZT1cImVtYWlsXCIgcGxhY2Vob2xkZXI9XCJDb3JyZW8gZWxlY3Ryw7NuaWNvXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cIk5vbWJyZSBjb21wbGV0b1wiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJ1c2VybmFtZVwiIHBsYWNlaG9sZGVyPVwiTm9tYnJlIGRlIHVzdWFyaW9cIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmFtZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJDb250cmFzZcOxYVwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4tc2lnbnVwXCI+UmVnw61zdHJhdGU8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cImxvZ2luLWJveFwiPlxuICAgICAgwr9UaWVuZXMgdW5hIGN1ZW50YT8gPGEgaHJlZj1cIi9zaWduaW5cIj5FbnRyYXI8L2E+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcblxubW9kdWxlLmV4cG9ydHMgPSBsYW5kaW5nKHNpZ251cEZvcm0pO1xuIl19
