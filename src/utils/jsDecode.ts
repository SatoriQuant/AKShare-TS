/**
 * AKShare TypeScript - Sina JavaScript Decoder Utility
 * Executes Sina's encoded financial data using Node.js VM
 */

import vm from 'vm';

/**
 * Decode Sina's encoded stock data using the hk_js_decode algorithm.
 * This is the same decoder used in Python AKShare with py_mini_racer.
 *
 * @param encodedStr The encoded string from Sina's API response
 * @returns Decoded array of objects
 */
export function decodeSinaData(encodedStr: string): any[] {
  // The hk_js_decode function from Python AKShare
  const jsCode = `
function d(t) {
    var e, i, n, r, a, o, s, l = (arguments, 864e5), u = 7657, c = [], d = [], h = ~(3 << 30), f = 1 << 30, m = [0, 3, 5, 6, 9, 10, 12, 15, 17, 18, 20, 23, 24, 27, 29, 30], p = Math, g = function() {
        var l, u;
        for (l = 0; 64 > l; l++) d[l] = p.pow(2, l), 26 > l && (c[l] = v(l + 65), c[l + 26] = v(l + 97), 10 > l && (c[l + 52] = v(l + 48)));
        for (c.push("+", "/"), c = c.join(""), i = t.split(""), n = i.length, l = 0; n > l; l++) i[l] = c.indexOf(i[l]);
        return r = {}, e = o = 0, a = {}, u = w([12, 6]), s = 63 ^ u[1], {
            _1479: D, _136: _, _200: C, _139: R, _197: A, _3466: O
        }["_" + u[0]] || function() { return [] }
    }, v = String.fromCharCode, b = function(t) { return t === {}._ }, N = function() {
        var t, e;
        for (t = y(), e = 1; ; ) { if (!y()) return e * (2 * t - 1); e++ }
    }, y = function() {
        var t;
        return e >= n ? 0 : (t = i[e] & 1 << o, o++, o >= 6 && (o -= 6, e++), !!t)
    }, w = function(t, r, a) {
        var s, l, u, c, h;
        for (l = [], u = 0, r || (r = []), a || (a = []), s = 0; s < t.length; s++)
            if (c = t[s], u = 0, c) {
                if (e >= n) return l;
                if (t[s] <= 0) u = 0;
                else if (t[s] <= 30) {
                    for (; h = 6 - o, h = c > h ? h : c, u |= (i[e] >> o & (1 << h) - 1) << t[s] - c, o += h, o >= 6 && (o -= 6, e++), c -= h, !(0 >= c); );
                    r[s] && u >= d[t[s] - 1] && (u -= d[t[s]])
                } else u = w([30, t[s] - 30], [0, r[s]]), a[s] || (u = u[0] + u[1] * d[30]);
                l[s] = u
            } else l[s] = 0;
        return l
    }, x = function() {
        var t;
        return t = w([3])[0], 1 == t ? (r.d = w([18], [1])[0], t = 0) : t || (t = w([6])[0]), t
    }, S = function(t) {
        var e, i, n;
        for (t > 1 && (e = 0), e = 0; t > e; e++) r.d++, n = r.d % 7, (3 == n || 4 == n) && (r.d += 5 - n);
        return i = new Date, i.setTime((u + r.d) * l), i
    }, k = function(t) {
        var e, i, n;
        for (n = r.wd || 62, e = 0; t > e; e++) do r.d++; while (!(n & 1 << (r.d % 7 + 10) % 7));
        return i = new Date, i.setTime((u + r.d) * l), i
    }, T = function(t) {
        var e, i, n;
        return t ? 0 > t ? (e = T(-t), [-e[0], -e[1]]) : (e = t % 3, i = (t - e) / 3, n = [i, i], e && n[e - 1]++, n) : [0, 0]
    }, P = function(t, e, i) {
        var n, r, a;
        for (r = "number" == typeof e ? T(e) : e, a = T(i), n = [a[0] - r[0], a[1] - r[1]], r = 1; n[0] < n[1]; ) r *= 5, n[1]--;
        for (; n[1] < n[0]; ) r *= 2, n[0]--;
        if (r > 1 && (t *= r), n = n[0], t = E(t), 0 > n) {
            for (; t.length + n <= 0; ) t = "0" + t;
            return n += t.length, r = t.substr(0, n) - 0, void 0 === i ? r + "." + t.substr(n) - 0 : (a = t.charAt(n) - 0, a > 5 ? r++ : 5 == a && (t.substr(n + 1) - 0 > 0 ? r++ : r += 1 & r), r)
        }
        for (; n > 0; n--) t += "0";
        return t - 0
    }, C = function() {
        var t, i, a, o, l;
        if (s >= 1) return [];
        for (r.d = w([18], [1])[0] - 1, a = w([3, 3, 30, 6]), r.p = a[0], r.ld = a[1], r.cd = a[2], r.c = a[3], r.m = p.pow(10, r.p), r.pc = r.cd / r.m, i = [], t = 0; o = { d: 1 }, y() && (a = w([3])[0], 0 == a ? o.d = w([6])[0] : 1 == a ? (r.d = w([18])[0], o.d = 0) : o.d = a), l = { date: S(o.d) }, y() && (r.ld += N()), a = w([3 * r.ld], [1]), r.cd += a[0], l.close = r.cd / r.m, i.push(l), !(e >= n) && (e != n - 1 || 63 & (r.c ^ t + 1)); t++);
        return i[0].prevclose = r.pc, i
    }, _ = function() {
        var t, i, a, o, l, u, c, d, h, f, m;
        if (s > 2) return [];
        for (c = [], h = { v: "volume", p: "price", a: "avg_price" }, r.d = w([18], [1])[0] - 1, d = { date: S(1) }, a = w(1 > s ? [3, 3, 4, 1, 1, 1, 5] : [4, 4, 4, 1, 1, 1, 3]), t = 0; 7 > t; t++) r[["la", "lp", "lv", "tv", "rv", "zv", "pp"][t]] = a[t];
        for (r.m = p.pow(10, r.pp), s >= 1 ? (a = w([3, 3]), r.c = a[0], a = a[1]) : (a = 5, r.c = 2), r.pc = w([6 * a])[0], d.pc = r.pc / r.m, r.cp = r.pc, r.da = 0, r.sa = r.sv = 0, t = 0; !(e >= n) && (e != n - 1 || 7 & (r.c ^ t)); t++) {
            for (l = {}, o = {}, f = r.tv ? y() : 1, i = 0; 3 > i; i++)
                if (m = ["v", "p", "a"][i], (f ? y() : 0) && (a = N(), r["l" + m] += a), u = "v" == m && r.rv ? y() : 1, a = w([3 * r["l" + m] + ("v" == m ? 7 * u : 0)], [!!i])[0] * (u ? 1 : 100), o[m] = a, "v" == m) {
                    if (!(l[h[m]] = a) && (s > 1 || 241 > t) && (r.zv ? !y() : 1)) { o.p = 0; break }
                } else "a" == m && (r.da = (1 > s ? 0 : r.da) + o.a);
            r.sv += o.v, l[h.p] = (r.cp += o.p) / r.m, r.sa += o.v * r.cp, l[h.a] = b(o.a) ? t ? c[t - 1][h.a] : l[h.p] : r.sv ? ((p.floor((r.sa * (2e3 / r.m) + r.sv) / r.sv) >> 1) + r.da) / 1e3 : l[h.p] + r.da / 1e3, c.push(l)
        }
        return c[0].date = d.date, c[0].prevclose = d.pc, c
    }, D = function() {
        var t, e, i, n, a, o, l;
        if (s >= 1) return [];
        for (r.lv = 0, r.ld = 0, r.cd = 0, r.cv = [0, 0], r.p = w([6])[0], r.d = w([18], [1])[0] - 1, r.m = p.pow(10, r.p), a = w([3, 3]), r.md = a[0], r.mv = a[1], t = []; a = w([6]), a.length; ) {
            if (i = { c: a[0] }, n = {}, i.d = 1, 32 & i.c) for (; ; ) {
                if (a = w([6])[0], 63 == (16 | a)) { l = 16 & a ? "x" : "u", a = w([3, 3]), i[l + "_d"] = a[0] + r.md, i[l + "_v"] = a[1] + r.mv; break }
                if (32 & a) { o = 8 & a ? "d" : "v", l = 16 & a ? "x" : "u", i[l + "_" + o] = (7 & a) + r["m" + o]; break }
                if (o = 15 & a, 0 == o ? i.d = w([6])[0] : 1 == o ? (r.d = o = w([18])[0], i.d = 0) : i.d = o, !(16 & a)) break
            }
            n.date = S(i.d);
            for (o in { v: 0, d: 0 }) b(i["x_" + o]) || (r["l" + o] = i["x_" + o]), b(i["u_" + o]) && (i["u_" + o] = r["l" + o]);
            for (i.l_l = [i.u_d, i.u_d, i.u_d, i.u_d, i.u_v], l = m[15 & i.c], 1 & i.u_v && (l = 31 - l), 16 & i.c && (i.l_l[4] += 2), e = 0; 5 > e; e++) l & 1 << 4 - e && i.l_l[e]++, i.l_l[e] *= 3;
            i.d_v = w(i.l_l, [1, 0, 0, 1, 1], [0, 0, 0, 0, 1]), o = r.cd + i.d_v[0], n.open = o / r.m, n.high = (o + i.d_v[1]) / r.m, n.low = (o - i.d_v[2]) / r.m, n.close = (o + i.d_v[3]) / r.m, a = i.d_v[4], "number" == typeof a && (a = [a, a >= 0 ? 0 : -1]), r.cd = o + i.d_v[3], l = r.cv[0] + a[0], r.cv = [l & h, r.cv[1] + a[1] + !!((r.cv[0] & h) + (a[0] & h) & f)], n.volume = (r.cv[0] & f - 1) + r.cv[1] * f, t.push(n)
        }
        return t
    }, R = function() {
        var t, e, i, n;
        if (s > 1) return [];
        for (r.l = 0, n = -1, r.d = w([18])[0] - 1, i = w([18])[0]; r.d < i; ) e = S(1), 0 >= n ? (y() && (r.l += N()), n = w([3 * r.l], [0])[0] + 1, t || (t = [e], n--)) : t.push(e), n--;
        return t
    }, A = function() {
        var t, i, a, o;
        if (s >= 1) return [];
        for (r.f = w([6])[0], r.c = w([6])[0], a = [], r.dv = [], r.dl = [], t = 0; t < r.f; t++) r.dv[t] = 0, r.dl[t] = 0;
        for (t = 0; !(e >= n) && (e != n - 1 || 7 & (r.c ^ t)); t++) {
            for (o = [], i = 0; i < r.f; i++) y() && (r.dl[i] += N()), r.dv[i] += w([3 * r.dl[i]], [1])[0], o[i] = r.dv[i];
            a.push(o)
        }
        return a
    }, O = function() {
        if (r = { b_avp: 1, b_ph: 0, b_phx: 0, b_sep: 0, p_p: 6, p_v: 0, p_a: 0, p_e: 0, p_t: 0, l_o: 3, l_h: 3, l_l: 3, l_c: 3, l_v: 5, l_a: 5, l_e: 3, l_t: 0, u_p: 0, u_v: 0, u_a: 0, wd: 62, d: 0 }, s > 0) return [];
        var t, i, a, o, l, u, c;
        for (t = []; ; ) {
            if (e >= n) return void 0;
            if (a = { d: 1, c: 0 }, y()) if (y()) {
                if (y()) {
                    for (a.c++, a.a = r.b_avp, y() && (r.b_avp ^= y(), r.b_ph ^= y(), r.b_phx ^= y(), a.s = r.b_sep, r.b_sep ^= y(), y() && (r.wd = w([7])[0]), a.s ^ r.b_sep && (a.s ? r.u_p = r.u_c : r.u_o = r.u_h = r.u_l = r.u_c = r.u_p)), u = 0; u < 3 + 2 * r.b_ph; u++)
                        if (y() && (l = "pvaet".charAt(u), o = r["p_" + l], r["p_" + l] += N(), r["u_" + l] = P(r["u_" + l], o, r["p_" + l]) - 0, r.b_sep && !u))
                            for (c = 0; 4 > c; c++) l = "ohlc".charAt(c), r["u_" + l] = P(r["u_" + l], o, r.p_p) - 0;
                    !r.b_avp && a.a && (r.u_a = P(i && i.amount || 0, 0, r.p_a))
                }
                if (y()) for (a.c++, u = 0; u < 7 + r.b_ph + r.b_phx; u++) y() && (6 == u ? a.d = x() : r["l_" + "ohlcva*et".charAt(u)] += N());
                if (y() && (a.c++, l = r.l_o + (y() && N()), o = w([3 * l], [1])[0], a.p = r.b_sep ? r.u_c + o : r.u_p += o), !a.c) break
            } else y() ? y() ? y() ? a.d = x() : r.l_v += N() : r.b_ph && y() ? r["l_" + "et".charAt(r.b_phx && y())] += N() : r.l_a += N() : r["l_" + "ohlc".charAt(w([2])[0])] += N();
            for (u = 0; u < 6 + r.b_ph + r.b_phx; u++) c = "ohlcvaet".charAt(u), o = (r.b_sep ? 191 : 185) >> u & 1, a["v_" + c] = w([3 * r["l_" + c]], [o])[0];
            i = { date: k(a.d) }, a.p && (i.prevclose = P(a.p, r.p_p)), r.b_sep ? (i.open = P(r.u_o += a.v_o, r.p_p), i.high = P(r.u_h += a.v_h, r.p_p), i.low = P(r.u_l += a.v_l, r.p_p), i.close = P(r.u_c += a.v_c, r.p_p)) : (a.o = r.u_p + a.v_o, i.open = P(a.o, r.p_p), i.high = P(a.o + a.v_h, r.p_p), i.low = P(a.o - a.v_l, r.p_p), i.close = P(r.u_p = a.o + a.v_c, r.p_p)), i.volume = P(r.u_v += a.v_v, r.p_v), r.b_avp ? (o = T(r.p_p), l = T(r.p_v), i.amount = P(P(Math.floor((r.b_sep ? (r.u_o + r.u_h + r.u_l + r.u_c) / 4 : a.o + (a.v_h - a.v_l + a.v_c) / 4) * r.u_v + .5), [o[0] + l[0], o[1] + l[1]], r.p_a) + a.v_a, r.p_a)) : (r.u_a += a.v_a, i.amount = P(r.u_a, r.p_a)), r.b_ph && (i.postVol = P(a.v_e, r.p_e), i.postAmt = P(Math.floor(i.postVol * i.close + (r.b_phx ? P(a.v_t, r.p_t) : 0) + .5), 0)), t.push(i)
        }
        return t
    }, E = function(t) {
        var e, i, n;
        if (t = (t || 0).toString(), n = [], i = t.toLowerCase().indexOf("e"), i > 0) {
            for (e = t.substr(i + 1) - 0; e >= 0; e--) n.push(Math.floor(e * Math.pow(10, -e) + .5) - 0);
            return n.join("")
        }
        return t
    };
    return g()()
}`;

  try {
    const sandbox: any = {};
    vm.createContext(sandbox);
    vm.runInContext(jsCode, sandbox);
    const result = vm.runInContext(`d(${JSON.stringify(encodedStr)})`, sandbox);
    return result || [];
  } catch (error) {
    return [];
  }
}

