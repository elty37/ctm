function onOpen(){

    SpreadsheetApp
        .getActiveSpreadsheet()
        .addMenu(
            "開発",
            JSON.parse('[]')); //メニューを追加

}