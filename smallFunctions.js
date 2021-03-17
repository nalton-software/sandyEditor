const charsToDuplicate = [
  ["{", "}"],
  ["[", "]"],
  ["(", ")"],
  ["'", "'"],
  ['"', '"'],
] // the string start end ones are a bit confusing, had to use single quotes for the double duplicator

const increaseIndentChars = [">", "{"];

const unsavedProjectMessage = "You haven't saved your project. Do you want to save changes? (cancel WILL delete changes)";

var indentAmount = 2;

var projectBeingEdited = "unnamed project";
var projectIsSaved = true;

const inputBox = document.getElementById("inputBox");
const projectNameShower = document.getElementById("projectName");
const autoRunCheckbox = document.getElementById("autoRunCheckbox");

String.prototype.insert = function(index, string) {
  if (index > 0)
  {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }

  return string + this;
};

String.prototype.reverse = function() { // converts to array then reverses then converts back
  var strList = this.split(""); // split into each char
  strList = strList.reverse();
  return strList.join(""); // put nothing between chars
}

function smartLog(data, name) {
  if (typeof name == "string") {
    console.log("<SMARTLOG>" + name + ": " + data + "</SMARTLOG>");
  }
}

function arraysEqual(arr1, arr2) {
  if (JSON.stringify(arr1) == JSON.stringify(arr2)) {
    return true;
  }
  else {
    return false;
  }
}

function arrayInArray(mainArray, subArray) {// this function assumes that both are arrays of arrays
  var contains = false;
  for (var i = 0; i < mainArray.length; i ++) {
    if (arraysEqual(mainArray[i], subArray)) {
      contains = true;
      break;
    }
  }
  return contains;
}

function checkStr(str) { // checks any strings for null or undefined
  if (typeof str == "object") {
    return "undefined";
  }
  else if (str.length < 1) {
    return "null";
  }
  else {
    return "fine";
  }
}

function isAlpha(char) {
  if ((char >= "a" && char <= "z") || 
  (char >= "A" && char <= "Z")) {
    return true;
  }
  else {
    return false;
  }
}

function isNumber(char) {
  if (char >= "0" && char <= "9") {
    return true;
  }
  else {
    return false;
  }
}

function getProjectNames() {
  var projectNameList = [];
  for (var item = 0; item < localStorage.length; item ++) {
    projectName = localStorage.key(item);
    if (projectName.substring(0, 7) == "Project") {
      projectNameList.push(projectName.substring(7));
    }
  }
  return projectNameList;
}

function projectExists(projectName) {
  let project = localStorage.getItem("Project" + projectName);
  return checkStr(project) == "fine";
}

function duplicateChars(event) {
  if (! (event.key == "[" && event.ctrlKey)) { // if decreasing indent, don't duplicate the [
    var inputBoxValue = readInputArea();
    var oldSelectionStart = inputBox.selectionStart;
    var oldSelectionEnd = inputBox.selectionEnd;

    for (var char = 0; char < charsToDuplicate.length; char ++) {
      if (event.key == charsToDuplicate[char][0]) {
        if (! isAlpha(readNextChar()) && ! isNumber(readNextChar())) {
          var charToInsert = charsToDuplicate[char][1];
          inputBoxValue = inputBoxValue.insert(oldSelectionStart, charToInsert);
        }
      }
    }
    inputBox.value = inputBoxValue;
    inputBox.selectionStart = oldSelectionStart;
    inputBox.selectionEnd = oldSelectionEnd;
  }
}

function deleteMatchingChar(event) {
  if (arrayInArray(charsToDuplicate, [readCurrentChar(), readNextChar()] ) ) {
    oldSelectionStart = inputBox.selectionStart;
    oldSelectionEnd = inputBox.selectionEnd;

    event.preventDefault();

    var inputBoxValue = readInputArea();
    var firstHalfOfString = inputBoxValue.slice(0, inputBox.selectionStart - 1);
    var secondHalfOfString = inputBoxValue.slice(inputBox.selectionStart + 1);
    inputBoxValue = firstHalfOfString + secondHalfOfString;

    inputBox.value = inputBoxValue;
    inputBox.selectionStart = oldSelectionStart - 1;
    inputBox.selectionEnd = oldSelectionEnd - 1;
  }
}

function updateIndentation() {
  var selectBox = document.getElementById("indentAmountSelect")
  var selectedOption = selectBox.options[selectBox.selectedIndex].value;
  indentAmount = Number(selectedOption);
}

function autoIndentLine() {
  if (! isFirstLine()) {
    var currentLine = readCurrentLine()[0];
    var currentLineIndent = getLineIndent(currentLine);
    var lastCharOfCurrentLine = currentLine[currentLine.length - 1];
    /*if (increaseIndentChars.includes(lastCharOfCurrentLine)) {
      var amountToIndent = currentLineIndent + indentAmount;
    }
    else {
      var amountToIndent = currentLineIndent;
    }*/
    var amountToIndent = currentLineIndent;
    insertIntoInputBox("\n");
    insertSpacesIntoInputBox(amountToIndent);
  }
}

function isFirstLine() {
  var selectionStart = inputBox.selectionStart;
  var inputBoxValue = readInputArea();
  var valueBeforeThis = inputBoxValue.substring(0, selectionStart);
  if (valueBeforeThis.includes("\n")) {
    return false;
  }
  else {
    return true;
  }
}

function getLineIndent(line) {
  var spaces = 0;
  for (var char = 0; char < line.length; char ++) {
    var currentChar = line[char];
    if (currentChar != " ") {
      spaces = char;
      break;
    }
  }
  if (char == line.length) { // if the line is only spaces
    spaces = line.length;
  }
  return spaces;
}