/**
 * Decode Sina's US stock data using the zh_js_decode algorithm.
 * This is the same decoder used in Python AKShare for US stocks.
 */
export function decodeSinaUSData(encodedStr: string): any[] {
  const jsCode = `
function d(t) {
    var e, n, i, o, r, a, s, l = (arguments, 864e5), c = 7657, u = [], h = [], d = ~(3 << 30), f = 1 << 30, p = [0, 3, 5, 6, 9, 10, 12, 15, 17, 18, 20, 23, 24, 27, 29, 30], g = Math, v = function() {
        var l, c;
        for (l = 0; 64 > l; l++) h[l] = g.pow(2, l), 26 > l && (u[l] = m(l + 65), u[l + 26] = m(l + 97), 10 > l && (u[l + 52] = m(l + 48)));
        for (u.push("+", "/"), u = u.join(""), n = t.split(""), i = n.length, l = 0; i > l; l++) n[l] = u.indexOf(n[l]);
        return o = {}, e = a = 0, r = {}, c = N([12, 6]), s = 63 ^ c[1], {
            _1479: M, _136: A, _200: k, _139: O, _197: _mi_run, _3466: _k2_run
        }["_" + c[0]] || function() { return [] }
    }, m = String.fromCharCode, b = function(t) { return t === {}._ }, y = function() {
        var t, e;
        for (t = _(), e = 1; ; ) { if (!_()) return e * (2 * t - 1); e++ }
    }, _ = function() {
        var t;
        return e >= i ? 0 : (t = n[e] & 1 << a, a++, a >= 6 && (a -= 6, e++), !!t)
    }, N = function(t, o, r) {
        var s, l, c, u, d;
        for (l = [], c = 0, o || (o = []), r || (r = []), s = 0; s < t.length; s++)
            if (u = t[s], c = 0, u) {
                if (e >= i) return l;
                if (t[s] <= 0) c = 0;
                else if (t[s] <= 30) {
                    for (; d = 6 - a, d = u > d ? d : u, c |= (n[e] >> a & (1 << d) - 1) << t[s] - u, a += d, a >= 6 && (a -= 6, e++), u -= d, !(0 >= u); );
                    o[s] && c >= h[t[s] - 1] && (c -= h[t[s]])
                } else c = N([30, t[s] - 30], [0, o[s]]), r[s] || (c = c[0] + c[1] * h[30]);
                l[s] = c
            } else l[s] = 0;
        return l
    }, x = function() {
        var t;
        return t = N([3])[0], 1 == t ? (o.d = N([18], [1])[0], t = 0) : t || (t = N([6])[0]), t
    }, w = function(t) {
        var e, n, i;
        for (t > 1 && (e = 0), e = 0; t > e; e++) o.d++, i = o.d % 7, (3 == i || 4 == i) && (o.d += 5 - i);
        return n = new Date, n.setTime((c + o.d) * l), n
    }, S = function(t) {
        var e, n, i;
        for (t > 1 && (e = 0), e = 0; t > e; e++) o.d++, i = o.d % 7, (3 == i || 4 == i) && (o.d += 5 - i);
        return n = new Date, n.setTime((c + o.d) * l), n
    }, T = function(t) {
        var e, n, i;
        return t ? 0 > t ? (e = T(-t), [-e[0], -e[1]]) : (e = t % 3, n = (t - e) / 3, i = [n, n], e && i[e - 1]++, i) : [0, 0]
    }, P = function(t, e, i) {
        var n, r, a;
        for (r = "number" == typeof e ? T(e) : e, a = T(i), n = [a[0] - r[0], a[1] - r[1]], r = 1; n[0] < n[1]; ) r *= 5, n[1]--;
        for (; n[1] < n[0]; ) r *= 2, n[0]--;
        if (r > 1 && (t *= r), n = n[0], t = E(t), 0 > n) {
            for (; t.length + n <= 0; ) t = "0" + t;
            return n += t.length, r = t.substr(0, n) - 0, void 0 === i ? r + "." + t.substr(n) - 0 : (a = t.charAt(n) - 0, a > 5 ? r++ : 5 == a && (t.substr(n + 1) - 0 > 0 ? r++ : r += 1 & r), r)
        }
        for (; n > 0; n--) t += "0";
        return t - 0
    }, k = function() {
        var t, i, a, l, u, c, h, f, m, v, b, N, w, x, S, k, T;
        if (s >= 1) return [];
        for (o.d = N([18], [1])[0] - 1, a = N([3, 3, 30, 6]), o.p = a[0], o.ld = a[1], o.cd = a[2], o.c = a[3], o.m = g.pow(10, o.p), o.pc = o.cd / o.m, i = [], t = 0; l = { d: 1 }, _() && (a = N([3])[0], 0 == a ? l.d = N([6])[0] : 1 == a ? (o.d = N([18])[0], l.d = 0) : l.d = a), u = { date: w(l.d) }, _() && (o.ld += y()), a = N([3 * o.ld], [1]), o.cd += a[0], u.close = o.cd / o.m, i.push(u), !(e >= i) && (e != i - 1 || 63 & (o.c ^ t + 1)); t++);
        return i[0].prevclose = o.pc, i
    }, A = function() {
        var t, i, a, l, u, c, h, f, m, v, b, N, w, x, S, k, T;
        if (s > 2) return [];
        for (h = [], m = { v: "volume", p: "price", a: "avg_price" }, o.d = N([18], [1])[0] - 1, f = { date: w(1) }, a = N(1 > s ? [3, 3, 4, 1, 1, 1, 5] : [4, 4, 4, 1, 1, 1, 3]), t = 0; 7 > t; t++) o[["la", "lp", "lv", "tv", "rv", "zv", "pp"][t]] = a[t];
        for (o.m = g.pow(10, o.pp), s >= 1 ? (a = N([3, 3]), o.c = a[0], a = a[1]) : (a = 5, o.c = 2), o.pc = N([6 * a])[0], f.pc = o.pc / o.m, o.cp = o.pc, o.da = 0, o.sa = o.sv = 0, t = 0; !(e >= i) && (e != i - 1 || 7 & (o.c ^ t)); t++) {
            for (l = {}, u = {}, b = o.tv ? _() : 1, n = 0; 3 > n; n++)
                if (N = ["v", "p", "a"][n], (b ? _() : 0) && (a = y(), o["l" + N] += a), c = "v" == N && o.rv ? _() : 1, a = w([3 * o["l" + N] + ("v" == N ? 7 * c : 0)], [!!n])[0] * (c ? 1 : 100), u[N] = a, "v" == N) {
                    if (!(l[m[N]] = a) && (s > 1 || 241 > t) && (o.zv ? !_() : 1)) { u.p = 0; break }
                } else "a" == N && (o.da = (1 > s ? 0 : o.da) + u.a);
            o.sv += u.v, l[m.p] = (o.cp += u.p) / o.m, o.sa += u.v * o.cp, l[m.a] = b(u.a) ? t ? h[t - 1][m.a] : l[m.p] : o.sv ? ((g.floor((o.sa * (2e3 / o.m) + o.sv) / o.sv) >> 1) + o.da) / 1e3 : l[m.p] + o.da / 1e3, h.push(l)
        }
        return h[0].date = f.date, h[0].prevclose = f.pc, h
    }, M = function() {
        var t, n, i, a, l, u, c;
        if (s >= 1) return [];
        for (o.lv = 0, o.ld = 0, o.cd = 0, o.cv = [0, 0], o.p = N([6])[0], o.d = N([18], [1])[0] - 1, o.m = g.pow(10, o.p), a = N([3, 3]), o.md = a[0], o.mv = a[1], t = []; a = N([6]), a.length; ) {
            if (i = { c: a[0] }, u = {}, i.d = 1, 32 & i.c) for (; ; ) {
                if (a = N([6])[0], 63 == (16 | a)) { c = 16 & a ? "x" : "u", a = N([3, 3]), i[c + "_d"] = a[0] + o.md, i[c + "_v"] = a[1] + o.mv; break }
                if (32 & a) { l = 8 & a ? "d" : "v", c = 16 & a ? "x" : "u", i[c + "_" + l] = (7 & a) + o["m" + l]; break }
                if (l = 15 & a, 0 == l ? i.d = N([6])[0] : 1 == l ? (o.d = l = N([18])[0], i.d = 0) : i.d = l, !(16 & a)) break
            }
            u.date = S(i.d);
            for (l in { v: 0, d: 0 }) b(i["x_" + l]) || (o["l" + l] = i["x_" + l]), b(i["u_" + l]) && (i["u_" + l] = o["l" + l]);
            for (i.l_l = [i.u_d, i.u_d, i.u_d, i.u_d, i.u_v], c = p[15 & i.c], 1 & i.u_v && (c = 31 - c), 16 & i.c && (i.l_l[4] += 2), n = 0; 5 > n; n++) c & 1 << 4 - n && i.l_l[n]++, i.l_l[n] *= 3;
            i.d_v = w(i.l_l, [1, 0, 0, 1, 1], [0, 0, 0, 0, 1]), l = o.cd + i.d_v[0], u.open = l / o.m, u.high = (l + i.d_v[1]) / o.m, u.low = (l - i.d_v[2]) / o.m, u.close = (l + i.d_v[3]) / o.m, a = i.d_v[4], "number" == typeof a && (a = [a, a >= 0 ? 0 : -1]), o.cd = l + i.d_v[3], c = o.cv[0] + a[0], o.cv = [c & d, o.cv[1] + a[1] + !!((o.cv[0] & d) + (a[0] & d) & f)], u.volume = (o.cv[0] & f - 1) + o.cv[1] * f, t.push(u)
        }
        return t
    }, O = function() {
        var t, n, i, a;
        if (s > 1) return [];
        for (o.l = 0, a = -1, o.d = N([18])[0] - 1, i = N([18])[0]; o.d < i; ) n = S(1), 0 >= a ? (_() && (o.l += y()), a = N([3 * o.l], [0])[0] + 1, t || (t = [n], a--)) : t.push(n), a--;
        return t
    }, _mi_run = function() {
        var t, n, i, a;
        if (s >= 1) return [];
        for (o.f = N([6])[0], o.c = N([6])[0], i = [], o.dv = [], o.dl = [], t = 0; t < o.f; t++) o.dv[t] = 0, o.dl[t] = 0;
        for (t = 0; !(e >= n) && (e != n - 1 || 7 & (o.c ^ t)); t++) {
            for (a = [], n = 0; n < o.f; n++) _() && (o.dl[n] += y()), o.dv[n] += w([3 * o.dl[n]], [1])[0], a[n] = o.dv[n];
            i.push(a)
        }
        return i
    }, _k2_run = function() {
        if (o = { b_avp: 1, b_ph: 0, b_phx: 0, b_sep: 0, p_p: 6, p_v: 0, p_a: 0, p_e: 0, p_t: 0, l_o: 3, l_h: 3, l_l: 3, l_c: 3, l_v: 5, l_a: 5, l_e: 3, l_t: 0, u_p: 0, u_v: 0, u_a: 0, wd: 62, d: 0 }, s > 0) return [];
        var t, n, i, a, l, u, c;
        for (t = []; ; ) {
            if (e >= i) return void 0;
            if (a = { d: 1, c: 0 }, _()) if (_()) {
                if (_()) {
                    for (a.c++, a.a = o.b_avp, _() && (o.b_avp ^= _(), o.b_ph ^= _(), o.b_phx ^= _(), a.s = o.b_sep, o.b_sep ^= _(), _() && (o.wd = N([7])[0]), a.s ^ o.b_sep && (a.s ? o.u_p = o.u_c : o.u_o = o.u_h = o.u_l = o.u_c = o.u_p)), u = 0; u < 3 + 2 * o.b_ph; u++)
                        if (_() && (l = "pvaet".charAt(u), c = o["p_" + l], o["p_" + l] += y(), o["u_" + l] = P(o["u_" + l], c, o["p_" + l]) - 0, o.b_sep && !u))
                            for (a = 0; 4 > a; a++) l = "ohlc".charAt(a), o["u_" + l] = P(o["u_" + l], c, o.p_p) - 0;
                    !o.b_avp && a.a && (o.u_a = P(n && n.amount || 0, 0, o.p_a))
                }
                if (_()) for (a.c++, u = 0; u < 7 + o.b_ph + o.b_phx; u++) _() && (6 == u ? a.d = x() : o["l_" + "ohlcva*et".charAt(u)] += y());
                if (_() && (a.c++, l = o.l_o + (_() && y()), c = N([3 * l], [1])[0], a.p = o.b_sep ? o.u_c + c : o.u_p += c), !a.c) break
            } else _() ? _() ? _() ? a.d = x() : o.l_v += y() : o.b_ph && _() ? o["l_" + "et".charAt(o.b_phx && _())] += y() : o.l_a += y() : o["l_" + "ohlc".charAt(N([2])[0])] += y();
            for (u = 0; u < 6 + o.b_ph + o.b_phx; u++) c = "ohlcvaet".charAt(u), l = (o.b_sep ? 191 : 185) >> u & 1, a["v_" + c] = N([3 * o["l_" + c]], [l])[0];
            n = { date: S(a.d) }, a.p && (n.prevclose = P(a.p, o.p_p)), o.b_sep ? (n.open = P(o.u_o += a.v_o, o.p_p), n.high = P(o.u_h += a.v_h, o.p_p), n.low = P(o.u_l += a.v_l, o.p_p), n.close = P(o.u_c += a.v_c, o.p_p)) : (a.o = o.u_p + a.v_o, n.open = P(a.o, o.p_p), n.high = P(a.o + a.v_h, o.p_p), n.low = P(a.o - a.v_l, o.p_p), n.close = P(o.u_p = a.o + a.v_c, o.p_p)), n.volume = P(o.u_v += a.v_v, o.p_v), o.b_avp ? (l = T(o.p_p), c = T(o.p_v), n.amount = P(P(Math.floor((o.b_sep ? (o.u_o + o.u_h + o.u_l + o.u_c) / 4 : a.o + (a.v_h - a.v_l + a.v_c) / 4) * o.u_v + .5), [l[0] + c[0], l[1] + c[1]], o.p_a) + a.v_a, o.p_a)) : (o.u_a += a.v_a, n.amount = P(o.u_a, o.p_a)), o.b_ph && (n.postVol = P(a.v_e, o.p_e), n.postAmt = P(Math.floor(n.postVol * n.close + (o.b_phx ? P(a.v_t, o.p_t) : 0) + .5), 0)), t.push(n)
        }
        return t
    }, E = function(t) {
        var e, n, i;
        if (t = (t || 0).toString(), i = [], e = t.toLowerCase().indexOf("e"), e > 0) {
            for (n = t.substr(e + 1) - 0; n >= 0; n--) i.push(Math.floor(n * Math.pow(10, -n) + .5) - 0);
            return i.join("")
        }
        return t
    };
    return v()()
}`;

  try {
    const sandbox: any = {};
    vm.createContext(sandbox);
    vm.runInContext(jsCode, sandbox);
    const result = vm.runInContext(`d(${JSON.stringify(encodedStr)})`, sandbox);
    return result || [];
  } catch (error) {
    return [];
  }
}

/**
 * Format a Date object as "YYYY-MM-DD"
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse Sina's "d" format date (days since epoch) to Date
 */
export function sinaDaysToDate(days: number): Date {
  const epoch = new Date(7657 * 86400000); // 7657 days from 1970-01-01
  return new Date(epoch.getTime() + days * 86400000);
}
