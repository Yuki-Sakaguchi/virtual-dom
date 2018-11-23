(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("./flamework/view");
var app_1 = require("./flamework/app");
var state = {
    count: 0
};
var actions = {
    increment: function (state) {
        state.count++;
    }
};
var view = function (state, actions) {
    return view_1.h('div', null, view_1.h('p', null, state.count), view_1.h('button', { type: 'button', onclick: function () { return actions.increment(state); } }, 'count up'));
};
new app_1.App({
    el: '#app',
    state: state,
    view: view,
    actions: actions
});

},{"./flamework/app":2,"./flamework/view":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("./view");
var App = (function () {
    function App(params) {
        this.el = typeof params.el === "string" ? document.querySelector(params.el) : params.el;
        this.view = params.view;
        this.state = params.state;
        this.actions = this.dispatchAction(params.actions);
        this.resolveNode();
    }
    App.prototype.dispatchAction = function (actions) {
        var _this = this;
        var dispatched = {};
        var _loop_1 = function (key) {
            var action = actions[key];
            dispatched[key] = function (state) {
                var data = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    data[_i - 1] = arguments[_i];
                }
                var ret = action.apply(void 0, [state].concat(data));
                _this.resolveNode();
                return ret;
            };
        };
        for (var key in actions) {
            _loop_1(key);
        }
        return dispatched;
    };
    App.prototype.resolveNode = function () {
        this.newNode = this.view(this.state, this.actions);
        this.scheduleRender();
    };
    App.prototype.scheduleRender = function () {
        if (!this.skipRender) {
            this.skipRender = true;
            setTimeout(this.render.bind(this));
        }
    };
    App.prototype.render = function () {
        if (this.oldNode) {
            view_1.updateElement(this.el, this.oldNode, this.newNode);
        }
        else {
            this.el.appendChild(view_1.createElement(this.newNode));
        }
        this.oldNode = this.newNode;
        this.skipRender = false;
    };
    return App;
}());
exports.App = App;

},{"./view":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function h(nodeName, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return {
        nodeName: nodeName,
        attributes: attributes,
        children: children
    };
}
exports.h = h;
function createElement(node) {
    if (!isVNode(node)) {
        return document.createTextNode(node.toString());
    }
    var el = document.createElement(node.nodeName);
    setAttributes(el, node.attributes);
    node.children.forEach(function (child) { return el.appendChild(createElement(child)); });
    return el;
}
exports.createElement = createElement;
function isVNode(node) {
    return typeof node !== "string" && typeof node !== "number";
}
function setAttributes(target, attrs) {
    for (var attr in attrs) {
        if (isEventAttr(attr)) {
            var eventName = attr.slice(2);
            target.addEventListener(eventName, attrs[attr]);
        }
        else {
            target.setAttribute(attr, attrs[attr]);
        }
    }
}
function isEventAttr(attr) {
    return /^on/.test(attr);
}
var ChangedType;
(function (ChangedType) {
    ChangedType[ChangedType["None"] = 0] = "None";
    ChangedType[ChangedType["Type"] = 1] = "Type";
    ChangedType[ChangedType["Text"] = 2] = "Text";
    ChangedType[ChangedType["Node"] = 3] = "Node";
    ChangedType[ChangedType["Value"] = 4] = "Value";
    ChangedType[ChangedType["Attr"] = 5] = "Attr";
})(ChangedType || (ChangedType = {}));
function hasChanged(a, b) {
    if (typeof a !== typeof b) {
        return ChangedType.Type;
    }
    if (!isVNode(a) && a !== b) {
        return ChangedType.Text;
    }
    if (isVNode(a) && isVNode(b)) {
        if (a.nodeName !== b.nodeName) {
            return ChangedType.Node;
        }
        if ((a.attributes !== null && b.attributes !== null) && a.attributes.value !== b.attributes.value) {
            return ChangedType.Value;
        }
        if (JSON.stringify(a.attributes) !== JSON.stringify(b.attributes)) {
            return ChangedType.Attr;
        }
    }
    return ChangedType.None;
}
function updateElement(parent, oldNode, newNode, index) {
    if (index === void 0) { index = 0; }
    if (oldNode == null) {
        parent.appendChild(createElement(newNode));
        return;
    }
    var target = parent.childNodes[index];
    if (newNode == null) {
        parent.removeChild(target);
        return;
    }
    var changeType = hasChanged(oldNode, newNode);
    switch (changeType) {
        case ChangedType.Type:
        case ChangedType.Text:
        case ChangedType.Node:
            parent.replaceChild(createElement(newNode), target);
            return;
        case ChangedType.Value:
            updateValue(target, newNode.attributes.value);
            return;
        case ChangedType.Attr:
            updateAttributes(target, oldNode.attributes, newNode.attributes);
            return;
    }
    if (isVNode(oldNode) && isVNode(newNode)) {
        for (var i = 0; i < newNode.children.length || i < oldNode.children.length; i++) {
            updateElement(target, oldNode.children[i], newNode.children[i]);
        }
    }
}
exports.updateElement = updateElement;
function updateValue(target, newValue) {
    target.value = newValue;
}
function updateAttributes(target, oldAttributes, newAttributes) {
    for (var attr in oldAttributes) {
        if (!isEventAttr(attr)) {
            target.removeAttribute(attr);
        }
    }
    for (var attr in newAttributes) {
        if (!isEventAttr(attr)) {
            target.setAttribute(attr, newAttributes[attr]);
        }
    }
}

},{}]},{},[1]);
