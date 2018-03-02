window.addEventListener("keydown", function(e) { // disable page movement using cursor keys
  if([32, 37, 38, 39, 40, 17, 87, 83, 65, 68, 73].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, false);

// makes sure entire canvas fits a smaller screen (the values 640, 480 need to be changed for future apps)
window.document.addEventListener('orientationchange', function() {
  var scale = Math.min(window.innerWidth / 640, window.innerHeight / 480);
  stage.scaleX = scale;
  stage.scaleY = scale;
  stage.canvas.width = 640 * scale;
  stage.canvas.height = 480 * scale;
  window.scrollTo(0, 0); // hides safari toolbar <iOS7
}, false);

// define all vars & parameters
var canvas, stage, gamestarted = false, animPlaying = false, dialogueShowing = false, dialogueTimer, lastDialog = [], idleTimeout = createjs.Ticker.getTime(); // general
var creditsroll = false, creditsinitiated = false, creditsSine = 0, debug = false, showIntroEffects = false, introCreated = false; // credits & intro
var speed = 4, player, player_location, oldloc, player_strength = lifecounter = 5, player_inventory = [], oldplayerx, oldplayery; // player
var KEYCODE_LEFT = 37, KEYCODE_RIGHT = 39, KEYCODE_UP = 38, KEYCODE_DOWN = 40, KEYCODE_SPACE = 32, KEYCODE_CTRL = 17, KEYCODE_W = 87,KEYCODE_S = 83,KEYCODE_A = 65,KEYCODE_D = 68, KEYCODE_I = 73, leftHeld = false , rightHeld = false, upHeld = false, downHeld = false, spaceHeld = false; // keycodes
var newapx, newapy, tilesize = 32, htiles = 640 / tilesize, vtiles = 480 / tilesize, tileArray = [], world_array_col = 4, world_array_row = 4; // positioning
var raintime = createjs.Ticker.getTime(), la = 0, weatherList = [], snowList = [], waterstreamList = [],  linterval = 5000, lrinterval = 0; // weather effects
fishList = [], waitingForFishAnimToFinishCounter = 0, fishCaught = 0, fishMissionStarted = false; // fishing mini game
enemyList = [], oldenx = 0, oldeny = 0, swordAnimActive = 0, enemyHit = false, fireballList = [], bossList = [], bossfightstarted = false, bossInVicinity = false, boss_strength = 25, bossDefeated = false; // enemies

//speed = 15;
//debug=true;
//bossDefeated = true;
//creditsroll = true;
//player_inventory.push(121); // magic boots
//player_inventory.push(119); // pick axe
//player_inventory.push(118); // ice sword
//player_inventory.push(122); // dragon's tooth
//player_inventory.push(120); // boat
//var world_array_col = 13, world_array_row = 11; // debug

// initialising preloadJS
var loadingInterval = 0, preload; // preloadJS stuff

function updateLoading(event) {
  progress.graphics.clear();
  progress.graphics.beginFill("#fff").drawRect(270,230,100*(event.loaded / event.total),20);
  stage.update();
}

function doneLoading(event) {
  clearInterval(loadingInterval);
  stage.removeChild(progress);
  stage.removeChild(progressbar);
  stage.removeChild(progresstext);
  init(); // now that everything is done preloading, continue setting up the game
}

function preload() {

  // for the progress bar, we need a canvas to draw onto
  canvas = document.getElementById("myCanvas"); //use 'canvas' to refer to the existing html element 'myCanvas'
  stage = new createjs.Stage(canvas); // a stage is the root level Container for a display list. Each time its Stage/tick method is called, it will render its display list to its target canvas.

  createjs.Touch.enable(stage, true, false); // enable touch

  progresstext = new createjs.Text('Traveling to Thramor', "34px Romanesco", "#ccc"); // this also prefetches the google webfont
  progresstext.x = 238;
  progresstext.y = 160;
  stage.addChild(progresstext);
  progressbar = new createjs.Shape();
  progressbar.graphics.setStrokeStyle(1, "round").beginStroke("#aaa").drawRect(270,230,100,20);
  stage.addChild(progressbar);
  progress = new createjs.Shape(); // the 'fill'
  stage.addChild(progress);

  stage.update();

  // these externals will be preloaded, before game will start
  var manifest = [
    {id:"open", src:"audio/open.mp3"},
    {id:"castle", src:"audio/castle.mp3"},
    {id:"icymountain", src:"audio/icymountain.mp3"},
    {id:"forest", src:"audio/forest.mp3"},
    {id:"cavern", src:"audio/cavern.mp3"},
    {id:"title", src:"audio/title.mp3"},
    {id:"volcano", src:"audio/volcano.mp3"},
    {id:"guile", src:"audio/guile.mp3"},
    {id:"nyancat", src:"audio/nyancat.mp3"},
    {id:"enemy-dead", src:"audio/enemy-dead.mp3"},
    {id:"enemy-hit", src:"audio/enemy-hit.mp3"},
    {id:"swoosh", src:"audio/swoosh.mp3"},
    {id:"player-hit", src:"audio/player-hit.mp3"},
    {id:"dragon", src:"audio/dragon.mp3"},
    {id:"ping", src:"audio/ping.mp3"},
    {id:"dialogue", src:"audio/dialogue.mp3"},
    {id:"thunder", src:"audio/thunder.mp3"},
    {id:"title02", src:"img/pic-thramor-title02.png"},
    {id:"title01", src:"img/pic-thramor-title01.png"},
    {id:"title03", src:"img/pic-thramor-title03.png"},
    {id:"intro01", src:"img/pic-thramor-intro01.png"},
    {id:"intro02", src:"img/pic-thramor-intro02.png"},
    {id:"intro03", src:"img/pic-thramor-intro03.png"},
    {id:"intro04", src:"img/pic-thramor-intro04.png"},
    {id:"intro05", src:"img/pic-thramor-intro05.png"},
    {id:"titlesmall", src:"img/pic-thramor-titlesmall.png"},
    {id:"guibg", src:"img/pic-thramor-guibg.png"},
    {id:"dialogueheader", src:"img/pic-thramor-dialogueheader.png"},
    {id:"nyangfx", src:"img/pic-thramor-nyan.png"},
    {id:"enemies", src:"img/sheet-thramor-enemies.png"},
    {id:"player", src:"img/sheet-thramor-player.png"},
    {id:"volcano", src:"img/sheet-thramor-volcano.png"},
    {id:"world", src:"img/sheet-thramor-world.png"}
  ];

  preload = new createjs.LoadQueue();
  preload.installPlugin(createjs.Sound);
  preload.installPlugin(createjs.Image);
  preload.addEventListener("complete", doneLoading); // add an event listener for when load is completed
  preload.addEventListener("progress", updateLoading);
  preload.loadManifest(manifest);

}

function init(){

  // 'walkable tiles' definition. what tiles can be stepped on? all others are simply not accessible - since this is repeated for each room it makes sense to have this in a seperate lookup array
  walkable_tiles = [
    [0, 1, 4, 5, 17, 25, 26, 36, 40, 41, 42, 43, 47, 50, 56, 69, 71, 79, 80, 81, 83, 100, 101, 102, 103, 104, 105, 111, 112, 113, 114, 115, 116, 126, 133, 134, 135, 139, 201, 202, 203, 204]
  ];

  // define ticker
  createjs.Ticker.addEventListener("tick", handleTick);
  createjs.Ticker.setFPS(30);

  // register document key functions
  document.onkeydown = handleKeyDown;
  document.onkeyup   = handleKeyUp;

  // add event listener to stage for mouse 'click' control (movement)
  stage.on("stagemousedown", function(evt) {
    idleTimeout = createjs.Ticker.getTime(); // nyan
    if(gamestarted == true && dialogueShowing == false){
      if(gamestarted){idleTimeout = createjs.Ticker.getTime();}
      if(evt.stageX >= player.x){xdif = evt.stageX - player.x}else{xdif = player.x - evt.stageX}
      if(evt.stageY >= player.y){ydif = (evt.stageY - tilesize) - player.y}else{ydif = player.y - (evt.stageY - tilesize)}
      if(player.x > 100 && player.x < 640 && player.y > 100 && player.y < 400){minspace = 75} else {minspace = 0} // no margin near screen edge
      if(xdif >= ydif && xdif > minspace){
        if(evt.stageX > player.x){rightHeld = true; player.rotation = 90;} else {leftHeld = true; player.rotation = 270;}
      } else if (ydif > minspace){
        if(evt.stageY > player.y){downHeld = true; player.rotation = 180;} else {upHeld = true; player.rotation = 0;}
      } else {
        spaceHeld = true;
        // add event listener to stage for mouse 'double click' control (attack)
        /* below code is a copy of what is registered under the keyDown event */
        leftHeld = false; rightHeld = false; upHeld = false; downHeld = false;
        if(bossInVicinity == true){boss_strength -= 1;}
        animPlaying = false;
        if(dialogueShowing && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){
          dialogueShowing = false;
          dialoguecontainer.removeAllChildren();
        } else {
          if(player.currentAnimation != "boat"){ // no fighting in the boat, please
            if(player_inventory.indexOf(118,0) >= 0){
              if(player.currentAnimation != "swordfight"){player.gotoAndPlay("swordfight"); enemyHit = false;}
              checkEnemy();
              spaceHeld = false;
            } else {
              if(player.currentAnimation != "fight"){player.gotoAndPlay("fight"); enemyHit = false;}
              checkEnemy();
              spaceHeld = false;
            }
          }
        }

        /* end of copy from keyDown */
      }
      if((leftHeld || rightHeld || upHeld || downHeld) && !spaceHeld){player.gotoAndPlay("walk")} // show walk anim unless already showing, or fighting
    }
    if(!gamestarted && dialogueShowing && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){stage.removeAllChildren();location.reload();} // player has died and wants to restart
    if(!gamestarted && introCreated && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){introcontainer.removeAllChildren(); introCreated = false; startGame(); spaceHeld = false; } // player wants to skip intro
    stage.update();
  });

  // add event listener to stage for mouse 'up' control (stand)
  stage.on("stagemouseup", function(evt) {
    idleTimeout = createjs.Ticker.getTime();
    /* below is a copy of what is registered under the keyUp event */
    if(gamestarted == true && dialogueShowing == false){
      if(leftHeld){player.x  = Math.floor(player.x / tilesize) * tilesize;}
      if(rightHeld){player.x = Math.ceil (player.x / tilesize) * tilesize;}
      if(downHeld){player.y  = Math.ceil (player.y / tilesize) * tilesize;}
      if(upHeld){player.y    = Math.floor(player.y / tilesize) * tilesize;}
      leftHeld=false; rightHeld = false; upHeld = false; downHeld = false; spaceHeld = false;
      if(gamestarted && !leftHeld && !rightHeld && !upHeld && !downHeld && !spaceHeld){
        player.gotoAndPlay("stand");
        animPlaying = false;
        if(curarray[newapy][newapx] == 38  || curarray[newapy][newapx] == 133 || curarray[newapy][newapx] == 134 || curarray[newapy][newapx] == 135){
          if(player.currentAnimation != "boat"){
            player.gotoAndPlay("boat");
            animPlaying = true;
          }
        }
      }
      /* end of copy from keyUp */
    }
  });

  // build main container
  container = new createjs.Container();
  container.y = tilesize + tilesize / 2; // need to correct a bit here since we use the first line for the game gui
  container.x = tilesize / 2;
  stage.addChild(container);

  // build gui container
  guicontainer = new createjs.Container();
  guicontainer.y = guicontainer.x = 0;
  stage.addChild(guicontainer);

  // build title screen, start button
  //createFrontend(); // this is now called from the preload function!

  // fps counter and room number
  if(debug){createDebug()}

  // load spritesheet for player
  ss_player = new createjs.SpriteSheet({
    "animations":
    {
      "stand": {
        frames: [0],
        speed: 0.3
      },
      "walk": {
        frames: [1,2,3,4,5,6,7],
        next: "walk",
        speed: 0.3
      },
      "fight":{
        frames: [12,13,14,15],
        next: "stance",
        speed: 0.3
      },
      "swordfight":{
        frames: [16,17,18,19],
        next: "stance",
        speed: 0.3
      },
      "boat": {
        frames: [22,23,24],
        speed: 0.1
      },
      "stance": {
        frames: [0],
        speed: 0.1
      }
    },
    "images": [preload.getResult("player")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16,
      regY:   16
    }
  });

  // load spritesheet for enemy sprites #1
  ss_enemy_1 = new createjs.SpriteSheet({
    "animations":
    {
      "stand": {
        frames: [0],
        speed: 0.3
      },
      "walk": {
        frames: [1, 2, 3, 4, 5, 6, 7],
        next: "walk",
        speed: 0.3
      },
      "fight":{
        frames: [15, 16, 17],
        next: "stance",
        speed: 0.35
      },
      "stance":{
        frames: [15, 15],
        next: "fight",
        speed: 0.15
      }
    },
    "images": [preload.getResult("enemies")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16,
      regY:   16
    }
  });

  // load spritesheet for enemy sprites #2
  ss_enemy_2 = new createjs.SpriteSheet({
    "animations":
    {
      "stand": {
        frames: [19],
        speed: 0.3
      },
      "walk": {
        frames: [20, 21, 22, 23, 24, 25, 26],
        next: "walk",
        speed: 0.3
      },
      "fight":{
        frames: [34, 35, 36,  37],
        next: "stance",
        speed: 0.35
      } ,
      "stance":{
        frames: [34, 34],
        next: "fight",
        speed: 0.15
      }
    },
    "images": [preload.getResult("enemies")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16,
      regY:   16
    }
  });

  // load spritesheet for enemy sprites #3
  ss_enemy_3 = new createjs.SpriteSheet({
    "animations":
    {
      "stand": {
        frames: [38],
        speed: 0.3
      },
      "walk": {
        frames: [39, 40, 41, 42, 43, 44, 45],
        next: "walk",
        speed: 0.3
      },
      "fight":{
        frames: [53, 54, 55, 56],
        next: "stance",
        speed: 0.35
      },
      "stance":{
        frames: [53, 53],
        next: "fight",
        speed: 0.15
      }
    },
    "images": [preload.getResult("enemies")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16,
      regY:   16
    }
  });

  // load spritesheet for enemy sprites #4
  ss_enemy_4 = new createjs.SpriteSheet({
    "animations":
    {
      "stand": {
        frames: [57],
        speed: 0.3
      },
      "walk": {
        frames: [57, 58, 59, 60],
        next: "walk",
        speed: 0.5
      },
      "fight":{
        frames: [61, 62],
        next: "stance",
        speed: 0.35
      },
      "stance":{
        frames: [61, 61, 61],
        next: "fight",
        speed: 0.15
      }
    },
    "images": [preload.getResult("enemies")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16, // all spritesheets contain 32x32 tiles. to make the tiles rotatable, the reg point needes an offset of half a tile. this needs to be corrected by placement of the main container further below
      regY:   16
    }
  });

  // load spritesheet for volcano area - needed its own spritesheet to prevent photoshop's glow layer style going crazy on repeated tiles
  ss_volcano = new createjs.SpriteSheet({
    "animations":
    {
      tile201: {frames: [18, 20], speed: 0.06},
      tile202: {frames: [19, 21], speed: 0.06},
      tile203: {frames: [26, 28], speed: 0.06},
      tile204: {frames: [27, 29], speed: 0.06}
    },
    "images": [preload.getResult("volcano")],
    "frames":
    {
      height: 32,
      width:  32,
      regX:   16,
      regY:   16
    }
  });

  // load spritesheet for world - here the tiles are given their identifiers. they cannot be just a number, hence the 'tile*' prefix. this is automatically added by the code
  ss_world = new createjs.SpriteSheet({
    "animations":
    {
      tile0: 0, // grass
      tile1: 1, // wooden castle bridge
      tile2: 2, // water
      tile3: 3, // waterkant
      tile4: 4, // forest grass
      tile5: 5, // sand edge
      tile6: {frames: [6, 7], speed: 0.02}, // wise old man
      tile7: 8, // heart
      tile8: 9, // transparent tile for interactions and such
      tile9: 10, // flowerbed
      tile10: 11, // stone middle
      tile11: 12, // stone bottom
      tile12: 13, // impassable bridge endpoint
      tile13: 14, // stone top
      tile14: 15, // tree
      tile15: 16, // fallen tree
      tile16: 17, // puddle
      tile17: 18, // sand corner left for island
      tile18: 19, // yellow flowers
      tile19: 20, // tree on forest grass
      tile20: 21, // puddle on forest grass
      tile21: 22, // secret entrance sign 1
      tile22: 23, // secret entrance sign 1
      tile23: 24, // secret entrance sign 1
      tile24: {frames: [25, 26], speed: 0.02}, // king on throne
      tile25: 27, // castle floor tile
      tile26: 28, // castle floor carpet
      tile27: 29, // castle wall
      tile28: 30, // princess
      tile29: 31, // knight in castle
      tile30: 32, // inaccesible castle floor tile
      tile31: {frames: [33, 34], speed: 0.02}, // wizard
      tile32: 35, // glasses
      tile33: 36, // wizard table
      tile34: 37, // wizard table
      tile35: 38, // wizard table
      tile36: 39, // cave floor
      tile37: 40, // lake edge on the right
      tile38: 41, // lake
      tile39: 42, // lake edge on the up
      tile40: 43, // lake corner ne
      tile41: 44, // lake edge on the down
      tile42: 45, // beach
      tile43: 46, // beach attr
      tile44: 47, // rounded lake corner - sw
      tile45: 48, // rounded lake corner - ne
      tile46: {frames: [49, 50], speed: 0.02}, // bridge troll
      tile47: 51, // bridge
      tile48: 52, // bridge refl
      tile49: 53, // stone bottom water
      tile50: 54, // bridge ends in grass
      tile51: 55, // lava stone l
      tile52: 56, // lava stone r
      tile53: 57, // lava stone mid l
      tile54: 58, // lake corner
      tile55: 59, // lake edge on the left
      tile56: 60, // bridge ends in grass inv
      tile57: 61, // lake corner se
      tile58: 62, // atari e.t. dump
      tile59: 63, // atari e.t. dump
      tile60: 92, // atari e.t. dump
      tile61: 93, // atari e.t. dump
      tile62: 64, // lake corner ne
      tile63: 65, // lake corner sw
      tile64: 66, // lake corner sw
      tile65: 67, // lake edge up
      tile66: 68, // lake corner se
      tile67: 69, // lake edge west
      tile68: 70, // lake corner nw
      tile69: {frames: [71, 72], speed: 0.05}, // cave entrance u
      tile82: {frames: [101, 102], speed: 0.05}, // cave entrance d
      tile70: 73, // sign
      tile71: 74, // pathway tile
      tile72: 75, // star
      tile73: 76, // mud crab
      tile74: 77, // sign post
      tile75: 78, // bench l
      tile76: 79, // bench r
      tile77: 80, // grave
      tile78: 81, // sand water
      tile79: 82, // sand water corner t
      tile80: 83, // sand water corner b
      tile81: {frames: [84, 85], speed: 0.01}, // sand water anim l
      tile83: {frames: [86, 87], speed: 0.01}, // sand water anim b
      tile84: 88, // palm tree
      tile85: 89, // beach seat
      tile86: {frames: [90, 91, 94], speed: 0.05}, // troll face
      tile87: {frames: [103, 104, 105, 106, 107, 108, 109], speed: 0.1, next:false}, // fish anim
      tile88: 95, // permanently inaccessible water tile
      tile89: 110, // white snow
      tile90: 111, // another try at lava stone end
      tile91: 112, // another try at lava stone end
      tile92: 96, // stone with snow
      tile93: 150, // snowball
      tile94: 151, // snowball
      tile95: 180, // snowball
      tile96: 181, // snowball
      tile97: 97, // snow stone corner
      tile98: 98, // snow stone top
      tile99: 99, // loose stone snow
      tile100: 100, // snow to grass h
      tile101: 115, // snow to grass v
      tile102: 116, // snow to grass crnr 1
      tile103: 117, // snow to grass crn 1 i
      tile104: 118, // crnr 2 i
      tile105: 119, // crnr 2 i
      tile106: 122, // tree snow
      tile107: {frames: [128, 129], speed: 0.05}, // xzibit
      tile108: {frames: [123, 124, 125], speed: 0.5, next:false}, // water stream
      tile109: 126, // frozen sword l
      tile110: 127, // frozen sword r
      tile111: 130, // frozen sword
      tile112: 131, // frozen sword
      tile113: 132, // frozen sword
      tile114: 160, // frozen sword
      tile115: 161, // frozen sword
      tile116: 162, // frozen sword
      tile117: {frames: [113, 114, 133], speed: 0.03}, // wise old man in mountain
      tile118: 134, // ice sword
      tile119: 901, // place holder for the pick axe item
      tile120: 902, // place holder for the inflatable boat item
      tile121: 903, // place holder for the magic boots
      tile122: 141, // the dragons tooth
      tile123: 0, // inaccessible grass tile (volcano)
      tile124: {frames: [135, 136, 137], speed: 0.1}, // lava pit
      tile125: 138, // hint stone volcano
      tile126: 139, // black tile boss fight
      tile127: {frames: [158, 156], speed: 0.1, next:false}, // boss 1
      tile128: {frames: [159, 157], speed: 0.1, next:false}, // boss 2
      tile129: {frames: [188, 186], speed: 0.1, next:false}, // boss 3
      tile130: {frames: [189, 187], speed: 0.1, next:false}, // boss 4
      tile131: 140, // fire ball boss fight
      tile132: 139, // black tile boss fight inaccessible
      tile133: {frames: [126, 127], speed: 0.02}, // duck anim
      tile134: 142, // water lily
      tile135: 143, // water lily flower
      tile136: 144, // bush sun yellow
      tile137: 145, // white flower
      tile138: 146, // bush rain yellow
      tile139: 147, // cooking pot front
      tile140: 148 // enemy cross
    },
    "images": [preload.getResult("world")],
    "frames":
    {
      height:32,
      width:32,
      regX: 16,
      regY: 16
    }
  });
  createFrontend(); // everything is build up, create title screen
}

// title screen
function createFrontend(){

  title02 = preload.getResult("title02");
  title02 = new createjs.Bitmap(title02);
  title02.x = 0 - tilesize / 2;
  title02.y = 0 - tilesize - tilesize / 2 ; // need to correct a bit here since we use the first line for the game gui
  container.addChild(title02);
  lightningbox = new createjs.Shape();
  lightningbox.graphics.beginFill('#733f7c').drawRect(0, 0, 640, 480).endFill();
  lightningbox.alpha = 0;
  lightningbox.x = -16;
  lightningbox.y = -48;
  lightningbox.name = 'lightningbox';
  container.addChild(lightningbox);
  title01 = preload.getResult("title01");
  title01 = new createjs.Bitmap(title01);
  title01.x = 0 - tilesize / 2;
  title01.y = 0 - tilesize - tilesize / 2 ; // need to correct a bit here since we use the first line for the game gui
  container.addChild(title01);
  title03 = preload.getResult("title03");
  title03 = new createjs.Bitmap(title03);
  title03.x = 0 - tilesize / 2;
  title03.y = 0 - tilesize - tilesize / 2 ; // need to correct a bit here since we use the first line for the game gui
  container.addChild(title03);
  raintime = createjs.Ticker.getTime();
  showIntroEffects = true;
  btn_start_bg = new createjs.Shape();
  btn_start_bg.graphics.setStrokeStyle(1, "round").beginStroke("#555").beginFill('#000').drawRect(256, 322, 100, 30).endFill();
  container.addChild(btn_start_bg);
  btn_start = new createjs.Text('start game', "14px Arial", "#aaa");
  btn_start.x = 274;
  btn_start.y = 330;
  container.addChild(btn_start);
  title02.addEventListener("click", function(event) {
    createIntro(); // the listener is put on the title02 image (castle) to make it easier to click on mobile
  });
  createjs.Sound.play("title", {loop: -1}); // not on mobile, it seems
}

// here the various assets for the introduction are set up
function createIntro(){
  dialogueTimer = createjs.Ticker.getTime();
  container.removeAllChildren(); // clean up main container
  introcontainer = new createjs.Container();
  introcontainer.x = introcontainer.y = 0;
  introcontainer.alpha = -1;
  stage.addChild(introcontainer);
  intro02 = preload.getResult("intro02");
  intro02 = new createjs.Bitmap(intro02);
  intro02.x = intro02.y = 0;
  introcontainer.addChild(intro02);
  intro04 = preload.getResult("intro04");
  intro04 = new createjs.Bitmap(intro04);
  intro04.x = intro04.y = 0;
  intro04.alpha = 0;
  introcontainer.addChild(intro04);
  intro01 = preload.getResult("intro01");
  intro01 = new createjs.Bitmap(intro01);
  intro01.x = -215;
  intro01.y = -300;
  intro01.scaleX = 1.2;
  intro01.scaleY = intro01.scaleX;
  introcontainer.addChild(intro01);
  intro03 = preload.getResult("intro03");
  intro03 = new createjs.Bitmap(intro03);
  intro03.x = 0;
  intro03.y = 500;
  introcontainer.addChild(intro03);
  intro05 = preload.getResult("intro05");
  intro05 = new createjs.Bitmap(intro05);
  intro05.x = 0;
  intro05.y = 500;
  intro05.alpha = 2;
  introcontainer.addChild(intro05);
  introCaptionBox = new createjs.Shape();
  introCaptionBox.graphics.beginFill('#000').drawRect(0, 0, 640, 100).endFill();
  introCaptionBox.y = 680;
  introcontainer.addChild(introCaptionBox);
  introCaptionBoxText = new createjs.Text("For years, life was good in the land of Thramor. As a close friend of the King\'s graceful daughter, for you especially life couldn\'t get much better!", "34px Romanesco", "#ddd", "#fff");
  introCaptionBoxText.x = 320;
  introCaptionBoxText.y = 390;
  introCaptionBoxText.lineWidth = 600;
  introCaptionBoxText.lineHeight = 45;
  introCaptionBoxText.textAlign = "center";
  introCaptionBoxText.alpha = -5;
  introcontainer.addChild(introCaptionBoxText);
  introCreated = true; // this triggers the animation callback from the ticker function
}

// this function is called when introduction needs to play, it's a bit messy because of the many transitions going on at the same time
function introCinematics(){

  if(introcontainer.alpha < 1 && intro05.y > 10){introcontainer.alpha += 0.1}
  if(introcontainer.alpha >= 1 && introCaptionBoxText.alpha < 1){
    introCaptionBoxText.alpha += 0.1;
  }
  if(introCaptionBox.y > 380){
    introCaptionBox.y -= 7.5;
    if(introCaptionBox < 380){introCaptionBox.y = 380}
  }
  if(intro01.scaleX > 1){
    intro01.scaleX -= 0.001;
    intro01.scaleY = intro01.scaleX;
  }
  if(intro03.y > 1 && intro04.alpha <= 0){
    introcontainer.alpha = 2;
    intro03.y -= 1;
    if(intro03.y < 200){
      introCaptionBoxText.text = ("Then one day the evil Agagar, a descendant of ancient dragons, decided to make Thramor his new home and demanded full control over the empire.");
    }
  } else {
    introCaptionBoxText.text = ("Naturally, the King refused, but Agagar found a hiding place in an old inactive volcano nearby and recruited an army to bring down the King.");
    if(intro04.alpha < 0.9){
      intro04.alpha += 0.004;
      intro03.y += 2;
    }
    if(intro04.alpha >= 0.9){
      introCaptionBoxText.text = ("The people of Thramor feared this relentless army and fled into the castle from all over the country, causing a situation that worsened every day.");
      if(intro05.y > 0){intro05.y -= 2;}
      if(intro05.y < 100){
        introCaptionBoxText.text=('Until a brave young man (that\'ll be you then) decides to leave the castle to defeat Agagar and prove his worth to the King! ..and to his daughter');
      }
      if(intro05.y <= 10){
        introcontainer.alpha -= 0.01;
        introCaptionBox.alpha -= 0.02;
        introCaptionBoxText.alpha -= 0.03;
        intro05.alpha -= 0.03;
        if(introcontainer.alpha <= 1){
          createjs.Sound.setVolume(1-(1-introcontainer.alpha)); // music fades out here
        }
        if(introcontainer.alpha <= 0){
          introcontainer.removeAllChildren();
          introCreated = false;
          createjs.Sound.setVolume(1);
          startGame();
        }
      }
    }
  }
}

// various functions are called to start up the game
function startGame(){
  player_location = world[world_array_row][world_array_col]; // define player start room
  weathercontainer = new createjs.Container(); // used for rain, snow etc
  weathercontainer.x = weathercontainer.y = 0;
  stage.addChild(weathercontainer);
  weathereffectcontainer = new createjs.Container(); // lightning
  weathereffectcontainer.x = 0; weathereffectcontainer.y = tilesize;
  stage.addChild(weathereffectcontainer);
  createInterface(); // game gui
  createjs.Sound.stop("title");
  createRoom(); // create first room
  createPlayer(); // create player instance
  dialoguecontainer = new createjs.Container();
  dialoguecontainer.x = dialoguecontainer.y = 0;
  stage.addChild(dialoguecontainer);
  hitbox = new createjs.Shape(); // creates flash effect when hit
  hitbox.graphics.beginFill('#fff').drawRect(0, 0, 640, 480).endFill();
  stage.addChild(hitbox);
  hitbox.alpha = 0;
  createDialogue(dialogues[0]); // the first dialogue is shown

  gamestarted = true; // now things are really starting!
}

// the lightning effect on the title screen is reusing parts of the lightning as used in the game
function createIntroLightning(){
  if(!gamestarted){
    if(createjs.Ticker.getTime() - linterval > raintime){
      raintime = createjs.Ticker.getTime();
      la = 1;
    }
    if(     la == 1 && createjs.Ticker.getTime() - (linterval - 250) > raintime && lightningbox.alpha != 0.3) {lightningbox.alpha = 0.3;}
    else if(la == 1 && createjs.Ticker.getTime() - (linterval - 200) > raintime && lightningbox.alpha != 0)   {lightningbox.alpha = 0;}
    else if(la == 1 && createjs.Ticker.getTime() - (linterval - 50)  > raintime && lightningbox.alpha != 0.1) {lightningbox.alpha = 0.1;}
    else {lightningbox.alpha = 0;}
  }
}

// player has died, clean up stuff and show the last dialogue (when that one is closed, page reloads)
function createGameover() {
  container.removeAllChildren(); // clear all tiles
  weathercontainer.removeAllChildren(); // clear all weather effects
  weathereffectcontainer.removeAllChildren();
  weatherList = [];
  lastDialog = []; // dialogues are reset on room exit
  tileArray = [];
  enemyList = [];
  hitbox.alpha = 0; // deed man don't flash
  playercontainer.removeChild(player);
  guicontainer.removeAllChildren();
  gamestarted = false;
  dialogueShowing = true;
  createDialogue(dialogues[28]);
}

// a little joke when player stands around for too long
function createIdleAnim() {
  nyangfx.x += 25;
  if(nyangfx.x > 2000){nyangfx.x=-1000; createjs.Sound.play("nyancat");}
}

// the game gui containing location, title, heart symbols
function createInterface() {
  guibg = preload.getResult("guibg");
  guibg = new createjs.Bitmap(guibg);
  guibg.x = guibg.y = 0;
  guicontainer.addChild(guibg);
  areaname = new createjs.Text(eval("props_room" + player_location)[0][0], "bold 16px Exo", "#fff");
  areaname.x = areaname.y = 10;
  guicontainer.addChild(areaname);
  titlesmall = preload.getResult("titlesmall");
  titlesmall = preload.getResult("titlesmall");
  titlesmall = new createjs.Bitmap(titlesmall);
  titlesmall.x = 293;
  titlesmall.y = 4;
  guicontainer.addChild(titlesmall);
  lifecontainer = new createjs.Container();
  lifecontainer.x = lifecontainer.y = 0;
  guicontainer.addChild(lifecontainer);
  nyangfx = preload.getResult("nyangfx");
  nyangfx = new createjs.Bitmap(nyangfx);
  nyangfx.x = 1900;
  nyangfx.y = 250;
  guicontainer.addChild(nyangfx);
  updateHealthCounter();
}

// builds up hearts based on player health
function updateHealthCounter(){

  lifecontainer.removeAllChildren(); // clean up;

  if(lifecounter > player_strength){
    lifecounter = player_strength;
    hitbox.alpha = 0.8; // since player has just lost a life, show flashing box
  } else if(lifecounter < player_strength) {
    // player has picked up a heart icon
    lifecounter = player_strength;
  }

  // build up heart symbols again
  for(aa = 0; aa < player_strength; aa ++){
    life = new createjs.Sprite(ss_world, "tile7");
    life.x = 623 - ( aa * 26);
    life.y = 17;
    lifecontainer.addChild(life);
  }

  if(player_strength <= 0){createGameover();}
}

// builds up the room and generates the tiles
function createRoom(){
  container.removeAllChildren(); //clear all tiles
  weathercontainer.removeAllChildren(); //clear all weather effects
  weathereffectcontainer.removeAllChildren();
  weatherList = [];
  lastDialog = []; // dialogues are reset on room exit
  tileArray = [];
  enemyList = [];
  checkMusic(); // this used to be in ticker, but here is even better, right?
  stage.update();
  if(player_location == '11' || player_location == '12' || player_location == '17'){snowList = []} // resets snowballs
  if(player_location == '45' || player_location == '42' || player_location == '44'){fishList = []} // resets fish

  // build tiles
  lum = eval("props_room" + player_location)[0][1]; // read from room properties
  curarray = eval("room" + player_location); // just a holder for what the current room array is. saves some cpu time
  for(r = 0; r < curarray.length; r ++){
    for(c = 0; c < curarray[r].length; c ++){
      if(curarray[r][c] > 200){
        bitmap = new createjs.Sprite(ss_volcano, "tile" + curarray[r][c]); // volcano tiles are numbered from 200 on
      } else {
        bitmap = new createjs.Sprite(ss_world, "tile" + curarray[r][c]);
        if(lum < 1){bitmap.alpha = lum / 8}
      }
      bitmap.x = c * tilesize;
      bitmap.y = r * tilesize;
      container.addChild(bitmap);
      tileArray.push(bitmap); // basically this adds all tiles to the array so we can find them back later
    }
  }

  // show area name
  areaname.text = eval("props_room" + player_location)[0][0];

  //build objects
  items =         eval("props_room" + player_location)[1];
  sceneries =     eval("props_room" + player_location)[4];
  interactions =  eval("props_room" + player_location)[3];
  enemies =       eval("props_room" + player_location)[2];

  for(a = 0; a < items.length; a ++){
    new Item(items[a][0], items[a][1], items[a][2]); // x,y,tileid
  }

  for(a=0; a < sceneries.length; a ++){
    new Scenery(sceneries[a][0], sceneries[a][1], sceneries[a][2]); // x,y,tileid
  }

  for(a=0; a < interactions.length; a ++){
    new Interaction(interactions[a][0], interactions[a][1], interactions[a][2], interactions[a][3]); // x,y,tileid,dialogueid
  }

  for(a=0; a < enemies.length; a ++){
    new Enemy(enemies[a][0], enemies[a][1], enemies[a][2], enemies[a][3], enemies[a][4], enemies[a][5]); // x,y,strength,life,speed,tileid
  }
}

function Item(x,y,id){
  itemsprite = new createjs.Sprite(ss_world, "tile"+id);
  itemsprite.x = x * tilesize;
  itemsprite.y = y * tilesize;
  container.addChild(itemsprite);
}

function Enemy(x,y,strength,life,speed,id){
  if(id == 124) {enemysprite = new createjs.Sprite(ss_world, "tile"+id)} else {
    enemysprite = new createjs.Sprite(eval("ss_enemy_"+id)); // the lava pit 'enemy' comes from the world spritesheet
  }
  enemysprite.x = x * tilesize;
  enemysprite.y = y * tilesize;
  enemysprite.life = life;
  enemysprite.strength = strength;
  enemysprite.id = id;
  enemysprite.speed = speed;
  enemyList.push(enemysprite);
  if(id == 4){enemysprite.alpha = 0;}
  container.addChild(enemysprite);
}

function Interaction(x,y,id,dialogue){
  interactsprite = new createjs.Sprite(ss_world, "tile"+id);
  interactsprite.x = x * tilesize;
  interactsprite.y = y * tilesize;
  interactsprite.dialogue = dialogues[dialogue];
  container.addChild(interactsprite);
}

function Scenery(x,y,id){
  scenerysprite = new createjs.Sprite(ss_world, "tile"+id);
  scenerysprite.x = x * tilesize;
  scenerysprite.y = y * tilesize;
  container.addChild(scenerysprite);
}

function createPlayer() {
  playercontainer = new createjs.Container();  // build player container
  playercontainer.y = tilesize + tilesize / 2; // need to correct a bit here since we use the first line for the game gui
  playercontainer.x = tilesize / 2; // need to correct a bit here since we use the first line for the game gui
  stage.addChild(playercontainer);
  player = new createjs.Sprite(ss_player, "stand");
  playercontainer.addChild(player);
  player.x = 2 * tilesize; // start position for first room
  player.y = tilesize * 7;
  player.rotation = 90;
}

// this function creates a popup with dialogue when encountered
function createDialogue(dialogue){
  dialogueTimer = createjs.Ticker.getTime();
  dialoguebg = new createjs.Shape();
  dialoguebg.graphics.setStrokeStyle(5,"round").beginStroke("#aaa").beginFill('#333').drawRect(50,50,540,380).endFill();
  dialoguebg.shadow = new createjs.Shadow("#333", 0, 5, 15);
  dialoguecontainer.addChild(dialoguebg);
  dialogueheader = preload.getResult("dialogueheader");
  dialogueheader = new createjs.Bitmap(dialogueheader);
  dialogueheader.x = 150;
  dialogueheader.y = 80;
  dialoguecontainer.addChild(dialogueheader);
  dialoguetext = new createjs.Text(dialogue, "34px Romanesco", "#ddd");
  dialoguetext.x = 320;
  dialoguetext.y = 130;
  dialoguetext.lineWidth = 460;
  dialoguetext.lineHeight = 50;
  dialoguetext.textAlign = "center";
  createjs.Sound.play("dialogue");
  dialoguecontainer.addChild(dialoguetext);

  advance_bg = new createjs.Shape();
  advance_bg.graphics.beginFill('#333').drawRect(220, 375, 200, 50).endFill();
  dialoguecontainer.addChild(advance_bg);

  advance = new createjs.Text("PRESS SPACE OR CLICK HERE", "14px Arial", "#555");
  advance.x = 320 - advance.getMeasuredWidth() / 2;
  advance.y = 400;
  dialoguecontainer.addChild(advance);
  dialogueShowing = true;
  dialoguecontainer.addEventListener("click", function(event) {
    if(dialogueShowing && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){
      dialogueShowing = false;
      dialoguecontainer.removeAllChildren();
    }
  });
}

// some debugging information
function createDebug(){
  fps = new createjs.Text("fps", "14px Arial", "#fff");
  fps.x = 535;
  fps.y = 12;
  stage.addChild(fps);
}

// the boss fight has its own routine
function bossfight() {

  if(bossfightstarted){

    if(boss_strength < 0){
      //clean up room
      for(fb = 0; fb < fireballList.length; fb ++){
        container.removeChild(fireballList[fb]);
      }
      for(bl = 0; bl < bossList.length; bl ++){
        container.removeChild(bossList[bl])
      }
      bossList = [];
      // leave tooth behind
      props_room112[1].push([1, 8, 122,'The Dragons Tooth']);
      // open up left wall permanently
      for(rw=1; rw<room112.length-1; rw ++){
        room112[rw].splice(0, 1, 126);
      }
      // make sure boss fight never starts again
      bossDefeated = true;
      // reload room
      createRoom();
    }

    if(fireballList.length > 0){
      //shooting fireball
      for(fb = 0; fb < fireballList.length; fb ++){

        fireballList[fb].x += 10;
        //check if fireball hits player
        if((Math.floor(fireballList[fb].x / tilesize) == player.x / tilesize) && (Math.floor(fireballList[fb].y / tilesize) == player.y/ tilesize)) {player_strength -= 0.3; updateHealthCounter();}
        if(fireballList[fb].x > 700){
          container.removeChild(fireballList[fb]);
          fireballList.splice(fb);
          for(bl=0; bl<bossList.length; bl ++){
            container.removeChild(bossList[bl])
          }
          bossList = [];
        }
      }
    } else {
      // creating fireballs
      createjs.Sound.play("dragon");
      newy=(Math.floor(352 * Math.random() / tilesize) * tilesize)
      fbsprite = new createjs.Sprite(ss_world, "tile131");
      fbsprite.x = tilesize;
      fbsprite.y = tilesize + newy;
      fireballList.push(fbsprite);
      container.addChild(fbsprite);
      fbsprite = new createjs.Sprite(ss_world, "tile131");
      fbsprite.x = tilesize;
      fbsprite.y = 2 * tilesize+newy;
      fireballList.push(fbsprite);
      container.addChild(fbsprite);

      //creating boss sprites if needed
      if(bossList.length < 1){
        bosssprite1 = new createjs.Sprite(ss_world, "tile127");
        bossList.push(bosssprite1);
        container.addChild(bosssprite1);
        bosssprite2 = new createjs.Sprite(ss_world, "tile128");
        bossList.push(bosssprite2);
        container.addChild(bosssprite2);
        bosssprite3 = new createjs.Sprite(ss_world, "tile129");
        bossList.push(bosssprite3);
        container.addChild(bosssprite3);
        bosssprite4 = new createjs.Sprite(ss_world, "tile130");
        bossList.push(bosssprite4);
        container.addChild(bosssprite4);
      }

      // moving position of boss sprites accordingly
      bossList[0].x = 0;
      bossList[0].y = fbsprite.y - tilesize;
      bossList[1].x = tilesize;
      bossList[1].y = fbsprite.y - tilesize;
      bossList[2].x = 0;
      bossList[2].y = fbsprite.y;
      bossList[3].x = tilesize;
      bossList[3].y = fbsprite.y;

    }

    //check if player is hitting boss
    if(bossList.length > 0){
      if((parseInt(player.x / tilesize) == 1) && ((parseInt(player.y / tilesize) == bossList[0].y / tilesize) || (parseInt(player.y / tilesize) == bossList[2].y / tilesize))){bossInVicinity = true} else {bossInVicinity = false;} // the actual required action is handled elsewhere
    }

  } else {

    startx = -100;

    //creating boss sprites if needed
    if(bossList.length < 1){
      bosssprite1 = new createjs.Sprite(ss_world, "tile127");
      bosssprite1.y = 230;
      bosssprite1.x = startx;
      bossList.push(bosssprite1);
      container.addChild(bosssprite1);
      bosssprite2 = new createjs.Sprite(ss_world, "tile128");
      bosssprite2.y = 230;
      bosssprite2.x = startx + tilesize;
      bossList.push(bosssprite2);
      container.addChild(bosssprite2);
      bosssprite3 = new createjs.Sprite(ss_world, "tile129");
      bosssprite3.y = 262;
      bosssprite3.x = startx;
      bossList.push(bosssprite3);
      container.addChild(bosssprite3);
      bosssprite4 = new createjs.Sprite(ss_world, "tile130");
      bosssprite4.y = 262;
      bossList.push(bosssprite4);
      bosssprite4.x = startx + tilesize;
      container.addChild(bosssprite4);
    }

    if(bossList[0].x < 0){
      for(bi = 0; bi < bossList.length; bi ++){
        bossList[bi].x += 1;
      }
    } else {
      bossfightstarted = true;
    }

  }
}

// the credit roll at the end of the game is a little sine hscroller
function createCredits(){
  if(!creditsinitiated){
    creditstext = "       You have been playing a game designed & written by rvo in 2014. Well, since you have just completed it, I really hope you enjoyed the game! For me it was a nice learning experience, that I thoroughly enjoyed from start to end. Now saying hi to friends and family: hi!";
    credits = new createjs.Text(creditstext, "14px Arial", "#fff");
    credits.x = 600;
    credits.y = 405;
    container.addChild(credits);
    creditsinitiated = true;
  } else {
    credits.x -= 2.5;
    credits.y += Math.sin(creditsSine) / 3;
    creditsSine += 0.1;
    credits.alpha = (2 + Math.sin(creditsSine)) / 2;
    if(credits.x <- 100 - credits.getMeasuredWidth()){credits.x = 600}
  }
}

// fish are generated on water tiles and are used for the fishing mini game
function createFish(){
  if(waitingForFishAnimToFinishCounter <= 0 && parseInt(Math.random() * 50) == 1){ // this sort of randomizes the encounters of fish without eating up cpu time
    for(fc = 0; fc < fishList.length; fc ++){
      container.removeChild(fishList[fc]); // clean up old instances
    }
    xx = parseInt ((640 * Math.random()) / tilesize);
    yy = parseInt ((480 * Math.random()) / tilesize);

    if(xx != parseInt(player.x / tilesize) || yy != parseInt(player.y / tilesize)){ // make sure fish is not generated on top of player
      itemsprite = new createjs.Sprite(ss_world, "tile87");
      itemsprite.x = xx * tilesize;
      itemsprite.y = yy * tilesize;
      fishList.push(itemsprite);
      container.addChild(itemsprite);
      waitingForFishAnimToFinishCounter = 50;
    }
  } else if(waitingForFishAnimToFinishCounter > 0){
    waitingForFishAnimToFinishCounter --;
  }
}

// snowballs roll down in certain Icy Mountain rooms
function createSnowball(){

  if(snowList.length < 1){

    // if no snowball rolling, create snowball sprite
    xx = parseInt(564 / tilesize);
    yy = parseInt (((480 - 3 * tilesize) * Math.random()) / tilesize);
    if(xx != player.x / tilesize || yy != player.y / tilesize){ // make sure snowball is not generated on top of player
      sinesnow = (3.14 / 2) * Math.random(); // by starting with half a Pi the initial movement is always downwards. I could eat half a Pi right now
      snowinc = 5; // the initial multiplier of bounce movement
      snowsprite1 = new createjs.Sprite(ss_world, "tile93");
      snowsprite1.x = xx * tilesize;
      snowsprite1.y = yy * tilesize;
      snowList.push(snowsprite1);
      container.addChild(snowsprite1);
      snowsprite2 = new createjs.Sprite(ss_world, "tile94");
      snowsprite2.x = xx * tilesize + tilesize;
      snowsprite2.y = yy * tilesize;
      snowList.push(snowsprite2);
      container.addChild(snowsprite2);
      snowsprite3 = new createjs.Sprite(ss_world, "tile95");
      snowsprite3.x = xx * tilesize;
      snowsprite3.y = yy * tilesize + tilesize;
      snowList.push(snowsprite3);
      container.addChild(snowsprite3);
      snowsprite4 = new createjs.Sprite(ss_world, "tile96");
      snowsprite4.x = xx * tilesize + tilesize;
      snowsprite4.y = yy * tilesize + tilesize;
      snowList.push(snowsprite4);
      container.addChild(snowsprite4);
    }
  } else {
    for(sl = 0; sl < snowList.length; sl ++){
      sinesnow += 0.05; // sinewave takes care of the bouncy stuff
      snowList[sl].x -= 5; // speed
      snowinc -= (snowinc / 200); // this makes sure the bounce strength is decreased
      snowList[sl].y = snowList[sl].y + (snowinc * Math.sin(sinesnow));
      if(snowList[sl].x <- 64){
        for(sm = 0; sm < snowList.length; sm ++){
          container.removeChild(snowList[sm]);
        }
        snowList = [];
        break;
      } else {
        // check for colissions
        if(parseInt(snowList[sl].x / tilesize) == parseInt(player.x / tilesize) && parseInt(snowList[sl].y / tilesize) == parseInt(player.y / tilesize)){ // hit!
          for(sm = 0; sm < snowList.length; sm ++){ // remove all 4 snowball sprites
            container.removeChild(snowList[sm]);
          }
          snowList = [];
          player_strength -= 0.3;
          createjs.Sound.play("player-hit");
          updateHealthCounter();
          break;
        }
      }
    }
  }

}

// this function is used for dark rooms (no pun intended) where tiles surrounding the player are illuminated
function illuminate(){

  if(gamestarted){

    lum = eval("props_room" + player_location)[0][1]; // read luminance level from room properties

    // reset lighting for all tiles
    for(a = 0; a < tileArray.length; a ++){
      tileArray[a].alpha = lum / 8 ;
    }

    // gets statistics for player position
    if(!newapy){newapy = Math.ceil((player.y - speed) / tilesize); newapx = Math.ceil((player.x - speed) / tilesize)}
    c = tileArray.length;
    d = parseInt((newapy * htiles) + newapx);

    // illuminate tiles surrounding the player by increasing their alpha value
    if (typeof oldtime != 'undefined'){
      if(createjs.Ticker.getTime() - 100 > oldtime){ // every 100 ticks the alpha of the surrounding tiles is randomized
        r = Math.random() / 10;
        oldtime = createjs.Ticker.getTime();
      }
    } else {
      oldtime = createjs.Ticker.getTime();
      r = Math.random() / 10;
    }

    // some shorthand equations to save cpu time
    b1 = lum / 1.5 + r;
    b2 = lum / 2 + r;
    b3 = lum / 2.5 + r;

    b = d;                if(b > 0 && b < c){tileArray[b].alpha = b1}
    b = d + 1;            if(b > 0 && b < c && newapx < 19){tileArray[b].alpha = b1}
    b = d - 1;            if(b > 0 && b < c && newapx > 0){tileArray[b].alpha = b1}
    b = d + htiles;       if(b > 0 && b < c){tileArray[b].alpha = b1}
    b = d - htiles;       if(b > 0 && b < c){tileArray[b].alpha = b1}
    b = d + (htiles + 1); if(b > 0 && b < c && newapx < 19){tileArray[b].alpha = b2}
    b = d - (htiles + 1); if(b > 0 && b < c && newapx > 0){tileArray[b].alpha = b2}
    b = d + (htiles - 1); if(b > 0 && b < c && newapx > 0){tileArray[b].alpha = b2}
    b = d - (htiles - 1); if(b > 0 && b < c && newapx < 19){tileArray[b].alpha = b2}
    b = d + 2;            if(b > 0 && b < c && newapx < 18){tileArray[b].alpha = b3}
    b = d - 2;            if(b > 0 && b < c && newapx > 1){tileArray[b].alpha = b3}
    b = d + (2 * htiles); if(b > 0 && b < c){tileArray[b].alpha = b3}
    b = d - (2 * htiles); if(b > 0 && b < c){tileArray[b].alpha = b3}

    stage.update();

  }
}

function rain(){

  if(createjs.Ticker.getTime() - lrinterval > raintime){
    lrinterval = 5000 + 5000 * Math.random(); // after how many ms is lightning shown?}
    createjs.Sound.play("thunder");
    weathercontainer.removeAllChildren();
    raintime = createjs.Ticker.getTime();
    lightningbox = new createjs.Shape();
    lightningbox.graphics.beginFill('#fff').drawRect(0,0,640,480).endFill();
    lightningbox.alpha = 0;
    lightningbox.name = 'lightningbox';
    weathercontainer.addChild(lightningbox);
    la = 1;
  }

  if(lrinterval == 0){
    lrinterval = 5000 + 5000 * Math.random(); // after how many ms is lightning shown?}
  }

  // creates some flashing boxes to simulate lightning
  if(la == 1 && createjs.Ticker.getTime() - (lrinterval - 250) > raintime && lightningbox.alpha != 0.7) {lightningbox.alpha = 0.7;}
  if(la == 1 && createjs.Ticker.getTime() - (lrinterval - 200) > raintime && lightningbox.alpha != 0) {lightningbox.alpha = 0;}
  if(la == 1 && createjs.Ticker.getTime() - (lrinterval - 50) > raintime && lightningbox.alpha != 0.4) {lightningbox.alpha = 0.4;}

  var weatherparticle = new createjs.Shape();
  weatherList.push(weatherparticle);
  weathereffectcontainer.addChild(weatherparticle);

  if(weatherList.length >= 10){
    weathereffectcontainer.removeChild(weatherList[weatherList.length - 10]);
  }

  rainx = parseInt(640 * Math.random());
  rainy = parseInt(480 * Math.random());
  weatherparticle.alpha = 0.5;
  weatherparticle.graphics.setStrokeStyle(0.5,"round").beginStroke("#ccc")
    .moveTo(rainx,rainy)
    .lineTo(rainx - 30,rainy + 60)
    .closePath();
}


// snow flakes falling down. really hard to see on a white background.
function snow(){

  if(weatherList.length < 1){

    snowsine = 3.14;

    for(f = 0; f < 100; f ++){
      posx = 640 * Math.random();
      posy = (480 - tilesize) * Math.random();
      weatherparticle = new createjs.Shape();
      weatherparticle.graphics.setStrokeStyle(0.1, "round", ignoreScale = true).beginStroke("#eeeeee").beginFill(createjs.Graphics.getRGB(255,255,255)).drawCircle(0,0,1).closePath();
      weatherparticle.scaleX = 10 * Math.random();
      weatherparticle.scaley = weatherparticle.scaleX;
      weatherparticle.x = posx;
      weatherparticle.y = posy;
      weatherList.push(weatherparticle);
      weathereffectcontainer.addChild(weatherparticle);
    }
  }

  for(f = 0; f < weatherList.length; f ++){
    weatherList[f].scaleX -= 0.1;
    weatherList[f].x += Math.sin(snowsine) / ((10 - weatherList[f].scaleX) * 1.5);
    weatherList[f].y += (weatherList[f].scaleX / 20);
    if(weatherList[f].scaleX > 9 && weatherList[f].scaleX < 10){weatherList[f].alpha = 1 - (weatherList[f].scaleX - 9)};
    if(weatherList[f].scaleX < 0){
      weatherList[f].scaleX = 10;
      weatherList[f].alpha = 0;
      weatherList[f].x = 640 * Math.random();
      weatherList[f].y = (480 - tilesize) * Math.random();
    }
    weatherList[f].scaleY = weatherList[f].scaleX;
  }

  snowsine += 0.05;

}

// this is in the volcano area where small bits of fire / lumps of lava are popping up around the player
function lava(){

  if(weatherList.length < 1){

    sincount = 0;

    for(f = 0; f < 25; f ++){
      posx = 640 * Math.random();
      posy = 480 * Math.random();
      scale = Math.random();
      weatherparticle = new createjs.Shape();
      weatherparticle.graphics.setStrokeStyle(0.5,"round").beginStroke("#ff0000").beginFill(createjs.Graphics.getRGB(240, 220, 90)).drawCircle(0, 0, scale).closePath();
      weatherparticle.regX = weatherparticle.regY = scale / 2;
      weatherparticle.sinstart = 3.14 * Math.random(); // doesnt make sense to go lower (or higher) than Pi for a sinewave
      weatherparticle.starty = posy;
      weatherparticle.x = posx;
      weatherparticle.y = posy;
      weatherList.push(weatherparticle);
      weathereffectcontainer.addChild(weatherparticle);
    }
  }

  sincount += 0.12;

  for(f = 0; f < weatherList.length; f ++){
    weatherList[f].scaleX = (1 + Math.sin(sincount + weatherList[f].sinstart));
    weatherList[f].y = weatherList[f].starty - ( 10 - (weatherList[f].sinstart)) * (Math.sin(sincount + weatherList[f].sinstart));
    weatherList[f].scaleY = weatherList[f].scaleX;
  }

}

// enemy checking was too complex to keep it in the general colission function
function checkEnemy(){

  // does room have enemies?
  enemies = eval("props_room" + player_location)[2];
  if(enemies.length > 0){

    for(el=0;el<enemyList.length;el++){
      if(

        (  ((parseInt(enemyList[el].x / tilesize)     ) == parseInt(player.x / tilesize)) && ((parseInt(enemyList[el].y / tilesize)     ) == parseInt(player.y / tilesize))                                ) ||
          (  ((parseInt(enemyList[el].x / tilesize)     ) == parseInt(player.x / tilesize)) && ((parseInt(enemyList[el].y / tilesize) - 1 ) == parseInt(player.y / tilesize)) && (player.rotation == 180)    ) ||
          (  ((parseInt(enemyList[el].x / tilesize)     ) == parseInt(player.x / tilesize)) && ((parseInt(enemyList[el].y / tilesize) + 1 ) == parseInt(player.y / tilesize)) && (player.rotation == 0)      ) ||
          (  ((parseInt(enemyList[el].x / tilesize) - 1 ) == parseInt(player.x / tilesize)) && ((parseInt(enemyList[el].y / tilesize)     ) == parseInt(player.y / tilesize)) && (player.rotation == 90)     ) ||
          (  ((parseInt(enemyList[el].x / tilesize) + 1 ) == parseInt(player.x / tilesize)) && ((parseInt(enemyList[el].y / tilesize)     ) == parseInt(player.y / tilesize)) && (player.rotation == 270)    )

        ){
        if(spaceHeld){
          if(player_inventory.indexOf(118,0) >= 0){

            if(enemyHit != true) {
              enemyHit = true; // this var is set so holding space does not result in enemy energy draining with very high speed. the var is reset after every time it goes into stance animation, which happens right after yielding the sword
              enemyList[el].life -= 1;
              console.log('drain 1');
              if(enemyList[el].id != 4 && enemyList[el].id != 124){ // spiders and pots dont say Oompf
                createjs.Sound.play("enemy-hit");
              }
            }
          } else {
            if(enemyHit != true) {
              enemyHit = true;
              enemyList[el].life -= 0.5;
              console.log(player_inventory);
              if(enemyList[el].id != 4 && enemyList[el].id != 124){ // spiders and pots dont say Oompf
                createjs.Sound.play("enemy-hit");
              }
            }
          }
          if(enemyList[el].life <= 0){
            if(enemyList[el].id == '124'){ // the room that opens the room to the dragon
              props_room110[2].splice(0, 1); // permanently removing lava pit from this room
              room110[13].splice(15, 0, 139); // permanently opening up passageway
              createRoom(); // resetting room so the tile below is now gone
            } else {
              // putting tombstone where enemy died
              enemydead = new createjs.Sprite(ss_world, "tile140");
              enemydead.x = parseInt(enemyList[el].x / tilesize) * tilesize;
              enemydead.y = parseInt(enemyList[el].y / tilesize) * tilesize;
              container.addChild(enemydead);
              if(enemyList[el].id != 4 && enemyList[el].id != 124){
                createjs.Sound.play("enemy-dead"); // spiders and pots dont say Oompf
              }
              //remove enemy from screen and enemyList
              container.removeChild(enemyList[el]);
              enemyList.splice(0, 1);
            }
            break;
          }
        }

      }

    }
  }

}

// enemy movement is not the most intelligent, but this routine takes care enemies cannot walk through tiles with objects, or on tiles that the player cannot access either
function moveEnemy(){

  for(en = 0; en < enemyList.length; en ++){

    // for the cave levels, the enemies needed their alpha tweaked
    if(enemyList[en].id == 4){
      if(player.x > enemyList[en].x){xdiff = player.x - enemyList[en].x} else {xdiff = enemyList[en].x - player.x}
      if(player.y > enemyList[en].y){ydiff = player.y - enemyList[en].y} else {ydiff = enemyList[en].y - player.y}
      if(xdiff >= ydiff){diff = xdiff} else {diff = ydiff}
      enemyList[en].alpha = 0.5 - (parseInt(diff / tilesize) / 14);
    }

    // check to see if enemy is close enough to fight player
    /*
     schematically, it goes a little like this, but remember that some values need proper ceil/floor rounding before they'll work!
     (x     == player.x && y     == player.y) ||
     (x + 1 == player.x && y     == player.y) ||
     (x - 1 == player.x && y     == player.y) ||
     (x     == player.x && y + 1 == player.y) ||
     (x     == player.x && y - 1 == player.y)
     */

    if(
      ((parseInt(enemyList[en].x/tilesize)                   == newapx) && (parseInt(enemyList[en].y/tilesize)                   == newapy)) ||
        (((parseInt(Math.floor(enemyList[en].x/tilesize)) + 1) == newapx) && (parseInt(enemyList[en].y/tilesize)                   == newapy)) ||
        (((parseInt(Math.ceil(enemyList[en].x/tilesize)) - 1)  == newapx) && (parseInt(enemyList[en].y/tilesize)                   == newapy)) ||
        ((parseInt(enemyList[en].x/tilesize)                   == newapx) && ((parseInt(Math.floor(enemyList[en].y/tilesize)) + 1) == newapy)) ||
        ((parseInt(enemyList[en].x/tilesize)                   == newapx) && ((parseInt(Math.ceil(enemyList[en].y/tilesize)) - 1)  == newapy))
      ) {

      // able to hit player!

      // set rotation
      if(player.x < enemyList[en].x){enemyList[en].rotation = 270}
      if(player.x > enemyList[en].x){enemyList[en].rotation = 90}
      if(player.y < enemyList[en].y){enemyList[en].rotation = 0}
      if(player.y > enemyList[en].y){enemyList[en].rotation = 180}

      // playing fight animation
      if(enemyList[en].currentAnimation != "fight" && enemyList[en].currentAnimation != "stance" ){
        enemyList[en].gotoAndPlay("fight");
      }
      if(enemyList[en].currentAnimation == "fight" && swordAnimActive == 0) {
        swordAnimActive = 1;
      }

      if(enemyList[en].currentAnimation == "stance" && swordAnimActive == 1) {
        swordAnimActive = 0;
        player_strength -= (enemyList[en].strength / 2);
        createjs.Sound.play("player-hit");
        updateHealthCounter();
      }
    } else {

      // not able to hit player!

      // calculate movement
      enx = enemyList[en].x;
      eny = enemyList[en].y;

      //when moving y, make sure x is rounded off, and vice versa
      if(enemyList[en].y > player.y){roundedeny = Math.floor(enemyList[en].y / tilesize) * tilesize} else {roundedeny = Math.ceil(enemyList[en].y / tilesize) * tilesize}
      if(enemyList[en].x > player.x){roundedenx = Math.floor(enemyList[en].x / tilesize) * tilesize} else {roundedenx = Math.ceil(enemyList[en].x / tilesize) * tilesize}

      enemy_walkable_tiles = walkable_tiles[0];
      enemy_walkable_tiles.push(89); // make snow tile by default walkable for enemies

      // note: the direction of enemy's movement has to be rounded off to the max of that direction. this means floor if moving to left or top, ceil of moving down or right.
      if      ( (player.x > enemyList[en].x) && (enemy_walkable_tiles.indexOf(curarray[parseInt(eny / tilesize)][Math.ceil((enx + enemyList[en].speed) / tilesize)],0) >= 0) )  { enemyList[en].x += enemyList[en].speed; enemyList[en].y = roundedeny; enemyList[en].rotation = 90;  if(enemyList[en].currentAnimation != "walk"){enemyList[en].gotoAndPlay("walk")}; if(player.x < enemyList[en].x){enemyList[en].x = player.x}}
      else if ( (player.x < enemyList[en].x) && (enemy_walkable_tiles.indexOf(curarray[parseInt(eny / tilesize)][Math.floor((enx - enemyList[en].speed) / tilesize)],0) >= 0) ) { enemyList[en].x -= enemyList[en].speed; enemyList[en].y = roundedeny; enemyList[en].rotation = 270; if(enemyList[en].currentAnimation != "walk"){enemyList[en].gotoAndPlay("walk")}; if(player.x > enemyList[en].x){enemyList[en].x = player.x}}
      else if ( (player.y > enemyList[en].y) && (enemy_walkable_tiles.indexOf(curarray[Math.ceil((eny + enemyList[en].speed) / tilesize)][parseInt(enx / tilesize)],0) >= 0) )  { enemyList[en].y += enemyList[en].speed; enemyList[en].x = roundedenx; enemyList[en].rotation = 180; if(enemyList[en].currentAnimation != "walk"){enemyList[en].gotoAndPlay("walk")}; if(player.y < enemyList[en].y){enemyList[en].y = player.y}}
      else if ( (player.y < enemyList[en].y) && (enemy_walkable_tiles.indexOf(curarray[Math.floor((eny - enemyList[en].speed) / tilesize)][parseInt(enx / tilesize)],0) >= 0) ) { enemyList[en].y -= enemyList[en].speed; enemyList[en].x = roundedenx; enemyList[en].rotation = 0;   if(enemyList[en].currentAnimation != "walk"){enemyList[en].gotoAndPlay("walk")}; if(player.y > enemyList[en].y){enemyList[en].y = player.y}}
      else    { enemyList[en].gotoAndPlay("stand"); }

    }
  }
}

// a general collision function that takes care of player hitting objects, enemies, or interactives (dialogues)
function checkCollisions() {

  // check for items
  items = eval("props_room" + player_location)[1];
  if(items.length > 0){
    for(it = 0; it<items.length; it ++){
      if(items[it][0] == parseInt(player.x / tilesize) && items[it][1] == parseInt(player.y / tilesize)){ // we use parseint since x,y is only rounded off when player moves in y,x direction!

        // handle pickup of ice sword
        if(items[it][2] == 118){
          if(player_inventory.indexOf(119,0) >= 0){ // owns the pick axe ?
            createjs.Sound.play("ping");
            createDialogue("You have picked up " + items[it][3]);
            player_inventory.push(items[it][2]);
            items.splice(it, 1);
            createRoom();
          }
        } else {
          createjs.Sound.play("ping");
          createDialogue("You have picked up " + items[it][3]);
          if(items[it][3].indexOf('Thanks for finding my glasses',0) >= 0){if(player_inventory.indexOf(121,0) < 0){player_inventory.push(121); speed = 6;}} // here player is given magic boots after reading the changed wizard dialogue}
          player_inventory.push(items[it][2]);
          // handle pickup of heart icon
          if(items[it][2] == 7){player_strength ++; updateHealthCounter();}
          // handle pickup of magic boots & wizard glasses
          if(items[it][2] == 32){
            props_room95[3].splice(0,1); // remove whining about glasses by wizard when picked up glasses
            props_room95[1].push([16,3,8,'a pair of Magic Boots. \nThe Wizard says: Thanks for finding my glasses! Here are my Magic Boots. With these on finding your way around Icy Mountain should be much easier. They will make you walk faster, too.']); // add line about magic boots
          }
          if(items[it][2] != 118){items.splice(it, 1);} // remove picked up item from array. ensures items can only be picked up once.
          createRoom(); //creating the room simply wipes everything, except the player. since item is removed from room properties, it wont reappear.
        }

      }
    }
  }

  // fishing is a colission too. for each fish in fishList, check if its x, y matches that of the player. if so, consider fish caught and update fishCaught count
  if(player_location == '45' || player_location == '42' || player_location == '44'){
    for(ff = 0; ff < fishList.length; ff ++){ // there is only 1 fish visible at any time so this wasnt really needed. but its a good habit to stuff things in a display list anyway
      if((fishList[ff].x / tilesize) == parseInt(player.x / tilesize) && (fishList[ff].y / tilesize) == parseInt(player.y / tilesize)  ){
        fishCaught ++;
        createjs.Sound.play("ping");
        if(fishCaught >= 10 && fishMissionStarted){createDialogue('I think I\'ve got enough fish now to Feed The Troll');}
        container.removeChild(fishList[ff]);
        fishList.splice(ff,1);
      }
    }
  }

  // check for interactions
  interactions = eval("props_room" + player_location)[3];
  if(interactions.length > 0){
    for(il = 0; il < interactions.length; il ++){
      if(interactions[il][0] == parseInt(player.x / tilesize) && interactions[il][1] == parseInt(player.y / tilesize) && lastDialog.indexOf(interactions[il][3]) < 0){ // using parseint since x,y is only rounded off when player moves in y,x direction!

        if(interactions[il][3] == 6 ){ // if talking to troll
          if(fishCaught >= 10 && fishMissionStarted == true){ // does player have enough fish?
            createDialogue(dialogues[22]); // switch dialog and add pickaxe to item list
            player_inventory.push(119);
          } else {
            fishMissionStarted = true; // if not enough fish caught or mission wasnt started yet, ensure it is started
            createDialogue(dialogues[(interactions[il][3])]); // show general troll dialogue first (if already 10 fish in posession, dialogue will change when encountering troll for second time
          }
        }

        else if (interactions[il][3] == 5 ) { // if talking to naked man
          if(player_inventory.indexOf(120,0) < 0){ // does player have inflatable boat?
            player_inventory.push(120);
            createDialogue(dialogues[(interactions[il][3])]);
          } else {
            createDialogue(dialogues[24]); // if so, alternative dialogue shown
          }
        }

        else if (interactions[il][3] == 7 ) { // if trying to enter volcano
          if(player_inventory.indexOf(118,0) < 0){ // does player have ice sword?
            createDialogue(dialogues[(interactions[il][3])]); // if no, tell player to go away
          } else {
            if(walkable_tiles[0].indexOf(123,0) < 0){walkable_tiles[0].push(123);} // if yes, push inaccesible grass tile (123) to walkable tile list
            createDialogue(dialogues[26]);// and show alt dialogue
          }
        }

        else if (interactions[il][3] == 9 ) { // if trying to cross bridge
          if(player_inventory.indexOf(122,0) < 0){ // does player have dragon's tooth?
            createDialogue(dialogues[9]); // if no, tell player to go away
          } else {
            createDialogue(dialogues[10]); // if yes, show alt dialogue
            props_room40[3].splice(0,1); // remove dialogue from this room
            room40[7].splice(11,1,47); // remove troll from this room
            createRoom(); // refresh room to reflect
          }
        }

        else if (interactions[il][3] == 12 ) {
          createDialogue(dialogues[(interactions[il][3])]);
          creditsroll = true;
        } else {
          createDialogue(dialogues[(interactions[il][3])]);  // create normal dialogue
        }

        lastDialog.push(interactions[il][3]); // this ensures the dialog can only be opened once per room. it resets when the room is recreated.
      }
    }
  }
}

// does player have the boat and is player on a tile that requires one?
function checkBoat(){
  if(curarray[newapy][newapx] == 38 || curarray[newapy][newapx] == 133 || curarray[newapy][newapx] == 134 || curarray[newapy][newapx] == 135){
    if(player.currentAnimation != "boat"){
      player.gotoAndPlay("boat");
    } else {
      waterstream = new createjs.Sprite(ss_world, "tile108");
      waterstream.x = player.x;
      waterstream.y = player.y;
      waterstream.rotation = player.rotation - 270;
      waterstreamList.push(waterstream);
      container.addChild(waterstream);
      if(waterstreamList.length > 10){
        container.removeChild(waterstreamList[waterstreamList.length - 10]);
        waterstreamList.splice(waterstreamList.length - 10, 1);
      }
    }
  }
  if(    (curarray[newapy][newapx] != 38 && curarray[newapy][newapx] != 133 && curarray[newapy][newapx] != 134 && curarray[newapy][newapx] != 135) && player.currentAnimation == "boat"){
    player.gotoAndPlay("walk");
  }
}

function checkMusic(){
  if(oldloc != eval("props_room" + player_location)[0][0]) {
    if(oldloc == "WOODLANDS" && (eval("props_room" + player_location)[0][0] == "WOODLANDS" || eval("props_room" + player_location)[0][0] == "GREAT LAKE" || eval("props_room" + player_location)[0][0] == "CASTLE AREA")){
    }
    else if(oldloc == "GREAT LAKE" && (eval("props_room" + player_location)[0][0] == "WOODLANDS" || eval("props_room" + player_location)[0][0] == "GREAT LAKE" || eval("props_room" + player_location)[0][0] == "CASTLE AREA")){
    }
    else if(oldloc == "CASTLE AREA" && (eval("props_room" + player_location)[0][0] == "WOODLANDS" || eval("props_room" + player_location)[0][0] == "GREAT LAKE" || eval("props_room" + player_location)[0][0] == "CASTLE AREA")){
    }
    else {
      //music needs to change
      createjs.Sound.stop("open");
      createjs.Sound.stop("icymountain");
      createjs.Sound.stop("volcano");
      createjs.Sound.stop("forest");
      createjs.Sound.stop("cavern");
      createjs.Sound.stop("guile");
      createjs.Sound.stop("castle");
      if(eval("props_room" + player_location)[0][0] == "WOODLANDS"){createjs.Sound.play("open", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "GREAT LAKE"){createjs.Sound.play("open", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "CASTLE AREA"){createjs.Sound.play("open", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "ICY MOUNTAIN"){createjs.Sound.play("icymountain", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "VOLCANO"){createjs.Sound.play("volcano", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "FOREST"){createjs.Sound.play("forest", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "CAVERN"){createjs.Sound.play("cavern", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "BOSS FIGHT"){createjs.Sound.play("guile", {loop: -1, volume: 0.5})}
      if(eval("props_room" + player_location)[0][0] == "CASTLE"){createjs.Sound.play("castle", {loop: -1, volume: 0.5})}
    }
    oldloc = eval("props_room" + player_location)[0][0];
  }
}

function handleKeyDown(e) {
  if(gamestarted){
    if(gamestarted){idleTimeout = createjs.Ticker.getTime();}
    leftHeld = false; rightHeld = false; upHeld = false; downHeld = false; spaceHeld = false;
    if(!e){var e = window.event;}
    if(e.keyCode == KEYCODE_SPACE || e.keyCode == KEYCODE_CTRL){
      spaceHeld = true;
      if(bossInVicinity == true){boss_strength -= 0.3;}
      animPlaying = false;
      if(dialogueShowing && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){
        dialogueShowing = false;
        dialoguecontainer.removeAllChildren();
      } else {
        if(player.currentAnimation != "boat"){ // no fighting in the boat, please
          if(player_inventory.indexOf(118,0) >= 0){
            if(player.currentAnimation != "swordfight"){player.gotoAndPlay("swordfight"); enemyHit = false; createjs.Sound.play("swoosh");}
            checkEnemy();
          } else {
            if(player.currentAnimation != "fight"){player.gotoAndPlay("fight"); enemyHit = false; createjs.Sound.play("swoosh");}
            checkEnemy();
          }
        }
      }

      stage.update();
      spaceHeld = false;

    } else if (!dialogueShowing) { // this 'else' prevents player from moving when fighting
      switch(e.keyCode) {
        case KEYCODE_LEFT:	leftHeld  = true; player.rotation = 270; break;
        case KEYCODE_A:	    leftHeld  = true; player.rotation = 270; break;
        case KEYCODE_RIGHT: rightHeld = true; player.rotation = 90; break;
        case KEYCODE_D:     rightHeld = true; player.rotation = 90; break;
        case KEYCODE_UP:	  upHeld    = true; player.rotation = 0; break;
        case KEYCODE_W:	    upHeld    = true; player.rotation = 0; break;
        case KEYCODE_DOWN:  downHeld  = true; player.rotation = 180; break;
        case KEYCODE_S:     downHeld  = true; player.rotation = 180; break;
        case KEYCODE_I:     debug     = true; createDebug(); break;
      }
      if(!animPlaying && (leftHeld || rightHeld || upHeld || downHeld) && !spaceHeld){animPlaying = true; player.gotoAndPlay("walk")} //show walk anim unless already showing, or fighting
    }
  }
  if(!gamestarted && dialogueShowing && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){
    // player has died and wants to restart
    location.reload();
  }
  if(!gamestarted && introCreated && ((createjs.Ticker.getTime()) - 3000 > dialogueTimer)){introcontainer.removeAllChildren();introCreated = false; startGame(); spaceHeld = false;} // player wants to skip intro
}

function handleKeyUp(e) {
  if(gamestarted){
    if(nyangfx.x > -1000){nyangfx.x = -1000;}
    if(!e){var e = window.event;}
    if(leftHeld){player.x  = Math.floor(player.x / tilesize) * tilesize;}
    if(rightHeld){player.x = Math.ceil (player.x / tilesize) * tilesize;}
    if(downHeld){player.y  = Math.ceil (player.y / tilesize) * tilesize;}
    if(upHeld){player.y    = Math.floor(player.y / tilesize) * tilesize;}
    switch(e.keyCode) {
      case KEYCODE_SPACE:	spaceHeld = false; break;
      case KEYCODE_CTRL:	spaceHeld = false; break;
      case KEYCODE_LEFT:	leftHeld  = false; break;
      case KEYCODE_A:	    leftHeld  = false; break;
      case KEYCODE_RIGHT: rightHeld = false; break;
      case KEYCODE_D:     rightHeld = false; break;
      case KEYCODE_UP:	  upHeld    = false; break;
      case KEYCODE_W:	    upHeld    = false; break;
      case KEYCODE_DOWN:  downHeld  = false; break;
      case KEYCODE_S:     downHeld  = false; break;
    }
    if(gamestarted && !leftHeld && !rightHeld && !upHeld && !downHeld && animPlaying && !spaceHeld){
      player.gotoAndPlay("stand");
      animPlaying = false;
      if(curarray[newapy][newapx] == 38  || curarray[newapy][newapx] == 133 || curarray[newapy][newapx] == 134 || curarray[newapy][newapx] == 135){
        if(player.currentAnimation != "boat"){
          player.gotoAndPlay("boat");
          animPlaying = true;
        }
      }
    }
  }
}

function handleTick() {

  if(showIntroEffects) {
    createIntroLightning(); // takes care of lightning on title screen
  }

  if(introCreated){
    introCinematics(); // function that handles the intro animations
  }

  if(gamestarted && !dialogueShowing){

    newapx = player.x / tilesize; newapy=  player.y / tilesize; // these vars are needed to calculate enemy movement and thus has to exist, even when player hasnt moved yet when entering room

    // check for screen exit
    if(upHeld && (player.y / tilesize <= 0) && (world_array_row > 0)) {
      world_array_row --;
      player_location = world[world_array_row][world_array_col];
      createRoom();
      player.y = tilesize * 13; // new position for player is the opposite of where he is now
    } else if(downHeld && (player.y / tilesize >= 13) && (world_array_row < 16)) {
      world_array_row ++;
      player_location = world[world_array_row][world_array_col];
      createRoom();
      player.y = 0;
    } else if(rightHeld && (player.x / tilesize >= 19) && (world_array_col < 23)) {
      world_array_col ++;
      player_location = world[world_array_row][world_array_col];
      createRoom();
      player.x = 0;
    } else if(leftHeld && (player.x / tilesize <= 0) && (world_array_col > 0)) {
      world_array_col --;
      player_location = world[world_array_row][world_array_col];
      createRoom();
      player.x = tilesize * 19;
    } else {

      // handle translation
      if(upHeld){
        if((player.x / tilesize - parseInt(player.x / tilesize)) >= 0.5){player.x = Math.ceil(player.x / tilesize) * tilesize} else {player.x = Math.floor(player.x / tilesize) * tilesize} // this aligns player to grid
        newapx = player.x / tilesize; // thanks to the alignment this is always an integer
        newapy = Math.floor((player.y - speed) / tilesize); // should always be floor, or ceil, depending on direction
        if(newapy < 0){newapy = 0;} // needs correction because can result in -1 if speed is high enough
        if(walkable_tiles[0].indexOf(curarray[newapy][newapx],0) >= 0 || (curarray[newapy][newapx] == 38 && player_inventory.indexOf(120,0) >= 0) || (curarray[newapy][newapx] == 89 && player_inventory.indexOf(121,0) >= 0)){checkBoat();player.y -= speed;}  else {if(curarray[newapy][newapx] == 89){createDialogue(dialogues[25])};newapy = Math.floor(player.y / tilesize);}// find out if this tile is a walkable tile
      } else if (downHeld){
        if((player.x / tilesize - parseInt(player.x / tilesize)) >= 0.5){player.x = Math.ceil(player.x / tilesize) * tilesize} else {player.x = Math.floor(player.x / tilesize) * tilesize}
        newapx = player.x / tilesize;
        newapy = Math.ceil((player.y + speed) / tilesize);
        if(newapy > 13){newapy = 13;}
        if(walkable_tiles[0].indexOf(curarray[newapy][newapx],0) >= 0 || (curarray[newapy][newapx] == 38 && player_inventory.indexOf(120,0) >= 0) || (curarray[newapy][newapx] == 89 && player_inventory.indexOf(121,0) >= 0)){checkBoat();player.y += speed;} else {if(curarray[newapy][newapx] == 89){createDialogue(dialogues[25])};newapy = Math.floor(player.y / tilesize);}
      } else if (leftHeld){
        if((player.y / tilesize - parseInt(player.y / tilesize)) >= 0.5){player.y = Math.ceil(player.y / tilesize) * tilesize} else {player.y = Math.floor(player.y / tilesize) * tilesize}
        newapy = player.y / tilesize;
        newapx = Math.floor((player.x - speed) / tilesize);
        if(newapx < 0){newapx = 0;}
        if(walkable_tiles[0].indexOf(curarray[newapy][newapx],0) >= 0 || (curarray[newapy][newapx] == 38 && player_inventory.indexOf(120,0) >= 0) || (curarray[newapy][newapx] == 89 && player_inventory.indexOf(121,0) >= 0)){checkBoat();player.x -= speed;} else {if(curarray[newapy][newapx] == 89){createDialogue(dialogues[25])};newapx = Math.floor(player.x / tilesize);}
      } else if (rightHeld){
        if((player.y / tilesize - parseInt(player.y / tilesize)) >= 0.5){player.y = Math.ceil(player.y / tilesize) * tilesize} else {player.y = Math.floor(player.y / tilesize) * tilesize}
        newapy = player.y / tilesize;
        newapx = Math.ceil((player.x + speed) / tilesize);
        if(newapx > 19){newapx = 19;}
        if(walkable_tiles[0].indexOf(curarray[newapy][newapx],0) >= 0 || (curarray[newapy][newapx] == 38 && player_inventory.indexOf(120,0) >= 0) || (curarray[newapy][newapx] == 89 && player_inventory.indexOf(121,0) >= 0)){checkBoat();player.x += speed;} else {if(curarray[newapy][newapx] == 89){createDialogue(dialogues[25])};newapx = Math.floor(player.x / tilesize);}
      }

      // check for luminance level
      if(eval("props_room" + player_location)[0][1] < 1){illuminate()}

      // check for weather
      if(eval("props_room" + player_location)[0][2] == 1){rain()}
      if(eval("props_room" + player_location)[0][2] == 2){snow()}
      if(eval("props_room" + player_location)[0][2] == 3){lava()}

      if(player.x != oldplayerx || player.y != oldplayery){ // this is a much more efficient way of checking for colissions. instead of doing it every frame, it now only happens when player has moved
        checkCollisions();
        oldplayerx = player.x;
        oldplayery = player.y;
      }
      if(player_location == '45' || player_location == '42' || player_location == '44'){createFish();} // fish mini game
      if(player_location == '11' || player_location == '12' || player_location == '17'){createSnowball();} // snow balls
      if(player_location == '112' && bossDefeated == false){bossfight();} // boss fight
      if(player_location == '28'  && bossDefeated == true && creditsroll == true){createCredits();} // credits

    }
    if( (createjs.Ticker.getTime() - 299000) > idleTimeout){createIdleAnim()}else{nyangfx.x = 1900;} // nyan
    if(hitbox.alpha>0){hitbox.alpha -= 0.03} // fade out the 'hit box'

    moveEnemy(); // handle enemy movement

  }

  if(debug){fps.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps"+" (room"+player_location+")"} // show room number and fps counter when debug is on
  stage.update(); // always update stage
}
