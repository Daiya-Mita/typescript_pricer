"use strict";
function pdf(x) {
    // 正規分布の確率密度関数
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
function function_parser_sample(func_param) {
    // とりあえずの動作確認用,リスト形式のfunction mappingを取り込んでペイオフ関数を返す
    var grid_number = func_param.length;
    var from_grid = [];
    var to_grid = [];
    var a = [];
    var b = [];
    for (var i = 0; i < grid_number; i++) {
        from_grid.push(Number(func_param[i].substr(0, 4)));
        to_grid.push(Number(func_param[i].substr(4, 4)));
        a.push(Number(func_param[i].substr(9, 4)));
        b.push(Number(func_param[i].substr(13, 4)));
    }
    return function payoff_function(x) {
        var target_grid = 0;
        for (var i = 0; i < grid_number; i++) {
            if (to_grid[i] >= x) {
                target_grid = i;
                break;
            }
        }
        return a[target_grid] * x + b[target_grid];
    };
}
var spot = 100; // 外部から取ってくることを想定
var vol = 0.8; // 外部から取ってくることを想定
var expiry_date = new Date('2020/06/17 12:34:56');
var expiry_date_unix = Math.floor(expiry_date.getTime() / 1000); // 外部から取ってくることを想定
var now = new Date();
var now_unix = Math.floor(now.getTime() / 1000);
var expiry = (expiry_date_unix - now_unix) / (365 * 60 * 60 * 24); // 非負制約はあった方が良いかも
var r = 0;
// function mapping,とりあえず 0-100まで傾き1でその後フラットになる関数を想定
var func_1_param = ['00000100:00010000', '01009999:00000100'];
var payoff_func = function_parser_sample(func_1_param); // 外部から取ってくることを想定
function deriv_pricer(spot, vol, expiry, r, payoff_func) {
    var mesh = 1000;
    var rnd_domain_min = -5;
    var rnd_domain_max = 5;
    var step_delta = (rnd_domain_max - rnd_domain_min) / mesh;
    var runningSum = 0;
    for (var i = 0; i < mesh; i++) {
        var x = rnd_domain_min + i * step_delta;
        var moved_spot = spot * Math.exp(r * expiry - 0.5 * vol * vol * expiry + vol * Math.sqrt(expiry) * x);
        //var payoff:number = Math.max(0, moved_spot - 50);  // payoff関数がmaxになってるとコールオプション
        var payoff = payoff_func(moved_spot);
        runningSum += payoff * pdf(x) * step_delta;
    }
    var ans = runningSum * Math.exp(-r * expiry);
    return ans;
}
console.log(deriv_pricer(spot, vol, expiry, r, payoff_func));
