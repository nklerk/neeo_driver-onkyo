'use strict';

const net = require('net');
const netUDP = require('dgram');
const onkyoDiscover = netUDP.createSocket('udp4');

let onkyoClient = [];			//Array with connected onkyo clients.
let discovered = [];			//Array with discovered onkyo AVR's
let sliderVolumeValue = [];		//Volume per AVR
let switchPowerstate = [];		//Power state per AVR
let listenModeTextlabel = [];	//Listen Mode per AVR
let inputSelectTextlabel = [];	//Input selection
let sendComponentUpdate;		//Function to inform about state changes.


//Export of all OnkyoCommands so the index.js can add all buttons.
module.exports.onkyoCommands = function() {
	return onkyoCommands();
}

//Mapping between Onkyo known commands and NEEO buttons
function onkyoCommands() {
  return [
	// Inputs
	{	code: '!1SLI00', name: "INPUT VCR/DVR"},
	{	code: '!1SLI01', name: "INPUT CBL/SAT"},
	{	code: '!1SLI02', name: "INPUT GAME"},
	{	code: '!1SLI03', name: "INPUT AUX"},
	{	code: '!1SLI04', name: "INPUT AUX2"},
	{	code: '!1SLI05', name: "INPUT PC"},
	{	code: '!1SLI06', name: "INPUT VIDEO7"},
	{	code: '!1SLI07', name: "INPUT EXTRA1"},
	{	code: '!1SLI08', name: "INPUT EXTRA2"},
	{	code: '!1SLI09', name: "INPUT EXTRA3"},
	{	code: '!1SLI10', name: "INPUT BD/DVD"},
	{	code: '!1SLI11', name: "INPUT STRM BOX"},
	{	code: '!1SLI12', name: "INPUT TV"},
	{	code: '!1SLI20', name: "INPUT TAPE"},
	{	code: '!1SLI21', name: "INPUT TAPE2"},
	{	code: '!1SLI22', name: "INPUT PHONO"},
	{	code: '!1SLI23', name: "INPUT CD"},
	{	code: '!1SLI24', name: "INPUT FM"},
	{	code: '!1SLI25', name: "INPUT AM"},
	{	code: '!1SLI26', name: "INPUT TUNER"},
	{	code: '!1SLI27', name: "INPUT MUSIC SERVER"},
	{	code: '!1SLI28', name: "INPUT INTERNET RADIO"},
	{	code: '!1SLI29', name: "INPUT USB"},
	{	code: '!1SLI2A', name: "INPUT USB2"},
	{	code: '!1SLI2B', name: "INPUT NETWORK"},
	{	code: '!1SLI2C', name: "INPUT USB (toggle)"},
	{	code: '!1SLI2D', name: "INPUT AIRPLAY"},
	{	code: '!1SLI2E', name: "INPUT BLUETOOTH"},
	{	code: '!1SLI30', name: "INPUT MULTI CH"},
	{	code: '!1SLI31', name: "INPUT XM"},
	{	code: '!1SLI32', name: "INPUT SIRIUS"},
	{	code: '!1SLI33', name: "INPUT DAB"},
	{	code: '!1SLI40', name: "INPUT UNIVERSAL PORT"},

	// Listening modes
   	{   code: '!1LMD00', name: "LM Stereo"},
	{	code: '!1LMD01', name: "LM Direct"},
	{	code: '!1LMD02', name: "LM Surround"},
	{	code: '!1LMD03', name: "LM Film"},
	{	code: '!1LMD04', name: "LM THX"},
	{	code: '!1LMD05', name: "LM Action"	},
	{	code: '!1LMD06', name: "LM Musical"},
	{	code: '!1LMD07', name: "LM Mono movie"},
	{	code: '!1LMD08', name: "LM Orchestra"},
	{	code: '!1LMD09', name: "LM Unplugged"},
	{	code: '!1LMD0A', name: "LM Studio/Mix"},
	{	code: '!1LMD0B', name: "LM TV Logic"},
	{	code: '!1LMD0C', name: "LM All channels stereo"},
	{	code: '!1LMD0D', name: "LM Theater-dimensional"},
	{	code: '!1LMD0E', name: "LM Enhanced"},
	{	code: '!1LMD0F', name: "LM Mono"},
	{	code: '!1LMD11', name: "LM Pure audio"},
	{	code: '!1LMD12', name: "LM Multiplex"},
	{	code: '!1LMD13', name: "LM Full mono"},
	{	code: '!1LMD14', name: "LM Dolby Virtual"},
	{	code: '!1LMD15', name: "LM DTS Surround Sensation"},
	{	code: '!1LMD16', name: "LM Audyssey DSX"},
	{	code: '!1LMD1F', name: "LM Whole House Mode"},
	{	code: '!1LMD40', name: "LM 5.1ch Surround"},
	{	code: '!1LMD41', name: "LM Dolby EX/DTS ES"},
	{	code: '!1LMD42', name: "LM THX Cinema"},
	{	code: '!1LMD43', name: "LM LM THX Surround EX"},
	{	code: '!1LMD44', name: "LM THX Music"},
	{	code: '!1LMD45', name: "LM LM THX Games"},
	{	code: '!1LMD50', name: "LM THX U2/S2/I/S Cinema/Cinema2"},
	{	code: '!1LMD51', name: "LM THX MusicMode,THX U2/S2/I/S Music"},
	{	code: '!1LMD52', name: "LM THX Games Mode,THX U2/S2/I/S Games"},
	{	code: '!1LMD80', name: "LM Dolby Surround/Dolby Atmos"},
	{	code: '!1LMD81', name: "LM PLII/PLIIx Music"},
	{	code: '!1LMD82', name: "LM DTS:x"},
	{	code: '!1LMD83', name: "LM Neo:6 Music/Neo:X Music"},
	{	code: '!1LMD84', name: "LM PLII/PLIIx THX Cinema"},
	{	code: '!1LMD85', name: "LM Neo:6/Neo:X THX Cinema"},
	{	code: '!1LMD86', name: "LM PLII/PLIIx Game"},
	{	code: '!1LMD88', name: "LM Neural THX/Neural Surround"},
	{	code: '!1LMD89', name: "LM PLII/PLIIx THX Games"},
	{	code: '!1LMD8A', name: "LM Neo:6/Neo:X THX Games"},
	{	code: '!1LMD8B', name: "LM PLII/PLIIx THX Music"},
	{	code: '!1LMD8C', name: "LM Neo:6/Neo:X THX Music"},
	{	code: '!1LMD8D', name: "LM Neural THX Cinema"},
	{	code: '!1LMD8E', name: "LM Neural THX Music"},
	{	code: '!1LMD8F', name: "LM Neural THX Games"},
	{	code: '!1LMD90', name: "LM PLIIz Height"},
	{	code: '!1LMD91', name: "LM Neo:6 Cinema DTS Surround Sensation"},
	{	code: '!1LMD92', name: "LM Neo:6 Music DTS Surround Sensation"},
	{	code: '!1LMD93', name: "LM Neural Digital Music"},
	{	code: '!1LMD94', name: "LM PLIIz Height + THX Cinema"},
	{	code: '!1LMD95', name: "LM PLIIz Height + THX Music"},
	{	code: '!1LMD96', name: "LM PLIIz Height + THX Games"},
	{	code: '!1LMD97', name: "LM LM PLIIz Height + THX U2/S2 Cinema"},
	{	code: '!1LMD98', name: "LM PLIIz Height + THX U2/S2 Music"},
	{	code: '!1LMD99', name: "LM PLIIz Height + THX U2/S2 Games"},
	{	code: '!1LMD9A', name: "LM Neo:X Game"},
	{	code: '!1LMDA0', name: "LM PLIIx/PLII Movie + Audyssey DSX"},
	{	code: '!1LMDA1', name: "LM PLIIx/PLII Music + Audyssey DSX"},
	{	code: '!1LMDA2', name: "LM PLIIx/PLII Game + Audyssey DSX"},
	{	code: '!1LMDA3', name: "LM Neo:6 Cinema + Audyssey DSX"},
	{	code: '!1LMDA4', name: "LM Neo:6 Music + Audyssey DSX"},
	{	code: '!1LMDA5', name: "LM Neural Surround + Audyssey DSX"},
	{	code: '!1LMDA6', name: "LM Neural Digital Music + Audyssey DSX"},
	{	code: '!1LMDA7', name: "LM Dolby EX + Audyssey DSX"},

	// Power
	{	code: '!1PWR00', name: "POWER OFF"},
	{	code: '!1PWR01', name: "POWER ON"},

	// Volume
	{	code: '!1AMT00', name: "MUTE OFF"},
	{	code: '!1AMT01', name: "MUTE ON"},
	{	code: '!1AMTTG', name: "MUTE TOGGLE"},
	{	code: '!1MVLUP', name: "VOLUME UP"},
	{	code: '!1MVLDOWN', name: "VOLUME DOWN"},

	// Display
	{	code: '!1DIF00', name: "Display Volume"},
	{	code: '!1DIF01', name: "Display Listening Mode"},
	{	code: '!1DIF02', name: "Display Digital Format"},
	{	code: '!1DIF03', name: "Display Bright"},
	{	code: '!1DIM01', name: "Display Dim"},
	{	code: '!1DIM02', name: "Display Dark"},
	{	code: '!1DIM03', name: "Display Off"},
	{	code: '!1DIM08', name: "Display Bright/LED OFF"},

	// OSD Menu
	{	code: '!1OSDMENU', name: "MENU"},
	{	code: '!1OSDUP', name: "CURSOR UP"},
	{	code: '!1OSDDOWN', name: "CURSOR DOWN"},
	{	code: '!1OSDLEFT', name: "CURSOR LEFT"},
	{	code: '!1OSDRIGHT', name: "CURSOR RIGHT"},
	{	code: '!1OSDENTER', name: "CURSOR ENTER"},
	{	code: '!1OSDEXIT', name: "EXIT"},
	{	code: '!1OSDHOME', name: "HOME"}
  ];
}



