jQuery(function ($) {
    var locationStr = '';//位置情報保存テキスト
    var logFileName = '';
    var loopId = null;
    var isOK = true;
    var isLogging = false;
    var lastTime = 0;
    var watchId = null;

    if (typeof Blob !== 'undefined') {
        // alert('このブラウザに対応しています');
    } else {
        alert('このブラウザには対応していません');
        isOK = false;
        return;
    }

    if (navigator.geolocation) {
        // 現在位置を取得できる場合の処理
        //alert("あなたの端末では、現在位置を取得することができます。");
    }

        // Geolocation APIに対応していない
    else {
        // 現在位置を取得できない場合の処理
        alert("あなたの端末では、現在位置を取得できません。");
        isOK = false;
        return;
    }



    $('#startBtn').click(function () {
        if (!isOK) { return; }
        if (isLogging) { return; }
        isLogging = true;
        $('#status').text('Logging');

        var interval = $('#interval').val();
        logFileName = 'location' + getFormatDate(new Date()) + '.csv';
        getGeolocation(interval);
    });

    $('#stopBtn').click(function () {
        if (!isOK) { return; }
        if (!isLogging) { return; }
        isLogging = false;
        $('#status').text('Stop');

        navigator.geolocation.clearWatch(watchId);
        setBlobUrl('download', locationStr, logFileName);
    });

    $('#exportBtn').click(function () {

    });

    function getGeolocation(interval) {
        // 現在位置を取得する
        watchId = navigator.geolocation.watchPosition(
            function (position) {

                // 取得したデータの整理
                var data = position.coords;

                // データの整理
                var lat = data.latitude;
                var lng = data.longitude;
                var alt = data.altitude;
                var accLatlng = data.accuracy;
                var accAlt = data.altitudeAccuracy;
                var heading = data.heading;			//0=北,90=東,180=南,270=西
                var speed = data.speed;

                var timestamp = new Date();
                console.log(timestamp.getTime());
                if((lastTime + interval*1000) > timestamp.getTime()){
                  console.log(lastTime);
                  console.log(timestamp.getTime());
                  return;
                }
                lastTime = timestamp.getTime();

                $('#date').text(
                  timestamp.getFullYear() + '/'+
                  pad2((timestamp.getMonth()+1))+'/'+
                  pad2(timestamp.getDate())+' '+
                  pad2(timestamp.getHours())+':'+
                  pad2(timestamp.getMinutes())+':'+
                  pad2(timestamp.getSeconds())
                );
                $('#latitude').text(lat);
                $('#longitude').text(lng);

                locationStr += getFormatDate(timestamp) + ',' + lat + ',' + lng + '\n';
            },
            function (error) {
                // エラーコードのメッセージを定義
                var errorMessage = {
                    0: "原因不明のエラーが発生しました…。",
                    1: "位置情報の取得が許可されませんでした…。",
                    2: "電波状況などで位置情報が取得できませんでした…。",
                    3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。",
                };

                // エラーコードに合わせたエラー内容をアラート表示
                console.log(errorMessage[error.code]);
                $('#status').text('Stop');

                navigator.geolocation.clearWatch(watchId);
                setBlobUrl('download', locationStr, logFileName);
            },
            {
                "enableHighAccuracy": true,
                "maximumAge": 0,
            });
    }

});



function setBlobUrl(id, content, fileName) {
    console.log(content);
    console.log(fileName);
    // 指定されたデータを保持するBlobを作成する。
    var blob = new Blob([content], { "type": "application/x-msdownload" });

    // Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
    window.URL = window.URL || window.webkitURL;
    $('#' + id).attr('href', window.URL.createObjectURL(blob));
    $('#' + id).attr('download', fileName);
    $('#' + id).text('ダウンロード（IEでは、右クリック＞対象をファイルに保存）');
}

function pad2(n) {  // always returns a string
    return (n < 10 ? '0' : '') + n;
}

function getFormatDate(date){
    return date.getFullYear() +
        pad2(date.getMonth() + 1) +
        pad2(date.getDate()) +
        pad2(date.getHours()) +
        pad2(date.getMinutes()) +
        pad2(date.getSeconds());
}
