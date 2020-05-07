/**
 * ツール削除用バッチ
 * webpack用jsonからは削除し、
 * 実ソース自体はarchiveフォルダに圧縮して移動する。
 * @author elty
 */

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

/**
 * deleteMenu - メニューから削除
 * @param functionName アクション名(ツール名と同じ)
 * @return void 返り値なし
 */
function deleteMenu(functionName) {

  //入力チェック

  if (typeof functionName !== "string" || functionName.length < 1) {
    //不正な関数名(数時スタートとか)はどうせ検索しても引っかからないので文字長だけチェック
    throw new Error("ツール名は１文字以上を指定してください。");
  }

  // メニュー用JSONを取り込む
  let myMenuTemplate = fs.readFileSync(
      path.resolve(
          __dirname,
          "resources",
          "FrontController.js.template"
      ),
      'utf8'
  );

  // メニュー用JSONを取り込む
  let myMenu = JSON.parse(
      fs.readFileSync(
          path.resolve(
              __dirname,
              "resources",
              "menu.json"
          ),
          'utf8')
  );

  for (let i = 0; i < myMenu.length; i++) {
    if (myMenu[i]["functionName"] === functionName) {
      myMenu.splice(i, 1);
    }
  }

  // ファイルに出力
  fs.writeFileSync(
      path.resolve(__dirname, '../build', 'FrontController.js'),
      myMenuTemplate.replace("@menuJsonString", JSON.stringify(myMenu)),
      (err) => {
        // 書き出しに失敗した場合
        if(err){
          console.error("エラーが発生しました。" + err)
          throw err
        }
      }
  );

  // menu.jsonも更新
  fs.writeFileSync(
      path.resolve(__dirname, 'resources', 'menu.json'),
      JSON.stringify(myMenu),
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
 * zipAndDeleteFiles - ツール圧縮＆削除処理
 *
 * @param  {string} fileName 圧縮するフォルダ名
 * @return {boolean}         成功したらtrue,失敗したらfalse
 */
function zipAndDeleteFiles(fileName) {
  try {
    // 出力先のzipファイル名
    var zip_file_name = path.resolve(__dirname, "../archive", fileName + ".zip");
    // ストリームを生成して、archiverと紐付ける
    var archive = archiver.create('zip', {});
    var output = fs.createWriteStream(zip_file_name);
    archive.pipe(output);

    // 圧縮対象のファイル及びフォルダ
    archive.glob(path.resolve(__dirname, '../src/', fileName) + "/*");
    archive.glob(path.resolve(__dirname, '../build/', fileName) + ".bundle.js");

    // zip圧縮実行
    archive.finalize();
    output.on("close", function () {
        var archive_size = archive.pointer();
        deleteFiles(fileName);
    });
    return true;
  } catch(e) {
    console.error("圧縮に失敗しました。");
    return false;
  }
}

/**
 * printErrorMessages - エラー出力
 *
 * @param  {string[]} errorMessages エラー出力内容
 * @return {void}               返り値なし
 */
function printErrorMessages(errorMessages) {
  if (errorMessages.length > 0) {
    for (let i = 0; i < errorMessages.length; i++) {
      console.error(errorMessages[i]);
    }
  }
}

/**
 * getAppList - 登録しているアプリ一覧を取得する.
 *
 * @return {object}  アプリ一覧(key: アプリ名, value: エントリーポイント)
 */
function getAppList() {
  const filePathStr = path.resolve(__dirname, 'resources', 'app.json');
  try {
    const toolList = JSON.parse(
      fs.readFileSync(
        filePathStr,
        'utf8'
      )
    );
    return toolList;
  } catch(e) {
    throw new Error(
      "ツール一覧の取得に失敗しました。ファイルパス：" +
      filePathStr
    );
  }
}

/**
 * deleteFiles - ファイル削除
 *
 * @param  {string} fileName ツール名
 * @return {void}         返り値なし
 */
function deleteFiles(toolName) {
  var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
  };
  deleteFolderRecursive(path.resolve(__dirname, '../src/', toolName));
  const bundleFilePath = path.resolve(__dirname, '../build/', toolName + ".bundle.js");
  if (fs.existsSync(bundleFilePath)) {
    fs.unlinkSync(bundleFilePath);
  }
}

/**
 * setNewApp - ツール登録処理&エントリポイント作成
 *
 * @param  {object} list 全ツール情報
 * @param  {string} toolName 新ツール名
 * @param  {string} toolEntryPointFileName 新ツールのエントリポイントのファイル名
 * @return {void}      返り値なし。
 */
function deleteApp(list, toolName) {
  let deletedList = {};
  // 削除処理
  for (toolNameInList in list) {
    if (toolNameInList === toolName) {
      continue;
    }
    deletedList[toolNameInList] = list[toolNameInList];
  }
  console.log(deletedList);
  // app.json再生成
  fs.writeFileSync(
    path.resolve(__dirname, 'resources', 'app.json'),
    JSON.stringify(deletedList),
    (err) => {
      // 書き出しに失敗した場合
      if(err){
        console.error("エラーが発生しました。" + err)
        throw err
      }
    }
  );

  //圧縮し、削除する。
  zipAndDeleteFiles(toolName);
}

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
 * validateToolName - ツール名入力値チェック
 *
 * @param  {object} list ツール一覧
 * @param  {string} name 入力されたツール名
 * @return {string[]}    エラー文言
 */
function validateToolName(list, name) {
  const res = [];
  if (list.length < 1) {
    res.push("ツールが登録されていません。");
  }
  if (name.length < 1) {
    res.push("ツール名は必ず入力してください.");
  }
  for (tool in list) {
    if (tool === name) {
      return res;
    }
  }
  res.push("該当するツール名が存在しません。");
  return res;
}

/**
 * main - メイン処理
 *
 * @return {int}  0:正常終了,1:異常終了
 */
(async function main() {
  const list = getAppList();
  const name = await readUserInput(
    '削除するツール名を入力してください.(半角英数字.数字開始は不可) \n' +
    ':'
  );
  let errorMessages = validateToolName(list, name);
  if (errorMessages.length > 0) {
    printErrorMessages(errorMessages);
    return -1;
  }

  let confirm = await readUserInput(
    'ツール名: ' + name + "\n" +
    '以上でよろしいですか？[Nなら終了] \n' +
    ':'
  );
  if (confirm === "N") {
    console.log("終了します。");
    return 0;
  }

  deleteApp(list, name);
  deleteMenu(name);
  console.log("削除が完了しました。\n 実ソースは圧縮され、archiveフォルダに移動されました。");

  return 0;
})();
