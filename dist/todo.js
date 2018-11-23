(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./view":2}],2:[function(require,module,exports){
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
            updateElement(target, oldNode.children[i], newNode.children[i], i);
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

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("./flamework/view");
var app_1 = require("./flamework/app");
var state = {
    tasks: ["自分で", "仮想DOMを", "構築したぞ！"],
    form: {
        input: "",
        hasError: false
    }
};
var actions = {
    validate: function (state, input) {
        if (!input || input.length < 3 || input.length > 20) {
            state.form.hasError = true;
        }
        else {
            state.form.hasError = false;
        }
        return !state.form.hasError;
    },
    createTask: function (state, title) {
        state.tasks.push(title);
        state.form.input = "";
    },
    removeTask: function (state, index) {
        state.tasks.splice(index, 1);
    }
};
var view = function (state, actions) {
    return view_1.h("div", { style: "padding: 20px;" }, view_1.h("h1", { class: "title" }, "仮想DOM完全に理解したTODOアプリ"), view_1.h("div", { class: "field" }, view_1.h("label", { class: "label" }, "Task Title"), view_1.h("input", {
        type: "text",
        class: "input",
        style: "width: 200px;",
        value: state.form.input,
        oninput: function (ev) {
            var target = ev.target;
            state.form.input = target.value;
            actions.validate(state, state.form.input);
        }
    }), view_1.h("button", {
        type: "button",
        class: "button is-primary",
        style: "margin-left: 10px;",
        onclick: function () {
            if (actions.validate(state, state.form.input)) {
                actions.createTask(state, state.form.input);
            }
        }
    }, "create"), view_1.h("p", {
        class: "notification",
        style: "display: " + (state.form.hasError ? "display" : "none")
    }, "3〜20文字で入力してください")), view_1.h.apply(void 0, ["ul",
        { class: "panel" }].concat(state.tasks.map(function (task, i) {
        return view_1.h("li", { class: "panel-block" }, view_1.h("button", {
            type: "button",
            class: "delete",
            style: "margin-right: 10px;",
            onclick: function () { return actions.removeTask(state, i); }
        }, "remove"), task);
    }))));
};
new app_1.App({
    el: '#app',
    state: state,
    view: view,
    actions: actions
});

},{"./flamework/app":1,"./flamework/view":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvZmxhbWV3b3JrL2FwcC50cyIsInNyYy90cy9mbGFtZXdvcmsvdmlldy50cyIsInNyYy90cy90b2RvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNLQSwrQkFBbUU7QUFlbkU7SUFjRSxhQUFZLE1BQXNDO1FBQ2hELElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxNQUFNLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDeEYsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBTU8sNEJBQWMsR0FBdEIsVUFBdUIsT0FBMEI7UUFBakQsaUJBV0M7UUFWQyxJQUFNLFVBQVUsR0FBRyxFQUF1QixDQUFDO2dDQUNsQyxHQUFHO1lBQ1YsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFDLEtBQVk7Z0JBQUUsY0FBWTtxQkFBWixVQUFZLEVBQVoscUJBQVksRUFBWixJQUFZO29CQUFaLDZCQUFZOztnQkFDM0MsSUFBTSxHQUFHLEdBQUcsTUFBTSxnQkFBQyxLQUFLLFNBQUssSUFBSSxFQUFDLENBQUM7Z0JBQ25DLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxHQUFHLENBQUM7WUFDYixDQUFDLENB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QyxDQUNDLFFBQVEsRUFDUjtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixLQUFLLEVBQUUscUJBQXFCO1lBQzVCLE9BQU8sRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQTVCLENBQTRCO1NBQzVDLEVBQ0QsUUFBUSxDQUNULEVBQ0QsSUFBSSxDQUNMLENBQUM7SUFDSixDQUFDLENBQUMsR0FFTCxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsSUFBSSxTQUFHLENBQWlCO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsS0FBSyxPQUFBO0lBQ0wsSUFBSSxNQUFBO0lBQ0osT0FBTyxTQUFBO0NBQ1IsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBBUFBcbiAqICAgIEFjdGlvbuOBp1N0b3Jl44GM5pu05paw44GV44KM44Gf44KJVmlld+OBruabtOaWsOWHpueQhuOCkuWun+ihjOOBmeOCi0NvbnRyb2xsZXLpg6hcbiAqL1xuaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gJy4vYWN0aW9uJztcbmltcG9ydCB7IFZpZXcsIFZOb2RlLCBjcmVhdGVFbGVtZW50LCB1cGRhdGVFbGVtZW50IH0gZnJvbSAnLi92aWV3JztcblxuLyoqXG4gKiBBcHDjga7jgqTjg7Pjgr/jg7zjg5Xjgqfjg7zjgrlcbiAqL1xuaW50ZXJmYWNlIEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPiB7XG4gIGVsOiBIVE1MRWxlbWVudCB8IHN0cmluZzsgLy8g6Kaq44OO44O844OJXG4gIHZpZXc6IFZpZXc8U3RhdGUsIEFjdGlvblRyZWU8U3RhdGU+PjsgLy8gVmlld+OBruWumue+qVxuICBzdGF0ZTogU3RhdGU7IC8vIOeKtuaFi+euoeeQhlxuICBhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPjsgLy8gQWN0aW9u44Gu5a6a576pXG59XG5cbi8qKlxuICogQXBw44Kv44Op44K5XG4gKi9cbmV4cG9ydCBjbGFzcyBBcHA8U3RhdGUsIEFjdGlvbnM+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBlbDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9uVHJlZTxTdGF0ZT4+O1xuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlOiBTdGF0ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPjtcbiAgcHJpdmF0ZSBvbGROb2RlOiBWTm9kZTtcbiAgcHJpdmF0ZSBuZXdOb2RlOiBWTm9kZTtcbiAgcHJpdmF0ZSBza2lwUmVuZGVyOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiDjgrPjg7Pjgrnjg4jjg6njgq/jgr9cbiAgICogQHBhcmFtIHtBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz59IHBhcmFtcyBcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPikge1xuICAgIHRoaXMuZWwgPSB0eXBlb2YgcGFyYW1zLmVsID09PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbXMuZWwpIDogcGFyYW1zLmVsO1xuICAgIHRoaXMudmlldyA9IHBhcmFtcy52aWV3O1xuICAgIHRoaXMuc3RhdGUgPSBwYXJhbXMuc3RhdGU7XG4gICAgdGhpcy5hY3Rpb25zID0gdGhpcy5kaXNwYXRjaEFjdGlvbihwYXJhbXMuYWN0aW9ucyk7XG4gICAgdGhpcy5yZXNvbHZlTm9kZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGlvbuOBq1N0YXRl44KS5rih44GX44CB5paw44GX44GE5Luu5oOzRE9N44KS5L2c44KLXG4gICAqIEBwYXJhbSB7QWN0aW9uVHJlZTxTdGF0ZT59IGFjdGlvbnMgXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoQWN0aW9uKGFjdGlvbnM6IEFjdGlvblRyZWU8U3RhdGU+KSB7XG4gICAgY29uc3QgZGlzcGF0Y2hlZCA9IHt9IGFzIEFjdGlvblRyZWU8U3RhdGU+O1xuICAgIGZvciAobGV0IGtleSBpbiBhY3Rpb25zKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25zW2tleV07XG4gICAgICBkaXNwYXRjaGVkW2tleV0gPSAoc3RhdGU6IFN0YXRlLCAuLi5kYXRhOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgcmV0ID0gYWN0aW9uKHN0YXRlLCAuLi5kYXRhKTtcbiAgICAgICAgdGhpcy5yZXNvbHZlTm9kZSgpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlzcGF0Y2hlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiDku67mg7NET03jgpLlho3mp4vnr4njgZnjgotcbiAgICovXG4gIHByaXZhdGUgcmVzb2x2ZU5vZGUoKTogdm9pZCAge1xuICAgIHRoaXMubmV3Tm9kZSA9IHRoaXMudmlldyh0aGlzLnN0YXRlLCB0aGlzLmFjdGlvbnMpO1xuICAgIHRoaXMuc2NoZWR1bGVSZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDjg6zjg7Pjg4Djg6rjg7PjgrDjga7jgrnjgrHjgrjjg6Xjg7zjg6rjg7PjgrBcbiAgICog77yI6YCj57aa44GnQWN0aW9u44GM5a6f6KGM44GV44KM44Gf5pmC44Gr5L2V5bqm44KCRE9N44OE44Oq44O844KS5pu444GN5o+b44GI44Gq44GE44Gf44KB77yJXG4gICAqL1xuICBwcml2YXRlIHNjaGVkdWxlUmVuZGVyKCk6IHZvaWQgIHtcbiAgICBpZiAoIXRoaXMuc2tpcFJlbmRlcikge1xuICAgICAgdGhpcy5za2lwUmVuZGVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOaPj+eUu1xuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMub2xkTm9kZSkge1xuICAgICAgdXBkYXRlRWxlbWVudCh0aGlzLmVsLCB0aGlzLm9sZE5vZGUsIHRoaXMubmV3Tm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudCh0aGlzLm5ld05vZGUpKTtcbiAgICB9XG4gICAgdGhpcy5vbGROb2RlID0gdGhpcy5uZXdOb2RlO1xuICAgIHRoaXMuc2tpcFJlbmRlciA9IGZhbHNlO1xuICB9XG59IiwiLyoqXG4gKiBWaWV3XG4gKiAgICDku67mg7NET03jgpLkvZzmiJDjgZnjgoto6Zai5pWw44KS5a6a576pXG4gKi9cblxudHlwZSBOb2RlVHlwZSA9IFZOb2RlIHwgc3RyaW5nIHwgbnVtYmVyO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBGdW5jdGlvbiB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXc8U3RhdGUsIEFjdGlvbnM+IHtcbiAgKHN0YXRlOiBTdGF0ZSwgYWN0aW9uczogQWN0aW9ucyk6IFZOb2RlO1xufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOCpOODs+OCv+ODvOODleOCp+ODvOOCuVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZOb2RlIHtcbiAgbm9kZU5hbWU6IGtleW9mIEVsZW1lbnRUYWdOYW1lTWFwO1xuICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVzO1xuICBjaGlsZHJlbjogTm9kZVR5cGVbXTtcbn1cblxuLyoqXG4gKiDku67mg7NET03jgpLkvZzmiJDjgZnjgovplqLmlbBcbiAqIEBwYXJhbSB7RWxlbWVudFRhZ05hbWVNYXB9IG5vZGVOYW1lIOOCv+OCsOWQjVxuICogQHBhcmFtIHtBdHRyaWJ1dGVzfSBhdHRyaWJ1dGVzIOWxnuaAp+OCquODluOCuOOCp+OCr+ODiFxuICogQHBhcmFtIHtBcnJheTxOb2RlVHlwZT59IGNoaWxkcmVuIOWtkOimgee0oFxuICovXG5leHBvcnQgZnVuY3Rpb24gaChub2RlTmFtZToga2V5b2YgRWxlbWVudFRhZ05hbWVNYXAsIGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZXMsIC4uLmNoaWxkcmVuOiBOb2RlVHlwZVtdKTogVk5vZGUge1xuICByZXR1cm4ge1xuICAgIG5vZGVOYW1lLFxuICAgIGF0dHJpYnV0ZXMsXG4gICAgY2hpbGRyZW5cbiAgfTtcbn1cblxuLyoqXG4gKiDjg6rjgqLjg6tET03jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAqIEBwYXJhbSB7Tm9kZVR5cGV9IG5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZTogTm9kZVR5cGUpOiBIVE1MRWxlbWVudCB8IFRleHQge1xuICBpZiAoIWlzVk5vZGUobm9kZSkpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZS50b1N0cmluZygpKTtcbiAgfVxuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZS5ub2RlTmFtZSk7XG4gIHNldEF0dHJpYnV0ZXMoZWwsIG5vZGUuYXR0cmlidXRlcyk7XG4gIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBlbC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KGNoaWxkKSkpO1xuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICog5Luu5oOzRE9N44GL44Gp44GG44GL44KS56K66KqN44GZ44KL6Zai5pWwXG4gKiBAcGFyYW0ge05vZGVUeXBlfSBub2RlIFxuICogQHJldHVybiB7Ym9vbGVhbn0g5byV5pWw44GM5Luu5oOzRE9N44Gg44Gj44Gf5aC05ZCIdHJ1ZSwg44Gd44KM5Lul5aSW44GvZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNWTm9kZShub2RlOiBOb2RlVHlwZSk6IG5vZGUgaXMgVk5vZGUge1xuICByZXR1cm4gdHlwZW9mIG5vZGUgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIG5vZGUgIT09IFwibnVtYmVyXCI7XG59XG5cbi8qKlxuICog5bGe5oCn44KS6L+95Yqg44GZ44KL6Zai5pWwXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQg5bGe5oCn44KS6L+95Yqg44GZ44KL6KaB57SgXG4gKiBAcGFyYW0ge0F0dHJpYnV0ZXN9IGF0dHJzIOWxnuaAp+OCquODluOCuOOCp+OCr+ODiFxuICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKHRhcmdldDogSFRNTEVsZW1lbnQsIGF0dHJzOiBBdHRyaWJ1dGVzKTogdm9pZCB7XG4gIGZvciAobGV0IGF0dHIgaW4gYXR0cnMpIHtcbiAgICBpZiAoaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGF0dHIuc2xpY2UoMik7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGF0dHJzW2F0dHJdIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJzW2F0dHJdIGFzIHN0cmluZyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICog5byV5pWw44GM44Kk44OZ44Oz44OI44KS6KGo44GZ5paH5a2X5YiX44GL44Gp44GG44GL5Yik5a6aXG4gKiBAcGFyYW0ge3N0cmluZ30gYXR0ciDlsZ7mgKflkI1cbiAqIEByZXR1cm4ge2Jvb2xlYW59IOW8leaVsOOBjOOCpOODmeODs+ODiOOBruaZgnRydWUsIOOBneOCjOS7peWkluOBruaZgmZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRXZlbnRBdHRyKGF0dHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gL15vbi8udGVzdChhdHRyKTtcbn1cblxuLyoqXG4gKiDlpInmm7TjgYzjgYLjgaPjgZ/loLTlkIjjga7lh6bnkIbjgr/jgqTjg5dcbiAqL1xuZW51bSBDaGFuZ2VkVHlwZSB7XG4gIE5vbmUsIC8vIOW3ruWIhuOBquOBl1xuICBUeXBlLCAvLyBub2Rl44Gu5Z6L44GM6YGV44GGXG4gIFRleHQsIC8vIOODhuOCreOCueODiOODjuODvOODieOBjOmBleOBhlxuICBOb2RlLCAvLyDjg47jg7zjg4nlkI3vvIjjgr/jgrDlkI3vvInjgYzpgZXjgYZcbiAgVmFsdWUsIC8vIGlucHV044GudmFsdWXjgYzpgZXjgYZcbiAgQXR0ciAvLyDlsZ7mgKfjgYzpgZXjgYZcbn1cblxuLyoqXG4gKiDvvJLjgaTjga7ku67mg7NET03jga7lt67liIbjgpLmpJznn6XjgZnjgovvvIjku5bjga7jg5Xjg6zjg7zjg6Djg6/jg7zjgq/jgaDjgajjgZPjgZPjga7lh6bnkIbjga/jgoLjgaPjgajopIfpm5HjgYvjgoLvvIlcbiAqIEBwYXJhbSB7Tm9kZVR5cGV9IGJlZm9yZSDlpInmm7TliY1cbiAqIEBwYXJhbSB7Tm9kZVR5cGV9IGFmdGVyIOWkieabtOW+jFxuICovXG5mdW5jdGlvbiBoYXNDaGFuZ2VkKGE6IE5vZGVUeXBlLCBiOiBOb2RlVHlwZSk6IENoYW5nZWRUeXBlIHtcbiAgLy8gZGlmZmVyZW50IHR5cGVcbiAgaWYgKHR5cGVvZiBhICE9PSB0eXBlb2YgYikge1xuICAgIHJldHVybiBDaGFuZ2VkVHlwZS5UeXBlO1xuICB9XG5cbiAgLy8gZGlmZmVyZW50IHN0cmluZ1xuICBpZiAoIWlzVk5vZGUoYSkgJiYgYSAhPT0gYikge1xuICAgIHJldHVybiBDaGFuZ2VkVHlwZS5UZXh0O1xuICB9XG5cbiAgLy8g57Ch5piT55qE5q+U6LyDKClcbiAgaWYgKGlzVk5vZGUoYSkgJiYgaXNWTm9kZShiKSkge1xuICAgIGlmIChhLm5vZGVOYW1lICE9PSBiLm5vZGVOYW1lKSB7XG4gICAgICByZXR1cm4gQ2hhbmdlZFR5cGUuTm9kZTtcbiAgICB9XG4gICAgaWYgKChhLmF0dHJpYnV0ZXMgIT09IG51bGwgJiYgYi5hdHRyaWJ1dGVzICE9PSBudWxsKSAmJiBhLmF0dHJpYnV0ZXMudmFsdWUgIT09IGIuYXR0cmlidXRlcy52YWx1ZSkge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLlZhbHVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoYS5hdHRyaWJ1dGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkoYi5hdHRyaWJ1dGVzKSkge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLkF0dHI7XG4gICAgfVxuICB9XG4gIHJldHVybiBDaGFuZ2VkVHlwZS5Ob25lO1xufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOBruW3ruWIhuOCkuaknOefpeOBl+OAgeODquOCouODq0RPTeOBq+WPjeaYoOOBmeOCi1xuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50IFxuICogQHBhcmFtIHtOb2RlVHlwZX0gb2xkTm9kZSBcbiAqIEBwYXJhbSB7Tm9kZVR5cGV9IG5ld05vZGUgXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVFbGVtZW50KHBhcmVudDogSFRNTEVsZW1lbnQsIG9sZE5vZGU6IE5vZGVUeXBlLCBuZXdOb2RlOiBOb2RlVHlwZSwgaW5kZXggPSAwKTogdm9pZCB7XG4gIC8vIOWPpOOBhE5vZGXjgYzjgarjgZHjgozjgbDmlrDjgZfjgY/kvZzjgotcbiAgaWYgKG9sZE5vZGUgPT0gbnVsbCkge1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KG5ld05vZGUpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0YXJnZXQgPSBwYXJlbnQuY2hpbGROb2Rlc1tpbmRleF07XG5cbiAgLy8g5paw44GX44GETm9kZeOBjOOBquOBkeOCjOOBsOWJiumZpFxuICBpZiAobmV3Tm9kZSA9PSBudWxsKSB7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHRhcmdldCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8g44Gp44Gh44KJ44KC44GC44KM44Gw5beu5YiG44KS44OB44Kn44OD44Kv44GX44CB5Yem55CG44KS6KGM44GGXG4gIGNvbnN0IGNoYW5nZVR5cGUgPSBoYXNDaGFuZ2VkKG9sZE5vZGUsIG5ld05vZGUpO1xuXG4gIHN3aXRjaChjaGFuZ2VUeXBlKSB7XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5UeXBlOlxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVGV4dDpcbiAgICBjYXNlIENoYW5nZWRUeXBlLk5vZGU6XG4gICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSksIHRhcmdldCk7XG4gICAgICByZXR1cm47XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5WYWx1ZTpcbiAgICAgIHVwZGF0ZVZhbHVlKHRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50LCAobmV3Tm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcy52YWx1ZSBhcyBzdHJpbmcpO1xuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgQ2hhbmdlZFR5cGUuQXR0cjpcbiAgICAgIHVwZGF0ZUF0dHJpYnV0ZXModGFyZ2V0IGFzIEhUTUxFbGVtZW50LCAob2xkTm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcywgKG5ld05vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgLy8g5YaN5biw55qE44Gr5a2Q6KaB57Sg44Gu5pu05paw44KS6KGM44GGXG4gIGlmIChpc1ZOb2RlKG9sZE5vZGUpICYmIGlzVk5vZGUobmV3Tm9kZSkpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld05vZGUuY2hpbGRyZW4ubGVuZ3RoIHx8IGkgPCBvbGROb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICB1cGRhdGVFbGVtZW50KHRhcmdldCBhcyBIVE1MRWxlbWVudCwgb2xkTm9kZS5jaGlsZHJlbltpXSwgbmV3Tm9kZS5jaGlsZHJlbltpXSwgaSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogdGFyZ2V044GudmFsdWXjgpLmm7TmlrBcbiAqIEBwYXJhbSB7SFRNTElucHV0RWxlbWVudH0gdGFyZ2V0IFxuICogQHBhcmFtIHtzdHJpbmd9IG5ld1ZhbHVlIFxuICovXG5mdW5jdGlvbiB1cGRhdGVWYWx1ZSh0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQsIG5ld1ZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGFyZ2V0LnZhbHVlID0gbmV3VmFsdWU7XG59XG5cbi8qKlxuICogdGFyZ2V044Gu5bGe5oCn5YCk44KS5pu05pawXG4gKiDljZjntJTjgatOb2Rl44GU44GocmVwbGFjZeOBl+OBpuOBl+OBvuOBhuOBqGlucHV044Gu44OV44Kp44O844Kr44K544GM5aSW44KM44Gm44GX44G+44GG44Gu44Gn5YCk44Gg44GR5pu05pawXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgXG4gKiBAcGFyYW0ge0F0dHJpYnV0ZXN9IG9sZEF0dHJpYnV0ZXMgXG4gKiBAcGFyYW0ge0F0dHJpYnV0ZXN9IG5ld0F0dHJpYnV0ZXMgXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZXModGFyZ2V0OiBIVE1MRWxlbWVudCwgb2xkQXR0cmlidXRlczogQXR0cmlidXRlcywgbmV3QXR0cmlidXRlczogQXR0cmlidXRlcyk6IHZvaWQge1xuICAvLyDlj6TjgYTjga7jga/mtojjgZlcbiAgZm9yIChsZXQgYXR0ciBpbiBvbGRBdHRyaWJ1dGVzKSB7XG4gICAgaWYgKCFpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICB9XG4gIH1cbiAgLy8g5paw44GX44GE44KC44Gu44KS6L+95Yqg44GZ44KLXG4gIGZvciAobGV0IGF0dHIgaW4gbmV3QXR0cmlidXRlcykge1xuICAgIGlmICghaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgbmV3QXR0cmlidXRlc1thdHRyXSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgfVxufSAiLCJpbXBvcnQgeyBWaWV3LCBoIH0gZnJvbSAnLi9mbGFtZXdvcmsvdmlldyc7XG5pbXBvcnQgeyBBY3Rpb25UcmVlIH0gZnJvbSAnLi9mbGFtZXdvcmsvYWN0aW9uJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vZmxhbWV3b3JrL2FwcCc7XG5cbnR5cGUgU3RhdGUgPSB0eXBlb2Ygc3RhdGU7XG50eXBlIEFjdGlvbnMgPSB0eXBlb2YgYWN0aW9ucztcblxuY29uc3Qgc3RhdGUgPSB7XG4gIHRhc2tzOiBbXCLoh6rliIbjgadcIiwgXCLku67mg7NET03jgpJcIiwgXCLmp4vnr4njgZfjgZ/jgZ7vvIFcIl0sXG4gIGZvcm06IHtcbiAgICBpbnB1dDogXCJcIixcbiAgICBoYXNFcnJvcjogZmFsc2VcbiAgfVxufTtcblxuY29uc3QgYWN0aW9uczogQWN0aW9uVHJlZTxTdGF0ZT4gPSB7XG4gIHZhbGlkYXRlOiAoc3RhdGUsIGlucHV0OiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIWlucHV0IHx8IGlucHV0Lmxlbmd0aCA8IDMgfHwgaW5wdXQubGVuZ3RoID4gMjApIHtcbiAgICAgIHN0YXRlLmZvcm0uaGFzRXJyb3IgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5mb3JtLmhhc0Vycm9yID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuICFzdGF0ZS5mb3JtLmhhc0Vycm9yO1xuICB9LFxuICBjcmVhdGVUYXNrOiAoc3RhdGUsIHRpdGxlOiBzdHJpbmcpID0+IHtcbiAgICBzdGF0ZS50YXNrcy5wdXNoKHRpdGxlKTtcbiAgICBzdGF0ZS5mb3JtLmlucHV0ID0gXCJcIjtcbiAgfSxcbiAgcmVtb3ZlVGFzazogKHN0YXRlLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgc3RhdGUudGFza3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcbmNvbnN0IHZpZXc6IFZpZXc8U3RhdGUsIEFjdGlvbnM+ID0gKHN0YXRlLCBhY3Rpb25zKSA9PiB7XG4gIHJldHVybiBoKFxuICAgIFwiZGl2XCIsXG4gICAgeyBzdHlsZTogXCJwYWRkaW5nOiAyMHB4O1wiIH0sXG4gICAgaChcImgxXCIsIHsgY2xhc3M6IFwidGl0bGVcIiB9LCBcIuS7ruaDs0RPTeWujOWFqOOBq+eQhuino+OBl+OBn1RPRE/jgqLjg5fjg6pcIiksXG4gICAgaChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzOiBcImZpZWxkXCIgfSxcbiAgICAgIGgoXCJsYWJlbFwiLCB7IGNsYXNzOiBcImxhYmVsXCIgfSwgXCJUYXNrIFRpdGxlXCIpLFxuICAgICAgaChcImlucHV0XCIsIHtcbiAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIGNsYXNzOiBcImlucHV0XCIsXG4gICAgICAgIHN0eWxlOiBcIndpZHRoOiAyMDBweDtcIixcbiAgICAgICAgdmFsdWU6IHN0YXRlLmZvcm0uaW5wdXQsXG4gICAgICAgIG9uaW5wdXQ6IChldjogRXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICBzdGF0ZS5mb3JtLmlucHV0ID0gdGFyZ2V0LnZhbHVlO1xuICAgICAgICAgIGFjdGlvbnMudmFsaWRhdGUoc3RhdGUsIHN0YXRlLmZvcm0uaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGgoXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGNsYXNzOiBcImJ1dHRvbiBpcy1wcmltYXJ5XCIsXG4gICAgICAgICAgc3R5bGU6IFwibWFyZ2luLWxlZnQ6IDEwcHg7XCIsXG4gICAgICAgICAgb25jbGljazogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGFjdGlvbnMudmFsaWRhdGUoc3RhdGUsIHN0YXRlLmZvcm0uaW5wdXQpKSB7XG4gICAgICAgICAgICAgIGFjdGlvbnMuY3JlYXRlVGFzayhzdGF0ZSwgc3RhdGUuZm9ybS5pbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImNyZWF0ZVwiXG4gICAgICApLFxuICAgICAgaChcbiAgICAgICAgXCJwXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25cIixcbiAgICAgICAgICBzdHlsZTogYGRpc3BsYXk6ICR7c3RhdGUuZm9ybS5oYXNFcnJvciA/IFwiZGlzcGxheVwiIDogXCJub25lXCJ9YFxuICAgICAgICB9LFxuICAgICAgICBcIjPjgJwyMOaWh+Wtl+OBp+WFpeWKm+OBl+OBpuOBj+OBoOOBleOBhFwiXG4gICAgICApXG4gICAgKSxcbiAgICBoKFxuICAgICAgXCJ1bFwiLFxuICAgICAgeyBjbGFzczogXCJwYW5lbFwiIH0sXG4gICAgICAuLi5zdGF0ZS50YXNrcy5tYXAoKHRhc2ssIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIGgoXG4gICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgIHsgY2xhc3M6IFwicGFuZWwtYmxvY2tcIiB9LFxuICAgICAgICAgIGgoXG4gICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICBjbGFzczogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgc3R5bGU6IFwibWFyZ2luLXJpZ2h0OiAxMHB4O1wiLFxuICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBhY3Rpb25zLnJlbW92ZVRhc2soc3RhdGUsIGkpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZW1vdmVcIlxuICAgICAgICAgICksXG4gICAgICAgICAgdGFza1xuICAgICAgICApO1xuICAgICAgfSlcbiAgICApXG4gICk7XG59O1xuXG5uZXcgQXBwPFN0YXRlLCBBY3Rpb25zPih7XG4gIGVsOiAnI2FwcCcsXG4gIHN0YXRlLFxuICB2aWV3LFxuICBhY3Rpb25zXG59KTsiXX0=