///////////////////////////////
// Main Functions. NEEO
///////////////////////////////


// On a button press, find the code that Onkyo understands and find the device that it's addressed to.
module.exports.buttonHander = function(command, deviceid) {
	console.log(`[CONTROLLER] ${command} button pressed on ${deviceid}!`);
	
	const device = discoveredDB().filter((db)=> db.name === deviceid);
	const iscp = onkyoCommands().filter((db)=> db.name === command);
	
	if (device.length !== 0 ) {
		sendCommand(iscp[0].code,device[0].ip);
	} else {
		onkyoStartDiscover();
	}
};

// On a slider change, save the parameter and send the volume command
module.exports.sliderVolumeValueSet = function(deviceid, value) {
  console.log('[CONTROLLER] slider set to', deviceid, value);
  sliderVolumeValue[deviceid] = parseInt(value, 10);
  sendCommand('!1MVL'+intToHex(sliderVolumeValue[deviceid]), deviceIp(discoveredDbFindByName(deviceid)) );
};

// On a slider get, query the onkyo receiver and aswer fromn saved value
module.exports.sliderVolumeValueGet = function(deviceid) {
  console.log('[CONTROLLER] return slider value', sliderVolumeValue[deviceid]);
  sendCommand('!1MVLQSTN', deviceIp(discoveredDbFindByName(deviceid)));
  return sliderVolumeValue[deviceid];
};

