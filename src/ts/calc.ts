function pdf(x: number){
    // 正規分布の確率密度関数
    return Math.exp(-0.5 * x * x)/Math.sqrt(2 * Math.PI)
}

function function_parser_sample(func_param: String[]){
    // とりあえずの動作確認用,リスト形式のfunction mappingを取り込んでペイオフ関数を返す
    let grid_number:number = func_param.length;
    let from_grid:number[] = [];
    let to_grid:number[] = [];
    let a:number[] = [];
    let b:number[] = [];
    for (var i = 0; i < grid_number; i++){
        from_grid.push(Number(func_param[i].substr(0, 4)));
        to_grid.push(Number(func_param[i].substr(4, 4)));
        a.push(Number(func_param[i].substr(9, 4)));
        b.push(Number(func_param[i].substr(13, 4)));
    }
    return function payoff_function(x: number){
        let target_grid:number = 0;
        for (var i = 0; i < grid_number; i++){
          if (to_grid[i] >= x){
            target_grid = i;
            break;
          }
        }
        return a[target_grid] * x + b[target_grid]
    }
}


const spot:number = 100;  // 外部から取ってくることを想定
const vol:number = 0.8;  // 外部から取ってくることを想定
const expiry_date = new Date('2020/06/17 12:34:56');
const expiry_date_unix = Math.floor(expiry_date.getTime()/1000);  // 外部から取ってくることを想定
const now = new Date();
const now_unix = Math.floor(now.getTime()/1000);
const expiry:number = (expiry_date_unix - now_unix)/(365*60*60*24);  // 非負制約はあった方が良いかも
const r:number = 0;
// function mapping,とりあえず 0-100まで傾き1でその後フラットになる関数を想定
const func_1_param = ['00000100:00010000', '01009999:00000100'];  
let payoff_func = function_parser_sample(func_1_param)  // 外部から取ってくることを想定



function deriv_pricer(spot: number, vol: number, expiry: number, r:number, payoff_func: (x:number) =>number){
    const mesh:number = 1000;
    const rnd_domain_min:number = -5;
    const rnd_domain_max:number = 5;
    const step_delta:number = (rnd_domain_max - rnd_domain_min)/mesh;

    let runningSum:number = 0;
    for (var i = 0; i < mesh; i++) {
        var x:number = rnd_domain_min + i * step_delta;
        var moved_spot:number = spot*Math.exp(r*expiry-0.5*vol*vol*expiry+vol*Math.sqrt(expiry)*x);
        //var payoff:number = Math.max(0, moved_spot - 50);  // payoff関数がmaxになってるとコールオプション
        var payoff:number = payoff_func(moved_spot)
        runningSum += payoff * pdf(x) * step_delta;
    }
    let ans:number = runningSum * Math.exp(-r*expiry);
    return ans;
}

console.log(deriv_pricer(spot, vol, expiry, r, payoff_func));