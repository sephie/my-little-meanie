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
var heatMap;
var frame;
var radiusSetting = document.querySelector('#radius');
var blurSetting = document.querySelector('#blur');
var browserChangeEvent = 'oninput' in radiusSetting ? 'oninput' : 'onchange';

heatCanvas.width= screen.width;
heatCanvas.height= screen.height;
heatMap = SimpleHeat('canvas').max(18);

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

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

function draw() {
  heatMap.draw();
  frame = null;
}

window.onclick = function(e) {
  heatMap.add([e.layerX, e.layerY, 1]);
  frame = frame || window.requestAnimationFrame(draw);
};

radiusSetting[browserChangeEvent] = blurSetting[browserChangeEvent] = function(e) {
  heatMap.radius(+radiusSetting.value, +blurSetting.value);
  frame = frame || window.requestAnimationFrame(draw);
};

