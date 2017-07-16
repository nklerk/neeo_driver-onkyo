'use strict';

////////////////////////////
// Settings

const BRAIN_PORT = 6336;    // Change this port to a unique port number when running multiple NEEO drivers.
let BRAIN_IP;               // Set this to a specific IP when needed.
// end Settings
////////////////////////////

const neeoapi = require('neeo-sdk');
const controller = require('./controller_onkyo');

console.log('Generic Onkyo AVR Driver over IP');
console.log('------------------------------------------');


//discovery text that is presented to the user while adding the Onkyo AVR.
const discoveryInstructions = {
  headerText: 'Generic Onkyo AVR Driver over IP',
  description: 'THIS DRIVER IS CURRENTLY IN BETA,' +
    'SOME ISSUES MIGHT OCCUR.' +
    'IT IS HIGHLY APPRECIATED WHEN POSSUBLE BUGS GET REPORTED. Niels de Klerk'
};


//Device parameters
let onkyoAVR = neeoapi.buildDevice('Generic AVR (IP)')
  .setManufacturer('Onkyo')
  .addAdditionalSearchToken('AVR', 'IP', 'TX-NR')
  .setType('AVRECEIVER')
  .enableDiscovery(discoveryInstructions, controller.discoverOnkyo);

//Adding all known (defined) buttons and hander.
const addButtons = controller.onkyoCommands();
for (var i in addButtons) {
  onkyoAVR.addButton({ name: addButtons[i].name, label: addButtons[i].name });
}
onkyoAVR.addButtonHander(controller.buttonHander);

//Adding a volume slider. VOL 40 is the maximum to prevent excidental speaker blowups.
onkyoAVR.addSlider({ name: 'sliderVolumeValue', label: 'VOLUME SLIDER', range: [0,40], unit: 'Vol' },
  { setter: controller.sliderVolumeValueSet, getter: controller.sliderVolumeValueGet });

//Adding a power switch (on/off)
onkyoAVR.addSwitch({ name: 'switchPowerstate', label: 'POWER SWITCH' },
  { setter: controller.switchPowerstateSet, getter: controller.switchPowerstateGet });

//Adding a textlabel to show the current listening mode.
onkyoAVR.addTextLabel({ name: 'listenModeTextlabel', label: 'LISTEN MODE' }, controller.listenModeTextlabelGet);

//Adding a textlabel to display the selected input.
onkyoAVR.addTextLabel({ name: 'inputSelectTextlabel', label: 'SELECTED INPUT' }, controller.inputSelectTextlabelGet);

//Adding the Subscription Function
onkyoAVR.registerSubscriptionFunction(controller.registerStateUpdateCallback);



function startOnkyoDriver(brain) {
  console.log('[NEEO]  Start server');
  neeoapi.startServer({
    brain,
    port: BRAIN_PORT,
    name: 'onkyo-adapter',
    devices: [onkyoAVR]
  })
  .then(() => {
    console.log('[NEEO]  READY, use the mobile app to search for "Onkyo Generic AVR (IP)" adapter!');
  })
  .catch((error) => {
    console.error('[NEEO]  ERROR!', error.message);
    process.exit(1);
  });
}


if (BRAIN_IP) {
  console.log('[NEEO]  use NEEO Brain IP from env variable', BRAIN_IP);
  startOnkyoDriver(BRAIN_IP);
} else {
  console.log('[NEEO]  Discover one NEEO Brain...');
  neeoapi.discoverOneBrain()
    .then((brain) => {
      console.log('[NEEO]  Brain discovered:', brain.name);
      startOnkyoDriver(brain);
    });
}