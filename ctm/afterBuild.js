/**
 * ビルド後スクリプト
 * webpack実行後に実施する処理を記載する。
 * デフォルトではトランスパイル後のjsファイルを
 * 指定したアクション名で一つのメソッドとして纏める.(この処理をいじるとgasが実行できなくなるので注意.)
 *
 * @author elty
 */

const fs = require('fs');

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
  let menuList = JSON.parse(fs.readFileSync("./ctm/resources/menu.json", 'utf8'));

  if (menuList.length < 1) {
    throw new Error("[System Error] メニューファイルが異常です。");
  }

  let script = "";

  for (let i = 0; i < menuList.length; i++) {
    if (typeof menuList[i].functionName.length === "undefined" || menuList[i].functionName.length < 1) {
      throw new Error("[System Error] メニューファイルのアクション名が未定義です。");
    }

    script = fs.readFileSync("./build/" + menuList[i].functionName + ".bundle.js", 'utf8');
    script = "function " + menuList[i].functionName + "() { \n" + script + "\n}";

    // ファイルに出力
    fs.writeFileSync(
        "./build/" + menuList[i].functionName + ".bundle.js",
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


/**
 * main - メイン処理
 *
 * @return {int}  0:正常終了,1:異常終了
 */
(async function main() {
  console.log("ビルド後スクリプト実行開始...");
  convertScriptToGasExecutableFormat();
  console.log("ビルド後スクリプト実行完了!");
  return 0;
})();
