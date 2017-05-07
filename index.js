const path = require('path');
const batch = require('mouse-batch-util');

async function main () {
  const scenes = {
    'game-start': [
      'judge',
      'button'
    ],
    'in-game': [
      'judge'
    ],
    'result': [
      'judge',
      'button'
    ],
    'retry': [
      'judge',
      'button'
    ]
  };

  const images = {};
  const sceneKeys = Object.keys(scenes);
  for ( let keyIndex = 0 ; keyIndex < sceneKeys.length ; keyIndex++ ) {
    const scene = sceneKeys[ keyIndex ];
    
    if(!images[scene]) {
      images[scene] = {};
    }

    const templates = scenes[scene];
    for ( let templateIndex = 0 ; templateIndex < templates.length ; templateIndex++ ) {
      const template = templates[ templateIndex ];
      const filePath = path.join(__dirname, './templates/scenes', scene, `${template}.png`);
      images[scene][template] = await batch.loadImage(filePath);
    }
  }

  while (true) {
    console.log('ss');
    const ss = batch.bmp2matrix( batch.screenShot() );
    if( batch.detect( images['game-start'].judge, ss ) ) {
      batch.clickTemplate( images['game-start'].button );
    }

    if( batch.detect( images['result'].judge, ss ) ) {
      batch.clickTemplate( images['result'].button );
    }

    console.log( 'sleep >')
    await sleep(500);
    console.log( 'sleep <')

  }
}

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

main();
