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
    ],
    'error': [
      'judge',
      'button'
    ],
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
    const ss = batch.screenShot();
    if( batch.detect( images['game-start'].judge, ss ) ) {
      await batch.clickTemplate( images['game-start'].button );
    }

    if( batch.detect( images['in-game'].judge, ss ) ) {
      batch.down(1260, 550);
      await batch.sleep(5000);
    }

    if( batch.detect( images['result'].judge, ss ) ) {
      await batch.clickTemplate( images['result'].button );
    }

    if( batch.detect( images['retry'].judge, ss ) ) {
      await batch.clickTemplate( images['retry'].button );
    }

    if( batch.detect( images['error'].judge, ss ) ) {
      await batch.clickTemplate( images['error'].button );
    }


  }
}

main();
