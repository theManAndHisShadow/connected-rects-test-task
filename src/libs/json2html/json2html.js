! function(e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.json2html = t() : e.json2html = t()
}(this, (() => (() => {
    "use strict";
    var e = {
            523: (e, t) => {
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.emulateEvent = t.addMultipleEventHandlers = t.isObject = t.isArray = t.isLink = void 0, t.isLink = function(e) {
                    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(e)
                }, t.isArray = function(e) {
                    return null !== e && "Array" === e.constructor.name
                }, t.isObject = function(e) {
                    return null !== e && "Object" === e.constructor.name
                }, t.addMultipleEventHandlers = function(e, t, o) {
                    e.forEach((function(e) {
                        e.addEventListener(t, (function(e) {
                            o(e)
                        }))
                    }))
                }, t.emulateEvent = function(e, t) {
                    var o = document.createEvent("Events");
                    o.initEvent(t, !0, !1), e.dispatchEvent(o)
                }
            },
            298: function(e, t) {
                var o = this && this.__spreadArray || function(e, t, o) {
                    if (o || 2 === arguments.length)
                        for (var l, r = 0, s = t.length; r < s; r++) !l && r in t || (l || (l = Array.prototype.slice.call(t, 0, r)), l[r] = t[r]);
                    return e.concat(l || Array.prototype.slice.call(t))
                };

                function l(e) {
                    var t = "\n/* generated by src/ts/lib/themes.ts generateCSSCode() function */\n    ";
                    return Object.keys(e).forEach((function(l) {
                        var r = e[l].selector,
                            s = o([], Object.keys(e[l].properties), !0).map((function(t) {
                                return "".concat(t, ": ").concat(e[l].properties[t], ";\n")
                            })).join("");
                        t += "\n".concat(r, " {\n    ").concat(s, "}\n")
                    })), t
                }

                function r(e, t) {
                    var o = document.head.querySelector(t);
                    if (o) o.innerHTML = e;
                    else {
                        var l = document.createElement("style"),
                            r = t.split("=")[0].replace(/\[+/gm, ""),
                            s = t.split("=")[1].replace(/(\]|\")+/gm, "");
                        l.type = "text/css", l.setAttribute(r, s), l.innerHTML = e, document.head.appendChild(l)
                    }
                }
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.updateTheme = t.updateThemeCSS = t.generateCSSCode = void 0, t.generateCSSCode = l, t.updateThemeCSS = r, t.updateTheme = function(e) {
                    if (/css\/themes\/[a-zA-Z\-0-9]+\.css/.test(e)) {
                        var t = e,
                            o = document.createElement("link");
                        o.href = t, o.rel = "stylesheet", document.head.appendChild(o)
                    } else {
                        var s = function(e) {
                            return {
                                dracula: {
                                    container: {
                                        selector: ".json2html-container",
                                        properties: {
                                            background: "#282a36"
                                        }
                                    },
                                    spoilerToggle: {
                                        selector: ".json2html-spoiler-toggle--collapsed, .json2html-spoiler-toggle--uncollapsed",
                                        properties: {
                                            color: "#ffffff"
                                        }
                                    },
                                    key: {
                                        selector: ".json2html-key",
                                        properties: {
                                            color: "#8be9fd"
                                        }
                                    },
                                    valueTypeBoolean: {
                                        selector: ".json2html-type__boolean",
                                        properties: {
                                            color: "#bd93f9"
                                        }
                                    },
                                    valueMinusSign: {
                                        selector: ".json2html-value__minus-sign",
                                        properties: {
                                            color: "#ff79c6"
                                        }
                                    },
                                    valueTypeNumber: {
                                        selector: ".json2html-type__number",
                                        properties: {
                                            color: "#bd93f9"
                                        }
                                    },
                                    valueTypeString: {
                                        selector: ".json2html-type__string",
                                        properties: {
                                            color: "#f1fa8c"
                                        }
                                    },
                                    valueTypeStringLink: {
                                        selector: ".json2html-type__string a, .json2html-type__string a:visited",
                                        properties: {
                                            color: "#ff79c6"
                                        }
                                    },
                                    valueTypeNull: {
                                        selector: ".json2html-type__null",
                                        properties: {
                                            color: "#6272a4"
                                        }
                                    },
                                    valueTypeUndefined: {
                                        selector: ".json2html-type__undefined",
                                        properties: {
                                            color: "#ffb86c"
                                        }
                                    },
                                    valueComplexItemSignature: {
                                        selector: ".json2html-type__array, .json2html-type__object",
                                        properties: {
                                            color: "#f8f8f2"
                                        }
                                    },
                                    collapseAllToggle: {
                                        selector: ".json2html-collapse-all-toggle",
                                        properties: {
                                            color: "white"
                                        }
                                    }
                                }
                            } [e]
                        }(e);
                        r(l(s), '[data-style-origin="json2html"]')
                    }
                }
            }
        },
        t = {};

    function o(l) {
        var r = t[l];
        if (void 0 !== r) return r.exports;
        var s = t[l] = {
            exports: {}
        };
        return e[l].call(s.exports, s, s.exports, o), s.exports
    }
    var l = {};
    return (() => {
        var e = l;
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.json2html = void 0;
        var t = o(523),
            r = o(298);

        function s(e, t) {
            t = t || e.parentElement.querySelector(".".concat("json2html-collapse-all-toggle"));
            var o = "uncollapsed" == e.className.split("--")[1] ? "collapse" : "uncollapse";
            t && (t.textContent = "(".concat(o, " all)"))
        }

        function n(e) {
            var o = Object.keys(e.parsedJSON),
                l = [],
                r = document.createElement("div");
            return r.classList.add("json2html-container"), o.forEach((function(o) {
                if ((0, t.isArray)(e.parsedJSON[o]) || (0, t.isObject)(e.parsedJSON[o])) {
                    var r = function(e) {
                        var o = e.depth + 1,
                            l = Object.values(e.itemValue),
                            r = l.length > e.groupBigArrayItemsBy,
                            p = r ? function(e, t) {
                                for (var o = 0, l = {}, r = function(r) {
                                        var s = r * t > e.length ? e.length : r * t,
                                            n = "[".concat(o, " ... ").concat(s - 1, "]"),
                                            p = e.slice(o, s),
                                            i = [];
                                        p.forEach((function(e, t) {
                                            i[t + o] = e
                                        })), o !== s && (l[n] = i), o = r * t
                                    }, s = 0; s <= Math.ceil(e.length / t); s++) r(s);
                                return l
                            }(l, e.groupBigArrayItemsBy) : e.itemValue,
                            i = Object.values(p).length,
                            a = n({
                                depth: o,
                                parsedJSON: p,
                                renderNestedLength: e.renderNestedLength,
                                highlightLinks: e.highlightLinks,
                                openLinksInNewTab: e.openLinksInNewTab,
                                collapseAll: e.collapseAll,
                                showLevel: e.showLevel,
                                showTypeOnHover: e.showTypeOnHover,
                                groupBigArrayItemsBy: e.groupBigArrayItemsBy,
                                isGroupItem: r
                            });
                        a.classList.add("json2html-nested-value");
                        var c = document.createElement("div");
                        c.classList.add("json2html-complex-pair"), c.setAttribute("data-tree-level", "".concat(o));
                        var u = document.createElement("span");
                        u.textContent = "▶", !0 === e.collapseAll ? (u.classList.add("json2html-spoiler-toggle--collapsed"), a.setAttribute("hidden", "")) : o <= e.showLevel ? u.classList.add("json2html-spoiler-toggle--uncollapsed") : (u.classList.add("json2html-spoiler-toggle--collapsed"), a.setAttribute("hidden", ""));
                        var m = document.createElement("span");
                        m.textContent = e.keyName + ": ", m.classList.add("json2html-key");
                        var h = document.createElement("span");
                        h.textContent = e.itemValue.constructor.name, i > 0 && (0, t.addMultipleEventHandlers)([u, m, h], "click", (function(e) {
                            var t = "json2html-spoiler-toggle--collapsed",
                                o = "json2html-spoiler-toggle--uncollapsed";
                            u.classList.contains(t) ? (u.classList.remove(t), u.classList.add(o), a.removeAttribute("hidden")) : (u.classList.add(t), u.classList.remove(o), a.setAttribute("hidden", "")), s(u)
                        }));
                        var g, d, y = e.itemValue.constructor.name,
                            _ = y[0].toLowerCase() + y.slice(1);
                        if (!0 === e.renderNestedLength)
                            if ((0, t.isArray)(e.itemValue)) {
                                var j = e.itemValue.length;
                                if (e.isGroupItem) {
                                    var v = Number(e.keyName.split(" ... ")[0].replace("[", ""));
                                    j = Number(e.keyName.split(" ... ")[1].replace("]", "")) - v + 1
                                }
                                var f = 0 == j ? "empty" : j,
                                    b = "empty" == f ? "" : 1 == f ? " item" : " items";
                                h.textContent += " (".concat(f).concat(b, ")")
                            } else(0, t.isObject)(e.itemValue) && 0 === Object.keys(e.itemValue).length && (h.textContent += " (empty)");
                        return h.classList.add("json2html-type__" + _), Object.values(p).length > 0 && c.appendChild(u), c.appendChild(m), c.appendChild(h), Object.values(p).length > 0 && (g = p, d = !1, Object.values(g).forEach((function(e) {
                            null !== e && ((0, t.isObject)(e) || (0, t.isArray)(e)) && (d = !0)
                        })), d) && function(e) {
                            var o = "json2html-collapse-all-toggle",
                                l = e.renderIn.querySelector("".concat(o)),
                                r = l || document.createElement("span");
                            l || (r.className = o), s(e.targetSpoiler, r), r.addEventListener("click", (function(o) {
                                e.renderIn.querySelectorAll("." + e.targetSpoiler.className).forEach((function(e) {
                                    (0, t.emulateEvent)(e, "click"), s(e)
                                }))
                            })), l || e.renderIn.appendChild(r)
                        }({
                            targetSpoiler: u,
                            renderIn: c,
                            collapsed: e.collapseAll,
                            nestedObject: p
                        }), Object.values(p).length > 0 && c.appendChild(a), c
                    }({
                        depth: e.depth,
                        keyName: o,
                        itemValue: e.parsedJSON[o],
                        renderNestedLength: e.renderNestedLength,
                        highlightLinks: e.highlightLinks,
                        openLinksInNewTab: e.openLinksInNewTab,
                        collapseAll: e.collapseAll,
                        showLevel: e.showLevel,
                        showTypeOnHover: e.showTypeOnHover,
                        groupBigArrayItemsBy: e.groupBigArrayItemsBy,
                        isGroupItem: e.isGroupItem
                    });
                    l.push(r)
                } else {
                    var p = function(e) {
                        var o = document.createElement("div");
                        o.classList.add("json2html-pair");
                        var l = document.createElement("span");
                        l.textContent = e.keyName + ": ", l.classList.add("json2html-key");
                        var r = document.createElement("span");
                        if ("number" == typeof e.itemValue && e.itemValue < 0) {
                            var s = document.createElement("span");
                            s.classList.add("json2html-value__minus-sign"), s.textContent = "-", r.appendChild(s), r.innerHTML += Math.abs(e.itemValue)
                        } else r.textContent = function(e) {
                            var t = "string" == typeof e,
                                o = e;
                            return null == e && (o = "".concat(e)), t && (o = '"'.concat(e, '"')), o
                        }(e.itemValue);
                        if (!0 === e.showTypeOnHover) {
                            var n = null == e.itemValue ? "null" : typeof e.itemValue;
                            !0 === e.highlightLinks && (0, t.isLink)(e.itemValue) && (n = "string (clickable link)"), r.setAttribute("title", n)
                        }
                        if (!0 === e.highlightLinks && (0, t.isLink)(e.itemValue)) {
                            var p = document.createElement("a");
                            !0 === e.openLinksInNewTab && p.setAttribute("target", "_blank"), p.href = e.itemValue, p.textContent = '"'.concat(e.itemValue, '"'), r.textContent = "", r.appendChild(p)
                        }
                        return r.classList.add("json2html-value"), r.classList.add(function(e) {
                            return "json2html-type__" + (null == e || "undefined" == e ? e : typeof e)
                        }(e.itemValue)), o.appendChild(l), o.appendChild(r), o
                    }({
                        keyName: o,
                        itemValue: e.parsedJSON[o],
                        highlightLinks: e.highlightLinks,
                        openLinksInNewTab: e.openLinksInNewTab,
                        showTypeOnHover: e.showTypeOnHover
                    });
                    l.push(p)
                }
            })), l.forEach((function(e) {
                r.appendChild(e)
            })), r
        }
        e.json2html = function(e) {
            var t;
            e.rootName = e.rootName || "json", e.renderNestedLength = 0 != e.renderNestedLength, e.highlightLinks = 0 != e.highlightLinks, e.openLinksInNewTab = 0 != e.openLinksInNewTab, e.collapseAll = 1 == e.collapseAll, e.showLevel = e.showLevel || 1, e.showTypeOnHover = 0 != e.showTypeOnHover, e.theme = e.theme || "andromeda", e.groupBigArrayItemsBy = e.groupBigArrayItemsBy <= 25 ? 25 : e.groupBigArrayItemsBy || 100, (0, r.updateTheme)(e.theme);
            try {
                var o = JSON.parse(e.json);
                return n({
                    depth: 0,
                    parsedJSON: (t = {}, t[e.rootName] = o, t),
                    renderNestedLength: e.renderNestedLength,
                    highlightLinks: e.highlightLinks,
                    openLinksInNewTab: e.openLinksInNewTab,
                    collapseAll: e.collapseAll,
                    showLevel: e.showLevel,
                    showTypeOnHover: e.showTypeOnHover,
                    groupBigArrayItemsBy: e.groupBigArrayItemsBy,
                    isGroupItem: !1
                })
            } catch (t) {
                e.onError(t)
            }
        }
    })(), l
})()));