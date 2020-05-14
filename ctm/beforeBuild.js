/**
 * ビルド前スクリプト
 * webpac実行前に実施する処理を記載する。
 * @author elty
 */

 const fs = require('fs');
 const path = require('path');

 /**
  * readUserInput - ユーザからのキーボード入力を取得する Promise を生成する
  *
  * @param  {string} question 入力時にコマンドラインに表示する文言
  * @return {string}          入力した文字列
  */
 function readUserInput(question) {
   const readline = require('readline').createInterface({
     input: process.stdin,
     output: process.stdout
   });

   return new Promise((resolve, reject) => {
     readline.question(question, (answer) => {
       resolve(answer);
       readline.close();
     });
   });
 }

/**
 * getBuildApp - 入力されたツール名に基づき、ビルド用objectをapp.jsonから取得
 *
 * @param  {string} toolName ツール名
 * @return {object|bool}  入力されたツールに対応するobject(ヒットしない場合はfalse)
 */
 function getBuildApp(toolName) {
   const toolList = JSON.parse(fs.readFileSync("./ctm/resources/app.json", 'utf8'));
   const toolNameList = Object.keys(toolList);

   for (let i = 0; i < toolNameList.length; i++) {
     if (toolName === toolNameList[i]) {
       return {[toolName]: toolList[toolName]};
     }
   }
   console.log("ツール名が存在しません。");
   return false;
 }



/**
 * main - メイン処理
 *
 * @return {int}  0:正常終了,1:異常終了
 */
(async function main() {
  console.log("ビルド前スクリプト実行開始...");
  let toolName = "";
  let toolObj = false;
  while (toolObj === false) {
    toolName = await readUserInput("ビルドするツール名を入力してください。");
    toolObj = getBuildApp(toolName);
  }
  console.log(toolObj);
  // ファイルに出力
  fs.writeFileSync(
      path.resolve(__dirname, 'resources', 'build.json'),
      JSON.stringify(toolObj),
      (err) => {
        // 書き出しに失敗した場合
        if(err){
          console.error("エラーが発生しました。" + err)
          throw err
        }
      }
  );
  console.log("ビルド前スクリプト実行完了!");
  return 0;
})();
