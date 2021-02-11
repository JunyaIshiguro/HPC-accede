// POSTリクエスト処理部
function sendHttpPost(obnizid){
  var payload =
  {
    "obnizid" : obnizid
  };
  
  var options =
  {
    "method" : "post",
    "payload" : payload
  };
  
  // POSTリクエスト
  var response = UrlFetchApp.fetch("https://xxxxxxxxxxxxxxxxx.herokuapp.com/webhook", options);
  var content = response.getContentText("UTF-8");
  console.log(content);
}

// CloudFirestoreで認証する為のJSON情報を指定
function firestoreDate() {
  var dateArray = {
    'email': 'xxxxxxxxxxx@xxxxxxxxxxx.iam.gserviceaccount.com',
    'key': '-----BEGIN PRIVATE KEY-----\xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n-----END PRIVATE KEY-----\n',
    'projectId': 'xxxxxxxxxx'
  }
  return dateArray;
}

// 実行時間判定の処理部
function executionTimeJudg(date, doc){
  
  // 時間を整形
  var ymd = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  var hm = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  var WeekStr = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ][date.getDay()];
  console.log(`${ymd}(${WeekStr}) ${hm}`);
  
  // CloudFirestoreの曜日起動時間を取得
  var ontime = "";
  switch (WeekStr){
    case 'Sun':
      ontime = doc.obj.SunTime;
      break;
    case 'Mon':
      ontime = doc.obj.MonTime;
      break;
    case 'Tue':
      ontime = doc.obj.TueTime;
      break;
    case 'Wed':
      ontime = doc.obj.WedTime;
      break;
    case 'Thu':
      ontime = doc.obj.ThuTime;
      break;
    case 'Fri':
      ontime = doc.obj.FriTime;
      break;
    case 'Sat':
      ontime = doc.obj.SatTime;
      break;
  }
  
  // CloudFirestoreに保存された起動時間と比較
  if (hm == ontime) {
    return 1;
  } else {
    return 0;
  }
  
}

// メイン処理部
// CloudFirestoreを読み込んで実行時間を判定しPOST送信
function myFunction(){
  
  // 現在の時間を取得
  var date = new Date () ;
  
  // CloudFirestoreの認証
  var dateArray = firestoreDate();
  var firestore = FirestoreApp.getFirestore(dateArray.email, dateArray.key, dateArray.projectId);
  
  // CloudFirestoreからデータを読み込む
  const doc = firestore.getDocument("hpcaccede/User01");
  
  // 実行時間判定処理
  if (executionTimeJudg(date, doc)) {
    // ObnizIDを取得
    var obnizid = `${doc.obj.ObnizID1}-${doc.obj.ObnizID2}`;
    console.log(obnizid);
    // POSTリクエスト
    sendHttpPost(obnizid);
  }
  
}