module.exports.switchPowerstateSet = function(deviceid, value) {
	console.log('[CONTROLLER] set switch value', deviceid, value);
	if (value === 'true'){
		switchPowerstate[deviceid] = true;
		sendCommand('!1PWR01', deviceIp(discoveredDbFindByName(deviceid)) );
	} else {
		switchPowerstate[deviceid] = false;
		sendCommand('!1PWR00', deviceIp(discoveredDbFindByName(deviceid)) );
	}
  	sendComponentUpdate({ uniqueDeviceId: deviceid, component:'switchPowerstate', value: switchPowerstate[deviceid]});
};

module.exports.switchPowerstateGet = function(deviceid) {
  console.log('[CONTROLLER] return switch value', deviceid, switchPowerstate[deviceid]);
  sendCommand('!1PWRQSTN', deviceIp(discoveredDbFindByName(deviceid)));
  return switchPowerstate[deviceid];
};

module.exports.listenModeTextlabelGet = function(deviceid) {
  console.log('[CONTROLLER] get listen Mode Textlabel', deviceid);
  sendCommand('!1LMDQSTN', deviceIp(discoveredDbFindByName(deviceid)));
  return listenModeTextlabel[deviceid];
};
module.exports.inputSelectTextlabelGet = function(deviceid) {
  console.log('[CONTROLLER] get input Select Textlabel', deviceid);
  sendCommand('!1LMDQSTN', deviceIp(discoveredDbFindByName(deviceid)));
  return inputSelectTextlabel[deviceid];
};

