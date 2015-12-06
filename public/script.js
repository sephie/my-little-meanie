/*
-modularize this
-modularize simpleHeat.js
-...
- draw on mousedown + on drag
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

var POINT_OPACITY = 1;

heatCanvas.width= screen.width;
heatCanvas.height= screen.height;
getHeatData();

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//events
coolButton.addEventListener('click', doSomethingCool);
deleteButton.addEventListener('click', deleteHeatData);

window.onclick = function(e) {
  var point = [e.layerX, e.layerY, POINT_OPACITY];
  heatMap.add(point);
  doPoint(point);
  frame = frame || window.requestAnimationFrame(draw);
};

radiusSetting[browserChangeEvent] = blurSetting[browserChangeEvent] = function(e) {
  heatMap.radius(+radiusSetting.value, +blurSetting.value);
  frame = frame || window.requestAnimationFrame(draw);
};

//requests
function doSomethingCool() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('GET', '/cool');
  oReq.send();
}

/**
 * POST a point
 * @param {array} point - [x ,y, opacity]
 */
function doPoint(point) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('POST', '/heat');
  oReq.setRequestHeader('Content-Type', 'application/json');
  oReq.send(JSON.stringify(point));
}

function deleteHeatData() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', resultToScreenHandler);
  oReq.open('DELETE', '/heat');
  oReq.send();
}

function getHeatData() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', initHeat);
  oReq.open('GET', '/heat');
  oReq.send();
}

function initHeat() {
  var data = JSON.parse(this.responseText);
  heatMap = SimpleHeat('canvas').data(data).max(4);
  heatMap.draw();
}

//rendering
function resultToScreenHandler() {
  console.log('handler: ', this);
  logSpace.innerHTML += '<span class="log">' + this.responseText + '</span>';
}

function draw() {
  heatMap.draw();
  frame = null;
}
