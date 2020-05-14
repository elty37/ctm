/**
 * ビルド後スクリプト
 * webpack実行後に実施する処理を記載する。
 * デフォルトではトランスパイル後のjsファイルを
 * 指定したアクション名で一つのメソッドとして纏める.(この処理をいじるとgasが実行できなくなるので注意.)
 *
 * @author elty
 */

 const fs = require('fs');
 const path = require('path');

/**
 * 指定したアクション名で一つのメソッドとして纏める.
 * (この処理をいじるとgasが実行できなくなるので注意.)
 * WARNING: ここの処理を変えるとgasが動かなくなるので注意
 * HACK: しかし関数名でサンドイッチするというのはなぁ...
 *
 * @return {void} 返り値なし
 */
function convertScriptToGasExecutableFormat() {

  // メニュー用JSONを取り込む
  let appList = JSON.parse(fs.readFileSync("./ctm/resources/build.json", 'utf8'));
  let buildActionList = JSON.parse(fs.readFileSync("./ctm/resources/buildAction.json", 'utf8'));
  let script = "";

  const menuList = Object.keys(appList);
  for (let i = 0; i< menuList.length; i++) {
    script = fs.readFileSync("./build/" + menuList[i] + ".bundle.js", 'utf8');
    if (typeof buildActionList[menuList[i]] !== "string" || buildActionList[menuList[i]].length < 1) {
      throw new Error("buildAction.jsonが不正です。");
    }
    script = "function " + buildActionList[menuList[i]] + "() { \n" + script + "\n}";
    // ファイルに出力
    fs.writeFileSync(
        "./build/" + menuList[i] + ".bundle.js",
        script,
        (err) => {
          // 書き出しに失敗した場合
          if(err){
            console.error("エラーが発生しました。" + err)
            throw err
          }
        }
    );
  }
}

function copyResourceFiles() {
  let list = JSON.parse(fs.readFileSync("./ctm/resources/build.json", "utf8"));
  let currentKey = [];
  const dist = "./build";
  let src = "";
  let fileList = [];
  let toolNameList = Object.keys(list);

  for (let i = 0; i < toolNameList.length; i++) {
    currentKey = toolNameList[i];
    src = "./src/" + currentKey + "/resources/";
    fileList = fs.readdirSync(src);
    for (let j = 0; j < fileList.length; j++) {
      fs.copyFileSync(src + fileList[j], dest + currentKey + "_" + fileList[j]);
    }
  }
}


/**
 * resetBuildJson - build.jsonを初期化します
 *
 * @return {void}  返り値なし
 */
function resetBuildJson() {
  // ファイルに出力
  fs.writeFileSync(
      path.resolve(__dirname, 'resources', 'build.json'),
      JSON.stringify({}),
      (err) => {
        // 書き出しに失敗した場合
        if(err){
          console.error("エラーが発生しました。" + err)
          throw err
        }
      }
  );
}

/**
 * main - メイン処理
 *
 * @return {int}  0:正常終了,1:異常終了
 */
(async function main() {
  console.log("ビルド後スクリプト実行開始...");
  convertScriptToGasExecutableFormat();
  copyResourceFiles();
  resetBuildJson();
  console.log("ビルド後スクリプト実行完了!");
  return 0;
})();
