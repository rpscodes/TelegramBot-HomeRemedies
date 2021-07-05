var token = "Add Your API Token Here"; 
var telegramUrl = "https://api.telegram.org/bot" + token; 
var webAppUrl = "Your google scripts web url"; 



//Setting the webhook connection to Telegram
function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
}

//Sending Messages to Telegram
function sendMessage(id, text, keyBoard) {
  var data  = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(id),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  };
 UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data); 
}

//Flattening of Arrays
function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

//Getting the messages from telegram and processing them
function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  

  var knowledgeMaster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Knowledge Base")
  var questions = flatten(knowledgeMaster.getRange("Knowledge Base!A1:A99").getValues());
  var o1 = flatten(knowledgeMaster.getRange("Knowledge Base!B1:B99").getValues());
  var o2 = flatten(knowledgeMaster.getRange("Knowledge Base!C1:C99").getValues());
  var o3 = flatten(knowledgeMaster.getRange("Knowledge Base!D1:D99").getValues());
  var unanswered = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UnAnswered");


  //var x = answered.getLastRow()

  if (contents.message) {
    var id = contents.message.from.id
    var text = contents.message.text
    text = text.toLowerCase()
    //var es = "a"+"       "+"or"+"       ";
    var MatchedValues = tryfilter(text);
    
    
    

    
    if (MatchedValues.length > 0) {
      sendMessage(id,"Did you mean?:- Choose the closest option",KeyBoardBuilder(MatchedValues));
    }
    else {
      sendMessage(id,"No answers available")
      unanswered.appendRow([text]);
    }
    
  }

     else if (contents.callback_query) {
       var id = contents.callback_query.from.id
       var text = contents.callback_query.data
       var j = questions.indexOf(text);
       var result = o1[j]+ "\n" + "\n" + o2[j] + "\n" + "\n" + o3[j]
      sendMessage(id,result);
    }

    else {
      sendMessage(chat_id,
        "No answers available")
      unanswered.appendRow([text]);
    }
  }


//Filtering the questions into an array based on matching substrings to the text submitted by user
function tryfilter(txt) {
  var triviaMaster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Knowledge Base")
  var questions = flatten(triviaMaster.getRange("Knowledge Base!A1:A99").getValues());
  //var filteredValues = questions.filter(isSubstring);
  var filteredValues = questions.filter(function (qstring) {
    return qstring.toLowerCase().includes(txt);
  });
  Logger.log(filteredValues);
  return filteredValues;
}

//Building the keyboard input
function KeyBoardBuilder(MatchValues) {
  var keyBoard = {
      "inline_keyboard": [
        
        ]
    }
//var lab = ["a","b","c","d"]

for(var k=0; k<MatchValues.length; k++)  {
    keyBoard.inline_keyboard.push([{text: MatchValues[k], callback_data: MatchValues[k]}]);
} 
  return keyBoard;
}


