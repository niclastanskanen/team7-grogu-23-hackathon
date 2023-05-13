"use strict";

// this is a a file that deals with drag and drop functions

const draggables = document.getElementsByClassName("dice");
const combatBox = document.getElementsByClassName("combat-box");
const blenderField = document.querySelector("#blender-field");
const diceField = document.querySelector("#dice-field");
const screen = document.querySelector("#game-screen");

// game square coorodinates that are used with drag start
let diceCoordinates = {};

// game board cooridantes used with drag start
let dropBoxesCenters = [];

// dragable element saved
let draggableEL;

function preventOnDragStart(draggables) {
  for (let i = 0; i < draggables.length; i++) {
    draggables[i].ondragstart = function () {
      return false;
    };
  }
}

// add to main loading page
findDropBoxesCenters();
addNewEventListeners("add");

// Requires remove/add/reset action to work. effects draggable squares
function addNewEventListeners(action) {
  const draggables = document.getElementsByClassName(`dice`);
  for (let i = 0; i < draggables.length; i++) {
    if (action === `remove`) {
      draggables[i].removeEventListener("pointerdown", onPointerDown);
      draggables[i].removeEventListener("pointerup", pointerup);
    } else if (action === `add`) {
      draggables[i].addEventListener("pointerdown", onPointerDown);
      draggables[i].addEventListener("pointerup", pointerup);
      preventOnDragStart(draggables);
    } else if (action === `reset`) {
      draggables[i].removeEventListener("pointerdown", onPointerDown);
      draggables[i].removeEventListener("pointerup", pointerup);

      draggables[i].addEventListener("pointerdown", onPointerDown);
      draggables[i].addEventListener("pointerup", pointerup);
      preventOnDragStart(draggables);
    } else {
      throw new Error(`Event listener action was not given`);
    }
  }
}

// reacts when the pointers is pressed on one of the shapes
function onPointerDown(e) {
  console.log(e);
  e.target.setPointerCapture(e.pointerId);
  diceCoordinates = {};

  draggableEL = e.target;
  const rect = draggableEL.getBoundingClientRect();

  draggableEL.style.position = "absolute";
  draggableEL.style.zIndex = 1000;

  // allows pointermove function to set position of shape
  diceCoordinates.draggableOffsetX = e.pageX - rect.left;
  diceCoordinates.draggableOffsetY = e.pageY - rect.top;

  // recording shapeWindow element to use once element is droped otside dropable places
  diceCoordinates.parent = draggableEL.parentElement;

  // recording were pointer was clicked
  diceCoordinates.pointerDownX = e.pageX;
  diceCoordinates.pointerDownY = e.pageY;
  diceCoordinates.element = draggableEL;

  recordDiceCenter(draggableEL);

  document.addEventListener("pointermove", pointerMove);
}

function recordDiceCenter(element) {
  const info = {};
  const rect = element.getBoundingClientRect();

  // calculating half distance to the center
  info.halfX = rect.width / 2;
  info.halfY = rect.height / 2;

  // calculating center cordinates of the square at the time of pointer down
  info.cordinateX = rect.left + info.halfX;
  info.cordinateY = rect.top + info.halfY;

  // calculationg distance from square center to the pointer
  info.distanceX = info.cordinateX - diceCoordinates.pointerDownX;
  info.distanceY = info.cordinateY - diceCoordinates.pointerDownY;

  // taking id for the element
  //   info.id = parseInt(element.classList[1].split("-")[1]);

  // pushing all collected data to an array
  diceCoordinates.elementDimentions = info;
}

// pointerMove purpose is to find the pointer location on the screen
function pointerMove(e) {
  for (let i = 0; i < combatBox.length; i++) {
    combatBox[i].classList.remove(`highlighted-square`);
  }
  blenderField.classList.remove(`highlighted-square`);
  diceField.classList.remove(`highlighted-square`);

  draggableEL.style.left = e.pageX - diceCoordinates.draggableOffsetX + `px`;
  draggableEL.style.top = e.pageY - diceCoordinates.draggableOffsetY + `px`;

  e.preventDefault();

  checkCenterBoxes(e);
}

