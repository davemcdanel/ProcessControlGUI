//Version
var version = '0.2.8';
var title = document.getElementById("title");
title.innerHTML = 'Dave\'s Red Smoker ' + version;

// DOM Elements
recvId = document.getElementById("receiver-id");
status = document.getElementById("status_banner");
output = document.getElementById("output");
setpoint = document.getElementById("setpoint");
internal = document.getElementById("internal");
set_prop = document.getElementById("set_prop");
set_inter = document.getElementById("set_inter");
set_derv = document.getElementById("set_derv");
temperature = document.getElementById("temperature");
set_setpoint = document.getElementById("set_setpoint");
div_set_setpoint = document.getElementById("div-set_setpoint");
//graphdiv2 = document.getElementById("graphdiv2");

var request;
var conn = null;
var peer = null; // Own peer object
//var peerId = null;
var reqCounter = 0;
var lastPeerId = null;

var dataPoint = 0;

// command: get or set.
// type: value, file.
// name: Name of the object.
// payload: value or data
let dataObject = { command:null, type:null, name:null, payload:null };



//get the temperatures data File
function readTemperatureFile(fileName) {
//Read InsideFolder.txt File
    fetch(filename).then(function(response) {
        response.text().then(function(text) {
            document.getElementById("appData").innerHTML = text;
            return text;
        });
    });
}

jQuery.ajaxSetup({
  // Disable caching of AJAX responses
  cache: false
});

/* Get first "GET style" parameter from href.
 * This enables delivering an initial command upon page load.
 *
 * Would have been easier to use location.hash.
 *
 *DLM "Really, I have no idea what this is for. It was in the example code, so I kept it."
 */
function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return null;
    else
        return results[1];
};

/**
* Create the Peer object for our end of the connection.
*
* Sets up callbacks that handle any events related to our
* peer object.
*/
function initializePeerJS() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer('DLM_SWUI_0001', {debug:2});
    peer.on('open', function(){ //(id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            status.innerHTML = "Status: Received null id from peer open.";
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }
        console.log('ID: ' + peer.id);
        recvId.innerHTML = "ID: " + peer.id;
        status.innerHTML = "Status: " + "Awaiting connection...";
    });
    peer.on('connection', function(c) {
        // Allow only a single connection
        if (conn && conn.open) {
            c.on('open', function() {
                c.send("Already connected to another client.");
                setTimeout(function() { c.close(); }, 500);
            });
            conn.close();
            conn = null;
            return;
        }
        conn = c;
        console.log("Connected to: " + conn.peer);
        status.innerHTML = "Status: " + "Connected to - " + conn.peer;
        ready();
    });
    peer.on('disconnected', function() {
        status.innerHTML = "Status: " + "Connection lost. Please reconnect.";
        console.log('Connection lost. Please reconnect.');

        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });
    peer.on('close', function() {
        conn = null;
        status.innerHTML = "Status: " + "Connection destroyed. Please check your internet conncection and refresh.";
        console.log('Connection destroyed.');
    });
    peer.on('error', function (err) {
        console.log(err);
        status.innerHTML = "Status: " + "Connect error. Please Wait...";
        //alert('' + err);
    });
}

