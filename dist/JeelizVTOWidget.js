
"use strict";
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.owns = function (ja, na) {
  return Object.prototype.hasOwnProperty.call(ja, na);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (ja, na, ua) {
        if (ja == Array.prototype || ja == Object.prototype) return ja;
        ja[na] = ua.value;
        return ja;
      };
$jscomp.getGlobal = function (ja) {
  ja = [
    "object" == typeof globalThis && globalThis,
    ja,
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
  ];
  for (var na = 0; na < ja.length; ++na) {
    var ua = ja[na];
    if (ua && ua.Math == Math) return ua;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE =
  "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (ja, na) {
  var ua = $jscomp.propertyToPolyfillSymbol[na];
  if (null == ua) return ja[na];
  ua = ja[ua];
  return void 0 !== ua ? ua : ja[na];
};
$jscomp.polyfill = function (ja, na, ua, Oa) {
  na &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(ja, na, ua, Oa)
      : $jscomp.polyfillUnisolated(ja, na, ua, Oa));
};
$jscomp.polyfillUnisolated = function (ja, na, ua, Oa) {
  ua = $jscomp.global;
  ja = ja.split(".");
  for (Oa = 0; Oa < ja.length - 1; Oa++) {
    var xa = ja[Oa];
    if (!(xa in ua)) return;
    ua = ua[xa];
  }
  ja = ja[ja.length - 1];
  Oa = ua[ja];
  na = na(Oa);
  na != Oa &&
    null != na &&
    $jscomp.defineProperty(ua, ja, {
      configurable: !0,
      writable: !0,
      value: na,
    });
};
$jscomp.polyfillIsolated = function (ja, na, ua, Oa) {
  var xa = ja.split(".");
  ja = 1 === xa.length;
  Oa = xa[0];
  Oa = !ja && Oa in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var tb = 0; tb < xa.length - 1; tb++) {
    var va = xa[tb];
    if (!(va in Oa)) return;
    Oa = Oa[va];
  }
  xa = xa[xa.length - 1];
  ua = $jscomp.IS_SYMBOL_NATIVE && "es6" === ua ? Oa[xa] : null;
  na = na(ua);
  null != na &&
    (ja
      ? $jscomp.defineProperty($jscomp.polyfills, xa, {
          configurable: !0,
          writable: !0,
          value: na,
        })
      : na !== ua &&
        (($jscomp.propertyToPolyfillSymbol[xa] = $jscomp.IS_SYMBOL_NATIVE
          ? $jscomp.global.Symbol(xa)
          : $jscomp.POLYFILL_PREFIX + xa),
        (xa = $jscomp.propertyToPolyfillSymbol[xa]),
        $jscomp.defineProperty(Oa, xa, {
          configurable: !0,
          writable: !0,
          value: na,
        })));
};
$jscomp.assign =
  $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.assign
    ? Object.assign
    : function (ja, na) {
        for (var ua = 1; ua < arguments.length; ua++) {
          var Oa = arguments[ua];
          if (Oa) for (var xa in Oa) $jscomp.owns(Oa, xa) && (ja[xa] = Oa[xa]);
        }
        return ja;
      };
$jscomp.polyfill(
  "Object.assign",
  function (ja) {
    return ja || $jscomp.assign;
  },
  "es6",
  "es3"
);
$jscomp.arrayIteratorImpl = function (ja) {
  var na = 0;
  return function () {
    return na < ja.length ? { done: !1, value: ja[na++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (ja) {
  return { next: $jscomp.arrayIteratorImpl(ja) };
};
$jscomp.makeIterator = function (ja) {
  var na =
    "undefined" != typeof Symbol && Symbol.iterator && ja[Symbol.iterator];
  return na ? na.call(ja) : $jscomp.arrayIterator(ja);
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill(
  "Promise",
  function (ja) {
    function na() {
      this.batch_ = null;
    }
    function ua(va) {
      return va instanceof xa
        ? va
        : new xa(function (Ja, Sa) {
            Ja(va);
          });
    }
    if (ja && !$jscomp.FORCE_POLYFILL_PROMISE) return ja;
    na.prototype.asyncExecute = function (va) {
      if (null == this.batch_) {
        this.batch_ = [];
        var Ja = this;
        this.asyncExecuteFunction(function () {
          Ja.executeBatch_();
        });
      }
      this.batch_.push(va);
    };
    var Oa = $jscomp.global.setTimeout;
    na.prototype.asyncExecuteFunction = function (va) {
      Oa(va, 0);
    };
    na.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var va = this.batch_;
        this.batch_ = [];
        for (var Ja = 0; Ja < va.length; ++Ja) {
          var Sa = va[Ja];
          va[Ja] = null;
          try {
            Sa();
          } catch (fb) {
            this.asyncThrow_(fb);
          }
        }
      }
      this.batch_ = null;
    };
    na.prototype.asyncThrow_ = function (va) {
      this.asyncExecuteFunction(function () {
        throw va;
      });
    };
    var xa = function (va) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      var Ja = this.createResolveAndReject_();
      try {
        va(Ja.resolve, Ja.reject);
      } catch (Sa) {
        Ja.reject(Sa);
      }
    };
    xa.prototype.createResolveAndReject_ = function () {
      function va(fb) {
        return function (vb) {
          Sa || ((Sa = !0), fb.call(Ja, vb));
        };
      }
      var Ja = this,
        Sa = !1;
      return { resolve: va(this.resolveTo_), reject: va(this.reject_) };
    };
    xa.prototype.resolveTo_ = function (va) {
      if (va === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (va instanceof xa) this.settleSameAsPromise_(va);
      else {
        a: switch (typeof va) {
          case "object":
            var Ja = null != va;
            break a;
          case "function":
            Ja = !0;
            break a;
          default:
            Ja = !1;
        }
        Ja ? this.resolveToNonPromiseObj_(va) : this.fulfill_(va);
      }
    };
    xa.prototype.resolveToNonPromiseObj_ = function (va) {
      var Ja = void 0;
      try {
        Ja = va.then;
      } catch (Sa) {
        this.reject_(Sa);
        return;
      }
      "function" == typeof Ja
        ? this.settleSameAsThenable_(Ja, va)
        : this.fulfill_(va);
    };
    xa.prototype.reject_ = function (va) {
      this.settle_(2, va);
    };
    xa.prototype.fulfill_ = function (va) {
      this.settle_(1, va);
    };
    xa.prototype.settle_ = function (va, Ja) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            va +
            ", " +
            Ja +
            "): Promise already settled in state" +
            this.state_
        );
      this.state_ = va;
      this.result_ = Ja;
      this.executeOnSettledCallbacks_();
    };
    xa.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var va = 0; va < this.onSettledCallbacks_.length; ++va)
          tb.asyncExecute(this.onSettledCallbacks_[va]);
        this.onSettledCallbacks_ = null;
      }
    };
    var tb = new na();
    xa.prototype.settleSameAsPromise_ = function (va) {
      var Ja = this.createResolveAndReject_();
      va.callWhenSettled_(Ja.resolve, Ja.reject);
    };
    xa.prototype.settleSameAsThenable_ = function (va, Ja) {
      var Sa = this.createResolveAndReject_();
      try {
        va.call(Ja, Sa.resolve, Sa.reject);
      } catch (fb) {
        Sa.reject(fb);
      }
    };
    xa.prototype.then = function (va, Ja) {
      function Sa(zb, Gb) {
        return "function" == typeof zb
          ? function (jc) {
              try {
                fb(zb(jc));
              } catch (Xb) {
                vb(Xb);
              }
            }
          : Gb;
      }
      var fb,
        vb,
        Yb = new xa(function (zb, Gb) {
          fb = zb;
          vb = Gb;
        });
      this.callWhenSettled_(Sa(va, fb), Sa(Ja, vb));
      return Yb;
    };
    xa.prototype.catch = function (va) {
      return this.then(void 0, va);
    };
    xa.prototype.callWhenSettled_ = function (va, Ja) {
      function Sa() {
        switch (fb.state_) {
          case 1:
            va(fb.result_);
            break;
          case 2:
            Ja(fb.result_);
            break;
          default:
            throw Error("Unexpected state: " + fb.state_);
        }
      }
      var fb = this;
      null == this.onSettledCallbacks_
        ? tb.asyncExecute(Sa)
        : this.onSettledCallbacks_.push(Sa);
    };
    xa.resolve = ua;
    xa.reject = function (va) {
      return new xa(function (Ja, Sa) {
        Sa(va);
      });
    };
    xa.race = function (va) {
      return new xa(function (Ja, Sa) {
        for (
          var fb = $jscomp.makeIterator(va), vb = fb.next();
          !vb.done;
          vb = fb.next()
        )
          ua(vb.value).callWhenSettled_(Ja, Sa);
      });
    };
    xa.all = function (va) {
      var Ja = $jscomp.makeIterator(va),
        Sa = Ja.next();
      return Sa.done
        ? ua([])
        : new xa(function (fb, vb) {
            function Yb(jc) {
              return function (Xb) {
                zb[jc] = Xb;
                Gb--;
                0 == Gb && fb(zb);
              };
            }
            var zb = [],
              Gb = 0;
            do
              zb.push(void 0),
                Gb++,
                ua(Sa.value).callWhenSettled_(Yb(zb.length - 1), vb),
                (Sa = Ja.next());
            while (!Sa.done);
          });
    };
    return xa;
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Math.log2",
  function (ja) {
    return ja
      ? ja
      : function (na) {
          return Math.log(na) / Math.LN2;
        };
  },
  "es6",
  "es3"
);
$jscomp.findInternal = function (ja, na, ua) {
  ja instanceof String && (ja = String(ja));
  for (var Oa = ja.length, xa = 0; xa < Oa; xa++) {
    var tb = ja[xa];
    if (na.call(ua, tb, xa, ja)) return { i: xa, v: tb };
  }
  return { i: -1, v: void 0 };
};
$jscomp.polyfill(
  "Array.prototype.find",
  function (ja) {
    return ja
      ? ja
      : function (na, ua) {
          return $jscomp.findInternal(this, na, ua).v;
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Object.is",
  function (ja) {
    return ja
      ? ja
      : function (na, ua) {
          return na === ua
            ? 0 !== na || 1 / na === 1 / ua
            : na !== na && ua !== ua;
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Array.prototype.includes",
  function (ja) {
    return ja
      ? ja
      : function (na, ua) {
          var Oa = this;
          Oa instanceof String && (Oa = String(Oa));
          var xa = Oa.length;
          ua = ua || 0;
          for (0 > ua && (ua = Math.max(ua + xa, 0)); ua < xa; ua++) {
            var tb = Oa[ua];
            if (tb === na || Object.is(tb, na)) return !0;
          }
          return !1;
        };
  },
  "es7",
  "es3"
);
$jscomp.checkStringArgs = function (ja, na, ua) {
  if (null == ja)
    throw new TypeError(
      "The 'this' value for String.prototype." +
        ua +
        " must not be null or undefined"
    );
  if (na instanceof RegExp)
    throw new TypeError(
      "First argument to String.prototype." +
        ua +
        " must not be a regular expression"
    );
  return ja + "";
};
$jscomp.polyfill(
  "String.prototype.includes",
  function (ja) {
    return ja
      ? ja
      : function (na, ua) {
          return (
            -1 !==
            $jscomp.checkStringArgs(this, na, "includes").indexOf(na, ua || 0)
          );
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Array.prototype.findIndex",
  function (ja) {
    return ja
      ? ja
      : function (na, ua) {
          return $jscomp.findInternal(this, na, ua).i;
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Promise.prototype.finally",
  function (ja) {
    return ja
      ? ja
      : function (na) {
          return this.then(
            function (ua) {
              return Promise.resolve(na()).then(function () {
                return ua;
              });
            },
            function (ua) {
              return Promise.resolve(na()).then(function () {
                throw ua;
              });
            }
          );
        };
  },
  "es9",
  "es3"
);
$jscomp.polyfill(
  "Math.sign",
  function (ja) {
    return ja
      ? ja
      : function (na) {
          na = Number(na);
          return 0 === na || isNaN(na) ? na : 0 < na ? 1 : -1;
        };
  },
  "es6",
  "es3"
);
var JeelizVTOWidget = (function () {
  function ja() {
    Ra.mode = qb.realtime;
    Ra.isRT = !0;
    Ba.adjust = document.getElementById("JeelizVTOWidgetAdjust");
    if (Ba.adjust) {
      Ba.adjustNotice = document.getElementById("JeelizVTOWidgetAdjustNotice");
      Ba.adjustExit = document.getElementById("JeelizVTOWidgetAdjustExit");
      Ba.changeModelContainer = document.getElementById(
        "JeelizVTOWidgetChangeModelContainer"
      );
      Ba.buttonResizeCanvas = document.getElementById("buttonResizeCanvas");
      var S = Ba.adjust;
      S && S.addEventListener("click", zb, !1);
      (S = Ba.adjustExit) && S.addEventListener("click", Gb, !1);
      [Ba.adjust, Ba.changeModelContainer, Ba.buttonResizeCanvas].forEach(ua);
    }
    Zb.enabled && Ua.do_instantDetection(Zb.interval, Zb.callback);
    kc && (kc(!0), (kc = null));
  }
  function na() {
    var S = document.createElement("style");
    S.setAttribute("type", "text/css");
    S.innerHTML =
      "._jeelizVTOForceHide { display: none!important }._jeelizVTOForceShow { display: revert!important }";
    var V = document.getElementsByTagName("head");
    1 <= V.length ? V[0].appendChild(S) : document.body.appendChild(S);
  }
  function ua(S) {
    S &&
      (S.classList.remove("_jeelizVTOForceHide"),
      "none" === window.getComputedStyle(S).display &&
        S.classList.add("_jeelizVTOForceShow"));
  }
  function Oa(S) {
    S &&
      (S.classList.add("_jeelizVTOForceHide"),
      S.classList.remove("_jeelizVTOForceShow"));
  }
  function xa(S, V) {
    if (S) for (var pa in V) S.style[pa] = V[pa];
  }
  function tb(S) {
    if (!S) return { width: 0, height: 0 };
    S = S.getBoundingClientRect();
    return { width: S.width, height: S.height };
  }
  function va(S) {
    return new Promise(function (V, pa) {
      var Ea = new XMLHttpRequest();
      Ea.open("GET", S, !0);
      Ea.onreadystatechange = function () {
        if (4 === Ea.readyState)
          if (200 === Ea.status || 0 === Ea.status)
            try {
              var Ka = JSON.parse(Ea.responseText);
              V(Ka);
            } catch (xb) {
              pa("INVALID JSON");
            }
          else pa("HTTP ERROR " + Ea.status);
      };
      Ea.send();
    });
  }
  function Ja(S, V) {
    return fetch(S, { method: "GET", mode: "cors", cache: "no-cache" })
      .then(function (pa) {
        return pa.json();
      })
      .then(function (pa) {
        var Ea = pa.tweaker;
        return Sa(pa.modelURL, V).then(function () {
          $c(Ea, null);
        });
      });
  }
  function Sa(S, V) {
    return new Promise(function (pa, Ea) {
      va(S)
        .then(function (Ka) {
          ad(V, Ka, pa);
        })
        .catch(Ea);
    });
  }
  function fb() {
    wb.toggle_loading(!1);
    Ra.mode = qb.realtime;
    vb("INVALID_SKU");
  }
  function vb(S) {
    Kc.error ? Kc.error(S) : console.log("ERROR:", S);
  }
  function Yb(S) {
    var V = tb(Ba.container),
      pa = Math.abs(gb.displayWidth - V.width),
      Ea = Math.abs(gb.displayHeight - V.height);
    if (!S && 1 >= pa && 1 >= Ea && 1 === gb.oFactor)
      console.log(
        "INFO in JeelizVTOWidget.resize: resolution difference too small. Abort resize"
      );
    else if (
      ((gb.displayWidth = V.width),
      (gb.displayHeight = V.height),
      (gb.oFactor = 1),
      console.log(
        "INFO in JeelizVTOWidget.resize: width = " +
          gb.displayWidth.toString() +
          " height = " +
          gb.displayHeight.toString() +
          " oFactor = " +
          (1).toString()
      ),
      (gb.cvWidth = Math.round(1 * gb.displayWidth)),
      (gb.cvHeight = Math.round(1 * gb.displayHeight)),
      xa(Ba.cv, {
        width: gb.displayWidth.toString() + "px",
        height: gb.displayHeight.toString() + "px",
      }),
      (Ba.cv.width = gb.cvWidth),
      (Ba.cv.height = gb.cvHeight),
      Ua)
    )
      if (Ra.mode === qb.notLoaded) Ua.set_size(gb.cvWidth, gb.cvHeight, !1);
      else
        Ua.onLoad(function () {
          Ua.resize(gb.cvWidth, gb.cvHeight, !1, S);
        });
  }
  function zb() {
    [Ba.adjust, Ba.changeModelContainer, Ba.buttonResizeCanvas].forEach(Oa);
    Ra.mode = qb.adjust;
    [Ba.adjustNotice, Ba.adjustExit].forEach(ua);
    Ba.cv.style.setProperty("cursor", "move");
    Ua.switch_modeInteractor("movePinch");
    vc("ADJUST_START");
  }
  function Gb() {
    [Ba.adjustNotice, Ba.adjustExit].forEach(Oa);
    [Ba.adjust, Ba.changeModelContainer, Ba.buttonResizeCanvas].forEach(ua);
    Ba.cv.style.setProperty("cursor", "auto");
    Ra.mode = Ra.realtime;
    Ua.switch_modeInteractor("idle");
    vc("ADJUST_END");
  }
  function jc() {
    if (!Ba.trackIframe) {
      var S = Mb.appstaticURL + "jeewidget/";
      Ba.trackIframe = document.createElement("iframe");
      Ba.trackIframe.width = "8";
      Ba.trackIframe.height = "8";
      Ba.trackIframe.src = S + "trackIframe.html";
      Ba.trackIframe.style.border = "none";
      xa(Ba.trackIframe, {
        position: "fixed",
        zIndex: -1,
        bottom: "0",
        right: "-10px",
      });
      window.addEventListener(
        "beforeunload",
        Xb.bind(null, "WINDOW_UNLOAD", null)
      );
      Ba.container.appendChild(Ba.trackIframe);
    }
  }
  function Xb(S, V) {
    if (Ba.trackIframe) {
      var pa = location.href.split("?").shift().split("://").pop();
      pa = pa.split("/").shift();
      pa = pa.split("www.").pop();
      S = { action: S, domain: pa };
      V && (S.sku = V);
      try {
        Ba.trackIframe.contentWindow.postMessage(S, "*");
      } catch (Ea) {}
    }
  }
  function bd(S, V) {
    Ra.mode = qb.realtime;
    V && V();
    wb.toggle_loading(!1);
    Xb("COUNT_TRY_ON_SESSION", S);
  }
  function cd(S) {
    if (S.isAutoVTO)
      return Mb.autoVTOURL + "getByProductPage/" + encodeURIComponent(S.mod);
    var V = S.mod + ".json";
    return S.isStandalone ? lc + "models3DStandalone/" + V : V;
  }
  function dd(S, V, pa, Ea) {
    var Ka = cd(V);
    V.isAutoVTO
      ? Ja(Ka, S).then(pa)
      : V.isStandalone
      ? Sa(Ka, S).then(pa)
      : Ua.load_model(Ka, V.mats, bd.bind(null, S, pa), S, Ea);
  }
  function ad(S, V, pa) {
    Ua.set_modelStandalone(V, bd.bind(null, S, pa), S);
  }
  function vc(S) {
    (S = ed[S]) && S();
  }
  function Lc() {
    wc && wc.detach();
    wc = null;
  }
  function xc() {
    Lc();
    wc = new Ad(Ba.container, function (S) {
      wb.resize(!1);
    });
  }
  function $c(S, V) {
    V = V || { scale: 1 };
    S
      ? (Nb.set_tweaker({
          preScale: S.scale * V.scale,
          preOffset: [0, S.dy, S.dz],
          rx: S.rx,
          beginBendZ: S.templesBendingOffset,
          bendStrength: S.templesBendingStrength,
          maskBranchStartEnd: S.templesFading,
        }),
        Bd(S),
        Cd(S.materials, S.templesTextureCopyMode || 0))
      : (Nb.set_tweaker({ preScale: V.scale }), fd());
  }
  function Dd(S, V) {
    if (!S.materials) return [0, 0, 0, 0];
    if (!S.lensesYGradientEnabled || "lenses" !== V.id)
      return [V.alpha, V.alpha, 0, 0];
    var pa = -30 * S.lensesYGradientHeight - 40,
      Ea = 50 * S.lensesYGradientSmoothness;
    return [
      V.alpha * S.lensesYGradientAlphaMinFactor,
      V.alpha,
      pa - 0.5 * Ea,
      pa + 0.5 * Ea,
    ];
  }
  function Bd(S) {
    S && 0 !== S.materials.length
      ? S.materials.forEach(function (V) {
          var pa = Dd(S, V);
          V.matInds.forEach(function (Ea) {
            Nb.update_material(
              Ea,
              {
                metalness: V.metalness,
                roughness: V.roughness,
                fresnelMin: V.fresnelRange[0],
                fresnelMax: V.fresnelRange[1],
                diffuseColor: V.color,
                isDisableColorTexture: V.isDisableColorTexture,
                alpha: pa,
                alphaUsage: 1,
                whiteToAlpha: V.whiteToAlpha || 0,
              },
              !1
            );
          });
        })
      : fd();
  }
  function Ed(S) {
    return (S = S.find(function (V) {
      return "temples" === V.id;
    }))
      ? S.matInds
      : [];
  }
  function Cd(S, V) {
    if (V) {
      var pa = Ed(S);
      2 === pa.length &&
        (2 === V && pa.reverse(),
        Nb.get_materialsSpec().then(function (Ea) {
          Nb.update_material(
            pa[0],
            { diffuseTexture: Ea[pa[1]].diffuseTexture },
            !0
          );
        }));
    }
  }
  function fd() {
    Nb.get_materialsSpec().then(function (S) {
      S = S.length;
      for (var V = 0; V < S; ++V) Nb.update_material(V, { alphaUsage: 1 });
    });
  }
  function Fd(S) {
    return S
      ? "json" === S.split(".").pop().toLowerCase()
        ? Promise.resolve(S)
        : va(Mb.glassesDBURL + S).then(function (V) {
            return V.intrinsic ? cd(V.intrinsic) : "";
          })
      : Promise.resolve("");
  }
  var Nb = (function () {
      function S(a, b) {
        return a[0] * (1 - b) + a[1] * b;
      }
      function V(a, b) {
        var d = new XMLHttpRequest();
        d.open("GET", a, !0);
        d.withCredentials = !1;
        d.onreadystatechange = function () {
          4 !== d.readyState ||
            (200 !== d.status && 0 !== d.status) ||
            b(d.responseText);
        };
        d.send();
      }
      function pa(a, b) {
        V(a + "", function (d) {
          b(JSON.parse(d));
        });
      }
      function Ea(a, b) {
        if (0 === b || "object" !== typeof a) return a;
        a = Object.assign({}, a);
        b = void 0 === b || -1 === b ? -1 : b - 1;
        for (var d in a) a[d] = Ea(a[d], b);
        return a;
      }
      function Ka(a) {
        return 0.5 > a
          ? 4 * a * a * a
          : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1;
      }
      function xb(a) {
        switch (a) {
          case "relu":
            return "gl_FragColor=max(vec4(0.),gl_FragColor);";
          case "elu":
            return "gl_FragColor=mix(exp(-abs(gl_FragColor))-vec4(1.),gl_FragColor,step(0.,gl_FragColor));";
          case "elu01":
            return "gl_FragColor=mix(0.1*exp(-abs(gl_FragColor))-vec4(0.1),gl_FragColor,step(0.,gl_FragColor));";
          case "arctan":
            return "gl_FragColor=atan(3.14159265359*texture2D(u0,vUV))/3.14159265359;";
          case "copy":
            return "";
          case "gelu":
            return "gl_FragColor=gl_FragColor;\n          vec4 zou=gl_FragColor;\n          vec4 polyZou=0.7978845608028654*(zou+0.044715*zou*zou*zou);\n          vec4 exZou=exp(-abs(polyZou));\n          vec4 exZou2=exZou*exZou;\n          vec4 tanhZou=sign(polyZou)*(vec4(1.)-exZou2)/(vec4(1.)+exZou2);\n          gl_FragColor=0.5*zou*(vec4(1.)+tanhZou);";
          default:
            return !1;
        }
      }
      function La(a, b) {
        var d = b % 8;
        return (a[(b - d) / 8] >> (7 - d)) & 1;
      }
      function mb(a, b, d) {
        var f = 1,
          l = 0;
        for (d = b + d - 1; d >= b; --d) (l += f * La(a, d)), (f *= 2);
        return l;
      }
      function Ab(a) {
        a = a.data;
        a =
          "undefined" === typeof btoa && "undefined" !== typeof Buffer
            ? Buffer.from(a, "base64").toString("latin1")
            : atob(a);
        for (var b = a.length, d = new Uint8Array(b), f = 0; f < b; ++f)
          d[f] = a.charCodeAt(f);
        return d;
      }
      function Hb(a) {
        return "string" === typeof a ? JSON.parse(a) : a;
      }
      function Rb(a) {
        return "undefined" === typeof Hb(a).nb ? Ob(a) : $b(a);
      }
      function $b(a) {
        var b = Hb(a);
        a = b.nb;
        if (0 === a) return new Uint8Array(b.nb);
        var d = b.n;
        b = Ab(b);
        for (var f = new Uint32Array(d), l = 0; l < d; ++l)
          f[l] = mb(b, l * a, a);
        return f;
      }
      function Ob(a) {
        var b = Hb(a);
        a = b.ne;
        var d = b.nf,
          f = b.n;
        b = Ab(b);
        for (
          var l = new Float32Array(f),
            p = new Float32Array(d),
            u = a + d + 1,
            h = 0;
          h < f;
          ++h
        ) {
          var m = u * h,
            q = 0 === La(b, m) ? 1 : -1,
            v = mb(b, m + 1, a),
            J = b;
          m = m + 1 + a;
          for (var t = p.length, x = 0, z = m; z < m + t; ++z)
            (p[x] = La(J, z)), ++x;
          for (m = J = 0; m < d; ++m) J += p[m] * Math.pow(2, -m - 1);
          l[h] =
            0 === J && 0 === v
              ? 0
              : q * (1 + J) * Math.pow(2, 1 + v - Math.pow(2, a - 1));
        }
        return l;
      }
      function mc(a) {
        var b = null,
          d = null,
          f = null,
          l = 0,
          p = this,
          u = null,
          h = { Nc: [], Zd: "none", fg: !1, Yd: null, grid: null };
        this.m = function () {
          this.Wk(u.Nc);
          f.Do({ Zd: u.Zd, fg: u.fg, Yd: u.Yd });
        };
        this.cm = function (m) {
          return b[m];
        };
        this.ue = function (m) {
          ["s32", "s34", "s27"].forEach(function (q) {
            aa.j(q, [{ type: "2f", name: "u21", value: m }]);
          });
          b &&
            b.forEach(function (q) {
              q.ue(m);
            });
        };
        this.Wk = function (m) {
          var q = null;
          l = m.length;
          var v =
              null !== u.grid &&
              a.grid.length &&
              !(1 === a.grid[0] && 1 === a.grid[1]),
            J = v ? u.grid : [1, 1];
          v && this.ue(J);
          b = m.map(function (t, x) {
            t = Object.assign({}, t, {
              index: x,
              parent: p,
              de: q,
              Mm: x === l - 1,
              Ic: v,
              za: J,
            });
            return (q = 0 === x ? Gd.instance(t) : Hd.instance(t));
          });
          d = b[0];
          f = b[l - 1];
          b.forEach(function (t, x) {
            0 !== x && t.Bn();
          });
        };
        this.Aa = function (m) {
          m.h(0);
          var q = m;
          b.forEach(function (v) {
            q = v.Aa(q, !1);
          });
          return q;
        };
        this.ai = function () {
          return d.bm();
        };
        this.Fc = function () {
          return f.fm();
        };
        this.Xh = function () {
          return f.Xh();
        };
        this.A = function () {
          b &&
            (b.forEach(function (m) {
              m.A();
            }),
            (f = d = b = null),
            (l = 0));
        };
        "undefined" !== typeof a && ((u = Object.assign({}, h, a)), this.m());
      }
      function Pb(a, b) {
        a[b] = !0;
        a.setAttribute(b, "true");
      }
      function nc() {
        var a = !1,
          b = navigator.userAgent || navigator.vendor || window.opera;
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            b
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            b.substr(0, 4)
          )
        )
          a = !0;
        return a;
      }
      function yc(a, b) {
        window.addEventListener(
          "beforeunload",
          function () {
            b &&
              b.getTracks &&
              b.getTracks().forEach(function (d) {
                b.removeTrack(d);
              });
            a.videoStream && a.videoStream.stop();
            a.videoStream = null;
          },
          !1
        );
      }
      function zc() {
        var a = navigator.userAgent.toLowerCase();
        return -1 !== a.indexOf("safari") && -1 === a.indexOf("chrome")
          ? !0
          : !1;
      }
      function Ac(a) {
        if (!a) return a;
        var b = null;
        if (a.video) {
          var d = function (f) {
            return f && "object" === typeof f ? Object.assign({}, f) : f;
          };
          b = {};
          "undefined" !== typeof a.video.width && (b.width = d(a.video.width));
          "undefined" !== typeof a.video.height &&
            (b.height = d(a.video.height));
          "undefined" !== typeof a.video.facingMode &&
            (b.facingMode = d(a.video.facingMode));
        }
        b = { audio: a.audio, video: b };
        "undefined" !== typeof a.deviceId && oc(b, a.deviceId);
        return b;
      }
      function oc(a, b) {
        b &&
          ((a.video = a.video || {}),
          (a.video.deviceId = { exact: b }),
          a.video.facingMode && delete a.video.facingMode);
      }
      function ac(a) {
        var b = a.video.width;
        a.video.width = a.video.height;
        a.video.height = b;
        return a;
      }
      function Bc(a) {
        function b(t) {
          return [
            480, 576, 640, 648, 720, 768, 800, 960, 1080, 1152, 1280, 1366,
            1920,
          ].sort(function (x, z) {
            return Math.abs(x - t) - Math.abs(z - t);
          });
        }
        function d(t) {
          var x = Ac(a);
          t = t(x);
          l.push(t);
          f(t);
        }
        function f(t) {
          if (t.video && t.video.facingMode && t.video.facingMode.exact) {
            var x = t.video.facingMode.exact;
            t = Ac(t);
            delete t.video.facingMode.exact;
            t.video.facingMode.ideal = x;
            l.push(t);
          }
        }
        var l = [];
        if (!a || !a.video) return l;
        f(a);
        if (a.video.width && a.video.height) {
          if (a.video.width.ideal && a.video.height.ideal) {
            var p = b(a.video.width.ideal).slice(0, 3),
              u = b(a.video.height.ideal).slice(0, 3),
              h = {},
              m = 0;
            for (h.Ib = void 0; m < p.length; h = { Ib: h.Ib }, ++m) {
              h.Ib = p[m];
              var q = {},
                v = 0;
              for (q.xb = void 0; v < u.length; q = { xb: q.xb }, ++v)
                if (
                  ((q.xb = u[v]),
                  h.Ib !== a.video.width.ideal || q.xb !== a.video.height.ideal)
                ) {
                  var J = Math.max(h.Ib, q.xb) / Math.min(h.Ib, q.xb);
                  J < 4 / 3 - 0.1 ||
                    J > 16 / 9 + 0.1 ||
                    d(
                      (function (t, x) {
                        return function (z) {
                          z.video.width.ideal = t.Ib;
                          z.video.height.ideal = x.xb;
                          return z;
                        };
                      })(h, q)
                    );
                }
            }
          }
          d(function (t) {
            return ac(t);
          });
        }
        a.video.width &&
          a.video.height &&
          (a.video.width.ideal &&
            a.video.height.ideal &&
            d(function (t) {
              delete t.video.width.ideal;
              delete t.video.height.ideal;
              return t;
            }),
          d(function (t) {
            delete t.video.width;
            delete t.video.height;
            return t;
          }));
        a.video.facingMode &&
          (d(function (t) {
            delete t.video.facingMode;
            return t;
          }),
          a.video.width &&
            a.video.height &&
            d(function (t) {
              ac(t);
              delete t.video.facingMode;
              return t;
            }));
        l.push({ audio: a.audio, video: !0 });
        return l;
      }
      function pc(a) {
        a.volume = 0;
        Pb(a, "muted");
        if (zc()) {
          if (1 === a.volume) {
            var b = function () {
              a.volume = 0;
              window.removeEventListener("mousemove", b, !1);
              window.removeEventListener("touchstart", b, !1);
            };
            window.addEventListener("mousemove", b, !1);
            window.addEventListener("touchstart", b, !1);
          }
          setTimeout(function () {
            a.volume = 0;
            Pb(a, "muted");
          }, 5);
        }
      }
      function Id(a) {
        var b = Ha.element,
          d = Ha.wh;
        return null === b
          ? Promise.resolve()
          : new Promise(function (f, l) {
              if (b.srcObject && b.srcObject.getVideoTracks) {
                var p = b.srcObject.getVideoTracks();
                1 !== p.length
                  ? l("INVALID_TRACKNUMBER")
                  : ((p = p[0]), a ? gd(b, f, l, d) : (p.stop(), f()));
              } else l("BAD_IMPLEMENTATION");
            });
      }
      function hd(a, b, d, f) {
        function l(u) {
          p || ((p = !0), d(u));
        }
        var p = !1;
        navigator.mediaDevices
          .getUserMedia(f)
          .then(function (u) {
            function h() {
              setTimeout(function () {
                if (a.currentTime) {
                  var q = a.videoHeight;
                  if (0 === a.videoWidth || 0 === q) l("VIDEO_NULLSIZE");
                  else {
                    q = { dl: null, Fg: null, jn: null };
                    try {
                      var v = u.getVideoTracks()[0];
                      v &&
                        ((q.jn = v),
                        (q.dl = v.getCapabilities()),
                        (q.Fg = v.getSettings()));
                    } catch (J) {}
                    p || (yc(a, u), b(a, u, q));
                  }
                } else l("VIDEO_NOTSTARTED");
              }, 700);
            }
            function m() {
              a.removeEventListener("loadeddata", m, !1);
              var q = a.play();
              pc(a);
              "undefined" === typeof q
                ? h()
                : q
                    .then(function () {
                      h();
                    })
                    .catch(function () {
                      l("VIDEO_PLAYPROMISEREJECTED");
                    });
            }
            "undefined" !== typeof a.srcObject
              ? (a.srcObject = u)
              : ((a.src = window.URL.createObjectURL(u)), (a.videoStream = u));
            pc(a);
            a.addEventListener("loadeddata", m, !1);
          })
          .catch(function (u) {
            l(u);
          });
      }
      function gd(a, b, d, f) {
        a
          ? navigator.mediaDevices && navigator.mediaDevices.getUserMedia
            ? (Pb(a, "autoplay"),
              Pb(a, "playsinline"),
              f && f.audio ? (a.volume = 0) : Pb(a, "muted"),
              Jd(f).then(function () {
                hd(
                  a,
                  b,
                  function () {
                    function l(u) {
                      if (0 === u.length)
                        d("NO_VALID_MEDIASTREAM_FALLBACK_CONSTRAINTS");
                      else {
                        var h = u.shift();
                        hd(
                          a,
                          b,
                          function () {
                            l(u);
                          },
                          h
                        );
                      }
                    }
                    var p = Bc(f);
                    l(p);
                  },
                  f
                );
              }))
            : d && d("MEDIASTREAMAPI_NOT_FOUND")
          : d && d("VIDEO_NOT_PROVIDED");
      }
      function Jd(a) {
        if (!a || !a.video || !a.video.facingMode)
          return Promise.resolve("NO_VIDEO_CONSTRAINTS");
        if (a.video.deviceId) return Promise.resolve("DEVICEID_ALREADY_SET");
        var b = a.video.facingMode;
        b = b.exact || b.ideal;
        if (!b) return Promise.resolve("NO_FACINGMODE");
        var d = { user: [], environment: ["camera2 0"] }[b];
        return d && 0 !== d.length
          ? new Promise(function (f) {
              id(function (l) {
                l
                  ? (l = l.find(function (p) {
                      var u = p.label;
                      return u
                        ? d.some(function (h) {
                            return u.includes(h);
                          })
                        : !1;
                    }))
                    ? ((a.video.deviceId = { exact: l.deviceId }), f("SUCCESS"))
                    : f("NO_PREFERRED_DEVICE_FOUND")
                  : f("NO_DEVICES_FOUND");
              });
            })
          : Promise.resolve("NO_PREFERRED_CAMERAS");
      }
      function id(a) {
        navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
          ? navigator.mediaDevices
              .enumerateDevices()
              .then(function (b) {
                (b = b.filter(function (d) {
                  return (
                    d.kind &&
                    -1 !== d.kind.toLowerCase().indexOf("video") &&
                    d.label &&
                    d.deviceId
                  );
                })) &&
                b.length &&
                0 < b.length
                  ? a(b, !1)
                  : a(!1, "NODEVICESFOUND");
              })
              .catch(function () {
                a(!1, "PROMISEREJECTED");
              })
          : a(!1, "NOTSUPPORTED");
      }
      function Kd() {
        function a(L) {
          L = L ? Cc.gf : 1;
          ra.width = L * K.width;
          ra.height = L * K.height;
          return ra;
        }
        function b(L) {
          var R = L.length - 1,
            Z = L[R];
          if ("data:" === Z.substring(0, 5)) return Z;
          for (Z = ""; 0 <= R; --R) {
            var sa = L[R],
              Na = "http" === sa.substring(0, 4).toLowerCase();
            Z = sa + Z;
            if (Na) break;
          }
          return Z;
        }
        function d(L, R, Z) {
          return new Promise(function (sa) {
            Aa.Jj(R);
            Fa.ba();
            nb.isEnabled = !0;
            $a.isEnabled = !1;
            nb.pa || (nb.pa = qc.instance({}));
            L.ci() && (nb.pa.xg(L.ci()), Aa.ra(nb.pa));
            L.set();
            $a.isEnabled = !1;
            t();
            var Na = ob.Zh(Z);
            setTimeout(function () {
              nb.isEnabled = !1;
              Aa.Jj(!1);
              sa(Na);
            }, 1);
          });
        }
        function f(L, R) {
          wa.Xc = 0.5;
          return new Promise(function (Z) {
            $a.bc = L;
            $a.isEnabled = !0;
            $a.C = function () {
              var sa = jd.instance(R());
              $a.C = null;
              Z(sa);
            };
          });
        }
        function l(L, R) {
          return new Promise(function (Z, sa) {
            pa(R + L, function (Na) {
              Na.error
                ? sa("SKU_NOT_FOUND")
                : Z({ kn: Na.intrinsic.mod + ".json", hn: Na.intrinsic.mats });
            });
          });
        }
        function p(L, R) {
          var Z = b([K.ea, K.wa, K.Vd + "/"]);
          R = R.map(function (sa) {
            return Z + sa;
          });
          W.model = {
            url: b([K.ea, K.wa, K.Wd + "/" + L]),
            ac: R,
            jh: !1,
            ih: !1,
          };
          return new Promise(function (sa) {
            Qa.Hi(W.model, function () {
              ea.isBusy = !1;
              sa();
            });
          });
        }
        function u(L, R) {
          if (!R) return L;
          L = L.slice(0);
          var Z = ab.tf().map(function (kb) {
              return kb.toLowerCase();
            }),
            sa;
          for (sa in R) {
            var Na = R[sa],
              sb = -1;
            sb = "number" === typeof sa ? sa : Z.indexOf(sa.toLowerCase());
            -1 !== sb && (L[sb] = Na);
          }
          return L;
        }
        function h(L, R) {
          return new Promise(function (Z, sa) {
            ea.set_model(
              L,
              function () {
                ea.set_materials(R, function () {
                  ea.isBusy = !1;
                  Z();
                });
              },
              function () {
                ea.isBusy = !1;
                sa("CANNOT_LOAD_MODEL");
              }
            );
          });
        }
        function m(L, R) {
          L &&
            (R && z(),
            L.preOffset && (bc = L.preOffset),
            L.preScale && (cc = L.preScale),
            void 0 !== L.rx && (I = L.rx),
            void 0 !== L.beginBendZ && (T = L.beginBendZ),
            void 0 !== L.bendStrength && (Ub = L.bendStrength),
            L.maskBranchStartEnd && (Vb = L.maskBranchStartEnd),
            ea.ready && Qa.xe());
        }
        function q(L) {
          L.tweaker ? m(L.tweaker, !0) : (z(), ea.ready && Qa.xe());
        }
        function v() {
          ea.load_model = function (L, R, Z, sa, Na, sb) {
            if (ea.isBusy) return !1;
            ea.isBusy = !0;
            R = u(R, Na);
            (W.model ? h(L, R) : p(L, R)).then(Z).catch(sb);
            return !0;
          };
          ea.set_offset = function (L) {
            qa = L;
            Qa.ve();
          };
          ea.set_scale = function (L) {
            oa = L;
            Qa.we();
          };
          ea.set_rx = function (L) {
            Ca = L;
            Qa.Yj();
          };
          ea.switch_shadow = Aa.Kg;
          ea.switch_bgBlur = Aa.Jg;
          ea.set_zoom = Aa.wg;
          ea.is_viewer3D = function () {
            return Da === Ga.Ka;
          };
          ea.switch_viewer3D = function (L, R) {
            if (
              Da === Ga.mc ||
              Da === Ga.nc ||
              (Da === Ga.Y && !L) ||
              (Da === Ga.Ka && L) ||
              $a.isEnabled
            )
              return !1;
            if (Da === Ga.va)
              return Bb !== Ga.Ka || L
                ? Bb === Ga.Y && L
                  ? ((Bb = Ga.Ka), Aa.ra(wa.Hb), Aa.cb(1), R && R(), !0)
                  : !1
                : ((Bb = Ga.Y), Aa.ra(wa.Ja), Aa.cb(0), R && R(), !0);
            var Z = 0,
              sa = -1,
              Na = 0;
            Da === Ga.Y
              ? ((Da = Ga.mc), (sa = K.mp))
              : Da === Ga.Ka && ((Da = Ga.nc), (sa = K.pp));
            var sb = Mc.pf();
            rb = setInterval(function () {
              var kb = Mc.pf();
              Z += (kb - sb) / sa;
              1 <= Z &&
                ((Z = 1),
                Da === Ga.mc
                  ? ((Da = Ga.Ka), Aa.ra(wa.Hb))
                  : ((Da = Ga.Y), Aa.ra(wa.Ja)),
                R && R(),
                clearInterval(rb),
                (rb = null));
              var Sb = Da === Ga.nc || Da === Ga.Y ? 1 - K.kp(Z) : K.jp(Z);
              Aa.cb(Sb);
              (Da !== Ga.nc && Da !== Ga.mc) ||
                0 !== Na++ % 2 ||
                (Aa.ra(wa.Zf), wa.Zf.xo(Sb));
              sb = kb;
            }, 0.016);
            return !0;
          };
          ea.capture_image = function (L, R, Z, sa) {
            $a.bc = L;
            $a.isEnabled = !0;
            "undefined" === typeof isAllocate && (Z = !1);
            (sa = "undefined" === typeof sa ? !1 : sa) && Aa.oe(!1);
            M();
            $a.C = function () {
              Aa.ej(0);
              c.flush();
              var Na = ob.Zh(Z);
              R(Na);
              sa && Aa.oe(!0);
            };
          };
          ea.capture_detection = function (L, R) {
            var Z = null === ia.Kb ? ia.kb : ia.$c;
            f(L, function () {
              return {
                nd: ta.pc.clone(),
                $f: ab.gi(),
                Vf: ab.ei(),
                background: Z.clone(),
                pa: ya.La.hi().clone(),
                Uf: pb,
              };
            }).then(R);
          };
          ea.process_image = function (L) {
            function R() {
              return new Promise(function (Cb, ub) {
                $a.Ug = kb.updateLightInterval;
                f(kb.nSteps, Z).then(function (lb) {
                  $a.Ug = 3;
                  lb
                    ? 1 >= lb.hm().data[0]
                      ? (lb.I(), ub("FACE_NOT_FOUND"))
                      : d(lb, kb.isMask, !0).then(function (Ld) {
                          Aa.ra(wa.Ja);
                          lb.I();
                          Cb(Ld);
                        })
                    : ub("CRITICAL");
                });
                t();
              });
            }
            function Z() {
              return {
                nd: ta.pc.clone(),
                $f: !1,
                Vf: !1,
                background: ia.kb.clone(!0),
                pa: ya.La.hi().clone(),
              };
            }
            function sa() {
              return new Promise(function (Cb, ub) {
                l(kb.modelSKU, kb.glassesDBURL)
                  .then(function (lb) {
                    ea.load_model(
                      lb.kn,
                      lb.hn,
                      function () {
                        Cb();
                      },
                      kb.modelSKU,
                      null,
                      function () {
                        ub("CANNOT_LOAD_MODEL");
                      }
                    );
                  })
                  .catch(function (lb) {
                    ub(lb);
                  });
              });
            }
            function Na() {
              if (kb.image) {
                var Cb = kb.image;
                sb(Cb);
                return Promise.resolve(Cb);
              }
              return new Promise(function (ub) {
                var lb = new Image();
                lb.onload = function () {
                  sb(lb);
                  ub();
                };
                lb.src = kb.imageBase64;
              });
            }
            function sb(Cb) {
              var ub = Cb.width,
                lb = Cb.height;
              if (ub !== K.width || lb !== K.height)
                Ha.Md && ((Ha.element.width = ub), (Ha.element.height = lb)),
                  G(ub, lb, kb.overSamplingFactor);
              Ha.Lh.drawImage(Cb, 0, 0);
              M();
            }
            var kb = Object.assign(
              {
                imageBase64: null,
                image: null,
                FOVHztDeg: 0,
                nSteps: 50,
                updateLightInterval: 3,
                overSamplingFactor: 2,
                modelSKU: "undef",
                glassesDBURL: "https://glassesdbcached.jeeliz.com/sku/",
                isMask: !0,
              },
              L
            );
            if (K.Lc) throw Error("This feature cannot be called");
            var Sb = cb.FOVforced;
            kb.FOVHztDeg && (cb.FOVforced = kb.FOVHztDeg);
            Aa.ra(wa.Ja);
            return new Promise(function (Cb, ub) {
              return sa()
                .then(Na)
                .then(function () {
                  R()
                    .then(function (lb) {
                      cb.FOVforced = Sb;
                      Cb(lb);
                    })
                    .catch(ub);
                })
                .catch(ub)
                .catch(ub);
            });
          };
          ea.process_offlineRendering = function (L, R, Z, sa, Na) {
            Qa.Wn();
            sa &&
              (ma.fn.drawImage(ob.tb(), 0, 0),
              ob.tb().parentNode.insertBefore(ma.Ab, ob.tb()),
              ma.Ab.setAttribute("class", "jeefitMask"));
            ea.set_model(R, function () {
              ea.set_materials(Z, function () {
                setTimeout(function () {
                  d(L, sa).then(Na);
                  Qa.Tn(
                    sa
                      ? function () {
                          ob.tb().parentNode.removeChild(ma.Ab);
                        }
                      : !1
                  );
                }, 1);
              });
            });
          };
          ea.serialize_detection = function (L) {
            return L.cc();
          };
          ea.unserialize_detection = function (L, R, Z) {
            return jd.Zc(L, R, Z);
          };
          ea.do_instantDetection = function (L, R) {
            kd.m(ta.pc);
            kd.start(L, R);
          };
          ea.relieve_DOM = function (L, R) {
            if (H.Wb) return !1;
            k(R || 160);
            Xa.isEnabled = !1;
            ka && clearTimeout(ka);
            ka = setTimeout(function () {
              k(K.Ca);
              ka = !1;
              E();
            }, L);
            return !0;
          };
          ea.switch_slow = function (L, R) {
            if (H.Wb) return !1;
            "undefined" === typeof R && (R = K.rk);
            ka && (k(K.Ca), E(), clearTimeout(ka), (ka = !1));
            L ? (Xa.isEnabled = !1) : E();
            k(L ? R : K.Ca);
            return !0;
          };
          ea.switch_sleep = function (L, R) {
            function Z() {
              ea.isBusy = !1;
              L ? ((Bb = Da), (Da = Ga.va)) : ((Da = Bb), t());
            }
            if (H.Wb || ea.isBusy) return R ? Promise.reject() : null;
            if ((L && Da === Ga.va) || (!L && Da !== Ga.va))
              return R ? Promise.resolve(!1) : !1;
            rb && (clearInterval(rb), (rb = null));
            Da === Ga.nc
              ? ((Da = Ga.Y), Aa.ra(wa.Ja), Aa.cb(0))
              : Da === Ga.mc && ((Da = Ga.Ka), Aa.ra(wa.Hb), Aa.cb(1));
            Eb.stop();
            var sa = null;
            ea.isBusy = !0;
            R ? (sa = Id(!L).then(Z)) : Z();
            return R ? sa : !0;
          };
          ea.set_modelStandalone = function (L, R) {
            Aa.pe(!1);
            Nc.instance({
              ld: q,
              url: L.model,
              ac: L.materials,
              Ne: function (Z) {
                x(Z);
                R && R();
                Qa.Hg();
                Aa.pe(!0);
              },
            });
          };
          ea.start_rendering = Qa.Hg;
          ea.get_partsNames = function () {
            return ab ? ab.tf() : [];
          };
          ea.update_material = function (L, R, Z) {
            if (!ab) return Promise.reject("MODEL_NOT_LOADED");
            var sa = -1;
            switch (typeof L) {
              case "number":
                sa = L;
                break;
              case "string":
                sa = ab.tf().findIndex(function (Na) {
                  return Na.includes(L);
                });
                if (-1 === sa) return Promise.reject("PART_NOT_FOUND");
                break;
              default:
                return Promise.reject("INVALID_PART_ID");
            }
            void 0 === Z && (Z = !0);
            ab.Xj(sa, R, Z);
            return Promise.resolve();
          };
          ea.set_model = function (L, R, Z) {
            ab &&
              ((L = b([K.ea, K.wa, K.Wd + "/", L])),
              ab.replace(
                L,
                function () {
                  R && R(ab.hl());
                },
                Z
              ));
          };
          ea.update_tweaker = function (L) {
            m(L, !1);
          };
          ea.set_tweaker = function (L, R) {
            function Z(sa) {
              m(sa, !0);
              R && R();
            }
            "string" === typeof L ? V(K.ea + K.wa + K.Qo + "/" + L, Z) : Z(L);
          };
          ea.get_tweaker = function () {
            return {
              preOffset: bc,
              preScale: cc,
              rx: I,
              beginBendZ: T,
              bendStrength: Ub,
              maskBranchStartEnd: Vb,
            };
          };
          ea.get_materialsSpec = function () {
            return ab ? ab.di() : Promise.reject("NOT_READY");
          };
          ea.set_materials = function (L, R) {
            if (ab) {
              var Z = b([K.ea, K.wa, K.Vd + "/"]);
              L = L.map(function (sa) {
                var Na = sa;
                "string" === typeof sa &&
                  ((Na = Z + sa), (Na = Na.replace(/([^:])\/\//, "$1/")));
                return Na;
              });
              ab.yg(L, R);
            }
          };
          ea.replace_material = function (L, R) {
            if (ab)
              return ab.di().then(function (Z) {
                Z = Object.assign({ isReplaced: !0 }, Z[R]);
                ab.Xj(R, L, !0);
                return Z;
              });
          };
        }
        function J() {
          ha.Xg(Cc.Ll);
          Qa.Yc();
          K.Zb && (Fa.reset(), ya.La.oh(Ha.V), ya.La.nh());
          ea.ready = !0;
          Dc.forEach(function (L) {
            L();
          });
          Dc.splice(0);
        }
        function t() {
          Qb.reset();
          Eb.stop();
          Fa.ba();
          g(0);
        }
        function x(L) {
          ab && (Aa.Nn(ab), ab.remove());
          Aa.lk(L);
          ab = L;
        }
        function z() {
          bc = [0, 0, 0];
          cc = 1;
          Ub = T = I = 0;
          Vb = K.Oc;
        }
        function k(L) {
          ca = L;
          Eb.update({ Ca: ca });
        }
        function g(L) {
          Xa.Bb = -1;
          if ($a.isEnabled) Xa.Bb = $a.bc;
          else if (nb.isEnabled) Xa.Bb = nb.bc;
          else if (Xa.isEnabled) {
            if (!M()) return;
            Xa.Bb = Da === Ga.Y ? Qb.X() : 1;
          } else if (((Xa.Bb = K.bd[0]), !M())) return;
          Fa.ba();
          if (!nb.isEnabled)
            for (var R = 0; R < Xa.Bb; ++R)
              aa.set("s64"),
                ia.Ef.J(0.25 * ra.width, la.ai()),
                ia.kb.h(0),
                ta.Qc.h(1),
                X.l(!1, !1),
                la.Aa(ia.Ef),
                $a.isEnabled && 0 === (R + 1) % $a.Ug && n();
          $a.isEnabled
            ? ($a.C && $a.C(),
              ($a.isEnabled = !1),
              c.flush(),
              Da !== Ga.va && Eb.rg(g))
            : (Aa.animate(L),
              ia.ng &&
                Math.abs(Ya - wa.Fi) > wa.Mj &&
                K.Zb &&
                Da === Ga.Y &&
                (Fa.ba(), n(), Fa.aa()),
              nb.isEnabled ||
                (Xa.isEnabled &&
                  (Qb.Qj(),
                  (R = Qb.Yh(1)),
                  (Xa.lh = R),
                  (Xa.He = S(K.pk, R)),
                  K.Zb &&
                    Da === Ga.Y &&
                    ((wa.Mj = S(K.Gi, R)),
                    (wa.Xc = S(K.$m, R)),
                    (wa.Xc = Math.min(wa.Xc, 0.5)))),
                (Ya = L),
                Da !== Ga.va && Eb.rg(g)));
        }
        function E() {
          Ya = Mc.pf();
          Xa.isEnabled = !0;
        }
        function M() {
          var L = 15;
          if (!Ha.Md) {
            if (!Ha.element.videoWidth)
              return Eb.stop(), ea.request_cameraVideoStream().then(t), !1;
            var R = Ha.element.currentTime;
            if (!R) return !0;
            L = R - Oc;
            0 > L && (Oc = R);
            if (1e3 * L < K.ep) return !0;
          }
          Ha.V.refresh();
          Oc += L;
          Ha.ud = L;
          hb = !0;
          Fa.ba();
          aa.set("s0");
          ta.og.J();
          ta.Qc.Tk(0);
          X.l(!0, !0);
          aa.set("s62");
          ia.kb.J();
          Ha.V.h(0);
          X.l(!1, !1);
          null !== ia.Kb &&
            (aa.set("s63"), ia.$c.u(), ia.kb.h(0), ia.Kb.h(1), X.l(!1, !1));
          return !0;
        }
        function D() {
          ia.bk = ba.instance({
            isPot: !0,
            isLinear: !0,
            isFloat: !1,
            url: K.ea + K.wa + K.fp,
          });
          var L = {
            isPot: !1,
            isLinear: !0,
            isFloat: !1,
            width: ra.width,
            height: ra.height,
          };
          ia.kb = ba.instance(L);
          ia.$c = ba.instance(L);
          H.Nj.push(ia.kb, ia.$c);
          ia.Ef = Md.instance({});
          K.Sd &&
            (dc = ba.instance({
              isPot: !1,
              isFloat: !1,
              isLinear: !0,
              url:
                (K.Tf || -1 !== K.Sf.indexOf("//") ? "" : K.ea + K.wa) + K.Sf,
            }));
        }
        function F() {
          function L() {
            return {
              width: 3,
              height: 1,
              isFloat: !0,
              isPot: !1,
              array: new Float32Array([0, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            };
          }
          var R = {
            width: 3,
            height: 1,
            isFloat: !0,
            isPot: !1,
            array: new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
          };
          ta.Qc = Pc.instance(L());
          ta.og = ba.instance(L());
          ta.pc = ba.instance(L());
          ta.ae = Pc.instance(L());
          ta.af = ba.instance(R);
          R = {
            width: 2,
            height: 1,
            isFloat: !0,
            isPot: !1,
            array: new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
          };
          ta.Yg = ba.instance(R);
          ta.ze = ba.instance(R);
          wa.be = ba.instance({
            width: 1,
            height: 1,
            isFloat: !0,
            isPot: !1,
            array: new Float32Array([0, 0, 0, 0]),
          });
        }
        function e(L) {
          ia.ng = L;
          if (hb) {
            hb = !1;
            aa.set("s70");
            ta.Yg.J();
            ta.ze.h(2);
            var R = S(K.Vk, Qb.Yh(0.5));
            aa.D("u72", R);
            ta.og.h(1);
            aa.D("u73", 1e3 * Ha.ud);
            X.l(!1, !1);
            aa.set("s71");
            ta.ze.u();
            ta.Yg.h(0);
            X.l(!1, !1);
          }
          L.h(0);
          ta.Qc.sj(1);
          c.viewport(0, 0, 1, 1);
          aa.set("s65");
          aa.Dg("u48", ld.get(0));
          X.l(!1, !1);
          aa.set("s66");
          c.viewport(1, 0, 2, 1);
          X.l(!1, !1);
          ta.af.J();
          aa.set("s67");
          aa.O("u59", K.Ie[0] * Xa.He, K.Ie[1]);
          aa.D("u62", Xa.lh);
          ta.Qc.h(0);
          ta.ae.h(1);
          X.l(!1, !1);
          aa.set("s68");
          ta.ae.sj(1);
          ta.af.h(0);
          ta.ze.h(2);
          ta.Qc.h(3);
          X.l(!1, !1);
          aa.set("s69");
          ta.ae.h(0);
          ta.pc.u();
          X.l(!1, !1);
        }
        function n() {
          wa.Fi = Ya;
          wa.be.J();
          aa.set(P.wi ? "s73" : "s72");
          ia.ng.h(0);
          X.l(!1, !1);
          ya.La.ak(Ha.V, wa.be, wa.Xc);
        }
        function y() {
          return new Promise(function (L) {
            V(md(), function (R) {
              R = JSON.parse(R);
              if (R.exportData) {
                var Z = R.exportData;
                P.Ra = Z.rotationEulerAnglesFactors
                  ? [
                      -Z.rotationEulerAnglesFactors[0],
                      -Z.rotationEulerAnglesFactors[1],
                      Z.rotationEulerAnglesFactors[2],
                    ]
                  : P.Ra;
                P.Cc =
                  void 0 === Z.deformScaleXFactor ? P.Cc : Z.deformScaleXFactor;
                P.ta = Z.translationScalingFactors || P.ta;
                P.Kh = Z.dyOffset || 0;
                P.Ih = Z.dsOffset || 0;
                P.wi = Z.isLThetaSplitCosSin || !1;
                A();
              }
              la = new mc({ Nc: R.layers, Zd: "gpuRawAvg", Yd: e });
              L();
            });
          });
        }
        function Q(L) {
          a(L);
          L = K.width;
          var R = K.height;
          U.ob[0] = 1;
          U.ob[1] = L / R;
          ld.m({
            $d: K.scanOverlapFactors,
            Pi: K.scanNScaleLevels,
            da: L,
            Tb: R,
            kj: K.scanScale0Factor,
            ta: P.ta,
            sg: !0,
          });
          rc = L > R ? [L / R, 1] : [1, R / L];
          H.Oa = !0;
        }
        function B() {
          aa.j("s65", [
            {
              type: "3f",
              name: "u49",
              value: [P.ta[0] * U.ob[0], P.ta[1] * U.ob[1], P.ta[2]],
            },
          ]);
        }
        function A() {
          aa.j("s64", [
            { type: "1f", name: "u44", value: P.Cc },
            { type: "1f", name: "u46", value: P.Kh },
            { type: "1f", name: "u45", value: P.Ih },
          ]);
          B();
          var L = [1 / P.Ra[0], 1 / P.Ra[1], 1 / P.Ra[2]];
          aa.j("s66", [{ type: "3f", name: "u54", value: L }]);
          aa.j("s70", [{ type: "3f", name: "u54", value: L }]);
        }
        function O() {
          aa.j("s64", [
            { type: "1i", name: "u1", value: 0 },
            { type: "1i", name: "u42", value: 1 },
            { type: "2f", name: "u43", value: U.ob },
          ]);
          aa.j("s65", [
            { type: "1i", name: "u47", value: 0 },
            { type: "1i", name: "u42", value: 1 },
            { type: "1f", name: "u52", value: K.No },
            { type: "1f", name: "u53", value: K.ol },
            {
              type: "3f",
              name: "u50",
              value: [K.oc[0][0], K.oc[1][0], K.oc[2][0]],
            },
            {
              type: "3f",
              name: "u51",
              value: [K.oc[0][1], K.oc[1][1], K.oc[2][1]],
            },
          ]);
          aa.j("s66", [
            { type: "1i", name: "u47", value: 0 },
            { type: "1i", name: "u42", value: 1 },
            { type: "2f", name: "u56", value: K.En },
            { type: "3f", name: "u55", value: K.Pj },
            { type: "1f", name: "u57", value: K.Ml },
          ]);
          aa.j("s67", [
            { type: "1i", name: "u42", value: 0 },
            { type: "1i", name: "u58", value: 1 },
            { type: "2f", name: "u59", value: K.Ie },
            { type: "1f", name: "u60", value: K.Un },
            { type: "1f", name: "u61", value: K.Dn },
          ]);
          aa.j("s68", [
            { type: "1i", name: "u58", value: 1 },
            { type: "1i", name: "u63", value: 0 },
            { type: "1i", name: "u64", value: 2 },
            { type: "1i", name: "u65", value: 3 },
            { type: "2f", name: "u43", value: U.ob },
            { type: "1f", name: "u67", value: la.ai() },
            { type: "2f", name: "u66", value: K.Qn },
          ]);
          aa.j("s69", [
            { type: "1i", name: "u42", value: 0 },
            { type: "1f", name: "u68", value: K.Xn },
            { type: "1f", name: "u69", value: K.Po },
          ]);
          aa.j("s70", [
            { type: "1i", name: "u47", value: 0 },
            { type: "1i", name: "u42", value: 1 },
            { type: "1i", name: "u64", value: 2 },
            { type: "3f", name: "u55", value: K.Pj },
          ]);
          aa.j("s71", [
            { type: "1i", name: "u64", value: 0 },
            { type: "2f", name: "u74", value: K.Oo },
            { type: "2f", name: "u75", value: K.Vn },
          ]);
          aa.j("s72", [{ type: "1i", name: "u47", value: 0 }]);
          aa.j("s73", [{ type: "1i", name: "u47", value: 0 }]);
          aa.j("s63", [
            { type: "1i", name: "u1", value: 0 },
            { type: "1i", name: "u76", value: 1 },
          ]);
        }
        function G(L, R, Z) {
          var sa = 0 === Z,
            Na = a(sa);
          K.width = L;
          K.height = R;
          Q(sa);
          O();
          B();
          H.Nj.forEach(function (sb) {
            sb.resize(L, R);
          });
          Z = sa ? 1 : Z;
          ha.resize(Na.width * Z, Na.height * Z);
          Qa.Yc();
          ib.Eg(
            Ha.element.videoWidth || Ha.element.width,
            Ha.element.videoHeight || Ha.element.height
          );
          ib.Lg();
          ib.Kj();
        }
        function w() {
          Eb.stop();
          H.hb && (clearTimeout(H.hb), (H.hb = null));
          if (!H.Wb) {
            var L = H.width,
              R = H.height;
            if (K.width === L && K.height === R) t();
            else if (Da !== Ga.Y && Da !== Ga.Ka) H.hb = setTimeout(w, K.ij);
            else {
              var Z = "undefined" === typeof Fb ? !1 : Fb.get_mode(),
                sa = Da;
              Da = Ga.va;
              H.Wb = !0;
              $a.isEnabled = !0;
              $a.C = function () {
                $a.isEnabled = !1;
                H.Wb = !1;
                E();
                k(K.Ca);
                ka && clearTimeout(ka);
                ka = !1;
                Da = sa;
              };
              G(L, R, 0);
              t();
              Da === Ga.Ka && ((Da = Ga.Y), ea.switch_viewer3D(!0, !1));
              Z && Fb.switch_mode(Z);
            }
          }
        }
        var I,
          T,
          U = { ob: [-1, -1] },
          da = null,
          N = [0.5, 0, 0, 0.5],
          ra = { width: -1, height: -1 },
          Pa = { width: -1, height: -1, hb: null, Wb: !1, Oa: !1, Nj: [] },
          H = Object.assign({}, Pa),
          r = [0, K.ce[1], K.ce[2]],
          P = {
            Ra: [-K.Ra[0], -K.Ra[1], K.Ra[2]],
            Cc: K.Cc,
            ta: K.ta,
            Kh: 0,
            Ih: 0,
            wi: !1,
          },
          ca = K.Ca,
          ka = null,
          la = null,
          ma = { Jb: null, qc: null, Ab: null, xq: null };
        a(!0);
        var qa = [0, 0, 0],
          oa = 1,
          Ca = 0,
          Y = { kb: null, $c: null, Ef: null, bk: null, ng: null, Kb: null },
          ia = Object.assign({}, Y),
          ta = { og: null, pc: null, ae: null, af: null, Yg: null, ze: null },
          Ya = 0,
          hb = !1,
          Ta = {
            Ja: null,
            Hb: null,
            Zf: null,
            Fi: 0,
            Mj: K.Gi[1],
            Xc: 0.1,
            be: null,
          },
          wa = Object.assign({}, Ta),
          bb = !1,
          db = !1,
          Xa = { isEnabled: !0, He: 1, Bb: -1, lh: 1 },
          Ga = { va: -1, Y: 0, Ka: 1, mc: 2, nc: 3 },
          Da = Ga.Y,
          rb = null,
          Bb = Ga.Y,
          $a = { isEnabled: !1, bc: 1, Ug: 3, C: null },
          nb = { isEnabled: !1, pa: null, bc: 0 },
          dc = null,
          rc = -1,
          Va = !1,
          sc = !1,
          fa = !1,
          za = [0, 0, 0],
          jb = 1,
          Ma,
          Ib,
          Qc,
          bc = [0, 0, 0],
          cc = 1,
          Ub = (T = I = 0),
          Vb = K.Oc,
          Ec = [0, 0, 0],
          pb = { scale: 1, offsetX: 0, offsetY: 0 },
          Oc = 0,
          Qa = {
            m: function () {
              aa.uc([
                {
                  id: "s62",
                  name: "_",
                  v: "attribute vec2 a0;uniform mat2 u41;varying vec2 vv0;void main(){gl_Position=vec4(a0,0.,1.),vv0=vec2(.5)+u41*a0;}",
                  K: ["a0"],
                  S: [2],
                  g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
                  i: ["u1", "u41"],
                  precision: "lowp",
                },
                {
                  id: "s64",
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
                  v: "attribute vec2 a0;uniform sampler2D u42;uniform vec2 u43;uniform float u44,u45,u46;const vec2 h=vec2(.16,.5),i=vec2(.5,.5),j=vec2(.84,.5),q=vec2(.5);varying vec2 vv0;void main(){vec4 b=texture2D(u42,h);vec2 c=b.gb,a=b.a*u43;vec4 l=texture2D(u42,i);float m=l.y;vec2 n=vec2(mix(1.,1./cos(m),u44),1.);a*=n,a*=1.+u45;vec2 o=a0*.5;float d=texture2D(u42,j).r,e=cos(d),f=sin(d);mat2 g=mat2(e,f,-f,e);vec2 p=g*o;c+=vec2(-.5)*a*(g*vec2(0.,u46)),vv0=c+p*a,gl_Position=vec4(a0,0.,1.);}",
                  K: ["a0"],
                  S: [2],
                  i: "u1 u42 u43 u44 u45 u46".split(" "),
                  precision: "lowp",
                },
                {
                  id: "s65",
                  name: "_",
                  v: "attribute vec2 a0;void main(){gl_Position=vec4(a0,0.,1.);}",
                  g: "uniform sampler2D u47,u42;uniform vec3 u48,u49,u50,u51;uniform float u52,u53;const vec4 e=vec4(.25,.25,.25,.25);const vec2 f=vec2(.16,.5),g=vec2(.5,.5),h=vec2(.83,.5);const vec3 i=vec3(1.,1.,1.);void main(){vec4 j=texture2D(u47,vec2(.625,.625)),k=texture2D(u47,vec2(.875,.625));float l=dot(j-k,e);bool m=l>u53;vec4 a=texture2D(u42,f);m?a.r=2.:a.r>u52?a.r=0.:a.r>1.9?a.r+=1.:0.;if(a.r<.9)a=vec4(1.,u48);else{float n=dot(e,texture2D(u47,vec2(.875,.875))),o=dot(e,texture2D(u47,vec2(.125,.625))),p=dot(e,texture2D(u47,vec2(.375,.625))),b=texture2D(u42,h).r,c=cos(b),d=sin(b);vec2 q=mat2(c,d,-d,c)*vec2(n,o);float r=texture2D(u42,g).a;vec3 s=mix(u50,u51,r*i);a.r*=step(1.9,a.r),a.gba+=vec3(q,p)*u49*s*a.a;}gl_FragColor=a;}",
                  i: "u47 u42 u48 u52 u49 u53 u50 u51".split(" "),
                },
                {
                  id: "s66",
                  name: "_",
                  g: "uniform sampler2D u47,u42;uniform vec3 u54,u55;uniform vec2 u56;uniform float u57;const vec4 v=vec4(1.),f=vec4(0.),e=vec4(.25);const vec2 g=vec2(.16,.5),h=vec2(.5,.5),i=vec2(.84,.5);varying vec2 vv0;void main(){float k=step(vv0.x,.5);vec4 l=texture2D(u42,g);if(l.r<1.9){gl_FragColor=f;return;}float m=dot(texture2D(u47,vec2(.125,.125)),e),a=smoothstep(u56.x,u56.y,m);vec4 n=texture2D(u42,h);float o=n.a;a=mix(a,o,.3);float p=dot(e,texture2D(u47,vec2(.125,.875))),q=dot(e,texture2D(u47,vec2(.375,.875))),r=dot(e,texture2D(u47,vec2(.625,.875)));vec3 s=vec3(p,q,r),b=u55+s*u54;float c=texture2D(u42,i).r,d=b.z*u57;c+=d,b.z-=d;vec4 t=vec4(b,a),u=vec4(c,0.,0.,0.);gl_FragColor=mix(u,t,k);}",
                  i: "u47 u42 u56 u54 u55 u57".split(" "),
                },
                {
                  id: "s67",
                  name: "_",
                  g: "uniform sampler2D u42,u58;uniform vec2 u59;uniform float u60,u61,u62;const vec4 f=vec4(1.),h=vec4(1.,0.,0.,0.),i=vec4(0.,0.,0.,1.);const vec2 g=vec2(.5,.5);varying vec2 vv0;void main(){vec4 j=vec4(max(.1,1.-u62),0.,0.,0.),k=texture2D(u42,vv0),l=texture2D(u58,vv0),q=texture2D(u42,g),m=texture2D(u58,g);float n=pow(m.a,u61),o=mix(u59.y,u59.x,n),b=step(.66,vv0.x),c=step(.34,vv0.x)*(1.-b);vec4 a=mix(h,i,c);a=mix(a,j,b);vec4 d=max(o*f,a);d*=mix(f,u60*vec4(1.,1.,1.,0.)+vec4(0.,0.,0.,1.),c);vec4 p=k-l;gl_FragColor=p*d;}",
                  i: "u42 u58 u59 u60 u61 u62".split(" "),
                  precision: "highp",
                },
                {
                  id: "s68",
                  name: "_",
                  g: "uniform sampler2D u58,u63,u64,u65;uniform vec2 u43,u66;uniform float u67;const vec4 w=vec4(0.),x=vec4(1.);const vec2 j=vec2(.25,.5),k=vec2(.75,.5),g=vec2(.16,.5),l=vec2(.5,.5);varying vec2 vv0;bool f(float a){return (a<0.||0.<a||a==0.)&&a+1.!=a?false:true;}void main(){float y=step(vv0.x,.33),m=step(.33,vv0.x)*step(vv0.x,.66),z=step(.66,vv0.x);vec4 n=texture2D(u65,l);float b=n.a;b*=texture2D(u64,j).a,b*=texture2D(u64,k).a;vec4 o=texture2D(u58,vv0),p=texture2D(u63,vv0),c=o+p;c.a=mix(c.a,b,m);vec4 e=texture2D(u58,g),q=texture2D(u65,g);vec2 r=e.gb,s=q.gb;float t=e.a;vec2 h=u67*abs(r-s)/(u43*t);float u=max(h.x,h.y),v=smoothstep(u66.x,u66.y,u);vec4 i=texture2D(u65,vv0),a=mix(c,i,v);if(f(a.x)||f(a.y)||f(a.z)||f(a.w)){gl_FragColor=i;return;}gl_FragColor=a;}",
                  i: "u58 u63 u64 u65 u43 u67 u66".split(" "),
                  precision: "highp",
                },
                {
                  id: "s69",
                  name: "_",
                  g: "uniform sampler2D u42;uniform float u68,u69;const vec2 f=vec2(.5,.5);const float h=-.4;varying vec2 vv0;void main(){vec4 a=texture2D(u42,vv0);float b=step(vv0.x,.33),g=(1.-b)*step(.66,vv0.x),c=texture2D(u42,f).r,d=texture2D(u42,f).g;a.a+=b*a.a*u68*abs(sin(d)),a.r-=u69*g*step(c,0.)*sin(c)*sin(d),gl_FragColor=a;}",
                  i: ["u42", "u68", "u69"],
                  precision: "highp",
                },
                {
                  id: "s70",
                  name: "_",
                  g: "uniform sampler2D u42,u64,u47;uniform vec3 u54,u55;uniform float u72,u73;const vec4 e=vec4(.25);const vec3 g=vec3(1.);const vec2 h=vec2(.5,.5);const vec3 i=vec3(1.,1.,4.);varying vec2 vv0;void main(){vec4 c=texture2D(u42,h);float d=step(vv0.x,.5),a=1.-d;vec4 j=texture2D(u64,vv0);float t=c.a;vec2 k=mix(vec2(.875,.875),vec2(.125,.875),a),l=mix(vec2(.125,.625),vec2(.375,.875),a),m=mix(vec2(.375,.625),vec2(.625,.875),a);float n=dot(e,texture2D(u47,k)),o=dot(e,texture2D(u47,l)),p=dot(e,texture2D(u47,m));vec3 q=mix(i,u54,a),b=q*vec3(n,o,p),r=c.rgb;b=mix(b,u55+b-r,a)/u73;vec4 s=mix(vec4(b,0.),j,vec4(u72*g,0.));gl_FragColor=s;}",
                  i: "u42 u64 u47 u72 u73 u54 u55".split(" "),
                  precision: "highp",
                },
                {
                  id: "s71",
                  name: "_",
                  g: "uniform sampler2D u64;uniform vec2 u74,u75;const vec4 h=vec4(.25,.25,.25,.25);varying vec2 vv0;void main(){float a=step(.5,vv0.x),c=mix(u74.x,u75.x,a),d=mix(u74.y,u75.y,a);vec3 b=texture2D(u64,vv0).rgb;float f=length(b),g=1.-smoothstep(c,d,f);gl_FragColor=vec4(b,g);}",
                  i: ["u64", "u74", "u75"],
                  precision: "highp",
                },
                {
                  id: "s72",
                  name: "_",
                  v: "attribute vec2 a0;void main(){gl_Position=vec4(a0,0.,1.);}",
                  g: "uniform sampler2D u47;const vec4 e=vec4(.25);const float f=3.1415;void main(){float a=dot(texture2D(u47,vec2(.375,.375)),e),b=dot(texture2D(u47,vec2(.625,.375)),e),c=f/2.*dot(texture2D(u47,vec2(.875,.375)),e),d=.75*f*dot(texture2D(u47,vec2(.125,.375)),e);gl_FragColor=vec4(d,a,b,c);}",
                  i: ["u47"],
                },
                {
                  id: "s73",
                  name: "_",
                  v: "attribute vec2 a0;void main(){gl_Position=vec4(a0,0.,1.);}",
                  g: "uniform sampler2D u47;const vec4 e=vec4(.25);const float f=3.1415,g=1e-7;void main(){float b=dot(texture2D(u47,vec2(.875,.375)),e),c=dot(texture2D(u47,vec2(.375,.125)),e),d=f/2.*dot(texture2D(u47,vec2(.625,.375)),e),a=dot(texture2D(u47,vec2(.125,.375)),e),h=dot(texture2D(u47,vec2(.375,.375)),e);a+=(step(0.,a)-.5)*g;float i=atan(h,a);gl_FragColor=vec4(i,b,c,d);}",
                  i: ["u47"],
                },
                {
                  id: "s63",
                  name: "_",
                  g: "uniform sampler2D u1,u76;varying vec2 vv0;vec4 i(vec4 a,sampler2D g){mediump float b=a.b*63.;mediump vec2 c;c.y=floor(floor(b)/8.),c.x=floor(b)-c.y*8.;mediump vec2 d;d.y=floor(ceil(b)/8.),d.x=ceil(b)-d.y*8.;highp vec2 e;e.x=c.x*.125+9.765625e-4+.123047*a.r,e.y=c.y*.125+9.765625e-4+.123047*a.g;highp vec2 f;f.x=d.x*.125+9.765625e-4+.123047*a.r,f.y=d.y*.125+9.765625e-4+.123047*a.g;lowp vec4 j=texture2D(g,e),k=texture2D(g,f),l=mix(j,k,fract(b));return l;}void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=i(a,u76);}",
                  i: ["u1", "u76"],
                },
              ]);
              F();
              Eb.m({ vi: !1, Ca: ca });
              Qb.m({ cg: 1, n: K.bd[1] - K.bd[0] + 1, Mf: K.bd[0] });
              ea.set_videoRotation = function (L) {
                cb.rotate = L;
                ea.ready &&
                  (ib.Eg(Ha.element.videoWidth, Ha.element.videoHeight),
                  ib.Lg());
              };
              ea.set_viewRotation = function () {};
              ea.set_LUT = function (L) {
                return new Promise(function (R) {
                  L
                    ? ba.instance({
                        url: L,
                        isFloat: !1,
                        isFlipY: !1,
                        C: function (Z) {
                          ia.Kb = Z;
                          Qa.Yc();
                          R();
                        },
                      })
                    : ((ia.Kb = null), Qa.Yc(), R());
                });
              };
              ea.resize = function (L, R, Z, sa) {
                ea.ready &&
                  (H.hb && (clearTimeout(H.hb), (H.hb = null)),
                  Eb.stop(),
                  (Z = Z ? Cc.gf : 1),
                  (H.width = L * Z),
                  (H.height = R * Z),
                  (H.hb = setTimeout(w, sa ? 0 : K.ij)));
              };
              return y();
            },
            Nl: G,
            Ko: function () {
              D();
              Q(!0);
              O();
              A();
              Qa.Kj();
              v();
              Fc.forEach(function (L) {
                L();
              });
              Fc.splice(0);
              W.model && !ea.isBusy ? Qa.Hi(W.model) : K.Lc || J();
              return Promise.resolve();
            },
            gm: function () {
              return ra;
            },
            A: function () {
              return new Promise(function (L, R) {
                ea.ready
                  ? (Eb.A(),
                    ea
                      .switch_sleep(!0, !0)
                      .finally(function () {
                        la && la.A();
                        ha.A();
                        ob.A();
                        c && (c = null);
                        la = null;
                        K.Tf = !1;
                        ab = null;
                        db = bb = !1;
                        Xa.isEnabled = !0;
                        Xa.He = 1;
                        Xa.Bb = -1;
                        Da = Ga.Y;
                        rb = null;
                        Bb = Ga.Y;
                        Object.assign(H, Pa);
                        Object.assign(Ha, nd);
                        Object.assign(ia, Y);
                        Object.assign(wa, Ta);
                        ea.ready = !1;
                        ea.isBusy = !1;
                        ea.load_model = null;
                        L();
                      })
                      .catch(function (Z) {
                        R(Z);
                      }))
                  : R("NOT_READY");
              });
            },
            Yc: function () {
              Aa.qj(ta.pc, null === ia.Kb ? ia.kb : ia.$c, wa.be, ia.bk);
            },
            em: function () {
              return pb;
            },
            yj: function (L) {
              pb = L;
            },
            ve: function () {
              Ec[0] = qa[0] - pb.offsetX;
              Ec[1] = qa[1] + pb.offsetY;
              Ec[2] = qa[2];
              Aa.co(r, bc, Ec);
            },
            we: function () {
              Aa.eo(oa * K.zn, cc, pb.scale);
            },
            Yj: function () {
              Aa.fo(Ca + I);
            },
            Vo: function () {
              Aa.ao(K.gd + T, K.Mb + Ub);
            },
            Xo: function () {
              Aa.bo(Vb);
            },
            xe: function () {
              Qa.ve();
              Qa.we();
              Qa.Yj();
              Qa.Vo();
              Qa.Xo();
            },
            Wn: function () {
              Eb.stop();
              rb && (clearInterval(rb), (rb = null));
              nb.isEnabled = !0;
              nb.bc = 0;
              Va = Aa.dm();
              sc = ab.gi();
              fa = ab.ei();
              jb = cc;
              za = bc;
              Ma = Vb;
              Ib = T;
              Qc = Ub;
              $a.isEnabled = !1;
              Aa.oe(!1);
            },
            Tn: function (L) {
              function R() {
                2 === ++Z &&
                  ((nb.isEnabled = !1),
                  (cc = jb),
                  (bc = za),
                  (Vb = Ma),
                  (T = Ib),
                  (Ub = Qc),
                  Qa.xe(),
                  Aa.ra(Va),
                  t(),
                  L && L());
              }
              var Z = 0;
              Da === Ga.mc ? (Da = Ga.Ka) : Da === Ga.nc && (Da = Ga.Y);
              Aa.cb(Da === Ga.Y ? 0 : 1);
              ab.replace(sc, R);
              ab.yg(fa, R);
              Qa.Yc();
              Aa.oe(!0);
            },
            Kj: function () {
              var L = Math.tan(Ha.kf / 2);
              Aa.pj({
                jf: K.jf / L,
                Yn: L,
                Cn: Ha.$i,
                Ha: K.Ha,
                ag: K.ag,
                bg: K.bg,
                ek: U.ob,
                jk: K.ip,
                Gc: K.Gc,
                Af: K.Af,
                yf: K.yf,
                zf: K.zf,
                Oc: Vb,
                Je: K.Je,
                We: K.We,
                qg: K.qg,
                jc: K.jc,
                Eo: K.Ej,
                Fo: K.Fj,
                me: K.me,
                kc: K.kc,
                od: K.od,
                Ze: K.Ze,
                Ye: K.Ye,
                Xe: K.Xe,
                Me: K.Me,
                Le: K.ea + K.wa + K.Le,
                gd: K.gd + T,
                Mb: K.Mb + Ub,
                wf: K.wf,
                dh: K.dh,
                bh: K.bh,
                Ce: K.Ce,
                op: K.np,
                Be: Ha.Be,
                Sd: K.Sd,
                bn: dc,
                Rd: K.Rd,
                Td: K.Td,
                Rf: K.Rf,
                an: rc,
                Mg: K.Mg,
              });
            },
            el: function () {
              var L = cb.Fe,
                R = cb.Ee,
                Z = 1 / Math.tan(0.5 * Ha.kf),
                sa = ob.$() / ob.P();
              Ha.$i = [
                Z,
                0,
                0,
                0,
                0,
                Z / sa,
                0,
                0,
                0,
                0,
                -(R + L) / (R - L),
                -1,
                0,
                0,
                (-2 * L * R) / (R - L),
                0,
              ];
              Ha.Be = 1 / Math.tan((K.lp * Math.PI) / 360) / Z;
            },
            Eg: function (L, R) {
              da = [0.5, 0.5];
              L = R / L;
              R = ob.$() / ob.P();
              90 === Math.abs(cb.rotate) && (L = 1 / L);
              L > R ? (da[1] *= R / L) : (da[0] *= L / R);
              N[0] = 0;
              N[1] = 0;
              N[2] = 0;
              N[3] = 0;
              switch (cb.rotate) {
                case 0:
                  N[0] = da[0];
                  N[3] = da[1];
                  break;
                case 180:
                  N[0] = -da[0];
                  N[3] = -da[1];
                  break;
                case 90:
                  N[1] = da[0];
                  N[2] = -da[1];
                  break;
                case -90:
                  (N[1] = -da[0]), (N[2] = da[1]);
              }
              K.yi || ((N[0] *= -1), (N[1] *= -1));
              R = da;
              var Z = nc(),
                sa = cb.FOVforced;
              Z =
                ((sa ? sa : Z ? cb.FOVmobile : cb.FOVdesktop) * Math.PI) / 180;
              Z =
                2 *
                Math.atan((Math.max(L, 1 / L) / (16 / 9)) * Math.tan(0.5 * Z));
              Ha.kf =
                2 *
                Math.atan(
                  2 *
                    R[0] *
                    Math.tan(
                      0.5 *
                        (1 < L ? 2 * Math.atan((1 / L) * Math.tan(0.5 * Z)) : Z)
                    )
                );
              Qa.el();
            },
            Lg: function () {
              aa.j("s62", [
                { type: "1i", name: "u1", value: 0 },
                { type: "mat2", name: "u41", value: N },
              ]);
            },
            Df: function (L, R) {
              return db
                ? Promise.resolve()
                : new Promise(function (Z, sa) {
                    Qa.ym(L, R);
                    Promise.all([Qa.m(), Qa.zm()])
                      .then(function () {
                        Qa.oi();
                        db = !0;
                        Z();
                      })
                      .catch(function (Na) {
                        Tb && Tb("GL_INCOMPATIBLE", "Cannot init JEELIZVTO");
                        sa(Na);
                      });
                  });
            },
            ym: function (L, R) {
              ma.Jb = document.createElement("canvas");
              ma.Ab = document.createElement("canvas");
              ma.Ab.width = K.width;
              ma.Ab.height = K.height;
              ma.fn = ma.Ab.getContext("2d");
              ea.replace_video = function (Z) {
                Ha.element = Z;
                Ha.Sg.la = Ha.element;
                return !0;
              };
              ma.qc = ma.Jb.getContext("2d");
              ea.capture_background = function (Z, sa) {
                Z = "undefined" === typeof Z ? L : Z;
                sa = "undefined" === typeof sa ? R : sa;
                ma.Jb.width = Z;
                ma.Jb.height = sa;
                var Na = Z / sa,
                  sb = 0,
                  kb = 0;
                if (L / R > Na) {
                  var Sb = R * Na;
                  Na = R;
                  sb = Math.round((L - Sb) / 2);
                } else (Sb = L), (Na = L / Na), (kb = Math.round((R - Na) / 2));
                ma.qc.save();
                ma.qc.translate(Z, 0);
                ma.qc.scale(-1, 1);
                ma.qc.drawImage(Ha.element, sb, kb, Sb, Na, 0, 0, Z, sa);
                ma.qc.restore();
                Z = document.createElement("canvas");
                Z.width = ma.Jb.width;
                Z.height = ma.Jb.height;
                Z.getContext("2d").drawImage(ma.Jb, 0, 0);
                return Z;
              };
            },
            oi: function () {
              window.CanvasListeners &&
                (Fb.init({ sa: ob.tb() }),
                (ea.init_listeners = Qa.oi),
                (ea.add_listener = Fb.add_listener),
                (ea.remove_listener = Fb.remove_listener),
                (ea.animate_swipe = Fb.animate_swipe),
                (ea.switch_modeInteractor = Fb.switch_mode),
                (ea.get_modeInteractor = Fb.get_mode),
                Fb.add_listener(
                  "move",
                  function (L, R) {
                    Da === Ga.Y &&
                      (K.cn &&
                        ((pb.offsetX -= R[0] * K.Ji),
                        (pb.offsetX = Math.min(
                          Math.max(pb.offsetX, -K.Ud),
                          K.Ud
                        ))),
                      (pb.offsetY -= R[1] * K.Ji),
                      (pb.offsetY = Math.min(
                        Math.max(pb.offsetY, -K.Ud),
                        K.Ud
                      )),
                      Qa.ve());
                  },
                  !0
                ).add_listener(
                  "pinch",
                  function (L, R) {
                    Da === Ga.Y &&
                      ((pb.scale += R * K.dn),
                      (pb.scale = Math.min(
                        Math.max(pb.scale, K.Ki[0]),
                        K.Ki[1]
                      )),
                      Qa.we());
                  },
                  !0
                ));
            },
            zm: function () {
              return new Promise(function (L, R) {
                ha.m({
                  Id: !1,
                  cl: !1,
                  expand: !1,
                  sa: ob.tb(),
                  Rb: ob,
                  onload: function () {
                    wa.Hb = qc.instance({
                      Lb: K.ea + K.wa + eb.gp,
                      wc: K.ea + K.wa + eb.hp,
                      vc: eb.ck,
                      xc: eb.dk,
                    });
                    K.Zb
                      ? ((wa.Ja = qc.instance({})), ya.La.ra(wa.Ja))
                      : (wa.Ja = wa.Hb);
                    Aa.ra(wa.Ja);
                    wa.Zf = K.Zb
                      ? Nd.instance({ Zm: wa.Ja, Xm: wa.Hb })
                      : wa.Hb;
                    L();
                  },
                }) || R("CANNOT_INIT_JE3D");
              });
            },
            Hg: function () {
              bb || ((bb = !0), Qa.xe(), J(), (Ya = 0), K.Lc && t());
            },
            Hi: function (L, R) {
              L = Nc.instance({
                Ne: function () {
                  Qa.Hg();
                  R && R();
                },
                ld: q,
                url: L.url,
                ac: L.ac,
              });
              x(L);
            },
            Lj: function () {
              if (K.Zb) {
                var L = Object.assign({}, eb, { Db: b([K.ea, K.wa, eb.Db]) });
                ya.La.ib(L);
              }
            },
          };
        return Qa;
      }
      function Od(a) {
        var b = document.createElement("link");
        b.setAttribute("href", a);
        "json" === a.split(".").pop().toLowerCase()
          ? (b.setAttribute("rel", "preload"),
            b.setAttribute("as", "fetch"),
            b.setAttribute("type", "application/json"),
            b.setAttribute("crossorigin", ""))
          : b.setAttribute("rel", "prefetch");
        document.head.appendChild(b);
      }
      function md(a) {
        if (!a) {
          a = K.ea;
          var b = K.ad.split("://").shift();
          if ("http" === b || "https" === b) a = "";
        }
        a += K.ad;
        "json" !== a.split(".").pop() && (a += K.neuralNetworkPath);
        return a;
      }
      function od() {
        return new Promise(function (a, b) {
          Rc && Rc();
          Ha.Md = !1;
          var d = {
              width: {
                min: cb.minWidth,
                max: cb.maxWidth,
                ideal: cb.idealWidth,
              },
              height: {
                min: cb.minHeight,
                max: cb.maxHeight,
                ideal: cb.idealHeight,
              },
              facingMode: { ideal: "user" },
            },
            f = { video: d, audio: !1 };
          Ha.wh = f;
          d && -1 !== Ha.deviceId && oc(f, Ha.deviceId);
          gd(
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia
              ? document.createElement("video")
              : !1,
            function (l) {
              Sc && Sc(l);
              pd(l).then(a).catch(b);
            },
            function (l) {
              Tb && Tb("WEBCAM_UNAVAILABLE", l);
              b(l);
            },
            f
          );
        });
      }
      function pd(a) {
        Ha.element = a;
        a = Ha.element.videoWidth || Ha.element.width;
        var b = Ha.element.videoHeight || Ha.element.height;
        Ha.Sg = { la: Ha.element, isPot: !1, isFloat: !1, isFlipY: !0 };
        Ha.V = ba.instance(Ha.Sg);
        ib.Eg(a, b);
        return ib
          .Df(a, b)
          .then(function () {
            ib.Lg();
            return ib.Ko();
          })
          .catch(function (d) {
            return Promise.reject(d);
          });
      }
      function Pd() {
        var a = document.createElement("canvas");
        a.width = K.width;
        a.height = K.height;
        Ha.Lh = a.getContext("2d");
        Ha.Md = !0;
        return pd(a);
      }
      function ec(a) {
        return 3 === arguments.length ? this.rb(arguments) : this.set(a);
      }
      function qd(a, b) {
        b = Math.floor(b);
        a.r = ((b >> 16) & 255) / 255;
        a.Z = ((b >> 8) & 255) / 255;
        a.b = (b & 255) / 255;
      }
      function Qd(a, b) {
        function d(h) {
          void 0 !== h &&
            1 > parseFloat(h) &&
            console.warn(
              "JETHREE.Color: Alpha component of " + b + " will be ignored."
            );
        }
        var f;
        if ((f = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(b))) {
          var l = f[2];
          switch (f[1]) {
            case "rgb":
            case "rgba":
              if (
                (f =
                  /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(
                    l
                  ))
              ) {
                a.r = Math.min(255, parseInt(f[1], 10)) / 255;
                a.Z = Math.min(255, parseInt(f[2], 10)) / 255;
                a.b = Math.min(255, parseInt(f[3], 10)) / 255;
                d(f[5]);
                return;
              }
              if (
                (f =
                  /^(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(
                    l
                  ))
              ) {
                a.r = Math.min(100, parseInt(f[1], 10)) / 100;
                a.Z = Math.min(100, parseInt(f[2], 10)) / 100;
                a.b = Math.min(100, parseInt(f[3], 10)) / 100;
                d(f[5]);
                return;
              }
              break;
            case "hsl":
            case "hsla":
              if (
                (f =
                  /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(
                    l
                  ))
              ) {
                l = parseFloat(f[1]) / 360;
                var p = parseInt(f[2], 10) / 100,
                  u = parseInt(f[3], 10) / 100;
                d(f[5]);
                a.$n(l, p, u);
                return;
              }
          }
        } else if ((f = /^#([A-Fa-f0-9]+)$/.exec(b))) {
          f = f[1];
          l = f.length;
          if (3 === l) {
            a.r = parseInt(f.charAt(0) + f.charAt(0), 16) / 255;
            a.Z = parseInt(f.charAt(1) + f.charAt(1), 16) / 255;
            a.b = parseInt(f.charAt(2) + f.charAt(2), 16) / 255;
            return;
          }
          if (6 === l) {
            a.r = parseInt(f.charAt(0) + f.charAt(1), 16) / 255;
            a.Z = parseInt(f.charAt(2) + f.charAt(3), 16) / 255;
            a.b = parseInt(f.charAt(4) + f.charAt(5), 16) / 255;
            return;
          }
        }
        b &&
          0 < b.length &&
          ((f = Rd[b]),
          void 0 !== f
            ? qd(a, f)
            : console.warn("JETHREE.Color: Unknown color " + b));
      }
      function Gc(a, b, d, f) {
        this.F = a || 0;
        this.G = b || 0;
        this.H = d || 0;
        this.T = void 0 !== f ? f : 1;
      }
      function rd(a, b, d) {
        var f = b.F,
          l = b.G,
          p = b.H;
        b = b.T;
        var u = d.F,
          h = d.G,
          m = d.H;
        d = d.T;
        a.F = f * d + b * u + l * m - p * h;
        a.G = l * d + b * h + p * u - f * m;
        a.H = p * d + b * m + f * h - l * u;
        a.T = b * d - f * u - l * h - p * m;
        return a;
      }
      function fc(a, b) {
        this.x = a || 0;
        this.y = b || 0;
      }
      function Wa(a, b, d) {
        this.x = a || 0;
        this.y = b || 0;
        this.z = d || 0;
      }
      function sd(a, b) {
        var d = a.x,
          f = a.y,
          l = a.z;
        a.x = f * b.z - l * b.y;
        a.y = l * b.x - d * b.z;
        a.z = d * b.y - f * b.x;
      }
      function gc(a, b, d, f) {
        this.F = a || 0;
        this.G = b || 0;
        this.H = d || 0;
        this.Ta = f || gc.fk;
      }
      function Tc(a, b) {
        this.min = void 0 !== a ? a : new Wa(Infinity, Infinity, Infinity);
        this.max = void 0 !== b ? b : new Wa(-Infinity, -Infinity, -Infinity);
      }
      function Hc(a) {
        return new Wa().dd(a.min, a.max).Fa(0.5);
      }
      function Sd(a, b) {
        a.min.min(b);
        a.max.max(b);
      }
      function hc() {
        this.elements = new Float32Array([
          1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ]);
        0 < arguments.length &&
          console.error(
            "JETHREE.Matrix4: the constructor no longer reads arguments. use .set() instead."
          );
      }
      function td(a, b, d) {
        var f = b.elements,
          l = d.elements;
        d = a.elements;
        b = f[0];
        var p = f[4],
          u = f[8],
          h = f[12],
          m = f[1],
          q = f[5],
          v = f[9],
          J = f[13],
          t = f[2],
          x = f[6],
          z = f[10],
          k = f[14],
          g = f[3],
          E = f[7],
          M = f[11];
        f = f[15];
        var D = l[0],
          F = l[4],
          e = l[8],
          n = l[12],
          y = l[1],
          Q = l[5],
          B = l[9],
          A = l[13],
          O = l[2],
          G = l[6],
          w = l[10],
          I = l[14],
          T = l[3],
          U = l[7],
          da = l[11];
        l = l[15];
        d[0] = b * D + p * y + u * O + h * T;
        d[4] = b * F + p * Q + u * G + h * U;
        d[8] = b * e + p * B + u * w + h * da;
        d[12] = b * n + p * A + u * I + h * l;
        d[1] = m * D + q * y + v * O + J * T;
        d[5] = m * F + q * Q + v * G + J * U;
        d[9] = m * e + q * B + v * w + J * da;
        d[13] = m * n + q * A + v * I + J * l;
        d[2] = t * D + x * y + z * O + k * T;
        d[6] = t * F + x * Q + z * G + k * U;
        d[10] = t * e + x * B + z * w + k * da;
        d[14] = t * n + x * A + z * I + k * l;
        d[3] = g * D + E * y + M * O + f * T;
        d[7] = g * F + E * Q + M * G + f * U;
        d[11] = g * e + E * B + M * w + f * da;
        d[15] = g * n + E * A + M * I + f * l;
        return a;
      }
      function Uc(a, b, d, f, l, p) {
        this.a = a;
        this.b = b;
        this.c = d;
        this.Ga = f instanceof Wa ? f : new Wa();
        this.Ae = Array.isArray(f) ? f : [];
        this.color = l instanceof ec ? l : new ec();
        this.$g = Array.isArray(l) ? l : [];
        this.$b = void 0 !== p ? p : 0;
      }
      function Td(a, b, d) {
        var f = new XMLHttpRequest();
        f.open("GET", a, !0);
        var l = (f.withCredentials = !1);
        f.onreadystatechange = function () {
          404 !== f.status || l || ((l = !0), d && d(404));
          if (4 === f.readyState && 200 === f.status) {
            var p = null;
            try {
              p = JSON.parse(f.responseText);
            } catch (u) {
              d && d(-1);
            }
            b && p && b(p);
          }
        };
        f.onerror = function () {
          d && d(0);
        };
        f.send();
      }
      function Vc(a, b, d) {
        "object" === typeof a ? b(a) : Td(a, b, d);
      }
      function Ud(a) {
        return new Promise(function (b, d) {
          Vc(a, b, d);
        });
      }
      function Vd(a, b) {
        for (var d = new Wa(), f = new Wa(), l = 0, p = b.length; l < p; l++) {
          var u = b[l],
            h = a[u.a],
            m = a[u.b],
            q = a[u.c];
          h &&
            m &&
            q &&
            (d.gb(q, m),
            f.gb(h, m),
            sd(d, f),
            0 !== d.Lf() && (d.normalize(), u.Ga.N(d)));
        }
      }
      function Wd(a, b) {
        for (var d = Array(a.length), f = 0, l = a.length; f < l; ++f)
          d[f] = new Wa();
        f = new Wa();
        l = new Wa();
        for (var p = 0, u = b.length; p < u; ++p) {
          var h = b[p],
            m = a[h.a],
            q = a[h.b],
            v = a[h.c];
          m &&
            q &&
            v &&
            (f.gb(v, q),
            l.gb(m, q),
            sd(f, l),
            d[h.a].add(f),
            d[h.b].add(f),
            d[h.c].add(f));
        }
        f = 0;
        for (a = a.length; f < a; ++f) d[f].normalize();
        a = 0;
        for (f = b.length; a < f; ++a)
          (h = b[a]),
            (l = h.Ae),
            (p = d[h.a]),
            (u = d[h.b]),
            (h = d[h.c]),
            p &&
              u &&
              h &&
              (3 === l.length
                ? (l[0].N(p), l[1].N(u), l[2].N(h))
                : ((l[0] = p.clone()), (l[1] = u.clone()), (l[2] = h.clone())));
        return d;
      }
      function Xd(a, b, d, f) {
        function l(n) {
          F.N(b[n]);
          e.N(F);
          var y = h[n];
          M.N(y);
          M.sub(F.Fa(F.qd(y))).normalize();
          var Q = e.x,
            B = e.y,
            A = e.z,
            O = y.x,
            G = y.y;
          y = y.z;
          D.x = B * y - A * G;
          D.y = A * O - Q * y;
          D.z = Q * G - B * O;
          Q = 0 > D.qd(m[n]) ? -1 : 1;
          u[4 * n] = M.x;
          u[4 * n + 1] = M.y;
          u[4 * n + 2] = M.z;
          u[4 * n + 3] = Q;
        }
        for (
          var p = a.length,
            u = new Float32Array(4 * p),
            h = Array(p),
            m = Array(p),
            q = 0;
          q < p;
          q++
        )
          (h[q] = new Wa()), (m[q] = new Wa());
        var v = new Wa(),
          J = new Wa(),
          t = new Wa(),
          x = new fc(),
          z = new fc(),
          k = new fc(),
          g = new Wa(),
          E = new Wa();
        f.forEach(function (n) {
          var y = n.a,
            Q = n.b;
          n = n.c;
          v.N(a[y]);
          J.N(a[Q]);
          t.N(a[n]);
          x.N(d[y]);
          z.N(d[Q]);
          k.N(d[n]);
          var B = J.x - v.x,
            A = t.x - v.x,
            O = J.y - v.y,
            G = t.y - v.y,
            w = J.z - v.z,
            I = t.z - v.z,
            T = z.x - x.x,
            U = k.x - x.x,
            da = z.y - x.y,
            N = k.y - x.y,
            ra = 1 / (T * N - U * da);
          g.set(
            (N * B - da * A) * ra,
            (N * O - da * G) * ra,
            (N * w - da * I) * ra
          );
          E.set(
            (T * A - U * B) * ra,
            (T * G - U * O) * ra,
            (T * I - U * w) * ra
          );
          h[y].add(g);
          h[Q].add(g);
          h[n].add(g);
          m[y].add(E);
          m[Q].add(E);
          m[n].add(E);
        });
        var M = new Wa(),
          D = new Wa(),
          F = new Wa(),
          e = new Wa();
        f.forEach(function (n) {
          l(n.a);
          l(n.b);
          l(n.c);
        });
        return u;
      }
      function ud(a, b, d, f) {
        return Math.sqrt((a - d) * (a - d) + (b - f) * (b - f));
      }
      var W = {
          zh: !0,
          Mp: !1,
          Np: !1,
          nl: !1,
          yh: !1,
          Lp: !1,
          Qa: !1,
          Id: !1,
          zq: !1,
          ea: "",
          Mi: "",
          Lk: 700,
          Kk: 200,
          Ah: !1,
          Zo: !1,
          $o: !1,
          Yo: !1,
          sk: 3,
          Ob: !1,
          kh: !0,
          Lb: "images/backgrounds/interior2.jpg",
          wc: "images/backgrounds/interior_light.jpg",
          Nk: [256, 256, 512, 512],
          vc: 2.1,
          xc: 8,
          Mk: [64, 128, 256, 256],
          Fm: [60, 96, 160, 250],
          Em: [8, 12, 18, 40],
          Rc: 2.2,
          kg: 1,
          Oe: 300,
          ph: 500,
          Pe: 50,
          Xk: 0,
          Yk: 0,
          Bp: 45,
          Dp: 1,
          Cp: 1e3,
          qh: 20,
          qp: 10,
          sp: 10,
          tp: 5,
          yn: 0.1,
          Ui: 20,
          Xi: 100,
          Yi: 100,
          xn: -Math.PI / 3,
          wn: Math.PI / 3,
          Wi: 0,
          Oj: 0,
          ud: [40, 32, 16, 16],
          qk: [0, 0.87, 0.92, 0.9],
          tn: 2,
          nn: 100,
          ga_: !1,
          tk: 16,
          uk: 0.4,
          wk: [0.72, 0.73, 0.72, 0.74],
          Gk: 1.2,
          Dk: [0.5, 0.5, 0.5, 1],
          Ik: 140,
          Hk: 280,
          Jk: 1.2,
          xk: 20,
          yk: 40,
          Fk: [6, 9, 9, 12],
          Ck: [0.03, 0.02, 0.02, 0.018],
          Bk: [0.35, 0.35, 0.4, 0.5],
          zk: [0.2, 0.2, 0.2, 0.2],
          vk: [0.1, 0.15, 0.15, 0.15],
          Ek: [200, 200, 150, 120],
          Ak: [1, 2, 3, 5],
          Go: 1.1,
          Sq: [0.25, 0.5, 1, 2],
          Tq: 256,
          Rq: 256,
          Qq: 200,
          Ho: [40, 80, 200, 500],
          Io: [35, 45, 80, 120],
          il: !0,
          jl: "CCW",
        },
        vd = {},
        aa = (function () {
          function a(w, I, T) {
            I = w.createShader(I);
            w.shaderSource(I, T);
            w.compileShader(I);
            return w.getShaderParameter(I, w.COMPILE_STATUS) ? I : null;
          }
          function b(w, I, T) {
            I = a(w, w.VERTEX_SHADER, I);
            T = a(w, w.FRAGMENT_SHADER, T);
            w === c && h.push(I, T);
            var U = w.createProgram();
            w.attachShader(U, I);
            w.attachShader(U, T);
            w.linkProgram(U);
            return U;
          }
          function d(w) {
            return ["float", "sampler2D", "int"]
              .map(function (I) {
                return "precision " + w + " " + I + ";\n";
              })
              .join("");
          }
          function f(w, I) {
            I.R = I.R ? !0 : !1;
            if (!I.R) {
              I.v =
                I.v ||
                "precision lowp float;attribute vec2 a0;varying vec2 vv0;void main(){gl_Position=vec4(a0,0.,1.),vv0=a0*.5+vec2(.5);}";
              I.K = I.K || ["a0"];
              I.S = I.S || [2];
              I.precision = I.precision || t;
              I.id = v++;
              void 0 !== I.lj &&
                (I.lj.forEach(function (da, N) {
                  I.g = I.g.replace(da, I.Ia[N]);
                }),
                I.lj.splice(0));
              I.ah = 0;
              I.S.forEach(function (da) {
                I.ah += 4 * da;
              });
              var T = d(I.precision);
              I.qa = b(w, T + I.v, T + I.g);
              I.B = {};
              I.i.forEach(function (da) {
                I.B[da] = w.getUniformLocation(I.qa, da);
              });
              I.attributes = {};
              I.xa = [];
              I.K.forEach(function (da) {
                var N = w.getAttribLocation(I.qa, da);
                I.attributes[da] = N;
                I.xa.push(N);
              });
              if (I.o) {
                w.useProgram(I.qa);
                q = I;
                m = I.id;
                for (var U in I.o) w.uniform1i(I.B[U], I.o[U]);
              }
              I.Oa = !0;
            }
          }
          function l(w) {
            Db.Cj(G);
            m !== w.id &&
              (G.M(),
              (m = w.id),
              (q = w),
              c.useProgram(w.qa),
              w.xa.forEach(function (I) {
                0 !== I && c.enableVertexAttribArray(I);
              }));
          }
          function p(w, I, T) {
            f(w, I, T);
            w.useProgram(I.qa);
            w.enableVertexAttribArray(I.attributes.a0);
            m = -1;
            return (q = I);
          }
          function u() {
            return {
              g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
              i: ["u1"],
              o: { u1: 0 },
            };
          }
          var h = [],
            m = -1,
            q = null,
            v = 0,
            J = !1,
            t = "highp",
            x = ["u1"],
            z = ["u0"],
            k = { u1: 0 },
            g = { u0: 0 },
            E = { u1: 0, u2: 1 },
            M = { u1: 0, u3: 1 },
            D = ["u1", "u3", "u4"],
            F = ["u5", "u6"],
            e = { u5: 0 },
            n = ["u7", "u8", "u9", "u10"],
            y = { u7: 0, u8: 1 },
            Q = {
              s0: u(),
              s1: {
                g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
                i: x,
                o: k,
                precision: "lowp",
              },
              s2: {
                g: "uniform sampler2D u1,u2;varying vec2 vv0;void main(){vec4 a=texture2D(u2,vv0),b=texture2D(u1,vv0);gl_FragColor=a*b;}",
                i: ["u1", "u2"],
                o: E,
              },
              s3: {
                g: "uniform sampler2D u1;uniform vec2 u11,u12;varying vec2 vv0;void main(){vec2 a=vv0*u11+u12;gl_FragColor=texture2D(u1,a);}",
                i: ["u1", "u11", "u12"],
                o: k,
                R: !0,
              },
              s4: {
                g: "uniform sampler2D u1;varying vec2 vv0;const vec4 f=vec4(1.,1.,1.,1.);void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=a.r*f;}",
                i: x,
                o: k,
              },
              s5: {
                g: "uniform sampler2D u1,u2;varying vec2 vv0;const vec4 f=vec4(1.,1.,1.,1.);void main(){vec4 a=texture2D(u2,vv0),b=texture2D(u1,vv0);gl_FragColor=a.a*b.r*f;}",
                i: ["u1", "u2"],
                o: E,
              },
              s6: {
                g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vec2(1.-vv0.x,vv0.y));}",
                i: x,
                o: k,
              },
              s7: {
                g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vec2(vv0.x,1.-vv0.y));}",
                i: x,
                o: k,
              },
              s8: {
                g: "uniform sampler2D u0;uniform float u11;varying vec2 vv0;void main(){vec4 a=texture2D(u0,vv0);gl_FragColor=a*u11;}",
                i: ["u0", "u11"],
                o: g,
              },
              s9: {
                g: "uniform sampler2D u0;uniform float u11;varying vec2 vv0;const vec4 f=vec4(.25),g=vec4(1.);void main(){vec4 a=texture2D(u0,vv0);float b=dot(a*u11,f);gl_FragColor=b*g;}",
                i: ["u0", "u11"],
                o: g,
              },
              s10: {
                g: "uniform sampler2D u1;varying vec2 vv0;const vec4 e=vec4(1.,1.,1.,1.);void main(){float a=.25*dot(e,texture2D(u1,vv0));gl_FragColor=a*e;}",
                i: x,
                o: k,
              },
              s11: {
                g: "uniform sampler2D u1,u13;uniform float u14;const vec4 f=vec4(1.);varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0),b=texture2D(u13,vv0);gl_FragColor=mix(b,a,u14*f);}",
                i: ["u1", "u13", "u14"],
                o: { u1: 0, u13: 1 },
              },
              s12: {
                g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){gl_FragColor=.25*(texture2D(u1,vv0+u15)+texture2D(u1,vv0+u15*vec2(1.,-1.))+texture2D(u1,vv0+u15*vec2(-1.,-1.))+texture2D(u1,vv0+u15*vec2(-1.,1.)));}",
                i: ["u1", "u15"],
                o: k,
              },
              s13: {
                g: "uniform sampler2D u1;varying vec2 vv0;vec4 f(vec3 d){vec3 b=d/65536.,a=clamp(ceil(log2(b)),-128.,127.);float c=max(max(a.r,a.g),a.b),g=exp2(c);vec3 h=clamp(b/g,0.,1.);return vec4(h,(c+128.)/256.);}void main(){vec3 a=texture2D(u1,vv0).rgb;gl_FragColor=f(a);}",
                i: x,
                o: k,
                R: !0,
              },
              s14: {
                g: "uniform sampler2D u1;varying vec2 vv0;vec3 f(vec4 a){float b=a.a*256.-128.;vec3 c=a.rgb;return exp2(b)*c*65536.;}void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=vec4(f(a),1.);}",
                i: x,
                o: k,
                R: !0,
              },
              s15: {
                g: "uniform sampler2D u1;uniform vec4 u16;varying vec2 vv0;float g(float a,float b){a=floor(a)+.5;return floor(a/exp2(b));}float h(float a,float b){return floor(a*exp2(b)+.5);}float i(float a,float b){return mod(a,h(1.,b));}float e(float c,float a,float b){a=floor(a+.5),b=floor(b+.5);return i(g(c,a),b-a);}vec4 j(float a){if(a==0.)return vec4(0.,0.,0.,0.);float k=128.*step(a,0.);a=abs(a);float c=floor(log2(a)),l=c+127.,b=(a/exp2(c)-1.)*8388608.,d=l/2.,m=fract(d)*2.,n=floor(d),o=e(b,0.,8.),p=e(b,8.,16.),q=m*128.+e(b,16.,23.),r=k+n;return vec4(o,p,q,r)/255.;}void main(){float a=dot(texture2D(u1,vv0),u16);gl_FragColor=j(a);}",
                i: ["u1", "u16"],
                o: k,
              },
              s16: {
                g: "uniform sampler2D u0;varying vec2 vv0;const vec4 e=vec4(1.);void main(){vec4 a=texture2D(u0,vv0),b=e/(e+exp(-a));gl_FragColor=b;}",
                i: z,
                o: g,
                R: !0,
              },
              s17: {
                g: "uniform sampler2D u0;varying vec2 vv0;const vec4 f=vec4(0.);void main(){vec4 a=texture2D(u0,vv0);gl_FragColor=max(f,a);}",
                i: z,
                o: g,
                R: !0,
              },
              s18: {
                g: "uniform sampler2D u0;varying vec2 vv0;const vec4 e=vec4(1.);const float g=.797885,h=.044715;vec4 i(vec4 a){vec4 b=exp(-abs(a)),c=b*b,d=sign(a)*(e-c)/(e+c);return d;}void main(){vec4 a=texture2D(u0,vv0),b=a+h*a*a*a,c=i(g*b);gl_FragColor=.5*a*(e+c);}",
                i: z,
                o: g,
                R: !0,
              },
              s19: {
                g: "uniform sampler2D u0;varying vec2 vv0;const vec4 f=vec4(1.);void main(){vec4 a=texture2D(u0,vv0);gl_FragColor=mix(exp(-abs(a))-f,a,step(0.,a));}",
                i: z,
                o: g,
                R: !0,
              },
              s20: {
                g: "uniform sampler2D u0;varying vec2 vv0;const vec4 f=vec4(1.);void main(){vec4 a=texture2D(u0,vv0),b=exp(a)-f;gl_FragColor=mix(.1*b,a,step(0.,a));}",
                i: z,
                o: g,
              },
              s21: {
                g: "uniform sampler2D u0;const float e=3.141593;varying vec2 vv0;void main(){gl_FragColor=atan(e*texture2D(u0,vv0))/e;}",
                i: z,
                o: g,
              },
              s22: {
                g: "uniform sampler2D u0;const float e=3.141593;varying vec2 vv0;void main(){gl_FragColor=2.*atan(e*texture2D(u0,vv0))/e;}",
                i: z,
                o: g,
                R: !0,
              },
              s23: {
                g: "uniform sampler2D u0,u17;uniform float u18;const vec2 e=vec2(.5);const float f=1e-5;const vec4 g=vec4(1.),i=vec4(0.);varying vec2 vv0;void main(){vec4 a=texture2D(u17,e);float b=u18*u18;vec4 c=max(b*a,f*g);gl_FragColor=texture2D(u0,vv0)/c;}",
                i: ["u0", "u17", "u18"],
                o: { u0: 0, u17: 1 },
                R: !0,
              },
              s24: {
                g: "uniform sampler2D u1;uniform vec2 u19;varying vec2 vv0;void main(){float a=u19.x*u19.y;vec2 b=floor(vv0*a)/a,c=fract(vv0*a),d=floor(b*u19.y),f=floor(u19.x*fract(b*u19.y)),g=(f*u19.y+d)/a;gl_FragColor=texture2D(u1,g+c/a);}",
                i: ["u1", "u19"],
                o: k,
              },
              s25: {
                g: "uniform sampler2D u8,u7,u20;varying vec2 vv0;void main(){vec4 a=texture2D(u20,vv0);vec2 b=a.rg,c=a.ba;vec4 d=texture2D(u8,b),f=texture2D(u7,c);gl_FragColor=d*f;}",
                i: ["u8", "u7", "u20"],
                o: Object.assign({ u20: 2 }, y),
                R: !0,
              },
              s26: {
                g: "uniform float u9,u10;uniform sampler2D u8,u7;varying vec2 vv0;void main(){vec2 b=fract(vv0*u9);float a=u9*u10;vec2 c=(vec2(.5)+floor(a*vv0))/a;vec4 d=texture2D(u8,c),f=texture2D(u7,b);gl_FragColor=d*f;}",
                i: n,
                o: y,
              },
              s27: {
                g: "uniform float u9,u10;uniform vec2 u21;uniform sampler2D u8,u7;varying vec2 vv0;void main(){float a=u9*u10;vec2 b=mod(vv0*u21,vec2(1.)),c=floor(vv0*u21)/u21,d=c+fract(b*u9)/u21,f=(vec2(.5)+floor(a*b))/a;vec4 g=texture2D(u8,f),h=texture2D(u7,d);gl_FragColor=g*h;}",
                i: ["u21"].concat(n),
                o: y,
                R: !0,
              },
              s28: {
                g: "uniform float u9,u10;uniform sampler2D u8,u7,u23,u24,u25,u26;varying vec2 vv0;const vec4 e=vec4(1.,1.,1.,1.),g=vec4(1e-3,1e-3,1e-3,1e-3);void main(){vec2 c=fract(vv0*u9),d=vv0;float h=u9*u10;d=(.5+floor(h*vv0))/h;vec4 l=texture2D(u8,d),m=texture2D(u7,c),a=texture2D(u26,d);a=floor(.5+a*255.);vec4 n=texture2D(u23,c),o=texture2D(u24,c),p=texture2D(u25,c),i=step(-g,-a),b=e-i,j=b*step(-e-g,-a);b*=e-j;vec4 k=b*step(-2.*e-g,-a);b*=e-k;vec4 q=b,r=i*m+j*n+k*o+q*p;gl_FragColor=l*r;}",
                i: ["u26", "u23", "u24", "u25"].concat(n),
                o: Object.assign({ u26: 3, u23: 4, u24: 5, u25: 6 }, y),
                R: !0,
              },
              s29: {
                g: "uniform sampler2D u8,u7,u3;uniform float u9,u27,u28,u10;uniform vec2 u29;varying vec2 vv0;const vec2 f=vec2(1.),l=vec2(0.);void main(){vec2 c=floor(u27*vv0),d=u27*vv0-c;float g=u9/u27;vec2 h=floor(d*g),i=d*g-h,j=(c+i)/u27;float m=u27*u10/u9;vec2 b=m*h,n=floor(.5*(u10-1.)*(f-u29));b=floor(u29*b+n);vec2 a=(b+i*u28)/u10;a+=.25/u10;vec2 k=step(a,f)*step(l,a);vec4 o=texture2D(u8,j),p=texture2D(u7,a),q=o*p,r=texture2D(u3,j);gl_FragColor=(q*u28*u28+r)*k.x*k.y;}",
                i: ["u27", "u28", "u3", "u29"].concat(n),
                o: Object.assign({ u3: 2 }, y),
              },
              s30: {
                g: "uniform sampler2D u8,u7;varying vec2 vv0;void main(){vec4 a=texture2D(u8,vv0),b=texture2D(u7,vv0);gl_FragColor=a*b;}",
                i: ["u8", "u7"],
                o: y,
                R: !0,
              },
              s31: {
                g: "uniform sampler2D u1,u3;uniform float u4;varying vec2 vv0;void main(){gl_FragColor=texture2D(u3,vv0)+u4*texture2D(u1,vv0);}",
                i: D,
                o: M,
              },
              s32: {
                g: "uniform sampler2D u1,u3;uniform vec2 u21;uniform float u4;varying vec2 vv0;void main(){gl_FragColor=texture2D(u3,vv0*u21)+u4*texture2D(u1,vv0);}",
                i: ["u21"].concat(D),
                o: M,
                R: !0,
              },
              s33: {
                g: "uniform sampler2D u1,u3;uniform float u4;varying vec2 vv0;const vec4 e=vec4(1.);void main(){vec4 a=texture2D(u3,vv0)+u4*texture2D(u1,vv0);vec2 h=mod(gl_FragCoord.xy,vec2(2.)),d=step(h,vec2(.75));float b=d.x+2.*d.y,c=step(2.5,b),g=(1.-c)*step(1.5,b),i=(1.-c)*(1.-g)*step(.5,b);a=mix(a,a.argb,i*e),a=mix(a,a.barg,g*e),a=mix(a,a.gbar,c*e),gl_FragColor=a;}",
                i: D,
                o: M,
                R: !0,
              },
              s34: {
                g: "uniform sampler2D u1,u3;uniform vec2 u21;uniform float u4;varying vec2 vv0;const vec4 e=vec4(1.);void main(){vec4 a=texture2D(u3,vv0*u21)+u4*texture2D(u1,vv0);vec2 h=mod(gl_FragCoord.xy,vec2(2.)),d=step(h,vec2(.75));float b=d.x+2.*d.y,c=step(2.5,b),g=(1.-c)*step(1.5,b),i=(1.-c)*(1.-g)*step(.5,b);a=mix(a,a.argb,i*e),a=mix(a,a.barg,g*e),a=mix(a,a.gbar,c*e),gl_FragColor=a;}",
                i: ["u21"].concat(D),
                o: M,
                R: !0,
              },
              s35: {
                g: "uniform sampler2D u1,u3;uniform float u4;varying vec2 vv0;const vec4 h=vec4(1.);void main(){vec4 a=texture2D(u3,vv0)+u4*texture2D(u1,vv0);vec2 b=floor(gl_FragCoord.xy);vec3 d=b.x*vec3(1.)+vec3(0.,1.,2.);float c=mod(b.y,2.);vec4 f=vec4(c,(1.-c)*step(mod(d,vec3(3.)),vec3(.5)));mat4 g=mat4(a.rgba,a.gbar,a.barg,a.argb);gl_FragColor=g*f;}",
                i: D,
                o: M,
                R: !0,
              },
              s36: {
                g: "varying vec2 vv0;uniform sampler2D u1;const vec4 f=vec4(1.,1.,1.,1.),g=vec4(.299,.587,.114,0.);void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=dot(a,g)*f;}",
                i: x,
                o: k,
                precision: "lowp",
              },
              s37: {
                g: "varying vec2 vv0;uniform sampler2D u1;uniform float u30;const vec3 f=vec3(.299,.587,.114);void main(){vec3 a=texture2D(u1,vv0).rgb,b=texture2D(u1,vv0+vec2(0.,u30)).rgb,c=texture2D(u1,vv0+vec2(u30,u30)).rgb,d=texture2D(u1,vv0+vec2(u30,0.)).rgb;gl_FragColor=vec4(dot(a,f),dot(b,f),dot(c,f),dot(d,f));}",
                i: ["u1", "u30"],
                o: k,
                precision: "lowp",
              },
              s38: {
                g: "varying vec2 vv0;uniform sampler2D u1;uniform float u30;const vec3 f=vec3(.299,.587,.114);void main(){vec3 a=texture2D(u1,vv0).rgb,b=texture2D(u1,vv0+vec2(0.,u30)).rgb,c=texture2D(u1,vv0+vec2(u30,u30)).rgb,d=texture2D(u1,vv0+vec2(u30,0.)).rgb;gl_FragColor=vec4(a.r,b.g,c.b,dot(d,f));}",
                i: ["u1", "u30"],
                o: k,
                precision: "lowp",
              },
              s39: {
                g: "varying vec2 vv0;uniform sampler2D u1,u2;uniform float u31;const vec4 f=vec4(1.);void main(){vec4 a=vec4(0.);a-=texture2D(u1,vec2(vv0.x-u31,vv0.y-u31))*1.,a-=texture2D(u1,vec2(vv0.x-u31,vv0.y))*2.,a-=texture2D(u1,vec2(vv0.x-u31,vv0.y+u31))*1.,a+=texture2D(u1,vec2(vv0.x+u31,vv0.y-u31))*1.,a+=texture2D(u1,vec2(vv0.x+u31,vv0.y))*2.,a+=texture2D(u1,vec2(vv0.x+u31,vv0.y+u31))*1.;vec4 b=vec4(0.);b-=texture2D(u1,vec2(vv0.x-u31,vv0.y-u31))*1.,b-=texture2D(u1,vec2(vv0.x,vv0.y-u31))*2.,b-=texture2D(u1,vec2(vv0.x+u31,vv0.y-u31))*1.,b+=texture2D(u1,vec2(vv0.x-u31,vv0.y+u31))*1.,b+=texture2D(u1,vec2(vv0.x,vv0.y+u31))*2.,b+=texture2D(u1,vec2(vv0.x+u31,vv0.y+u31))*1.;vec3 c=sqrt(a.rgb*a.rgb+b.rgb*b.rgb);vec4 e=vec4(c,texture2D(u1,vv0).a),g=texture2D(u2,vv0);gl_FragColor=g.a*e.r*f;}",
                i: ["u1", "u2", "u31"],
                o: E,
                R: !0,
              },
              s40: {
                g: "varying vec2 vv0;uniform sampler2D u1,u2;uniform float u31;const vec4 j=vec4(1.,1.,1.,1.);const vec2 k=vec2(1.,1.);void main(){float h=0.;vec2 l=k*u31,a,b;float c,d,i=0.;for(float e=-4.;e<=4.;e+=1.)for(float f=-4.;f<=4.;f+=1.)a=vec2(e,f),c=length(a)/2.,d=exp(-c*c),b=vv0+l*a,h+=d*texture2D(u1,b).r,i+=d;vec4 m=texture2D(u2,vv0);gl_FragColor=m.a*(texture2D(u1,b).r-h/i)*j;}",
                i: ["u1", "u2", "u31"],
                o: E,
                R: !0,
              },
              s41: {
                g: "uniform sampler2D u5;uniform vec2 u6;varying vec2 vv0;const vec2 f=vec2(1.),g=vec2(.5),h=vec2(1.,0.),i=vec2(0.,1.);void main(){vec2 a=f/u6,c=u6/2.,d=floor(vv0*c)+g,j=d/c,b=j-a*.5;vec4 k=texture2D(u5,b),l=texture2D(u5,b+a*h),m=texture2D(u5,b+a*i),n=texture2D(u5,b+a),o=max(k,l),p=max(m,n);gl_FragColor=max(o,p);}",
                i: F,
                o: e,
                R: !0,
              },
              s42: {
                g: "uniform sampler2D u5;uniform vec2 u6;varying vec2 vv0;const vec2 k=vec2(1.),l=vec2(1.,0.),m=vec2(0.,1.),n=vec2(2.,0.),o=vec2(0.,2.);vec4 e(vec2 b,vec2 a){vec4 c=texture2D(u5,a),d=texture2D(u5,a+b*l),f=texture2D(u5,a+b*m),g=texture2D(u5,a+b),h=max(c,d),i=max(f,g);return max(h,i);}void main(){vec2 a=k/u6,c=u6/4.,d=4.*floor(vv0*c),f=d/u6,b=f+a*.5;vec4 g=e(a,b),h=e(a,b+a*n),i=e(a,b+a*2.),p=e(a,b+a*o),q=max(g,h),r=max(i,p);gl_FragColor=max(q,r);}",
                i: F,
                o: e,
                R: !0,
              },
              s43: {
                g: "uniform sampler2D u1;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=a*a;}",
                i: ["u1"],
                o: k,
                precision: "lowp",
                R: !0,
              },
              s44: {
                g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;const float e=15444.;void main(){vec4 a=1001./e*texture2D(u1,vv0-3.*u15)+2002./e*texture2D(u1,vv0-2.*u15)+3003./e*texture2D(u1,vv0-u15)+3432./e*texture2D(u1,vv0)+3003./e*texture2D(u1,vv0+u15)+2002./e*texture2D(u1,vv0+2.*u15)+1001./e*texture2D(u1,vv0+3.*u15);gl_FragColor=a;}",
                i: ["u15", "u1"],
                o: k,
                precision: "lowp",
                R: !0,
              },
              s45: {
                g: "uniform sampler2D u1,u17,u32;varying vec2 vv0;const vec4 f=vec4(1.,1.,1.,1.);const float g=.1;void main(){vec4 a=texture2D(u17,vv0),b=texture2D(u32,vv0),c=texture2D(u1,vv0),d=max(f*g,b-a*a),h=sqrt(d);gl_FragColor=(c-a)/h;}",
                i: ["u1", "u17", "u32"],
                o: { u1: 0, u17: 1, u32: 2 },
                R: !0,
              },
            },
            B = {
              s46: {
                g: "uniform float u9,u33;uniform sampler2D u8,u7,u3;varying vec2 vv0;const vec2 ZERO2=vec2(0.),ONE2=vec2(1.),HALF2=vec2(.5),EPS2=vec2(1e-5);void main(){vec4 sum=texture2D(u3,vv0);float toSparsity=1.1111;vec2 uvFrom,uvWeight,xyPatch=ZERO2,eps2=EPS2/u9,xyTo=floor(vv0*u9+eps2);float weightSize=toSparsity*u9;vec2 halfFromSparsity=ONE2*(toSparsity-1.)/2.;for(float patch_x=0.;patch_x<1.1111;patch_x+=1.){xyPatch.x=patch_x;for(float patch_y=0.;patch_y<1.1111;patch_y+=1.)xyPatch.y=patch_y,uvFrom=(xyTo+HALF2+u33*(xyPatch-halfFromSparsity))/u9,uvFrom+=step(uvFrom,-eps2),uvFrom-=step(ONE2-eps2,uvFrom),uvWeight=(xyTo*toSparsity+xyPatch+HALF2)/weightSize,sum+=texture2D(u8,uvWeight)*texture2D(u7,uvFrom);}gl_FragColor=sum,gl_FragColor*=2.2222;}",
                i: ["u9", "u8", "u7", "u3", "u33"],
                Ia: ["1.1111", "gl_FragColor\\*=2.2222;"],
              },
              s47: {
                g: "uniform float u9,u33,u10;uniform sampler2D u8,u7,u3;varying vec2 vv0;const vec2 ZERO2=vec2(0.),ONE2=vec2(1.),HALF2=vec2(.5),EPS2=vec2(1e-4);void main(){vec4 sum=texture2D(u3,vv0);float fromSparsity=1.1111,shrinkFactor=3.3333;vec2 uvFrom,uvWeight,xyFrom,xyPatchTo,xyPatch=ZERO2,xyShrink=ZERO2,eps2=EPS2/u10,xyTo=floor(vv0*u9+eps2);float weightSize=fromSparsity*u10;vec2 halfFromSparsity=ONE2*(fromSparsity-1.)/2.;float toSparsity=weightSize/u9;vec2 xyFrom0=xyTo*shrinkFactor;for(float patch_x=0.;patch_x<1.1111;patch_x+=1.){xyPatch.x=patch_x;for(float patch_y=0.;patch_y<1.1111;patch_y+=1.){xyPatch.y=patch_y;for(float shrink_x=0.;shrink_x<3.3333;shrink_x+=1.){xyShrink.x=shrink_x;for(float shrink_y=0.;shrink_y<3.3333;shrink_y+=1.)xyShrink.y=shrink_y,xyFrom=xyFrom0+xyShrink+shrinkFactor*u33*(xyPatch-halfFromSparsity),uvFrom=(xyFrom+HALF2)/u10,uvFrom+=step(uvFrom,-eps2),uvFrom-=step(ONE2-eps2,uvFrom),xyPatchTo=xyPatch*shrinkFactor+xyShrink,uvWeight=(xyTo*toSparsity+xyPatchTo+HALF2)/weightSize,sum+=texture2D(u8,uvWeight)*texture2D(u7,uvFrom);}}}gl_FragColor=sum,gl_FragColor*=2.2222;}",
                i: "u9 u10 u8 u7 u3 u33".split(" "),
                Ia: ["1.1111", "gl_FragColor\\*=2.2222;", "3.3333"],
              },
            },
            A = null,
            O = null,
            G = {
              zb: function () {
                return J;
              },
              m: function () {
                if (!J) {
                  A = Ea(Q, 2);
                  O = Ea(B, 2);
                  t = "highp";
                  c.getShaderPrecisionFormat &&
                    (c.getShaderPrecisionFormat(
                      c.FRAGMENT_SHADER,
                      c.MEDIUM_FLOAT
                    ),
                    c.getShaderPrecisionFormat(c.FRAGMENT_SHADER, c.LOW_FLOAT));
                  for (var w in A) f(c, A[w], w);
                  aa.set("s0");
                  c.enableVertexAttribArray(0);
                  J = !0;
                }
              },
              uc: function (w) {
                w.forEach(function (I) {
                  G.oa(I);
                });
              },
              oa: function (w) {
                A[w.id] = w;
                f(c, w, w.id);
              },
              Cm: function (w, I, T) {
                I || (I = w);
                A[I] = Object.create(O[w]);
                A[I].Lm = !0;
                O[w].Ia &&
                  O[w].Ia.forEach(function (U, da) {
                    var N = "";
                    "gl_Frag" === U.substring(0, 7)
                      ? ((U = new RegExp("[,;]?" + U, "g")), (N = ";"))
                      : (U = new RegExp(U, "g"));
                    A[I].g = A[I].g.replace(U, N + T[da]);
                  });
                f(c, A[I], I);
              },
              set: function (w) {
                var I = A[w];
                I.R && ((I.R = !1), f(c, I, w));
                l(I);
              },
              Eb: function (w) {
                return p(w, u(), "s48");
              },
              he: function (w) {
                return p(
                  w,
                  {
                    g: "void main(){gl_FragColor=vec4(.5,.5,.5,.5);}",
                    i: [],
                    precision: t,
                  },
                  "s49"
                );
              },
              Kl: function (w) {
                return "undefined" === typeof A[w] ? !1 : A[w].Oa;
              },
              M: function () {
                -1 !== m &&
                  ((m = -1),
                  q.xa.forEach(function (w) {
                    0 !== w && c.disableVertexAttribArray(w);
                  }));
              },
              ke: function () {
                var w = 0;
                q.xa.forEach(function (I, T) {
                  T = q.S[T];
                  c.vertexAttribPointer(I, T, c.FLOAT, !1, q.ah, w);
                  w += 4 * T;
                });
              },
              Il: function () {
                c.enableVertexAttribArray(0);
              },
              fc: function () {
                G.hc(c);
              },
              hc: function (w) {
                w.vertexAttribPointer(q.xa[0], 2, w.FLOAT, !1, 8, 0);
              },
              ie: function (w, I) {
                c.uniform1i(q.B[w], I);
              },
              D: function (w, I) {
                c.uniform1f(q.B[w], I);
              },
              O: function (w, I, T) {
                c.uniform2f(q.B[w], I, T);
              },
              Cg: function (w, I) {
                c.uniform2fv(q.B[w], I);
              },
              Dg: function (w, I) {
                c.uniform3fv(q.B[w], I);
              },
              je: function (w, I, T, U) {
                c.uniform3f(q.B[w], I, T, U);
              },
              zo: function (w, I, T, U, da) {
                c.uniform4f(q.B[w], I, T, U, da);
              },
              Ba: function (w, I) {
                c.uniform4fv(q.B[w], I);
              },
              Ao: function (w, I) {
                c.uniformMatrix2fv(q.B[w], !1, I);
              },
              Bo: function (w, I) {
                c.uniformMatrix3fv(q.B[w], !1, I);
              },
              Vc: function (w, I) {
                c.uniformMatrix4fv(q.B[w], !1, I);
              },
              j: function (w, I) {
                G.set(w);
                I.forEach(function (T) {
                  switch (T.type) {
                    case "4f":
                      c.uniform4fv(q.B[T.name], T.value);
                      break;
                    case "3f":
                      c.uniform3fv(q.B[T.name], T.value);
                      break;
                    case "2f":
                      c.uniform2fv(q.B[T.name], T.value);
                      break;
                    case "1f":
                      c.uniform1f(q.B[T.name], T.value);
                      break;
                    case "1i":
                      c.uniform1i(q.B[T.name], T.value);
                      break;
                    case "mat2":
                      c.uniformMatrix2fv(q.B[T.name], !1, T.value);
                      break;
                    case "mat3":
                      c.uniformMatrix3fv(q.B[T.name], !1, T.value);
                      break;
                    case "mat4":
                      c.uniformMatrix4fv(q.B[T.name], !1, T.value);
                  }
                });
              },
              aq: function () {
                return "lowp";
              },
              A: function () {
                G.M();
                c.disableVertexAttribArray(0);
                for (var w in A) {
                  var I = A[w];
                  I.Oa && ((I.Oa = !1), c.deleteProgram(I.qa));
                  I.Lm && delete A[w];
                }
                h.forEach(function (T) {
                  c.deleteShader(T);
                });
                h.splice(0);
                v = 0;
                J = !1;
                q = null;
                m = -1;
              },
            };
          return G;
        })(),
        c = null,
        ob = (function () {
          function a(x) {
            console.log("ERROR in ContextFF: ", x);
            return !1;
          }
          function b() {
            return (
              navigator.userAgent &&
              -1 !== navigator.userAgent.indexOf("forceWebGL1")
            );
          }
          function d(x, z, k) {
            x.setAttribute("width", z);
            x.setAttribute("height", k);
          }
          function f(x) {
            if (b()) return !1;
            var z = document.createElement("canvas");
            d(z, 5, 5);
            var k = null;
            try {
              k = z.getContext("webgl2", x);
            } catch (g) {
              return !1;
            }
            if (!k) return !1;
            l(k);
            Ia.Mh(k);
            x = Ia.$e(k);
            if (!x.Xa && !x.Za) return Jb.A(), Ia.reset(), !1;
            k = Jb.rh(k, x);
            Jb.A();
            Ia.reset();
            return k ? !0 : !1;
          }
          function l(x) {
            x.clearColor(0, 0, 0, 0);
            x.disable(x.DEPTH_TEST);
            x.disable(x.BLEND);
            x.disable(x.DITHER);
            x.disable(x.STENCIL_TEST);
            x.disable(x.CULL_FACE);
            x.GENERATE_MIPMAP_HINT &&
              x.FASTEST &&
              x.hint(x.GENERATE_MIPMAP_HINT, x.FASTEST);
            x.disable(x.SAMPLE_ALPHA_TO_COVERAGE);
            x.disable(x.SAMPLE_COVERAGE);
            x.depthFunc(x.LEQUAL);
            x.clearDepth(1);
          }
          var p = null,
            u = null,
            h = null,
            m = !0,
            q = null,
            v = null,
            J = [],
            t = {
              P: function () {
                return p.width;
              },
              $: function () {
                return p.height;
              },
              tb: function () {
                return p;
              },
              Ql: function () {
                return c;
              },
              na: function () {
                return m;
              },
              flush: function () {
                c.flush();
              },
              jq: function () {
                Fa.reset();
                Fa.ba();
                t.Rn();
              },
              Rn: function () {
                ba.reset();
                X.reset();
                aa.M();
                aa.Il();
                c.disable(c.DEPTH_TEST);
                c.disable(c.BLEND);
                X.kd();
                aa.fc();
              },
              Vl: function () {
                q || (q = new Uint8Array(p.width * p.height * 4));
                c.readPixels(
                  0,
                  0,
                  p.width,
                  p.height,
                  c.RGBA,
                  c.UNSIGNED_BYTE,
                  q
                );
                return q;
              },
              Xp: function () {
                return p.toDataURL("image/jpeg");
              },
              Yp: function () {
                Fa.aa();
                u ||
                  ((u = document.createElement("canvas")),
                  (h = u.getContext("2d")));
                d(u, p.width, p.height);
                for (
                  var x = t.Vl(),
                    z = h.createImageData(u.width, u.height),
                    k = u.width,
                    g = u.height,
                    E = z.data,
                    M = 0;
                  M < g;
                  ++M
                )
                  for (var D = g - M - 1, F = 0; F < k; ++F) {
                    var e = 4 * (M * k + F),
                      n = 4 * (D * k + F);
                    E[e] = x[n];
                    E[e + 1] = x[n + 1];
                    E[e + 2] = x[n + 2];
                    E[e + 3] = x[n + 3];
                  }
                h.putImageData(z, 0, 0);
                return u.toDataURL("image/png");
              },
              Zh: function (x) {
                !u &&
                  x &&
                  ((u = document.createElement("canvas")),
                  (h = u.getContext("2d")));
                var z = x ? u : document.createElement("canvas");
                d(z, p.width, p.height);
                (x ? h : z.getContext("2d")).drawImage(p, 0, 0);
                return z;
              },
              m: function (x) {
                x = Object.assign(
                  {
                    Ya: null,
                    eg: null,
                    sa: null,
                    Ve: null,
                    width: 512,
                    height: 512,
                    premultipliedAlpha: !1,
                    Im: !0,
                    antialias: !1,
                    debug: !1,
                    Kp: !1,
                  },
                  x
                );
                x.Ya
                  ? ((c = x.Ya), (p = x.Ya.canvas))
                  : x.Ve && !x.sa
                  ? (p = document.getElementById(x.Ve))
                  : x.sa && (p = x.sa);
                p || (p = document.createElement("canvas"));
                p.width = x.width;
                p.height = x.height;
                if (c) m = c instanceof WebGL2RenderingContext;
                else {
                  m = !0;
                  var z = {
                    antialias: x.antialias,
                    alpha: !0,
                    preserveDrawingBuffer: !0,
                    premultipliedAlpha: x.premultipliedAlpha,
                    stencil: !1,
                    depth: x.Im,
                    failIfMajorPerformanceCaveat: !0,
                    powerPreference: "high-performance",
                  };
                  navigator &&
                    navigator.userAgent &&
                    -1 !== navigator.userAgent.indexOf("noAntialiasing") &&
                    (z.antialias = !1);
                  var k = f(z);
                  k || !z.antialias || b() || ((z.antialias = !1), (k = f(z)));
                  k && (c = p.getContext("webgl2", z));
                  c
                    ? (m = !0)
                    : ((c = p.getContext("webgl", z)) ||
                        (c = p.getContext("experimental-webgl", z)),
                      (m = !1));
                }
                if (!c) return a("WebGL1 and 2 are not enabled");
                x.eg &&
                  p.addEventListener &&
                  ((v = x.eg), p.addEventListener("webglcontextlost", v, !1));
                if (!Ia.m()) return a("Not enough GL capabilities");
                l(c);
                aa.m();
                X.m();
                Jb.rh(c, Ia.Sl());
                J.forEach(function (g) {
                  g(c);
                });
                J.splice(0);
                return !0;
              },
              Ap: function () {
                return new Promise(function (x) {
                  c ? x(c) : J.push(x);
                });
              },
              A: function () {
                c && (Ia.A(), aa.A(), Jb.A());
                v &&
                  (p.removeEventListener("webglcontextlost", v, !1),
                  (v = null));
                c = q = h = u = p = null;
                J.splice(0);
              },
            };
          return t;
        })(),
        Db = (function () {
          function a() {
            null === b &&
              ("undefined" !== typeof aa
                ? (b = aa)
                : "undefined" !== typeof C && (b = C));
          }
          var b = null;
          return {
            reset: function () {
              b = null;
            },
            Cj: function (d) {
              b !== d && (b && b.M(), (b = d));
            },
            zb: function () {
              return b.zb();
            },
            fc: function () {
              return b.fc();
            },
            hc: function (d) {
              return b.hc(d);
            },
            ke: function () {
              return b.ke();
            },
            M: function () {
              return b.M();
            },
            set: function (d) {
              a();
              return b.set(d);
            },
            Eb: function (d) {
              a();
              return b.Eb(d);
            },
            he: function (d) {
              a();
              return b.he(d);
            },
          };
        })(),
        ba = (function () {
          function a(A) {
            c.bindTexture(c.TEXTURE_2D, A);
          }
          function b(A) {
            var O = new Uint16Array(A.length);
            A.forEach(function (G, w) {
              n[0] = G;
              var I = y[0];
              var T = (I >> 16) & 32768;
              G = (I >> 12) & 2047;
              var U = (I >> 23) & 255;
              I =
                103 > U
                  ? T
                  : 142 < U
                  ? T | 31744 | ((255 == U ? 0 : 1) && I & 8388607)
                  : 113 > U
                  ? ((G |= 2048),
                    T | ((G >> (114 - U)) + ((G >> (113 - U)) & 1)))
                  : (T | ((U - 112) << 10) | (G >> 1)) + (G & 1);
              O[w] = I;
            });
            return O;
          }
          function d() {
            if (null !== Q.Bf) return Q.Bf;
            var A = f(b([0.5, 0.5, 0.5, 0.5]), !0);
            return null === A ? !0 : (Q.Bf = A);
          }
          function f(A, O) {
            if (!Db.zb() || !x) return null;
            var G = null,
              w = Math.sqrt(A.length / 4);
            try {
              var I = c.getError();
              if ("FUCKING_BIG_ERROR" === I) return !1;
              G = B.instance({ isFloat: !1, U: O, array: A, width: w });
              I = c.getError();
              if (I !== c.NO_ERROR) return !1;
            } catch (T) {
              return !1;
            }
            Fa.aa();
            c.viewport(0, 0, w, w);
            c.clearColor(0, 0, 0, 0);
            c.clear(c.COLOR_BUFFER_BIT);
            Db.set("s0");
            G.ya(0);
            X.l(!0, !0);
            A = 4 * w * w;
            O = new Uint8Array(A);
            c.readPixels(0, 0, w, w, c.RGBA, c.UNSIGNED_BYTE, O);
            w = !0;
            for (I = 0; I < A; ++I) w = w && 3 > Math.abs(O[I] - 127);
            G.remove();
            Fa.ba();
            return w;
          }
          var l = 0,
            p = null,
            u = 0,
            h = null,
            m = null,
            q = null,
            v = null,
            J = null,
            t = null,
            x = !1,
            z = [],
            k = {
              isFloat: !1,
              isPot: !0,
              isLinear: !1,
              isMipmap: !1,
              xi: !1,
              isAnisotropicFiltering: !1,
              isMirrorX: !1,
              isMirrorY: !1,
              isSrgb: !1,
              isKeepArray: !1,
              isFlipY: null,
              width: 0,
              height: 0,
              url: null,
              array: null,
              data: null,
              la: null,
              ji: null,
              Km: !1,
              U: !1,
              C: null,
              L: 4,
              Wf: 0,
            },
            g = !1,
            E = null,
            M = null,
            D = [
              [1, 0, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 1, 0],
              [0, 0, 0, 1],
            ],
            F = !1,
            e = !1,
            n = new Float32Array(1),
            y = new Int32Array(n.buffer),
            Q = { Bf: null, Cf: null },
            B = {
              m: function () {
                x ||
                  ((J = [c.RGBA, null, c.RGBA, c.RGBA]),
                  (t = [c.RGBA, null, c.RGBA, c.RGBA]),
                  (p = [
                    c.TEXTURE0,
                    c.TEXTURE1,
                    c.TEXTURE2,
                    c.TEXTURE3,
                    c.TEXTURE4,
                    c.TEXTURE5,
                    c.TEXTURE6,
                    c.TEXTURE7,
                  ]),
                  (F = "undefined" !== typeof ha),
                  (e = "undefined" !== typeof Ia),
                  (h = [-1, -1, -1, -1, -1, -1, -1, -1]),
                  (v = [c.UNSIGNED_BYTE, c.FLOAT, c.FLOAT]),
                  (x = !0));
              },
              po: function () {
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
              },
              so: function () {
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST);
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST);
              },
              Am: function () {
                if (!m) {
                  for (var A = new Float32Array(16384), O = 0; 16384 > O; ++O)
                    A[O] = 2 * Math.random() - 1;
                  m = {
                    random: B.instance({
                      isFloat: !0,
                      isPot: !0,
                      array: A,
                      width: 64,
                    }),
                    Sj: B.instance({
                      isFloat: !1,
                      isPot: !0,
                      width: 1,
                      array: new Uint8Array([0, 0, 0, 0]),
                    }),
                  };
                }
                B.Wo();
              },
              xj: function (A) {
                c.framebufferTexture2D(
                  Fa.rf(),
                  c.COLOR_ATTACHMENT0,
                  c.TEXTURE_2D,
                  A,
                  0
                );
              },
              ii: function () {
                return m.Sj;
              },
              Wo: function () {
                v[1] = Ia.qf(c);
              },
              uo: function () {
                t = J = [c.RGBA, c.RGBA, c.RGBA, c.RGBA];
              },
              fj: function (A) {
                aa.set("s1");
                Fa.aa();
                var O = A.P(),
                  G = A.$();
                c.viewport(0, 0, O, G);
                A.h(0);
                X.l(!1, !1);
              },
              Bq: function (A, O) {
                B.fj(A);
                c.readPixels(0, 0, A.P(), A.$(), c.RGBA, c.UNSIGNED_BYTE, O);
              },
              Cq: function (A, O) {
                B.fj(A);
                return Ia.pg(0, 0, A.P(), A.$(), O);
              },
              Th: function (A, O, G, w, I, T, U) {
                A.activeTexture(A.TEXTURE0);
                var da = A.createTexture();
                A.bindTexture(A.TEXTURE_2D, da);
                I = I instanceof Float32Array ? I : new Float32Array(I);
                A.texParameteri(
                  A.TEXTURE_2D,
                  A.TEXTURE_WRAP_S,
                  A.CLAMP_TO_EDGE
                );
                A.texParameteri(
                  A.TEXTURE_2D,
                  A.TEXTURE_WRAP_T,
                  A.CLAMP_TO_EDGE
                );
                A.texParameteri(A.TEXTURE_2D, A.TEXTURE_MAG_FILTER, A.NEAREST);
                A.texParameteri(A.TEXTURE_2D, A.TEXTURE_MIN_FILTER, A.NEAREST);
                A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, T);
                A.texImage2D(
                  A.TEXTURE_2D,
                  0,
                  A.RGBA,
                  G,
                  w,
                  0,
                  A.RGBA,
                  A.FLOAT,
                  I
                );
                A.bindTexture(A.TEXTURE_2D, null);
                A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, !1);
                U && (Fa.ba(), aa.Eb(A));
                A.viewport(0, 0, G, w);
                A.framebufferTexture2D(
                  A.FRAMEBUFFER,
                  A.COLOR_ATTACHMENT0,
                  A.TEXTURE_2D,
                  O,
                  0
                );
                A.bindTexture(A.TEXTURE_2D, da);
                U ? X.l(!0, !0) : X.Qb(A);
                A.deleteTexture(da);
                x && ((h[0] = -1), (q = null), (l = 0));
              },
              Ge: function (A) {
                A !== l && (c.activeTexture(p[A]), (l = A));
              },
              instance: function (A) {
                function O() {
                  qa =
                    void 0 !== N.la.videoWidth ? N.la.videoWidth : N.la.width;
                  oa =
                    void 0 !== N.la.videoHeight
                      ? N.la.videoHeight
                      : N.la.height;
                }
                function G(fa) {
                  var za = c.getError();
                  if ("FUCKING_BIG_ERROR" === za) return !1;
                  c.texImage2D(c.TEXTURE_2D, 0, wa, bb, db, fa);
                  za = c.getError();
                  za !== c.NO_ERROR &&
                    bb !== c.RGBA &&
                    ((bb = c.RGBA),
                    c.texImage2D(c.TEXTURE_2D, 0, wa, bb, db, fa));
                  return !0;
                }
                function w() {
                  if (!Y) {
                    a(ka);
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, Xa);
                    N.isPot
                      ? (c.texParameteri(
                          c.TEXTURE_2D,
                          c.TEXTURE_WRAP_S,
                          N.isMirrorX ? c.MIRRORED_REPEAT : c.REPEAT
                        ),
                        c.texParameteri(
                          c.TEXTURE_2D,
                          c.TEXTURE_WRAP_T,
                          N.isMirrorY ? c.MIRRORED_REPEAT : c.REPEAT
                        ))
                      : (c.texParameteri(
                          c.TEXTURE_2D,
                          c.TEXTURE_WRAP_S,
                          c.CLAMP_TO_EDGE
                        ),
                        c.texParameteri(
                          c.TEXTURE_2D,
                          c.TEXTURE_WRAP_T,
                          c.CLAMP_TO_EDGE
                        ));
                    N.isAnisotropicFiltering &&
                      "undefined" !== typeof W &&
                      c.texParameterf(
                        c.TEXTURE_2D,
                        ha.Wl().TEXTURE_MAX_ANISOTROPY_EXT,
                        W.sk
                      );
                    c.texParameteri(
                      c.TEXTURE_2D,
                      c.TEXTURE_MAG_FILTER,
                      N.isLinear ? c.LINEAR : c.NEAREST
                    );
                    var fa = N.isMipmap && !Da;
                    c.texParameteri(
                      c.TEXTURE_2D,
                      c.TEXTURE_MIN_FILTER,
                      N.xi
                        ? c.LINEAR_MIPMAP_LINEAR
                        : N.isLinear
                        ? fa
                          ? c.NEAREST_MIPMAP_LINEAR
                          : c.LINEAR
                        : fa
                        ? c.NEAREST_MIPMAP_NEAREST
                        : c.NEAREST
                    );
                    bb = J[N.L - 1];
                    wa = t[N.L - 1];
                    db = v[Pa];
                    Ia.na() &&
                      ((fa = Ia.Yl()),
                      bb === c.RGBA && db === c.FLOAT
                        ? N.isMipmap || N.isLinear
                          ? (wa = Jb.$l(c))
                          : Ia.ja()
                          ? fa && (wa = fa)
                          : (wa = c.RGBA16F || c.RGBA)
                        : bb === c.RGB &&
                          db === c.FLOAT &&
                          fa &&
                          ((wa = fa), (bb = c.RGBA)));
                    if (
                      (N.U && !N.isFloat) ||
                      (N.isFloat && N.isMipmap && Jb.Tm())
                    )
                      (wa = Ia.Zl()), (db = Ia.qf(c));
                    N.Wf && (Bb = N.Wf);
                    N.isSrgb && 4 === N.L && (bb = ha.sm());
                    if (N.la) G(N.la);
                    else if (N.url) G(la);
                    else if (ma) {
                      fa = ma;
                      try {
                        "FUCKING_BIG_ERROR" !== c.getError() &&
                          (c.texImage2D(
                            c.TEXTURE_2D,
                            0,
                            wa,
                            qa,
                            oa,
                            0,
                            bb,
                            db,
                            fa
                          ),
                          c.getError() !== c.NO_ERROR &&
                            (c.texImage2D(
                              c.TEXTURE_2D,
                              0,
                              wa,
                              qa,
                              oa,
                              0,
                              bb,
                              db,
                              null
                            ),
                            c.getError() !== c.NO_ERROR &&
                              c.texImage2D(
                                c.TEXTURE_2D,
                                0,
                                c.RGBA,
                                qa,
                                oa,
                                0,
                                c.RGBA,
                                c.UNSIGNED_BYTE,
                                null
                              )));
                      } catch (Qc) {
                        c.texImage2D(
                          c.TEXTURE_2D,
                          0,
                          wa,
                          qa,
                          oa,
                          0,
                          bb,
                          db,
                          null
                        );
                      }
                      N.isKeepArray || (ma = null);
                    } else
                      (fa = c.getError()),
                        "FUCKING_BIG_ERROR" !== fa &&
                          (c.texImage2D(
                            c.TEXTURE_2D,
                            0,
                            wa,
                            qa,
                            oa,
                            0,
                            bb,
                            db,
                            null
                          ),
                          (fa = c.getError()),
                          fa !== c.NO_ERROR &&
                            ((bb = c.RGBA),
                            N.U &&
                              db !== c.FLOAT &&
                              ((db = c.FLOAT),
                              c.texImage2D(
                                c.TEXTURE_2D,
                                0,
                                wa,
                                qa,
                                oa,
                                0,
                                bb,
                                db,
                                null
                              ))));
                    if (N.isMipmap)
                      if (!Da && Va) Va.Ec(), (nb = !0);
                      else if (Da) {
                        fa = Math.log2(Math.min(qa, oa));
                        rb = Array(1 + fa);
                        rb[0] = ka;
                        for (var za = 1; za <= fa; ++za) {
                          var jb = Math.pow(2, za),
                            Ma = qa / jb;
                          jb = oa / jb;
                          var Ib = c.createTexture();
                          a(Ib);
                          c.texParameteri(
                            c.TEXTURE_2D,
                            c.TEXTURE_MIN_FILTER,
                            c.NEAREST
                          );
                          c.texParameteri(
                            c.TEXTURE_2D,
                            c.TEXTURE_MAG_FILTER,
                            c.NEAREST
                          );
                          c.texImage2D(
                            c.TEXTURE_2D,
                            0,
                            wa,
                            Ma,
                            jb,
                            0,
                            bb,
                            db,
                            null
                          );
                          a(null);
                          rb[za] = Ib;
                        }
                        nb = !0;
                      }
                    a(null);
                    h[l] = -1;
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !1);
                    Ca = !0;
                    N.C && Va && (N.C(Va), (N.C = null));
                  }
                }
                function I() {
                  for (
                    var fa = qa * oa, za = 2 * fa, jb = 3 * fa, Ma = 0;
                    Ma < fa;
                    ++Ma
                  )
                    (ta[0][Ma] = Ta[Ma]),
                      (ta[1][Ma] = Ta[Ma + fa]),
                      (ta[2][Ma] = Ta[Ma + za]),
                      (ta[3][Ma] = Ta[Ma + jb]);
                }
                function T() {
                  var fa = qa * oa * 4;
                  Ya = [
                    new Uint8Array(fa),
                    new Uint8Array(fa),
                    new Uint8Array(fa),
                    new Uint8Array(fa),
                  ];
                  ta = [
                    new Float32Array(Ya[0].buffer),
                    new Float32Array(Ya[1].buffer),
                    new Float32Array(Ya[2].buffer),
                    new Float32Array(Ya[3].buffer),
                  ];
                  hb = new Uint8Array(4 * fa);
                  Ta = new Float32Array(hb.buffer);
                  ia = !0;
                }
                function U() {
                  da = new Uint8Array(qa * oa * 4);
                  rc = new Float32Array(da.buffer);
                  dc = !0;
                }
                var da,
                  N = Object.assign({}, k, A),
                  ra = u++;
                null === N.isFlipY && (N.isFlipY = N.url ? !0 : !1);
                N.data &&
                  ((N.array =
                    "string" === typeof N.data
                      ? Rb(N.data)
                      : N.isFloat
                      ? new Float32Array(N.data)
                      : new Uint8Array(N.data)),
                  (N.isFlipY = !1));
                var Pa = 0,
                  H = N.la ? !0 : !1,
                  r = null,
                  P = null,
                  ca = !1;
                N.U = N.U || N.isFloat;
                N.U && (Pa = 1);
                !N.Km && N.isFloat && e && !Ia.ja() && (N.isFloat = !1);
                N.isFloat && (Pa = 2);
                N.isAnisotropicFiltering &&
                  F &&
                  !ha.Rm() &&
                  (N.isAnisotropicFiltering = !1);
                var ka = N.ji || c.createTexture(),
                  la = null,
                  ma = !1,
                  qa = 0,
                  oa = 0,
                  Ca = !1,
                  Y = !1,
                  ia = !1,
                  ta = null,
                  Ya = null,
                  hb = null,
                  Ta = null,
                  wa = null,
                  bb = null,
                  db = null,
                  Xa = N.isFlipY,
                  Ga = (A = N.U && N.isMipmap) && Jb.$k(),
                  Da = A && !Ga ? !0 : !1,
                  rb = null,
                  Bb = -1,
                  $a = -1,
                  nb = !1,
                  dc = !1,
                  rc = (da = null);
                N.width && ((qa = N.width), (oa = N.height ? N.height : qa));
                var Va = {
                  get: function () {
                    return ka;
                  },
                  P: function () {
                    return qa;
                  },
                  $: function () {
                    return oa;
                  },
                  tm: function () {
                    return N.url;
                  },
                  Sm: function () {
                    return N.isFloat;
                  },
                  pq: function () {
                    return N.U;
                  },
                  Oq: function (fa) {
                    ka = fa;
                  },
                  rq: function () {
                    return N.isLinear;
                  },
                  Ec: function () {
                    c.generateMipmap(c.TEXTURE_2D);
                  },
                  Sk: function (fa, za) {
                    Da
                      ? (fa || (fa = Va.fi()),
                        B.Ge(za),
                        a(rb[fa]),
                        (h[za] = -1))
                      : Va.h(za);
                  },
                  fi: function () {
                    -1 === Bb && (Bb = Math.log2(qa));
                    return Bb;
                  },
                  zj: function (fa) {
                    c.TEXTURE_MAX_LEVEL &&
                      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAX_LEVEL, fa);
                  },
                  Pl: function (fa) {
                    fa || (fa = Va.fi());
                    if (Da) {
                      aa.set("s12");
                      B.Ge(0);
                      for (var za = qa, jb = oa, Ma = 1; Ma <= fa; ++Ma)
                        (za /= 2),
                          (jb /= 2),
                          aa.O("u15", 0.25 / za, 0.25 / jb),
                          c.viewport(0, 0, za, jb),
                          a(rb[Ma - 1]),
                          c.framebufferTexture2D(
                            Fa.rf(),
                            c.COLOR_ATTACHMENT0,
                            c.TEXTURE_2D,
                            rb[Ma],
                            0
                          ),
                          X.l(!1, 1 === Ma);
                      h[0] = -1;
                    } else fa !== $a && (($a = fa), Va.zj(fa)), Va.Ec();
                  },
                  Pq: function (fa) {
                    (H = !(
                      Array.isArray(fa) ||
                      fa.constructor === Float32Array ||
                      fa.constructor === Uint8Array
                    ))
                      ? ((ma = null), (N.la = fa), O())
                      : (ma = fa);
                  },
                  h: function (fa) {
                    if (!Ca) return !1;
                    B.Ge(fa);
                    if (h[fa] === ra) return !1;
                    a(ka);
                    h[fa] = ra;
                    return !0;
                  },
                  ya: function (fa) {
                    c.activeTexture(p[fa]);
                    l = fa;
                    a(ka);
                    h[fa] = ra;
                  },
                  u: function () {
                    q = Va;
                    B.xj(ka);
                  },
                  J: function () {
                    c.viewport(0, 0, qa, oa);
                    q = Va;
                    B.xj(ka);
                  },
                  te: B.te,
                  mo: function (fa, za) {
                    qa = fa;
                    oa = za;
                  },
                  resize: function (fa, za) {
                    Va.mo(fa, za);
                    w();
                  },
                  clone: function (fa) {
                    fa = B.instance({
                      width: qa,
                      height: oa,
                      U: N.U,
                      isFloat: N.isFloat,
                      isLinear: N.isLinear,
                      isMirrorY: N.isMirrorY,
                      isFlipY: fa ? !Xa : Xa,
                      isPot: N.isPot,
                    });
                    Db.set("s0");
                    Fa.ba();
                    fa.J();
                    Va.h(0);
                    X.l(!0, !0);
                    return fa;
                  },
                  Wc: function () {
                    c.viewport(0, 0, qa, oa);
                  },
                  remove: function () {
                    c.deleteTexture(ka);
                    Y = !0;
                    z.splice(z.indexOf(Va), 1);
                    Va = null;
                  },
                  refresh: function () {
                    Va.ya(0);
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !0);
                    H
                      ? c.texImage2D(c.TEXTURE_2D, 0, wa, bb, db, N.la)
                      : c.texImage2D(
                          c.TEXTURE_2D,
                          0,
                          wa,
                          qa,
                          oa,
                          0,
                          bb,
                          db,
                          ma
                        );
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !1);
                  },
                  dj: function () {
                    ia || T();
                    c.readPixels(0, 0, qa, 4 * oa, c.RGBA, c.UNSIGNED_BYTE, hb);
                    I();
                    return ta;
                  },
                  Hn: function () {
                    ia || T();
                    return Ia.pg(0, 0, qa, 4 * oa, hb).then(function () {
                      I();
                      return ta;
                    });
                  },
                  Jn: function () {
                    dc || U();
                    c.readPixels(0, 0, qa, oa, c.RGBA, c.UNSIGNED_BYTE, da);
                    return rc;
                  },
                  In: function () {
                    dc || U();
                    return Ia.pg(0, 0, qa, oa, da);
                  },
                  Fh: function (fa) {
                    Fa.aa();
                    aa.set("s15");
                    Va.h(0);
                    if (fa)
                      c.viewport(0, 0, qa, oa),
                        aa.zo("u16", 0.25, 0.25, 0.25, 0.25),
                        X.l(!1, !0);
                    else
                      for (fa = 0; 4 > fa; ++fa)
                        c.viewport(0, oa * fa, qa, oa),
                          aa.Ba("u16", D[fa]),
                          X.l(!1, 0 === fa);
                  },
                  Wg: function (fa) {
                    var za;
                    if ((za = db === v[0]))
                      null !== Q.Cf
                        ? (za = Q.Cf)
                        : ((za = f(new Uint8Array([127, 127, 127, 127]), !1)),
                          (za = null === za ? !0 : (Q.Cf = za))),
                        (za = !za);
                    a(ka);
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !0);
                    za
                      ? (ca ||
                          ((r = document.createElement("canvas")),
                          (r.width = qa),
                          (r.height = oa),
                          (P = r.getContext("2d")),
                          P.createImageData(qa, oa),
                          (ca = !0)),
                        null.data.set(fa),
                        P.putImageData(null, 0, 0),
                        c.texImage2D(c.TEXTURE_2D, 0, wa, bb, db, r))
                      : c.texImage2D(
                          c.TEXTURE_2D,
                          0,
                          wa,
                          qa,
                          oa,
                          0,
                          bb,
                          db,
                          fa
                        );
                    h[l] = ra;
                    Xa && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !1);
                  },
                  cr: function (fa, za) {
                    a(ka);
                    za && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !0);
                    c.texImage2D(c.TEXTURE_2D, 0, wa, bb, db, fa);
                    h[l] = ra;
                    za && c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, !1);
                  },
                  cc: function (fa, za) {
                    var jb = qa * oa,
                      Ma = 4 * jb;
                    fa = N.U ? (fa ? "RGBE" : "JSON") : "RGBA";
                    za && (fa = za);
                    za = Ia.na() && !1;
                    var Ib = null;
                    switch (fa) {
                      case "RGBE":
                        Ib = "s13";
                        break;
                      case "JSON":
                        Ib = za ? "s0" : "s15";
                        break;
                      case "RGBA":
                      case "RGBAARRAY":
                        Ib = "s7";
                    }
                    ia ||
                      ("RGBA" === fa || "RGBE" === fa || "RGBAARRAY" === fa
                        ? ((Ya = new Uint8Array(Ma)), (ia = !0))
                        : "JSON" !== fa || za || T());
                    Fa.aa();
                    aa.set(Ib);
                    Va.h(0);
                    Ma = null;
                    if ("RGBA" === fa || "RGBE" === fa || "RGBAARRAY" === fa) {
                      c.viewport(0, 0, qa, oa);
                      X.l(!0, !0);
                      c.readPixels(0, 0, qa, oa, c.RGBA, c.UNSIGNED_BYTE, Ya);
                      if ("RGBAARRAY" === fa) return { data: Ya };
                      g ||
                        ((E = document.createElement("canvas")),
                        (M = E.getContext("2d")),
                        (g = !0));
                      E.width = qa;
                      E.height = oa;
                      jb = M.createImageData(qa, oa);
                      jb.data.set(Ya);
                      M.putImageData(jb, 0, 0);
                      Ma = E.toDataURL("image/png");
                    } else if ("JSON" === fa)
                      if (za)
                        (Ma = new Float32Array(jb)),
                          c.viewport(0, 0, qa, oa),
                          X.l(!0, !0),
                          c.readPixels(0, 0, qa, oa, c.RGBA, c.FLOAT, Ma);
                      else {
                        for (Ma = 0; 4 > Ma; ++Ma)
                          c.viewport(0, oa * Ma, qa, oa),
                            aa.Ba("u16", D[Ma]),
                            X.l(!Ma, !Ma);
                        Va.dj();
                        Ma = Array(jb);
                        for (za = 0; za < jb; ++za)
                          (Ma[4 * za] = ta[0][za]),
                            (Ma[4 * za + 1] = ta[1][za]),
                            (Ma[4 * za + 2] = ta[2][za]),
                            (Ma[4 * za + 3] = ta[3][za]);
                      }
                    return {
                      format: fa,
                      data: Ma,
                      width: qa,
                      height: oa,
                      isMirrorY: N.isMirrorY,
                      isFlipY: "RGBA" === fa ? N.isFlipY : !N.isFlipY,
                    };
                  },
                };
                N.isMipmap && !Da && Ca && !nb && (Va.Ec(), (nb = !0));
                if (N.url)
                  a(ka),
                    c.texImage2D(
                      c.TEXTURE_2D,
                      0,
                      c.RGBA,
                      1,
                      1,
                      0,
                      c.RGBA,
                      c.UNSIGNED_BYTE,
                      null
                    ),
                    (la = new Image()),
                    (la.crossOrigin = "anonymous"),
                    (la.src = N.url),
                    (la.onload = function () {
                      qa = la.width;
                      oa = la.height;
                      w();
                    });
                else if (N.la) {
                  var sc = function () {
                    O();
                    qa ? w() : setTimeout(sc, 1);
                  };
                  sc();
                } else
                  N.array
                    ? (N.U && !N.isFloat
                        ? N.array instanceof Uint16Array
                          ? ((ma = N.array), w())
                          : d()
                          ? ((ma = b(N.array)), w())
                          : (w(), B.Th(c, ka, Va.P(), Va.$(), N.array, Xa, !0))
                        : ((ma = N.isFloat
                            ? N.array instanceof Float32Array
                              ? N.array
                              : new Float32Array(N.array)
                            : N.array instanceof Uint8Array
                            ? N.array
                            : new Uint8Array(N.array)),
                          w()),
                      N.isKeepArray ||
                        (ma && ma !== N.array && (ma = null), delete N.array))
                    : N.ji
                    ? (Ca = !0)
                    : w();
                Va.fq = Va.P;
                N.C && Ca && (N.C(Va), (N.C = null));
                z.push(Va);
                return Va;
              },
              aa: function (A) {
                A !== l && (c.activeTexture(p[A]), (l = A));
                h[A] = -1;
                a(null);
              },
              Uk: function (A) {
                m.random.h(A);
              },
              te: function () {
                q = null;
                c.framebufferTexture2D(
                  Fa.rf(),
                  c.COLOR_ATTACHMENT0,
                  c.TEXTURE_2D,
                  null,
                  0
                );
              },
              reset: function () {
                0 !== l && c.activeTexture(p[0]);
                for (var A = 0; A < p.length; ++A) h[A] = -1;
                l = -1;
              },
              Fq: function () {
                l = -1;
              },
              Uj: function () {
                for (var A = 0; A < p.length; ++A) B.aa(A);
              },
              I: function () {
                m && (m.random.remove(), m.Sj.remove());
              },
              Zc: function (A, O) {
                if ("RGBA" === A.format || "RGBE" === A.format) {
                  var G = new Image();
                  G.src = A.data;
                  G.onload = function () {
                    B.instance({
                      isMirrorY: A.isMirrorY,
                      isFlipY: A.isFlipY,
                      isFloat: !1,
                      la: G,
                      C: function (w) {
                        if ("RGBA" === A.format) O(w);
                        else {
                          var I = A.width,
                            T = A.height,
                            U = B.instance({
                              isMirrorY: A.isMirrorY,
                              isFloat: !0,
                              width: I,
                              height: T,
                              isFlipY: A.isFlipY,
                            });
                          Fa.ba();
                          c.viewport(0, 0, I, T);
                          aa.set("s14");
                          U.u();
                          w.h(0);
                          X.l(!0, !0);
                          B.aa(0);
                          O(U);
                          Ia.flush();
                          w.remove();
                        }
                      },
                    });
                  };
                } else
                  "JSON" === A.format
                    ? O(
                        B.instance({
                          isFloat: !0,
                          isFlipY: A.isFlipY,
                          width: A.width,
                          height: A.height,
                          array: new Float32Array(A.data),
                        })
                      )
                    : O(!1);
              },
              fl: b,
              A: function () {
                q && (Fa.ba(), B.te(), Fa.aa());
                B.Uj();
                z.slice(0).forEach(function (A) {
                  A.remove();
                });
                z.splice(0);
                x = !1;
                u = 0;
                "undefined" !== typeof Jb && Jb.A();
                m = null;
              },
            };
          return B;
        })(),
        Pc = {
          instance: function (a) {
            var b = [ba.instance(a), ba.instance(a)],
              d = [b[1], b[0]],
              f = d,
              l = {
                sj: function (p) {
                  f[1].u();
                  f[0].h(p);
                  l.Gj();
                },
                tj: function (p) {
                  f[1].J();
                  f[0].h(p);
                  l.Gj();
                },
                Gj: function () {
                  f = f === b ? d : b;
                },
                refresh: function () {
                  f[0].refresh();
                  f[1].refresh();
                },
                h: function (p) {
                  f[0].h(p);
                },
                ya: function (p) {
                  f[0].ya(p);
                },
                Tk: function (p) {
                  f[1].h(p);
                },
                bi: function () {
                  return f[0];
                },
                cq: function () {
                  return f[1];
                },
                Wg: function (p) {
                  f[0].Wg(p);
                  f[1].Wg(p);
                },
                remove: function () {
                  f[0].remove();
                  f[1].remove();
                  f = null;
                },
                sync: function () {
                  l.tj(0);
                  aa.set("s0");
                  X.l(!1, !1);
                },
              };
            return l;
          },
        },
        X = (function () {
          function a(m) {
            var q = { ka: null, indices: null };
            q.ka = m.createBuffer();
            m.bindBuffer(m.ARRAY_BUFFER, q.ka);
            m.bufferData(
              m.ARRAY_BUFFER,
              new Float32Array([-1, -1, 3, -1, -1, 3]),
              m.STATIC_DRAW
            );
            q.indices = m.createBuffer();
            m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, q.indices);
            m.bufferData(
              m.ELEMENT_ARRAY_BUFFER,
              new Uint16Array([0, 1, 2]),
              m.STATIC_DRAW
            );
            return q;
          }
          var b = null,
            d = 0,
            f = !1,
            l = [],
            p = -2,
            u = -2,
            h = {
              reset: function () {
                u = p = -2;
              },
              m: function () {
                f || ((b = a(c)), h.kd(), (f = !0));
              },
              instance: function (m) {
                var q = d++,
                  v = m.indices ? m.indices.length : 0,
                  J = "undefined" === typeof m.mode ? c.STATIC_DRAW : m.mode,
                  t = c.createBuffer();
                c.bindBuffer(c.ARRAY_BUFFER, t);
                c.bufferData(
                  c.ARRAY_BUFFER,
                  m.ka instanceof Float32Array ? m.ka : new Float32Array(m.ka),
                  J
                );
                p = q;
                var x = null,
                  z = null,
                  k = null;
                if (m.indices) {
                  x = c.createBuffer();
                  c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, x);
                  var g = null;
                  65536 > m.indices.length
                    ? ((g = Uint16Array), (z = c.UNSIGNED_SHORT), (k = 2))
                    : ((g = Uint32Array), (z = c.UNSIGNED_INT), (k = 4));
                  g = m.indices instanceof g ? m.indices : new g(m.indices);
                  c.bufferData(c.ELEMENT_ARRAY_BUFFER, g, J);
                  u = q;
                }
                var E = {
                  yc: function (M) {
                    p !== q && (c.bindBuffer(c.ARRAY_BUFFER, t), (p = q));
                    M && Db.ke();
                  },
                  Qk: function () {
                    u !== q &&
                      (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, x), (u = q));
                  },
                  bind: function (M) {
                    E.yc(M);
                    E.Qk();
                  },
                  W: function () {
                    c.drawElements(c.TRIANGLES, v, z, 0);
                  },
                  Na: function (M, D) {
                    c.drawElements(c.TRIANGLES, M, z, D * k);
                  },
                  remove: function () {
                    c.deleteBuffer(t);
                    m.indices && c.deleteBuffer(x);
                    E = null;
                  },
                };
                l.push(E);
                return E;
              },
              kd: function () {
                -1 !== p && (c.bindBuffer(c.ARRAY_BUFFER, b.ka), (p = -1));
                -1 !== u &&
                  (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, b.indices), (u = -1));
              },
              l: function (m, q) {
                m && X.kd();
                q && Db.fc();
                c.drawElements(c.TRIANGLES, 3, c.UNSIGNED_SHORT, 0);
              },
              Qb: function (m) {
                m = m || c;
                var q = a(m);
                m.bindBuffer(m.ARRAY_BUFFER, q.ka);
                m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, q.indices);
                Db.hc(m);
                m.clear(m.COLOR_BUFFER_BIT);
                m.drawElements(m.TRIANGLES, 3, m.UNSIGNED_SHORT, 0);
                m.flush();
                m.bindBuffer(m.ARRAY_BUFFER, null);
                m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, null);
                m.deleteBuffer(q.ka);
                m.deleteBuffer(q.indices);
                h.reset();
                f && (h.kd(), Db.fc());
              },
              I: function () {
                var m = c,
                  q = b;
                m.deleteBuffer(q.ka);
                m.deleteBuffer(q.indices);
              },
              A: function () {
                h.I();
                l.forEach(function (m) {
                  m.remove();
                });
                c.bindBuffer(c.ARRAY_BUFFER, null);
                c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null);
                h.reset();
                f = !1;
                l.splice(0);
                d = 0;
              },
            };
          return h;
        })(),
        Fa = (function () {
          var a = null,
            b = null,
            d = null,
            f = !1,
            l = [],
            p = { ma: -2, Sh: 1 },
            u = {
              zb: function () {
                return f;
              },
              m: function () {
                if (!f) {
                  a = c.createFramebuffer();
                  var h = Ia.na();
                  b =
                    h && c.DRAW_FRAMEBUFFER
                      ? c.DRAW_FRAMEBUFFER
                      : c.FRAMEBUFFER;
                  d =
                    h && c.READ_FRAMEBUFFER
                      ? c.READ_FRAMEBUFFER
                      : c.FRAMEBUFFER;
                  f = !0;
                }
              },
              Xl: function () {
                return b;
              },
              $h: function () {
                return d;
              },
              rf: function () {
                return c.FRAMEBUFFER;
              },
              eq: function () {
                return p;
              },
              Up: function () {
                return a;
              },
              instance: function (h) {
                void 0 === h.Hc && (h.Hc = !1);
                var m = h.V ? h.V : null,
                  q = h.width,
                  v = void 0 !== h.height ? h.height : h.width,
                  J = a,
                  t = null,
                  x = !1,
                  z = !1,
                  k = 0;
                m && ((q = q ? q : m.P()), (v = v ? v : m.$()));
                var g = {
                  mj: function () {
                    x || ((J = c.createFramebuffer()), (x = !0), (k = p.Sh++));
                  },
                  ed: function () {
                    g.mj();
                    g.u();
                    t = c.createRenderbuffer();
                    c.bindRenderbuffer(c.RENDERBUFFER, t);
                    c.renderbufferStorage(
                      c.RENDERBUFFER,
                      c.DEPTH_COMPONENT16,
                      q,
                      v
                    );
                    c.framebufferRenderbuffer(
                      b,
                      c.DEPTH_ATTACHMENT,
                      c.RENDERBUFFER,
                      t
                    );
                    c.clearDepth(1);
                  },
                  bind: function (E, M) {
                    k !== p.ma && (c.bindFramebuffer(b, J), (p.ma = k));
                    m && m.u();
                    M && c.viewport(0, 0, q, v);
                    E && c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
                  },
                  mh: function () {
                    k !== p.ma && (c.bindFramebuffer(b, J), (p.ma = k));
                  },
                  clear: function () {
                    c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
                  },
                  Re: function () {
                    c.clear(c.COLOR_BUFFER_BIT);
                  },
                  th: function () {
                    c.clear(c.DEPTH_BUFFER_BIT);
                  },
                  Wc: function () {
                    c.viewport(0, 0, q, v);
                  },
                  u: function () {
                    k !== p.ma && (c.bindFramebuffer(b, J), (p.ma = k));
                  },
                  rtt: function (E) {
                    m = E;
                    p.ma !== k &&
                      (c.bindFramebuffer(c.FRAMEBUFFER, J), (p.ma = k));
                    E.u();
                  },
                  aa: function () {
                    c.bindFramebuffer(b, null);
                    p.ma = -1;
                  },
                  resize: function (E, M) {
                    q = E;
                    v = M;
                    t &&
                      (c.bindRenderbuffer(c.RENDERBUFFER, t),
                      c.renderbufferStorage(
                        c.RENDERBUFFER,
                        c.DEPTH_COMPONENT16,
                        q,
                        v
                      ));
                  },
                  remove: function () {
                    J === a ||
                      z ||
                      (c.bindFramebuffer(b, J),
                      c.framebufferTexture2D(
                        b,
                        c.COLOR_ATTACHMENT0,
                        c.TEXTURE_2D,
                        null,
                        0
                      ),
                      t &&
                        c.framebufferRenderbuffer(
                          b,
                          c.DEPTH_ATTACHMENT,
                          c.RENDERBUFFER,
                          null
                        ),
                      c.bindFramebuffer(b, null),
                      (p.ma = -1),
                      c.deleteFramebuffer(J),
                      t && c.deleteRenderbuffer(t));
                    z = !0;
                  },
                };
                h.Hc && g.ed();
                l.push(g);
                return g;
              },
              aa: function () {
                c.bindFramebuffer(b, null);
                p.ma = -1;
              },
              ar: function () {
                c.bindFramebuffer(b, null);
                c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
                Ia.Dj();
                p.ma = -1;
              },
              reset: function () {
                p.ma = -2;
              },
              ba: function () {
                0 !== p.ma && (c.bindFramebuffer(b, a), (p.ma = 0));
              },
              clear: function () {
                Ia.Dj();
                c.clear(c.COLOR_BUFFER_BIT);
              },
              A: function () {
                u.aa();
                l.forEach(function (h) {
                  h.remove();
                });
                null !== a && (c.deleteFramebuffer(a), (a = null));
                u.reset();
                f = !1;
                l.splice(0);
                p.Sh = 1;
              },
            };
          return u;
        })(),
        Ia = (function () {
          function a() {
            h = "undefined" === typeof ob ? ha : ob;
            m = !0;
          }
          function b(e, n, y) {
            for (var Q = 0; Q < n.length; ++Q) {
              var B = y.getExtension(n[Q] + "_" + e);
              if (B) return B;
            }
            return null;
          }
          function d() {
            null !== g.se && (clearTimeout(g.se), (g.se = null));
            g.Ub = !1;
          }
          function f(e) {
            if (0 === g.wb.length) {
              g.Da = c.PIXEL_PACK_BUFFER;
              g.wb.splice(0);
              g.Ed.splice(0);
              for (var n = 0; n < g.Bc; ++n)
                g.wb.push(c.createBuffer()), g.Ed.push(-1);
              g.Va = 0;
              g.dg = 0;
            }
            c.bindBuffer(g.Da, g.wb[g.Va]);
            e.byteLength !== g.Ed[g.Va] &&
              (c.bufferData(g.Da, e.byteLength, c.STREAM_READ),
              (g.Ed[g.Va] = e.byteLength));
            g.kq = !0;
          }
          function l() {
            c.bindBuffer(g.Da, null);
          }
          function p() {
            g.Sb.forEach(function (e) {
              c.deleteSync(e);
            });
            g.Sb.splice(0);
          }
          function u() {
            g.Va = (g.Va + 1) % g.Bc;
            ++g.dg;
          }
          var h = null,
            m = !1,
            q = {
              ti: !1,
              Og: null,
              Pg: null,
              Ai: !1,
              Pm: !1,
              Qg: null,
              Bi: !1,
              Rg: null,
              ui: !1,
              Se: null,
              Gm: !1,
              Te: null,
              Hm: !1,
            },
            v = null,
            J = { Xa: !0, Za: !0, hf: !0, cj: !1 },
            t = null,
            x = !0,
            z = null,
            k = null,
            g = {
              gl: 1,
              Bc: -1,
              Va: 0,
              dg: 0,
              Ub: !1,
              wb: [],
              Sb: [],
              Ed: [],
              Da: null,
              se: null,
            },
            E = "EXT WEBGL OES MOZ_OES WEBKIT_OES KHR".split(" "),
            M = ["OES", "MOZ_OES", "WEBKIT_OES"],
            D = "undefined" === typeof window ? {} : window,
            F = {
              m: function () {
                if (m) return !0;
                F.reset();
                m || a();
                var e = c;
                if (!v.ti) {
                  v.Og = F.Ph(e);
                  D.GL_EXT_FLOAT = v.Og;
                  v.Ai = v.Og ? !0 : !1;
                  if (v.Ai || F.na())
                    (v.Pg = F.Qh(e)),
                      (v.Pm = v.Pg ? !0 : !1),
                      (D.GL_EXT_FLOATLINEAR = v.Pg);
                  v.ti = !0;
                }
                if (!v.ui) {
                  v.Qg = F.wd(e);
                  v.Qg && ((v.Bi = !0), (D.GL_EXT_HALFFLOAT = v.Qg));
                  if (v.Bi || F.na())
                    (v.Rg = F.Rh(e)), (D.GL_EXT_HALFFLOATLINEAR = v.Rg);
                  v.nq = v.Rg ? !0 : !1;
                  v.ui = !0;
                }
                v.Se = F.Nh(e);
                v.Gm = v.Se ? !0 : !1;
                D.GL_EXT_COLORBUFFERFLOAT = v.Se;
                v.Te = F.Oh(e);
                v.Hm = v.Te ? !0 : !1;
                D.GL_EXT_COLORBUFFERHALFFLOAT = v.Te;
                Fa.m();
                ba.m();
                if (!F.ql()) return !1;
                X.m();
                ba.Am();
                return !0;
              },
              reset: function () {
                v = Object.assign({}, q);
                t = Object.assign({}, J);
              },
              P: function () {
                m || a();
                return h.P();
              },
              $: function () {
                m || a();
                return h.$();
              },
              na: function () {
                m || a();
                return h.na();
              },
              Mh: function (e) {
                F.Nh(e);
                F.Oh(e);
                F.Ph(e);
                F.Qh(e);
                F.wd(e);
                F.Rh(e);
              },
              Nh: b.bind(null, "color_buffer_float", E),
              Oh: b.bind(null, "color_buffer_half_float", E),
              Ph: b.bind(null, "texture_float", M),
              Qh: b.bind(null, "texture_float_linear", M),
              wd: b.bind(null, "texture_half_float", M),
              Rh: b.bind(null, "texture_half_float_linear", M),
              qf: function (e) {
                var n = F.wd(e);
                return n && n.HALF_FLOAT_OES
                  ? n.HALF_FLOAT_OES
                  : e.HALF_FLOAT || e.FLOAT;
              },
              Yl: function () {
                return k || c.RGBA32F || c.RGBA;
              },
              Zl: function () {
                return z || c.RGBA16F || c.RGBA;
              },
              Sl: function () {
                return t;
              },
              ja: function () {
                return t.Xa;
              },
              Ep: function () {
                return t.Za;
              },
              Zk: function () {
                return t.hf;
              },
              bl: function () {
                return t.cj && x;
              },
              Rj: function (e) {
                x = e;
                !e && g.Ub && (p(), c.bindBuffer(g.Da, null), (g.Ub = !1));
              },
              sq: function () {
                return g.Ub;
              },
              qe: function (e, n, y) {
                function Q() {
                  e.bindTexture(e.TEXTURE_2D, null);
                  e.bindFramebuffer(B, null);
                  e.deleteTexture(G);
                  e.deleteFramebuffer(O);
                }
                var B = e.FRAMEBUFFER,
                  A = e.NEAREST,
                  O = e.createFramebuffer();
                e.bindFramebuffer(B, O);
                var G = e.createTexture();
                e.activeTexture(e.TEXTURE0);
                e.bindTexture(e.TEXTURE_2D, G);
                e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1);
                e.texParameteri(
                  e.TEXTURE_2D,
                  e.TEXTURE_WRAP_S,
                  e.CLAMP_TO_EDGE
                );
                e.texParameteri(
                  e.TEXTURE_2D,
                  e.TEXTURE_WRAP_T,
                  e.CLAMP_TO_EDGE
                );
                e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, A);
                e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, A);
                e.texImage2D(e.TEXTURE_2D, 0, n, 3, 3, 0, e.RGBA, y, null);
                e.framebufferTexture2D(
                  e.FRAMEBUFFER,
                  e.COLOR_ATTACHMENT0,
                  e.TEXTURE_2D,
                  G,
                  0
                );
                if (
                  e.checkFramebufferStatus(
                    e.READ_FRAMEBUFFER || e.FRAMEBUFFER
                  ) !== e.FRAMEBUFFER_COMPLETE
                )
                  return Q(), !1;
                Db.he(e);
                e.clearColor(0, 0, 0, 0);
                e.viewport(0, 0, 3, 3);
                e.disable(e.DEPTH_TEST);
                e.clear(e.COLOR_BUFFER_BIT);
                X.Qb(e);
                e.bindFramebuffer(B, null);
                Db.Eb(e);
                e.activeTexture(e.TEXTURE0);
                e.bindTexture(e.TEXTURE_2D, G);
                X.Qb(e);
                n = new Uint8Array(36);
                e.readPixels(0, 0, 3, 3, e.RGBA, e.UNSIGNED_BYTE, n);
                Q();
                for (y = 0; 36 > y; ++y)
                  if (3 !== y % 4 && 3 < Math.abs(n[y] - 127)) return !1;
                return !0;
              },
              $e: function (e) {
                var n = { Xa: !1, Za: !1 };
                e.disable(e.BLEND);
                e.clearColor(0, 0, 0, 0);
                e.clear(e.COLOR_BUFFER_BIT);
                e.RGBA32F &&
                  F.qe(e, e.RGBA32F, e.FLOAT) &&
                  ((n.Xa = !0), (k = e.RGBA32F));
                !n.Xa &&
                  F.qe(e, e.RGBA, e.FLOAT) &&
                  ((n.Xa = !0), (k = e.RGBA));
                var y = F.qf(e);
                z = null;
                e.RGBA16F &&
                  F.qe(e, e.RGBA16F, y) &&
                  ((n.Za = !0), (z = e.RGBA16F));
                !n.Za && F.qe(e, e.RGBA, y) && ((n.Za = !0), (z = e.RGBA));
                return n;
              },
              sl: function () {
                var e = Fa.instance({ width: 2 });
                e.mj();
                var n = ba.instance({ width: 2, isFloat: !0, L: 3 });
                e.u();
                n.u();
                F.flush();
                c.checkFramebufferStatus(Fa.$h()) !== c.FRAMEBUFFER_COMPLETE
                  ? (ba.uo(), (t.hf = !1))
                  : (t.hf = !0);
                e.remove();
                n.remove();
              },
              tl: function () {
                var e = !1;
                F.na() &&
                  (e =
                    "PIXEL_PACK_BUFFER STREAM_READ SYNC_GPU_COMMANDS_COMPLETE WAIT_FAILED fenceSync deleteSync createBuffer"
                      .split(" ")
                      .every(function (n) {
                        return "undefined" !== typeof c[n];
                      }));
                t.cj = e;
              },
              ql: function () {
                var e = F.$e(c);
                Object.assign(t, e);
                if (!t.Xa && !t.Za) return !1;
                F.sl();
                F.tl();
                return !0;
              },
              Kn: function (e, n, y, Q, B) {
                c.readPixels(e, n, y, Q, c.RGBA, c.UNSIGNED_BYTE, B);
                return Promise.resolve(B, !1);
              },
              pg: function (e, n, y, Q, B, A, O) {
                if (!F.bl()) return F.Kn(e, n, y, Q, B);
                g.Bc = O || g.gl;
                f(B);
                c.readPixels(e, n, y, Q, c.RGBA, c.UNSIGNED_BYTE, 0);
                g.Sb[g.Va] = c.fenceSync(c.SYNC_GPU_COMMANDS_COMPLETE, 0);
                F.flush();
                var G = !1;
                return new Promise(function (w, I) {
                  function T() {
                    if (!g.Ub) return d(), l(), u(), I(), !1;
                    var U = (g.Va + 1) % g.Bc;
                    switch (c.clientWaitSync(g.Sb[U], 0, 0)) {
                      case c.TIMEOUT_EXPIRED:
                      case c.WAIT_FAILED:
                        break;
                      default:
                        return (
                          d(),
                          c.deleteSync(g.Sb[U]),
                          (g.Sb[U] = null),
                          c.bindBuffer(g.Da, g.wb[U]),
                          c.getBufferSubData(g.Da, 0, B),
                          l(),
                          u(),
                          w(B, G),
                          !0
                        );
                    }
                    g.se = setTimeout(T, 0);
                    return !1;
                  }
                  d();
                  g.dg + 1 < g.Bc
                    ? (l(), u(), w(B, !1))
                    : ((g.Ub = !0), T() || !A || G || ((G = !0), A()));
                });
              },
              Dj: function () {
                c.viewport(0, 0, F.P(), F.$());
              },
              flush: function () {
                c.flush();
              },
              A: function () {
                d();
                p();
                ba.A();
                Fa.A();
                X.A();
                g.wb.forEach(function (e) {
                  c.deleteBuffer(e);
                });
                g.wb.splice(0);
                Db.reset();
                m = !1;
              },
            };
          return F;
        })(),
        Jb = (function () {
          function a(e, n, y, Q) {
            g.texParameteri(
              g.TEXTURE_2D,
              g.TEXTURE_MIN_FILTER,
              Q ? g.NEAREST_MIPMAP_NEAREST : g.LINEAR
            );
            var B = null;
            if (null !== y)
              try {
                B = g.getError();
                if ("FUCKING_BIG_ERROR" === B) return !1;
                g.texImage2D(g.TEXTURE_2D, 0, e, 4, 4, 0, g.RGBA, n, y);
                B = g.getError();
                if (B !== g.NO_ERROR) return !1;
              } catch (A) {
                return !1;
              }
            Q && g.generateMipmap(g.TEXTURE_2D);
            g.clear(g.COLOR_BUFFER_BIT);
            X.Qb(g);
            B = g.getError();
            if ("FUCKING_BIG_ERROR" === B) return !1;
            g.readPixels(0, 0, 2, 2, g.RGBA, g.UNSIGNED_BYTE, v);
            B = g.getError();
            B === g.INVALID_OPERATION &&
              "undefined" !== typeof g.PIXEL_PACK_BUFFER &&
              (g.bindBuffer(g.PIXEL_PACK_BUFFER, null),
              g.readPixels(0, 0, 2, 2, g.RGBA, g.UNSIGNED_BYTE, v),
              (B = g.getError()));
            if (B !== g.NO_ERROR) return !1;
            y = !0;
            for (Q = 0; 16 > Q; ++Q) y = y && 4 > Math.abs(v[Q] - 127);
            y && ((m.Zi = n), (m.si = e));
            return y;
          }
          function b(e, n) {
            return E.Xa && a(e, g.FLOAT, new Float32Array(J), n)
              ? ((h = u.hh), !0)
              : !1;
          }
          function d(e, n, y) {
            if (!E.Za) return !1;
            var Q = ba.fl(J),
              B = Ia.wd(g);
            if (
              (B && B.HALF_FLOAT_OES && a(e, B.HALF_FLOAT_OES, Q, n)) ||
              (g.HALF_FLOAT && a(e, g.HALF_FLOAT, Q, n))
            )
              return (h = u.tc), !0;
            Q = new Float32Array(J);
            if (a(e, g.FLOAT, Q, n)) return (h = u.tc), !0;
            g.bindTexture(g.TEXTURE_2D, y);
            g.texImage2D(
              g.TEXTURE_2D,
              0,
              g.RGBA,
              2,
              2,
              0,
              g.RGBA,
              g.UNSIGNED_BYTE,
              null
            );
            g.bindFramebuffer(m.rd, F);
            ba.Th(g, y, 2, 2, Q, !1, !1);
            g.bindFramebuffer(m.rd, null);
            g.bindTexture(g.TEXTURE_2D, y);
            return a(e, null, null, n) ? ((h = u.tc), !0) : !1;
          }
          function f(e, n, y) {
            q = !0;
            if (d(e, !0, y) || b(n, !0)) return !0;
            q = !1;
            return d(e, !1, y) || b(n, !1) ? !0 : !1;
          }
          function l(e) {
            if (h === u.M) {
              g = e || c;
              h = u.RGBA8;
              q = !0;
              Ia.Mh(g);
              E || (E = Ia.$e(g));
              Fa.reset();
              F = g.createFramebuffer();
              m.rd = g.DRAW_FRAMEBUFFER || g.FRAMEBUFFER;
              g.bindFramebuffer(m.rd, null);
              g.clearColor(0, 0, 0, 0);
              g.viewport(0, 0, 2, 2);
              aa.M();
              M = aa.Eb(g);
              e = g.createTexture();
              g.activeTexture(g.TEXTURE0);
              g.bindTexture(g.TEXTURE_2D, e);
              g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.REPEAT);
              g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.REPEAT);
              g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
              D = e;
              var n = (e = g.RGBA),
                y = g.RGBA16F,
                Q = g.RGBA32F;
              Q && (e = Q);
              y && (n = y);
              if ((y || Q) && f(n, e, D)) return p(), !0;
              e = n = g.RGBA;
              if (f(n, e, D)) return p(), !0;
              h = u.RGBA8;
              p();
              return !1;
            }
          }
          function p() {
            g.deleteProgram(M.qa);
            g.deleteTexture(D);
            D = M = null;
          }
          for (
            var u = { M: -1, hh: 3, tc: 2, RGBA8: 0 },
              h = u.M,
              m = { Zi: null, si: null, rd: null },
              q = !0,
              v = new Uint8Array(16),
              J = Array(64),
              t = 0;
            4 > t;
            ++t
          )
            for (var x = 0; 4 > x; ++x) {
              var z = 0 === (x + t) % 2 ? 1 : 0,
                k = 4 * t + x;
              J[4 * k] = z;
              J[4 * k + 1] = z;
              J[4 * k + 2] = z;
              J[4 * k + 3] = z;
            }
          var g = null,
            E = null,
            M = null,
            D = null,
            F = null;
          return {
            $k: function (e) {
              l(e);
              return q;
            },
            rh: function (e, n) {
              h === u.M && (typeof ("undefined" !== n) && (E = n), l(e));
              return h !== u.RGBA8;
            },
            oq: function (e) {
              l(e);
              return h === u.hh;
            },
            Tm: function (e) {
              l(e);
              return h === u.tc;
            },
            $p: function (e) {
              l(e);
              return m.Zi;
            },
            $l: function (e) {
              l(e);
              return m.si;
            },
            A: function () {
              g = null;
              q = !0;
              h = u.M;
              E = null;
            },
          };
        })(),
        Gd = {
          instance: function (a) {
            function b() {
              v && v.remove();
              v = ba.instance({
                isFloat: !1,
                isPot: !1,
                width: d.size * d.za[0],
                height: d.size * d.za[1],
              });
            }
            var d = Object.assign(
                {
                  mask: null,
                  size: -1,
                  preprocessing: "none",
                  preprocessingSize: a.size,
                  customInputShader: null,
                  nBlurPass: 1,
                  varianceMin: 0.1,
                  blurKernelSizePx: 5,
                  gain: 1,
                  overlap: 0,
                  isNormalized: !1,
                  tilt: -1,
                  za: [1, 1],
                },
                a
              ),
              f = null,
              l = !1,
              p = !1,
              u = null,
              h = !1;
            a = !1;
            var m = null;
            d.mask &&
              ((l = !0),
              "undefined" !== typeof K &&
                K &&
                void 0 !== K.ea &&
                (d.mask = K.ea + d.mask),
              (f = ba.instance({ isFloat: !1, url: d.mask })));
            var q = null;
            d.customInputShader &&
              ((q = "s50"),
              aa.oa({
                name: "_",
                id: q,
                g: d.customInputShader,
                br: ["uSource"],
                precision: "lowp",
              }),
              aa.j(q, [{ type: "1i", name: "_", value: 0 }]));
            switch (d.preprocessing) {
              case "sobel":
                m = "s39";
                h = !0;
                break;
              case "meanNormalization":
                m = "s40";
                h = !0;
                break;
              case "grayScale":
                m = "s36";
                h = !1;
                break;
              case "grayScaleTilt":
                m = "s37";
                a = !0;
                h = !1;
                break;
              case "rgbGrayTilt":
                m = "s38";
                a = !0;
                h = !1;
                break;
              case "copy":
                m = q ? q : "s0";
                break;
              case "inputLightRegulation":
                m = q ? q : "s36";
                u = Yd.instance({
                  ri: d.preprocessingSize,
                  Ti: d.size,
                  Oi: d.nBlurPass,
                  Ea: !1,
                });
                p = !0;
                break;
              case "inputMix0":
                m = "none";
                u = Zd.instance({
                  da: d.preprocessingSize,
                  jb: d.varianceMin,
                  Ua: d.blurKernelSizePx,
                  gain: d.gain || 1,
                  Ea: !1,
                });
                p = !0;
                break;
              case "inputMix1":
                m = "none";
                u = $d.instance({
                  da: d.preprocessingSize,
                  jb: d.varianceMin,
                  Ua: d.blurKernelSizePx,
                  gain: d.gain || 1,
                  Ea: !1,
                });
                p = !0;
                break;
              case "inputCut4":
                m = "none";
                u = ae.instance({
                  da: d.preprocessingSize,
                  jb: d.varianceMin,
                  Ua: d.blurKernelSizePx,
                  gain: d.gain || 1,
                  Jc: d.isNormalized || !1,
                  jg: d.overlap || 0,
                  Ea: !1,
                });
                d.preprocessingSize *= u.am();
                p = !0;
                break;
              case "direct":
              case "none":
              case "abort":
                m = "abort";
                break;
              default:
                m = "s4";
            }
            d.preprocessingSize = Math.ceil(d.preprocessingSize);
            a && aa.j(m, [{ name: "u30", type: "1f", value: d.tilt }]);
            l && (m += "Mask");
            var v = null;
            b();
            var J = {
              P: function () {
                return d.size;
              },
              bm: function () {
                return d.preprocessingSize;
              },
              sf: function () {
                return J.P();
              },
              fm: function () {
                return p ? u.Fc() : v;
              },
              ue: function (t) {
                d.za = t;
                b();
              },
              Aa: function (t) {
                Fa.ba();
                if ("abort" === m) return t.h(0), t;
                "none" !== m &&
                  (aa.set(m),
                  h && aa.D("u31", 1 / d.size),
                  v.J(),
                  l && f.h(1),
                  X.l(!1, !1),
                  v.h(0),
                  (t = v));
                p && u.process(t);
              },
              A: function () {
                v.remove();
                l && f.remove();
              },
            };
            return J;
          },
        },
        Hd = {
          instance: function (a) {
            function b() {
              if (F.lc) {
                l.input && (l.input.remove(), l.Hd.remove());
                var n = a.size * a.sparsity;
                D = Math.log(n / a.size) / Math.log(2);
                l.input = ba.instance({
                  isMipmap: !0,
                  isFloat: !0,
                  isPot: !0,
                  width: n * a.za[0],
                  height: n * a.za[1],
                  Wf: D,
                });
                l.Hd = ba.instance({
                  isFloat: !0,
                  isPot: !0,
                  width: a.size * a.za[0],
                  height: a.size * a.za[1],
                });
              }
            }
            function d() {
              l.output && l.output.remove();
              l.output = ba.instance({
                isFloat: !0,
                isPot: !u,
                isLinear: !u && h.isLinear,
                width: a.size * a.za[0],
                height: a.size * a.za[1],
              });
            }
            function f(n) {
              h.buffer.forEach(function (y, Q) {
                h.results[Q][0] = n[0][y];
                h.results[Q][1] = n[1][y];
                h.results[Q][2] = n[2][y];
                h.results[Q][3] = n[3][y];
              });
              return h.results;
            }
            a.normalize = a.normalize || !1;
            var l = {
                input: null,
                bias: null,
                Hd: null,
                output: null,
                ig: null,
                gg: null,
                hg: null,
              },
              p = null,
              u = !0,
              h = {
                type: "undef",
                C: null,
                isLinear: !1,
                buffer: [],
                results: [],
                Ld: !1,
              },
              m = -1,
              q = a.isReorganize ? a.isReorganize : !1,
              v = a.kernelsCount ? !0 : !1,
              J = [a.Ic ? "s32" : "s31", a.Ic ? "s34" : "s33", "s35"][
                a.shiftRGBAMode || 0
              ],
              t = { isEnabled: !1 },
              x = 1 / a.size;
            a.Mm
              ? ((a.sparsity =
                  "undefined" !== typeof a.sparsity ? a.sparsity : a.de.sf()),
                (u = !1))
              : "full" === a.connectivityUp && (a.sparsity = a.de.sf());
            var z = {
                elu: "s19",
                elu01: "s20",
                relu: "s17",
                gelu: "s18",
                arctan: "s21",
                arctan2: "s22",
                sigmoid: "s16",
                copy: "s0",
              }[a.activation],
              k = a.sparsity * a.sparsity,
              g = !1,
              E = a.size,
              M = "";
            if (a.maxPooling) {
              switch (a.maxPooling.size) {
                case 2:
                  M = "s41";
                  break;
                case 4:
                  M = "s42";
              }
              g = !0;
              E /= a.maxPooling.size;
              l.gg = ba.instance({ isFloat: !0, isPot: !1, width: E });
            }
            var D = -1,
              F = null;
            u && d();
            l.bias = ba.instance(a.bias);
            var e = {
              P: function () {
                return a.size;
              },
              sf: function () {
                return E;
              },
              Xh: function () {
                return a.classesCount;
              },
              Rk: function (n) {
                p.h(n);
              },
              Bn: function () {
                a.remap &&
                  a.remap.isEnabled &&
                  (t = {
                    isEnabled: !0,
                    gn: ba.instance(a.remap.maskTexture),
                    Nc: a.remap.layers.map(function (n) {
                      return a.parent.cm(n);
                    }),
                    depth: a.remap.depth,
                  });
              },
              vo: function () {
                switch (a.connectivityUp) {
                  case "direct":
                    F = be.instance(a.connectivity);
                    break;
                  case "square":
                    F = ce.instance(a.connectivity);
                    break;
                  case "squareFast":
                    F = de.instance(a.connectivity, a.activation);
                    break;
                  case "full":
                    F = ee.instance(
                      Object.assign({ Ic: a.Ic }, a.connectivity)
                    );
                    break;
                  case "conv":
                    (m = a.kernelsCount),
                      (F = fe.instance(a.connectivity)),
                      q &&
                        (l.ig = ba.instance({
                          width: E,
                          isFloat: !0,
                          isFlipY: !1,
                          isPot: !1,
                        }));
                }
                b();
              },
              Aa: function (n, y) {
                p = n;
                F.lc
                  ? (l.input.J(),
                    v && l.bias.h(2),
                    F.Aa(t),
                    l.input.h(0),
                    l.input.Pl(D),
                    l.Hd.J(),
                    v ? aa.set("s0") : (aa.set(J), aa.D("u4", k), l.bias.h(1)),
                    l.input.Sk(D, 0),
                    X.l(!1, !1),
                    aa.set(z),
                    l.output.u(),
                    l.Hd.h(0),
                    X.l(!1, !1))
                  : (l.output.J(), l.bias.h(1), F.Aa());
                if (u)
                  return (
                    (y = l.output),
                    g &&
                      (l.gg.J(),
                      y.h(0),
                      aa.set(M),
                      aa.O("u6", a.size, a.size),
                      X.l(!1, !1),
                      (y = l.gg)),
                    q &&
                      (l.ig.u(),
                      aa.set("s24"),
                      aa.O("u19", m, E / m),
                      y.h(0),
                      X.l(!1, !1),
                      (y = l.ig)),
                    y.h(0),
                    y
                  );
                var Q = l.output;
                if (a.normalize || h.Ld)
                  (n = a.normalize),
                    aa.set(h.Ld ? "s9" : "s8"),
                    aa.D("u11", n ? x : 1),
                    l.hg.J(),
                    Q.h(0),
                    X.l(!1, !1),
                    (Q = l.hg);
                n = null;
                switch (h.type) {
                  case "cpuRGBA2Float":
                    Q.Fh(!1);
                    y ? (n = e.Fn(Q).then(h.C)) : ((Q = e.Gn(Q)), h.C(Q));
                    break;
                  case "cpuMeanFloat":
                    Q.Fh(!0);
                    if (y) n = Q.In().then(h.C);
                    else {
                      Q = Q.Jn();
                      for (var B = 0; B < Q.length; ++B);
                      h.C(Q);
                    }
                    break;
                  case "gpuRawAvg":
                  case "gpuRaw":
                    Q.h(0);
                  case "none":
                    null !== h.C && h.C(Q);
                }
                y && null === n && (n = Promise.resolve());
                return n;
              },
              ue: function (n) {
                a.za = n;
                b();
                d();
              },
              Do: function (n) {
                n &&
                  ((h.type = n.Zd || "none"),
                  (h.C = n.Yd || null),
                  (h.isLinear = n.fg ? !0 : !1));
                d();
                n =
                  "undefined" !== typeof a.classesCount && a.classesCount
                    ? a.classesCount
                    : a.size * a.size;
                for (var y = 0, Q = 0, B = 0; y < n; ++y)
                  h.buffer.push(Q + (a.size - 1 - B) * a.size),
                    h.results.push([-1, -1, -1, -1]),
                    ++Q,
                    Q === a.size && ((Q = 0), ++B);
                h.Ld = "gpuRawAvg" === h.type || "cpuMeanFloat" === h.type;
                if (a.normalize || h.Ld)
                  l.hg = ba.instance({ isFloat: !0, isPot: !0, width: a.size });
              },
              Fn: function (n) {
                return n.Hn().then(f);
              },
              Gn: function (n) {
                n = n.dj();
                f(n);
                return h.results;
              },
              A: function () {
                for (var n in l) {
                  var y = l[n];
                  y && y.remove();
                }
                F && (F.A(), (F = null));
              },
            };
            a.de && e.vo(a.de);
            return e;
          },
        },
        be = {
          instance: function (a) {
            var b = ba.instance(a.weights);
            return {
              lc: !0,
              Bd: function () {
                return 1;
              },
              A: function () {
                b.remove();
              },
              um: function () {
                return b;
              },
              Aa: function () {
                aa.set("s30");
                b.h(1);
                X.l(!1, !1);
              },
            };
          },
        },
        ee = {
          instance: function (a) {
            var b = a.fromLayerSize,
              d = ba.instance(a.weights),
              f = a.Ic ? "s27" : "s26";
            return {
              lc: !0,
              Bd: function () {
                return b;
              },
              A: function () {
                d.remove();
              },
              Aa: function (l) {
                if (l.isEnabled) {
                  aa.set("s28");
                  l.gn.h(3);
                  for (
                    var p = Math.min(l.Nc.length, l.depth), u = 0;
                    u < p;
                    ++u
                  )
                    l.Nc[u].Rk(4 + u);
                } else aa.set(f);
                aa.D("u9", a.toLayerSize);
                aa.D("u10", a.fromLayerSize);
                d.h(1);
                X.l(!1, !1);
              },
            };
          },
        },
        ce = {
          instance: function (a) {
            for (
              var b = a.fromLayerSize,
                d = a.toLayerSize,
                f = a.toSparsity,
                l = f * d,
                p = l / b,
                u = b / d,
                h = 0,
                m = 0,
                q = 0,
                v = Array(f * d * f * d * 4),
                J = Array(f * d * f * d * 4),
                t = Array(b * b),
                x = 0;
              x < t.length;
              ++x
            )
              t[x] = 0;
            x = Math.floor(f / 2);
            for (var z = 0.5 / d, k = 0.5 / b, g = 0.5 / l, E = 0; E < d; ++E)
              for (var M = Math.round(E * u), D = 0; D < d; ++D) {
                var F = Math.round(D * u),
                  e = E / d,
                  n = D / d;
                e += z;
                n += z;
                for (var y = 0; y < f; ++y) {
                  var Q = M + y - x;
                  0 > Q && (Q += b);
                  Q >= b && (Q -= b);
                  for (var B = 0; B < f; ++B) {
                    var A = h / l,
                      O = m / l,
                      G = F + B - x;
                    0 > G && (G += b);
                    G >= b && (G -= b);
                    var w = Q / b,
                      I = G / b;
                    O = 1 - O - 1 / l;
                    w += k;
                    I += k;
                    A += g;
                    O += g;
                    var T = E * f + y,
                      U = D * f + B;
                    U = d * f - U - 1;
                    T = d * f * U + T;
                    v[4 * T] = A;
                    v[4 * T + 1] = O;
                    v[4 * T + 2] = w;
                    v[4 * T + 3] = I;
                    I = t[G * b + Q]++;
                    T = I % p;
                    w = Q * p + T;
                    G = G * p + (I - T) / p;
                    G = b * p - 1 - G;
                    G = b * p * G + w;
                    J[4 * G] = A;
                    J[4 * G + 1] = O;
                    J[4 * G + 2] = e;
                    J[4 * G + 3] = n;
                    ++h >= l && ((h = 0), ++m);
                    ++q;
                  }
                }
              }
            t = null;
            var da = ba.instance(a.weights);
            delete a.weights.data;
            var N = ba.instance({
              width: l,
              isFloat: !0,
              array: new Float32Array(J),
              isPot: !0,
            });
            J = null;
            var ra = ba.instance({
              width: l,
              isFloat: !0,
              array: new Float32Array(v),
              isPot: !0,
            });
            v = null;
            return {
              lc: !0,
              Bd: function () {
                return p;
              },
              A: function () {
                N.remove();
                ra.remove();
                da.remove();
              },
              Aa: function () {
                aa.set("s25");
                da.h(1);
                ra.h(2);
                X.l(!1, !1);
              },
            };
          },
        },
        fe = {
          instance: function (a) {
            var b = a.kernelsCount,
              d = a.toSparsity,
              f = (d * a.toLayerSize) / a.fromLayerSize,
              l = a.inputScale || [1, 1],
              p = ba.instance(a.weights);
            return {
              lc: !0,
              Bd: function () {
                return f;
              },
              hq: function () {
                return d;
              },
              um: function () {
                return p;
              },
              A: function () {
                p.remove();
              },
              Aa: function () {
                aa.set("s29");
                aa.Cg("u29", l);
                aa.D("u27", b);
                aa.D("u28", d);
                aa.D("u9", a.toLayerSize);
                aa.D("u10", a.fromLayerSize);
                p.h(1);
                X.l(!1, !1);
              },
            };
          },
        },
        de = {
          instance: function (a, b) {
            var d = a.fromLayerSize,
              f = a.toLayerSize,
              l = a.toSparsity,
              p = a.stride ? a.stride : 1,
              u = (l * f) / d,
              h = f < d,
              m = d / f,
              q = ba.instance(a.weights),
              v =
                "s51" +
                [
                  d.toString(),
                  f.toString(),
                  l.toString(),
                  p.toString(),
                  b,
                ].join("_");
            aa.Kl(v) ||
              ((a = xb(b)),
              (f = [
                { type: "1f", name: "u9", value: f },
                { type: "1f", name: "u33", value: p },
              ]),
              h && f.push({ type: "1f", name: "u10", value: d }),
              (d = [(h ? u : l).toFixed(1), a]),
              h && d.push(m.toFixed(1)),
              aa.Cm(h ? "s47" : "s46", v, d),
              aa.j(
                v,
                f.concat([
                  { type: "1i", name: "u7", value: 0 },
                  { type: "1i", name: "u3", value: 1 },
                  { type: "1i", name: "u8", value: 3 },
                ])
              ));
            return {
              lc: !1,
              Bd: function () {
                return u;
              },
              A: function () {
                q.remove();
              },
              Aa: function () {
                aa.set(v);
                q.h(3);
                X.l(!1, !1);
              },
            };
          },
        },
        Yd = {
          instance: function (a) {
            var b = a.Oi ? a.Oi : 3,
              d = a.ri ? a.ri : 64,
              f = a.Ti ? a.Ti : 64,
              l = a.Ea ? !0 : !1;
            a = { isFloat: !1, width: d, isPot: !1, isFlipY: !1 };
            var p = ba.instance(a),
              u = ba.instance(a),
              h = ba.instance(a),
              m = ba.instance(a),
              q = ba.instance({
                isFloat: !0,
                width: f,
                isPot: !1,
                isFlipY: !1,
              }),
              v = 1 / d;
            return {
              process: function (J) {
                aa.set("s43");
                m.u();
                X.l(l, !1);
                aa.set("s44");
                for (var t = 0; t < b; ++t)
                  p.u(),
                    aa.O("u15", v, 0),
                    X.l(l, !1),
                    h.u(),
                    m.h(0),
                    X.l(l, !1),
                    u.u(),
                    p.h(0),
                    aa.O("u15", 0, v),
                    X.l(l, !1),
                    m.u(),
                    h.h(0),
                    X.l(l, !1),
                    t !== b - 1 && u.h(0);
                aa.set("s45");
                q.u();
                J.h(0);
                u.h(1);
                m.h(2);
                X.l(l, !1);
                q.h(0);
              },
              Fc: function () {
                return q;
              },
            };
          },
        },
        Zd = {
          instance: function (a) {
            function b(v) {
              return ba.instance({
                isFloat: v,
                width: d.da,
                isPot: !1,
                isFlipY: !1,
              });
            }
            var d = Object.assign(
                { jb: 0.1, Ua: 9, da: 128, gain: 1, Ea: !1 },
                a
              ),
              f = b(!1),
              l = [b(!1), b(!1), b(!1)],
              p = [b(!1), b(!1), b(!1)],
              u = b(!0),
              h = [f, p[0], p[1]];
            a =
              "uniform sampler2D u1;const float e=1.1111,g=2.2222;uniform vec2 u34;varying vec2 vv0;void main(){float b=0.,c=0.;for(float a=-e;a<=e;a+=1.){vec2 i=u34*a,j=vv0+i*g;float d=1.2*a/e,f=exp(-d*d);b+=f*texture2D(u1,j).r,c+=f;}b/=c,gl_FragColor=vec4(b,0.,0.,1.);}"
                .replace("1.1111", Math.round((d.Ua - 1) / 2).toFixed(2))
                .replace("2.2222", (1 / d.da).toFixed(6));
            var m =
                "uniform sampler2D u35,u36,u37,u38;const float f=1.1111;const vec3 g=vec3(1.);const float h=2.2222;varying vec2 vv0;void main(){vec3 a=texture2D(u35,vv0).rgb;float c=texture2D(u36,vv0).r,d=texture2D(u37,vv0).r,i=texture2D(u38,vv0).r,j=a.r*a.r;vec3 b=vec3(c,d,i),k=max(g*f,abs(vec3(j)-b*b)),l=sqrt(k);gl_FragColor=vec4(a.r,h*(a-b)/l);}"
                  .replace("1.1111", d.jb.toFixed(4))
                  .replace("2.2222", d.gain.toFixed(4)),
              q = { u1: 0 };
            aa.uc([
              {
                id: "s53",
                name: "_",
                g: "uniform sampler2D u1;varying vec2 vv0;const vec3 f=vec3(.2126,.7152,.0722),g=vec3(1.);void main(){vec3 a=texture2D(u1,vv0).rgb;float b=dot(a,f);gl_FragColor=vec4(b);}",
                o: q,
                i: ["u1"],
                precision: "lowp",
              },
              {
                id: "s54",
                name: "_",
                g: a,
                o: q,
                i: ["u1", "u34"],
                precision: "lowp",
              },
              {
                id: "s55",
                name: "_",
                g: m,
                o: { u35: 0, u36: 1, u37: 2, u38: 3 },
                i: ["u35", "u36", "u37", "u38"],
                precision: "highp",
              },
            ]);
            return {
              process: function () {
                aa.set("s53");
                f.J();
                X.l(d.Ea, !1);
                aa.set("s54");
                for (var v = 0; 3 > v; ++v)
                  aa.O("u34", 1, 0),
                    l[v].u(),
                    h[v].h(0),
                    X.l(!1, !1),
                    aa.O("u34", 0, 1),
                    p[v].u(),
                    l[v].h(0),
                    X.l(!1, !1);
                aa.set("s55");
                u.u();
                f.h(0);
                p[0].h(1);
                p[1].h(2);
                p[2].h(3);
                X.l(!1, !1);
                u.h(0);
              },
              Fc: function () {
                return u;
              },
            };
          },
        },
        $d = {
          instance: function (a) {
            function b(q) {
              return ba.instance({
                isFloat: q,
                width: d.da,
                isPot: !1,
                isFlipY: !1,
              });
            }
            var d = Object.assign(
                { jb: 0.1, Ua: 9, da: 128, gain: 1, Ea: !1 },
                a
              ),
              f = b(!1),
              l = b(!1),
              p = b(!1),
              u = b(!0);
            a =
              "uniform sampler2D u1;const float e=1.1111,g=2.2222;uniform vec2 u34;varying vec2 vv0;void main(){vec3 b=vec3(0.);float c=0.;for(float a=-e;a<=e;a+=1.){vec2 i=u34*a,j=vv0+i*g;float d=1.2*a/e,f=exp(-d*d);b+=f*texture2D(u1,j).rgb,c+=f;}b/=c,gl_FragColor=vec4(b,1.);}"
                .replace("1.1111", Math.round((d.Ua - 1) / 2).toFixed(2))
                .replace("2.2222", (1 / d.da).toFixed(6));
            var h =
                "uniform sampler2D u0,u39;const float f=1.1111;const vec3 g=vec3(1.);const float h=2.2222;varying vec2 vv0;void main(){vec4 a=texture2D(u0,vv0);vec3 c=texture2D(u39,vv0).rgb;float d=a.a*a.a;vec3 b=c.rgb,i=max(g*f,abs(vec3(d)-b*b)),j=sqrt(i);gl_FragColor=vec4(a.a,h*(a.rgb-b)/j);}"
                  .replace("1.1111", d.jb.toFixed(4))
                  .replace("2.2222", d.gain.toFixed(4)),
              m = { u1: 0 };
            aa.uc([
              {
                id: "s56",
                name: "_",
                g: "uniform sampler2D u1;varying vec2 vv0;const vec3 f=vec3(.2126,.7152,.0722),g=vec3(1.);void main(){vec3 a=texture2D(u1,vv0).rgb;float b=dot(a,f);gl_FragColor=vec4(a.rgb,b);}",
                o: m,
                i: ["u1"],
                precision: "lowp",
              },
              {
                id: "s57",
                name: "_",
                g: a,
                o: m,
                i: ["u1", "u34"],
                precision: "lowp",
              },
              {
                id: "s58",
                name: "_",
                g: h,
                o: { u0: 0, u39: 1 },
                i: ["u0", "u39"],
                precision: "highp",
              },
            ]);
            return {
              process: function () {
                aa.set("s56");
                f.J();
                X.l(d.Ea, !1);
                aa.set("s57");
                aa.O("u34", 1, 0);
                l.u();
                f.h(0);
                X.l(!1, !1);
                aa.O("u34", 0, 1);
                p.u();
                l.h(0);
                X.l(!1, !1);
                aa.set("s58");
                u.u();
                f.h(0);
                p.h(1);
                X.l(!1, !1);
                u.h(0);
              },
              Fc: function () {
                return u;
              },
            };
          },
        },
        ae = {
          instance: function (a) {
            function b(v) {
              return ba.instance({
                isFloat: v,
                width: d.da,
                isPot: !1,
                isFlipY: !1,
              });
            }
            var d = Object.assign(
                { jb: 0.1, Ua: 9, da: 128, gain: 1, jg: 0, Jc: !1, Ea: !1 },
                a
              ),
              f = b(!1),
              l = null,
              p = null,
              u = null;
            d.Jc && ((l = b(!1)), (p = b(!1)), (u = b(!0)));
            a = { u1: 0 };
            var h = [
              {
                id: "s59",
                name: "_",
                g: "uniform sampler2D u1;const float f=1.1111;varying vec2 vv0;const vec3 e=vec3(.2126,.7152,.0722);void main(){vec2 a=vv0*.5*(f+1.);float b=.5*(1.-f),c=dot(texture2D(u1,a).rgb,e),d=dot(texture2D(u1,a+vec2(0.,b)).rgb,e),h=dot(texture2D(u1,a+vec2(b,0.)).rgb,e),i=dot(texture2D(u1,a+vec2(b,b)).rgb,e);gl_FragColor=vec4(c,d,h,i);}".replace(
                  "1.1111",
                  d.jg.toFixed(4)
                ),
                o: a,
                i: ["u1"],
                precision: "lowp",
              },
            ];
            if (d.Jc) {
              var m =
                  "uniform sampler2D u1;const float e=1.1111,g=2.2222;uniform vec2 u34;varying vec2 vv0;void main(){vec4 b=vec4(0.);float c=0.;for(float a=-e;a<=e;a+=1.){vec2 i=u34*a,j=vv0+i*g;float d=1.2*a/e,f=exp(-d*d);b+=f*texture2D(u1,j),c+=f;}gl_FragColor=b/c;}"
                    .replace("1.1111", Math.round((d.Ua - 1) / 2).toFixed(2))
                    .replace("2.2222", (1 / d.da).toFixed(6)),
                q =
                  "uniform sampler2D u0,u39;const float f=1.1111;const vec4 g=vec4(1.);const float h=2.2222;varying vec2 vv0;void main(){vec4 a=texture2D(u0,vv0),c=texture2D(u39,vv0),d=a*a,b=c,i=max(g*f,abs(d-b*b)),j=sqrt(i);gl_FragColor=h*(a-b)/j;}"
                    .replace("1.1111", d.jb.toFixed(4))
                    .replace("2.2222", d.gain.toFixed(4));
              h.push(
                {
                  id: "s60",
                  name: "_",
                  g: m,
                  o: a,
                  i: ["u1", "u34"],
                  precision: "lowp",
                },
                {
                  id: "s61",
                  name: "_",
                  g: q,
                  o: { u0: 0, u39: 1 },
                  i: ["u0", "u39"],
                  precision: "highp",
                }
              );
            }
            aa.uc(h);
            return {
              process: function () {
                aa.set("s59");
                f.J();
                X.l(d.Ea, !1);
                d.Jc
                  ? (aa.set("s60"),
                    aa.O("u34", 1, 0),
                    l.u(),
                    f.h(0),
                    X.l(!1, !1),
                    aa.O("u34", 0, 1),
                    p.u(),
                    l.h(0),
                    X.l(!1, !1),
                    aa.set("s61"),
                    u.u(),
                    f.h(0),
                    p.h(1),
                    X.l(!1, !1),
                    u.h(0))
                  : f.h(0);
              },
              am: function () {
                return 2 - d.jg;
              },
              Fc: function () {
                return d.Jc ? u : f;
              },
            };
          },
        },
        Qb = (function () {
          function a(g, E, M, D, F, e, n) {
            if (!z)
              if (n === e.length) F();
              else {
                switch (e[n]) {
                  case "A":
                    M();
                    break;
                  case "D":
                    g();
                    break;
                  case "S":
                    E()
                      .then(function (y, Q) {
                        k.Qj();
                        a(g, E, M, Q ? null : D, F, e, ++n);
                      })
                      .catch(function (y) {
                        console.log("An error occurred in the WebAR loop: ", y);
                        F();
                      });
                    return;
                  case "R":
                    D && D();
                }
                a(g, E, M, D, F, e, ++n);
              }
          }
          var b = {
              n: 5,
              cg: 1,
              Mf: 0,
              Ol: [25, 39],
              Bh: 45,
              vd: [2, 200],
              k: 0.7,
              To: 200,
              vn: 0.05,
            },
            d = -1,
            f = null,
            l = -1,
            p = -1,
            u = 0,
            h = -1,
            m = -1,
            q = 0,
            v = null,
            J = 0,
            t = b.vd[1],
            x = Math.log(2),
            z = !0,
            k = {
              X: function () {
                switch (d) {
                  case -1:
                    return -1;
                  case 0:
                    return m + f.Mf;
                  case 1:
                    return q;
                }
              },
              Yh: function (g) {
                switch (d) {
                  case -1:
                    return 1;
                  case 0:
                    return Math.pow(
                      Math.min(Math.max(h, 0), f.n - 1) / (f.n - 1),
                      g || 1
                    );
                  case 1:
                    return (q - f.Mf) / (f.n - 1);
                }
              },
              m: function (g) {
                f = Object.assign({}, b, g);
                h = m = f.cg;
                d = 0;
                v = f.Ol.slice(0);
                k.reset();
                k.Jl().then(function (E) {
                  E >= f.Bh || ((E /= f.Bh), (v[0] *= E), (v[1] *= E));
                });
              },
              Qj: function (g) {
                g = ("undefined" === typeof g ? Date.now() : g) || 0;
                var E = Math.min(Math.max(g - J, f.vd[0]), f.vd[1]);
                t = E;
                J = g;
                var M = -1 === l ? 0 : f.k;
                l = Math.min(Math.max(1e3 / E, 5), 120) * (1 - M) + l * M;
                g - p > f.To &&
                  5 < ++u &&
                  ((E = f.k),
                  (h =
                    h * (1 - E) +
                    (l < v[0] ? m - 1 : l > v[1] ? m + 1 : m) * E),
                  Math.abs(h - m) > 1 - f.vn &&
                    ((E = Math.min(Math.max(Math.round(h), 0), f.n - 1)),
                    E !== m && ((h = m = E), (l = 0.5 * (v[1] - v[0])))),
                  (p = g));
              },
              rg: function (g, E, M, D, F, e) {
                z = !1;
                a(g, E, M, D, F, e, 0);
              },
              stop: function () {
                z = !0;
              },
              oo: function (g) {
                q = g;
                d = 1;
              },
              So: function () {
                d = 0;
                k.reset();
              },
              reset: function () {
                t = b.vd[1];
                p = l = -1;
                u = 0;
              },
              Vq: function (g, E, M) {
                M = Math.exp((-x * t) / M);
                return (1 - M) * g + M * E;
              },
              Zp: function () {
                return t;
              },
              Jl: function () {
                return new Promise(function (g) {
                  function E(n) {
                    n = n || Date.now();
                    var y = Math.max(0, n - D);
                    D = n;
                    0 !== F++ && 0 < y && ((M = Math.min(M, y)), ++e);
                    10 >= F
                      ? window.requestAnimationFrame(E)
                      : g(Math.round(1e3 / M));
                  }
                  var M = Infinity,
                    D = 0,
                    F = 0,
                    e = 0;
                  setTimeout(E, 1);
                });
              },
            };
          return k;
        })(),
        ld = (function () {
          function a(J, t) {
            var x = J[0] - 0.5;
            J = J[1] - 0.5;
            var z = t[0] - 0.5;
            t = t[1] - 0.5;
            return x * x + J * J - (z * z + t * t);
          }
          var b = {
              Pi: 4,
              $d: [1.5, 1.5, 2],
              ta: [0.1, 0.1, 0.1],
              kj: 1,
              da: -1,
              Tb: -1,
              Mo: 2,
              sn: 1,
              sg: !0,
              Hl: 0.8,
            },
            d = null,
            f = [],
            l = [],
            p = [],
            u = [0],
            h = [0.5, 0.5, 1],
            m = null,
            q = 0,
            v = [0, 0, 0];
          return {
            m: function (J) {
              d = Object.assign({}, b, J);
              f.splice(0);
              l.splice(0);
              p.splice(0);
              q = 0;
              J = d.$d[0] * d.ta[0];
              var t = d.$d[1] * d.ta[1],
                x = 1 / (1 + d.$d[2] * d.ta[2]),
                z = d.kj * Math.min(d.da, d.Tb),
                k = z / d.da;
              z /= d.Tb;
              var g = 0.5 * d.Hl;
              g *= g;
              for (var E = 0; E < d.Pi; ++E) {
                var M = [];
                l.push(M);
                var D = Math.pow(x, E),
                  F = k * D,
                  e = z * D;
                D = F * d.sn;
                p.push(D);
                var n = F * J,
                  y = e * t;
                F /= 2;
                e /= 2;
                for (
                  var Q = 1 + (1 - F - F) / n, B = 1 + (1 - e - e) / y, A = 0;
                  A < B;
                  ++A
                )
                  for (var O = e + A * y, G = O - 0.5, w = 0; w < Q; ++w) {
                    var I = F + w * n,
                      T = I - 0.5;
                    T * T + G * G > g ||
                      ((I = [I, O, D]), f.push(I), M.push(I));
                  }
                d.sg && M.sort(a);
                m = f;
              }
              d.sg && f.sort(a);
            },
            get: function (J) {
              var t = m.length;
              if (0 === t) return h;
              for (; J >= u.length; ) u.push(0);
              u[J] >= t && (u[J] = 0);
              var x = m[Math.floor(u[J]) % t];
              u[J] = (u[J] + 1 / d.Mo) % t;
              if (0 === q) return x;
              v[0] = x[0];
              v[1] = x[1];
              v[2] = q;
              return v;
            },
            Aq: function (J) {
              J >= u.length || (u[J] = Math.floor(Math.random() * m.length));
            },
            Nq: function (J) {
              q = J;
              if (0 === q) m = f;
              else {
                for (var t = p.length, x = t - 1, z = 0; z < t; ++z)
                  if (p[z] <= J) {
                    x = z;
                    break;
                  }
                m = l[x];
              }
            },
            reset: function () {
              for (var J = f.length / u.length, t = 0; t < u.length; ++t)
                u[t] = Math.floor(t * J);
              q = 0;
              m = f;
            },
          };
        })(),
        Eb = (function () {
          function a() {
            d(k + x.Xf);
            g.port.postMessage("DONE");
          }
          function b() {
            F.fd = 0 === x.Ca ? M(d) : M(f);
          }
          function d(B) {
            D.Xb &&
              null !== z &&
              ((B -= k),
              (B = Math.min(Math.max(B, x.Jh[0]), x.Jh[1])),
              (k += B),
              p(),
              e.isEnabled &&
                e.Kc &&
                D.Pa &&
                k - e.Jf > x.gh &&
                (q(), (e.Jf = k)),
              z(k));
          }
          function f(B) {
            D.Xb && (F.timeout = setTimeout(d.bind(null, B), x.Ca));
          }
          function l() {
            z = null;
            D.Xb = !1;
            p();
          }
          function p() {
            F.fd && (window.cancelAnimationFrame(F.fd), (F.fd = null));
            F.timeout && (window.clearTimeout(F.timeout), (F.timeout = null));
          }
          function u(B) {
            B && !D.Pa
              ? ((D.Pa = !0),
                E && Qb.So(),
                g.port.postMessage("STOP"),
                Ia.Rj(!0),
                b())
              : !B &&
                D.Pa &&
                ((D.Pa = !1),
                E && Qb.oo(1),
                Ia.Rj(!1),
                g.port.postMessage("START"));
          }
          function h(B) {
            B.target.hidden ? y() : n();
          }
          function m(B, A, O) {
            A = B.createShader(A);
            B.shaderSource(A, O);
            B.compileShader(A);
            return A;
          }
          function q() {
            e.Kc = !1;
            var B = e.Ya,
              A = e.Fd,
              O = e.Gd,
              G = e.Da;
            B.uniform1f(e.ki, Math.random());
            e.Yb ? A.beginQueryEXT(G, O) : B.beginQuery(G, O);
            B.drawElements(B.POINTS, 1, B.UNSIGNED_SHORT, 0);
            e.Yb ? A.endQueryEXT(G) : B.endQuery(G);
            Ia.flush();
            J()
              .then(function (w) {
                0 === w || isNaN(w)
                  ? ((e.isEnabled = !1),
                    console.log(
                      "WARNING in benchmark_GPUClock: WebGL timer queries is not working properly. timeElapsedNs =",
                      w
                    ))
                  : ((w = (x.hk * x.fh * 1e3) / w),
                    (e.ye = (e.ye + 1) % x.sc),
                    (e.Kf[e.ye] = w),
                    ++e.Ei > x.sc &&
                      (e.Nd.set(e.Kf),
                      e.Nd.sort(function (I, T) {
                        return I - T;
                      }),
                      (w = e.Nd[Math.floor(x.sc / 2)]),
                      (e.yd = Math.max(e.yd, w)),
                      x.eh(w / e.yd)),
                    (e.Kc = !0));
              })
              .catch(function () {
                e.Kc = !0;
              });
          }
          function v(B) {
            var A = e.Ya,
              O = e.Fd,
              G = e.Gd;
            G = e.Yb
              ? O.Tp(G, O.QUERY_RESULT_AVAILABLE_EXT)
              : A.getQueryParameter(G, A.QUERY_RESULT_AVAILABLE);
            A = A.getParameter(O.GPU_DISJOINT_EXT);
            G ? B(!A) : setTimeout(v.bind(null, B), 0.1);
          }
          function J() {
            return new Promise(function (B, A) {
              v(function (O) {
                if (O) {
                  O = e.Ya;
                  var G = e.Fd,
                    w = e.Gd;
                  O = e.Yb
                    ? G.getQueryObjectEXT(w, G.QUERY_RESULT_EXT)
                    : O.getQueryParameter(w, O.QUERY_RESULT);
                  B(O);
                } else A();
              });
            });
          }
          var t = {
              vi: !0,
              Jh: [1, 200],
              Xf: 20,
              Ca: 0,
              fh: 50,
              hk: 240,
              gh: 3e3,
              sc: 3,
              eh: null,
            },
            x = null,
            z = null,
            k = 0,
            g = null,
            E = !1,
            M = null,
            D = { Oa: !1, Pa: !0, If: !1, Gf: !1, Ff: !1, Xb: !1 },
            F = { fd: null, timeout: null },
            e = {
              isEnabled: !1,
              Kc: !1,
              Ya: null,
              Fd: null,
              Gd: null,
              Da: null,
              ki: null,
              Yb: !0,
              Jf: 0,
              Ei: 0,
              Kf: null,
              Nd: null,
              ye: 0,
              yd: 0,
            },
            n = u.bind(null, !0),
            y = u.bind(null, !1),
            Q = {
              m: function (B) {
                x = Object.assign(t, B);
                Object.assign(D, { Pa: !0, Oa: !0, Xb: !1 });
                M =
                  window.requestPostAnimationFrame ||
                  window.requestAnimationFrame;
                if (null !== x.eh) {
                  B = document.createElement("canvas");
                  B.setAttribute("width", "1");
                  B.setAttribute("height", "1");
                  var A = { antialias: !1 };
                  B = B.getContext("webgl2", A) || B.getContext("webgl", A);
                  if (
                    (A =
                      B.getExtension("EXT_disjoint_timer_query") ||
                      B.getExtension("EXT_disjoint_timer_query_webgl2"))
                  ) {
                    e.Ya = B;
                    e.Fd = A;
                    e.isEnabled = !0;
                    e.Yb = A.beginQueryEXT ? !0 : !1;
                    var O = m(
                        B,
                        B.VERTEX_SHADER,
                        "attribute vec4 a0;void main(){gl_Position=a0;}"
                      ),
                      G = m(
                        B,
                        B.FRAGMENT_SHADER,
                        "precision lowp float;uniform float u40;void main(){vec4 a=u40*vec4(1.,2.,3.,4.);for(int b=0;b<666;b+=1)a=cos(a);gl_FragColor=a;}".replace(
                          "666",
                          x.fh.toString()
                        )
                      ),
                      w = B.createProgram();
                    B.attachShader(w, O);
                    B.attachShader(w, G);
                    B.linkProgram(w);
                    O = B.getAttribLocation(w, "a0");
                    e.ki = B.getUniformLocation(w, "u40");
                    B.useProgram(w);
                    B.enableVertexAttribArray(O);
                    w = B.createBuffer();
                    B.bindBuffer(B.ARRAY_BUFFER, w);
                    B.bufferData(
                      B.ARRAY_BUFFER,
                      new Float32Array([0.5, 0.5, 0, 1]),
                      B.STATIC_DRAW
                    );
                    B.vertexAttribPointer(O, 4, B.FLOAT, !1, 16, 0);
                    w = B.createBuffer();
                    B.bindBuffer(B.ELEMENT_ARRAY_BUFFER, w);
                    B.bufferData(
                      B.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array([0]),
                      B.STATIC_DRAW
                    );
                    B.disable(B.DEPTH_TEST);
                    B.disable(B.DITHER);
                    B.disable(B.STENCIL_TEST);
                    B.viewport(0, 0, 1, 1);
                    w = e.Yb ? A.createQueryEXT() : B.createQuery();
                    e.Gd = w;
                    e.Da = A.TIME_ELAPSED_EXT || B.TIME_ELAPSED;
                    e.Jf = -x.gh;
                    e.Kf = new Float32Array(x.sc);
                    e.Nd = new Float32Array(x.sc);
                    e.yd = 0;
                    e.ye = 0;
                    e.Ei = 0;
                    e.Kc = !0;
                  }
                }
                if (x.vi) {
                  B = !1;
                  try {
                    if ("undefined" === typeof SharedWorker) {
                      var I = URL.createObjectURL(
                          new Blob(
                            [
                              "let handler = null;\n      self.addEventListener('message', function(e){\n        if (handler !== null){\n          clearTimeout(handler);\n          handler = null;\n        }\n        switch (e.data) {\n          case 'START':\n          case 'DONE':\n            handler = setTimeout(function(){\n              self.postMessage('TICK');\n            }, " +
                                x.Xf.toString() +
                                ");\n            break;\n          case 'STOP':\n            break;\n        };\n      }, false);",
                            ],
                            { type: "text/javascript" }
                          )
                        ),
                        T = new Worker(I);
                      T.addEventListener("message", a);
                      g = { bj: T, port: T };
                      D.If = !0;
                    } else {
                      var U = URL.createObjectURL(
                          new Blob(
                            [
                              "let handler = null;\n      onconnect = function(e) {\n        const port = e.ports[0];\n        port.addEventListener('message', function(e) {\n          \n          if (handler !== null){\n            clearTimeout(handler);\n            handler = null;\n          }\n          switch (e.data) {\n            case 'START':\n            case 'DONE':\n              handler = setTimeout(function(){\n                port.postMessage('TICK');\n              }, " +
                                x.Xf.toString() +
                                ");\n              break;\n            case 'STOP':\n              break;\n          };\n          \n        });\n        \n        port.start();\n      } // end onconnect()",
                            ],
                            { type: "text/javascript" }
                          )
                        ),
                        da = new SharedWorker(U);
                      da.port.start();
                      da.port.addEventListener("message", a);
                      g = { bj: da, port: da.port };
                      D.Gf = !0;
                    }
                    B = !0;
                  } catch (N) {}
                  B &&
                    ("onvisibilitychange" in document
                      ? document.addEventListener("visibilitychange", h)
                      : (window.addEventListener("blur", y),
                        window.addEventListener("focus", n)),
                    window.addEventListener("pagehide", y),
                    window.addEventListener("pageshow", n),
                    (D.Ff = !0));
                }
                E = "undefined" !== typeof Qb;
              },
              A: function () {
                l();
                D.Ff &&
                  ("onvisibilitychange" in document
                    ? document.removeEventListener("visibilitychange", h)
                    : (window.removeEventListener("blur", y),
                      window.removeEventListener("focus", n)),
                  window.removeEventListener("pagehide", y),
                  window.removeEventListener("pageshow", n),
                  (D.Ff = !1));
                D.Gf
                  ? (g.port.close(), (D.Gf = !1))
                  : D.If && (g.bj.terminate(), (D.If = !1));
                Object.assign(D, { Pa: !0, Oa: !1, Xb: !1 });
                z = null;
              },
              vq: function () {
                return D.Pa;
              },
              update: function (B) {
                Object.assign(x, B);
              },
              rg: function (B) {
                D.Oa || Q.m({});
                p();
                D.Xb = !0;
                z = B;
                D.Pa && b();
              },
              stop: l,
            };
          return Q;
        })(),
        Mc = {
          pf: function () {
            return Date.now();
          },
          Wp: function () {
            return performance.now();
          },
        },
        Md = (function () {
          var a = { Jm: !0, isLinear: !0, Yf: [4, 11] };
          return {
            Rp: function (b, d, f) {
              return d.isDetected
                ? Math.floor(d.s * b)
                : ((b = Math.floor(Math.log2(b / 4))),
                  (b = Math.min(Math.max(b, 4), 9)),
                  Math.max(f, Math.pow(2, b)));
            },
            instance: function (b) {
              var d = Object.assign({}, a, b),
                f = [],
                l = null,
                p = -1,
                u = null,
                h = !1;
              for (b = d.Yf[0]; b <= d.Yf[1]; ++b) f[b] = null;
              return {
                J: function (m, q) {
                  q !== p &&
                    (l && l.remove(),
                    (l = ba.instance({
                      isLinear: d.isLinear,
                      isPot: !0,
                      width: q,
                    })));
                  if ((h = d.Jm && q < 0.5 * m)) {
                    m = Math.floor(Math.log2(m));
                    var v = d.Yf;
                    v = m = Math.min(Math.max(m, v[0]), v[1]);
                    if (!f[v]) {
                      var J = ba.instance({
                        isPot: !0,
                        isMipmap: !0,
                        xi: !0,
                        width: Math.pow(2, v),
                      });
                      f[v] = { V: J, Ni: -1 };
                    }
                    m = f[m];
                    u = m.V;
                    m.Ni !== q &&
                      ((v = Math.log2(q)),
                      u.h(0),
                      u.zj(v),
                      ba.aa(0),
                      (m.Ni = q));
                  } else u = l;
                  p = q;
                  u.J();
                },
                h: function (m) {
                  u.h(m);
                  h && u.Ec();
                },
                ya: function (m) {
                  u.ya(m);
                },
                remove: function () {
                  l && l.remove();
                  f.forEach(function (m) {
                    m && m.V.remove();
                  });
                },
              };
            },
          };
        })(),
        Fb = (function () {
          function a(Y) {
            switch (n) {
              case e.movePinch:
                var ia = -Y.deltaY;
                0 === y && k("pinch", -1, 0.001 * ia, null);
            }
            Y.deltaY;
            Y.preventDefault();
          }
          function b(Y) {
            if (-1 !== y)
              switch (n) {
                case e.swipe:
                  if (1 !== y) break;
                  m();
                  v(Y, B);
                  var ia = B[0] - Q[0];
                  l(ia);
                  Y = ia / ((20 * M.offsetWidth) / 100);
                  k("swipeMove", Math.min(Math.max(Y, -1), 1), Y, null);
                  break;
                case e.movePinch:
                  if (2 === y || 3 === y) {
                    v(Y, B);
                    ia = B[0] - Q[0];
                    var ta = B[1] - Q[1];
                    2 === y
                      ? ((P += Math.sqrt(ia * ia + ta * ta)),
                        10 > P
                          ? ((Q[0] = B[0]), (Q[1] = B[1]))
                          : (la ||
                              ((la = !0), k("moveStart", null, null, null)),
                            (ca[0] = ia),
                            (ca[1] = ta),
                            (O[0] = ia - A[0]),
                            (O[1] = ta - A[1]),
                            k("move", ca, O, null),
                            (A[0] = ca[0]),
                            (A[1] = ca[1])))
                      : 3 === y &&
                        ((Y = q(Y) / ka),
                        k("pinch", Y, Y - ma, null),
                        (ma = Y));
                  }
              }
          }
          function d(Y) {
            if (-1 !== y)
              switch (n) {
                case e.swipe:
                  if (1 !== y) break;
                  m();
                  v(Y, B);
                  Y = B[0] - Q[0];
                  var ia = 0 > Y;
                  (Y = 20 < (100 * Math.abs(Y)) / M.offsetWidth) && ia
                    ? k("swipeLeft", G, null, null)
                    : Y && !ia && k("swipeRight", G, null, null);
                  var ta = function () {
                    setTimeout(function () {
                      h();
                      y = 0;
                      k("swipeEnd", null, null, null);
                    }, 202);
                  };
                  Y
                    ? ((Y = function () {
                        var Ya = (ia ? -1 : 1) * M.width,
                          hb = ((ia ? 1 : -1) * Ya) / M.width;
                        G.style.transitionDuration = (400).toString() + "ms";
                        G.style.left = (da[0] + Ya).toString() + "px";
                        G.style.top = da[1].toString() + "px";
                        G.style.transform =
                          "rotate( " + hb.toString() + "rad )";
                        ta();
                      }),
                      U ? Y() : (N = Y))
                    : ((G.style.transitionDuration = (200).toString() + "ms"),
                      (G.style.opacity = "0"),
                      (G.style.left = da[0].toString() + "px"),
                      (G.style.top = da[1].toString() + "px"),
                      (G.style.transform = ""),
                      ta());
                  y = -1;
                  break;
                case e.movePinch:
                  if (2 === y || 3 === y)
                    y === y.move
                      ? k("moveEnd", null, null, null)
                      : 3 === y && k("pinchEnd", null, null, null),
                      (y = 0);
              }
          }
          function f(Y) {
            Y.preventDefault();
            if (-1 !== y)
              switch (n) {
                case e.swipe:
                  if (0 !== y) break;
                  m();
                  y = 1;
                  ra = setTimeout(function () {
                    h();
                    ra = null;
                    1 === y && ((y = 0), k("swipeEnd", null, null, null));
                  }, 1e3);
                  p();
                  k("swipeStart", null, null, null);
                  k("swipeGetCanvas", G, I, w);
                  v(Y, Q);
                  break;
                case e.movePinch:
                  0 !== y
                    ? 2 !== y ||
                      la ||
                      (void 0 === Y.changedTouches && void 0 === Y.touches) ||
                      ((ka = q(Y)),
                      20 < ka &&
                        ((y = 3), (ma = 1), k("pinchStart", null, null, null)))
                    : 3 !== y &&
                      ((la = !1),
                      v(Y, Q),
                      (A[0] = 0),
                      (A[1] = 0),
                      (y = 2),
                      (P = 0));
              }
          }
          function l(Y) {
            var ia = 0 > Y;
            G.style.left = da[0] + Y + "px";
            G.style.transformOrigin = ia ? H : Pa;
            G.style.transform =
              "rotate( " + (((ia ? 1 : -1) * Y) / M.width).toString() + "rad )";
          }
          function p() {
            U = !1;
            var Y = M.getBoundingClientRect();
            da[0] = Y.left;
            da[1] = Y.top;
            G.width = Math.round(M.width / 4);
            G.height = Math.round(M.height / 4);
            w.width = G.width;
            w.height = G.height;
            G.style.width = M.offsetWidth + "px";
            G.style.height = M.offsetHeight + "px";
            G.style.left = da[0] + "px";
            G.style.top = da[1] + "px";
            setTimeout(u, 0);
          }
          function u() {
            I.drawImage(M, 0, 0, G.width, G.height);
            T.drawImage(G, 0, 0);
            U = !0;
            document.body.appendChild(G);
            N && (N(), (N = !1));
          }
          function h() {
            G.style.transitionDuration = "0ms";
            G.style.opacity = "1";
            G.style.transform = "";
            U && (document.body.removeChild(G), (U = !1));
          }
          function m() {
            ra && (window.clearTimeout(ra), (ra = null));
          }
          function q(Y) {
            J(Y, qa, 0);
            J(Y, oa, 1);
            return Math.sqrt(qa[0] * qa[0] + oa[0] * oa[0]);
          }
          function v(Y, ia) {
            void 0 !== Y.changedTouches || void 0 !== Y.touches
              ? J(Y, ia, 0)
              : ((ia[0] = Y.pageX), (ia[1] = Y.pageY));
          }
          function J(Y, ia, ta) {
            Y.touches.length > ta
              ? ((ia[0] = Y.touches[ta].pageX), (ia[1] = Y.touches[ta].pageY))
              : ((ia[0] = Y.changedTouches[ta].pageX),
                (ia[1] = Y.changedTouches[ta].pageY));
          }
          function t() {
            F.forEach(function (Y) {
              M.removeEventListener(Y.type, Y.sb, !1);
            });
            return F.splice(0, F.length);
          }
          function x(Y) {
            Y.forEach(function (ia) {
              z(ia.type, ia.sb);
            });
          }
          function z(Y, ia) {
            M.removeEventListener(Y, ia, !1);
            G.removeEventListener(Y, ia, !1);
            M.addEventListener(Y, ia, !1);
            G.addEventListener(Y, ia, !1);
            0 ===
              F.filter(function (ta) {
                return ta.type === Y && ta.sb === ia;
              }).length && F.push({ type: Y, sb: ia });
          }
          function k(Y, ia, ta, Ya) {
            D[Y].forEach(function (hb) {
              hb.sb(ia, ta, Ya);
            });
          }
          function g(Y) {
            return Y[0] + "% " + (100 - Y[1]).toString() + "%";
          }
          var E = !1,
            M = null,
            D = {
              swipeStart: [],
              swipeEnd: [],
              swipeLeft: [],
              swipeRight: [],
              swipeMove: [],
              swipeGetCanvas: [],
              pinch: [],
              pinchStart: [],
              pinchEnd: [],
              move: [],
              moveStart: [],
              moveEnd: [],
            },
            F = [],
            e = { idle: 0, swipe: 1, movePinch: 2 },
            n = e.idle,
            y = 0,
            Q = [0, 0],
            B = [0, 0],
            A = [0, 0],
            O = [0, 0],
            G = document.createElement("canvas"),
            w = document.createElement("canvas"),
            I = G.getContext("2d"),
            T = w.getContext("2d");
          G.style.position = "fixed";
          G.style.zIndex = "800";
          G.style.cursor = "move";
          G.style.pointerEvents = "none";
          G.className = "swipeImage";
          G.setAttribute("draggable", !1);
          var U = !1,
            da = [0, 0],
            N = null,
            ra = null,
            Pa = g([50, 100]),
            H = g([50, 0]),
            r = null,
            P = 0,
            ca = [0, 0],
            ka = 0,
            la = !1,
            ma = 1,
            qa = [0, 0],
            oa = [0, 0],
            Ca = {
              init: function (Y) {
                if (E) Ca.switch_canvas(Y.sa);
                else
                  return (
                    (M = Y.sa),
                    z("mousedown", f),
                    z("mouseup", d),
                    z("mouseout", d),
                    z("mousemove", b),
                    z("mousemove", b),
                    z("wheel", a),
                    z("touchstart", f),
                    z("touchend", d),
                    z("touchmove", b),
                    (E = !0),
                    Ca
                  );
              },
              switch_canvas: function (Y) {
                if (!E) Ca.init({ sa: Y });
                else if (M !== Y) {
                  var ia = t();
                  M = Y;
                  x(ia);
                  for (var ta in D)
                    for (Y = D[ta], ia = Y.length - 1; 0 <= ia; --ia)
                      Y[ia].Mn && Y.splice(ia, 1);
                }
              },
              get_mode: function () {
                for (var Y in e) if (e[Y] === n) return Y;
                return !1;
              },
              switch_mode: function (Y) {
                E &&
                  "undefined" !== typeof e[Y] &&
                  ((Y = e[Y]), n !== Y && (m(), (n = Y), (y = 0)));
              },
              add_listener: function (Y, ia, ta) {
                D[Y].push({ sb: ia, Mn: "undefined" === typeof ta ? !1 : ta });
                return Ca;
              },
              remove_listener: function (Y) {
                D[Y].splice(0, D[Y].length);
                return Ca;
              },
              animate_swipe: function (Y, ia) {
                r && (clearInterval(r), (r = null));
                p();
                var ta = (M.width / (ia / 1e3)) * ("left" === Y ? -1 : 1),
                  Ya = 0,
                  hb,
                  Ta = Date.now();
                r = setInterval(function () {
                  r &&
                    ((hb = Date.now()),
                    (Ya += ((hb - Ta) / 1e3) * ta),
                    l(Ya),
                    (Ta = hb),
                    Math.abs(Ya) > 0.75 * M.width &&
                      r &&
                      (clearInterval(r), (r = null), h()));
                }, 16);
              },
            };
          return Ca;
        })();
      window.CanvasListeners = Fb;
      var ea = { VERSION: "4.9.1", ready: !1, isBusy: !1 },
        cb = {
          idealWidth: 800,
          idealHeight: 600,
          minWidth: 480,
          maxWidth: 1280,
          minHeight: 480,
          maxHeight: 1280,
          FOVdesktop: 60,
          rotate: 0,
          FOVmobile: 60,
          FOVforced: 0,
          Fe: 80,
          Ee: 5e3,
        },
        K = Object.assign(
          {},
          {
            Lc: !0,
            Wd: "models3D",
            Vd: "materials",
            Qo: "tweakers",
            neuralNetworkPath: "built/jeefitNNC_74_0.json",
            neuralNetworkVersion: "74_0",
            ea: "",
            wa: "",
            ad: "",
            Ca: 0,
            rk: 20,
            width: 1024,
            height: 1024,
            yi: !0,
            un: [2, 3.5],
            ij: 300,
            bd: [1, 6],
            scanOverlapFactors: [1.4, 1.4, 3],
            scanNScaleLevels: 2,
            scanScale0Factor: 0.5,
            ta: [0.2, 0.2, 0.3],
            oc: [
              [0.8, 0.5],
              [0.8, 0.5],
              [1, 1],
            ],
            No: 30,
            ol: 1,
            En: [0.35, 0.7],
            Dn: 1,
            Oo: [0.01, 0.035],
            Vn: [0.003, 0.007],
            Mg: [0, 0.6],
            Ml: 0.2,
            Ra: [1 / 0.698111, 1 / 1.047166, 1 / 0.122169],
            Pj: [-0.1, 0, 0],
            ce: [0, -62, 8],
            zn: 1.03,
            Ha: [0, -60, 0],
            ag: 48,
            Po: 0.2,
            bg: 20,
            Cc: 0.4,
            jf: 73,
            Ie: [0.033, 1],
            pk: [4, 1],
            Vk: [0, 0.5],
            Xn: 0.05,
            Un: 1,
            Qn: [1, 4.5],
            ep: 20,
            Qp: !1,
            Gc: 145,
            Af: -18,
            yf: 20,
            zf: 3,
            Oc: [-110, 0],
            jc: 1,
            Ej: 0.4,
            Fj: 3,
            me: [0, 0, 0],
            kc: [1.1, 1],
            od: 0,
            Ze: 0.95,
            Ye: 90,
            Xe: 50,
            gd: 25,
            Mb: 0.1,
            wf: !0,
            Sd: !0,
            Sf: "images/masks/target.jpg",
            Tf: !1,
            Rd: [1 / 255, 175 / 255, 236 / 255, 0],
            Td: -0.001,
            Rf: 3.14,
            Me: 0,
            Le: "images/masks/burka.png",
            Je: Math.PI - Math.PI / 4,
            We: Math.PI / 4,
            qg: [0.3, 0.2, 0.1],
            Zb: !0,
            Gi: [700, 90],
            $m: [0.2, 0.04],
            fp: "images/backgrounds/viewer3D.png",
            dh: [0, 0, 0],
            bh: [0, 15, 60],
            Ce: 0.3,
            np: 50,
            jp: vd ? Ka : !1,
            kp: vd ? Ka : !1,
            mp: 1e3,
            pp: 1e3,
            lp: 40,
            ip: [0, 0, -400],
            Ji: 0.1,
            dn: 0.5,
            Ki: [0.5, 1.5],
            Ud: 30,
            cn: !0,
          }
        );
      W.zh = !0;
      W.Ah = !0;
      W.yh = !1;
      W.Qa = !0;
      var eb = {
        ee: 3.5,
        Db: "images/debug/picsou.png",
        Tc: 45,
        Pf: 0.785,
        Qf: 0.3925,
        Pd: 5,
        Od: 2,
        Of: 0,
        Nf: 0,
        gp: "images/backgrounds/bg1.jpg",
        hp: "images/backgrounds/bg1_light.jpg",
        ck: 1,
        dk: 2,
      };
      K.fx = [4, 50];
      K.Oc = [-110, 0];
      K.Ej = 0.2;
      K.Fj = 3;
      K.me = [0, -2, 20];
      K.kc = [0.85, 1];
      W.Rc = 2.1289;
      W.kg = 1;
      eb.ee = 2.5858;
      eb.Pf = 0.4388;
      eb.Qf = 0.118;
      eb.Db = "images/debug/hdri2.png";
      eb.Tc = 180;
      eb.tg = 0.8065;
      eb.Pd = 5.3887;
      eb.Od = 0.5351;
      eb.Of = -0.3019;
      eb.Nf = 0;
      eb.ck = 3.5288;
      eb.dk = 6.2168;
      var nd = {
          element: null,
          Lh: null,
          Md: !1,
          wh: null,
          V: null,
          Sg: null,
          deviceId: -1,
          kf: -1,
          ud: 0,
          $i: null,
          Be: -1,
        },
        Ha = Object.assign({}, nd),
        Tb = null,
        Dc = [],
        Fc = [],
        Rc = null,
        Wc = null,
        Sc = null,
        ab = null,
        wd = K.un,
        xd = window.devicePixelRatio || 1;
      var Cc = { Ll: Math.max(wd[0] / xd, 1), gf: Math.min(xd, wd[1]) };
      var ib = null;
      ea.onLoad = function (a) {
        ea.ready ? a() : Dc.push(a);
      };
      ea.onHalfLoad = function (a) {
        ea.load_model ? a() : Fc.push(a);
      };
      ea.onWebcamAsk = function (a) {
        Rc = a;
      };
      ea.onContextLost = function (a) {
        Wc = a;
      };
      ea.onWebcamGet = function (a) {
        Sc = a;
      };
      ea.get_onHalfLoadCallstack = function () {
        return Fc;
      };
      ea.set_size = function (a, b, d) {
        d = d ? Cc.gf : 1;
        K.width = a * d;
        K.height = b * d;
      };
      ea.get_videoDevices = function (a) {
        id(a);
      };
      ea.set_videoDevice = function (a) {
        Ha.deviceId = a;
      };
      ea.set_videoSizes = function (a, b, d, f, l, p) {
        cb.idealWidth = a;
        cb.idealHeight = b;
        cb.minWidth = d;
        cb.maxWidth = f;
        cb.minHeight = l;
        cb.maxHeight = p;
      };
      ea.set_loading = function (a, b, d) {
        a && ((K.Tf = !0), (K.Sf = a));
        "number" === typeof b && ((a = new ec(b)), (K.Rd = [a.r, a.Z, a.b, 0]));
        "number" === typeof d && (K.Td = d);
      };
      ea.set_settings = function (a, b, d) {
        a && Object.assign(K, a);
        b && Object.assign(cb, b);
        d && Object.assign(eb, d);
      };
      ea.get_size = function () {
        return { width: K.width, height: K.height };
      };
      ea.get_cv = function () {
        return ob.tb();
      };
      ea.set_NNCPath = function (a) {
        K.ad = a;
      };
      ea.set_materialsPath = function (a) {
        K.Vd = a;
      };
      ea.set_modelsPath = function (a) {
        K.Wd = a;
      };
      ea.destroy = function () {
        return ib ? ib.A() : Promise.resolve();
      };
      ea.update_lightSettings = function (a) {
        a = Object.assign(
          {
            screenTextureURL: null,
            screenLuminosity: -1,
            lightDirFactor: -1,
            lightAmbFactor: -1,
            screenWidthAngle: -1,
          },
          a
        );
        0 <= a.lightDirFactor && (eb.Pd = a.lightDirFactor);
        0 <= a.lightAmbFactor && (eb.Od = a.lightAmbFactor);
        0 <= a.screenLuminosity && (eb.ee = a.screenLuminosity);
        0 <= a.screenWidthAngle && (eb.Tc = a.screenWidthAngle);
        a.screenTextureURL && (eb.Db = a.screenTextureURL);
        ea.ready && (ib.Lj(), ya.La.oh(Ha.V));
      };
      ea.preFetch = function (a, b) {
        b = b || [];
        b.push(md(a));
        b.forEach(Od);
      };
      ea.check_isMobile = nc;
      ea.init2 = function (a) {
        var b = Object.assign(
          {
            basePath: null,
            modelsPath: null,
            materialsPath: null,
            materialTextureBasePath: null,
            NNCPath: null,
            cv: null,
            isRequestCamera: !0,
            width: 512,
            height: 512,
            isMirror: !0,
            isApplyOverSampling: !1,
            scanOverlapFactors: null,
            scanNScaleLevels: null,
            scanScale0Factor: null,
            callbackReady: null,
          },
          a
        );
        K.Lc = b.isRequestCamera;
        ea.set_size(b.width, b.height, b.isApplyOverSampling);
        ea.update_lightSettings(a);
        b.modelsPath && (K.Wd = b.modelsPath);
        b.materialsPath && (K.Vd = b.materialsPath);
        b.materialTextureBasePath && (W.Mi = b.materialTextureBasePath);
        b.NNCPath && (K.ad = b.NNCPath);
        K.scanOverlapFactors = b.scanOverlapFactors || K.scanOverlapFactors;
        K.scanNScaleLevels = b.scanNScaleLevels || K.scanNScaleLevels;
        K.scanScale0Factor = b.scanScale0Factor || K.scanScale0Factor;
        K.yi = b.isMirror;
        return new Promise(function (d, f) {
          ea.onHalfLoad(d);
          ea.init(
            b.basePath,
            function () {
              b.callbackReady && b.callbackReady();
            },
            f,
            b.cv
          );
        });
      };
      ea.init = function (a, b, d, f) {
        ib = Kd();
        Tb = d
          ? function (l, p) {
              d(l, p);
              Tb = null;
            }
          : function () {};
        a && (K.ea = a);
        b && Dc.push(b);
        ib.Lj();
        a = ib.gm();
        return ob.m({
          Ve: "jeefitCanvas",
          sa: f,
          width: a.width,
          height: a.height,
          debug: !1,
          eg: function () {
            Wc && Wc();
          },
          premultipliedAlpha: !0,
        })
          ? K.Lc
            ? od()
            : Pd()
          : (Tb && Tb("GL_INCOMPATIBLE", "Cannot init Context"), !1);
      };
      ea.request_cameraVideoStream = function () {
        return od().then(function () {
          ib.Nl(K.width, K.height, 0);
        });
      };
      window.JEELIZVTO = ea;
      var kd = (function () {
          function a() {
            Fa.aa();
            c.viewport(0, 0, 1, 1);
            aa.set("s74");
            f.h(0);
            X.l(!1);
            c.readPixels(0, 0, 1, 1, c.RGBA, c.UNSIGNED_BYTE, p);
            b(0 < p[0]);
          }
          var b = null,
            d = !1,
            f = null,
            l = !1,
            p = null,
            u = {
              m: function (h) {
                if (l) return !1;
                f = h;
                aa.uc([
                  {
                    id: "s74",
                    name: "_",
                    g: "uniform sampler2D u42;const vec2 e=vec2(.16,.5);void main(){vec4 a=texture2D(u42,e);float b=step(1.99,a.r);gl_FragColor=vec4(b,0.,0.,1.);}",
                    i: ["u42"],
                    precision: "lowp",
                  },
                ]);
                aa.j("s74", [{ type: "1i", name: "u42", value: 0 }]);
                p = new Uint8Array(4);
                return (l = !0);
              },
              start: function (h, m) {
                u.stop();
                b = m;
                d = window.setInterval(a, h);
              },
              stop: function () {
                d && (window.clearInterval(a), (d = !1));
              },
            };
          return u;
        })(),
        Xc = {};
      ec.prototype = {
        constructor: ec,
        r: 1,
        Z: 1,
        b: 1,
        set: function (a) {
          a instanceof ec
            ? this.N(a)
            : "number" === typeof a
            ? qd(this, a)
            : "string" === typeof a && Qd(this, a);
          return this;
        },
        $n: (function () {
          function a(b, d, f) {
            0 > f && (f += 1);
            1 < f && --f;
            return f < 1 / 6
              ? b + 6 * (d - b) * f
              : 0.5 > f
              ? d
              : f < 2 / 3
              ? b + 6 * (d - b) * (2 / 3 - f)
              : b;
          }
          return function (b, d, f) {
            b = Xc.Math.Sp(b, 1);
            d = Xc.Math.Qe(d, 0, 1);
            f = Xc.Math.Qe(f, 0, 1);
            0 === d
              ? (this.r = this.Z = this.b = f)
              : ((d = 0.5 >= f ? f * (1 + d) : f + d - f * d),
                (f = 2 * f - d),
                (this.r = a(f, d, b + 1 / 3)),
                (this.Z = a(f, d, b)),
                (this.b = a(f, d, b - 1 / 3)));
            return this;
          };
        })(),
        clone: function () {
          return new this.constructor(this.r, this.Z, this.b);
        },
        N: function (a) {
          this.r = a.r;
          this.Z = a.Z;
          this.b = a.b;
          return this;
        },
        add: function (a) {
          this.r += a.r;
          this.Z += a.Z;
          this.b += a.b;
          return this;
        },
        multiply: function (a) {
          this.r *= a.r;
          this.Z *= a.Z;
          this.b *= a.b;
          return this;
        },
        Fa: function (a) {
          this.r *= a;
          this.Z *= a;
          this.b *= a;
          return this;
        },
        rb: function (a, b) {
          void 0 === b && (b = 0);
          this.r = a[b];
          this.Z = a[b + 1];
          this.b = a[b + 2];
          return this;
        },
      };
      var Rd = {};
      Gc.prototype = {
        constructor: Gc,
        get x() {
          return this.F;
        },
        set x(a) {
          this.F = a;
        },
        get y() {
          return this.G;
        },
        set y(a) {
          this.G = a;
        },
        get z() {
          return this.H;
        },
        set z(a) {
          this.H = a;
        },
        get w() {
          return this.T;
        },
        set w(a) {
          this.T = a;
        },
        set: function (a, b, d, f) {
          this.F = a;
          this.G = b;
          this.H = d;
          this.T = f;
          return this;
        },
        clone: function () {
          return new this.constructor(this.F, this.G, this.H, this.T);
        },
        N: function (a) {
          this.F = a.x;
          this.G = a.y;
          this.H = a.z;
          this.T = a.w;
          return this;
        },
        inverse: function () {
          this.F *= -1;
          this.G *= -1;
          this.H *= -1;
          this.normalize();
          return this;
        },
        qd: function (a) {
          return this.F * a.F + this.G * a.G + this.H * a.H + this.T * a.T;
        },
        Lf: function () {
          return (
            this.F * this.F +
            this.G * this.G +
            this.H * this.H +
            this.T * this.T
          );
        },
        length: function () {
          return Math.sqrt(
            this.F * this.F +
              this.G * this.G +
              this.H * this.H +
              this.T * this.T
          );
        },
        normalize: function () {
          var a = this.length();
          0 === a
            ? ((this.H = this.G = this.F = 0), (this.T = 1))
            : ((a = 1 / a),
              (this.F *= a),
              (this.G *= a),
              (this.H *= a),
              (this.T *= a));
          return this;
        },
        multiply: function (a, b) {
          return void 0 !== b
            ? (console.warn(
                "JETHREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."
              ),
              rd(this, a, b))
            : rd(this, this, a);
        },
        rb: function (a, b) {
          void 0 === b && (b = 0);
          this.F = a[b];
          this.G = a[b + 1];
          this.H = a[b + 2];
          this.T = a[b + 3];
          return this;
        },
      };
      fc.prototype = {
        constructor: fc,
        get width() {
          return this.x;
        },
        set width(a) {
          this.x = a;
        },
        get height() {
          return this.y;
        },
        set height(a) {
          this.y = a;
        },
        set: function (a, b) {
          this.x = a;
          this.y = b;
          return this;
        },
        nj: function (a) {
          this.x = a;
          return this;
        },
        oj: function (a) {
          this.y = a;
          return this;
        },
        clone: function () {
          return new this.constructor(this.x, this.y);
        },
        N: function (a) {
          this.x = a.x;
          this.y = a.y;
          return this;
        },
        add: function (a, b) {
          if (void 0 !== b)
            return (
              console.warn(
                "JETHREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."
              ),
              this.dd(a, b)
            );
          this.x += a.x;
          this.y += a.y;
          return this;
        },
        dd: function (a, b) {
          this.x = a.x + b.x;
          this.y = a.y + b.y;
          return this;
        },
        sub: function (a, b) {
          if (void 0 !== b)
            return (
              console.warn(
                "JETHREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."
              ),
              this.gb(a, b)
            );
          this.x -= a.x;
          this.y -= a.y;
          return this;
        },
        gb: function (a, b) {
          this.x = a.x - b.x;
          this.y = a.y - b.y;
          return this;
        },
        multiply: function (a) {
          this.x *= a.x;
          this.y *= a.y;
          return this;
        },
        Fa: function (a) {
          isFinite(a) ? ((this.x *= a), (this.y *= a)) : (this.y = this.x = 0);
          return this;
        },
        bf: function (a) {
          return this.Fa(1 / a);
        },
        min: function (a) {
          this.x = Math.min(this.x, a.x);
          this.y = Math.min(this.y, a.y);
          return this;
        },
        max: function (a) {
          this.x = Math.max(this.x, a.x);
          this.y = Math.max(this.y, a.y);
          return this;
        },
        Qe: function (a, b) {
          this.x = Math.max(a.x, Math.min(b.x, this.x));
          this.y = Math.max(a.y, Math.min(b.y, this.y));
          return this;
        },
        floor: function () {
          this.x = Math.floor(this.x);
          this.y = Math.floor(this.y);
          return this;
        },
        ceil: function () {
          this.x = Math.ceil(this.x);
          this.y = Math.ceil(this.y);
          return this;
        },
        round: function () {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
        },
        qd: function (a) {
          return this.x * a.x + this.y * a.y;
        },
        Lf: function () {
          return this.x * this.x + this.y * this.y;
        },
        length: function () {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        normalize: function () {
          return this.bf(this.length());
        },
        rb: function (a, b) {
          void 0 === b && (b = 0);
          this.x = a[b];
          this.y = a[b + 1];
          return this;
        },
      };
      Wa.prototype = {
        constructor: Wa,
        set: function (a, b, d) {
          this.x = a;
          this.y = b;
          this.z = d;
          return this;
        },
        nj: function (a) {
          this.x = a;
          return this;
        },
        oj: function (a) {
          this.y = a;
          return this;
        },
        clone: function () {
          return new this.constructor(this.x, this.y, this.z);
        },
        N: function (a) {
          this.x = a.x;
          this.y = a.y;
          this.z = a.z;
          return this;
        },
        add: function (a, b) {
          if (void 0 !== b)
            return (
              console.warn(
                "JETHREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."
              ),
              this.dd(a, b)
            );
          this.x += a.x;
          this.y += a.y;
          this.z += a.z;
          return this;
        },
        dd: function (a, b) {
          this.x = a.x + b.x;
          this.y = a.y + b.y;
          this.z = a.z + b.z;
          return this;
        },
        sub: function (a, b) {
          if (void 0 !== b)
            return (
              console.warn(
                "JETHREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."
              ),
              this.gb(a, b)
            );
          this.x -= a.x;
          this.y -= a.y;
          this.z -= a.z;
          return this;
        },
        gb: function (a, b) {
          this.x = a.x - b.x;
          this.y = a.y - b.y;
          this.z = a.z - b.z;
          return this;
        },
        multiply: function (a, b) {
          if (void 0 !== b)
            return (
              console.warn(
                "JETHREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."
              ),
              (this.x = a.x * b.x),
              (this.y = a.y * b.y),
              (this.z = a.z * b.z),
              this
            );
          this.x *= a.x;
          this.y *= a.y;
          this.z *= a.z;
          return this;
        },
        Fa: function (a) {
          isFinite(a)
            ? ((this.x *= a), (this.y *= a), (this.z *= a))
            : (this.z = this.y = this.x = 0);
          return this;
        },
        bf: function (a) {
          return this.Fa(1 / a);
        },
        min: function (a) {
          this.x = Math.min(this.x, a.x);
          this.y = Math.min(this.y, a.y);
          this.z = Math.min(this.z, a.z);
          return this;
        },
        max: function (a) {
          this.x = Math.max(this.x, a.x);
          this.y = Math.max(this.y, a.y);
          this.z = Math.max(this.z, a.z);
          return this;
        },
        Qe: function (a, b) {
          this.x = Math.max(a.x, Math.min(b.x, this.x));
          this.y = Math.max(a.y, Math.min(b.y, this.y));
          this.z = Math.max(a.z, Math.min(b.z, this.z));
          return this;
        },
        floor: function () {
          this.x = Math.floor(this.x);
          this.y = Math.floor(this.y);
          this.z = Math.floor(this.z);
          return this;
        },
        ceil: function () {
          this.x = Math.ceil(this.x);
          this.y = Math.ceil(this.y);
          this.z = Math.ceil(this.z);
          return this;
        },
        round: function () {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          this.z = Math.round(this.z);
          return this;
        },
        qd: function (a) {
          return this.x * a.x + this.y * a.y + this.z * a.z;
        },
        Lf: function () {
          return this.x * this.x + this.y * this.y + this.z * this.z;
        },
        length: function () {
          return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        normalize: function () {
          return this.bf(this.length());
        },
        rb: function (a, b) {
          void 0 === b && (b = 0);
          this.x = a[b];
          this.y = a[b + 1];
          this.z = a[b + 2];
          return this;
        },
      };
      gc.fk = "XYZ";
      gc.prototype = {
        constructor: gc,
        get x() {
          return this.F;
        },
        set x(a) {
          this.F = a;
        },
        get y() {
          return this.G;
        },
        set y(a) {
          this.G = a;
        },
        get z() {
          return this.H;
        },
        set z(a) {
          this.H = a;
        },
        get order() {
          return this.Ta;
        },
        set order(a) {
          this.Ta = a;
        },
        set: function (a, b, d, f) {
          this.F = a;
          this.G = b;
          this.H = d;
          this.Ta = f || this.Ta;
          return this;
        },
        clone: function () {
          return new this.constructor(this.F, this.G, this.H, this.Ta);
        },
        N: function (a) {
          this.F = a.F;
          this.G = a.G;
          this.H = a.H;
          this.Ta = a.Ta;
          return this;
        },
        rb: function (a) {
          this.F = a[0];
          this.G = a[1];
          this.H = a[2];
          void 0 !== a[3] && (this.Ta = a[3]);
          return this;
        },
      };
      Tc.prototype = {
        constructor: Tc,
        set: function (a, b) {
          this.min.N(a);
          this.max.N(b);
          return this;
        },
        clone: function () {
          return new this.constructor().N(this);
        },
        N: function (a) {
          this.min.N(a.min);
          this.max.N(a.max);
          return this;
        },
        empty: function () {
          return (
            this.max.x < this.min.x ||
            this.max.y < this.min.y ||
            this.max.z < this.min.z
          );
        },
        size: function (a) {
          return (a || new Wa()).gb(this.max, this.min);
        },
        getParameter: function (a, b) {
          return (b || new Wa()).set(
            (a.x - this.min.x) / (this.max.x - this.min.x),
            (a.y - this.min.y) / (this.max.y - this.min.y),
            (a.z - this.min.z) / (this.max.z - this.min.z)
          );
        },
        translate: function (a) {
          this.min.add(a);
          this.max.add(a);
          return this;
        },
      };
      hc.prototype = {
        constructor: hc,
        set: function (a, b, d, f, l, p, u, h, m, q, v, J, t, x, z, k) {
          var g = this.elements;
          g[0] = a;
          g[4] = b;
          g[8] = d;
          g[12] = f;
          g[1] = l;
          g[5] = p;
          g[9] = u;
          g[13] = h;
          g[2] = m;
          g[6] = q;
          g[10] = v;
          g[14] = J;
          g[3] = t;
          g[7] = x;
          g[11] = z;
          g[15] = k;
          return this;
        },
        clone: function () {
          return new hc().rb(this.elements);
        },
        N: function (a) {
          this.elements.set(a.elements);
          return this;
        },
        multiply: function (a, b) {
          return void 0 !== b
            ? (console.warn(
                "JETHREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."
              ),
              td(this, a, b))
            : td(this, this, a);
        },
        Fa: function (a) {
          var b = this.elements;
          b[0] *= a;
          b[4] *= a;
          b[8] *= a;
          b[12] *= a;
          b[1] *= a;
          b[5] *= a;
          b[9] *= a;
          b[13] *= a;
          b[2] *= a;
          b[6] *= a;
          b[10] *= a;
          b[14] *= a;
          b[3] *= a;
          b[7] *= a;
          b[11] *= a;
          b[15] *= a;
          return this;
        },
        setPosition: function (a) {
          var b = this.elements;
          b[12] = a.x;
          b[13] = a.y;
          b[14] = a.z;
          return this;
        },
        translate: function () {
          console.error("JETHREE.Matrix4: .translate() has been removed.");
        },
        scale: function (a) {
          var b = this.elements,
            d = a.x,
            f = a.y;
          a = a.z;
          b[0] *= d;
          b[4] *= f;
          b[8] *= a;
          b[1] *= d;
          b[5] *= f;
          b[9] *= a;
          b[2] *= d;
          b[6] *= f;
          b[10] *= a;
          b[3] *= d;
          b[7] *= f;
          b[11] *= a;
          return this;
        },
        rb: function (a) {
          this.elements.set(a);
          return this;
        },
      };
      Uc.prototype = {
        constructor: Uc,
        clone: function () {
          return new this.constructor().N(this);
        },
        N: function (a) {
          this.a = a.a;
          this.b = a.b;
          this.c = a.c;
          this.Ga.N(a.Ga);
          this.color.N(a.color);
          this.$b = a.$b;
          for (var b = 0, d = a.Ae.length; b < d; b++)
            this.Ae[b] = a.Ae[b].clone();
          b = 0;
          for (d = a.$g.length; b < d; b++) this.$g[b] = a.$g[b].clone();
          return this;
        },
      };
      var C = (function () {
          function a(e, n, y) {
            n = e.createShader(n);
            e.shaderSource(n, y);
            e.compileShader(n);
            return e.getShaderParameter(n, e.COMPILE_STATUS) ? n : !1;
          }
          function b(e, n) {
            ha.na() && (n.g = n.g.replace(/gl_FragData\[([0-3])\]/g, "gbuf$1"));
            n.vf = a(e, e.VERTEX_SHADER, n.v, n.name + " VERTEX");
            n.uf = a(e, e.FRAGMENT_SHADER, n.g, n.name + " FRAGMENT");
            var y = e.createProgram();
            e.attachShader(y, n.vf);
            e.attachShader(y, n.uf);
            e.linkProgram(y);
            return y;
          }
          function d(e) {
            e.v = "#version 300 es\n" + e.v.replace(/varying/g, "out");
            e.g = "#version 300 es\n" + e.g.replace(/varying/g, "in");
            e.v = e.v.replace(/texture2D\(/g, "texture(");
            e.g = e.g.replace(/texture2D\(/g, "texture(");
            e.fa ||
              ((e.g = e.g.replace(
                /void main/g,
                "out vec4 FragColor;\nvoid main"
              )),
              (e.g = e.g.replace(/gl_FragColor/g, "FragColor")));
            var n = 0,
              y = [];
            e.v = e.v.replace(
              /attribute ([a-z]+[0-4]*) ([_a-zA-Z,0-9\s]+);/g,
              function (Q, B, A) {
                var O = "";
                A.split(",").forEach(function (G) {
                  G = G.trim();
                  O += "layout(location = " + n + ") in " + B + " " + G + ";\n";
                  y.push(G);
                  ++n;
                });
                return O;
              }
            );
            e.kk = y;
          }
          function f(e) {
            return ["float", "sampler2D", "int"]
              .map(function (n) {
                return "precision " + e + " " + n + ";\n";
              })
              .join("");
          }
          function l(e, n) {
            if (n.pi) return !1;
            var y = ha.na();
            W.mq || y || e.enableVertexAttribArray(0);
            void 0 === n.fa && (n.fa = !1);
            n.fa && (n.cd = y ? 3 : 2);
            n.id = M++;
            void 0 === n.cd && (n.cd = 2);
            void 0 === n.precision && (n.precision = D.high);
            n.fa &&
              (n.g =
                (ha.na()
                  ? "precision highp float;\n          layout(location = 0) out vec4 gbuf0;\n          layout(location = 1) out vec4 gbuf1;\n          layout(location = 2) out vec4 gbuf2;\n          layout(location = 3) out vec4 gbuf3;\n"
                  : "#extension GL_EXT_draw_buffers : require\n") + n.g);
            void 0 === n.v &&
              (n.v =
                "precision lowp float;attribute vec2 a0;varying vec2 vv0;void main(){gl_Position=vec4(a0,0.,1.),vv0=a0*.5+vec2(.5,.5);}");
            var Q = f(n.precision);
            n.g = Q + n.g;
            n.v = Q + n.v;
            y && 3 <= n.cd && d(n);
            n.Ia &&
              n.Ia.forEach(function (B) {
                n.v = n.v.replace(B.search, B.replace);
                n.g = n.g.replace(B.search, B.replace);
              });
            n.qa = b(e, n);
            n.B = {};
            n.i.forEach(function (B) {
              n.B[B] = e.getUniformLocation(n.qa, B);
            });
            n.attributes = {};
            n.xa = [];
            n.Zg = 0;
            void 0 === n.K && (n.K = ["a0"]);
            void 0 === n.S && (n.S = [2]);
            n.K.forEach(function (B, A) {
              var O =
                y && 3 <= n.cd ? n.kk.indexOf(B) : e.getAttribLocation(n.qa, B);
              n.attributes[B] = O;
              n.xa.push(O);
              n.Zg += 4 * n.S[A];
            });
            n.set = function () {
              g !== n.id &&
                (-1 !== g && E.M(),
                (g = n.id),
                (E = n),
                e.useProgram(n.qa),
                n.xa.forEach(function (B) {
                  0 !== B && e.enableVertexAttribArray(B);
                }));
            };
            n.M = function () {
              g = -1;
              n.xa.forEach(function (B) {
                0 !== B && e.disableVertexAttribArray(B);
              });
            };
            n.pi = !0;
          }
          function p(e, n) {
            l(e, n);
            n.set();
            g = -1;
            return n;
          }
          function u() {
            return {
              name: "_",
              g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
              i: ["u1"],
              precision: D.high,
            };
          }
          function h() {
            F.j("s107", [{ type: "1i", name: "u1", value: 0 }]);
            F.j("s108", [{ type: "1i", name: "u161", value: 0 }]);
            F.j("s109", [{ type: "1i", name: "u81", value: 0 }]);
          }
          function m() {
            var e = "u42 u152 u153 u154 u155 u43 u86".split(" ").concat(x, z);
            k.s110 = {
              name: "_",
              g: "varying vec3 vv0;varying float vv1;void main(){gl_FragColor=vec4(vv0,vv1);}",
              v: "attribute vec3 a0;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec3 vv0;varying float vv1;const vec2 e=vec2(1.);const vec3 o=vec3(1.);const vec2 D=vec2(-1.,1.),p=vec2(.16,.5),q=vec2(.5,.5),r=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 s(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,p);vec2 f=u93*e;vec3 c=u93*o;vec2 t=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,q).rgb+vec3(u87,0.,0.),u90,c);float u=mix(texture2D(u42,r).r,0.,u93);a.z+=u;mat3 v=s(a);vec3 w=mix(u152,u91,c);float x=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 y=mat2(h,i,-i,h);b.xy=y*b.xy;float z=mix(u89,1.,u93);vec2 j=u88/t;vec3 k=a0;float A=max(0.,-a0.z-u154)*u155;k.x+=A*sign(a0.x)*(1.-u93);vec3 l=v*(k+w)*x+b;vec2 B=j*z;vec3 C=vec3(g*B,-j)+l*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(C,1.)),vv0=l,vv1=smoothstep(u158,u159,a0.z);}",
              i: ["u158", "u159"].concat(e),
              K: ["a0"],
              precision: D.high,
            };
            k.s111 = {
              name: "_",
              g: "uniform sampler2D u1;uniform vec3 u156,u77;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0);vec3 f=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,f,u77.x);float c=a.a,g=dot(a.rgb,vec3(.333)),d=1.-u77.y*g;c*=d;float h=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(h),b,vec3(d));vec3 i=u77.z*vec3(.25);b=max(b,i);vec4 j=vec4(b,c);gl_FragColor=j;}",
              v: "attribute vec3 a0;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;varying vec2 vv0;const vec2 e=vec2(1.);const vec3 m=vec3(1.);const vec2 C=vec2(-1.,1.),n=vec2(.16,.5),o=vec2(.5,.5),p=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 q(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,n);vec2 f=u93*e;vec3 c=u93*m;vec2 r=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,o).rgb+vec3(u87,0.,0.),u90,c);float s=mix(texture2D(u42,p).r,0.,u93);a.z+=s;mat3 t=q(a);vec3 u=mix(u152,u91,c);float v=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 w=mat2(h,i,-i,h);b.xy=w*b.xy;float x=mix(u89,1.,u93);vec2 j=u88/r;vec3 k=a0;float y=max(0.,-a0.z-u154)*u155;k.x+=y*sign(a0.x)*(1.-u93);vec3 z=t*(k+u)*v+b;vec2 A=j*x;vec3 B=vec3(g*A,-j)+z*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(B,1.)),vv0=a1;}",
              i: ["u156"].concat(J, e),
              K: ["a0", "a1"],
              S: [3, 2],
              precision: D.low,
            };
            k.s112 = {
              name: "_",
              g: "uniform vec3 u156;void main(){gl_FragColor=vec4(u156,1.);}",
              v: "attribute vec3 a0;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;const vec2 e=vec2(1.);const vec3 l=vec3(1.);const vec2 B=vec2(-1.,1.),m=vec2(.16,.5),n=vec2(.5,.5),o=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 p(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,m);vec2 f=u93*e;vec3 c=u93*l;vec2 q=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,n).rgb+vec3(u87,0.,0.),u90,c);float r=mix(texture2D(u42,o).r,0.,u93);a.z+=r;mat3 s=p(a);vec3 t=mix(u152,u91,c);float u=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 v=mat2(h,i,-i,h);b.xy=v*b.xy;float w=mix(u89,1.,u93);vec2 j=u88/q;vec3 k=a0;float x=max(0.,-a0.z-u154)*u155;k.x+=x*sign(a0.x)*(1.-u93);vec3 y=s*(k+t)*u+b;vec2 z=j*w;vec3 A=vec3(g*z,-j)+y*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(A,1.));}",
              i: ["u156"].concat(e),
              S: [3],
              precision: D.low,
            };
            k.s113 = {
              name: "_",
              g: "uniform vec4 u14;varying vec3 vv0;varying float vv1;void main(){float a=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv1);gl_FragColor=vec4(normalize(vv0),a);}",
              v: "attribute vec3 a0,a2;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;varying vec3 vv0;varying float vv1;const vec2 e=vec2(1.);const vec3 o=vec3(1.);const vec2 D=vec2(-1.,1.),p=vec2(.16,.5),q=vec2(.5,.5),r=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 s(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,p);vec2 f=u93*e;vec3 c=u93*o;vec2 t=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,q).rgb+vec3(u87,0.,0.),u90,c);float u=mix(texture2D(u42,r).r,0.,u93);a.z+=u;mat3 h=s(a);vec3 v=mix(u152,u91,c);float w=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 x=mat2(i,j,-j,i);b.xy=x*b.xy;float y=mix(u89,1.,u93);vec2 k=u88/t;vec3 l=a0;float z=max(0.,-a0.z-u154)*u155;l.x+=z*sign(a0.x)*(1.-u93);vec3 A=h*(l+v)*w+b;vec2 B=k*y;vec3 C=vec3(g*B,-k)+A*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(C,1.)),vv0=h*a2*vec3(1.,-1.,-1.),vv1=a0.y;}",
              i: ["u14", "u86"].concat(e),
              K: ["a0", "a2"],
              precision: D.high,
            };
            k.s114 = {
              name: "_",
              g: "uniform sampler2D u161;uniform vec4 u14;varying vec4 vv0;varying vec3 vv1;varying vec2 vv2;varying float vv3;const vec3 i=vec3(1.,1.,1.);void main(){vec3 j=vec3(0.,0.,-1.),c=normalize(vv1),b=texture2D(u161,vv2).xyz;b=normalize(b*255./127.-1.007874*i);vec3 d=vv0.xyz,k=cross(c,d)*vv0.w;mat3 l=mat3(d,k,c);vec3 a=l*b;a=dot(a,j)>0.?vv1:a;float m=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv3);gl_FragColor=vec4(a,m);}",
              v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;varying vec4 vv0;varying vec3 vv1;varying vec2 vv2;varying float vv3;const vec2 e=vec2(1.);const vec3 q=vec3(1.);const vec2 F=vec2(-1.,1.),r=vec2(.16,.5),s=vec2(.5,.5),t=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 u(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,r);vec2 f=u93*e;vec3 c=u93*q;vec2 v=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,s).rgb+vec3(u87,0.,0.),u90,c);float w=mix(texture2D(u42,t).r,0.,u93);a.z+=w;mat3 h=u(a);vec3 x=mix(u152,u91,c);float y=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 z=mat2(i,j,-j,i);b.xy=z*b.xy;float A=mix(u89,1.,u93);vec2 k=u88/v;vec3 l=a0;float B=max(0.,-a0.z-u154)*u155;l.x+=B*sign(a0.x)*(1.-u93);vec3 C=h*(l+x)*y+b;vec2 D=k*A;vec3 E=vec3(g*D,-k)+C*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(E,1.)),vv1=h*a2*vec3(1.,-1.,-1.),vv0=a3,vv2=a1,vv3=a0.y;}",
              i: ["u14", "u86", "u161"].concat(e),
              K: ["a3", "a0", "a2", "a1"],
              S: [4, 3, 3, 2],
              precision: D.high,
            };
            k.s115 = {
              name: "_",
              g: "uniform vec4 u120;uniform float u157;void main(){float b=u157;vec4 a=u120;float c=floor(15.99*b),d=floor(15.99*a.b);a.b=(c+16.*d)/255.,gl_FragColor=a;}",
              v: "attribute vec3 a0;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;const vec2 e=vec2(1.);const vec3 l=vec3(1.);const vec2 B=vec2(-1.,1.),m=vec2(.16,.5),n=vec2(.5,.5),o=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 p(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,m);vec2 f=u93*e;vec3 c=u93*l;vec2 q=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,n).rgb+vec3(u87,0.,0.),u90,c);float r=mix(texture2D(u42,o).r,0.,u93);a.z+=r;mat3 s=p(a);vec3 t=mix(u152,u91,c);float u=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 v=mat2(h,i,-i,h);b.xy=v*b.xy;float w=mix(u89,1.,u93);vec2 j=u88/q;vec3 k=a0;float x=max(0.,-a0.z-u154)*u155;k.x+=x*sign(a0.x)*(1.-u93);vec3 y=s*(k+t)*u+b;vec2 z=j*w;vec3 A=vec3(g*z,-j)+y*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(A,1.));}",
              i: ["u120", "u157"].concat(e),
              precision: D.low,
            };
            k.s116 = {
              name: "_",
              g: "uniform sampler2D u81;uniform vec4 u120,u82;uniform float u157;varying vec2 vv0;vec2 i(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float c=u157;vec4 a=u120,d=texture2D(u81,vv0);vec2 b=i(d.b,4.);float f=1.-b.x,g=b.y;b=i(d.a,1.);float h=b.x,e=b.y;vec4 k=vec4(d.rg,g,h);float l=f;a=mix(a,k,u82*e),c=mix(c,l,u82.b*e);float m=floor(15.99*c),n=floor(15.99*a.b);a.b=(m+16.*n)/255.,gl_FragColor=a;}",
              v: "attribute vec3 a0;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u154,u155,u71;varying vec2 vv0;const vec2 e=vec2(1.);const vec3 m=vec3(1.);const vec2 C=vec2(-1.,1.),n=vec2(.16,.5),o=vec2(.5,.5),p=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 q(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,n);vec2 f=u93*e;vec3 c=u93*m;vec2 r=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,o).rgb+vec3(u87,0.,0.),u90,c);float s=mix(texture2D(u42,p).r,0.,u93);a.z+=s;mat3 t=q(a);vec3 u=mix(u152,u91,c);float v=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 w=mat2(h,i,-i,h);b.xy=w*b.xy;float x=mix(u89,1.,u93);vec2 j=u88/r;vec3 k=a0;float y=max(0.,-a0.z-u154)*u155;k.x+=y*sign(a0.x)*(1.-u93);vec3 z=t*(k+u)*v+b;vec2 A=j*x;vec3 B=vec3(g*A,-j)+z*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(B,1.)),vv0=a1;}",
              i: ["u120", "u157"].concat(t, e),
              K: ["a0", "a1"],
              S: [3, 2],
              precision: D.low,
            };
            e = ["u145", "u133", "u146"];
            k.s117 = {
              name: "_",
              g: "varying vec3 vv0;varying float vv1;void main(){gl_FragColor=vec4(vv0,vv1);}",
              v: "attribute vec3 a0;uniform mat4 u145,u133,u146;varying vec3 vv0;varying float vv1;void main(){vec4 a=u146*vec4(a0,1.);gl_Position=u145*u133*a,vv0=a.xyz,vv1=1.;}",
              i: e,
              precision: D.high,
            };
            k.s118 = {
              name: "_",
              g: "varying vec3 vv0;void main(){gl_FragColor=vec4(normalize(vv0),1.);}",
              v: "attribute vec3 a0,a2;uniform mat4 u145,u133,u146;varying vec3 vv0;varying float vv1;void main(){vec4 a=u146*vec4(a2,0.);gl_Position=u145*u133*u146*vec4(a0,1.),vv0=a.xyz,vv1=a0.y;}",
              i: e,
              K: ["a0", "a2"],
              precision: D.high,
            };
            k.s108 = {
              name: "_",
              g: "uniform sampler2D u161;uniform vec3 u162;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;const vec3 i=vec3(1.,1.,1.);void main(){vec3 j=normalize(vv1+u162),c=normalize(vv2),b=texture2D(u161,vv3).xyz;b=normalize(b*255./127.-1.007874*i);vec3 d=vv0.xyz,k=cross(c,d)*vv0.w;mat3 l=mat3(d,k,c);vec3 a=l*b;a=dot(a,j)>0.?vv2:a,gl_FragColor=vec4(a,1.);}",
              v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;void main(){vec4 b=u146*vec4(a2,0.),a=u146*vec4(a0,1.);gl_Position=u145*u133*a,vv0=a3,vv2=b.xyz,vv3=a1,vv1=a.xyz;}",
              i: ["u161", "u162"].concat(e),
              K: ["a0", "a2", "a1", "a3"],
              precision: D.high,
            };
            k.s107 = {
              name: "_",
              g: "uniform sampler2D u1;uniform vec3 u156,u77;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0);vec3 f=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,f,u77.x);float c=a.a,g=dot(a.rgb,vec3(.333)),d=1.-u77.y*g;c*=d;float h=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(h),b,vec3(d));vec3 i=u77.z*vec3(.25);b=max(b,i);vec4 j=vec4(b,c);gl_FragColor=j;}",
              v: "attribute vec3 a0;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec2 vv0;const vec4 f=vec4(0.,0.,5e-4,0.);void main(){gl_Position=u145*u133*u146*vec4(a0,1.)+f,vv0=a1;}",
              i: ["u156"].concat(J, e),
              K: ["a0", "a1"],
              Ia: [{ search: "0.0005", replace: Ia.ja() ? "0.0005" : "0.0" }],
              precision: D.low,
            };
            k.s119 = {
              name: "_",
              g: "uniform vec4 u120;uniform float u157;void main(){float b=u157;vec4 a=u120;float c=floor(15.99*b),d=floor(15.99*a.b);a.b=(c+16.*d)/255.,gl_FragColor=a;}",
              v: "attribute vec3 a0;uniform mat4 u145,u133,u146;void main(){gl_Position=u145*u133*u146*vec4(a0,1.);}",
              i: ["u120"].concat(e),
              precision: D.high,
            };
            k.s109 = {
              name: "_",
              g: "uniform sampler2D u81;uniform vec4 u120,u82;uniform float u157;varying vec2 vv0;vec2 i(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float c=u157;vec4 a=u120,d=texture2D(u81,vv0);vec2 b=i(d.b,4.);float f=1.-b.x,g=b.y;b=i(d.a,1.);float h=b.x,e=b.y;vec4 k=vec4(d.rg,g,h);float l=f;a=mix(a,k,u82*e),c=mix(c,l,u82.b*e);float m=floor(15.99*c),n=floor(15.99*a.b);a.b=(m+16.*n)/255.,gl_FragColor=a;}",
              v: "attribute vec3 a0;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec2 vv0;void main(){gl_Position=u145*u133*u146*vec4(a0,1.),vv0=a1;}",
              i: ["u120"].concat(t, e),
              K: ["a0", "a1"],
              S: [3, 2],
              precision: D.high,
            };
          }
          function q() {
            for (var e in k) l(c, k[e]);
          }
          var v = !1,
            J = ["u1", "u77"],
            t = ["u81", "u82"],
            x = "u83 u84 u85 u86 u87 u88 u89".split(" "),
            z = "u90 u91 u92 u93 u94 u95".split(" "),
            k = {},
            g = -1,
            E = null,
            M = 0,
            D = { high: "highp", yq: "mediump", low: "lowp" },
            F = {
              oa: function (e, n) {
                k[e] = n;
                v && l(c, k[e]);
              },
              Eq: function (e, n) {
                k[e] = n;
                n.pi = !1;
                l(c, k[e]);
              },
              zb: function () {
                return v;
              },
              m: function () {
                k.s0 = u();
                k.s75 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u96;uniform float u97;varying vec2 vv0;void main(){vec4 a=texture2D(u1,u96*vv0);gl_FragColor=vec4(pow(a.rgb,u97*vec3(1.)),a.a);}",
                  i: ["u1", "u97", "u96"],
                  precision: D.high,
                };
                k.s1 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
                  i: ["u1"],
                  precision: D.low,
                };
                k.s76 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vec2(-1.,1.)*vv0+vec2(1.,0.));}",
                  i: ["u1"],
                  precision: D.low,
                };
                k.s77 = {
                  name: "_",
                  g: "uniform sampler2D u1,u13;uniform float u14;varying vec2 vv0;const vec3 f=vec3(1.);void main(){gl_FragColor=vec4(mix(texture2D(u13,vv0).rgb,texture2D(u1,vv0).rgb,u14*f),1.);}",
                  i: ["u1", "u13", "u14"],
                  precision: D.high,
                };
                k.s78 = {
                  name: "_",
                  g: "uniform sampler2D u1,u13;uniform float u14;varying vec2 vv0;const vec4 f=vec4(1.,1.,1.,1.);void main(){gl_FragColor=mix(texture2D(u13,vv0),texture2D(u1,vv0),u14*f);}",
                  i: ["u1", "u13", "u14"],
                  precision: D.high,
                };
                k.s12 = {
                  name: "_",
                  g: "uniform sampler2D u1,u98;uniform vec2 u99;uniform float u100;varying vec2 vv0;const vec4 f=vec4(1.);void main(){vec4 b=texture2D(u98,vv0*u99),c=texture2D(u1,vv0*u99);float a=smoothstep(u100,0.,vv0.y);a+=smoothstep(1.-u100,1.,vv0.y),gl_FragColor=mix(c,b,a*f);}",
                  i: ["u1", "u99", "u98", "u100"],
                  precision: D.high,
                };
                k.s80 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0);if(a.a<.5)discard;gl_FragColor=a;}",
                  i: ["u1"],
                  precision: D.low,
                };
                k.s81 = {
                  name: "_",
                  g: "uniform sampler2D u1,u101;uniform vec2 u15;varying vec2 vv0;const vec2 f=vec2(-.9,.4),g=vec2(.4,.9),h=vec2(-.4,-.9),i=vec2(.9,-.4);void main(){vec2 a=vv0;vec3 b=texture2D(u1,a).rgb+texture2D(u1,a+u15*f).rgb+texture2D(u1,a+u15*g).rgb+texture2D(u1,a+u15*h).rgb+texture2D(u1,a+u15*i).rgb;gl_FragColor=vec4(b/5.,1.);}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s82 = {
                  name: "_",
                  g: "uniform sampler2D u1,u101,u42;uniform vec2 u15,u102;varying vec2 vv0;const vec3 k=vec3(1.,1.,1.);const vec2 f=vec2(-.9,.4),g=vec2(.4,.9),h=vec2(-.4,-.9),i=vec2(.9,-.4);void main(){vec2 a=vv0;vec3 b=texture2D(u1,a).rgb+texture2D(u1,a+u15*f).rgb+texture2D(u1,a+u15*g).rgb+texture2D(u1,a+u15*h).rgb+texture2D(u1,a+u15*i).rgb;float c=texture2D(u42,vec2(.5,.5)).a,d=u102.x+pow(c,2.)*(u102.y-u102.x);vec3 j=mix(b/5.,texture2D(u101,a).rgb,d);gl_FragColor=vec4(j,1.);}",
                  i: ["u1", "u101", "u15", "u42", "u102"],
                  precision: D.low,
                };
                k.s83 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;const vec3 f=vec3(.299,.587,.114);const float m=.007813,n=.125,h=8.;void main(){vec2 x=vv0;vec3 o=texture2D(u1,vv0+vec2(-1.,-1.)*u15).xyz,p=texture2D(u1,vv0+vec2(1.,-1.)*u15).xyz,q=texture2D(u1,vv0+vec2(-1.,1.)*u15).xyz,r=texture2D(u1,vv0+vec2(1.,1.)*u15).xyz,s=texture2D(u1,vv0).xyz;float b=dot(o,f),c=dot(p,f),e=dot(q,f),g=dot(r,f),i=dot(s,f),t=min(i,min(min(b,c),min(e,g))),u=max(i,max(max(b,c),max(e,g)));vec2 a;a.x=-(b+c-(e+g)),a.y=b+e-(c+g);float v=max((b+c+e+g)*(.25*n),m),w=1./(min(abs(a.x),abs(a.y))+v);a=min(vec2(h,h),max(vec2(-h,-h),a*w))*u15;vec3 j=.5*(texture2D(u1,vv0+a*-.166667).rgb+texture2D(u1,vv0+a*.166667).rgb),k=j*.5+.25*(texture2D(u1,vv0+a*-.5).rgb+texture2D(u1,vv0+a*.5).rgb);float l=dot(k,f);gl_FragColor=l<t||l>u?vec4(j,1.):vec4(k,1.);}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s84 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;const vec2 f=vec2(-.9,.4),g=vec2(.4,.9),h=vec2(-.4,-.9),i=vec2(.9,-.4);void main(){vec2 a=vv0;vec4 b=texture2D(u1,a)+texture2D(u1,a+u15*f)+texture2D(u1,a+u15*g)+texture2D(u1,a+u15*h)+texture2D(u1,a+u15*i);gl_FragColor=b/5.;}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.RGBEtoRGB = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;vec3 f(vec4 a){float b=a.a*256.-128.;vec3 c=a.rgb;return exp2(b)*c*65536.;}void main(){vec4 a=texture2D(u1,vv0);gl_FragColor=vec4(f(a),1.);}",
                  i: ["u1"],
                  precision: D.high,
                };
                k.s13 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;const vec3 f=vec3(0.);vec4 g(vec3 d){vec3 b=d/65536.,a=clamp(ceil(log2(b)),-128.,127.);float c=max(max(a.r,a.g),a.b),h=exp2(c);vec3 i=clamp(b/h,0.,1.);return vec4(i,(c+128.)/256.);}void main(){vec3 a=texture2D(u1,vv0).rgb;gl_FragColor=g(max(a,f));}",
                  i: ["u1"],
                  precision: D.high,
                };
                k.s85 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u96;uniform float u97;varying vec2 vv0;const vec3 j=vec3(0.),f=vec3(1.);vec4 g(vec3 d){vec3 b=d/65536.,a=clamp(ceil(log2(b)),-128.,127.);float c=max(max(a.r,a.g),a.b),h=exp2(c);vec3 i=clamp(b/h,0.,1.);return vec4(i,(c+128.)/256.);}void main(){vec3 a=texture2D(u1,vv0*u96).rgb,b=pow(a,u97*f);gl_FragColor=g(b);}",
                  i: ["u1", "u97", "u96"],
                  precision: D.high,
                };
                k.s86 = {
                  name: "_",
                  g: "uniform sampler2D u103,u104;uniform float u105,u106;varying vec2 vv0;void main(){vec3 a=texture2D(u104,vv0).rgb,b=texture2D(u103,vv0).rgb;gl_FragColor=vec4(b*u106+u105*a,1.);}",
                  i: ["u103", "u104", "u105", "u106"],
                  precision: D.high,
                };
                k.s87 = {
                  name: "_",
                  g: "uniform sampler2D u107,u108;uniform float u97;varying vec2 vv0;const int j=8888;const float e=3.141592;const vec2 k=vec2(0.,0.);const vec3 n=vec3(1.,1.,1.),o=vec3(0.,0.,0.);void main(){float p=e*(vv0.x*2.-1.),q=e/2.*(vv0.y*2.-1.),b,c,r,l,m;vec4 d;vec3 f=o;vec2 g=k,a=k;for(int h=0;h<j;h+=1)a.x=float(h),a.y=floor(a.x/64.),d=texture2D(u108,a/64.),b=e*d.r,c=2.*asin(sqrt(.25+d.g*.25)),l=p+c*cos(b),m=q+c*sin(b),g.x=.5+.5*l/e,g.y=.5+m/e,f+=pow(texture2D(u107,g).rgb,u97*n);f/=float(j),gl_FragColor=vec4(f,1.);}",
                  i: ["u107", "u108", "u97"],
                  precision: D.low,
                  Ia: [{ search: "8888", replace: W.Fm[ha.X()] }],
                };
                k.s88 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0);float b=.031496*texture2D(u1,vv0-3.*u15).a+.110236*texture2D(u1,vv0-2.*u15).a+.220472*texture2D(u1,vv0-u15).a+.275591*a.a+.220472*texture2D(u1,vv0+u15).a+.110236*texture2D(u1,vv0+2.*u15).a+.031496*texture2D(u1,vv0+3.*u15).a;gl_FragColor=vec4(a.rgb,4.*b);}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s89 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;const vec3 f=vec3(1.,1.,1.);void main(){vec4 a=texture2D(u1,vv0);float b=.3*pow(a.a,2.);gl_FragColor=vec4(a.rgb+b*f,1.);}",
                  i: ["u1"],
                  precision: D.low,
                };
                k.s90 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){vec4 a=.031496*texture2D(u1,vv0-3.*u15)+.110236*texture2D(u1,vv0-2.*u15)+.220472*texture2D(u1,vv0-u15)+.275591*texture2D(u1,vv0)+.220472*texture2D(u1,vv0+u15)+.110236*texture2D(u1,vv0+2.*u15)+.031496*texture2D(u1,vv0+3.*u15);gl_FragColor=a;}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s91 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0-3.*u15)+texture2D(u1,vv0-2.*u15)+texture2D(u1,vv0-u15)+texture2D(u1,vv0)+texture2D(u1,vv0+u15)+texture2D(u1,vv0+2.*u15)+texture2D(u1,vv0+3.*u15);gl_FragColor=a/7.;}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s92 = {
                  name: "_",
                  g: "uniform sampler2D u1;varying vec2 vv0;const vec4 g=vec4(0.,0.,0.,0.);const float e=256.;void main(){vec4 b=g;float c=0.;vec2 d;for(float a=0.;a<e;a+=1.)d=vec2((a+.5)/e,vv0.y),b+=texture2D(u1,d),c+=1.;gl_FragColor=b/c;}",
                  i: ["u1"],
                  precision: D.high,
                };
                k.s93 = {
                  name: "_",
                  g: "uniform sampler2D u1,u98;varying vec2 vv0;const vec4 h=vec4(1.,1.,1.,1.);const float f=0.,g=.3;void main(){vec4 b=texture2D(u98,vv0),c=texture2D(u1,vv0);float a=smoothstep(g,f,vv0.y);a+=smoothstep(1.-g,1.-f,vv0.y),gl_FragColor=mix(c,b,a*h);}",
                  i: ["u1", "u98"],
                  precision: D.high,
                };
                k.s94 = {
                  name: "_",
                  g: "uniform sampler2D u1,u98;varying vec2 vv0;const vec3 h=vec3(1.,1.,1.);const float f=0.,g=.3;vec4 i(vec3 d){vec3 b=d/65536.,a=clamp(ceil(log2(b)),-128.,127.);float c=max(max(a.r,a.g),a.b),j=exp2(c);vec3 k=clamp(b/j,0.,1.);return vec4(k,(c+128.)/256.);}void main(){vec3 b=texture2D(u98,vv0).rgb,c=texture2D(u1,vv0).rgb;float a=smoothstep(g,f,vv0.y);a+=smoothstep(1.-g,1.-f,vv0.y),gl_FragColor=i(mix(c,b,a*h));}",
                  i: ["u1", "u98"],
                  precision: D.high,
                };
                k.s95 = {
                  name: "_",
                  g: "uniform sampler2D u1,u109,u2,u110;uniform vec4 u111;uniform vec2 u112;uniform float u113,u114,u115,u116;varying vec2 vv0;const vec2 g=vec2(1.,1.),h=vec2(.5,.5);const float e=3.141592;void main(){vec4 d=texture2D(u1,vv0),i=texture2D(u109,vec2(1.-vv0.x,vv0.y));float j=step(texture2D(u110,vec2(.25,.5)).r,1.);vec2 a=vv0*2.-g;float k=texture2D(u2,a*u112*.5+h).r,l=atan(a.x,a.y),m=-(mod(u113,2.*e)-e),b=mod(l-m+e,2.*e)-e,n=smoothstep(0.,u114,b),c=.5+u116*(.5-n);c*=(sign(b)+1.)/2.;vec4 o=i+c*u111*k;gl_FragColor=mix(d,o,j*u115);}",
                  i: "u1 u2 u110 u109 u111 u113 u114 u115 u112 u116".split(" "),
                  precision: D.low,
                };
                var e =
                  "u117 u118 u119 u120 u107 u121 u3 u122 u109 u123 u124 u125 u126 u127 u15".split(
                    " "
                  );
                W.ga_ &&
                  (k.s96 = {
                    name: "_",
                    g: "uniform sampler2D u117,u118,u119,u120,u107,u121,u128,u109;uniform vec3 u122,u125;uniform vec2 u15;uniform float u3,u129,u124,u126,u123;varying vec2 vv0;const float i=3.141592;const vec3 u=vec3(0.,0.,0.),v=vec3(.299,.587,.114);const float w=2.;vec3 l(vec4 a){float b=a.a*256.-128.;vec3 c=a.rgb;return exp2(b)*c*65536.;}vec2 x(vec3 a){float b=atan(a.x,a.z),c=acos(-a.y);return vec2(.5-.5*b/i,1.-c/i);}vec2 y(vec3 a,float b){vec2 d=vec2(1.,.5)/pow(2.,b),f=vec2(0.,1.-pow(.5,b));float g=atan(a.x,a.z),h=acos(-a.y),c=.5+.5*g/i,j=h/i,k=pow(2.,b)/u123;c=(1.-k)*c;return f+vec2(c,j)*d;}void main(){vec4 c=texture2D(u117,vv0);vec3 j=texture2D(u109,vec2(1.-vv0.x,vv0.y)).rgb;if(c.a<.01){gl_FragColor=vec4(j,0.);return;}float z=c.a;vec3 A=c.rgb,B=A+u122;vec4 b=texture2D(u120,vv0),k=texture2D(u118,vv0);vec3 d=k.rgb;float m=k.a;vec4 n=texture2D(u119,vv0);vec3 C=n.rgb;float o=b.r,D=b.g,p=floor(b.b*255.),f=floor(p/16.),E=(p-16.*f)/16.;f/=16.;float F=b.a;vec2 G=x(-d);vec3 q=(1.-F)*l(texture2D(u121,G)),r=normalize(B),g=u,s=reflect(-r,d);vec2 H=y(s,floor(D*u3));float I=acos(-s.z),J=smoothstep(u124-u126,u124+u126,I);g=mix(l(texture2D(u107,H)),u125,J);float a=o+(E-o)*pow(1.-dot(d,-r),f*16.);a=clamp(a,0.,1.),m*=n.a;float t=1.-u129*texture2D(u128,vv0).r;g*=pow(t,2.),q*=t;vec3 h=C*mix(q,g,a),M=mix(j,h,z*(m*(1.-a)+a));float K=dot(h,v),L=max(0.,(K-1.)/(w-1.));gl_FragColor=vec4(h,L);}",
                    i: e.concat(["u128", "u129"]),
                    precision: D.high,
                  });
                k.s97 = {
                  name: "_",
                  g: "uniform sampler2D u117,u118,u119,u120,u107,u121,u109;uniform vec3 u122,u125;uniform vec2 u15;uniform float u3,u124,u126,u127,u130,u131,u123,u132;varying vec2 vv0;const float g=3.141592;const vec3 G=vec3(0.),l=vec3(1.),H=vec3(.299,.587,.114);const float I=2.;vec3 q(vec4 a){float b=a.a*256.-128.;vec3 c=a.rgb;return exp2(b)*c*65536.;}vec2 J(vec3 a){float b=atan(a.x,-a.z),c=acos(-a.y);return vec2(.5-.5*b/g,1.-c/g);}vec2 K(vec3 b,float c){float a=pow(2.,c),e=u123/8.;a=min(a,e);vec2 f=vec2(1.,.5)/a,h=vec2(-.5/u123,1.-1./a-.5/u123);float i=atan(b.x,b.z),j=acos(-b.y);vec2 k=vec2(.5+.5*i/g,j/g);return h+k*f;}float m(vec3 a,vec3 b){return abs(acos(dot(a,b)));}float n(vec2 a){float b=texture2D(u117,a).a;return step(.01,b);}vec3 o(vec2 a){return texture2D(u109,vec2(1.-a.x,a.y)).rgb;}void main(){vec4 h=texture2D(u117,vv0);if(h.a<.01)gl_FragColor=vec4(o(vv0),0.);float i=h.a;vec3 L=h.rgb,M=L+u122;vec4 c=texture2D(u120,vv0),r=texture2D(u118,vv0);vec3 a=r.rgb;float s=r.a;vec4 j=texture2D(u119,vv0);vec3 e=j.rgb;if(i>1.){gl_FragColor=vec4(mix(o(vv0),e,j.a),1.);return;}e=pow(e,u130*l);float t=c.r,N=c.g,O=c.a,u=floor(c.b*255.),k=floor(u/16.),P=(u-16.*k)/16.;k/=16.;vec2 v=vv0+vec2(-1.,0.)*u15,w=vv0+vec2(1.,0.)*u15,x=vv0+vec2(0.,1.)*u15,y=vv0+vec2(0.,-1.)*u15;vec3 Q=texture2D(u118,v).rgb,R=texture2D(u118,w).rgb,S=texture2D(u118,x).rgb,T=texture2D(u118,y).rgb;float U=m(a,Q)*n(v),V=m(a,R)*n(w),W=m(a,S)*n(x),X=m(a,T)*n(y),Y=2.*max(max(U,V),max(W,X)),Z=1.2*clamp(Y/g,0.,1.),_=max(N,Z);vec2 aa=J(a);vec3 ba=q(texture2D(u121,aa)),ca=(1.-O)*ba,z=normalize(M),A=G,B=reflect(-z,a);float da=floor(_*u3);vec2 ea=K(B,da);float fa=acos(-B.z),ga_=smoothstep(u124-u126,u124+u126,fa);vec3 ha=q(texture2D(u107,ea));A=mix(ha,u125,ga_*u127);float b=t+(P-t)*pow(1.+dot(a,z),k*15.);b=clamp(b,0.,1.);vec2 C=vv0;vec3 D=refract(vec3(0.,0.,-1.),a,.666667);float ia=smoothstep(.1,.3,length(D.xy)),E=sqrt(u15.y/u15.x),ja=smoothstep(.3,.8,i);C+=ja*D.xy*vec2(1./E,E)*ia*.03,s*=j.a;vec3 ka=e*mix(ca,A,b);float p=i*(s*(1.-b)+b);vec3 f=mix(o(C),pow(ka,l/u130),p);float F=dot(f,H),la=max(0.,(F-1.)/(I-1.));f=mix(F*l,f,mix(1.,u131,p)*l);float ma=mix(la,p,u132);gl_FragColor=vec4(f,ma);}",
                  i: e.concat(["u132", "u130", "u131"]),
                  precision: D.high,
                };
                W.ga_ &&
                  ((k.s98 = {
                    name: "_",
                    g: "uniform sampler2D u117,u118;uniform mat4 u133;uniform vec2 u134,u15,u135;uniform float u136,u137,u138,u139,u140,u141,u142,u143,u129;varying vec2 vv0;const float PI=3.141593,HALFPI=1.570796,N=8888.8;void main(){vec2 uvt=vv0+u135;vec4 pos=texture2D(u117,uvt);if(pos.a<.01){gl_FragColor=vec4(0.,0.,0.,1.);return;}vec3 co0=pos.rgb;float c=cos(u136),s=sin(u136);vec3 no0=texture2D(u118,uvt).rgb;float zv=(u133*vec4(co0,1.)).z;vec3 co;vec2 scale=u134/abs(zv),uv,duv=u15*vec2(c,s)*scale;vec3 dp,dpn;float dzMax=0.,angleMin=0.,angle;for(float i=0.;i<N;i+=1.)uv=uvt+i*duv,co=texture2D(u117,uv).rgb,dp=co-co0,dpn=normalize(dp),angle=atan(dot(no0,dpn),length(cross(no0,dpn))),angle*=1.-smoothstep(u142,u143,length(dp)),angleMin=max(angleMin,angle),dzMax=max(dzMax,sin(angle)*length(dp));float angleMinInv=0.;for(float i=0.;i<N;i+=1.)uv=uvt-i*duv,co=texture2D(u117,uv).rgb,dp=co-co0,dpn=normalize(dp),angle=atan(dot(no0,dpn),length(cross(no0,dpn))),angle*=1.-smoothstep(u142,u143,length(dp)),dzMax=max(dzMax,sin(angle)*length(dp)),angleMinInv=max(angleMinInv,angle);duv=u15*vec2(s,c)*scale;float angleMin2=0.;for(float i=0.;i<N;i+=1.)uv=uvt+i*duv,co=texture2D(u117,uv).rgb,dp=co-co0,dpn=normalize(dp),angle=atan(dot(no0,dpn),length(cross(no0,dpn))),angle*=1.-smoothstep(u142,u143,length(dp)),dzMax=max(dzMax,sin(angle)*length(dp)),angleMin2=max(angleMin2,angle);float angleMin2Inv=0.;for(float i=0.;i<N;i+=1.)uv=uvt-i*duv,co=texture2D(u117,uv).rgb,dp=co-co0,dpn=normalize(dp),angle=atan(dot(no0,dpn),length(cross(no0,dpn))),angle*=1.-smoothstep(u142,u143,length(dp)),dzMax=max(dzMax,sin(angle)*length(dp)),angleMin2Inv=max(angleMin2Inv,angle);float omegaMin=PI/4.*(angleMin+angleMinInv)*(angleMin2+angleMin2Inv),dzFactor=clamp(dzMax/u139,u140,1.),ao=dzFactor*clamp(u138*omegaMin*u141,0.,u129);gl_FragColor=vec4(ao,ao,ao,u137);}",
                    i: "u117 u118 u138 u137 u136 u15 u144 u139 u140 u141 u142 u143 u133 u134 u129".split(
                      " "
                    ),
                    Ia: [
                      { search: "8888.8", replace: W.Fk[ha.X()].toFixed(1) },
                    ],
                    precision: D.low,
                  }),
                  (k.s99 = {
                    name: "_",
                    g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;const vec2 f=vec2(-.9,.4),g=vec2(.4,.9),h=vec2(-.4,-.9),i=vec2(.9,-.4),j=vec2(-1.9,.9),k=vec2(.9,1.9),l=vec2(-.9,-1.9),m=vec2(1.9,-.9);void main(){vec2 a=vv0;vec4 b=texture2D(u1,a)+texture2D(u1,a+u15*f)+texture2D(u1,a+u15*g)+texture2D(u1,a+u15*h)+texture2D(u1,a+u15*i);b+=texture2D(u1,a+u15*j)+texture2D(u1,a+u15*k)+texture2D(u1,a+u15*l)+texture2D(u1,a+u15*m),gl_FragColor=b/9.;}",
                    i: ["u1", "u15"],
                    precision: D.low,
                  }));
                k.s100 = {
                  name: "_",
                  g: "varying vec3 vv0;void main(){gl_FragColor=vec4(vv0,1.);}",
                  v: "attribute vec3 a0;uniform mat4 u145,u133,u146;varying vec3 vv0;void main(){vec4 a=u145*u133*u146*vec4(a0,1.);gl_Position=a,vv0=a.xyz/a.w;}",
                  i: ["u145", "u133", "u146"],
                  precision: D.low,
                };
                k.s101 = {
                  name: "_",
                  g: "uniform sampler2D u147,u121,u108;uniform mat4 u145,u148;uniform vec2 u149;uniform float u150;varying vec2 vv0;const float n=8888.8,o=9999.9,p=25.,v=50.,w=1.2,e=3.141592;const vec4 x=vec4(0.,0.,0.,0.),A=vec4(1.,1.,1.,1.);const vec2 f=vec2(.5,.5);vec2 y(vec3 a){float b=atan(a.x,a.z),c=acos(a.y);return vec2(.5-.5*b/e,1.-c/e);}void main(){float d,a,q;vec2 z=vec2(vv0.x,1.-vv0.y),b;vec3 r=vec3(u149*(z-f),0.),B=vec3(u148*vec4(r,1.)),g,s;vec4 t=x,h,c,u;vec3 i;int j;for(float k=0.;k<n;k+=1.){b.x=k,b.y=floor(b.x/64.),c=texture2D(u108,b/64.),d=e*c.r,a=2.*asin(sqrt(.25+c.g*.25)),g=vec3(cos(d)*sin(a),sin(d)*sin(a),-cos(a)),q=p+(.5+.5*c.b)*(v-p),j=0;for(float l=0.;l<=o;l+=1.){u=vec4(r+g*q*pow(l/o,w),1.),h=u145*u,i=h.xyz/h.w;if(texture2D(u147,f+f*i.xy).z<i.z){j=1;break;}}if(j==1)continue;s=vec3(u148*vec4(g,0.)),t+=texture2D(u121,y(s));}gl_FragColor=vec4(u150*t.rgb/n,1.);}",
                  i: "u147 u121 u108 u145 u148 u149 u150".split(" "),
                  Ia: [
                    { search: "8888.8", replace: W.Ho[ha.X()].toFixed(1) },
                    { search: "9999.9", replace: W.Io[ha.X()].toFixed(1) },
                  ],
                  precision: D.low,
                };
                k.s102 = {
                  name: "_",
                  g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){vec4 a=.285714*texture2D(u1,vv0-u15)+.428571*texture2D(u1,vv0)+.285714*texture2D(u1,vv0+u15);gl_FragColor=a;}",
                  i: ["u1", "u15"],
                  precision: D.low,
                };
                k.s103 = {
                  name: "_",
                  g: "uniform sampler2D u1,u151;varying vec2 vv0;void main(){gl_FragColor=texture2D(u1,vv0);}",
                  v: "attribute vec3 a0;attribute vec2 a1;uniform mat4 u145,u133;varying vec2 vv0;void main(){vec4 a=u145*u133*vec4(a0,1.);gl_Position=a,vv0=a1;}",
                  i: ["u145", "u133", "u1"],
                  K: ["a0", "a1"],
                  precision: D.low,
                };
                if (ha.ca()) {
                  e =
                    "u42 u152 u153 u154 u155 u43 u120 u156 u157 u14 u158 u159 u86"
                      .split(" ")
                      .concat(x, z);
                  ha.Ci() ||
                    (k.s104 = {
                      name: "_",
                      v: "attribute vec2 a0;void main(){gl_Position=vec4(a0,0.,1.);}",
                      g: "void main(){gl_FragData[0]=vec4(0.,0.,0.,0.),gl_FragData[1]=vec4(0.,0.,0.,0.),gl_FragData[2]=vec4(0.,0.,0.,0.),gl_FragData[3]=vec4(0.,0.,0.,0.);}",
                      i: [],
                      precision: D.low,
                      fa: !0,
                    });
                  k.s105 = {
                    name: "_",
                    v: "attribute vec2 a0;void main(){gl_Position=vec4(a0,0.,1.);}",
                    g: "uniform vec4 color;void main(){gl_FragData[0]=color,gl_FragData[1]=color,gl_FragData[2]=color,gl_FragData[3]=color;}",
                    i: ["color"],
                    fa: !0,
                  };
                  k.s106NNGLcolor = {
                    name: "_",
                    g: "uniform vec4 u120,u14;uniform vec3 u156;uniform float u157;varying vec3 vv0,vv1;varying float vv2,vv3;void main(){float b=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv3),c=u157;vec4 a=u120;float d=floor(15.99*c),i=floor(15.99*a.b);a.b=(d+16.*i)/255.,gl_FragData[0]=vec4(vv0,vv2),gl_FragData[1]=vec4(normalize(vv1),b),gl_FragData[2]=vec4(u156,1.),gl_FragData[3]=a;}",
                    v: "attribute vec3 a0,a2;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec3 vv0,vv1;varying float vv2,vv3;const vec2 e=vec2(1.);const vec3 r=vec3(1.);const vec2 F=vec2(-1.,1.),s=vec2(.16,.5),t=vec2(.5,.5),u=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 v(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,s);vec2 f=u93*e;vec3 c=u93*r;vec2 w=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,t).rgb+vec3(u87,0.,0.),u90,c);float x=mix(texture2D(u42,u).r,0.,u93);a.z+=x;mat3 h=v(a);vec3 y=mix(u152,u91,c);float z=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 A=mat2(i,j,-j,i);b.xy=A*b.xy;float B=mix(u89,1.,u93);vec2 k=u88/w;vec3 l=a0;float C=max(0.,-a0.z-u154)*u155;l.x+=C*sign(a0.x)*(1.-u93);vec3 m=h*(l+y)*z+b;vec2 D=k*B;vec3 E=vec3(g*D,-k)+m*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(E,1.)),vv1=h*a2*vec3(1.,-1.,-1.),vv2=smoothstep(u158,u159,a0.z),vv0=m,vv3=a0.y;}",
                    i: e,
                    K: ["a0", "a2"],
                    S: [3, 3],
                    fa: !0,
                  };
                  k.s106NNGLtexture = {
                    name: "_",
                    g: "uniform sampler2D u1;uniform vec4 u120,u14;uniform vec3 u156,u77;uniform float u157;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;void main(){float k=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv4),l=u157;vec4 c=u120;float m=floor(15.99*l),n=floor(15.99*c.b);c.b=(m+16.*n)/255.;vec4 a=texture2D(u1,vv2);vec3 o=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,o,u77.x);float d=a.a,p=dot(a.rgb,vec3(.333)),e=1.-u77.y*p;d*=e;float q=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(q),b,vec3(e));vec3 r=u77.z*vec3(.25);b=max(b,r);vec4 s=vec4(b,d);gl_FragData[0]=vec4(vv0,vv3),gl_FragData[1]=vec4(normalize(vv1),k),gl_FragData[2]=s,gl_FragData[3]=c;}",
                    v: "attribute vec3 a0,a2;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;const vec2 e=vec2(1.);const vec3 s=vec3(1.);const vec2 G=vec2(-1.,1.),t=vec2(.16,.5),u=vec2(.5,.5),v=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 w(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,t);vec2 f=u93*e;vec3 c=u93*s;vec2 x=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,u).rgb+vec3(u87,0.,0.),u90,c);float y=mix(texture2D(u42,v).r,0.,u93);a.z+=y;mat3 h=w(a);vec3 z=mix(u152,u91,c);float A=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 B=mat2(i,j,-j,i);b.xy=B*b.xy;float C=mix(u89,1.,u93);vec2 k=u88/x;vec3 l=a0;float D=max(0.,-a0.z-u154)*u155;l.x+=D*sign(a0.x)*(1.-u93);vec3 m=h*(l+z)*A+b;vec2 E=k*C;vec3 F=vec3(g*E,-k)+m*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(F,1.)),vv1=h*a2*vec3(1.,-1.,-1.),vv3=smoothstep(u158,u159,a0.z),vv2=a1,vv0=m,vv4=a0.y;}",
                    i: e.concat(J),
                    K: ["a0", "a2", "a1"],
                    S: [3, 3, 2],
                    fa: !0,
                  };
                  k.s106NNGLtextureNormalMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u161;uniform vec4 u120,u14;uniform vec3 u156,u77;uniform float u157;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec3 o=vec3(1.);void main(){float p=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv5);vec3 B=vec3(0.,0.,-1.),g=normalize(vv2),c=texture2D(u161,vv3).xyz;c=normalize(c*255./127.-1.007874*o);vec3 h=vv0.xyz,q=cross(g,h)*vv0.w;mat3 r=mat3(h,q,g);vec3 s=r*c;float t=u157;vec4 d=u120;float u=floor(15.99*t),v=floor(15.99*d.b);d.b=(u+16.*v)/255.;vec4 a=texture2D(u1,vv3);vec3 w=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,w,u77.x);float i=a.a,x=dot(a.rgb,vec3(.333)),j=1.-u77.y*x;i*=j;float y=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(y),b,vec3(j));vec3 z=u77.z*vec3(.25);b=max(b,z);vec4 A=vec4(b,i);gl_FragData[0]=vec4(vv1,vv4),gl_FragData[1]=vec4(s,p),gl_FragData[2]=A,gl_FragData[3]=d;}",
                    v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec2 e=vec2(1.);const vec3 t=vec3(1.);const vec2 H=vec2(-1.,1.),u=vec2(.16,.5),v=vec2(.5,.5),w=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 x(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,u);vec2 f=u93*e;vec3 c=u93*t;vec2 y=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,v).rgb+vec3(u87,0.,0.),u90,c);float z=mix(texture2D(u42,w).r,0.,u93);a.z+=z;mat3 h=x(a);vec3 A=mix(u152,u91,c);float B=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 C=mat2(i,j,-j,i);b.xy=C*b.xy;float D=mix(u89,1.,u93);vec2 k=u88/y;vec3 l=a0;float E=max(0.,-a0.z-u154)*u155;l.x+=E*sign(a0.x)*(1.-u93);vec3 m=h*(l+A)*B+b;vec2 F=k*D;vec3 G=vec3(g*F,-k)+m*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(G,1.)),vv2=h*a2*vec3(1.,-1.,-1.),vv4=smoothstep(u158,u159,a0.z),vv0=a3,vv3=a1,vv1=m,vv5=a0.y;}",
                    i: e.concat(J, ["u161"]),
                    K: ["a3", "a0", "a2", "a1"],
                    S: [4, 3, 3, 2],
                    fa: !0,
                  };
                  k.s106NNGLtextureParamsMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u81;uniform vec4 u120,u14,u82;uniform vec3 u156,u77;uniform float u157;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;vec2 j(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float p=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv4),e=u157;vec4 c=u120,f=texture2D(u81,vv2);vec2 d=j(f.b,4.);float q=1.-d.x,r=d.y;d=j(f.a,1.);float s=d.x,g=d.y;vec4 t=vec4(f.rg,r,s);float u=q;c=mix(c,t,u82*g),e=mix(e,u,u82.b*g);float v=floor(15.99*e),w=floor(15.99*c.b);c.b=(v+16.*w)/255.;vec4 a=texture2D(u1,vv2);vec3 x=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,x,u77.x);float h=a.a,y=dot(a.rgb,vec3(.333)),k=1.-u77.y*y;h*=k;float z=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(z),b,vec3(k));vec3 A=u77.z*vec3(.25);b=max(b,A);vec4 B=vec4(b,h);gl_FragData[0]=vec4(vv0,vv3),gl_FragData[1]=vec4(normalize(vv1),p),gl_FragData[2]=B,gl_FragData[3]=c;}",
                    v: "attribute vec3 a0,a2;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;const vec2 e=vec2(1.);const vec3 s=vec3(1.);const vec2 G=vec2(-1.,1.),t=vec2(.16,.5),u=vec2(.5,.5),v=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 w(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,t);vec2 f=u93*e;vec3 c=u93*s;vec2 x=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,u).rgb+vec3(u87,0.,0.),u90,c);float y=mix(texture2D(u42,v).r,0.,u93);a.z+=y;mat3 h=w(a);vec3 z=mix(u152,u91,c);float A=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 B=mat2(i,j,-j,i);b.xy=B*b.xy;float C=mix(u89,1.,u93);vec2 k=u88/x;vec3 l=a0;float D=max(0.,-a0.z-u154)*u155;l.x+=D*sign(a0.x)*(1.-u93);vec3 m=h*(l+z)*A+b;vec2 E=k*C;vec3 F=vec3(g*E,-k)+m*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(F,1.)),vv1=h*a2*vec3(1.,-1.,-1.),vv3=smoothstep(u158,u159,a0.z),vv2=a1,vv0=m,vv4=a0.y;}",
                    i: e.concat(J, t),
                    K: ["a0", "a2", "a1"],
                    S: [3, 3, 2],
                    fa: !0,
                  };
                  k.s106NNGLtextureNormalParamsMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u161,u81;uniform vec4 u120,u14,u82;uniform vec3 u156,u77;uniform float u157;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec3 t=vec3(1.);vec2 k(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float u=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv5);vec3 K=vec3(0.,0.,-1.),h=normalize(vv2),e=texture2D(u161,vv3).xyz;e=normalize(e*255./127.-1.007874*t);vec3 l=vv0.xyz,v=cross(h,l)*vv0.w;mat3 w=mat3(l,v,h);vec3 x=w*e;float f=u157;vec4 c=u120,g=texture2D(u81,vv3);vec2 d=k(g.b,4.);float y=1.-d.x,z=d.y;d=k(g.a,1.);float A=d.x,m=d.y;vec4 B=vec4(g.rg,z,A);float C=y;c=mix(c,B,u82*m),f=mix(f,C,u82.b*m);float D=floor(15.99*f),E=floor(15.99*c.b);c.b=(D+16.*E)/255.;vec4 a=texture2D(u1,vv3);vec3 F=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,F,u77.x);float n=a.a,G=dot(a.rgb,vec3(.333)),o=1.-u77.y*G;n*=o;float H=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(H),b,vec3(o));vec3 I=u77.z*vec3(.25);b=max(b,I);vec4 J=vec4(b,n);gl_FragData[0]=vec4(vv1,vv4),gl_FragData[1]=vec4(x,u),gl_FragData[2]=J,gl_FragData[3]=c;}",
                    v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u160;uniform float u153,u158,u159,u154,u155,u71;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec2 e=vec2(1.);const vec3 t=vec3(1.);const vec2 H=vec2(-1.,1.),u=vec2(.16,.5),v=vec2(.5,.5),w=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 x(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,u);vec2 f=u93*e;vec3 c=u93*t;vec2 y=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,v).rgb+vec3(u87,0.,0.),u90,c);float z=mix(texture2D(u42,w).r,0.,u93);a.z+=z;mat3 h=x(a);vec3 A=mix(u152,u91,c);float B=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float i=cos(a.z),j=sin(a.z);mat2 C=mat2(i,j,-j,i);b.xy=C*b.xy;float D=mix(u89,1.,u93);vec2 k=u88/y;vec3 l=a0;float E=max(0.,-a0.z-u154)*u155;l.x+=E*sign(a0.x)*(1.-u93);vec3 m=h*(l+A)*B+b;vec2 F=k*D;vec3 G=vec3(g*F,-k)+m*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(G,1.)),vv2=h*a2*vec3(1.,-1.,-1.),vv4=smoothstep(u158,u159,a0.z),vv0=a3,vv3=a1,vv1=m,vv5=a0.y;}",
                    i: e.concat(J, ["u161"], t),
                    K: ["a3", "a0", "a2", "a1"],
                    S: [4, 3, 3, 2],
                    fa: !0,
                  };
                  e = "u145 u133 u146 u120 u156 u157 u14".split(" ");
                  k.s106color = {
                    name: "_",
                    g: "uniform vec4 u120,u14;uniform vec3 u156;uniform float u157;varying vec3 vv0,vv1;varying float vv2,vv3;void main(){float b=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv3),c=u157;vec4 a=u120;float d=floor(15.99*c),i=floor(15.99*a.b);a.b=(d+16.*i)/255.,gl_FragData[0]=vec4(vv0,vv2),gl_FragData[1]=vec4(normalize(vv1),b),gl_FragData[2]=vec4(u156,1.),gl_FragData[3]=a;}",
                    v: "attribute vec3 a0,a2;uniform mat4 u145,u133,u146;varying vec3 vv0,vv1;varying float vv2,vv3;void main(){vec4 a=u146*vec4(a0,1.),b=u146*vec4(a2,0.);gl_Position=u145*u133*a,vv0=a.xyz,vv1=b.xyz,vv2=1.,vv3=a0.y;}",
                    i: e,
                    K: ["a0", "a2"],
                    fa: !0,
                  };
                  k.s106 = {
                    name: "_",
                    g: "uniform sampler2D u1;uniform vec4 u120,u14;uniform vec3 u156,u77;uniform float u157;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;void main(){float k=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv4),l=u157;vec4 c=u120;float m=floor(15.99*l),n=floor(15.99*c.b);c.b=(m+16.*n)/255.;vec4 a=texture2D(u1,vv2);vec3 o=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,o,u77.x);float d=a.a,p=dot(a.rgb,vec3(.333)),e=1.-u77.y*p;d*=e;float q=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(q),b,vec3(e));vec3 r=u77.z*vec3(.25);b=max(b,r);vec4 s=vec4(b,d);gl_FragData[0]=vec4(vv0,vv3),gl_FragData[1]=vec4(normalize(vv1),k),gl_FragData[2]=s,gl_FragData[3]=c;}",
                    v: "attribute vec3 a0,a2;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;void main(){vec4 a=u146*vec4(a0,1.),b=u146*vec4(a2,0.);gl_Position=u145*u133*a,vv2=a1,vv0=a.xyz,vv1=b.xyz,vv3=1.,vv4=a0.y;}",
                    i: e.concat(J),
                    K: ["a0", "a2", "a1"],
                    fa: !0,
                  };
                  var n = ["u161", "u162"];
                  k.s106NormalMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u161;uniform vec4 u120,u14;uniform vec3 u162,u156,u77;uniform float u157;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec3 o=vec3(1.);void main(){float p=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv5);vec3 B=vec3(0.,0.,-1.),g=normalize(vv2),c=texture2D(u161,vv3).xyz;c=normalize(c*255./127.-1.007874*o);vec3 h=vv0.xyz,q=cross(g,h)*vv0.w;mat3 r=mat3(h,q,g);vec3 s=r*c;float t=u157;vec4 d=u120;float u=floor(15.99*t),v=floor(15.99*d.b);d.b=(u+16.*v)/255.;vec4 a=texture2D(u1,vv3);vec3 w=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,w,u77.x);float i=a.a,x=dot(a.rgb,vec3(.333)),j=1.-u77.y*x;i*=j;float y=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(y),b,vec3(j));vec3 z=u77.z*vec3(.25);b=max(b,z);vec4 A=vec4(b,i);gl_FragData[0]=vec4(vv1,vv4),gl_FragData[1]=vec4(s,p),gl_FragData[2]=A,gl_FragData[3]=d;}",
                    v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;void main(){vec4 a=u146*vec4(a0,1.),b=u146*vec4(a2,0.);gl_Position=u145*u133*a,vv0=a3,vv3=a1,vv1=a.xyz,vv2=b.xyz,vv4=1.,vv5=a0.y;}",
                    i: e.concat(J, n),
                    K: ["a0", "a2", "a1", "a3"],
                    fa: !0,
                  };
                  k.s106ParamsMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u81;uniform vec4 u120,u14,u82;uniform vec3 u156,u77;uniform float u157;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;vec2 j(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float p=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv4),e=u157;vec4 c=u120,f=texture2D(u81,vv2);vec2 d=j(f.b,4.);float q=1.-d.x,r=d.y;d=j(f.a,1.);float s=d.x,g=d.y;vec4 t=vec4(f.rg,r,s);float u=q;c=mix(c,t,u82*g),e=mix(e,u,u82.b*g);float v=floor(15.99*e),w=floor(15.99*c.b);c.b=(v+16.*w)/255.;vec4 a=texture2D(u1,vv2);vec3 x=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,x,u77.x);float h=a.a,y=dot(a.rgb,vec3(.333)),k=1.-u77.y*y;h*=k;float z=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(z),b,vec3(k));vec3 A=u77.z*vec3(.25);b=max(b,A);vec4 B=vec4(b,h);gl_FragData[0]=vec4(vv0,vv3),gl_FragData[1]=vec4(normalize(vv1),p),gl_FragData[2]=B,gl_FragData[3]=c;}",
                    v: "attribute vec3 a0,a2;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec3 vv0,vv1;varying vec2 vv2;varying float vv3,vv4;void main(){vec4 a=u146*vec4(a0,1.),b=u146*vec4(a2,0.);gl_Position=u145*u133*a,vv2=a1,vv0=a.xyz,vv1=b.xyz,vv3=1.,vv4=a0.y;}",
                    i: e.concat(J, t),
                    K: ["a0", "a2", "a1"],
                    fa: !0,
                  };
                  k.s106NormalParamsMap = {
                    name: "_",
                    g: "uniform sampler2D u1,u161,u81;uniform vec4 u120,u14,u82;uniform vec3 u162,u156,u77;uniform float u157;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;const vec3 t=vec3(1.);vec2 k(float d,float e){float f=floor(d*255.+.01),a=pow(2.,e),g=256./a,b=f/a,c=floor(b),h=(b-c)*a;return vec2(c/(g-1.),h/(a-1.));}void main(){float u=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv5);vec3 K=vec3(0.,0.,-1.),h=normalize(vv2),e=texture2D(u161,vv3).xyz;e=normalize(e*255./127.-1.007874*t);vec3 l=vv0.xyz,v=cross(h,l)*vv0.w;mat3 w=mat3(l,v,h);vec3 x=w*e;float f=u157;vec4 c=u120,g=texture2D(u81,vv3);vec2 d=k(g.b,4.);float y=1.-d.x,z=d.y;d=k(g.a,1.);float A=d.x,m=d.y;vec4 B=vec4(g.rg,z,A);float C=y;c=mix(c,B,u82*m),f=mix(f,C,u82.b*m);float D=floor(15.99*f),E=floor(15.99*c.b);c.b=(D+16.*E)/255.;vec4 a=texture2D(u1,vv3);vec3 F=mix(u156,a.rgb,a.a),b=mix(a.rgb*u156,F,u77.x);float n=a.a,G=dot(a.rgb,vec3(.333)),o=1.-u77.y*G;n*=o;float H=min(a.b,min(a.r,a.g));b=mix(b-.5*vec3(H),b,vec3(o));vec3 I=u77.z*vec3(.25);b=max(b,I);vec4 J=vec4(b,n);gl_FragData[0]=vec4(vv1,vv4),gl_FragData[1]=vec4(x,u),gl_FragData[2]=J,gl_FragData[3]=c;}",
                    v: "attribute vec4 a3;attribute vec3 a0,a2;attribute vec2 a1;uniform mat4 u145,u133,u146;varying vec4 vv0;varying vec3 vv1,vv2;varying vec2 vv3;varying float vv4,vv5;void main(){vec4 a=u146*vec4(a0,1.),b=u146*vec4(a2,0.);gl_Position=u145*u133*a,vv0=a3,vv3=a1,vv1=a.xyz,vv2=b.xyz,vv4=1.,vv5=a0.y;}",
                    i: e.concat(J, n, t),
                    K: ["a0", "a2", "a1", "a3"],
                    fa: !0,
                  };
                } else m();
                q();
                e = [{ type: "1i", name: "u1", value: 0 }];
                F.j("s0", e);
                F.j("s75", e);
                F.j("s1", e);
                F.j("s77", [{ type: "1i", name: "u13", value: 1 }].concat(e));
                F.j("s78", [{ type: "1i", name: "u13", value: 1 }].concat(e));
                F.j("s12", [{ type: "1i", name: "u98", value: 1 }].concat(e));
                F.j("s80", e);
                F.j("s81", e);
                F.j(
                  "s82",
                  [
                    { type: "1i", name: "u101", value: 1 },
                    { type: "1i", name: "u42", value: 2 },
                  ].concat(e)
                );
                F.j("s83", e);
                F.j("s84", e);
                F.j("s13", e);
                F.j("s85", e);
                F.j("s86", [
                  { type: "1i", name: "u103", value: 0 },
                  { type: "1i", name: "u104", value: 1 },
                ]);
                F.j("s87", [
                  { type: "1i", name: "u107", value: 0 },
                  { type: "1i", name: "u108", value: 1 },
                ]);
                F.j("s88", e);
                F.j("s89", e);
                F.j("s90", e);
                F.j("s91", e);
                F.j("s92", e);
                F.j("s93", [{ type: "1i", name: "u98", value: 1 }].concat(e));
                F.j("s94", [{ type: "1i", name: "u98", value: 1 }].concat(e));
                W.ga_ &&
                  (F.j("s98", [
                    { type: "1i", name: "u117", value: 0 },
                    { type: "1i", name: "u118", value: 1 },
                    { type: "1f", name: "u139", value: W.tk },
                    { type: "1f", name: "u140", value: W.uk },
                    { type: "1f", name: "u141", value: W.Gk },
                    { type: "1f", name: "u142", value: W.xk },
                    { type: "1f", name: "u143", value: W.yk },
                    { type: "1f", name: "u138", value: 1 },
                    { type: "1f", name: "u129", value: 1 },
                  ]),
                  F.j("s99", e));
                n = [
                  { type: "1i", name: "u117", value: 0 },
                  { type: "1i", name: "u118", value: 1 },
                  { type: "1i", name: "u119", value: 2 },
                  { type: "1i", name: "u107", value: 3 },
                  { type: "1i", name: "u121", value: 4 },
                  { type: "1i", name: "u120", value: 6 },
                  { type: "1i", name: "u109", value: 7 },
                  { type: "1f", name: "u127", value: 0 },
                  { type: "1f", name: "u124", value: 0 },
                  { type: "1f", name: "u126", value: 0 },
                ];
                W.ga_ &&
                  F.j(
                    "s96",
                    n.concat([
                      { type: "1f", name: "u129", value: W.wk[ha.X()] },
                      { type: "1i", name: "u128", value: 5 },
                    ])
                  );
                F.j(
                  "s97",
                  n.concat([
                    { type: "1f", name: "u130", value: W.Rc },
                    { type: "1f", name: "u131", value: W.kg },
                    { type: "1f", name: "u132", value: 0 },
                  ])
                );
                F.j("s101", [
                  { type: "1i", name: "u147", value: 0 },
                  { type: "1i", name: "u121", value: 1 },
                  { type: "1i", name: "u108", value: 2 },
                  { type: "1f", name: "u150", value: W.Go },
                ]);
                F.j("s102", e);
                F.j("s103", e);
                F.j(
                  "s95",
                  [
                    { type: "1i", name: "u2", value: 1 },
                    { type: "1i", name: "u110", value: 2 },
                    { type: "1i", name: "u109", value: 3 },
                    { type: "1f", name: "u115", value: 1 },
                    { type: "2f", name: "u112", value: [0, 0] },
                  ].concat(e)
                );
                ha.ca()
                  ? (F.j("s106", e),
                    F.j(
                      "s106NormalMap",
                      [{ type: "1i", name: "u161", value: 1 }].concat(e)
                    ),
                    F.j(
                      "s106ParamsMap",
                      [{ type: "1i", name: "u81", value: 1 }].concat(e)
                    ),
                    F.j(
                      "s106NormalParamsMap",
                      [
                        { type: "1i", name: "u161", value: 1 },
                        { type: "1i", name: "u81", value: 2 },
                      ].concat(e)
                    ))
                  : h();
                v = !0;
              },
              to: function () {
                m();
                q();
                h();
              },
              Ad: function () {
                return E.id;
              },
              Cd: function () {
                return x;
              },
              Dd: function () {
                return z;
              },
              set: function (e) {
                Db.Cj(F);
                k[e].set();
              },
              Eb: function (e) {
                return p(e, u());
              },
              he: function (e) {
                return p(e, {
                  name: "_",
                  g: "void main(){gl_FragColor=vec4(.5,.5,.5,.5);}",
                  i: [],
                  precision: D.high,
                });
              },
              wo: function (e) {
                return p(e, {
                  name: "_",
                  g: "const vec4 d=vec4(.5,.5,.5,.5);void main(){gl_FragData[0]=d,gl_FragData[1]=d,gl_FragData[2]=d,gl_FragData[3]=d;}",
                  i: [],
                  precision: D.high,
                  fa: !0,
                });
              },
              M: function () {
                -1 !== g && E.M();
              },
              ke: function () {
                var e = 0;
                E.xa.forEach(function (n, y) {
                  y = E.S[y];
                  c.vertexAttribPointer(n, y, c.FLOAT, !1, E.Zg, e);
                  e += 4 * y;
                });
              },
              fc: function () {
                F.hc(c);
              },
              hc: function (e) {
                e.vertexAttribPointer(E.xa[0], 2, e.FLOAT, !1, 8, 0);
              },
              Iq: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 12, 0);
              },
              Sa: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 32, 0);
              },
              bb: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 24, 0);
              },
              uj: function () {
                c.vertexAttribPointer(E.attributes.a2, 3, c.FLOAT, !1, 32, 12);
              },
              vj: function () {
                c.vertexAttribPointer(E.attributes.a2, 3, c.FLOAT, !1, 24, 12);
              },
              Uc: function () {
                c.vertexAttribPointer(E.attributes.a1, 2, c.FLOAT, !1, 32, 24);
              },
              Jq: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 20, 0);
                c.vertexAttribPointer(E.attributes.a1, 2, c.FLOAT, !1, 20, 12);
              },
              ho: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 32, 0);
                c.vertexAttribPointer(E.attributes.a2, 3, c.FLOAT, !1, 32, 12);
                c.vertexAttribPointer(E.attributes.a1, 2, c.FLOAT, !1, 32, 24);
              },
              io: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 32, 0);
                c.vertexAttribPointer(E.attributes.a2, 3, c.FLOAT, !1, 32, 12);
              },
              jo: function () {
                c.vertexAttribPointer(E.attributes.a0, 3, c.FLOAT, !1, 24, 0);
                c.vertexAttribPointer(E.attributes.a2, 3, c.FLOAT, !1, 24, 12);
              },
              fe: function () {
                c.vertexAttribPointer(E.attributes.a3, 4, c.FLOAT, !1, 16, 0);
              },
              ie: function (e, n) {
                c.uniform1i(E.B[e], n);
              },
              D: function (e, n) {
                c.uniform1f(E.B[e], n);
              },
              O: function (e, n, y) {
                c.uniform2f(E.B[e], n, y);
              },
              Cg: function (e, n) {
                c.uniform2fv(E.B[e], n);
              },
              je: function (e, n, y, Q) {
                c.uniform3f(E.B[e], n, y, Q);
              },
              Dg: function (e, n) {
                c.uniform3fv(E.B[e], n);
              },
              Ba: function (e, n) {
                c.uniform4fv(E.B[e], n);
              },
              Ao: function (e, n) {
                c.uniformMatrix2fv(E.B[e], !1, n);
              },
              Bo: function (e, n) {
                c.uniformMatrix3fv(E.B[e], !1, n);
              },
              Vc: function (e, n) {
                c.uniformMatrix4fv(E.B[e], !1, n);
              },
              j: function (e, n) {
                F.set(e);
                n.forEach(function (y) {
                  switch (y.type) {
                    case "4f":
                      c.uniform4fv(E.B[y.name], y.value);
                      break;
                    case "3f":
                      c.uniform3fv(E.B[y.name], y.value);
                      break;
                    case "2f":
                      c.uniform2fv(E.B[y.name], y.value);
                      break;
                    case "1f":
                      c.uniform1f(E.B[y.name], y.value);
                      break;
                    case "1i":
                      c.uniform1i(E.B[y.name], y.value);
                      break;
                    case "mat2":
                      c.uniformMatrix2fv(E.B[y.name], !1, y.value);
                      break;
                    case "mat4":
                      c.uniformMatrix4fv(E.B[y.name], !1, y.value);
                  }
                });
              },
              I: function () {
                for (var e in k) {
                  var n = k[e];
                  c.detachShader(n.qa, n.vf);
                  c.detachShader(n.qa, n.uf);
                  c.deleteShader(n.vf);
                  c.deleteShader(n.uf);
                  c.deleteProgram(n.qa);
                }
              },
              A: function () {
                c.disableVertexAttribArray(0);
                F.M();
                F.I();
                M = 0;
                v = !1;
                E = null;
                g = -1;
              },
            };
          return F;
        })(),
        Za = (function () {
          var a = {},
            b = [],
            d = !1,
            f = 0,
            l = 0,
            p = -1,
            u = -1,
            h = 1,
            m = null,
            q = !1,
            v = null,
            J = !1,
            t = !1,
            x = !1,
            z = !1,
            k = !1,
            g = !1,
            E = -1,
            M = -1,
            D = !1,
            F = !1,
            e = null,
            n = null,
            y = -1,
            Q = -1,
            B = null,
            A = -1,
            O,
            G = null,
            w = null,
            I = null,
            T = null,
            U = null,
            da = null,
            N = null,
            ra = [
              { type: "1f", name: "u93", value: 0 },
              { type: "1f", name: "u158", value: 0 },
              { type: "1f", name: "u159", value: 0 },
              { type: "1f", name: "u88", value: 1 },
              { type: "1f", name: "u84", value: 0 },
              { type: "1f", name: "u85", value: 0 },
              { type: "1f", name: "u95", value: 1 },
            ],
            Pa = {
              m: function (H, r) {
                a.Fg = H;
                ha.Vg();
                Yc.ff();
                Wb.ff(H.Ce);
                p = H.jf;
                u = H.op;
                h = H.Be;
                E = H.ag;
                M = H.bg;
                var P = [
                  { type: "1f", name: "u88", value: p },
                  { type: "1f", name: "u84", value: E },
                  { type: "1f", name: "u85", value: M },
                  { type: "1f", name: "u89", value: H.Yn },
                  { type: "mat4", name: "u83", value: H.Cn },
                  { type: "2f", name: "u43", value: H.ek },
                ];
                H.Tg = P;
                var ca = [
                  { type: "3f", name: "u90", value: [0, 0, 0] },
                  { type: "3f", name: "u91", value: H.dh },
                  { type: "3f", name: "u92", value: H.bh },
                  { type: "1f", name: "u93", value: 0 },
                  { type: "1f", name: "u94", value: H.Ce },
                  { type: "1f", name: "u95", value: 1 },
                ];
                H.Vj = ca;
                Pa.Bm(H, r);
                d || void 0 !== H.Ha || (H.Ha = [0, 0, 120]);
                F = D = K.wf;
                if (!d && D) {
                  r = 1 * ha.vb();
                  var ka = 1 * ha.ub(),
                    la = { isLinear: !0, isPot: !1, width: r, height: ka };
                  e = ba.instance(la);
                  n = ba.instance(la);
                  y = 1 / r;
                  Q = 1 / ka;
                }
                P = [
                  { type: "1i", name: "u42", value: 1 },
                  { type: "3f", name: "u86", value: H.Ha },
                  { type: "1f", name: "u154", value: H.gd },
                  { type: "1f", name: "u155", value: H.Mb },
                ].concat(P, ca);
                m = H.Oc;
                ca = [
                  { type: "1f", name: "u158", value: m[0] },
                  { type: "1f", name: "u159", value: m[1] },
                ];
                ha.ca()
                  ? ((r = [{ type: "1i", name: "u1", value: 0 }]),
                    (ka = [{ type: "1i", name: "u161", value: 2 }]),
                    C.j("s106NNGLcolor", P.concat(ca)),
                    C.j("s106NNGLtexture", [].concat(r, P, ca)),
                    C.j("s106NNGLtextureNormalMap", [].concat(r, ka, P, ca)),
                    C.j(
                      "s106NNGLtextureParamsMap",
                      [{ type: "1i", name: "u81", value: 2 }].concat(r, P, ca)
                    ),
                    C.j(
                      "s106NNGLtextureNormalParamsMap",
                      [{ type: "1i", name: "u81", value: 3 }].concat(
                        r,
                        ka,
                        P,
                        ca
                      )
                    ))
                  : (C.j("s110", P.concat(ca)),
                    C.j(
                      "s111",
                      [{ type: "1i", name: "u1", value: 0 }].concat(P)
                    ),
                    C.j("s112", P),
                    C.j("s113", P),
                    C.j(
                      "s114",
                      P.concat([{ type: "1i", name: "u161", value: 0 }])
                    ),
                    C.j("s115", P),
                    C.j(
                      "s116",
                      P.concat([{ type: "1i", name: "u81", value: 0 }])
                    ));
                C.j("s82", [{ type: "2f", name: "u102", value: H.Mg }]);
                C.j(W.ga_ ? "s96" : "s97", [
                  { type: "1f", name: "u124", value: H.Je },
                  { type: "3f", name: "u125", value: H.qg },
                  { type: "1f", name: "u126", value: H.We },
                  { type: "1f", name: "u127", value: 1 },
                  { type: "3f", name: "u122", value: H.jk },
                ]);
                if ((O = H.Sd))
                  (B = H.bn),
                    (A = H.Td),
                    C.j("s95", [
                      { type: "4f", name: "u111", value: H.Rd },
                      { type: "1f", name: "u114", value: H.Rf },
                      { type: "2f", name: "u112", value: H.an },
                      { type: "1f", name: "u116", value: Math.sign(A) },
                    ]);
                b.forEach(function (ma) {
                  ma.pj(H);
                });
                d = !0;
              },
              dc: function (H) {
                t && ya.ia.dc(H);
                z && ya.ua.dc(H);
              },
              Bm: function (H, r) {
                void 0 !== ya.ia &&
                  H.jc &&
                  ha.ca() &&
                  (ya.ia.m(H),
                  (J = !0),
                  r.push(function (P) {
                    ya.ia.dc(P);
                    t = !x;
                  }));
                void 0 !== ya.ua &&
                  H.od &&
                  (ya.ua.m(H),
                  r.push(function (P) {
                    ya.ua.dc(P);
                    z = !0;
                  }));
                void 0 !== ya.rc && H.Me && (ya.rc.m(H), (g = k = !0));
                void 0 !== ya.mb &&
                  (ya.mb.m(H),
                  (v = ya.mb.Dm({
                    width: H.Gc,
                    height: 2 * H.Gc,
                    depth: 1.5 * H.Gc,
                    Gl: -H.Af,
                    Wa: H.yf,
                    kl: H.zf,
                  })),
                  (q = !0));
              },
              yo: function (H, r, P, ca) {
                H &&
                  ((N = H),
                  J && ya.ia.ec(H),
                  z && ya.ua.ec(H),
                  k && ya.rc.ec(H),
                  b.forEach(function (ka) {
                    ka.ec(H);
                  }));
                P && (T = P);
                ca && (U = ca);
              },
              Fb: function (H) {
                ha.ca()
                  ? (C.j("s106NNGLcolor", H),
                    C.j("s106NNGLtexture", H),
                    C.j("s106NNGLtextureNormalMap", H),
                    C.j("s106NNGLtextureParamsMap", H),
                    C.j("s106NNGLtextureNormalParamsMap", H))
                  : (C.j("s110", H),
                    C.j("s111", H),
                    C.j("s112", H),
                    C.j("s113", H),
                    C.j("s114", H),
                    C.j("s115", H),
                    C.j("s116", H));
              },
              eb: function (H, r, P) {
                var ca = [H[0] + r[0], H[1] + r[1], H[2] + r[2]];
                ca = [ca[0] + P[0], ca[1] + P[1], ca[2] + P[2]];
                a.ce = ca;
                a.ln = r;
                a.ap = P;
                Pa.Fb([{ type: "3f", name: "u152", value: ca }]);
                ha.ca() && (J && ya.ia.eb(H, r, P), z && ya.ua.eb(ca));
                q && ya.mb.eb(H, P);
              },
              fb: function (H, r, P) {
                var ca = H * r * P;
                a.mn = r;
                a.bp = P;
                a.vm = H;
                Pa.Fb([{ type: "1f", name: "u153", value: ca }]);
                ha.ca() && (J && ya.ia.fb(H * r, P), z && ya.ua.fb(ca));
                q && ya.mb.fb(H, P);
              },
              jj: function () {
                Pa.eb(a.ce, a.ln, a.ap);
                Pa.fb(a.vm, a.mn, a.bp);
                Pa.Aj(a.rx);
                Pa.m(a.Fg);
                Pa.wj(a.Ok, a.Mb);
              },
              Aj: function (H) {
                a.rx = H;
                Pa.Fb([{ type: "1f", name: "u87", value: H }]);
                ha.ca() && (J && ya.ia.Ag(H), z && ya.ua.Ag(H));
              },
              wj: function (H, r) {
                a.Ok = H;
                a.Mb = r;
                Pa.Fb([
                  { type: "1f", name: "u154", value: H },
                  { type: "1f", name: "u155", value: r },
                ]);
              },
              qo: function (H) {
                m = H;
                0 === f &&
                  Pa.Fb([
                    { type: "1f", name: "u158", value: m[0] },
                    { type: "1f", name: "u159", value: m[1] },
                  ]);
              },
              cb: function (H) {
                function r() {
                  q && ya.mb.toggle(!1);
                  O && C.j("s95", [{ type: "1f", name: "u115", value: 0 }]);
                }
                0 >= H
                  ? ((l = 0),
                    0 !== f &&
                      ((f = 0),
                      Wb.Sn(),
                      q && ya.mb.toggle(!0),
                      O &&
                        C.j("s95", [{ type: "1f", name: "u115", value: 1 }])))
                  : 1 <= H
                  ? ((l = 1), 1 !== f && ((f = 1), Wb.Ij(!0)), r())
                  : ((l = H), 2 !== f && (Wb.Ij(!1), (f = 2), r()));
                C.j("s97", [{ type: "1f", name: "u127", value: 1 - H }]);
                var P = 1 - H;
                ra[0].value = l;
                ra[1].value = m[0] * P + -300 * H;
                ra[2].value = m[1] * P + -300 * H;
                ra[3].value = p * P + H * u;
                ra[4].value = E * P;
                ra[5].value = M * P;
                ra[6].value = P + H * h;
                t && ya.ia.Bg(l, ra);
                z && ya.ua.Bg(l, ra);
                Pa.Fb(ra);
              },
              Dl: function (H) {
                N.h(1);
                H.forEach(function (r) {
                  r.yl();
                });
                q && v.W();
              },
              Vm: function () {
                return 1 === f;
              },
              Ke: function (H) {
                N.ya(H);
              },
              mk: function (H) {
                b.push(H);
              },
              Kg: function (H) {
                x = !H;
                t = H && J;
              },
              Jg: function (H) {
                g = H && k;
              },
              wg: function (H) {
                z && ha.ca() && ya.ua.Co(H);
              },
              Gb: function (H) {
                ha.ca() && (J && ya.ia.Gb(H), z && ya.ua.Gb(H));
              },
              Al: function (H, r) {
                if (!F) return !1;
                e.J();
                H.h(0);
                C.set("s88");
                C.O("u15", 0, Q);
                X.l(!1, !1);
                n.u();
                e.h(0);
                C.O("u15", y, 0);
                X.l(!1, !1);
                C.set("s89");
                r.J();
                n.h(0);
                X.l(!1, !1);
                return !0;
              },
              Hj: function (H) {
                F = H && D;
              },
              resize: function (H, r, P) {
                D &&
                  ((H *= P),
                  (r *= P),
                  e.resize(H, r),
                  n.resize(H, r),
                  (y = 1 / H),
                  (Q = 1 / r));
              },
              ug: function (H, r) {
                var P = H.P(),
                  ca = H.$(),
                  ka = { width: P, height: ca, isPot: !1 };
                J && (I && I.remove(), (I = ba.instance(ka)));
                G && G.remove();
                G = Fa.instance({ width: P, height: ca });
                k || z
                  ? (ya.rc.vg(P, ca), w && w.remove(), (w = ba.instance(ka)))
                  : (w = H);
                J && ya.ia.vg(P, ca);
                r && (da && da.remove(), (da = ba.instance(ka)));
              },
              wl: function (H) {
                var r = null;
                switch (f) {
                  case 0:
                    r = H;
                    break;
                  case 2:
                    G.bind(!1, !0);
                    da.u();
                    C.set("s77");
                    C.D("u14", l);
                    H.h(1);
                    U.h(0);
                    X.l(!0, !0);
                    r = da;
                    break;
                  case 1:
                    r = U;
                }
                if (!t || 1 === f || !ha.ca()) return r;
                r.ya(0);
                g && ya.rc.W(r, w);
                G.bind(!1, !g);
                z &&
                  (g ? r.h(0) : (w.u(), C.set("s1"), X.l(!0, !0)), ya.ua.W());
                w.h(0);
                T.ya(2);
                ya.ia.W();
                I.u();
                C.set("s1");
                g || z ? w.h(0) : r.h(0);
                X.l(!0, !W.ga_);
                ya.ia.add();
                return I;
              },
              nk: function (H, r) {
                if (!t) return H;
                T.ya(2);
                ya.ia.W();
                Fa.ba();
                C.set("s76");
                r.J();
                ya.ia.om().h(0);
                X.l(!0, !0);
                C.set("s1");
                c.enable(c.BLEND);
                c.blendFunc(c.ONE, c.ONE_MINUS_SRC_ALPHA);
                H.h(0);
                X.l(!1, !1);
                c.disable(c.BLEND);
                return r;
              },
              Bl: function (H, r) {
                if (!O) return !1;
                C.set("s95");
                C.D("u113", H * A);
                B.h(1);
                Za.Ke(2);
                w ? w.h(3) : r.h(3);
                return !0;
              },
              A: function () {
                d = !1;
                l = f = 0;
                u = p = -1;
                h = 1;
                m = null;
                M = E = -1;
                q = !1;
                v = null;
                g = k = z = x = t = J = !1;
                ya.ia.A();
                ya.La.A();
              },
            };
          return Pa;
        })(),
        Aa = (function () {
          function a() {
            h.forEach(function (r) {
              r.El(w);
            });
          }
          function b() {
            h.forEach(function (r) {
              r.sd(w);
            });
          }
          function d() {
            h.forEach(function (r) {
              r.Cl(w);
            });
          }
          function f() {
            h.forEach(function (r) {
              r.td(w);
            });
          }
          function l() {
            w
              ? Za.Dl(h)
              : h.forEach(function (r) {
                  r.zl();
                });
          }
          function p() {
            A && clearTimeout(A);
            A = setTimeout(function () {
              e = !1;
              A = null;
            }, 16);
          }
          function u(r) {
            r();
          }
          var h = [],
            m = [],
            q = { ha: !1, position: !1, Cb: !1 },
            v = [],
            J = [],
            t = null,
            x = 0,
            z = null,
            k = null,
            g = null,
            E = null,
            M = !1,
            D = !1,
            F = !1,
            e = !1,
            n = !1,
            y = !1,
            Q = null,
            B = null,
            A = null,
            O = null,
            G = !1,
            w = !1,
            I = !1,
            T = !1,
            U = !0,
            da = !1,
            N = !1,
            ra = null,
            Pa = null,
            H = {
              m: function () {
                c.enable(c.DEPTH_TEST);
                c.depthFunc(c.LEQUAL);
                c.clearDepth(1);
                W.il
                  ? (c.enable(c.CULL_FACE),
                    c.frontFace("CCW" === W.jl ? c.CCW : c.CW),
                    c.cullFace(c.BACK))
                  : c.disable(c.CULL_FACE);
                H.xh();
                var r = {
                  isPot: !1,
                  isLinear: !1,
                  width: ha.vb(),
                  height: ha.ub(),
                  L: 4,
                  isFloat: !1,
                };
                z = ba.instance(r);
                r = Object.assign({}, r, {
                  isLinear: !0,
                  width: ha.P(),
                  height: ha.$(),
                });
                k = ba.instance(r);
                g = ba.instance(r);
                W.Qa &&
                  ((r = Object.assign({}, r, { isLinear: !1 })),
                  (E = ba.instance(r)));
                y = Ia.ja();
                W.Qa ||
                  (t = qc.instance({ Lb: W.Lb, wc: W.wc, xc: W.xc, vc: W.vc }));
                M = !0;
              },
              xh: function () {
                ha.ca()
                  ? (q = tc.instance({}))
                  : ((q.ha = Kb.instance({
                      ic: W.Qa ? !1 : "s107",
                      isFloat: !1,
                      Vb: !0,
                      clearColor: [0, 0, 0, 0],
                      L: 4,
                    })),
                    (q.position = Kb.instance({
                      ic: W.Qa ? !1 : "s117",
                      isFloat: !0,
                      Vb: !0,
                      clearColor: [0, 0, 0, 0],
                      L: 4,
                    })),
                    (q.Cb = Kb.instance({
                      ic: !1,
                      isFloat: !0,
                      Vb: !0,
                      clearColor: [0, 0, 0, 0],
                      L: 4,
                    })),
                    (q.Pc = Kb.instance({
                      ic: !1,
                      isFloat: !1,
                      Vb: !0,
                      clearColor: [0, 0, 0, 0],
                      L: 4,
                    })));
              },
              dm: function () {
                return t;
              },
              ra: function (r) {
                t = r;
              },
              $q: function () {},
              Gb: function (r) {
                Za.Gb(r);
              },
              pj: function (r) {
                Za.m(r, v);
                ha.ca() || (q.ha.Bj(!1), q.position.Bj("s110"));
                w = T = !0;
              },
              Gq: function () {
                Za.jj();
              },
              vp: function (r) {
                Za.mk(r);
              },
              co: function (r, P, ca) {
                Za.eb(r, P, ca);
              },
              eo: function (r, P, ca) {
                Za.fb(r, P, ca);
              },
              ao: function (r, P) {
                Za.wj(r, P);
              },
              bo: function (r) {
                Za.qo(r);
              },
              fo: function (r) {
                Za.Aj(r);
              },
              cb: function (r) {
                Za.cb(r);
              },
              qj: function (r, P, ca, ka) {
                Za.yo(r, P, ca, ka);
                P && H.ug(P, ka ? !0 : !1);
                I = !0;
              },
              Kg: function (r) {
                Za.Kg(r);
              },
              wg: function (r) {
                Za.wg(r);
              },
              Jg: function (r) {
                Za.Jg(r);
              },
              Hj: function (r) {
                Za.Hj(r);
              },
              wp: function (r) {
                G &&
                  ((N = !0),
                  ra && ra.remove(),
                  (ra = ba.instance({
                    width: O.P(),
                    height: O.$(),
                    isPot: !1,
                  })),
                  (Pa = r));
              },
              ug: function (r, P) {
                O =
                  "string" === typeof r
                    ? ba.instance({ url: r, isFloat: !1 })
                    : r;
                w && Za.ug(O, P);
                G = !0;
              },
              lk: function (r) {
                h.push(r);
                0 !== v.length &&
                  (v.forEach(function (P) {
                    P(r);
                  }),
                  v.splice(0, v.length));
              },
              Nn: function (r) {
                r = h.indexOf(r);
                -1 !== r && h.splice(r, 1);
              },
              xp: function (r) {
                m.push(r);
              },
              Dq: function (r) {
                r = m.indexOf(r);
                -1 !== r && m.splice(r, 1);
              },
              pe: function (r) {
                w && (D = r);
              },
              animate: function (r) {
                !W.Qa || (w && I)
                  ? D &&
                    (e || (x > W.nn && n)
                      ? (Q && clearTimeout(Q),
                        ++x,
                        window.cancelAnimationFrame(H.animate),
                        (Q = setTimeout(function () {
                          window.requestAnimationFrame(H.animate);
                        }, 16)))
                      : (H.ej(r),
                        ++x,
                        w || (D && window.requestAnimationFrame(H.animate))))
                  : setTimeout(H.animate, 100);
              },
              zp: function (r) {
                J.push(r);
              },
              ej: function (r) {
                if ((!W.Qa || (w && I)) && M) {
                  J.forEach(u);
                  ha.ca()
                    ? q.set() || ha.na()
                      ? (w || Nc.Pn(), l(), q.M(), y && c.depthMask(!1))
                      : (ha.Ro(),
                        H.xh(),
                        Kb.ed(),
                        C.to(),
                        W.Qa && Za.jj(),
                        c.flush(),
                        window.requestAnimationFrame(H.animate))
                    : (w && Za.Ke(1),
                      q.ha.set(!0, !0, !0),
                      b(),
                      q.ha.M(),
                      y && c.depthMask(!1),
                      q.Pc.set(!1, !y, !1),
                      d(),
                      q.Pc.M(),
                      q.position.set(!0, !y, !1),
                      yb.W(),
                      a(),
                      q.position.M(),
                      q.Cb.set(!1, !y, !1),
                      f(),
                      q.Cb.M());
                  c.disable(c.DEPTH_TEST);
                  y || c.depthMask(!1);
                  W.ga_ && Lb.W();
                  var P = H.Vh();
                  if (null !== P) {
                    P.h(7);
                    C.set(W.ga_ ? "s96" : "s97");
                    C.O("u15", 1 / ha.vb(), 1 / ha.ub());
                    Kb.Pk();
                    z.J();
                    da
                      ? (c.enable(c.BLEND),
                        c.clearColor(0, 0, 0, 0),
                        c.clear(c.COLOR_BUFFER_BIT),
                        c.blendFunc(c.ONE, c.ONE_MINUS_SRC_ALPHA),
                        C.D("u132", 1))
                      : c.disable(c.BLEND);
                    w || yb.ef();
                    q.position.h(0);
                    q.Cb.h(1);
                    q.ha.h(2);
                    t.hd(3);
                    q.Pc.h(6);
                    t.jd(4);
                    t.Ch();
                    W.ga_ && Lb.h(5);
                    X.l(!0, !0);
                    da && C.D("u132", 0);
                    Fa.ba();
                    if (da) {
                      c.disable(c.BLEND);
                      var ca = Za.nk(z, k);
                      C.set("s84");
                      g.J();
                      ca.h(0);
                      X.l(!1, !1);
                      k.u();
                      g.h(0);
                      X.l(!1, !1);
                      k.h(0);
                    } else
                      Za.Al(z, k) || (C.set("s1"), k.J(), z.h(0), X.l(!1, !1)),
                        U
                          ? (C.set("s83"),
                            g.J(),
                            k.h(0),
                            X.l(!1, !1),
                            k.u(),
                            g.h(0),
                            T && w
                              ? (C.set("s82"),
                                E.h(1),
                                Za.Ke(2),
                                X.l(!1, !1),
                                C.set("s1"),
                                E.J(),
                                k.h(0),
                                X.l(!1, !1))
                              : (C.set("s81"), X.l(!1, !1), k.h(0)))
                          : k.h(0);
                    Fa.aa();
                    c.viewport(0, 0, ha.P(), ha.$());
                    (!da && w && Za.Bl(r, P)) || C.set("s1");
                    X.l(!1, !1);
                    c.enable(c.DEPTH_TEST);
                    c.depthMask(!0);
                    c.flush();
                  }
                }
              },
              Vh: function () {
                if (!G || da) return ba.ii();
                if (!w) return O;
                if (N && !Za.Vm()) {
                  C.set(Pa);
                  Fa.ba();
                  ra.Wc();
                  ra.u();
                  O.h(0);
                  var r = ra;
                  X.l(!0, !0);
                } else r = O;
                return Za.wl(r);
              },
              Wq: function () {
                W.nl ||
                  D ||
                  ((D = !0),
                  H.animate(Date.now()),
                  F || Ic.Lo(),
                  F || Wb.ib(!1),
                  B && clearTimeout(B),
                  W.ga_ && Lb.ge(),
                  (B = setTimeout(H.va, W.Lk)),
                  F || ha.xm(),
                  (F = !0));
              },
              Xq: function () {
                D && ((n = D = !1), cancelAnimationFrame(H.animate));
              },
              va: function () {
                n ||
                  !F ||
                  e ||
                  W.zh ||
                  ((n = e = !0),
                  B && clearTimeout(B),
                  A && clearTimeout(A),
                  yb.mf().gj(),
                  (B = setTimeout(function () {
                    ha.Xg(W.tn);
                    W.ga_ && Lb.Wj();
                    x = 0;
                    p();
                  }, 24)));
              },
              wake: function () {
                n &&
                  F &&
                  !e &&
                  ((e = !0),
                  (n = !1),
                  (x = 0),
                  yb.mf().gj(),
                  B && clearTimeout(B),
                  A && clearTimeout(A),
                  (B = setTimeout(function () {
                    ha.Xg(1);
                    W.ga_ && Lb.ge();
                    p();
                  }, 16)));
              },
              iq: function () {},
              Op: function () {},
              oe: function (r) {
                T = r;
              },
              Zq: function (r) {
                U = r;
              },
              Jj: function (r) {
                da = r;
              },
              dr: function () {
                C.j("s97", [
                  { type: "1f", name: "u130", value: W.Rc },
                  { type: "1f", name: "u131", value: W.kg },
                ]);
              },
              resize: function (r, P, ca) {
                z.resize(r * ca, P * ca);
                k.resize(r, P);
                g.resize(r, P);
                W.Qa && E.resize(r, P);
                Za.resize(r, P, ca);
                r = [{ type: "2f", name: "u15", value: [1 / r, 1 / P] }];
                C.j("s83", r);
                C.j("s81", r);
                C.j("s84", r);
              },
              I: function () {
                Q && clearTimeout(Q);
                B && clearTimeout(B);
                A && clearTimeout(A);
                h.concat(m).forEach(function (r) {
                  r.I();
                });
                h.splice(0, h.length);
                m.splice(0, m.length);
                q.ha.remove();
                q.Cb.remove();
                q.Pc.remove();
                q.position.remove();
                z.remove();
                k.remove();
                g.remove();
                E && E.remove();
                e = !0;
              },
              A: function () {
                H.I();
                y = n = e = F = D = w = I = e = !1;
              },
            };
          return H;
        })(),
        ya = {},
        ha = (function () {
          function a() {
            Kb.resize(d * m, f * m);
            z.ca() && tc.resize(d * m, f * m);
            Aa.resize(d, f, m);
            W.ga_ && Lb.resize(d * m, f * m, m);
            z.Vg();
          }
          var b = null,
            d = 0,
            f = 0,
            l = -1,
            p = !1,
            u = {
              re: !1,
              Ng: !1,
              Tj: !1,
              Gg: !1,
              drawBuffers: !1,
              Om: !1,
              zi: !1,
              Qm: !1,
              Hf: !1,
              $a: !1,
            },
            h = Object.assign({}, u),
            m = 1,
            q = !1,
            v = !1,
            J = !1,
            t = !1,
            x = !1,
            z = {
              m: function (k) {
                void 0 !== k.onload && k.onload && (v = k.onload);
                void 0 === k.expand && (k.expand = !1);
                void 0 === k.Id && (k.Id = !1);
                void 0 === k.sa && (k.sa = !1);
                void 0 === k.Rb && (k.Rb = !1);
                void 0 === k.alpha && (k.alpha = !1);
                void 0 === k.preserveDrawingBuffer &&
                  (k.preserveDrawingBuffer = !1);
                k.Id && (p = !0);
                b = k.sa ? k.sa : document.getElementById(k.cl);
                k.expand && z.expand();
                try {
                  c = k.Rb
                    ? k.Rb.Ql()
                    : b.getContext("webgl", {
                        antialias: !1,
                        alpha: k.alpha,
                        depth: !0,
                        premultipliedAlpha: !1,
                        stencil: !1,
                        preserveDrawingBuffer: k.preserveDrawingBuffer,
                      });
                  window.gk || (window.gk = c);
                  t = k.Rb ? k.Rb.na() : !1;
                  J = !t;
                  8 > c.getParameter(c.MAX_TEXTURE_IMAGE_UNITS) &&
                    z.pd("too few texture image units");
                  if (!Ia.m()) return z.pd("invalid config");
                  W.Yo &&
                    ((h.Ng = c.getExtension("EXT_texture_filter_anisotropic")),
                    h.Ng && (h.zi = !0));
                  W.Zo &&
                    ((h.re = c.getExtension("WEBGL_compressed_texture_s3tc")),
                    h.re &&
                      void 0 !== h.re.COMPRESSED_RGBA_S3TC_DXT5_EXT &&
                      h.re.COMPRESSED_RGBA_S3TC_DXT5_EXT &&
                      (h.Om = !0));
                  J &&
                    ((h.Tj =
                      c.getExtension("OES_element_index_uint") ||
                      c.getExtension("MOZ_OES_element_index_uint") ||
                      c.getExtension("WEBKIT_OES_element_index_uint")),
                    h.Tj && (h.Qm = !0));
                  !t &&
                    W.$o &&
                    ((h.Gg = c.getExtension("EXT_sRGB")), h.Gg && (h.Hf = !0));
                  J
                    ? ((h.drawBuffers = c.getExtension("WEBGL_draw_buffers")),
                      h.drawBuffers && !W.yh && (h.$a = !0))
                    : (h.$a = 4 <= c.getParameter(c.MAX_DRAW_BUFFERS));
                  if (h.$a) {
                    var g = z.pl();
                    h.$a = h.$a && g;
                  }
                } catch (E) {
                  return z.pd(E);
                }
                if (null === c || !c) return z.pd("NO_GL");
                k.expand && window.addEventListener("resize", z.expand, !1);
                b.addEventListener(
                  "contextmenu",
                  function (E) {
                    E.preventDefault();
                    return !1;
                  },
                  !1
                );
                d = b.width;
                f = b.height;
                z.Df();
                return !0;
              },
              Df: function () {
                l = p ? 3 : 2;
                Ia.ja() || (l = Math.min(l, 1));
                Ia.Zk() || (l = Math.min(l, 0));
                Yc.m();
                Kb.m();
                for (var k in ya) ya[k].Sc();
                C.m();
                yb.m();
                Wb.m();
                Aa.m();
                Ic.m();
                W.ga_ && Lb.m();
                z.Vg();
                z.rl();
                q = !0;
                v && v();
                return !0;
              },
              rl: function () {
                if (h.$a) {
                  var k = tc.instance({ width: 256, height: 1 });
                  k.bind();
                  c.viewport(0, 0, 256, 1);
                  C.set("s105");
                  C.Ba("color", [1, 0, 0, 1]);
                  X.l(!0, !0);
                  c.clearColor(0, 0, 0, 0);
                  c.clear(c.COLOR_BUFFER_BIT || c.DEPTH_BUFFER_BIT);
                  Fa.aa();
                  C.set("s1");
                  k.Cb.h(0);
                  X.l(!1, !1);
                  k = new Uint8Array(1024);
                  c.readPixels(0, 0, 256, 1, c.RGBA, c.UNSIGNED_BYTE, k);
                  x = 1 >= k[1020];
                }
              },
              pl: function () {
                var k = tc.instance({ width: 1, height: 1 });
                if (!k.set()) return k.remove(), !1;
                C.wo(c);
                X.Qb(c);
                c.bindFramebuffer(c.FRAMEBUFFER, null);
                C.Eb(c);
                k.ha.ya(0);
                X.Qb(c);
                var g = new Uint8Array(4);
                c.readPixels(0, 0, 1, 1, c.RGBA, c.UNSIGNED_BYTE, g);
                k.remove();
                return 3 < Math.abs(g[0] - 127) ? !1 : !0;
              },
              na: function () {
                return t;
              },
              P: function () {
                return d;
              },
              $: function () {
                return f;
              },
              vb: function () {
                return m * z.P();
              },
              ub: function () {
                return m * z.$();
              },
              Rl: function () {
                return d / f;
              },
              X: function () {
                return l;
              },
              qq: function () {
                return 3 === l;
              },
              zb: function () {
                return q;
              },
              Ci: function () {
                return x;
              },
              ca: function () {
                return h.$a;
              },
              Ro: function () {
                h.$a = !1;
              },
              tq: function () {
                return !1;
              },
              al: function () {
                return 0 < z.X();
              },
              Fp: function () {
                return z.ca() && 0 < z.X();
              },
              lf: function (k) {
                var g = c,
                  E = "";
                t || ((g = h.drawBuffers), (E = "_WEBGL"));
                return [
                  g["COLOR_ATTACHMENT0" + E],
                  g["COLOR_ATTACHMENT1" + E],
                  g["COLOR_ATTACHMENT2" + E],
                  g["COLOR_ATTACHMENT3" + E],
                ].splice(0, k);
              },
              zd: function (k) {
                return z.lf(4)[k];
              },
              sm: function () {
                return t
                  ? c.SRGB
                    ? c.SRGB
                    : c.RGBA
                  : h.Hf
                  ? h.Gg.SRGB_ALPHA_EXT
                  : c.RGBA;
              },
              Rm: function () {
                return h.zi;
              },
              Wl: function () {
                return h.Ng;
              },
              en: function (k) {
                z.na()
                  ? c.drawBuffers(z.lf(k))
                  : h.drawBuffers.drawBuffersWEBGL(z.lf(k));
              },
              expand: function () {
                Aa.wake();
                z.resize(window.innerWidth, window.innerHeight);
                Aa.va();
              },
              resize: function (k, g) {
                !b ||
                  (k === d && g === f) ||
                  ((d = k),
                  (f = g),
                  (b.width = d),
                  (b.height = f),
                  q && (yb.resize(), a()));
              },
              Vg: function () {
                var k = [
                  {
                    type: "2f",
                    name: "u15",
                    value: [1 / ha.vb(), 1 / ha.ub()],
                  },
                ];
                C.j("s83", k);
                C.j("s81", k);
              },
              Xg: function (k) {
                m = k;
                a();
              },
              Ma: function (k, g) {
                b.addEventListener(k, g, !1);
              },
              pd: function () {
                l = -1;
                return !1;
              },
              sh: function () {
                return 0 <= l;
              },
              wq: function () {},
              Hq: function () {},
              Uq: function () {
                var k = document.getElementById("loading");
                k && (k.style.display = "block");
              },
              xm: function () {
                var k = document.getElementById("loading");
                k && (k.style.display = "none");
              },
              I: function () {
                z.sh() &&
                  (ba.Uj(),
                  Aa.I(),
                  X.I(),
                  Kb.I(),
                  W.ga_ && Lb.I(),
                  qc.I(),
                  Ic.I(),
                  C.I(),
                  ba.I(),
                  c.flush(),
                  (c = null));
              },
              A: function () {
                Aa.A();
                Za.A();
                C.A();
                tc.A();
                Kb.A();
                Object.assign(h, u);
                q = J = !1;
              },
            };
          return z;
        })(),
        yb = (function () {
          var a = !1,
            b = !1,
            d = [];
          return {
            m: function () {},
            instance: function (f) {
              void 0 === f.hj && (f.hj = !0);
              void 0 === f.Fe && (f.Fe = 0.1);
              void 0 === f.Ee && (f.Ee = 100);
              void 0 === f.direction && (f.direction = [0, 0, -1]);
              void 0 === f.Uh && (f.Uh = 45);
              var l = new hc(),
                p = new Wa(50, -50, -400),
                u = null;
              l.setPosition(p);
              var h = new Int8Array(20),
                m = new Int8Array(20),
                q = 0,
                v = 0,
                J = 0,
                t = 0,
                x = {
                  W: function () {
                    m[C.Ad()] || (C.Vc("u133", l.elements), (m[C.Ad()] = 1));
                    h[C.Ad()] || (C.Vc("u145", u), (h[C.Ad()] = 1));
                  },
                  df: function () {
                    v || (C.Vc("u133", l.elements), (v = 1));
                    q || (C.O("u134", u[0], u[5]), (q = 1));
                  },
                  ef: function () {
                    J || (C.je("u122", p.x, p.y, p.z), (J = 1));
                  },
                  Nb: function () {
                    t || (C.je("u162", p.x, p.y, p.z), (t = 1));
                  },
                  uh: function () {
                    var z = f.Fe,
                      k = f.Ee,
                      g = Math.tan((0.5 * f.Uh * Math.PI) / 180);
                    u = [
                      0.5 / g,
                      0,
                      0,
                      0,
                      0,
                      (0.5 * ha.Rl()) / g,
                      0,
                      0,
                      0,
                      0,
                      -(k + z) / (k - z),
                      -1,
                      0,
                      0,
                      (-2 * k * z) / (k - z),
                      0,
                    ];
                    for (z = 0; 20 > z; ++z) h[z] = 0;
                    q = 0;
                  },
                  ro: function (z, k) {
                    p.nj(k[0]).oj(k[1]).z = k[2];
                    l.elements.set(z);
                    for (z = 0; 20 > z; ++z) m[z] = 0;
                    t = J = v = 0;
                  },
                  gj: function () {
                    for (var z = (t = J = 0); 20 > z; ++z) m[z] = 0;
                  },
                };
              x.uh();
              a = x;
              b = !0;
              f.hj && d.push(x);
              return x;
            },
            W: function () {
              b && a.W();
            },
            df: function () {
              b && a.df();
            },
            ef: function () {
              b && a.ef();
            },
            Nb: function () {
              b && a.Nb();
            },
            resize: function () {
              d.forEach(function (f) {
                f.uh();
              });
            },
            mf: function () {
              return a;
            },
          };
        })(),
        Kb = (function () {
          var a = [],
            b = null;
          return {
            m: function () {
              b = Fa.instance({
                width: ha.vb(),
                height: ha.ub(),
                Hc: !ha.ca(),
              });
            },
            instance: function (d) {
              void 0 === d.width && (d.width = ha.vb());
              void 0 === d.height && (d.height = ha.ub());
              void 0 === d.isFloat && (d.isFloat = !1);
              void 0 === d.Vb && (d.Vb = !1);
              void 0 === d.clearColor && (d.clearColor = [0, 0, 0, 0]);
              void 0 === d.L && (d.L = 4);
              var f = ba.instance({
                  isFloat: d.isFloat && Ia.ja(),
                  U: d.isFloat,
                  width: d.width,
                  height: d.height,
                  isPot: !1,
                  isLinear: !1,
                  L: d.L,
                }),
                l = void 0 !== d.ic && d.ic ? !0 : !1,
                p = d.ic,
                u = {
                  set: function (h, m, q) {
                    q && b.bind(!1, q);
                    f.u();
                    h &&
                      (c.clearColor(
                        d.clearColor[0],
                        d.clearColor[1],
                        d.clearColor[2],
                        d.clearColor[3]
                      ),
                      b.Re());
                    m && b.th();
                    l && C.set(p);
                  },
                  Bj: function (h) {
                    l = (p = h) ? !0 : !1;
                  },
                  M: function () {
                    f.te();
                  },
                  h: function (h) {
                    f.h(h);
                  },
                  resize: function (h, m) {
                    f.resize(h, m);
                  },
                  debug: function () {
                    f.debug();
                  },
                  remove: function () {
                    f.remove();
                  },
                };
              d.Vb && a.push(u);
              return u;
            },
            resize: function (d, f) {
              b.resize(d, f);
              a.forEach(function (l) {
                l.resize(d, f);
              });
            },
            Pk: function () {
              b.mh();
            },
            ed: function () {
              b.ed();
            },
            Wc: function () {
              b.Wc();
            },
            Ip: function () {
              b.th();
            },
            Hp: function () {
              b.Re();
            },
            Gp: function () {
              b.clear();
            },
            I: function () {
              b.remove();
            },
            A: function () {
              b.remove();
              a.forEach(function (d) {
                d.remove();
              });
              a.splice(0);
            },
          };
        })(),
        tc = (function () {
          var a = [];
          return {
            instance: function (b) {
              void 0 === b.width && (b.width = ha.vb());
              void 0 === b.height && (b.height = ha.ub());
              var d = c.createFramebuffer(),
                f = b.width,
                l = b.height,
                p = !0;
              b = {
                isFloat: Ia.ja(),
                U: !0,
                width: f,
                height: l,
                isPot: !1,
                isLinear: !1,
                L: 4,
              };
              var u = ba.instance(b),
                h = ba.instance(b),
                m = ba.instance(b),
                q = ba.instance(b),
                v = Fa.Xl(),
                J = Fa.$h();
              c.bindFramebuffer(v, d);
              var t = c.createRenderbuffer();
              c.bindRenderbuffer(c.RENDERBUFFER, t);
              c.renderbufferStorage(c.RENDERBUFFER, c.DEPTH_COMPONENT16, f, l);
              c.framebufferRenderbuffer(
                v,
                c.DEPTH_ATTACHMENT,
                c.RENDERBUFFER,
                t
              );
              c.clearDepth(1);
              c.framebufferTexture2D(v, ha.zd(0), c.TEXTURE_2D, u.get(), 0);
              c.framebufferTexture2D(v, ha.zd(1), c.TEXTURE_2D, h.get(), 0);
              c.framebufferTexture2D(v, ha.zd(2), c.TEXTURE_2D, q.get(), 0);
              c.framebufferTexture2D(v, ha.zd(3), c.TEXTURE_2D, m.get(), 0);
              ha.en(4);
              c.bindFramebuffer(v, null);
              Fa.reset();
              var x = {
                position: u,
                Cb: h,
                Pc: m,
                ha: q,
                bind: function () {
                  c.bindFramebuffer(v, d);
                  Fa.reset();
                },
                set: function () {
                  p && c.checkFramebufferStatus(J);
                  c.bindFramebuffer(v, d);
                  Fa.reset();
                  if (p) {
                    if (c.checkFramebufferStatus(J) !== c.FRAMEBUFFER_COMPLETE)
                      return !1;
                    p = !1;
                  }
                  c.viewport(0, 0, f, l);
                  c.clearColor(0, 0, 0, 0);
                  C.zb() && !ha.Ci() && (C.set("s104"), X.l(!1, !1));
                  c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
                  return !0;
                },
                M: function () {},
                resize: function (z, k) {
                  f = z;
                  l = k;
                  u.resize(z, k);
                  h.resize(z, k);
                  q.resize(z, k);
                  m.resize(z, k);
                  c.bindRenderbuffer(c.RENDERBUFFER, t);
                  c.renderbufferStorage(
                    c.RENDERBUFFER,
                    c.DEPTH_COMPONENT16,
                    f,
                    l
                  );
                  c.bindRenderbuffer(c.RENDERBUFFER, null);
                },
                remove: function () {
                  u.remove();
                  h.remove();
                  q.remove();
                  m.remove();
                  c.deleteRenderbuffer(t);
                  c.deleteFramebuffer(d);
                  var z = a.indexOf(x);
                  -1 !== z && a.splice(z, 1);
                },
              };
              a.push(x);
              return x;
            },
            resize: function (b, d) {
              a.forEach(function (f) {
                f.resize(b, d);
              });
            },
            A: function () {
              a.forEach(function (b) {
                b.remove();
              });
              a.splice(0);
            },
          };
        })(),
        qc = (function () {
          var a = [],
            b = W.kh;
          return {
            instance: function (d) {
              function f() {
                m
                  ? l()
                  : ((q = ge.instance({ V: t.pb, Nm: b })),
                    (h = W.Mk[ha.X()]),
                    (t.yb = ba.instance({
                      isFloat: Ia.ja(),
                      U: !0,
                      isPot: !0,
                      isLinear: !1,
                      isMirrorY: !0,
                      width: h,
                      height: h / 2,
                      L: 3,
                    })),
                    (t.Jd = ba.instance({
                      isFloat: Ia.ja(),
                      U: !0,
                      isPot: !0,
                      isLinear: !1,
                      isMirrorY: !0,
                      width: h,
                      height: h / 2,
                      L: 3,
                    })),
                    (t.Qd = ba.instance({
                      isFloat: Ia.ja(),
                      U: !0,
                      isPot: !0,
                      width: 1,
                      height: h / 2,
                      L: 3,
                    })),
                    (t.Kd = ba.instance({
                      isFloat: Ia.ja() && !b,
                      U: !b,
                      isPot: !1,
                      isLinear: !0,
                      isMirrorY: !0,
                      isMipmap: !1,
                      width: h,
                      height: h / 2,
                      L: b ? 4 : 3,
                    })),
                    (m = !0),
                    l(),
                    J.forEach(function (x) {
                      x();
                    }),
                    J.splice(0, J.length));
              }
              function l() {
                if (m) {
                  Fa.ba();
                  q.ko(t.pb);
                  q.Ln();
                  t.yb.J();
                  C.set("s87");
                  t.pb.h(0);
                  C.D("u97", W.Rc);
                  ba.Uk(1);
                  X.l(!0, !0);
                  for (var x = W.Em[ha.X()], z = 0; z < x; ++z)
                    t.Jd.u(),
                      C.set("s90"),
                      C.O("u15", 1 / h, 0),
                      t.yb.h(0),
                      X.l(!1, !1),
                      t.yb.u(),
                      C.O("u15", 0, 2 / h),
                      t.Jd.h(0),
                      X.l(!1, !1);
                  t.Qd.J();
                  C.set("s92");
                  t.yb.h(0);
                  X.l(!1, !1);
                  C.set(b ? "s94" : "s93");
                  t.Kd.J();
                  t.yb.h(0);
                  t.Qd.h(1);
                  X.l(!1, !1);
                  ba.aa(0);
                  ba.aa(1);
                }
              }
              var p = Object.assign({ Lb: null, wc: null, vc: 0, xc: 0 }, d),
                u = 0,
                h = 0,
                m = !1,
                q = null,
                v = 0,
                J = [],
                t = {
                  xd: null,
                  pa: null,
                  pb: null,
                  yb: null,
                  Jd: null,
                  Kd: null,
                  Qd: null,
                };
              d = {
                m: function () {
                  function x() {
                    2 === ++z &&
                      ((t.pb = ba.instance({
                        isFloat: Ia.ja(),
                        U: !0,
                        isPot: !1,
                        isLinear: !0,
                        width: u,
                        height: u / 2,
                        L: 3,
                      })),
                      Fa.ba(),
                      t.pb.J(),
                      C.set("s86"),
                      C.D("u105", p.xc),
                      C.D("u106", p.vc),
                      t.xd.h(0),
                      t.pa.h(1),
                      X.l(!0, !0),
                      f());
                  }
                  var z = 0;
                  u = W.Nk[ha.X()];
                  v = Math.log2(u) - 1;
                  p.Lb &&
                    ((t.xd = ba.instance({
                      isPot: !1,
                      url: p.Lb,
                      C: x,
                      L: 3,
                      isFlipY: !1,
                    })),
                    (t.pa = ba.instance({
                      isPot: !1,
                      url: p.wc,
                      C: x,
                      L: 3,
                      isFlipY: !1,
                    })));
                },
                xg: function (x) {
                  t.pb = x;
                  f();
                },
                hd: function (x) {
                  m && (q.h(x), C.D("u123", q.P()));
                },
                jd: function (x) {
                  m && t.Kd.h(x);
                },
                Ch: function () {
                  C.D("u3", v);
                },
                Wh: function () {
                  return v;
                },
                P: function () {
                  return u;
                },
                zc: function (x) {
                  m ? x() : J.push(x);
                },
                I: function () {
                  t.xd && t.xd.remove();
                  t.pa && t.pa.remove();
                  t.yb.remove();
                  t.Qd.remove();
                  t.Jd.remove();
                  q.remove();
                  t.Kd.remove();
                  t.pb.remove();
                },
              };
              a.push(d);
              d.m();
              return d;
            },
            I: function () {
              a.forEach(function (d) {
                d.I();
              });
            },
          };
        })(),
        Nd = {
          instance: function (a) {
            var b = a.Zm,
              d = a.Xm,
              f = 0,
              l = b.P();
            a = W.kh;
            var p = ba.instance({
                isFloat: Ia.ja() && !a,
                U: !a,
                isLinear: !0,
                isMipmap: !1,
                isPot: !1,
                width: l,
                L: a ? 4 : 3,
                isFlipY: !1,
              }),
              u = ba.instance({
                isFloat: Ia.ja() && !a,
                U: !a,
                isPot: !1,
                isLinear: !0,
                lq: !0,
                isMipmap: !1,
                width: l,
                height: l / 2,
                L: a ? 4 : 3,
              }),
              h = Fa.instance({ width: l, height: l }),
              m = a ? "s78" : "s77";
            return {
              xo: function (q) {
                f = q;
                C.set(m);
                c.viewport(0, 0, l, l);
                h.u();
                p.u();
                C.D("u14", f);
                b.hd(1);
                d.hd(0);
                X.l(!0, !0);
                c.viewport(0, 0, l, l / 2);
                u.u();
                b.jd(1);
                d.jd(0);
                X.l(!1, !1);
                c.flush();
              },
              hd: function (q) {
                p.h(q);
              },
              jd: function (q) {
                u.h(q);
              },
              Ch: function () {
                C.D("u3", b.Wh() * (1 - f) + d.Wh() * f);
              },
            };
          },
        },
        Wb = (function () {
          function a(O) {
            var G = (e - W.Pe) / (W.ph - W.Pe);
            G = 1 - Math.pow(1 - G, W.sp);
            e += O * (1 + G * W.tp);
            e = Math.min(Math.max(e, W.Pe), W.ph);
            A.ib();
          }
          function b(O) {
            -1 !== h &&
              ((E = g = 0),
              u(),
              a((W.qp * O.deltaY) / window.innerHeight),
              O.preventDefault());
          }
          function d() {
            D += g;
            F += E;
            F = Math.min(Math.max(F, W.xn), W.wn);
            A.ib();
          }
          function f(O) {
            if (0 === h || -1 === h) return !1;
            var G = void 0 !== O.touches && O.touches.length;
            O.preventDefault();
            if (2 === h) {
              var w = ud(
                O.touches[0].pageX,
                O.touches[0].pageY,
                O.touches[1].pageX,
                O.touches[1].pageY
              );
              a(-(z - w) * W.yn);
              z = w;
            } else
              (w = G ? O.touches[0].clientX : O.clientX),
                (O = G ? O.touches[0].clientY : O.clientY),
                (g = (2 * (w - t) * Math.PI) / ha.P()),
                (E = (2 * (O - x) * Math.PI) / ha.$()),
                4 === h
                  ? ((B[0] += g * W.Ui),
                    (B[1] -= E * W.Ui),
                    (B[0] = Math.min(Math.max(B[0], -W.Xi), W.Xi)),
                    (B[1] = Math.min(Math.max(B[1], -W.Yi), W.Yi)),
                    A.ib())
                  : d(),
                (t = w),
                (x = O);
          }
          function l() {
            0 !== h &&
              -1 !== h &&
              ((0 === g && 0 === E) || 1 !== h || !y
                ? Aa.va()
                : (u(), (k = Date.now()), (n = setInterval(A.Wm, M))),
              (h = 0));
          }
          function p(O) {
            if (2 !== h && -1 !== h) {
              E = g = 0;
              u();
              Aa.wake();
              var G = void 0 !== O.changedTouches && O.touches.length;
              O.preventDefault();
              G && 2 === O.touches.length
                ? ((h = 2),
                  (z = ud(
                    O.touches[0].pageX,
                    O.touches[0].pageY,
                    O.touches[1].pageX,
                    O.touches[1].pageY
                  )))
                : ((h = G || 2 !== O.button ? 1 : 4),
                  (t = G ? O.touches[0].clientX : O.clientX),
                  (x = G ? O.touches[0].clientY : O.clientY));
              return !1;
            }
          }
          function u() {
            n && (clearInterval(n), (n = !1));
          }
          var h = 0,
            m = !1,
            q = !1,
            v = !1,
            J = 1,
            t = 0,
            x = 0,
            z = 0,
            k = 0,
            g = 0,
            E = 0,
            M = 16,
            D = W.Oj,
            F = W.Wi,
            e = W.Oe,
            n = !1,
            y = 0,
            Q = new Float32Array([0, 0, 0, 0, 0]),
            B = [W.Xk, W.Yk],
            A = {
              m: function () {
                y = W.qk[ha.X()];
                M = W.ud[ha.X()];
                ha.Ma("mousedown", p);
                ha.Ma("mouseup", l);
                ha.Ma("mouseout", l);
                ha.Ma("mousemove", f);
                ha.Ma("mousemove", f);
                ha.Ma("wheel", b);
                ha.Ma("touchstart", p);
                ha.Ma("touchend", l);
                ha.Ma("touchmove", f);
              },
              ib: function (O) {
                m
                  ? ((q[0] = -F),
                    (q[1] = D),
                    (v[1].value = (J / W.Oe) * e),
                    Za.Fb(v))
                  : ((Q[0] = D),
                    (Q[1] = F),
                    (Q[2] = e),
                    (Q[3] = B[0]),
                    (Q[4] = B[1]),
                    Ic.Zn(Q, O));
              },
              Wm: function () {
                if ((1e-4 > g && 1e-4 > E) || -1 === h)
                  u(), (E = g = 0), 0 === h && Aa.va();
                var O = Date.now(),
                  G = O - k;
                k = O;
                O = Math.pow(y, G / M);
                g *= O;
                E *= O;
                d();
              },
              ff: function (O) {
                m ||
                  ((m = !0),
                  (h = -1),
                  (q = [0, 0, 0]),
                  (v = [
                    { name: "u90", type: "3f", value: q },
                    { name: "u94", type: "1f", value: 1 },
                  ]),
                  (J = O));
              },
              Ij: function (O) {
                -1 === h && O && (h = 0);
                O || (h = -1);
              },
              Sn: function () {
                E = g = 0;
                D = W.Oj;
                F = W.Wi;
                e = W.Oe;
                A.ib();
              },
              Lq: function (O) {
                e = O;
              },
              Mq: function (O) {
                B[0] = O[0];
                B[1] = O[1];
                W.qh = O[2];
              },
              Kq: function (O, G) {
                D = O;
                F = G;
              },
            };
          return A;
        })(),
        Nc = (function () {
          var a = {
            s106: !1,
            s106color: !1,
            s106NormalMap: !1,
            s106ParamsMap: !1,
            s106NormalParamsMap: !1,
          };
          return {
            instance: function (b) {
              function d(r) {
                if (!H) return Promise.reject("REMOVED");
                x.ld && x.ld(r);
                O = r.partsNames || [];
                A.splice(0);
                A.push({ n: 0, offset: 0 });
                y.min.set(Infinity, Infinity, Infinity);
                y.max.set(-Infinity, -Infinity, -Infinity);
                var P = r.uvs;
                P &&
                  (P = P.filter(function (Ta) {
                    return Ta;
                  }));
                N = P && 0 < P.length && 0 < P[0].length ? !0 : !1;
                var ca = r.normals && r.normals.length ? !0 : !1;
                "undefined" !== typeof $b &&
                  "string" === typeof r.faces &&
                  (r.faces = $b(r.faces));
                "undefined" !== typeof Ob &&
                  ("string" === typeof r.vertices &&
                    (r.vertices = Ob(r.vertices)),
                  ca &&
                    "string" === typeof r.normals &&
                    (r.normals = Ob(r.normals)),
                  P &&
                    P.length &&
                    P.forEach(function (Ta, wa) {
                      "string" === typeof Ta && (P[wa] = Ob(Ta));
                    }));
                var ka = r.metadata.faces,
                  la = 1 + (N ? 1 : 0);
                ka = (r.faces.length - ka) / (r.metadata.faces * la);
                (6 !== ka && 8 !== ka) || N || (++la, (ka /= 2));
                if (4 === ka) {
                  ka = 6 * la + 2;
                  for (
                    var ma = 4 * la + 1,
                      qa = Array(r.metadata.faces * ka),
                      oa = 0;
                    oa < r.metadata.faces;
                    ++oa
                  )
                    for (var Ca = 0; Ca < la; ++Ca)
                      (qa[oa * ka + 4 * Ca] = r.faces[oa * ma + 5 * Ca]),
                        (qa[oa * ka + 4 * Ca + 1] =
                          r.faces[oa * ma + 5 * Ca + 1]),
                        (qa[oa * ka + 4 * Ca + 2] =
                          r.faces[oa * ma + 5 * Ca + 2]),
                        0 === Ca && (qa[oa * ka + 3] = r.faces[oa * ma + 4]),
                        (qa[oa * ka + 4 * Ca + 3 * la + 1] =
                          r.faces[oa * ma + 5 * Ca]),
                        (qa[oa * ka + 4 * Ca + 3 * la + 2] =
                          r.faces[oa * ma + 5 * Ca + 2]),
                        (qa[oa * ka + 4 * Ca + 3 * la + 3] =
                          r.faces[oa * ma + 5 * Ca + 3]),
                        0 === Ca &&
                          (qa[oa * ka + 3 * la + 4] = r.faces[oa * ma + 4]);
                  r.faces = qa;
                  r.metadata.faces *= 2;
                }
                ka = r.metadata.vertices;
                z = Array(ka);
                for (ma = 0; ma < ka; ++ma)
                  (z[ma] = new Wa(
                    r.vertices[3 * ma],
                    r.vertices[3 * ma + 1],
                    r.vertices[3 * ma + 2]
                  )),
                    Sd(y, z[ma]);
                ka = r.metadata.faces;
                k = Array(ka);
                la = 3 * la + 1;
                for (ma = 0; ma < ka; ++ma)
                  (k[ma] = new Uc(
                    r.faces[la * ma],
                    r.faces[la * ma + 1],
                    r.faces[la * ma + 2]
                  )),
                    (k[ma].$b = r.faces[la * ma + 3]);
                if (ca)
                  for (
                    ca = r.metadata.normals, g = Array(ca), la = 0;
                    la < ca;
                    ++la
                  )
                    g[la] = new Wa(
                      r.normals[3 * la],
                      r.normals[3 * la + 1],
                      r.normals[3 * la + 2]
                    );
                else Vd(z, k), (g = Wd(z, k));
                w = 3 < z.length;
                H && (H.visible = w);
                if (N) {
                  ca = Array(z.length);
                  la = ["a", "b", "c"];
                  for (ka = 0; ka < r.metadata.faces; ++ka)
                    for (ma = 0; 3 > ma; ++ma)
                      if (
                        ((qa = r.faces[7 * ka + ma]),
                        (oa = r.faces[7 * ka + 1 + ma + 3]),
                        "undefined" === typeof ca[qa])
                      )
                        ca[qa] = [[qa, oa]];
                      else if (ca[qa][0][1] !== oa) {
                        Ca = -1;
                        for (var Y = 1; Y < ca[qa].length; ++Y)
                          if (ca[qa][Y][1] === oa) {
                            Ca = ca[qa][Y][0];
                            break;
                          }
                        Y = -1;
                        -1 === Ca
                          ? ((Y = z.length),
                            z.push(z[qa].clone()),
                            g.push(g[qa].clone()),
                            ca[qa].push([Y, oa]),
                            (ca[Y] = [[Y, oa]]))
                          : (Y = Ca);
                        r.faces[7 * ka + ma] = Y;
                        k[ka][la[ma]] = Y;
                      }
                  E = Array(z.length);
                  for (r = 0; r < z.length; ++r)
                    (la = "undefined" === typeof ca[r] ? r : ca[r][0][1]),
                      (E[r] = new fc(P[0][2 * la], P[0][2 * la + 1]));
                }
                var ia = Hc(y);
                x.ih &&
                  (z.forEach(function (Ta) {
                    Ta.x -= ia.x;
                    Ta.z -= ia.z;
                    Ta.y -= y.min.y;
                  }),
                  (y.min.x -= ia.x),
                  (y.max.x -= ia.x),
                  (y.min.z -= ia.z),
                  (y.max.z -= ia.z),
                  (y.max.y -= y.min.y),
                  (y.min.y = 0));
                if (x.jh) {
                  var ta =
                    W.Kk /
                    Math.max(
                      y.max.x - y.min.x,
                      y.max.y - y.min.y,
                      y.max.z - y.min.z
                    );
                  z.forEach(function (Ta) {
                    Ta.Fa(ta);
                  });
                  y.min.Fa(ta);
                  y.max.Fa(ta);
                }
                r = N ? 8 : 6;
                ca = new Float32Array(z.length * r);
                for (la = 0; la < z.length; ++la)
                  (ca[r * la] = z[la].x),
                    (ca[r * la + 1] = z[la].y),
                    (ca[r * la + 2] = z[la].z),
                    (ca[r * la + 3] = g[la].x),
                    (ca[r * la + 4] = g[la].y),
                    (ca[r * la + 5] = g[la].z),
                    N &&
                      ((ca[r * la + 6] = E[la].x), (ca[r * la + 7] = E[la].y));
                k.sort(function (Ta, wa) {
                  return Ta.$b - wa.$b;
                });
                var Ya = new (65536 > 3 * k.length ? Uint16Array : Uint32Array)(
                    3 * k.length
                  ),
                  hb = 0;
                k.forEach(function (Ta, wa) {
                  Ta.$b === hb
                    ? (A[hb].n += 3)
                    : (A.push({ n: 3, offset: 3 * wa }), ++hb);
                  Ya[3 * wa] = Ta.a;
                  Ya[3 * wa + 1] = Ta.b;
                  Ya[3 * wa + 2] = Ta.c;
                });
                M && M.remove();
                M = X.instance({ ka: ca, indices: Ya });
                e = F = !1;
                da && H.vh();
                I = !0;
                H.cf();
                return Promise.resolve();
              }
              function f(r) {
                M.Na(r.n, r.offset);
              }
              function l(r, P) {
                U[P] &&
                  (C.set(U[P].mm()),
                  M.bind(!1),
                  N ? (C.Sa(), C.uj()) : (C.bb(), C.vj()),
                  U[P].Mc() && (C.Uc(), F.yc(!1), C.fe(), yb.Nb()),
                  U[P].ul(),
                  U[P].td(),
                  M.Na(r.n, r.offset));
              }
              function p(r, P) {
                U[P] &&
                  (C.set(U[P].nm()),
                  M.bind(!1),
                  N ? (C.Sa(), C.uj()) : (C.bb(), C.vj()),
                  U[P].Mc() && (C.Uc(), F.yc(!1), C.fe(), yb.Nb()),
                  H.Dc(),
                  U[P].td(),
                  M.Na(r.n, r.offset));
              }
              function u(r, P) {
                ra && U[P] && (U[P].vl(), M.Na(r.n, r.offset));
              }
              function h(r, P) {
                ra && U[P] && (U[P].xl(N), M.Na(r.n, r.offset));
              }
              function m(r, P) {
                U[P] && (C.set(U[P].im()), U[P].Hh(), M.Na(r.n, r.offset));
              }
              function q(r, P) {
                U[P] &&
                  (C.set(U[P].jm()), H.Dc(), U[P].Hh(), M.Na(r.n, r.offset));
              }
              function v(r, P) {
                U[P] &&
                  (C.set(U[P].km()),
                  U[P].Mc() && (F.yc(!1), C.fe(), yb.Nb()),
                  M.bind(!1),
                  U[P].Eh(N),
                  M.Na(r.n, r.offset));
              }
              function J(r, P) {
                if (U[P]) {
                  var ca = U[P].lm();
                  C.set(ca);
                  U[P].Mc() && (F.yc(!1), C.fe(), yb.Nb(), M.bind(!1));
                  a[ca] || (H.Dc(), M.bind(!1), (a[ca] = !0));
                  U[P].Eh(N);
                  M.Na(r.n, r.offset);
                }
              }
              function t(r, P) {
                return new Promise(function (ca, ka) {
                  r
                    ? ((r.C = function (la) {
                        la
                          ? (U[P] && U[P].I(),
                            (U[P] = la),
                            (da = da || la.Mc()),
                            ca())
                          : ka();
                      }),
                      Yc.instance(r))
                    : ka();
                });
              }
              if (!ha.sh()) return !1;
              var x = Object.assign(
                  {
                    ih: !1,
                    jh: !1,
                    ac: null,
                    url: "",
                    C: null,
                    ld: null,
                    Ne: null,
                  },
                  b
                ),
                z = null,
                k = null,
                g = null,
                E = null,
                M = null,
                D = null,
                F = null,
                e = !1,
                n = new hc(),
                y = new Tc(),
                Q = [],
                B = null,
                A = [{ n: 0, offset: 0 }],
                O = [],
                G = [],
                w = !1,
                I = !1,
                T = [],
                U = [],
                da = !1,
                N = !1,
                ra = !1,
                Pa = !1,
                H = {
                  visible: w,
                  hl: function () {
                    return A.length;
                  },
                  tf: function () {
                    return O;
                  },
                  vh: function () {
                    !e &&
                      N &&
                      ((k = k.filter(function (r) {
                        return null !== r;
                      })),
                      (D = Xd(z, g, E, k)),
                      (F = X.instance({ ka: D, indices: !1 })),
                      (E = g = k = z = D = null),
                      (e = !0));
                  },
                  Dc: function () {
                    yb.W();
                    H.Gh();
                  },
                  Gh: function () {
                    C.Vc("u146", n.elements);
                  },
                  Pp: function () {
                    w && (H.Gh(), M.bind(!1), N ? C.Sa() : C.bb(), M.W());
                  },
                  El: function (r) {
                    w && (r || H.Dc(), M.bind(!1), N ? C.Sa() : C.bb(), M.W());
                  },
                  Fl: function () {
                    w && (M.bind(!1), N ? C.Sa() : C.bb(), A.forEach(u));
                  },
                  Dh: function () {
                    w && (M.bind(!1), N ? C.Sa() : C.bb(), G.forEach(f));
                  },
                  Cl: function (r) {
                    ra &&
                      w &&
                      (M.bind(!1),
                      N ? C.Sa() : C.bb(),
                      r ? A.forEach(m) : A.forEach(q));
                  },
                  sd: function (r) {
                    w &&
                      (r || H.Dc(),
                      M.bind(!1),
                      r || (C.Sa(), C.Uc()),
                      ra && A.forEach(h));
                  },
                  td: function (r) {
                    ra && w && (r ? A.forEach(l) : A.forEach(p));
                  },
                  zl: function () {
                    ra && w && A.forEach(J);
                  },
                  yl: function () {
                    ra && w && A.forEach(v);
                  },
                  gi: function () {
                    return B;
                  },
                  ei: function () {
                    return T;
                  },
                  Xj: function (r, P, ca) {
                    r = U[r];
                    if (!r) return !1;
                    r.update(P, ca);
                    H.Zj();
                    return !0;
                  },
                  di: function () {
                    return new Promise(function (r) {
                      H.zc(function () {
                        r(
                          U.map(function (P) {
                            return P.rm();
                          })
                        );
                      });
                    });
                  },
                  yg: function (r, P) {
                    T = r;
                    ra = !1;
                    Pa = !0;
                    U.forEach(function (ca) {
                      ca.I();
                    });
                    U = Array(r.length);
                    da = !1;
                    r = r.map(function (ca, ka) {
                      return "string" === typeof ca
                        ? Ud(
                            -1 === ca.indexOf(".json") ? ca + ".json" : ca
                          ).then(function (la) {
                            la.name = ca;
                            return t(la, ka, ca);
                          })
                        : t(ca, ka, !1);
                    });
                    Promise.all(r).then(function () {
                      H &&
                        ((ra = !0),
                        (Pa = !1),
                        H.zc(function () {
                          da && H.vh();
                          H.Zj();
                          Aa.Gb(H);
                          Aa.pe(!0);
                          P && P(H);
                        }, 4),
                        H.cf());
                    });
                  },
                  Zj: function () {
                    G.splice(0);
                    A.forEach(function (r, P) {
                      U[P] && U[P].Um() && G.push(r);
                    });
                  },
                  zc: function (r, P) {
                    I && ra && !Pa ? r(H) : Q.push({ sb: r, order: P ? P : 0 });
                  },
                  cf: function () {
                    I &&
                      ra &&
                      !Pa &&
                      (Q.sort(function (r, P) {
                        return 0 > r.order - P.order ? 1 : -1;
                      }),
                      Q.forEach(function (r) {
                        r.sb(H);
                      }),
                      Q.splice(0));
                  },
                  remove: function () {
                    H.I();
                    H = null;
                  },
                  I: function () {
                    w = I = !1;
                    M && M.remove();
                    U.forEach(function (r) {
                      r.I();
                    });
                    e && F.remove();
                    A.splice(0);
                  },
                  pm: function () {
                    return y.size().x;
                  },
                  qm: function () {
                    return y.size().y;
                  },
                  gq: function () {
                    return y.size().z;
                  },
                  Tl: function () {
                    return Hc(y).x;
                  },
                  Ul: function () {
                    return Hc(y).y;
                  },
                  Vp: function () {
                    return Hc(y).z;
                  },
                  bq: function () {
                    return y.min.y;
                  },
                  replace: function (r, P, ca) {
                    if (r === B) return P && H && (H.cf(), P(H)), !1;
                    B = r;
                    Aa.pe(!1);
                    Vc(
                      r,
                      function (ka) {
                        d(ka)
                          .then(function () {
                            P && P(H);
                          })
                          .catch(function (la) {
                            ca && ca(la);
                          });
                      },
                      ca
                    );
                    return !0;
                  },
                };
              x.ac && H.yg(x.ac, x.Ne);
              B = x.url;
              Vc(x.url, function (r) {
                d(r).then(function () {
                  x.C && x.C(H);
                });
              });
              return H;
            },
            Pn: function () {
              a.s106 = !1;
              a.s106color = !1;
              a.s106NormalMap = !1;
              a.s106ParamsMap = !1;
              a.s106NormalParamsMap = !1;
            },
          };
        })(),
        Ic = (function () {
          var a = null,
            b = !1,
            d = !1,
            f = null,
            l = new Float32Array(16),
            p = new Float32Array(3),
            u = { data: 0 },
            h = {
              m: function () {
                a = W.Ob
                  ? new Worker("js/worker.php")
                  : {
                      postMessage: function (m) {
                        u.data = m;
                        Zc.rn(u);
                      },
                      terminate: function () {},
                    };
                a.onmessage = function (m) {
                  switch (m.data[0]) {
                    case 3:
                      for (var q = 0; 16 > q; ++q) l[q] = m.data[q + 1];
                      for (q = 0; 3 > q; ++q) p[q] = m.data[q + 17];
                      yb.mf().ro(l, p);
                      break;
                    case 6:
                      h.lo(),
                        (b = !0),
                        Wb.ib(!1),
                        W.ga_ && (Lb.enable(), Lb.ge());
                  }
                };
                f = new Float32Array(6);
                f[0] = 2;
                W.Ob || Zc.no(a);
              },
              Lo: function () {
                W.Ah || (d = !0);
              },
              Yq: function () {
                d = !1;
              },
              Zn: function (m, q) {
                if (q || (b && d))
                  (f[1] = m[0]),
                    (f[2] = m[1]),
                    (f[3] = m[2]),
                    (f[4] = m[3]),
                    (f[5] = m[4]),
                    a.postMessage(f);
              },
              lo: function () {
                a.postMessage([5, W.qh]);
              },
              I: function () {
                W.Ob && a.terminate();
              },
            };
          return h;
        })(),
        Zc = (function () {
          var a = 0,
            b = 0,
            d = 0,
            f = [0, 0],
            l = new hc(),
            p = new Gc(),
            u = new Gc(),
            h = new Wa(),
            m = new Wa(),
            q = new gc(),
            v = 0,
            J = new Float32Array(20);
          J[0] = 3;
          var t = null,
            x = { data: !1 },
            z = {
              m: function () {
                "undefined" === typeof W && (self.up = { Ob: !0 });
                W.Ob && z.lg([6]);
              },
              rn: function (k) {
                switch (k.data[0]) {
                  case 2:
                    z.zg(k.data);
                    break;
                  case 5:
                    v = k.data[1];
                }
              },
              lg: function (k) {
                W.Ob ? postMessage(k) : ((x.data = k), t.onmessage(x));
              },
              zg: function (k) {
                a = k[1];
                b = k[2];
                d = k[3];
                f[0] = k[4];
                f[1] = k[5];
                h.set(f[0], f[1], -d);
                q.set(b, a, 0, "XYZ");
                if (!1 === q instanceof gc)
                  throw Error(
                    "JETHREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order."
                  );
                k = Math.cos(q.F / 2);
                var g = Math.cos(q.G / 2),
                  E = Math.cos(q.H / 2),
                  M = Math.sin(q.F / 2),
                  D = Math.sin(q.G / 2),
                  F = Math.sin(q.H / 2),
                  e = q.order;
                "XYZ" === e
                  ? ((p.F = M * g * E + k * D * F),
                    (p.G = k * D * E - M * g * F),
                    (p.H = k * g * F + M * D * E),
                    (p.T = k * g * E - M * D * F))
                  : "YXZ" === e
                  ? ((p.F = M * g * E + k * D * F),
                    (p.G = k * D * E - M * g * F),
                    (p.H = k * g * F - M * D * E),
                    (p.T = k * g * E + M * D * F))
                  : "ZXY" === e
                  ? ((p.F = M * g * E - k * D * F),
                    (p.G = k * D * E + M * g * F),
                    (p.H = k * g * F + M * D * E),
                    (p.T = k * g * E - M * D * F))
                  : "ZYX" === e
                  ? ((p.F = M * g * E - k * D * F),
                    (p.G = k * D * E + M * g * F),
                    (p.H = k * g * F - M * D * E),
                    (p.T = k * g * E + M * D * F))
                  : "YZX" === e
                  ? ((p.F = M * g * E + k * D * F),
                    (p.G = k * D * E + M * g * F),
                    (p.H = k * g * F - M * D * E),
                    (p.T = k * g * E - M * D * F))
                  : "XZY" === e &&
                    ((p.F = M * g * E - k * D * F),
                    (p.G = k * D * E - M * g * F),
                    (p.H = k * g * F + M * D * E),
                    (p.T = k * g * E + M * D * F));
                h.y -= v;
                k = l.elements;
                F = p.x;
                var n = p.y,
                  y = p.z;
                M = p.w;
                var Q = F + F,
                  B = n + n;
                D = y + y;
                g = F * Q;
                E = F * B;
                F *= D;
                e = n * B;
                n *= D;
                y *= D;
                Q *= M;
                B *= M;
                M *= D;
                k[0] = 1 - (e + y);
                k[4] = E - M;
                k[8] = F + B;
                k[1] = E + M;
                k[5] = 1 - (g + y);
                k[9] = n - Q;
                k[2] = F - B;
                k[6] = n + Q;
                k[10] = 1 - (g + e);
                k[3] = 0;
                k[7] = 0;
                k[11] = 0;
                k[12] = 0;
                k[13] = 0;
                k[14] = 0;
                k[15] = 1;
                l.setPosition(h);
                u.N(p).inverse();
                k = m.N(h);
                n = k.x;
                Q = k.y;
                y = k.z;
                g = u.x;
                E = u.y;
                M = u.z;
                D = u.w;
                F = D * n + E * y - M * Q;
                e = D * Q + M * n - g * y;
                B = D * y + g * Q - E * n;
                n = -g * n - E * Q - M * y;
                k.x = F * D + n * -g + e * -M - B * -E;
                k.y = e * D + n * -E + B * -g - F * -M;
                k.z = B * D + n * -M + F * -E - e * -g;
                for (k = 1; 17 > k; ++k) J[k] = l.elements[k - 1];
                J[17] = m.x;
                J[18] = m.y;
                J[19] = m.z;
                z.lg(J);
              },
              no: function (k) {
                t = k;
                z.lg([6]);
              },
            };
          return z;
        })();
      Zc.m();
      var Yc = (function () {
          function a(u) {
            var h = u.split(":").shift();
            return "data" === h || "blob" === h
              ? u
              : ("undefined" !== typeof K && K.ea ? K : W).ea + W.Mi + u;
          }
          function b(u, h) {
            return Math.min(h + u + h * u, 1);
          }
          var d = !1,
            f = null,
            l = 1,
            p = {
              diffuseTexture: null,
              normalTexture: null,
              paramsTexture: null,
              isDisableColorTexture: !1,
              colorTextureUsage: 0,
              metalness: 0.5,
              roughness: 0.5,
              fresnelMin: 0,
              fresnelMax: 1,
              fresnelPow: 5,
              alpha: 1,
              whiteToAlpha: 0,
              diffuseColor: [255, 255, 255],
              paramsMapMask: [0, 0, 0, 0],
              C: null,
            };
          return {
            m: function () {
              f = ba.instance({
                width: 1,
                height: 1,
                isMipmap: !1,
                L: 4,
                array: new Uint8Array([255, 255, 255, 255]),
                Hf: !1,
              });
            },
            ff: function () {
              d = !0;
              l = 2;
            },
            instance: function (u) {
              function h() {
                "number" === typeof g.alpha
                  ? ((z[0] = g.alpha), (z[1] = 0), (z[2] = 0), (z[3] = 0))
                  : ((z[0] = g.alpha[0]),
                    (z[1] = g.alpha[1] - g.alpha[0]),
                    (z[2] = g.alpha[2]),
                    (z[3] = g.alpha[3]));
                var w = 1 <= g.fresnelPow ? g.fresnelMin : g.fresnelMax;
                k[0] = b(z[0], w);
                k[1] = b(z[1], w);
                k[2] = z[2];
                k[3] = z[3];
                e = {
                  Vi: g.fresnelMax,
                  Ii: [
                    g.fresnelMin,
                    g.roughness,
                    g.fresnelPow / 15,
                    g.metalness,
                  ],
                  Li: g.paramsMapMask,
                };
                E = [
                  g.diffuseColor[0] / 255,
                  g.diffuseColor[1] / 255,
                  g.diffuseColor[2] / 255,
                ];
              }
              function m() {
                return new Promise(function (w) {
                  (t = g.normalTexture && ha.al() ? !0 : !1) && !D.Ga
                    ? (D.Ga = ba.instance({
                        url: a(g.normalTexture),
                        isLinear: !0,
                        isMipmap: !0,
                        isAnisotropicFiltering: !1,
                        isPot: !0,
                        L: 3,
                        C: w,
                      }))
                    : w();
                });
              }
              function q() {
                return new Promise(function (w) {
                  (x = g.diffuseTexture && "" !== g.diffuseTexture ? !0 : !1) &&
                  !D.ha
                    ? ((D.ha = ba.instance({
                        url: a(g.diffuseTexture),
                        isMipmap: !0,
                        isLinear: !0,
                        isPot: !0,
                        isAnisotropicFiltering: !0,
                        isSrgb: !1,
                        isMirrorY: !1,
                        isMirrorX: !1,
                        L: 4,
                        C: w,
                      })),
                      (M = "s111"))
                    : (D.ha || ((M = "s112"), (D.ha = f)), w());
                });
              }
              function v() {
                return new Promise(function (w) {
                  (F = g.paramsTexture ? !0 : !1) && !D.ab
                    ? g.paramsTexture === g.diffuseTexture
                      ? ((D.ab = D.ha), w())
                      : (D.ab = ba.instance({
                          url: a(g.paramsTexture),
                          isMipmap: !0,
                          isLinear: !0,
                          isPot: !0,
                          isAnisotropicFiltering: !1,
                          isSrgb: !1,
                          isMirrorY: !1,
                          isMirrorX: !1,
                          L: 4,
                          C: w,
                        }))
                    : w();
                });
              }
              function J(w, I) {
                h();
                Promise.all([m(), q(), v()]).then(function () {
                  t || F || x
                    ? t || F
                      ? t && !F
                        ? ((n = "s106NormalMap"),
                          (y = "s106NNGLtextureNormalMap"))
                        : !t && F
                        ? ((n = "s106ParamsMap"),
                          (y = "s106NNGLtextureParamsMap"))
                        : ((n = "s106NormalParamsMap"),
                          (y = "s106NNGLtextureNormalParamsMap"))
                      : ((n = "s106"), (y = "s106NNGLtexture"))
                    : ((n = "s106color"), (y = "s106NNGLcolor"));
                  Q = t ? "s114" : "s113";
                  B = t ? "s108" : "s118";
                  A = F ? "s116" : "s115";
                  O = F ? "s109" : "s119";
                  I && g.C && setTimeout(g.C.bind(null, w), 1);
                });
              }
              var t,
                x,
                z = [1, 0, 0, 0],
                k = [0, 0, 0, 0],
                g = Object.assign({}, p, u),
                E = null,
                M = null,
                D = { ha: null, Ga: null, ab: null },
                F = (t = x = !1),
                e = null,
                n = null,
                y = null,
                Q = null,
                B = null,
                A = null,
                O = null,
                G = {
                  update: function (w, I) {
                    void 0 === I && (I = !0);
                    Object.assign(g, w);
                    I ? (G.I(), J(G, !1)) : h();
                  },
                  Mc: function () {
                    return t;
                  },
                  Um: function () {
                    return 0.99 > z[0];
                  },
                  rm: function () {
                    return g;
                  },
                  nm: function () {
                    return B;
                  },
                  mm: function () {
                    return Q;
                  },
                  jm: function () {
                    return O;
                  },
                  im: function () {
                    return A;
                  },
                  lm: function () {
                    return n;
                  },
                  km: function () {
                    return y;
                  },
                  td: function () {
                    t && D.Ga.h(0);
                  },
                  xl: function (w) {
                    d && C.set(M);
                    w ? C.Sa() : C.bb();
                    x && C.Uc();
                    G.sd();
                  },
                  sd: function () {
                    x &&
                      (C.je(
                        "u77",
                        g.colorTextureUsage,
                        g.whiteToAlpha,
                        g.fresnelMin
                      ),
                      (g.isDisableColorTexture ? f : D.ha).h(0));
                    C.Dg("u156", E);
                  },
                  Hh: function () {
                    F && (D.ab.h(0), C.Ba("u82", e.Li), C.Uc());
                    C.Ba("u120", e.Ii);
                    C.D("u157", e.Vi);
                  },
                  Eh: function (w) {
                    F && !t
                      ? D.ab.h(l)
                      : t && (x || f.h(0), D.Ga.h(l), F && D.ab.h(l + 1));
                    F && C.Ba("u82", e.Li);
                    x || t ? C.ho() : w ? C.io() : C.jo();
                    G.sd();
                    C.Ba("u14", z);
                    C.Ba("u120", e.Ii);
                    C.D("u157", e.Vi);
                  },
                  ul: function () {
                    C.Ba("u14", z);
                  },
                  vl: function () {
                    C.Ba("u14", k);
                  },
                  I: function () {
                    x && D.ha.remove();
                    t && D.Ga.remove();
                    F && g.paramsTexture !== g.diffuseTexture && D.ab.remove();
                    Object.assign(D, { ha: null, Ga: null, ab: null });
                  },
                };
              J(G, !0);
              return G;
            },
          };
        })(),
        Lb = (function () {
          var a = 0,
            b = 0,
            d = 0,
            f = 0,
            l = 0,
            p = 0,
            u = W.Ik,
            h = W.Hk,
            m = W.Jk,
            q = 0,
            v = 0,
            J = null,
            t = null,
            x = 0,
            z = 0,
            k = 0,
            g = 0,
            E = 0,
            M = null,
            D = 0,
            F = 0,
            e = 0,
            n = Date.now(),
            y = null,
            Q = !1,
            B = !1,
            A = !1,
            O = 1,
            G = !1,
            w = {
              m: function () {
                a = W.Dk[ha.X()];
                b = W.Ck[ha.X()];
                d = W.Bk[ha.X()];
                F = W.Ek[ha.X()];
                f = W.vk[ha.X()];
                l = W.zk[ha.X()];
                k = W.Ak[ha.X()];
                g = ha.P();
                E = ha.$();
                q = Math.round(g * a);
                v = Math.round(E * a);
                t = Fa.instance({ width: q, height: v, Hc: !1 });
                J = ba.instance({
                  width: q,
                  height: v,
                  isPot: !1,
                  isLinear: !0,
                });
                M = ba.instance({
                  width: q,
                  height: v,
                  isPot: !1,
                  isLinear: !0,
                  L: 1,
                });
                Q = !0;
              },
              resize: function (I, T, U) {
                O = U;
                g = I;
                E = T;
                q = Math.round(I * a);
                v = Math.round(T * a);
                t.resize(q, v);
                B = !0;
              },
              W: function () {
                var I = Math.exp(-(Date.now() - n) / F);
                D = A ? e + (1 - I) * (1 - e) : e * I;
                x = b + D * (d - b);
                z = f + (1 - D) * (1 - f);
                p = l + (1 - D) * (1 - l);
                ba.aa(5);
                if (B && Q)
                  ba.aa(6),
                    M.resize(q, v),
                    C.set("s0"),
                    C.ie("u1", 6),
                    t.bind(!1, !0),
                    M.u(),
                    t.Re(),
                    J.h(6),
                    X.l(!0, !0),
                    J.resize(q, v),
                    J.u(),
                    M.h(6),
                    X.l(!1, !1),
                    C.ie("u1", 0),
                    (B = !1);
                else {
                  c.enable(c.BLEND);
                  c.blendFunc(c.CONSTANT_ALPHA, c.ONE_MINUS_SRC_ALPHA);
                  I = x / k;
                  c.blendColor(I, I, I, I);
                  c.colorMask(!0, !1, !1, !0);
                  C.set("s98");
                  yb.df();
                  C.D("u137", x);
                  F && (C.D("u138", z), C.D("u129", p));
                  var T = O * (u + Math.pow(Math.random(), m) * (h - u));
                  C.O("u15", T / g, T / E);
                  t.mh();
                  t.Wc();
                  J.u();
                  T = 2 * Math.PI * Math.random();
                  for (var U = !0, da = 0; da < k; ++da)
                    1 === da &&
                      (c.blendFunc(c.SRC_ALPHA, c.ONE), C.D("u137", I)),
                      C.D("u136", T + (da / k) * (Math.PI / 2)),
                      C.O(
                        "u135",
                        (Math.random() - 0.5) / g,
                        (Math.random() - 0.5) / E
                      ),
                      X.l(U, U),
                      (U = !1);
                  c.disable(c.BLEND);
                  C.set("s99");
                  C.O("u15", 1 / q, 1 / v);
                  M.u();
                  J.h(7);
                  X.l(!1, !1);
                  c.colorMask(!0, !0, !0, !0);
                }
              },
              h: function (I) {
                M.h(I);
              },
              enable: function () {
                G = !0;
              },
              An: function () {
                if (A || !G) return !1;
                y && clearTimeout(y);
                w.ge();
                y = setTimeout(w.Wj, 400);
              },
              ge: function () {
                y && (clearTimeout(y), (y = !1));
                !A &&
                  G &&
                  (window.ik.disable(), (A = !0), (n = Date.now()), (e = D));
              },
              Wj: function () {
                A &&
                  G &&
                  (y && (clearTimeout(y), (y = null)),
                  window.ik.enable(),
                  (A = !1),
                  (n = Date.now()),
                  (e = D));
              },
              I: function () {
                J.remove();
                M.remove();
                t.remove();
              },
            };
          w.An();
          return w;
        })(),
        ge = {
          instance: function (a) {
            var b = a.V.P(),
              d = a.Nm ? !0 : !1,
              f = d ? "s85" : "s75",
              l = a.V,
              p = a.V.Sm() && Ia.ja(),
              u = ba.instance({
                isFloat: p && !d,
                isLinear: !0,
                isMipmap: !1,
                isPot: !0,
                width: b,
                height: b,
                L: d ? 4 : 3,
              }),
              h = ba.instance({
                isFloat: p,
                isLinear: !0,
                isPot: !0,
                width: 1,
                height: b / 2,
                L: 3,
              });
            d = Math.round(Math.log(b) / Math.log(2));
            for (var m = [], q = 0, v = 0; v <= d; ++v) {
              var J = Math.pow(2, d - v),
                t = J / 2;
              if (4 > t) break;
              m.push({
                cp: b / J,
                da: J,
                Tb: t,
                rp: q,
                V:
                  0 === v
                    ? a.V
                    : ba.instance({
                        isFloat: p,
                        isPot: !0,
                        isLinear: !0,
                        width: J,
                        height: t,
                      }),
              });
              q += t;
              if (0 !== q % 1) break;
            }
            u.ko = function (x) {
              l = x;
              m[0].V = x;
            };
            u.Ln = function () {
              h.J();
              C.set("s92");
              l.h(0);
              X.l(!0, !0);
              C.set("s12");
              h.h(1);
              var x = l;
              m.forEach(function (z, k) {
                0 !== k &&
                  (z.V.J(),
                  x.h(0),
                  ba.po(),
                  C.O("u99", 1, 1),
                  C.D("u100", Math.min(6 / z.Tb, 0.5)),
                  X.l(!1, !1),
                  (x = z.V));
              });
              C.set(f);
              C.D("u97", W.Rc);
              u.u();
              m.forEach(function (z) {
                c.viewport(0, z.rp, b, z.Tb);
                C.O("u96", z.cp, 1);
                z.V.h(0);
                ba.so();
                X.l(!1, !1);
              });
            };
            u.On = u.remove;
            u.remove = function () {
              u.On();
              h.remove();
              m.forEach(function (x) {
                x.V.remove();
              });
              m.splice(0);
            };
            return u;
          },
        };
      ya.La = (function () {
        var a = {
            Tc: 45,
            tg: 1,
            Db: "../../images/debug/picsou.png",
            ee: 0.8,
            Pf: 3.14 / 6,
            Qf: 0.314,
            Pd: 4,
            Od: 0.5,
            Of: -0.25,
            Ym: 1,
            da: 256,
            Nf: 0.15,
          },
          b = { qb: null, Pb: null, screen: null },
          d = !1,
          f = !1,
          l = -1,
          p = null,
          u = null,
          h = null,
          m = Math.PI / 180,
          q = [1, 1],
          v = !1,
          J = {
            m: function (t) {
              l = t.width;
              t = {
                isFloat: Ia.ja(),
                U: !0,
                isPot: !1,
                isMipmap: !1,
                width: l,
                height: l / 2,
                L: 3,
              };
              b.qb && (b.qb.remove(), b.Pb.remove());
              b.Pb = ba.instance(Object.assign({ isLinear: !1 }, t));
              b.qb = Pc.instance(Object.assign({ isLinear: !0 }, t));
              C.j("s120", [{ type: "1i", name: "u164", value: 0 }]);
              C.j("s121", [
                { type: "1i", name: "u101", value: 0 },
                { type: "1i", name: "u109", value: 1 },
                { type: "1i", name: "u169", value: 2 },
              ]);
              J.$j();
              v = !0;
            },
            $j: function () {
              C.j("s121", [
                { type: "1f", name: "u170", value: a.Pf },
                { type: "1f", name: "u171", value: a.Qf },
                { type: "1f", name: "u172", value: a.Pd },
                { type: "1f", name: "u173", value: a.Od },
                { type: "1f", name: "u174", value: a.Of },
              ]);
            },
            uq: function () {
              return f;
            },
            ra: function (t) {
              p = t;
            },
            Sc: function () {
              u =
                "uniform sampler2D u164;uniform vec2 u165,u166,u11;uniform int u167;uniform float u168,u150;varying vec2 vv0;const float h=3.141593;const vec2 i=vec2(.5);const float e=1.2;const vec3 g=vec3(1.);void main(){vec2 c=vec2(vv0.x*2.,-vv0.y+.5)*h,a=i+u11*(c-u165)/u166;float b=1.;if(u167==0){if(a.x<0.||a.x>1.||a.y<0.||a.y>1.)discard;}else b*=smoothstep(-e,0.,a.x),b*=1.-smoothstep(1.,1.+e,a.x),b*=smoothstep(-e,0.,a.y),b*=1.-smoothstep(1.,1.+e,a.y);vec3 d=mix(u168*g,texture2D(u164,a).rgb*u150,b*g);gl_FragColor=vec4(d,1.);}";
              h =
                "uniform sampler2D u101,u109,u169;uniform float u170,u171,u172,u173,u174,u175;varying vec2 vv0;const float f=3.141593;const vec2 h=vec2(.5);const vec3 i=vec3(1.);void main(){float j=(vv0.x*2.-1.)*f,c=(-vv0.y+.5)*f;vec4 a=texture2D(u169,h);float d=a.r,k=u172*a.g,l=u173*(a.b+u174),b=a.a,g=asin(cos(b)*cos(d)),m=atan(cos(b)*sin(d),-sin(b)),n=acos(sin(c)*sin(g)+cos(c)*cos(g)*cos(j-m)),o=1.-smoothstep(u170-u171,u170+u171,n);vec3 p=i*(max(l,0.)+max(k,0.)*o),q=texture2D(u101,vv0).rgb,r=texture2D(u109,vv0).rgb;gl_FragColor=vec4(mix(p+r,q,u175),1.);}";
              C.oa("s120", {
                name: "_",
                g: u,
                i: "u164 u165 u167 u166 u168 u150 u11".split(" "),
                precision: "highp",
              });
              C.oa("s121", {
                name: "_",
                g: h,
                i: "u169 u170 u171 u172 u173 u174 u109 u101 u175".split(" "),
                precision: "highp",
              });
            },
            Ig: function (t, x, z, k, g, E, M, D) {
              C.O("u165", x, z);
              C.ie("u167", k ? 1 : 0);
              C.O("u166", g, g / E);
              C.Cg("u11", M);
              t.h(0);
              X.l(D, D);
            },
            hi: function () {
              return b.qb.bi();
            },
            oh: function (t) {
              J.m({ width: a.da });
              J.ak(t, !1, 1);
              f = !0;
            },
            nh: function () {
              (d && b.screen.tm() === a.Db) ||
                ((d = !1),
                b.screen && b.screen.remove(),
                (b.screen = ba.instance({
                  url: a.Db,
                  isFloat: !1,
                  C: function () {
                    d = !0;
                  },
                })));
            },
            zg: function (t) {
              Object.assign(a, t);
            },
            ib: function (t) {
              J.zg(t);
              v && (J.$j(), J.nh());
            },
            ak: function (t, x, z) {
              Fa.ba();
              b.Pb.J();
              C.set("s120");
              C.D("u168", a.Nf);
              C.D("u150", a.Ym);
              J.Ig(t, Math.PI, 0, !0, 90 * m, t.P() / t.$(), q, !0);
              d &&
                ((t = a.da),
                C.D("u150", a.ee),
                c.viewport(0, 0, t / 2, t / 2),
                J.Ig(b.screen, 0, 0, !1, 2 * a.Tc * m, 2 * a.tg, q, !1),
                c.viewport(t / 2, 0, t / 2, t / 2),
                J.Ig(
                  b.screen,
                  2 * Math.PI,
                  0,
                  !1,
                  2 * a.Tc * m,
                  2 * a.tg,
                  q,
                  !1
                ));
              x
                ? (C.set("s121"),
                  C.D("u175", 1 - z),
                  b.qb.tj(0),
                  b.Pb.h(1),
                  x.h(2),
                  X.l(!1, !1),
                  p.xg(b.qb.bi()))
                : p.xg(b.Pb);
            },
            A: function () {
              v = !1;
              Object.assign(b, { qb: null, Pb: null, screen: null });
              f = d = !1;
              l = -1;
              p = null;
            },
          };
        return J;
      })();
      ya.mb = (function () {
        var a = !1,
          b = !0,
          d = null,
          f = null,
          l = 1,
          p = null,
          u = {
            Sc: function () {
              ha.ca() &&
                (C.oa("s122", {
                  name: "_",
                  v: "attribute vec3 a0;uniform sampler2D u42;uniform float u153;uniform vec2 u43;uniform vec3 u152;const float l=0.,m=0.,D=1.;const vec2 e=vec2(1.);const vec3 n=vec3(1.);const vec2 E=vec2(-1.,1.),o=vec2(.16,.5),p=vec2(.5,.5),q=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 r(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,o);vec2 f=u93*e;vec3 c=u93*n;vec2 s=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,p).rgb+vec3(u87,0.,0.),u90,c);float t=mix(texture2D(u42,q).r,0.,u93);a.z+=t;mat3 u=r(a);vec3 v=mix(u152,u91,c);float w=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 x=mat2(h,i,-i,h);b.xy=x*b.xy;float y=mix(u89,1.,u93);vec2 j=u88/s;vec3 k=a0;float z=max(0.,-a0.z-l)*m;k.x+=z*sign(a0.x)*(1.-u93);vec3 A=u*(k+v)*w+b;vec2 B=j*y;vec3 C=vec3(g*B,-j)+A*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(C,1.));}",
                  g: "void main(){gl_FragData[0]=vec4(0.,0.,0.,0.),gl_FragData[1]=vec4(0.,0.,1.,1.),gl_FragData[2]=vec4(1.,0.,0.,0.),gl_FragData[3]=vec4(0.,.5,1.,0.);}",
                  i: ["u42", "u43", "u86", "u152", "u153"].concat(
                    C.Cd(),
                    C.Dd()
                  ),
                  K: ["a0"],
                  S: [3],
                  fa: !0,
                }),
                (a = !0));
            },
            m: function (h) {
              a &&
                C.j(
                  "s122",
                  [
                    { type: "1i", name: "u42", value: 1 },
                    { type: "3f", name: "u86", value: h.Ha },
                    { type: "1f", name: "u153", value: 1 },
                    { type: "1f", name: "u87", value: 0 },
                    { type: "1f", name: "u95", value: 1 },
                  ].concat(h.Tg)
                );
            },
            fb: function (h, m) {
              f = h;
              l = m;
              u.ni();
            },
            eb: function (h, m) {
              d = h;
              p = m;
              u.ni();
            },
            ni: function () {
              if (ha.ca() && f && d) {
                var h = [d[0] * f, d[1] * f, d[2] * f],
                  m = p;
                h[0] += m[0];
                h[1] += m[1];
                h[2] += m[2];
                C.j("s122", [
                  { type: "1f", name: "u153", value: l },
                  { type: "3f", name: "u152", value: h },
                ]);
                C.M();
              }
            },
            Dm: function (h) {
              for (
                var m = h.width / 2,
                  q = h.height / 2,
                  v = h.depth,
                  J = h.Gl,
                  t = h.height / 4,
                  x = h.kl,
                  z = 2 * x + 4,
                  k = [],
                  g = [],
                  E = -m + h.Wa,
                  M = -J - h.Wa,
                  D = m - h.Wa,
                  F = -J - h.Wa,
                  e = 0;
                e < z;
                ++e
              ) {
                var n = 0,
                  y = 0;
                0 === e
                  ? ((n = -m), (y = -J - v))
                  : 1 <= e && e <= 1 + x
                  ? ((y = (((e - 1) / x) * Math.PI) / 2),
                    (n = E - Math.cos(y) * h.Wa),
                    (y = M + Math.sin(y) * h.Wa))
                  : e >= 2 + x && e <= 2 + 2 * x
                  ? ((y = (((e - 2 - x) / x) * Math.PI) / 2),
                    (n = D + Math.sin(y) * h.Wa),
                    (y = F + Math.cos(y) * h.Wa))
                  : e === z - 1 && ((n = m), (y = -J - v));
                k.push(n, q + t, y, n, -q + t, y);
                0 !== e &&
                  g.push(
                    2 * e,
                    2 * e - 2,
                    2 * e - 1,
                    2 * e,
                    2 * e - 1,
                    2 * e + 1
                  );
              }
              return u.instance({ ka: k, indices: g });
            },
            toggle: function (h) {
              b = h;
            },
            instance: function (h) {
              var m = X.instance({ ka: h.ka, indices: h.indices });
              return {
                W: function () {
                  a && b && (C.set("s122"), m.bind(!0), m.W());
                },
              };
            },
          };
        return u;
      })();
      ya.ia = (function () {
        function a(G) {
          C.j("s125", G);
          C.j("s126", G);
        }
        var b = {
          xf: -87,
          wm: [85, 95],
          mi: [90, 90],
          li: [85, 70],
          md: 24,
          Jp: 12,
          ll: 2,
          mg: [-80, 40],
          Ri: [0, -10],
          on: 40,
          qn: 20,
          Si: [70, 50],
          pn: 90,
          Uo: 2,
          le: [0, -15],
          De: 1024,
          lb: 512,
          Xd: 4,
          Jo: [6, 30],
          Qi: 1.2,
        };
        b.aj = b.mg;
        var d = !1,
          f = !1,
          l = !1,
          p = null,
          u = null,
          h = null,
          m = null,
          q = null,
          v = null,
          J = !1,
          t = !1,
          x = null,
          z = null,
          k = null,
          g = null,
          E = 0.5,
          M = [{ type: "1f", name: "u177", value: 1 }],
          D = null,
          F = null,
          e = 0,
          n = ["u42", "u43", "u153", "u152"],
          y = null,
          Q = null,
          B = null,
          A = null,
          O = {
            Sc: function () {
              C.oa("s123", {
                name: "_",
                v: "attribute vec3 a0;uniform vec3 u152;uniform vec2 u178,u179;uniform float u153,u180,u181,u182;varying float vv0,vv1;void main(){vec3 a=(a0+u152)*u153;float b=atan(a.x,a.z-u180),d=2.*(a.y-u181)/(u182-u181)-1.;vv0=a0.y;float g=1.-u178.x*u178.x/(u178.y*u178.y),c=u178.x/sqrt(1.-g*pow(cos(b),2.));vec3 h=vec3(c*sin(b),a.y,c*cos(b)+u180);vv1=smoothstep(u179.x,u179.y,length(h-a)),gl_Position=vec4(b,d,0.,1.);}",
                g: "uniform float u183;uniform vec4 u14;varying float vv0,vv1;void main(){float a=u14.x+u14.y*smoothstep(-u14.w,-u14.z,vv0),b=min(a,1.)*u183;gl_FragColor=vec4(b,vv1,1.,1.);}",
                i: "u153 u152 u178 u179 u180 u181 u182 u14 u183".split(" "),
                K: ["a0"],
                S: [3],
                precision: "highp",
              });
              C.oa("s124", {
                name: "_",
                g: "uniform sampler2D u1;uniform vec2 u15;varying vec2 vv0;void main(){vec4 a=texture2D(u1,vv0),b=texture2D(u1,vv0-3.*u15),c=texture2D(u1,vv0-2.*u15),d=texture2D(u1,vv0-u15),f=texture2D(u1,vv0+u15),g=texture2D(u1,vv0+2.*u15),h=texture2D(u1,vv0+3.*u15);float j=.031496*b.r+.110236*c.r+.220472*d.r+.275591*a.r+.220472*f.r+.110236*g.r+.031496*h.r;vec2 i=b.gb*b.b+c.gb*c.b+d.gb*d.b+a.gb*a.b+f.gb*f.b+g.gb*g.b+h.gb*h.b;i/=b.b+c.b+d.b+a.b+f.b+g.b+h.b,gl_FragColor=vec4(mix(j,a.r,1.-i.x),i,1);}",
                i: ["u1", "u15"],
                precision: "lowp",
              });
              C.oa("s125", {
                name: "_",
                v: "attribute vec3 a0,a2;attribute vec2 a1;varying vec2 vv0;varying float vv1;uniform sampler2D u42;uniform vec2 u43;uniform float u153;uniform vec3 u152;const float o=0.,p=0.;const vec2 e=vec2(1.);const vec3 q=vec3(1.);const vec2 G=vec2(-1.,1.),r=vec2(.16,.5),s=vec2(.5,.5),t=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 u(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,r);vec2 g=u93*e;vec3 c=u93*q;vec2 v=mix(d.a*u43,e,g),h=(2.*d.gb-e)*(1.-g);h.x*=-1.;vec3 a=mix(texture2D(u42,s).rgb+vec3(u87,0.,0.),u90,c);float w=mix(texture2D(u42,t).r,0.,u93);a.z+=w;mat3 i=u(a);vec3 x=mix(u152,u91,c);float y=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float j=cos(a.z),k=sin(a.z);mat2 z=mat2(j,k,-k,j);b.xy=z*b.xy;float A=mix(u89,1.,u93);vec2 l=u88/v;vec3 m=a0;float B=max(0.,-a0.z-o)*p;m.x+=B*sign(a0.x)*(1.-u93);vec3 C=i*(m+x)*y+b;vec2 D=l*A;vec3 E=vec3(h*D,-l)+C*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(E,1.)),vv0=a1,gl_Position*=vec4(-1.,1.,1.,1.);vec3 F=i*a2;vv1=-F.z,vv1*=vv1*1e-5+smoothstep(5.,50.,abs(a0.x));}",
                g: "uniform sampler2D u184,u169;uniform vec2 u99,u185;uniform float u186,u177;varying vec2 vv0;varying float vv1;void main(){vec2 b=u185*u186+u99*vv0;vec4 a=u177*texture2D(u184,b);a.r*=step(0.,vv0.y),gl_FragColor=vec4(0.,0.,0.,a.r*vv1);}",
                i: "u184 u169 u86 u186 u185 u99 u177"
                  .split(" ")
                  .concat(C.Cd(), C.Dd(), n),
                K: ["a0", "a2", "a1"],
                S: [3, 3, 2],
                precision: "lowp",
              });
              C.oa("s126", {
                name: "_",
                v: "attribute vec3 a0;uniform sampler2D u42;uniform vec2 u43;uniform float u153;uniform vec3 u152;const float l=0.,m=0.;const vec2 e=vec2(1.);const vec3 n=vec3(1.);const vec2 D=vec2(-1.,1.),o=vec2(.16,.5),p=vec2(.5,.5),q=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 r(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,o);vec2 f=u93*e;vec3 c=u93*n;vec2 s=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,p).rgb+vec3(u87,0.,0.),u90,c);float t=mix(texture2D(u42,q).r,0.,u93);a.z+=t;mat3 u=r(a);vec3 v=mix(u152,u91,c);float w=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 x=mat2(h,i,-i,h);b.xy=x*b.xy;float y=mix(u89,1.,u93);vec2 j=u88/s;vec3 k=a0;float z=max(0.,-a0.z-l)*m;k.x+=z*sign(a0.x)*(1.-u93);vec3 A=u*(k+v)*w+b;vec2 B=j*y;vec3 C=vec3(g*B,-j)+A*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(C,1.)),gl_Position*=vec4(-1.,1.,1.,1.);}",
                g: "void main(){gl_FragColor=vec4(0.);}",
                i: ["u86"].concat(C.Cd(), C.Dd(), n),
                K: ["a0"],
                S: [3],
                precision: "lowp",
              });
              d = !0;
            },
            m: function (G) {
              if (d) {
                if (void 0 === G.jc || !G.jc) return !1;
                if (f) O.rj(G);
                else {
                  m = ba.instance({
                    isFloat: !1,
                    isPot: !1,
                    isMipmap: !1,
                    isLinear: !0,
                    width: b.De,
                    height: b.De / 4,
                  });
                  var w = b.lb / 4,
                    I = {
                      isFloat: !1,
                      isPot: !1,
                      isMipmap: !1,
                      isLinear: !1,
                      width: b.lb,
                      height: w,
                    };
                  h = ba.instance(I);
                  v = ba.instance(I);
                  q = ba.instance({
                    isFloat: !1,
                    isPot: !1,
                    isMipmap: !1,
                    isLinear: !0,
                    width: b.lb,
                    height: w * b.Xd,
                  });
                  w = [];
                  I = [];
                  var T = b.Ri[0],
                    U = b.Ri[1],
                    da = b.on,
                    N = b.qn,
                    ra = -b.Si[0] + T,
                    Pa = b.Si[1] + U,
                    H = b.pn;
                  w.push(
                    0,
                    T,
                    U,
                    0.5 * -N,
                    ra,
                    Pa,
                    0.5 * N,
                    ra,
                    Pa,
                    0.5 * -da,
                    T - H,
                    U,
                    0.5 * da,
                    T - H,
                    U
                  );
                  I.push(0, 2, 1, 0, 1, 3, 1, 4, 3, 1, 2, 4, 0, 4, 2);
                  B = X.instance({
                    ka: new Float32Array(w),
                    indices: new Uint16Array(I),
                  });
                  w = 0.5 - 0.5 / G.kc[1];
                  I = 0.5 + 0.5 / G.kc[1];
                  T = new Float32Array(16 * b.md);
                  U = new Uint16Array(6 * (b.md - 1));
                  for (da = 0; da < b.md; ++da) {
                    N = (2 * da) / (b.md - 1) - 1;
                    N = Math.sign(N) * Math.pow(Math.abs(N), b.ll);
                    H = (Math.PI * (N + 1)) / 2 - Math.PI / 2;
                    N = Math.sin(H);
                    var r = Math.cos(H);
                    ra = Math.sin(H * b.Qi);
                    Pa = Math.cos(H * b.Qi);
                    var P = H / (Math.PI * G.kc[0]) + 0.5;
                    H = b.li[0] * N;
                    var ca = b.aj[0],
                      ka = b.li[1] * r + b.xf,
                      la = P,
                      ma = w,
                      qa = b.aj[1];
                    r = b.mi[1] * r + b.xf;
                    var oa = I,
                      Ca = 16 * da;
                    T[Ca] = b.mi[0] * N;
                    T[Ca + 1] = qa;
                    T[Ca + 2] = r;
                    T[Ca + 3] = ra;
                    T[Ca + 4] = 0;
                    T[Ca + 5] = Pa;
                    T[Ca + 6] = P;
                    T[Ca + 7] = oa;
                    T[Ca + 8] = H;
                    T[Ca + 9] = ca;
                    T[Ca + 10] = ka;
                    T[Ca + 11] = ra;
                    T[Ca + 12] = 0;
                    T[Ca + 13] = Pa;
                    T[Ca + 14] = la;
                    T[Ca + 15] = ma;
                    0 !== da &&
                      ((N = 2 * da),
                      (ra = 6 * (da - 1)),
                      (U[ra] = N),
                      (U[ra + 1] = N - 1),
                      (U[ra + 2] = N - 2),
                      (U[ra + 3] = N),
                      (U[ra + 4] = N + 1),
                      (U[ra + 5] = N - 1));
                  }
                  A = X.instance({ ka: T, indices: U });
                  O.rj(G);
                  C.j("s124", [{ type: "1i", name: "u1", value: 0 }]);
                  f = !0;
                }
              }
            },
            rj: function (G) {
              E = G.Eo;
              g = G.me;
              var w = [
                { type: "1i", name: "u42", value: 1 },
                {
                  type: "3f",
                  name: "u86",
                  value: [G.Ha[0], G.Ha[1] - b.le[0], G.Ha[2] + b.le[1]],
                },
              ].concat(G.Tg, G.Vj);
              D = [
                { type: "1i", name: "u184", value: 0 },
                { type: "1i", name: "u169", value: 2 },
                { type: "1f", name: "u186", value: G.Fo },
                { type: "2f", name: "u99", value: [1, 1 / b.Xd] },
                { type: "2f", name: "u185", value: [0, 1 / b.Xd] },
                { type: "1f", name: "u177", value: 1 },
              ].concat(w);
              F = w;
              C.j("s125", D);
              C.j("s126", F);
            },
            ec: function (G) {
              p = G;
            },
            dc: function (G) {
              y = G;
              y.zc(O.Ac);
            },
            Di: function () {
              return l && null !== y && null !== Q;
            },
            Ac: function () {
              if (!(l || (t && J)) || null === y || null === Q) return !1;
              e = 0;
              c.viewport(0, 0, b.De, b.De / 4);
              Fa.ba();
              m.u();
              c.clearColor(0, 0, 0, 0);
              c.clear(c.COLOR_BUFFER_BIT);
              C.j("s123", [
                { type: "1f", name: "u180", value: b.xf },
                { type: "1f", name: "u181", value: b.mg[0] },
                { type: "1f", name: "u182", value: b.mg[1] },
                {
                  type: "3f",
                  name: "u152",
                  value: [x[0] + z[0], x[1] + z[1], x[2] + z[2]],
                },
                { type: "1f", name: "u183", value: E },
                { type: "2f", name: "u178", value: b.wm },
                { type: "2f", name: "u179", value: b.Jo },
              ]);
              y.Fl();
              C.set("s1");
              var G = b.lb / 4;
              c.viewport(0, 0, b.lb, G);
              h.u();
              m.h(0);
              m.Ec();
              X.l(!0, !0);
              for (var w = 0; w < b.Xd; ++w)
                C.set("s124"),
                  0 !== w && c.viewport(0, 0, b.lb, G),
                  v.u(),
                  h.h(0),
                  C.O("u15", 1 / b.lb, 0),
                  X.l(!1, !1),
                  h.u(),
                  v.h(0),
                  C.O("u15", 0, 1 / G),
                  X.l(!1, !1),
                  b.ml && c.colorMask(0 === w, 1 === w, 2 === w, !0),
                  C.set("s1"),
                  q.u(),
                  h.h(0),
                  c.viewport(0, w * G, b.lb, G),
                  X.l(!1, !1),
                  b.ml && c.colorMask(!0, !0, !0, !0);
              return (l = !0);
            },
            W: function () {
              O.Di() &&
                0 === e++ % b.Uo &&
                (Q.bind(!1, !1),
                u.J(),
                c.clearColor(0, 0, 0, 0),
                c.enable(c.DEPTH_TEST),
                c.depthMask(!0),
                c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT),
                C.set("s126"),
                p.h(1),
                B.bind(!0),
                B.W(),
                C.set("s125"),
                q.h(0),
                A.bind(!0),
                A.W(),
                c.disable(c.DEPTH_TEST),
                c.depthMask(!1));
            },
            om: function () {
              return u;
            },
            add: function () {
              O.Di() &&
                (c.enable(c.BLEND),
                c.blendFunc(c.ONE, c.ONE_MINUS_SRC_ALPHA),
                u.h(0),
                X.l(!1, !1),
                c.disable(c.BLEND));
            },
            vg: function (G, w) {
              Q && Q.remove();
              Q = Fa.instance({ width: G, height: w, Hc: !0 });
              u && u.remove();
              u = ba.instance({ width: G, height: w, isFloat: !1, isPot: !1 });
              O.Ac();
            },
            eb: function (G, w, I) {
              G || ((G = x), (w = z), (I = k));
              a([
                {
                  type: "3f",
                  name: "u152",
                  value: [
                    I[0] + g[0],
                    I[1] + g[1] - b.le[0],
                    I[2] + g[2] + b.le[1],
                  ],
                },
              ]);
              x = G;
              z = w;
              k = I;
              t = !0;
              !l && J && O.Ac();
              C.M();
            },
            fb: function (G, w) {
              C.j("s123", [{ type: "1f", name: "u153", value: G }]);
              a([{ type: "1f", name: "u153", value: w }]);
              J = !0;
              !l && t && O.Ac();
              C.M();
            },
            Ag: function (G) {
              a([{ type: "1f", name: "u87", value: G }]);
              C.M();
            },
            Gb: function (G) {
              G && (y = G);
              O.Ac();
            },
            Bg: function (G, w) {
              M[0].value = 1 - G;
              a(M);
              a(w);
            },
            I: function () {},
            A: function () {
              [Q, B, A].forEach(function (G) {
                G && G.remove();
              });
              e = 0;
              t = J = !1;
              A = B = Q = g = k = z = x = null;
              l = f = d = !1;
              v = q = m = h = u = p = null;
            },
          };
        return O;
      })();
      ya.ua = (function () {
        var a = !1,
          b = null,
          d = 0,
          f = 0,
          l = 0,
          p = [{ type: "1f", name: "u177", value: 1 }],
          u = null,
          h = null,
          m = null,
          q = {
            Sc: function () {
              C.oa("s127", {
                name: "_",
                v: "attribute vec3 a0;uniform vec2 u187,u188;varying vec2 vv0;void main(){vec2 a=2.*(a0.xy-u188)/u187;gl_Position=vec4(a,0.,1.),vv0=a0.xy;}",
                g: "uniform vec2 u96;uniform float u189,u190,u191;varying vec2 vv0;void main(){vec2 b=vec2(sign(vv0.x)*.5*u189,u190),a=vv0-b,c=u191*a,d=(c-a)*u96;gl_FragColor=vec4(d,0.,1.);}",
                i: "u187 u188 u189 u190 u191 u96".split(" "),
                K: ["a0"],
                S: [3],
                precision: "highp",
              });
              C.oa("s128", {
                name: "_",
                v: "attribute vec3 a0;varying vec2 vv0,vv1;uniform sampler2D u42;uniform vec3 u152;uniform vec2 u43,u187,u188;uniform float u153;const float n=0.,o=0.;const vec2 e=vec2(1.);const vec3 p=vec3(1.);const vec2 F=vec2(-1.,1.),q=vec2(.16,.5),r=vec2(.5,.5),s=vec2(.84,.5);uniform mat4 u83;uniform vec3 u86,u90,u91,u92;uniform float u84,u85,u93,u94,u87,u88,u89,u95;mat3 t(vec3 c){vec3 b=cos(c),a=sin(c);return mat3(b.y*b.z,b.y*a.z,a.y,-a.x*a.y*b.z+b.x*a.z,-a.x*a.y*a.z-b.x*b.z,a.x*b.y,b.x*a.y*b.z+a.x*a.z,b.x*a.y*a.z-a.x*b.z,-b.x*b.y);}void main(){vec4 d=texture2D(u42,q);vec2 f=u93*e;vec3 c=u93*p;vec2 u=mix(d.a*u43,e,f),g=(2.*d.gb-e)*(1.-f);g.x*=-1.;vec3 a=mix(texture2D(u42,r).rgb+vec3(u87,0.,0.),u90,c);float v=mix(texture2D(u42,s).r,0.,u93);a.z+=v;mat3 w=t(a);vec3 x=mix(u152,u91,c);float y=mix(u153,u94,u93);vec3 b=mix(u86,u92,c);b.x+=u84*sin(a.y),b.y+=u85*sin(a.x)*step(0.,a.x);float h=cos(a.z),i=sin(a.z);mat2 z=mat2(h,i,-i,h);b.xy=z*b.xy;float A=mix(u89,1.,u93);vec2 j=u88/u;vec3 k=a0;float B=max(0.,-a0.z-n)*o;k.x+=B*sign(a0.x)*(1.-u93);vec3 C=w*(k+x)*y+b;vec2 D=j*A;vec3 E=vec3(g*D,-j)+C*vec3(1.,-1.,-1.);gl_Position=u83*(vec4(u95*e,e)*vec4(E,1.)),gl_Position*=vec4(-1.,1.,1.,1.),vv0=vec2(.5,.5)+(a0.xy-u188)/u187,vv1=vec2(.5,.5)+.5*gl_Position.xy/gl_Position.w;}",
                g: "uniform sampler2D u192,u193;uniform float u177;varying vec2 vv0,vv1;void main(){vec2 a=u177*texture2D(u192,vv0).rg;gl_FragColor=texture2D(u193,a+vv1);}",
                i: "u177 u42 u192 u193 u187 u188 u43 u86 u153 u152"
                  .split(" ")
                  .concat(C.Cd(), C.Dd()),
                K: ["a0"],
                S: [3],
                precision: "lowp",
              });
              a = !0;
            },
            m: function (v) {
              if (a) {
                if (void 0 === v.jc || !v.od) return !1;
                h = ba.instance({
                  isFloat: !0,
                  isPot: !1,
                  isMipmap: !1,
                  isLinear: !1,
                  width: 256,
                  height: 128,
                  L: 4,
                });
                m = Fa.instance({ width: 256, height: 128 });
                C.j(
                  "s128",
                  [
                    { type: "1i", name: "u42", value: 1 },
                    { type: "1i", name: "u192", value: 2 },
                    { type: "1i", name: "u193", value: 0 },
                    { type: "3f", name: "u86", value: v.Ha },
                    { type: "1f", name: "u177", value: 1 },
                  ].concat(v.Vj, v.Tg)
                );
                f = v.Ye;
                l = v.Xe;
                d = v.Ze;
              }
            },
            ec: function (v) {
              b = v;
            },
            dc: function (v) {
              u = v;
              u.zc(q.Ue);
            },
            Ue: function () {
              c.viewport(0, 0, 256, 128);
              m.u();
              h.u();
              var v = u.pm(),
                J = u.qm(),
                t = [
                  { type: "2f", name: "u187", value: [v, J] },
                  { type: "2f", name: "u188", value: [u.Tl(), u.Ul()] },
                ];
              C.j(
                "s127",
                t.concat([
                  { type: "1f", name: "u189", value: f },
                  { type: "1f", name: "u190", value: l },
                  { type: "1f", name: "u191", value: d },
                  { type: "2f", name: "u96", value: [1 / v, -1 / J] },
                ])
              );
              u.Dh();
              C.j("s128", t);
            },
            W: function () {
              C.set("s128");
              b.h(1);
              h.h(2);
              u.Dh();
            },
            eb: function (v) {
              C.j("s128", [{ type: "3f", name: "u152", value: v }]);
              C.M();
            },
            fb: function (v) {
              C.j("s128", [{ type: "1f", name: "u153", value: v }]);
              C.M();
            },
            Ag: function (v) {
              C.j("s128", [{ type: "1f", name: "u87", value: v }]);
              C.M();
            },
            Co: function (v) {
              d = v;
              q.Ue();
              C.M();
              Aa.animate(Date.now());
            },
            Gb: function (v) {
              v && (u = v);
              q.Ue();
            },
            Bg: function (v, J) {
              p.u177 = 1 - v;
              C.j("s128", p);
              C.j("s128", J);
            },
            I: function () {},
          };
        return q;
      })();
      ya.rc = (function () {
        var a = [0, -0.5],
          b = !1,
          d = !1,
          f = null,
          l = null,
          p = null,
          u = null,
          h = null,
          m = -1,
          q = -1;
        return {
          Sc: function () {
            C.oa("s129", {
              name: "_",
              v: "attribute vec2 a0;uniform sampler2D u42;uniform vec2 u43,u12;uniform float u11;varying vec2 vv0;const vec2 f=vec2(1.,1.);void main(){vec4 a=texture2D(u42,vec2(.25,.5));vec2 b=a.a*u43,c=2.*a.gb-f,d=u12+a0*u11;gl_Position=vec4(c+b*d,0.,1.),vv0=vec2(.5,.5)+.5*a0;}",
              g: "uniform sampler2D u194;varying vec2 vv0;void main(){gl_FragColor=texture2D(u194,vv0);}",
              i: ["u42", "u194", "u43", "u12", "u11"],
              precision: "lowp",
            });
            C.oa("s130", {
              name: "_",
              g: "uniform sampler2D u2,u195,u196;varying vec2 vv0;const vec3 f=vec3(1.,1.,1.);void main(){float a=texture2D(u2,vv0).r;vec3 b=texture2D(u196,vv0).rgb,c=texture2D(u195,vv0).rgb;gl_FragColor=vec4(mix(b,c,a*f),1.);}",
              i: ["u2", "u196", "u195"],
              precision: "lowp",
            });
            b = !0;
          },
          m: function (v) {
            b &&
              ((h = ba.instance({
                isFloat: !1,
                isPot: !0,
                url: v.Le,
                C: function () {
                  d = !0;
                },
              })),
              C.j("s129", [
                { type: "1i", name: "u42", value: 1 },
                { type: "1i", name: "u194", value: 0 },
                { type: "2f", name: "u43", value: v.ek },
                { type: "2f", name: "u12", value: a },
                { type: "1f", name: "u11", value: 3.8 },
              ]),
              C.j("s130", [
                { type: "1i", name: "u195", value: 0 },
                { type: "1i", name: "u2", value: 1 },
                { type: "1i", name: "u196", value: 2 },
              ]));
          },
          ec: function (v) {
            l = v;
          },
          vg: function (v, J) {
            var t = {
              isFloat: !1,
              isPot: !1,
              isMipmap: !1,
              isLinear: !1,
              width: v,
              height: J,
              L: 4,
            };
            m = 2 / v;
            q = 2 / J;
            p = ba.instance(t);
            u = ba.instance(t);
            f = Fa.instance({ width: v, height: J });
          },
          W: function (v, J) {
            if (d) {
              f.bind(!1, !0);
              C.set("s91");
              for (var t = 0; 2 > t; ++t) {
                C.O("u15", m, 0);
                p.u();
                0 !== t && u.h(0);
                var x = 0 === t && !W.ga_;
                X.l(x, x);
                C.O("u15", 0, q);
                u.u();
                p.h(0);
                X.l(!1, !1);
              }
              C.set("s129");
              l.h(1);
              h.h(0);
              p.u();
              c.clearColor(1, 0, 0, 1);
              c.clear(c.COLOR_BUFFER_BIT);
              X.l(!1, !1);
              C.set("s130");
              J.u();
              u.h(0);
              p.h(1);
              v.h(2);
              X.l(!1, !1);
            }
          },
          I: function () {},
        };
      })();
      var jd = (function () {
        var a = {
          instance: function (b) {
            var d = b.$f,
              f = b.Vf,
              l = b.nd,
              p = b.background ? b.background : ba.ii(),
              u = b.pa,
              h = { scale: 1, offsetX: 0, offsetY: 0 },
              m = null;
            b.Uf && ((h.scale = b.Uf.scale), (h.offsetY = b.Uf.offsetY));
            return {
              ci: function () {
                return u;
              },
              Vh: function () {
                return p;
              },
              set: function () {
                m = ib.em();
                ib.yj(h);
                ib.ve();
                ib.we();
                Aa.qj(l, p, !1, !1);
              },
              M: function () {
                ib.yj(m);
              },
              cc: function () {
                return {
                  modelURL: d,
                  materialsURLs: f,
                  background: p.cc(!1),
                  nd: l.cc(!1),
                  pa: u.cc(!0),
                };
              },
              hm: function () {
                return l.cc(!1);
              },
              yp: function (q) {
                p.h(q);
              },
              I: function () {
                l.remove();
                u.remove();
                b.background && p.remove();
              },
            };
          },
          Zc: function (b, d, f) {
            function l() {
              if (3 === ++m && d) {
                var q = a.instance({
                  $f: b.modelURL,
                  Vf: b.materialsURLs,
                  background: p,
                  nd: u,
                  pa: h,
                });
                d(q);
              }
            }
            var p = null,
              u = null,
              h = null,
              m = 0;
            ba.Zc(b.background, function (q) {
              !q && f ? f() : ((p = q), l());
            });
            ba.Zc(b.dataState, function (q) {
              !q && f ? f() : ((u = q), l());
            });
            ba.Zc(b.light, function (q) {
              !q && f ? f() : ((h = q), l());
            });
          },
        };
        return a;
      })();
      return Nb || window.JEELIZVTO;
    })(),
    Ad = (function () {
      function S(pa, Ea) {
        var Ka = Object.prototype.toString.call(pa),
          xb = 0,
          La = pa.length;
        if (
          "[object Array]" === Ka ||
          "[object NodeList]" === Ka ||
          "[object HTMLCollection]" === Ka ||
          "[object Object]" === Ka ||
          ("undefined" !== typeof jQuery && pa instanceof jQuery) ||
          ("undefined" !== typeof Elements && pa instanceof Elements)
        )
          for (; xb < La; xb++) Ea(pa[xb]);
        else Ea(pa);
      }
      var V = function (pa, Ea) {
        function Ka() {
          var La = [];
          this.add = function (Hb) {
            La.push(Hb);
          };
          var mb, Ab;
          this.call = function () {
            mb = 0;
            for (Ab = La.length; mb < Ab; mb++) La[mb].call();
          };
          this.remove = function (Hb) {
            var Rb = [];
            mb = 0;
            for (Ab = La.length; mb < Ab; mb++)
              La[mb] !== Hb && Rb.push(La[mb]);
            La = Rb;
          };
          this.length = function () {
            return La.length;
          };
        }
        function xb(La, mb) {
          if (La)
            if (La.resizedAttached) La.resizedAttached.add(mb);
            else {
              La.resizedAttached = new Ka();
              La.resizedAttached.add(mb);
              La.resizeSensor = document.createElement("div");
              La.resizeSensor.className = "resize-sensor";
              La.resizeSensor.style.cssText =
                "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;";
              La.resizeSensor.innerHTML =
                '<div class="resize-sensor-expand" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;"><div style="position: absolute; left: 0; top: 0; transition: 0s;"></div></div><div class="resize-sensor-shrink" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;"><div style="position: absolute; left: 0; top: 0; transition: 0s; width: 200%; height: 200%"></div></div>';
              La.appendChild(La.resizeSensor);
              La.resizeSensor.offsetParent !== La &&
                (La.style.position = "relative");
              var Ab = La.resizeSensor.childNodes[0],
                Hb = Ab.childNodes[0],
                Rb = La.resizeSensor.childNodes[1],
                $b,
                Ob,
                mc,
                Pb,
                nc = La.offsetWidth,
                yc = La.offsetHeight,
                zc = function () {
                  Hb.style.width = "100000px";
                  Hb.style.height = "100000px";
                  Ab.scrollLeft = 1e5;
                  Ab.scrollTop = 1e5;
                  Rb.scrollLeft = 1e5;
                  Rb.scrollTop = 1e5;
                };
              zc();
              var Ac = function () {
                Ob = 0;
                $b &&
                  ((nc = mc),
                  (yc = Pb),
                  La.resizedAttached && La.resizedAttached.call());
              };
              mb = function () {
                mc = La.offsetWidth;
                Pb = La.offsetHeight;
                ($b = mc != nc || Pb != yc) &&
                  !Ob &&
                  (Ob = window.requestAnimationFrame(Ac));
                zc();
              };
              var oc = function (ac, Bc, pc) {
                ac.attachEvent
                  ? ac.attachEvent("on" + Bc, pc)
                  : ac.addEventListener(Bc, pc);
              };
              oc(Ab, "scroll", mb);
              oc(Rb, "scroll", mb);
            }
        }
        S(pa, function (La) {
          xb(La, Ea);
        });
        this.detach = function (La) {
          V.detach(pa, La);
        };
      };
      V.detach = function (pa, Ea) {
        S(pa, function (Ka) {
          if (Ka) {
            if (
              Ka.resizedAttached &&
              "function" == typeof Ea &&
              (Ka.resizedAttached.remove(Ea), Ka.resizedAttached.length())
            )
              return;
            Ka.resizeSensor &&
              (Ka.contains(Ka.resizeSensor) && Ka.removeChild(Ka.resizeSensor),
              delete Ka.resizeSensor,
              delete Ka.resizedAttached);
          }
        });
      };
      return V;
    })(),
    Mb = {
      glassesDBURL: "https://glassesdbcached.jeeliz.com/sku/",
      appstaticURL: "https://appstatic.jeeliz.com/",
      autoVTOURL: "https://autovtoapi.jeeliz.com/",
      assetsPath: "jeefit/",
    },
    qb = {
      notLoaded: -1,
      initializing: 0,
      realtime: 2,
      loadingModel: 3,
      paused: 4,
    },
    yd = {
      isRT: !0,
      sku: void 0,
      materialsReplacements: "",
      mode: qb.notLoaded,
    },
    Ra = Object.assign({}, yd),
    gb = {
      displayWidth: -1,
      displayHeight: -1,
      cvWidth: -1,
      cvHeight: -1,
      oFactor: -1,
    },
    zd = {
      cv: null,
      container: null,
      adjust: null,
      adjustNotice: null,
      adjustExit: null,
      loading: null,
      trackIframe: null,
    },
    ic = null,
    wc = null,
    Jc = !0,
    Ba = Object.assign({}, zd),
    he = {
      ADJUST_START: null,
      ADJUST_END: null,
      LOADING_START: null,
      LOADING_END: null,
    },
    ed = null,
    Zb = { enabled: !1, callback: null, interval: 1e3 },
    Kc = { error: null },
    uc = null,
    kc = null,
    lc = Mb.appstaticURL + Mb.assetsPath,
    Ua = Nb,
    wb = {
      start: function (S) {
        var V = Object.assign(
          {
            settings: null,
            NNCPath: null,
            assetsPath: Mb.appstaticURL + Mb.assetsPath,
            catalog: null,
            faceDetectionCallback: null,
            faceDetectionInterval: 1e3,
            placeHolder: null,
            canvas: null,
            onError: null,
            callbackReady: null,
            onWebcamGet: null,
            callbacks: {},
            searchImageMask: null,
            searchImageColor: null,
            searchImageRotationSpeed: null,
            isShadow: !0,
            isRequestCamera: !0,
            sku: null,
            modelStandalone: null,
          },
          S
        );
        console.log("INFO in JeelizVTOWidget.js: start()");
        return new Promise(function (pa, Ea) {
          if (Ra.mode !== qb.notLoaded)
            wb.resume()
              .catch(function (xb) {})
              .finally(pa);
          else {
            na();
            if (V.settings) for (var Ka in V.settings) Mb[Ka] = V.settings[Ka];
            V.NNCPath && Ua.set_NNCPath(V.NNCPath);
            V.faceDetectionCallback &&
              ((Zb.enabled = !0),
              (Zb.callback = V.faceDetectionCallback),
              (Zb.interval = V.faceDetectionInterval));
            ed = Object.assign({}, he, V.callbacks);
            Ba.container =
              V.placeHolder || document.getElementById("JeelizVTOWidget");
            if (!Ba.container)
              throw Error(
                "Cannot find a <div> element with id=JeelizVTOWidget to append the VTO widget."
              );
            Ba.cv =
              V.canvas || document.getElementById("JeelizVTOWidgetCanvas");
            Ba.cv ||
              ((Ba.cv = document.createElement("canvas")),
              Ba.container.appendChild(Ba.cv));
            Ba.cv.style.position = "absolute";
            Ba.loading = document.getElementById("JeelizVTOWidgetLoading");
            Kc.error = V.onError;
            kc = V.callbackReady;
            jc();
            Ka = tb(Ba.container);
            if (!Ka.width) return Promise.reject("PLACEHOLDER_NULL_WIDTH");
            if (!Ka.height) return Promise.reject("PLACEHOLDER_NULL_HEIGHT");
            Yb(!0);
            Jc && xc();
            (V.searchImageMask ||
              V.searchImageColor ||
              V.searchImageRotationSpeed) &&
              Ua.set_loading(
                V.searchImageMask,
                V.searchImageColor,
                V.searchImageRotationSpeed
              );
            Ra.mode = qb.initializing;
            lc = V.assetsPath;
            uc = V.catalog;
            if (V.onWebcamGet) Ua.onWebcamGet(V.onWebcamGet);
            Ua.init2({
              basePath: lc,
              cv: Ba.cv,
              width: gb.cvWidth,
              height: gb.cvHeight,
              isRequestCamera: V.isRequestCamera,
              callbackReady: ja,
            }).catch(function (xb) {
              Ra.isRT = !1;
              vb(xb || "NO_ERROR_LABEL");
              Ea();
            });
            Ua.onHalfLoad(function () {
              !1 === V.isShadow && Ua.switch_shadow(!1);
              V.sku
                ? wb.load_glassesDB(V.sku, pa, V.materialsReplacements)
                : V.modelStandalone
                ? wb.load_modelStandalone(V.modelStandalone, pa)
                : pa();
            });
          }
        });
      },
      destroy: function () {
        return Ua.destroy().then(function () {
          Object.assign(Ra, yd);
          kc = uc = null;
          Object.assign(Ba, zd);
        });
      },
      preFetch: function (S, V) {
        Fd(S).then(function (pa) {
          pa && !pa.includes("://") && (pa = lc + "models3D/" + pa);
          var Ea = V ? V.slice(0) : [];
          pa && Ea.push(pa);
          Ua.preFetch(lc, Ea);
        });
      },
      pause: function (S) {
        if (!Ra.isRT || !Ua.ready) return Promise.reject();
        Ra.mode = qb.paused;
        Lc();
        var V = Ua.switch_sleep(!0, S);
        return S ? V : Promise.resolve(V);
      },
      resume: function (S) {
        if (!Ra.isRT || !Ua.ready) return Promise.reject();
        Ra.mode = qb.realtime;
        Jc && xc();
        var V = Ua.switch_sleep(!1, S);
        return S ? V : Promise.resolve(V);
      },
      set_videoRotation: function (S) {
        Ra.isRT && Ua.set_videoRotation(S);
      },
      set_videoSizes: function (S, V, pa, Ea, Ka, xb) {
        Ra.isRT && Ua.set_videoSizes(S, V, pa, Ea, Ka, xb);
      },
      resize: function () {
        ic && clearTimeout(ic);
        ic = setTimeout(function () {
          ic && clearTimeout(ic);
          ic = null;
          Yb(!0);
        }, 420);
      },
      set_scale: function (S) {
        Ua.set_scale(S);
      },
      reset_resizeSensor: xc,
      toggle_resizeSensor: function (S) {
        Jc !== S && ((Jc = S) ? xc() : Lc());
      },
      capture_image: function (S, V, pa) {
        Ua && Ua.ready ? Ua.capture_image(S, V, pa, !1) : V(!1);
      },
      toggle_loading: function (S) {
        S
          ? (ua(Ba.loading), vc("LOADING_START"))
          : (Oa(Ba.loading), vc("LOADING_END"));
      },
      load_modelStandalone: function (S, V) {
        if (Ra.mode === qb.notLoaded)
          throw Error("You should call JEELIZVTOWIDGET.start() first");
        if (!Ra.isRT)
          throw Error("Loading standalone models is only available in RT mode");
        Ra.mode === qb.paused && wb.resume().catch(function (Ka) {});
        Ra.mode = qb.loadingModel;
        wb.toggle_loading(!0);
        var pa = function () {
            wb.toggle_loading(!1);
            V && V();
          },
          Ea = "undef";
        "string" === typeof S
          ? ((Ea = S), Sa(S, Ea).then(pa).catch(fb))
          : ((Ea = "RANDOM_SKU_" + Date.now().toString()), ad(Ea, S, pa));
        Ra.sku = Ea;
        Ra.materialsReplacements = "";
      },
      load_glassesDB: function (S, V, pa) {
        if (Ra.mode === qb.notLoaded)
          throw Error("You should call JEELIZVTOWIDGET.start() first");
        if (Ra.isRT) {
          wb.toggle_loading(!0);
          var Ea = pa ? JSON.stringify(pa) : "";
          S === Ra.sku && Ea === Ra.materialsReplacements
            ? (wb.toggle_loading(!1), V && V())
            : ((Ra.sku = S),
              (Ra.materialsReplacements = Ea),
              (Ra.mode = qb.loadingModel),
              Ra.mode === qb.paused && wb.resume().catch(function (Ka) {}),
              S
                ? uc && uc[S]
                  ? dd(S, uc[S], V, pa)
                  : va(Mb.glassesDBURL + S)
                      .then(function (Ka) {
                        if (Ka.error) return fb();
                        dd(S, Ka.intrinsic, V, pa);
                      })
                      .catch(fb)
                : ((Ra.mode = qb.realtime),
                  wb.toggle_loading(!1),
                  Ua.start_rendering(),
                  V && V()));
        }
      },
      enter_adjustMode: zb,
      exit_adjustMode: Gb,
      set_LUT: function (S) {
        return Ua && Ua.ready
          ? Ua.set_LUT(S || null)
          : Promise.reject("NOT_READY");
      },
      tweak_autoVTOModel: $c,
    };
  return wb;
})();
window.JEELIZVTO = JEELIZVTO;
window.JEELIZVTOWIDGET = {
  VERSION: JEELIZVTO.VERSION,
  capture_image: JeelizVTOWidget.capture_image,
  destroy: JeelizVTOWidget.destroy,
  enter_adjustMode: JeelizVTOWidget.enter_adjustMode,
  exit_adjustMode: JeelizVTOWidget.exit_adjustMode,
  load: JeelizVTOWidget.load_glassesDB,
  load_modelStandalone: JeelizVTOWidget.load_modelStandalone,
  pause: JeelizVTOWidget.pause,
  preFetch: JeelizVTOWidget.preFetch,
  request_cameraVideoStream: JEELIZVTO.request_cameraVideoStream,
  reset_resizeSensor: JeelizVTOWidget.reset_resizeSensor,
  toggle_resizeSensor: JeelizVTOWidget.toggle_resizeSensor,
  resize: JeelizVTOWidget.resize,
  resume: JeelizVTOWidget.resume,
  set_LUT: JeelizVTOWidget.set_LUT,
  set_scale: JeelizVTOWidget.set_scale,
  set_videoRotation: JeelizVTOWidget.set_videoRotation,
  set_videoSizes: JeelizVTOWidget.set_videoSizes,
  start: JeelizVTOWidget.start,
  tweak_autoVTOModel: JeelizVTOWidget.tweak_autoVTOModel,
};
