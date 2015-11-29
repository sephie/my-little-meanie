/*
-modularize this
-modularize simpleHeat.js
-...
 */

var logSpace = document.querySelector('.log-space');
var coolButton = document.querySelector('.cool-button');
var postButton = document.querySelector('.post-button');
var deleteButton = document.querySelector('.delete-button');

var heatCanvas = document.querySelector('#canvas');

coolButton.addEventListener('click', doSomethingCool);
postButton.addEventListener('click', doPost);
deleteButton.addEventListener('click', doDelete);

function doSomethingCool() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('GET', '/cool');
  oReq.send();
}

function doPost() {
  var oReq = new XMLHttpRequest();
  var thing = {};
  thing.key = 'mahKey';
  thing.value = 'mahValue';

  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('POST', '/things');
  oReq.setRequestHeader('Content-Type', 'application/json');
  oReq.send(JSON.stringify(thing));
}

function doDelete() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('DELETE', '/things');
  oReq.send();
}

function resultToScreenHandler() {
  console.log('handler: ', this);
  logSpace.innerHTML += this.responseText + '<br>';
}


window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

heatCanvas.width= screen.width;
heatCanvas.height= screen.height;
var heat = SimpleHeat('canvas').max(18),
    frame;

function draw() {
  heat.draw();
  frame = null;
}
draw();
window.onmousemove = function(e) {
  heat.add([e.layerX, e.layerY, 1]);
  frame = frame || window.requestAnimationFrame(draw);
};

var radius = document.querySelector('#radius'),
    blur = document.querySelector('#blur'),
    changeType = 'oninput' in radius ? 'oninput' : 'onchange';

radius[changeType] = blur[changeType] = function(e) {
  heat.radius(+radius.value, +blur.value);
  frame = frame || window.requestAnimationFrame(draw);
};

