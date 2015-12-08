var logSpace = document.querySelector('.log-space');
var coolButton = document.querySelector('.cool-button');
var deleteButton = document.querySelector('.delete-button');
var heatCanvas = document.querySelector('#canvas');
var heatMap;
var frame;
var radiusSetting = document.querySelector('#radius');
var blurSetting = document.querySelector('#blur');
var serverSetting = document.querySelector('#server');
var serverButton =  document.querySelector('.set-server');
var browserChangeEvent = 'oninput' in radiusSetting ? 'oninput' : 'onchange';
var POINT_OPACITY = 1;
var DEFAULT_SERVER = 'localhost:5000';
var socket;

function setupCanvasAndAddBindings() {
  heatCanvas.width= screen.width;
  heatCanvas.height= screen.height;

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  //event bindings that technically could use the socket, but left as AJAX here
  coolButton.addEventListener('click', doSomethingCool);
  deleteButton.addEventListener('click', deleteHeatData);
  serverButton.addEventListener('click', function() {
    setupSocket(serverSetting.value);
  }); //UGL-ish

  window.onclick = function(e) {
    var point = [e.layerX, e.layerY, POINT_OPACITY];
    socket.emit('clientHeat', point);
  };

  radiusSetting[browserChangeEvent] = blurSetting[browserChangeEvent] = function(e) {
    heatMap.radius(+radiusSetting.value, +blurSetting.value);
    frame = frame || window.requestAnimationFrame(renderHeat);
  };
}


// AJAX requests
function doSomethingCool(e) {
  var oReq = new XMLHttpRequest();
  e.stopPropagation(); //there is no heat, only the cool
  oReq.addEventListener('load', addToLog);
  oReq.open('GET', '/cool');
  oReq.send();
}

function deleteHeatData() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', addToLog);
  oReq.open('DELETE', '/heat');
  oReq.send();
}

// SOCKET.IO
// ---------
function setupSocket(server) {
  if (!server) {
    console.log('No server entered to switch to. Using default server: ', DEFAULT_SERVER);
    server =  DEFAULT_SERVER;
  }

  if (socket) {
    console.log('Disconnecting', socket);
    socket.disconnect();
  }

  console.log('Socket: connecting to ', server);
  socket = io.connect('http://' + server);

  socket.on('totalHeat', function(data) {
    console.log('totalHeat: ', data);
    heatMap = SimpleHeat('canvas').data(data).max(4);
    frame = frame || window.requestAnimationFrame(renderHeat);
  });

  socket.on('serverHeat', function(data) {
    console.log('serverHeat: ', data);
    heatMap.add(data);
    addToLog(data);
    frame = frame || window.requestAnimationFrame(renderHeat);
  });
}

//rendering
function addToLog(data) {
  var logEntry = this.responseText || data;
  logSpace.innerHTML += '<span class="log">' + logEntry + '</span>';
}

function renderHeat() {
  heatMap.draw();
  frame = null;
}

// Module pattern? Ain't nobody got time for that!
console.log('App init');
setupSocket();
setupCanvasAndAddBindings();