//Drag end works like onMouseUp and does all events right after.
// used this instead of pointer up because while using draggable property pointer events dont triger.
function pointerup(e) {
  for (let i = 0; i < combatBox.length; i++) {
    combatBox[i].classList.remove(`highlighted-square`);
  }
  blenderField.classList.remove(`highlighted-square`);
  diceField.classList.remove(`highlighted-square`);

  draggableEL.style.removeProperty("position");
  draggableEL.style.removeProperty("zIndex");
  draggableEL.style.removeProperty("left");
  draggableEL.style.removeProperty("top");
  draggableEL = "";

  // getting mosue cordinates during the drop
  const pointerX = e.pageX;
  const pointerY = e.pageY;

  addNewEventListeners(`reset`);

  // drops dice inside new element

  const matchedActiveSquares = findingMacthingSquares(pointerX, pointerY);
  if (matchedActiveSquares[1]) matchedActiveSquares[0].appendChild(e.target);
  // cleaning up data after drag ended
  diceCoordinates = {};
  document.removeEventListener("pointermove", pointerMove);

  // cleaning up data after drag ended
  diceCoordinates = {};
}

/**
 * Records all drop boxes outer edges in to "dropBoxesCenters" array for later use to match with dragable boxes
 * should be only use at the begining of the game and when the screen is being resized
 */
function findDropBoxesCenters() {
  // clears old information
  dropBoxesCenters = [];

  // loops though all boxes to return information
  for (let i = 0; i < combatBox.length; i++) {
    const info = recodDropDimentions(combatBox[i]);

    dropBoxesCenters.push(info);
  }
  dropBoxesCenters.push(recodDropDimentions(blenderField));
  dropBoxesCenters.push(recodDropDimentions(diceField));
}

function recodDropDimentions(e) {
  // creating object for each of the the elements

  const info = {};

  // check later after merge --------------------------------------------------------------------------------------
  // info.color = combatBox[i].classList[1].split("-")[0];

  const rect = e.getBoundingClientRect();

  // recording square dimention coordinates
  info.left = rect.left;
  info.right = rect.right;
  info.top = rect.top;
  info.bottom = rect.bottom;

  info.element = e;
  return info;
}

function checkCenterBoxes(e) {
  // The fallowing code determines if center of dragable boxes are within dropboxes.
  // getting pointer cordinates during drag
  const pointerX = e.pageX;
  const pointerY = e.pageY;

  const matchedActiveSquares = findingMacthingSquares(pointerX, pointerY);
  if (matchedActiveSquares[1]) {
    matchedActiveSquares[0].classList.add(`highlighted-square`);
  }
}

/**
 * Test dragable squares center location against dropboxes area to see which ones are maching
 * @param {number} mouseX Mouse X coordinates
 * @param {number} mouseY Mouse Y coordinates
 * @returns array of elements matched, and true or false if all elements maches and the shape can be placed.
 */
function findingMacthingSquares(mouseX, mouseY) {
  let matchedActiveSquares = "";
  // looping thought dragable boxes
  const eDim = diceCoordinates.elementDimentions;

  const boxCenterX = mouseX + eDim.distanceX;
  const boxCenterY = mouseY + eDim.distanceY;

  dropBoxesCenters.forEach((e) => {
    // checkign if the dragable box center coordinates are within a dropbox square
    // added 1% reduction in avialable size due to shapes catching squares they should not
    const condition1 = boxCenterX > e.left * 1.01;
    const condition2 = boxCenterX < e.right / 1.01;
    const condition3 = boxCenterY > e.top * 1.01;
    const condition4 = boxCenterY < e.bottom / 1.01;

    if (condition1 && condition2 && condition3 && condition4) {
      matchedActiveSquares = e.element;
    }
  });
  const dropableOrNot = !(matchedActiveSquares === "");
  return [matchedActiveSquares, dropableOrNot];
}