function readPreviousLine() { // this assumes that the line is not first line
  var inputBoxValue = readInputArea();
  var previousLine = "";

  var selectionStart = inputBox.selectionStart;
  var endOfLastLine = 0;
  for (var char = selectionStart - 1; char > 0; char --) {
    var currentChar = inputBoxValue[char];
    if (currentChar == "\n") {
      endOfLastLine = char - 1;
      break;
    }
  }

  for (var char = endOfLastLine; char > 0; char --) {
    var currentChar = inputBoxValue[char];
    
    if (currentChar != "\n") {
      previousLine += currentChar;
    }
    else {
      break;
    }
  }
  previousLine = previousLine.reverse();
  return previousLine;
}

function readCurrentLine(returnIndex) {
  var inputBoxValue = readInputArea();
  var currentLine = "";

  var selectionStart = inputBox.selectionStart;
  var endOfCurrentLine = 0;

  for (var char = selectionStart; char < inputBoxValue.length; char ++) {
    var currentChar = inputBoxValue[char];
    if (currentChar == "\n") {
      endOfCurrentLine = char - 1;
      break;
    }
  }

  for (var char = endOfCurrentLine; char > 0; char --) {
    var currentChar = inputBoxValue[char];
    
    if (currentChar != "\n") {
      currentLine += currentChar;
    }
    else {
      break;
    }
  }
  if (returnIndex) {
    return [currentLine.reverse(), endOfCurrentLine];
  }
  else {
    return [currentLine.reverse()]; // return as array so it can be indexed from data[0]
  }
}

function decreaseIndent() {
  var inputBoxValue = readInputArea();
  var oldSelectionStart = inputBox.selectionStart;
  var oldSelectionEnd = inputBox.selectionEnd;

  var currentLineData = readCurrentLine(true);
  var currentLine = currentLineData[0];

  var currentLineEndIndex = currentLineData[1];
  var currentLineStartIndex = currentLineEndIndex - currentLine.length;

  var currentIndent = getLineIndent(currentLine);

  if (currentIndent >= indentAmount) {
    var portionToKeep = currentLine.substring(indentAmount, currentLine.length);
  }
  else if (currentIndent > 0) {
    var portionToKeep = currentLine.substring(currentIndent, currentLine.length);
  }
  else {
    portionToKeep = currentLine;
  }

  var inputBoxValueFirstHalf = inputBoxValue.substring(0, currentLineStartIndex + 1);
  var inputBoxValueSecondHalf = inputBoxValue.substring(currentLineEndIndex + 1);
  
  inputBoxValue = inputBoxValueFirstHalf + portionToKeep + inputBoxValueSecondHalf;
  inputBox.value = inputBoxValue;

  if (currentIndent >= indentAmount) {
    inputBox.selectionStart = oldSelectionStart - indentAmount;
    inputBox.selectionEnd = oldSelectionEnd - indentAmount;
  }
  else {
    var amountDecreasedBy = currentIndent;
    inputBox.selectionStart = oldSelectionStart - amountDecreasedBy;
    inputBox.selectionEnd = oldSelectionEnd - amountDecreasedBy;
  }
}

function increaseIndent() {
  var currentLineData = readCurrentLine(true);
  var currentLine = currentLineData[0];

  var currentLineEndIndex = currentLineData[1];
  var currentLineStartIndex = currentLineEndIndex - currentLine.length;

  var currentIndent = getLineIndent(currentLine);

  insertSpacesIntoInputBox(indentAmount, currentLineStartIndex + 1);
}

function convertTab() {
  inputBox.focus(); 
  insertSpacesIntoInputBox(indentAmount);
}

function insertIntoInputBox(str) {
  var inputBoxValue = readInputArea();
  var oldSelectionStart = inputBox.selectionStart;
  var oldSelectionEnd = inputBox.selectionEnd;

  inputBoxValue = inputBoxValue.insert(oldSelectionStart, str);

  inputBox.value = inputBoxValue;
  inputBox.selectionStart = oldSelectionStart + str.length;
  inputBox.selectionEnd = oldSelectionEnd + str.length;
}

function insertSpacesIntoInputBox(amount, index) { // puts them at selectionStart
  var inputBoxValue = readInputArea();
  var oldSelectionStart = inputBox.selectionStart;
  var oldSelectionEnd = inputBox.selectionEnd;

  if (index === undefined) { // pre-ES6
    index = oldSelectionStart
  }

  var stringOfSpaces = "";
  for (var i = 0; i < amount; i ++) {
    stringOfSpaces += " ";
  }
  inputBoxValue = inputBoxValue.insert(index, stringOfSpaces);

  inputBox.value = inputBoxValue;
  inputBox.selectionStart = oldSelectionStart + amount;
  inputBox.selectionEnd = oldSelectionEnd + amount;
}

function readCurrentChar() {
  var currentCharNum = inputBox.selectionStart - 1;
  var currentChar = readInputArea()[currentCharNum];
  return currentChar;
}

function readNextChar() {
  var currentCharNum = inputBox.selectionStart - 1;
  var nextChar = readInputArea()[currentCharNum + 1];
  return nextChar;
}

function scriptInProject() {
  if (readInputArea().includes("<script")) { // missing end of tag due to possible things like defer etc
    return true;
  }
  else {
    return false;
  }
}


function readInputArea() {
  return inputBox.value;
}

function findScript() {
  var startIndex = readInputArea().indexOf("<script>");
  var endIndex = readInputArea().indexOf("</script>");
  console.log(readInputArea().slice(startIndex, endIndex));
  return script;
}