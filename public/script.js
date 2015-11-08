console.log('hi world');

var target = document.querySelector('.target');
var coolButton = document.querySelector('button');
var postButton = document.querySelector('.post-button');
coolButton.addEventListener('click', doSomethingCool);
postButton.addEventListener('click', doPost);

function doSomethingCool() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', handler);
  oReq.open('GET', '/cool');
  oReq.send();
}

var thing = {
  key: '',
  value: ''
};

function doPost() {
  var oReq = new XMLHttpRequest();
  thing.key = 'mahKey';
  thing.value = 'mahValue';

  oReq.addEventListener('load', handler);
  oReq.open('POST', '/things');
  oReq.setRequestHeader('Content-Type', 'application/json');
  oReq.send(JSON.stringify(thing));
}

function handler() {
  console.log('handler: ', this);
  target.innerHTML += this.responseText + ' ';
}
