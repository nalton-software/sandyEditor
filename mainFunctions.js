var indentAmount = 2;

var projectBeingEdited = "unnamed project";
var projectIsSaved = true;

function setUpInputBox() {
  var startingText = '<html>\n  <body>\n    <h1>Sandy Editor</h1>\n    <p>Simple yet complex - The editor of the future</p>\n  </body>\n</html>';
  inputBox.value = startingText;
}

function setUpForStart() {
  runProject();
  makeLoadMenu();

  let projectNames = getProjectNames();
  projectBeingEdited = projectNames.length > 0 ? projectNames[0] : "unnamed project";
}



function runProject() { // not final
  const iframe = document.getElementById("resultBox").srcdoc = readInputArea();
  updateName();
}

function doInsanity() {
  const iframe = document.getElementById("resultBox");
  iframe.removeAttribute("srcdoc");
  iframe.src = "https://editor.p5js.org/undefined/embed/OZ8GeTqvI";
  autoRunCheckbox.checked = false;
}

function autoRun() {
  if (autoRunCheckbox.checked) {
    if (!scriptInProject()) {
      runProject();
    }
    else {
      alert("Cannot Auto Run with script in project!");
      autoRunCheckbox.checked = false;
    }
  }
}

function updateName() {
  projectNameShower.title = projectIsSaved ? "" : "Unsaved Work";
  projectNameShower.innerHTML = "Editing: " + (projectIsSaved ? "" : "*") + projectBeingEdited;
}

function makeLoadMenu() {
  var loadSelect = document.getElementById("loadSelect");
  loadSelect.innerHTML = "";
  var projectNames = getProjectNames();
  var indexOfProjectBeingEdited = null;

  for (var project = 0; project < projectNames.length; project++) {
    var option = document.createElement("option");
    option.innerHTML = projectNames[project];
    loadSelect.appendChild(option);
    if (projectNames[project] == projectBeingEdited) {
      indexOfProjectBeingEdited = project;
    }
  }
  if (indexOfProjectBeingEdited != null) {
    loadSelect.selectedIndex = indexOfProjectBeingEdited;
  }
}

function saveProject() {
  if (projectBeingEdited != null) {
    localStorage.setItem("Project" + projectBeingEdited, readInputArea());
  }
  else {
    var projectName = prompt("Enter a name for your project:")
    if (checkStr(projectName) == "null") {
      alert("You didn't enter a name!");
    }
    else if (checkStr(projectName) == "fine") {
      localStorage.setItem("Project" + projectName, readInputArea());
      localStorage.setItem("LastLoadedProject", projectName);
      projectBeingEdited = projectName;
    }
  }
  makeLoadMenu();
  projectIsSaved = true;
  updateName();
}

function saveProjectAs() {
  var projectName = prompt("Enter a name for your project:");
  if (checkStr(projectName) == "null") {
    alert("You didn't enter a name!");
  }
  else if (checkStr(projectName) == "fine") {
    localStorage.setItem("Project" + projectName, readInputArea());
    localStorage.setItem("LastLoadedProject", projectName);
    projectBeingEdited = projectName;
  }
  makeLoadMenu();
  projectIsSaved = true;
  updateName();
}

function loadProjectStart() {
  projectBeingEdited = localStorage.getItem("LastLoadedProject");
  projectIsSaved = true;
  let value = localStorage.getItem("Project" + projectBeingEdited);
  inputBox.value = value;
}

function loadProjectComputer(projectName) {
  var value = localStorage.getItem("Project" + projectName);
  localStorage.setItem("LastLoadedProject", projectName);
  inputBox.value = value;
  projectBeingEdited = projectName;
  updateName();
}

function loadProjectUser() {
  var projectSelects = document.getElementById("loadSelect");
  var projectToLoad = projectSelects.value;
  if (projectIsSaved) {
    loadProjectComputer(projectToLoad);
  }
  else {
    var canSaveChanges = confirm(unsavedProjectMessage);
    if (canSaveChanges) {
      saveProject();
      loadProjectComputer(projectToLoad);
    }
    else {
      loadProjectComputer(projectToLoad);
    }
  }
}

function makeNewProject() {
  let name = prompt("Name of new project: ");
  if (checkStr(name) == "fine" && !projectExists(name)) { // user had input something
    localStorage.setItem("LastLoadedProject", name);
    projectBeingEdited = name;
    setUpInputBox(); // clear the screen
    saveProject();
    updateName();
  } else if (checkStr(name) == "null") {
    alert("You didn't enter a name!");
  } else if (projectExists(name)) {
    alert("Project already exists!");
  }
}

function prepareForNewProject() {
  if (projectIsSaved) {
    makeNewProject();
  }
  else {
    var canSaveChanges = confirm(unsavedProjectMessage);
    if (canSaveChanges) {
      makeNewProject();
    }
    else {
      saveProject();
      makeNewProject();
    }
  }
}

function deleteProject() {
  if (getProjectNames().length > 0) {
    var canDelete = confirm("Are you sure that you want to delete " + projectBeingEdited + "?");
    if (canDelete) {
      localStorage.removeItem("Project" + projectBeingEdited);
      setUpForStart();
      setUpInputBox();
      updateName();
      localStorage.removeItem("LastLoadedProject");
    }
  } else {
    alert("There are no projects to delete.");
  }
}

window.addEventListener("beforeunload", event => { // work in progress
  if (!projectIsSaved) {
    (event || window.event).returnValue = unsavedProjectMessage;
    return unsavedProjectMessage;
  }
});

window.addEventListener("keydown", event => {
  if (event.ctrlKey && event.key == "s") { // ctrl + s
    event.preventDefault();
    saveProject();
  }
  else if (event.ctrlKey && event.shiftKey && event.key == "S") { // ctrl + shift + s
    event.preventDefault();
    saveProjectAs();
  }
  else if (event.ctrlKey && event.key == "e") { // ctrl + e 
    event.preventDefault();
    prepareForNewProject();
  }
  else if (event.ctrlKey && event.key == "Backspace") {
    deleteProject();
  }
  else if (event.ctrlKey && event.key == "[") {
    event.preventDefault();
    decreaseIndent();
  }
  else if (event.ctrlKey && event.key == "]") {
    increaseIndent();
  }
  else if (event.ctrlKey && event.key == "i") {
    doInsanity();
  }
});

inputBox.addEventListener("keydown", function (event) {
  duplicateChars(event);
  if (event.key == "Tab") {
    event.preventDefault(); // holds place for convertTab()
  }

  if (event.key == "Backspace") {
    deleteMatchingChar(event);
  }

  if (event.key == "Enter") {
    event.preventDefault();
    autoIndentLine();
  }

  if (! (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
    projectIsSaved = false;
  }
  updateIndentation();
});

inputBox.addEventListener("keyup", function (event) {
  updateName();

  if (event.key == "Tab") {
    convertTab();
  }

  autoRun();
});

if (localStorage.getItem("LastLoadedProject") != null) { // if has saved something
  loadProjectStart();
  makeLoadMenu();
}
else {
  setUpForStart();
  setUpInputBox();
}
if (!scriptInProject()) {
  runProject();
}
else {
  autoRunCheckbox.checked = false;
}
updateName();

localStorage.setItem("secret", "verysecrethahahahaha");