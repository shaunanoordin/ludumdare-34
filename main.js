/*  Ludum Dare 34 - Fat Penguin
 *
 *  A simple game about guiding a penguin to several markers by luring it with
 *  fish.
 *  - Click/tap to drop a fish.
 *  - The penguin will move towards the fish.
 *  - Ice is slippery and penguins can fall into the water. This is both tragic
 *    and hilarious.
 *  - The more fish the penguin eats, the fatter it gets. The fatter the penguin
 *    gets, the faster the ice beneath it cracks.
 *  - Get the penguins to each marker to complete the level.
 *
 * (Shaun A. Noordin, 20151215)
 * (http://shaunanoordin.com)
********************************************************************************
 */
"use strict";

(function() {
  /*  Main Engine
  ****************************************************************
   */
  function App() {
    
    //Engine Constants and Game Properties
    
    App.FRAMESPERSECOND = 30;
    App.COLOUR_PENGUINSHADOW = "rgba(128,128,128,0.6)";
    App.COLOUR_FISHSHADOW = "rgba(128,128,128,0.4)";
    App.COLOUR_TILE_SNOW = "rgba(224,240,255,1)";
    App.COLOUR_TILE_CAMERA = "rgba(192,192,208,1)";
    App.COLOUR_TILE_CAMERA_DONE = "rgba(192,224,208,1)";
    App.COLOUR_TEXT = "rgba(255,255,255,1)";
    App.FONT_TEXT = "32px Lucida Console";
    App.FISH_RADIUS = 16;
    App.FISH_WEIGHT = 1;
    App.PENGUIN_MAXSPEED = 8;
    App.STATE_START = "start-screen";
    App.STATE_READY = "get-ready";
    App.STATE_PLAY = "play";
    App.STATE_VICTORY = "victory-screen";
    App.STATE_DEFEAT = "defeat-screen";
    App.STATE_ULTRAVICTORY = "ultra-victory-screen";
    App.DEFAULT_DECELERATION = 0.2;
    App.SPRITESIZE = 32;
    App.LARGESPRITESIZE = 64;
    App.USERACTION_NOTHING = 0;
    App.USERACTION_TOUCH = 1;
    App.USERACTION_TOUCHEND = 2;
    
    this.userAction = App.USERACTION_NOTHING;
    this.state = App.STATE_START;
    this.width = 960;
    this.height = 640;
    this.penguin = undefined;
    this.fish = new Array();
    this.images = {
      "penguin": new ImageAsset("sprites-penguin-large.png"),
      "objects": new ImageAsset("sprites-objects.png"),
      "screenStart": new ImageAsset("screen-start.png"),
      "screenReady": new ImageAsset("screen-ready.png"),
      "screenVictory": new ImageAsset("screen-victory.png"),
      "screenDefeat": new ImageAsset("screen-defeat.png"),
      "screenUltraVictory": new ImageAsset("screen-ultravictory.png")
    }
    
    this.map = undefined;
    this.currentMapIndex = 0;
    this.maps = [
      new Map(
        30, 20,
        "                              " +
        "                              " +
        "       1111111111111111       " +
        "     11222222222222222211     " +
        "    1223333333333333333222    " +
        "    12X3399999999999933322    " +
        "   123399999999999999999221   " +
        "   1239S99999999999999X9321   " +
        "   123999999999999999999321   " +
        "   123999999999999999999321   " +
        "   12399999999X999999999321   " +
        "   123999999999999999999321   " +
        "   123999999999999999999321   " +
        "   123999999999999999933321   " +
        "    1299999999999999X32221    " +
        "    1223333333333333333221    " +
        "     11X22222222222222111     " +
        "       1111111111111111       " +
        "                              " +
        "                              "
      ),
      new Map(
        30, 20,
        "                              " +
        " 2222233333333333333333333333 " +
        " 2222233333333333333333333333 " +
        " 22X2233333333333333333333X33 " +
        " 2222232               433333 " +
        " 2221111              4433333 " +
        " 22211111            44444777 " +
        " 222 11111          44444 777 " +
        " 222  111199999999994444  777 " +
        " 222   11199S99999X9444   777 " +
        " 222   4449999999999666   777 " +
        " 222  444499999999996666  777 " +
        " 222 44444          66666 777 " +
        " 22244444            66666777 " +
        " 4444444              6655555 " +
        " 444444                655555 " +
        " 44X4455555555555555555555X55 " +
        " 4444455555555555555555555555 " +
        " 4444455555555555555555555555 " +
        "                              "
      ),
      new Map(
        30, 20,
        "                              " +
        " 999 333333333333333333333333 " +
        " 9S9 33333333333333333333333X " +
        " 999 333333333333333333333333 " +
        " 888 3333                     " +
        " 888 3333      5555555        " +
        " 888 3333      55555555       " +
        " 888 3333      555555555      " +
        " 888 3333      5555 55555     " +
        " 777 3333      4555  55555    " +
        " 777 3333      4444   55555   " +
        " 777 3333      3444    55555  " +
        " 777 33333333333434     5555  " +
        " 777 33333333333344     5555  " +
        " 777 33333333333444     5555  " +
        " 777                    5555  " +
        " 777666666666666666666666666  " +
        " 777666666666666666666666666  " +
        " 777666666666666666666666666  " +
        "                              "
      )
    ];
    
    //this.settings = { TEST: "Default" }
    //if (window.app_settings) {
    //this.settings = window.app_settings;
    //}
        
    //================================
    
    
    
    //================================
    
    //HTML Initialisation
    
    this.htmlContainer = document.getElementById("app");
    if (!this.htmlContainer) { alert("ERROR"); }  //TODO
    this.htmlContainer.innerHTML += "<canvas id=\"app-canvas\" width=\""+this.width+"\" height=\""+this.height+"\"></canvas>";
    this.htmlCanvas = document.getElementById("app-canvas");
    this.htmlCanvasContext = this.htmlCanvas.getContext("2d");
    this.htmlConsole = document.getElementById("console");
    this.htmlCanvasContext.lineCap = "round";
    this.htmlCanvasContext.lineJoin = "round";

    //this.htmlConsole.innerHTML += "INIT";
    
    //================================
    
    //Primary Run Cycle
    
    this.run = function () {
      
      //Check User Input
      //--------------------------------
      if (this.inputPressed || this.inputTime > 0) {  //'If' condition created to detect very fast taps - i.e. touchstart and touchend in the same run() frame.
        this.inputTime ++;
        this.userAction = App.USERACTION_TOUCH;
      }     
      if (!this.inputPressed && this.inputTime > 0) {  //Second 'If' condition created to detect very fast taps.
        this.userAction = App.USERACTION_TOUCHEND;
      }
      //--------------------------------
      
      //Switch State
      //--------------------------------
      switch(this.state) {
        case App.STATE_START:
          this.run_start();
          break;
        case App.STATE_PLAY:
          this.run_play();
          break;
        case App.STATE_READY:
          console.log("READY: level " + this.currentMapIndex +" of "+ this.maps.length);
          if (this.currentMapIndex < this.maps.length) {  //Load the level!
            this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
            this.htmlCanvasContext.drawImage(this.images.screenReady.img, 0, 0);
            if (this.userAction == App.USERACTION_TOUCHEND) {
              this.initialiseMap(this.currentMapIndex);
              this.state = App.STATE_PLAY;
            }
          }
          else {  //No more levels to load!
            this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
            this.state = App.STATE_ULTRAVICTORY;
          }        
          break;
        case App.STATE_VICTORY:
          this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
          this.htmlCanvasContext.drawImage(this.images.screenVictory.img, 0, 0);
          if (this.userAction == App.USERACTION_TOUCHEND) {
            this.currentMapIndex ++;
            this.state = App.STATE_READY;
          }
          break;
        case App.STATE_DEFEAT:
          this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
          this.htmlCanvasContext.drawImage(this.images.screenDefeat.img, 0, 0);
          if (this.userAction == App.USERACTION_TOUCHEND) {
            this.state = App.STATE_READY;
          }
          break;
        case App.STATE_ULTRAVICTORY:
          this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
          this.htmlCanvasContext.drawImage(this.images.screenUltraVictory.img, 0, 0);
          if (this.userAction == App.USERACTION_TOUCHEND) {
            this.currentMapIndex = 0;
            this.state = App.STATE_START;
          }
          break;
        default:
          break;
      }
      //--------------------------------
      
      //User Input Cleanup
      //--------------------------------
      if (!this.inputPressed) {
        this.inputTime = 0;
        this.userAction = App.USERACTION_NOTING;
      }
      //--------------------------------
    }.bind(this);
    
    this.run_start = function () {
      var allImagesLoaded = true;
      for (var img in this.images) {
        if (!this.images[img].loaded) {
          allImagesLoaded = false;
          break;
        }
      }
      
      this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
      if (allImagesLoaded) {
        this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
        this.htmlCanvasContext.drawImage(this.images.screenStart.img, 0, 0);
      }
      else {
        this.htmlCanvasContext.font = App.FONT_TEXT;
        this.htmlCanvasContext.fillStyle = App.COLOUR_TEXT;
        this.htmlCanvasContext.fillText("Loading...", App.SPRITESIZE, App.SPRITESIZE * 2);
      }
      
      if (this.userAction == App.USERACTION_TOUCHEND) {
        //this.initialiseMap(this.currentMapIndex);
        //this.state = App.STATE_PLAY;
        this.state = App.STATE_READY;
      }
    }.bind(this);
    
    this.run_play = function () {
      
      //Step 1: Upkeep
      //--------------------------------
      if (this.penguin && this.map) {
        
        //What kind of tile is the penguin stepping on?
        //----------------
        var tileX = Math.floor(this.penguin.x / Map.TILESIZE);
        var tileY = Math.floor(this.penguin.y / Map.TILESIZE);
        //is.htmlConsole.innerHTML = tileX+"/"+this.map.width+","+tileY+"/"+this.map.height+"="+this.map.tiles[tileY][tileX]+"\n";  //DEBUG
        if (tileX >= 0 && tileX < this.map.width && tileY > 0 && tileY < this.map.height) {
          if (this.map.tiles[tileY][tileX] == Map.TILE_WATER) {  //Water? SPLASH! You're defeated.
            this.state = App.STATE_DEFEAT;
            return;
          }
          else if (this.map.tiles[tileY][tileX] > Map.TILE_WATER) {  //Ice? Slide along, but beware that the penguin's weight will slowly crack the ice.
            this.map.tiles[tileY][tileX] = Math.max(this.map.tiles[tileY][tileX] - this.penguin.weight, 0);
          } else if (this.map.tiles[tileY][tileX] == Map.TILE_CAMERA) {  //Ice? Slide along, but beware that the penguin's weight will slowly crack the ice.
            this.map.tiles[tileY][tileX] = Map.TILE_CAMERA_DONE;
            this.map.totalCamerasDone ++;
            if (this.map.totalCamerasDone >= this.map.totalCameras) {
              this.state = App.STATE_VICTORY;
              return;
            }
          }
        }
        
        if (this.penguin.x < 0 || this.penguin.x > this.width || this.penguin.y < 0 || this.penguin.y > this.height) {  //Alternative defeat method: going offscreen.
          this.state = App.STATE_DEFEAT;
          return;
        }
        //----------------
      }
      //--------------------------------
      
      //Step 2: Respond To User Input
      //--------------------------------
      if (this.userAction == App.USERACTION_TOUCHEND) {          
        //Action: Touch Input Ended/Mouse Up => Drop a Fish (or cancel a fish)
        //----------------
        var inputX = this.inputCurrentX - this.inputHTMLOffsets.x;
        var inputY = this.inputCurrentY - this.inputHTMLOffsets.y;
        var insertNewFish = true;
        
        /*  FEATURE REMOVED
        //Was the input in the vicinity of an existing fish? If so, remove that fish instead of inserting a new one.
        for (var i = 0; i < this.fish.length; i ++) {
          var distXSquared = this.fish[i].x - inputX;
          distXSquared = distXSquared * distXSquared;
          var distYSquared = this.fish[i].y - inputY;
          distYSquared = distYSquared * distYSquared;
          
          if (distXSquared + distYSquared <= App.FISH_RADIUS * App.FISH_RADIUS) {
            this.fish.splice(i, 1);
            insertNewFish = false;
            break;
          }
        }
        */
        
        if (insertNewFish) {
          var newFish = new Fish(inputX, inputY);
          //this.fish.unshift(newFish);
          this.fish.push(newFish);
        }
        //----------------
      }
      //--------------------------------
      
      //Step 3: Action and Physics
      //--------------------------------
      if (this.penguin) {  //This only works if there's a penguin.
      
        //Fish? Chase the most recent fish.
        //----------------
        if (this.fish.length >= 1) {
          var distX = this.fish[0].x - this.penguin.x;
          var distY = this.fish[0].y - this.penguin.y;
          this.penguin.angle = Math.atan2(distY, distX);
          
          if (distX * distX + distY * distY <= this.penguin.radius * this.penguin.radius) {  //Touched the fish? Eat the fish!
            this.fish.shift();  //Or, this.fish = this.fish.splice(0, 1);
            this.penguin.weight += App.FISH_WEIGHT;
            this.penguin.accelerationX = 0;
            this.penguin.accelerationY = 0;
          }
          else {
            this.penguin.accelerationX = Math.cos(this.penguin.angle) * this.penguin.speedRating;
            this.penguin.accelerationY = Math.sin(this.penguin.angle) * this.penguin.speedRating;
          } 
        }
        else {  //No fish, so stop.
          this.penguin.accelerationX = 0;
          this.penguin.accelerationY = 0;
        }
        //----------------
        
        //Apply the acceleration and cap speed.
        //----------------
        this.penguin.velocityX += this.penguin.accelerationX;
        this.penguin.velocityY += this.penguin.accelerationY;
        var velocityAngle = Math.atan2(this.penguin.velocityY, this.penguin.velocityX);
        var maxVelocityX = App.PENGUIN_MAXSPEED * Math.cos(velocityAngle);
        var maxVelocityY = App.PENGUIN_MAXSPEED * Math.sin(velocityAngle);
        this.penguin.velocityX = (this.penguin.velocityX >= 0)
          ? Math.min(this.penguin.velocityX, maxVelocityX)
          : Math.max(this.penguin.velocityX, maxVelocityX);
        this.penguin.velocityY = (this.penguin.velocityY >= 0)
          ? Math.min(this.penguin.velocityY, maxVelocityY)
          : Math.max(this.penguin.velocityY, maxVelocityY);
        //----------------
        
        //Tile effects
        //----------------
        if (true) {  //TEST
          var deceleration = App.DEFAULT_DECELERATION;  //In the future, we may set different deceleration rates based on the tile the penguin is stepping on.
          var decelerationX = deceleration * Math.cos(velocityAngle);
          var decelerationY = deceleration * Math.sin(velocityAngle);
          this.penguin.velocityX = (this.penguin.velocityX >= 0)
            ? Math.max(this.penguin.velocityX - decelerationX, 0)
            : Math.min(this.penguin.velocityX - decelerationX, 0);
          this.penguin.velocityY = (this.penguin.velocityY >= 0)
            ? Math.max(this.penguin.velocityY - decelerationY, 0)
            : Math.min(this.penguin.velocityY - decelerationY, 0);
        }
        //----------------
        
        //General physics
        //----------------
        this.penguin.x += this.penguin.velocityX;
        this.penguin.y += this.penguin.velocityY;
        //----------------
      }
      //--------------------------------

      //DEBUG MODE
      //----------------
      /*this.htmlConsole.innerHTML = "" +
        "X: " + this.inputStartX + " -> " + this.inputCurrentX + "<br/>" +
        "Y: " + this.inputStartY + " -> " + this.inputCurrentY + "<br/>" +
        this.inputTime + " frames<br/>" +
        (this.inputPressed ? "PRESSED!<br/>" : "---<br/>") + 
        "Window pageOffset: " + window.pageXOffset + "," + window.pageYOffset;  /**/
      //----------------
      
      //Step 4: Render
      //Note the order of rendering, bottom up: map first, then shadows, then any further sprites.
      //--------------------------------
      this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
      
      if (this.map) {
        for (var y = 0; y < this.map.height; y ++) {
          for (var x = 0; x < this.map.width; x ++) {
            var tile = this.map.tiles[y][x];            
            if (tile != Map.TILE_WATER) {
              if (tile > Map.TILE_WATER) {
                var tileStrength = Math.min(Map.MAXIMUMTILESTRENGTH, Math.max(0, tile));
                this.htmlCanvasContext.fillStyle = "rgba(255,255,255,"+((tileStrength / Map.MAXIMUMTILESTRENGTH)*0.8+0.2)+")";
              }
              else if (tile == Map.TILE_START || tile == Map.TILE_SNOW) {
                this.htmlCanvasContext.fillStyle = App.COLOUR_TILE_SNOW;
              }
              else if (tile == Map.TILE_CAMERA) {
                this.htmlCanvasContext.fillStyle = App.COLOUR_TILE_CAMERA;
              }
              else if (tile == Map.TILE_CAMERA_DONE) {
                this.htmlCanvasContext.fillStyle = App.COLOUR_TILE_CAMERA_DONE;
              }
              this.htmlCanvasContext.fillRect(x * Map.TILESIZE, y * Map.TILESIZE, Map.TILESIZE, Map.TILESIZE);
              
              if (tile == Map.TILE_CAMERA) {
                this.htmlCanvasContext.drawImage(this.images.objects.img,
                  App.SPRITESIZE, 0, App.SPRITESIZE, App.SPRITESIZE,
                  x * Map.TILESIZE, y * Map.TILESIZE - App.SPRITESIZE/2, App.SPRITESIZE, App.SPRITESIZE);
              }
            }
          }
        }
      }
      
      if (this.fish) {
        for (var i = 0; i < this.fish.length; i ++) {
          this.htmlCanvasContext.fillStyle = App.COLOUR_FISHSHADOW;
          this.htmlCanvasContext.beginPath();
          this.htmlCanvasContext.arc(this.fish[i].x, this.fish[i].y, App.FISH_RADIUS, 0, 2 * Math.PI);
          this.htmlCanvasContext.fill();
          this.htmlCanvasContext.closePath();  
          this.htmlCanvasContext.drawImage(this.images.objects.img,
            0, 0, App.SPRITESIZE, App.SPRITESIZE,
            this.fish[i].x - App.SPRITESIZE/2, this.fish[i].y - App.SPRITESIZE/2, App.SPRITESIZE, App.SPRITESIZE);
        }
      }
      
      if (this.penguin) {
        this.htmlCanvasContext.fillStyle = App.COLOUR_PENGUINSHADOW;
        this.htmlCanvasContext.beginPath();
        this.htmlCanvasContext.arc(this.penguin.x, this.penguin.y, this.penguin.radius + this.penguin.weight, 0, 2 * Math.PI);
        this.htmlCanvasContext.fill();
        this.htmlCanvasContext.closePath();
        
        var srcX = 0;
        var srcY = 0;
        if (this.penguin.weight <= App.FISH_WEIGHT * 2) {
          srcY = 0;
        }
        else if (this.penguin.weight <= App.FISH_WEIGHT * 4) {
          srcY = App.LARGESPRITESIZE;
        }
        else if (this.penguin.weight <= App.FISH_WEIGHT * 6) {
          srcY = App.LARGESPRITESIZE * 2;
        }
        else {
          srcY = App.LARGESPRITESIZE * 3;
        }        
        
        var offsetY =  - 24;
        
        this.htmlCanvasContext.drawImage(this.images.penguin.img,
          srcX, srcY, App.LARGESPRITESIZE, App.LARGESPRITESIZE,
          Math.round(this.penguin.x - App.LARGESPRITESIZE/2), Math.round(this.penguin.y - App.LARGESPRITESIZE/2 + offsetY), App.LARGESPRITESIZE, App.LARGESPRITESIZE);
      }
      
      //--------------------------------

    }.bind(this);
    
    this.runCycle = setInterval(this.run, 1000 / App.FRAMESPERSECOND);
    
    //================================
    
    //Level/Map Controls
    
    this.initialiseMap = function (mapIndex) {
      if (mapIndex >= 0 && mapIndex < this.maps.length)
      this.map = new Map(
        this.maps[mapIndex].width,
        this.maps[mapIndex].height,
        this.maps[mapIndex].rawData
      );
      this.penguin = new Penguin(this.map.startingX, this.map.startingY);
      this.fish = new Array();
    }.bind(this);
    
    //================================
    
    //User Input Handlers
    
    //Design points:
    //- The app must be able to accept touch input. Where touch input is
    //  not implemented on a browser, (e.g. Microsoft Edge 20, Firefox 42,)
    //  then fall back to interpreting mouse input as touch events -
    //  because this is how Edge 20 & Firefox 42 work on touch-enabled
    //  devices. (e.g. MS Surface Pro)
    //- Touch input takes precedence over mouse input if possible.
    //
    //Known states:
    //- inputPress == false && inputTime == 0: Idle state.
    //- inputPress == true && inputTime > 0: User has his/her finger on the
    //  screen.
    //- inputPress == false && inputTime > 0: User has just lifted his/her
    //  finger from the screen. This action is awaiting acknowledgement from
    //  the run() cycle, after which inputTime will be reset to 0.
    
    this.inputStartX = 0;
    this.inputStartY = 0;
    this.inputCurrentX = 0;
    this.inputCurrentY = 0;
    this.inputPressed = false;
    this.inputTime = 0;  //Goes to 1 when input starts, reset to 0 after end of input is acknowledged.
    this.inputHTML = this.htmlCanvas;
    this.inputHTMLOffsets = AppUtil.calculateHTMLElementOffsets(this.inputHTML);
    window.addEventListener("scroll", function (e) {
      this.inputHTMLOffsets = AppUtil.calculateHTMLElementOffsets(this.inputHTML);
    }.bind(this)); 
    
    if ("ontouchstart" in this.inputHTML) {
      this.inputHTML.ontouchstart = function (e) {
        if (e.touches && e.touches.length > 0 && e.touches[0].clientX && e.touches[0].clientY) {
          this.inputPressed = true;
          this.inputTime = 1;
          this.inputStartX = e.touches[0].clientX;
          this.inputStartY = e.touches[0].clientY;
          this.inputCurrentX = e.touches[0].clientX;
          this.inputCurrentY = e.touches[0].clientY; 
        }
        return AppUtil.stopEvent(e);
      }.bind(this);
    }
    if ("onmousedown" in this.inputHTML) {
      this.inputHTML.onmousedown = function (e) {
        if (e.clientX && e.clientY) {
          this.inputPressed = true;
          this.inputTime = 1;
          this.inputStartX = e.clientX;
          this.inputStartY = e.clientY;
          this.inputCurrentX = e.clientX;
          this.inputCurrentY = e.clientY;
        }
        return AppUtil.stopEvent(e);
      }.bind(this);
    }
    
    if ("ontouchmove" in this.inputHTML) {
      this.inputHTML.ontouchmove = function (e) {
        if (this.inputPressed && e.touches && e.touches.length > 0 && e.touches[0].clientX && e.touches[0].clientY) {
          this.inputCurrentX = e.touches[0].clientX;
          this.inputCurrentY = e.touches[0].clientY;
        }
        return AppUtil.stopEvent(e);
      }.bind(this);
    }
    if ("onmousemove" in this.inputHTML) {
      this.inputHTML.onmousemove = function (e) {
        if (this.inputPressed && e.clientX && e.clientY) {
          this.inputCurrentX = e.clientX;
          this.inputCurrentY = e.clientY; 
        }
        return AppUtil.stopEvent(e);
      }.bind(this);
    }
    
    if ("ontouchend" in this.inputHTML && "ontouchcancel" in this.inputHTML) {
      this.inputHTML.ontouchend = function (e) {  //Note that on touchend, e.touches would be empty, so there's no point checking for clientX or clientY.
        this.inputPressed = false;
        return AppUtil.stopEvent(e);
      }.bind(this);
      this.inputHTML.ontouchcancel = this.inputHTML.ontouchend;
    }
    if ("onmouseup" in this.inputHTML) {
      this.inputHTML.onmouseup = function (e) {
        if (e.clientX && e.clientY) {
          this.inputPressed = false;
          this.inputCurrentX = e.clientX;
          this.inputCurrentY = e.clientY; 
        }
        return AppUtil.stopEvent(e);
      }.bind(this);
      this.inputHTML.onmouseout = this.inputHTML.onmouseup;
      this.inputHTML.oncontextmenu = function (e) {
        return false;
      }
    }
    
    //================================
  }
  /*
  ****************************************************************
   */
   
    /*  Entity Classes
  ****************************************************************
   */
  function Penguin(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speedRating = 1;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.weight = App.FISH_WEIGHT;  //Fish.WEIGHT_GAIN;
    this.radius = 16;
    this.animationScript = [0,1,0,2];
    this.animationCounter = 0;
  }
  
  function Fish(x, y) {
    this.x = x;
    this.y = y;
  }
  
  function Map(width, height, rawData) {
    Map.TILE_WATER = 0;
    Map.TILE_START = -1;
    Map.TILE_SNOW = -2;
    Map.TILE_CAMERA = -3;
    Map.TILE_CAMERA_DONE = -4;
    Map.TILESTRENGTHFACTOR = 10;
    Map.MAXIMUMTILESTRENGTH = 10 * Map.TILESTRENGTHFACTOR;
    Map.TILESIZE = 32;

    this.rawData = rawData;    
    this.width = width;
    this.height = height;
    this.tiles = new Array(this.height);
    this.cameras = Array();
    this.totalCameras = 0;
    this.totalCamerasDone = 0;
    this.startingX = (this.width + Map.TILESIZE) / 2;
    this.startingY = (this.height + Map.TILESIZE) / 2;
    
    for (var row = 0; row < this.height; row ++) {
      this.tiles[row] = new Array(this.width);
      for (var col = 0; col < this.width; col ++) {
        var index = row * this.width + col;
        if (index < rawData.length) {
          if (/[0-9]/.test(rawData[index])) {
            this.tiles[row][col] = (parseInt(rawData[index]) + 1) * Map.TILESTRENGTHFACTOR;
          }
          else if (rawData[index] == "X" || rawData[index] == "x") {
            this.tiles[row][col] = Map.TILE_CAMERA;
            this.totalCameras ++;
            this.cameras.push({x:col,y:row});
          }
          else if (rawData[index] == "S") {
            this.tiles[row][col] = Map.TILE_START;
            this.startingX = col * Map.TILESIZE + Map.TILESIZE / 2;
            this.startingY = row * Map.TILESIZE + Map.TILESIZE / 2;
          }
          else if (rawData[index] == "#") {
            this.tiles[row][col] = Map.TILE_SNOW;
          }
          else {
            this.tiles[row][col] = Map.TILE_WATER;
          }
        }
        else {
          this.tiles[row][col] = Map.TILE_WATER;
        }
      }
    }
  }
  /*
  ****************************************************************
   */

  
  /*  Utility Classes
  ****************************************************************
   */
  var AppUtil = {
    randomInt: function (min, max) {
      var a = min < max ? min : max;
      var b = min < max ? max : min;
      return Math.floor(a + Math.random() * (b - a  + 1));
    },
    
    calculateHTMLElementOffsets: function (htmlElement) {
      if ("offsetLeft" in htmlElement && "offsetTop" in htmlElement) {
        if ("pageXOffset" in window && "pageYOffset" in window) {
          return { x: htmlElement.offsetLeft - window.pageXOffset, y: htmlElement.offsetTop - window.pageYOffset }
        }
        else {
          return { x: htmlElement.offsetLeft, y: htmlElement.offsetTop }
        }
      }
      return { x: 0, y: 0 }
    },
    
    stopEvent: function (e) {
      var eve = e || window.event;
      eve.preventDefault && eve.preventDefault();
      eve.stopPropagation && eve.stopPropagation();
      eve.returnValue = false;
      eve.cancelBubble = true;
      return false;
    }
  }
  
  function ImageAsset(url) {
    this.url = url;
    this.img = null;
    this.loaded = false;
    this.img = new Image();
    this.img.onload = function() {
      this.loaded = true;
    }.bind(this);
    this.img.src = this.url;
  }
  /*
  ****************************************************************
   */
    
  /*  Initialisation
   *  Go go!
  ****************************************************************
   */
  window.addEventListener("load", function() { var app = new App(); });
  /*
  ****************************************************************
   */
})();