module.exports.registerStateUpdateCallback = function(updateFunction) {
  console.log('[CONTROLLER] register update state');
  sendComponentUpdate = updateFunction;
};







///////////////////////////////
// Main Functions. Onkyo
///////////////////////////////

//Function connect to Onkyo 
function onkyo_connect(ip) {
	onkyoClient[ip] = new net.Socket();
	onkyoClient[ip].connect(60128, ip);
	
	//On error....
	onkyoClient[ip].on('error', function(err){
	    console.log("Error: "+err.message);
	});

    //When we receive data, used for informing NEEO.
	onkyoClient[ip].on('data', function(data) {
		if (typeof data !== 'undefined') {
			
			const deviceid = deviceName(discoveredDbFindByIp(ip));
            const iscpCode = formatIscpCode(data);

			if (iscpCode != '' && typeof iscpCode !== 'undefined') {
				console.log ('[ONKYO] Received iscp:'+iscpCode + ', translated: ' + commandsCodeToName(iscpCode));
                
				let iscpCodeHeader = iscpCode.substring (0,5);
				switch (iscpCodeHeader) {
                    
					case '!1MVL': //A change in volume received. 1MVL##
                        var hex = iscpCode.substr (5,2);
						console.log ('[ONKYO] volume HEX: '+hex)
                        sliderVolumeValue[deviceid] = parseInt(hex, 16);
						sendComponentUpdate({ uniqueDeviceId: deviceid, component:'sliderVolumeValue', value: sliderVolumeValue[deviceid]});
                        console.log ('[ONKYO] volume VOL: '+sliderVolumeValue[deviceid]);
                        break;

                    case '!1PWR': //A change in power state received. 1PWR00, 1PWR01
                        if (iscpCode == '!1PWR00') { 
							switchPowerstate[deviceid] = false;
							sendComponentUpdate({ uniqueDeviceId: deviceid, component:'switchPowerstate', value: switchPowerstate[deviceid]});
						} else if (iscpCode == '!1PWR01') { 
							switchPowerstate[deviceid] = true;
							sendComponentUpdate({ uniqueDeviceId: deviceid, component:'switchPowerstate', value: switchPowerstate[deviceid]});
						} 
                        break;

                    case '!1LMD': //A change in Listenmode received.
						listenModeTextlabel[deviceid] = commandsCodeToName(iscpCode);
						sendComponentUpdate({ uniqueDeviceId: deviceid, component:'listenModeTextlabel', value: listenModeTextlabel[deviceid]});
                        break;

                     case '!1SLI': //A change in input received.
					 	inputSelectTextlabel[deviceid] = commandsCodeToName(iscpCode);
						sendComponentUpdate({ uniqueDeviceId: deviceid, component:'inputSelectTextlabel', value: inputSelectTextlabel[deviceid]});
                        break;

                    default:

                }
			}
		}
	});
}

