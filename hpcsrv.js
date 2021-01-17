'use strict';  // 厳格モード

const express = require('express');  // Express
const bodyParser = require('body-parser');  // body-parser
const Obniz = require('obniz');  // obniz
const e = require('express');

// ローカルでサーバーを公開するときのポート番号
const PORT = process.env.PORT || 3000;
// expressを初期化
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Obnizへ接続して電源ONする処理
async function obnizconect(obnizid) {
    const obniz = new Obniz(obnizid);  // Obniz ID
    obniz.onconnect = async function () {
        // Obnizに接続OK
        console.log(obniz.connectionState);
        const led = obniz.wired('LED', { anode: 0, cathode: 1 });  // LEDを利用
        obniz.display.clear();  // ディスプレイ表示初期化
        obniz.display.print('ON');
        led.on(); await obniz.wait(1000); led.off();  // 1秒LED点灯
        obniz.close();  // Obnizの切断
    }
}

// ****** Express サーバ部 ******

// HTTP GETによって '/' のパスにアクセスがあったとき
app.get('/', (req, res) => res.send('Hello Obniz! (HTTP GET)'));

// HTTP POSTによって '/webhook' のパスにアクセスがあったら、POSTされた内容に応じて様々な処理
app.post('/webhook', (req, res) => {
    // 実行日時を取得
    let date = new Date () ;
    let ymd = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    let hm = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    let WeekStr = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ][date.getDay()];
    console.log(`Run:${ymd}(${WeekStr}) ${hm}`);

    // Webhookに渡されたパラメータを確認用にターミナルに表示
    console.log(req.body.obnizid);

    // ObnizIDをクエリパラメータで受け取り、Obniz接続処理を実行
    obnizconect(req.body.obnizid).then(() => {
        // 成功
        console.log(`ConnectionOK`);
        res.send(`${ymd}(${WeekStr}) ${hm}:${req.body.obnizid}:ConnectionOK`);
    /*
    }).catch((result) => {
        // 失敗
        console.log(`${result}`);
        res.send(`${ymd}(${WeekStr}) ${hm}:${req.body.obnizid}:${result}`);
    */
    });
});

// 最初に決めたポート番号でサーバーをPC内だけに公開
app.listen(PORT);
console.log(`ポート${PORT}番でExpressサーバーを実行中です…`);
