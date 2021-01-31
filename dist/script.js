// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "hpc00-00000.firebaseapp.com",
  projectId: "hpc00-00000",
  storageBucket: "hpc00-00000.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore().collection('hpcaccede');

const app = new Vue({
  el: '#app', // Vueが管理する一番外側のDOM要素
  obniz: null,    // Obniz関数

  data: {
    // Vue内部で利用する変数定義
    ObnizID: ['0000','0000'],
    WeekTime: [{'Sun':''}, {'Mon':''}, {'Tue':''}, {'Wed':''}, {'Thu':''}, {'Fri':''}, {'Sat':''},],
  },

  created: async function (){
    // Firebaseから初期値を読み込み
    await this.FirebaseSet();
    console.log(`${this.ObnizID[0]}-${this.ObnizID[1]}`);
  },

  methods: {
    // 関数はココに記述

    ObnizConect: function(func){
      // Obnizへの接続を確認してfuncに渡した関数を実行するコールバック
      console.log(this.obniz.connectionState);
      if (this.obniz.connectionState === 'connected') {
        func();
      } else {
        this.obniz.on('connect', () => {
          this.ObnizConect(func);
        })
      }
    },

    FirebaseSet: async function() {
      // CloudFirestoreからデータ取得
      let docRef = db.doc('User01');
      let me = this;  // thisを関数内で使えないので変数に代入
      
      await docRef.get().then(function(doc) {
        if (doc.exists) {
          // ObnizIDをCloudFirestoreから読み込み
          me.ObnizID.splice(0, 1, doc.data().ObnizID1);
          me.ObnizID.splice(1, 1, doc.data().ObnizID2);
          // 曜日別起動時間をCloudFirestoreから読み込み
          me.WeekTime['Sun'] = doc.data().SunTime;
          me.WeekTime['Mon'] = doc.data().MonTime;
          me.WeekTime['Tue'] = doc.data().TueTime;
          me.WeekTime['Wed'] = doc.data().WedTime;
          me.WeekTime['Thu'] = doc.data().ThuTime;
          me.WeekTime['Fri'] = doc.data().FriTime;
          me.WeekTime['Sat'] = doc.data().SatTime;
        } else {
          console.log('No such Cloud Firestore document!');
        }
      });
    },

    PowerON: function() {
      // LED ON
      // Obniz ID 指定
      let obnizid = `${this.ObnizID[0]}-${this.ObnizID[1]}`;
      console.log(obnizid);
      if (this.obniz == null) {
        this.obniz = new Obniz(obnizid);
      } else if (this.obniz.connectionState === 'closed') {
        this.obniz = new Obniz(obnizid);
      }
      
      let me = this;  // thisを関数内で使えないので変数に代入
      // connect関数を呼んで、connect関数内で以下のFunctionを実行
      this.ObnizConect(async function() {
        const led = me.obniz.wired('LED', { anode: 0, cathode: 1 });
        me.obniz.display.print('ON');
        led.on(); await me.obniz.wait(1000); led.off(); // 1秒LED点灯
        // led.on(); await sleep(1000); led.off();   // 1秒LED点灯
        
        me.obniz.close();  // Obniz切断
        console.log(me.obniz.connectionState);
      });
    },

    ApplySettings: function() {
      // CloudFirestoreのデータを更新する
      let docRef = db.doc('User01');
      docRef.update({
        // ObnizIDをCloudFirestoreへ更新
        ObnizID1: this.ObnizID[0],
        ObnizID2: this.ObnizID[1],
        // 曜日別起動時間をCloudFirestoreへ更新
        SunTime: this.WeekTime['Sun'],
        MonTime: this.WeekTime['Mon'],
        TueTime: this.WeekTime['Tue'],
        WedTime: this.WeekTime['Wed'],
        ThuTime: this.WeekTime['Thu'],
        FriTime: this.WeekTime['Fri'],
        SatTime: this.WeekTime['Sat']
      }).then(() => {
          console.log(`ドキュメントID "${docRef.id}" を更新`);
      }).catch(function(error) {
          console.error('ドキュメント更新失敗:', error);
      });
    },
  },

});
