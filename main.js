/*  Ludum Dare 34 - Fat Penguin
 *  A simple game about guiding penguins to an exit. Watch out
 *  - Click/tap to drop a fish.
 *  - Click/tap on a dropped fish to remove it.
 *  - Penguins will swarm to the nearest fish.
 *  - Ice is slippery and penguins can fall into the water. This is both tragic
 *    and hilarious.
 *  - Get the minimum number of penguins to the exit to win.
********************************************************************************
 */
(function() {
  /*  Main Engine
  ****************************************************************
   */
  function App() {
    
    //Engine Constants and Game Properties
    
    this.FRAMESPERSECOND = 30;
    this.COLOUR_PENGUINSHADOW = "rgba(64,64,128,0.1)";
    this.STATE_IDLE = "idle";
    this.STATE_PLAY = "play";
    
    this.state = this.STATE_IDLE;
    this.width = 640;
    this.height = 480;
    this.penguin = undefined;
    this.fish = Array();
    
    //this.settings = { TEST: "Default" }
    //if (window.app_settings) {
    //this.settings = window.app_settings;
    //}
        
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

    this.htmlConsole.innerHTML += "INIT";
    
    //================================
    
    //Primary Run Cycle
    
    this.run = function () {
      
      //Step 1: Upkeep
      //--------------------------------
      if (this.state == this.STATE_IDLE) {  //TEST
        this.state = this.STATE_PLAY;
        this.initialiseLevel(0);
      }
      //--------------------------------
      
      //Step 2: Detect User Input
      //--------------------------------
      if (this.inputPressed || this.inputTime > 0) {  //'If' condition created to detect very fast taps - i.e. touchstart and touchend in the same run() frame.
        this.inputTime ++;
        
        //Action: Touch Input => Drawing
        //----------------
        /*if (this.inputTime > 0 && this.inputTime <= 10) {
          var circleRadius = 20;
          this.htmlCanvasContext.strokeStyle = "rgba(0,0,0,0.8)";
          this.htmlCanvasContext.lineWidth = 1;
          this.htmlCanvasContext.beginPath();
          this.htmlCanvasContext.arc(this.inputStartX - this.inputHTMLOffsets.x, this.inputStartY - this.inputHTMLOffsets.y, circleRadius, 0, 2 * Math.PI);
          this.htmlCanvasContext.stroke();
          this.htmlCanvasContext.closePath();
        }
        
        circleRadius = 15;
        this.htmlCanvasContext.fillStyle = "rgba(0,128,255,0.1)";
        this.htmlCanvasContext.beginPath();
        this.htmlCanvasContext.arc(this.inputCurrentX - this.inputHTMLOffsets.x, this.inputCurrentY - this.inputHTMLOffsets.y, circleRadius, 0, 2 * Math.PI);
        this.htmlCanvasContext.fill();
        this.htmlCanvasContext.closePath();*/
        //----------------
      }
      
      if (!this.inputPressed) {  //Second 'If' condition created to detect very fast taps.
        if (this.inputTime > 0) {
          //Action: Touch Input => Drawing
          //----------------
          /*this.htmlCanvasContext.strokeStyle = "rgba(255,32,32,.4)";
          this.htmlCanvasContext.lineWidth = 3;
          this.htmlCanvasContext.beginPath();
          this.htmlCanvasContext.moveTo(this.inputStartX - this.inputHTMLOffsets.x, this.inputStartY - this.inputHTMLOffsets.y);
          this.htmlCanvasContext.lineTo(this.inputCurrentX - this.inputHTMLOffsets.x, this.inputCurrentY - this.inputHTMLOffsets.y);
          this.htmlCanvasContext.stroke();
          this.htmlCanvasContext.closePath();*/
          //----------------
        }
        this.inputTime = 0;
      }
      //--------------------------------
      
      //Step 3: Action and Physics
      //--------------------------------
      //--------------------------------

      //DEBUG MODE
      //----------------
      this.htmlConsole.innerHTML = "" +
        "X: " + this.inputStartX + " -> " + this.inputCurrentX + "<br/>" +
        "Y: " + this.inputStartY + " -> " + this.inputCurrentY + "<br/>" +
        this.inputTime + " frames<br/>" +
        (this.inputPressed ? "PRESSED!<br/>" : "---<br/>") + 
        "Window pageOffset: " + window.pageXOffset + "," + window.pageYOffset;
      //----------------

      
      //Step 4: Render
      //--------------------------------
      this.htmlCanvasContext.clearRect(0, 0, this.width, this.height);
      
      if (this.penguin) {
        this.htmlCanvasContext.fillStyle = this.COLOUR_PENGUINSHADOW;
        this.htmlCanvasContext.beginPath();
        this.htmlCanvasContext.arc(this.penguin.x, this.penguin.y, this.penguin.radius, 0, 2 * Math.PI);
        this.htmlCanvasContext.fill();
        this.htmlCanvasContext.closePath();
        this.penguin.x += AppUtil.randomInt(-5, 5);
        this.penguin.y += AppUtil.randomInt(-5, 5);
        
        this.htmlConsole.innerHTML = "Penguin: " + this.penguin.x + "," + this.penguin.y;
      }
      
      //--------------------------------

    }.bind(this);
    this.runCycle = setInterval(this.run, 1000 / this.FRAMESPERSECOND);
    
    //================================
    
    //Level Controls
    
    this.initialiseLevel = function (level) {
      this.penguin = new Penguin(this.width/2, this.height/2);
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
          this.inputTime++;
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
  var Penguin = function (x, y) {
    this.x = x;
    this.y = y;
    this.weight = 1;
    this.radius = 16;
  }
  
  var Fish = function (x, y) {
    this.x = x;
    this.y = y;
  }
  /*
  ****************************************************************
   */

  
  /*  Utility Class
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