/**
* Triggered once a connection has been achieved.
* Defines callbacks to handle incoming data and connection events.
*/
function ready() {
    conn.on('data', function(dataObject) {
        console.log("Recieved: " + dataObject);
        console.log('Recvd: ' + dataObject.command + ' ' + dataObject.type + ' ' + dataObject.name + ' ' + dataObject.payload);
        switch (dataObject.command) {
            case 'Get':
                switch (dataObject.type){
                    case 'value':
                        switch (dataObject.name) {
                            case 'temperature':
                                console.log('Sent: ' + 'Set temperature ' + temperature.innerHTML);
                                conn.send({command:'Set', type:'value', name:'temperature', payload:temperature.innerHTML});
                                break;
                            case 'setpoint':
                                console.log('Sent: ' + 'Set setpoint ' + setpoint.innerHTML);
                                conn.send({command:'Set', type:'value', name:'setpoint', payload:setpoint.innerHTML});
                                break;
                            case 'internal':
                                console.log('Sent: ' + 'Set internal ' + internal.innerHTML);
                                conn.send({command:'Set', type:'value', name:'internal', payload:internal.innerHTML});
                                break;
                            case 'output':
                                console.log('Sent: ' + 'Set output ' + output.innerHTML);
                                conn.send({command:'Set', type:'value', name:'output', payload:output.innerHTML});
                                break;
                            case 'dataPoint':
                                console.log('Sent: ' + 'Set dataPoint ' + dataPoint);
                                conn.send({command:'Set', type:'value', name:'dataPoint', payload:dataPoint});
                                break;
                            default:
                        }
                        break;
                    case 'file':
                        switch (dataObject.name) {
                            case './temperatures.csv':
                                console.log('Sent: ' + dataObject.name);
                                conn.send({command:'Set',type:'file',name:'./temperatures.csv',payload:"junk"});
                                break;
                            default:
                            }
                        break;
                    default:
                    }
                break;
            case 'Set':
                switch (dataObject.type){
                    case 'value':
                        switch (dataObject.name) {
                            case 'temperature':
                                //temperature.innerHTML = dataObject.payload;
                                break;
                            case 'setpoint':
                                $("#set_setpoint").load('/cgi-bin/ProcessControlCGI', 'set setpoint,' + dataObject.payload);
                                $("#set_setpoint").val(dataObject.payload).slider("refresh");
                                break;
                            case 'internal':
                                //internal.innerHTML = dataObject.payload;
                                break;
                            case 'output':
                                //output.innerHTML = dataObject.payload;
                                break;
                            case 'prop':
                                $("#set_prop").load('/cgi-bin/ProcessControlCGI', 'set prop,' + dataObject.payload);
                                $("#set_prop").val(dataObject.payload).slider("refresh");
                                break;
                            case 'inter':
                                $("#set_inter").load('/cgi-bin/ProcessControlCGI', 'set inter,' + dataObject.payload);
                                $("#set_inter").val(dataObject.payload).slider("refresh");
                                break;
                            case 'derv':
                                $("#set_derv").load('/cgi-bin/ProcessControlCGI', 'set derv,' + dataObject.payload);
                                $("#set_derv").val(dataObject.payload).slider("refresh");
                                break;
                            default:
                        }
                        break;
                    default:
                }
                break;
            default:
        }
    });
    conn.on('close', function() {
        status.innerHTML = "Connection reset<br>Awaiting connection...";
        conn = null;
    });
}

var doneOnce = 0;

function sendRequest(){
    if (reqCounter == 0){
        $('#temperature').load('/cgi-bin/ProcessControlCGI','get temperature');
    }else if (reqCounter == 1){
        $('#setpoint').load('/cgi-bin/ProcessControlCGI','get setpoint');
    }else if(reqCounter == 2){
        $('#internal').load('/cgi-bin/ProcessControlCGI','get internal');
    }else if(reqCounter == 3){
        $('#output').load('/cgi-bin/ProcessControlCGI','get output');
    }else if(reqCounter == 4){
        $('#add').load('/cgi-bin/ProcessControlCGI','get IP');
    }else if(reqCounter == 5){
       //$(dataPoint).load('/cgi-bin/ProcessControlCGI', 'get dataPoint');
        $.getJSON("dataPoint.json",addData);
       // let response = await fetch('/cgi-bin/ProcessControlCGI?get%20dataPoint');
       // if (response.ok){
       //     dataPoint = await response.json();
       //     if(!doneOnce){
              //  alert("JSON:" + dataPoint);
       //         doneOnce = 1;
       //     }
       // }else{
           // alert("json HTTP-Error: " + response.status);
       // }

    }
//
    reqCounter++;
    if (reqCounter > 5){
        reqCounter = 0;
    }
    //setTimeout(sendRequest, 1000);
}

function addData(data){
    if (data){
        dataPoint = data;
        //console.log('Update dataPoint:' + dataPoint);
    }
}

// Start the serviceWorker
function startSW (){
  if ('serviceWorker' in navigator){
    try {
      navigator.serviceWorker.register('sw.js');
      console.log('SW registered');
    } catch (error) {
      console.log('SW reg failed');
    }
 }
}

// setup event listeners and everything else after the document is loaded.
$(document).ready(function(){
    $("#set_setpoint").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set setpoint," + $("#set_setpoint").val()); });
    $("#set_prop").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set prop," + $("#set_prop").val()); });
    $("#set_inter").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set inter," + $("#set_inter").val()); });
    $("#set_derv").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set derv," + $("#set_derv").val()); });
    $("#savepid").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set savePID," + "true"); });
    $("#graphtimebase").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set graphtimebase," + $("#graphtimebase").val()); });
    $("#resetdata").change(function() { $.get("/cgi-bin/ProcessControlCGI", "set resetdata," + "true"); });
    $("#closeButton").click(function() { conn.close(); conn = null; peer = null; lastPeerId = null; });
    $("#refreshButton").click(function() { window.location.reload(); });
    startSW();
    initializePeerJS(); // Since all our callbacks are setup, start the process of obtaining an ID
    sendRequest();
    request = setInterval(function(){ sendRequest(); }, 200);
});