// Send a command to Onkyo
function sendCommand (command, ip) {
	if (typeof onkyoClient[ip] !== 'undefined') {
		onkyoClient[ip].write(formatIscpData(command));
        console.log("[ONKYO] Sending command: " + command + " to " + ip);
	} else {
		console.log('Onkyo Client: ' + ip  + ' isn`t connected, Connecting the driver.');
		onkyo_connect(ip);
		if (typeof onkyoClient[ip] !== 'undefined') {
            onkyoClient[ip].write(formatIscpData(command));
            console.log("[ONKYO] Sending command: " + command + " to " + ip);
        }
	}
}








///////////////////////////////
// Discovery
///////////////////////////////


function discoveredDB() {
	return discovered;
}

function discoveredDbFindByName(name) {
	return discoveredDB().filter((db) => db.name === name);
}

function discoveredDbFindByIp(ip) {
	return discoveredDB().filter((db) => db.ip === ip);
}

function discoveredAdd(name, ip) {
	const findid = discoveredDbFindByName(name);
	if (findid.length === 0 ) {
		console.log ("[ONKYO] Found AVR: " + name + " (" + ip + ")" );
		discovered.push({ip: ip, name: name});
	}
}

module.exports.discoverOnkyo = function() {
  console.log('[CONTROLLER] Onkyo discovery call');
  return discoveredDB().map((avr) => ({
      id: avr.name,
      name: avr.name,
      reachable: true,
    }));
};

function onkyoStartDiscover() {
    console.log ("[ONKYO] Start Discover service.");
    onkyoDiscover.bind(60128);
}

function onkyoStopDiscover(){
    console.log ("[ONKYO] Stop Discover service.");
    onkyoDiscover.close();
}

onkyoDiscover.on('error', (err) => {
    console.log(`Discover error:\n${err.stack}`);
    onkyoDiscover.close();
});

onkyoDiscover.on('message', (data, rinfo) => {
    const iscpCode = formatIscpCode(data); 
    const iscpCodeHeader = iscpCode.substring (0,5);
    if (iscpCodeHeader == '!1ECN') {
        const devicename = iscpCode.match(/[^\/]+/g)[0].replace('!1ECN',''); //Filter devicename.
		discoveredAdd(devicename, rinfo.address);
    }  
});

onkyoDiscover.on('listening', () => {
    console.log(`[ONKYO] Discover listening ${onkyoDiscover.address().address}:${onkyoDiscover.address().port}`);
    onkyoDiscover.setBroadcast(true);
	let buffer = formatIscpData('!xECNQSTN'); //Queery devicedata for discovery.
	onkyoDiscover.send(buffer, 0, buffer.length, 60128, '255.255.255.255'); // Send broadcast on port 60128.
	let disconnect_timer = setTimeout(onkyoStopDiscover, 1337); // Close after 1,337 seconds.
});


///////////////////////////////
// Small Functions.
///////////////////////////////

// format iscp data
function formatIscpData (cmd) {
	const code=String.fromCharCode(cmd.length+1);
	const data="ISCP\x00\x00\x00\x10\x00\x00\x00"+code+"\x01\x00\x00\x00"+cmd+"\x0D";
	return data;
}

function formatIscpCode (data) {
	data = data.toString();
	data = data.replace(/(\r\n|\n|\r)/gm,"!");
	data = data.match(/[^!]+([0-9A-z\-]+)/g)[1];
	return '!'+data;
}

function commandsCodeToName(code) {
    const iscp = onkyoCommands().filter((db)=> db.code === code);
	let response = '';
	if (iscp.length === 1) {
		response = iscp[0].name
	}
    return response;
}

function intToHex(inte) {
	let hex = '0' + inte.toString(16);
	hex = hex.substring((hex.length - 2),hex.length)
	return hex;
}

function deviceName(device) {
	if (device.length === 1){
		return device[0].name;
	} else {
		return '';
	}
}

function deviceIp(device) {
	if (device.length === 1){
		return device[0].ip;
	} else {
		return '';
	}
}

onkyoStartDiscover();
