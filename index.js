const path = require('path');
const batch = require('mouse-batch-util');

class PositionCache {
  constructor () {
    this.cache = {};
  }

  add (key, position) {
    this.cache[key] = position;
  }

  get (key) {
    return this.cache[key];
  }
}

function detectScene(images, sceneKeys, ss) {
  for ( let sceneIndex = 0 ; sceneIndex < sceneKeys.length ; sceneIndex++ ) {
    const sceneKey = sceneKeys[sceneIndex];
    console.log('detect scene: judge ->', sceneKey);
    const detectResult = batch.detect(images[sceneKey].judge, ss);
    if (detectResult) {
      return sceneKey;
    }
  }

  return null;
}


const positionCache = new PositionCache();
function clickTemplateWithCache( key, matrix, ss ) {
  let position = positionCache.get(key);
  if (!position) {
    position = batch.detectCenter(matrix, ss);
    if (!position) {
      return new Promise(function(resolve){ resolve(false); });
    }
    positionCache.add(key, position);
  }

  return batch.click(position.x, position.y);
}

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
    'button',
    'ok'
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

const sceneKeys = [
  'game-start',
  'in-game',
  'retry',
  'result', 
  'error'
];

const sceneOperation = {
  'game-start': async function(images, windowPosition, ss){
    await clickTemplateWithCache('game-start-button', images['game-start'].button, ss );
  },
  'in-game': async function(images, windowPosition, ss){
    const basePosition = {
      x: windowPosition.x,
      y: windowPosition.y + 150
    };

    const moveDiff = {
      x: -50,
      y: -150
    };

    const s1Diff = {
      x: -50,
      y: -50
    };

    const s2Diff = {
      x:  50,
      y: -50
    };

    const wsDiff = {
      x:   0,
      y: 100
    };

    console.log('operation in-game: wait controller appear');
    batch.down(basePosition.x, basePosition.y);
    await batch.sleep(1000);

    console.log('operation in-game: move');
    batch.drag(basePosition.x + moveDiff.x, basePosition.y + moveDiff.y);
    await batch.sleep(500);

    console.log('operation in-game: use skkil');
    batch.drag(basePosition.x + s2Diff.x, basePosition.y + s2Diff.y);
    batch.up();
  },
  'result': async function(images, windowPosition, ss){
    console.log('operation result:');
    const retryButton = batch.detectCenter( images['result'].button, ss ) ;
    const okButton = batch.detectCenter( images['result'].ok, ss ) ;
    console.log('operation result: retry ', retryButton);
    console.log('operation result:    ok ', okButton);

    if(retryButton) {
      await batch.click(retryButton.x, retryButton.y);
    } else if(okButton){
      await batch.click(okButton.x, okButton.y);
    } else {
      console.log('operation result: no button');
    }
  },
  'retry': async function(images, windowPosition, ss){
    await clickTemplateWithCache( 'retry-button', images['retry'].button, ss );
  },
  'error': async function(images, windowPosition, ss){
    await clickTemplateWithCache('error-button', images['error'].button, ss );
  }
};

const windowPosition = {};

async function initWindowPosition () {
  const titleBars = [
    await batch.loadImage( path.join(__dirname, './templates/active.png')),
    await batch.loadImage( path.join(__dirname, './templates/deactive.png'))
  ];

  console.log( titleBars );

  titleBars.forEach( function (titleBar) {
    const position = batch.detectCenterOnScreen(titleBar);

    if (!position) {
      return;
    }

    windowPosition.x = position.x;
    windowPosition.y = position.y + 50;
  });
};

async function main () {

  await initWindowPosition();

  console.log('window center :', windowPosition);

  const images = await (async function(){
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
    return images;
  })();


  while (true) {
    batch.move(100, 100);
    console.log('capture screen');
    const ss = batch.screenShot();

    console.log('detect scene: ----');
    const sceneKey = detectScene(images, sceneKeys, ss);
    console.log('detect scene: ', sceneKey);

    if (sceneKey == null) {
      batch.click(windowPosition.x, windowPosition.y);
    }

    if (sceneOperation[sceneKey]) {
      await sceneOperation[sceneKey](images, windowPosition, ss);
    }

    await batch.sleep(500);
  }
}

main();
