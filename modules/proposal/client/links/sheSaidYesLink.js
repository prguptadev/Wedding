"use strict";

module.exports = function (scope, $element, attrs) {

    scope.$on("Start:SheSaidYes", function () {
        setTimeout(function () {
            $element.fadeIn(2000);
        }, 0);

        setTimeout(function () {
            runFireworksDisplay();
        }, 2000);
    });

    function runFireworksDisplay() {
        var playerIndex = 0;
        var songs = ["I_Would_Do_Anything_For_You", "Good_Time", "We_Found_Love"];

        var $player = $("#player");

        function startPlayer() {
            $player[0].volume = .50;
            $player[0].setAttribute("src", "audio/proposal/" + songs[playerIndex] + ".mp3");
            $player[0].play();
            $player.on("ended", nextSong);
        }

        function continuousLoop() {

            FireworkDisplay.launchText();
            setTimeout(function (){
                continuousLoop();
            }, 35000);
        }

        function nextSong () {
            playerIndex++;
            if(playerIndex === songs.length) {
                playerIndex = 0;
            }
            $player[0].setAttribute("src", "audio/proposal/" + songs[playerIndex] + ".mp3");
            $player[0].play();
        }

        startPlayer();
        continuousLoop();
    };
};

var FireworkDisplay = {
    GRAVITY : 5,
    FRAME_RATE : 50,
    DEPLOYMENT_RATE : 10,
    FIREWORK_SPEED : 1.5,
    DISPERSION_WIDTH : 1,
    DISPERSION_HEIGHT : 2,
    FIREWORK_PAYLOAD : 30,
    FRAGMENT_SPREAD : 10,
    TEXT_LINE_HEIGHT : 100,
    FIREWORK_READY : 0,
    FIREWORK_LAUNCHED : 1,
    FIREWORK_EXPLODED : 2,
    FIREWORK_FRAGMENT : 3,
    canvas : 0,
    canvaswidth : 0,
    canvasheight : 0,
    ctx : 0,
    blockPointer : 0,
    fireworks : [],
    allBlocks : new Array(),
    gameloop : 1,
    $fireCount : $('#fireCount'),
    fireTextMessage : "SHE SAID YES",

    updateDisplay : function() {
        this.ctx.clearRect(0, 0, this.canvaswidth, this.canvasheight);
        var firecount = 0;
        for (var i=0;i<this.fireworks.length;i++) {
            if (this.fireworks[i]==null) continue;
            if (this.fireworks[i].status!=this.FIREWORK_EXPLODED) {
                firecount++;
            }
            this.displayFirework(this.fireworks[i]);
        }

        this.$fireCount.html(firecount);
    },
    addFireworks : function() {
        if (this.blockPointer>=this.allBlocks.length) {
            return;
        }

        var fw = this.fireworks[this.fireworks.length] = new Firework(this.fireworks.length);
        var targetx = this.allBlocks[this.blockPointer][0];
        targetx = (((targetx)) / 300) * this.DISPERSION_HEIGHT;
        var targety = this.allBlocks[this.blockPointer][1];
        targety = (((10-targety) / 100) * this.DISPERSION_WIDTH) + 3.5;
        this.launchFirework(fw, targetx, targety);
        this.blockPointer++;
        setTimeout(this.addFireworks.bind(this), 1000/this.DEPLOYMENT_RATE);
    },
    launchText :  function() {
        this.fireworks = [];
        this.blockPointer = 0;
        clearTimeout(this.gameloop);
        //CANVAS
        this.canvas = $("#cv").get(0);
        if (typeof G_vmlCanvasManager != "undefined") {
            this.canvas = G_vmlCanvasManager.initElement(this.canvas);
        }
        this.ctx = this.canvas.getContext("2d");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = "2";
        this.ctx.strokeStyle = "rgb(255, 255, 255)";
        this.canvaswidth = screen.availWidth;
        this.canvasheight = screen.availHeight;

        var totalHeightOffset = 0;
        var totalWidthOffset = new Array();
        var widthCounter = 0;
        totalWidthOffset[widthCounter] = 0;
        for (var i=0;i< this.fireTextMessage.length;i++) {
            if (this.fireTextMessage.charAt(i)==' ') {
                totalHeightOffset += this.TEXT_LINE_HEIGHT;
                widthCounter++;
                totalWidthOffset[widthCounter] = 0;
            } else {
                var maxWidthOffset = 0;
                for (var j=0;j<FONT_FIREWORK[this.fireTextMessage.charAt(i)].length;j++) {
                    var chararr = FONT_FIREWORK[this.fireTextMessage.charAt(i)][j];
                    maxWidthOffset = Math.max(maxWidthOffset, chararr[0]);
                }
                totalWidthOffset[widthCounter] += maxWidthOffset + 40;
            }
        }


        this.allBlocks = new Array();
        var windowHeight = screen.availHeight;
        var offsetTop = totalHeightOffset;
        offsetTop += (windowHeight-totalHeightOffset)/6;
        var offsetLeft = 0;
        var heightOffsetCount = 0;
        for (var i=0;i<this.fireTextMessage.length;i++) {
            if (this.fireTextMessage.charAt(i)==' ') {
                heightOffsetCount++;
                offsetTop = offsetTop - this.TEXT_LINE_HEIGHT;
                offsetLeft = 0;
            } else {
                var maxWidthOffset = 0;
                for (var j=0;j<FONT_FIREWORK[this.fireTextMessage.charAt(i)].length;j++) {
                    var chararr = FONT_FIREWORK[this.fireTextMessage.charAt(i)][j];
                    this.allBlocks[this.allBlocks.length] = [(chararr[0]+offsetLeft)-(totalWidthOffset[heightOffsetCount]/2), chararr[1]-offsetTop];
                    maxWidthOffset = Math.max(maxWidthOffset, chararr[0]);
                }
                offsetLeft += maxWidthOffset+40;  //plus character spacing
            }
        }

        this.gameloop = setInterval(this.updateDisplay.bind(this), 2500/this.FRAME_RATE);

        this.addFireworks();
    },
    launchFirework : function(fw, dispersion, speed) {
        fw.dx = dispersion;
        fw.dy = speed;
        fw.status = this.FIREWORK_LAUNCHED;
    },
    disperseFirework : function(fw, speed) {
        fw.dx = speed * (0.5-Math.random());
        fw.dy = speed * (0.5-Math.random()) + 1;
    },
    explodeFirework : function(fw, speed) {
        fw.status = this.FIREWORK_EXPLODED;
        fw.r = (Math.random() /2) + 0.5;
        fw.g = (Math.random() /2) + 0.5;
        fw.b = (Math.random() /2) + 0.5;
        fw.brightness = 200;
        this.ctx.strokeStyle = "rgb(200, 200, 200)";
        // add the fragments
        var frags = Math.random() * this.FIREWORK_PAYLOAD;
        for (var i=0;i<frags;i++) {
            var spark = this.fireworks[this.fireworks.length] = new Firework(this.fireworks.length);
            spark.x = fw.x;
            spark.y = fw.y;
            spark.r = fw.r;
            spark.g = fw.g;
            spark.b = fw.b;
            spark.status = this.FIREWORK_FRAGMENT;
            this.disperseFirework(spark, Math.random()*this.FRAGMENT_SPREAD);
        }
    },
    destroyFirework : function(fw) {
        this.fireworks[fw.index] = null;
    },
    displayFirework : function(fw, speed) {
        if (fw.y<0) this.destroyFirework(fw);
        if (fw.status==this.FIREWORK_EXPLODED) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "rgb(0, 0, 0)";
            var radius         = 7;                    // Arc radius
            var startAngle     = 10;                     // Starting point on circle
            var endAngle       = Math.PI*2; // End point on circle
            var anticlockwise  = true; // clockwise or anticlockwise
            this.ctx.arc(fw.x, this.canvas.height-fw.y, radius, startAngle, endAngle, anticlockwise);
            this.ctx.fill();
            return;
        }
        fw.colour = "rgb(80, 80, 80)";
        this.ctx.strokeStyle = fw.colour;
        var forces = {x:0,y:-0.05};
        if (fw.status==this.FIREWORK_FRAGMENT) {
            forces.y = this.GRAVITY/-100;
            fw.colour = "rgb("+Math.round(fw.r*fw.brightness)+", "+Math.round(fw.g*fw.brightness)+", "+Math.round(fw.b*fw.brightness)+")";
            this.ctx.strokeStyle = fw.colour;
            fw.brightness-=5;
            if (fw.brightness<0) this.destroyFirework(fw);
        }
        if (fw.dy<-1 && fw.status==this.FIREWORK_LAUNCHED) {
            this.explodeFirework(fw);
        }
        fw.start = {x:fw.x, y:fw.y};
        //apply accelerations
        fw.dx += forces.x*this.FIREWORK_SPEED;
        fw.dy += forces.y*this.FIREWORK_SPEED;
        //apply velocities
        fw.x += fw.dx*this.FIREWORK_SPEED;
        fw.y += fw.dy*this.FIREWORK_SPEED;
        //show
        if (fw.previous) {
            this.ctx.beginPath();
            this.ctx.moveTo(fw.previous.x, this.canvas.height-fw.previous.y);
            this.ctx.lineTo(fw.x, this.canvas.height-fw.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        fw.previous = {x:fw.start.x, y:fw.start.y};
    }
}

var Firework = function(index) {
    this.index = index;
    this.dx = 0;
    this.dy = 0;
    this.x = FireworkDisplay.canvaswidth / 2;
    this.y = 0;
    this.status = FireworkDisplay.FIREWORK_READY;
    this.brightness = 1000;
    this.r = 100;
    this.g = 150;
    this.b = 200;
    this.start = {x:0, y:0};
    this.previous = 0;
}

// Home-made point-based font.
var FONT_FIREWORK = {
    "!":[[5,-40],[5,-30],[5,-20],[5,0]],
    "S":[[35,-35],[25,-40],[15,-40],[35,-15],[25,-20],[5,-35],[35,-5],[15,-20],[5,-25],[25,0],[15,0],[5,-5]],
    "H":[[35,-40],[35,-30],[35,-20],[5,-40],[25,-20],[35,-10],[5,-30],[15,-20],[35,0],[5,-20],[5,-10],[5,0]],
    "E":[[35,-40],[25,-40],[15,-40],[5,-40],[25,-20],[5,-30],[15,-20],[35,0],[5,-20],[25,0],[5,-10],[15,0],[5,0]],
    "A":[[35,-30],[25,-40],[15,-40],[35,-20],[25,-20],[35,-10],[5,-30],[15,-20],[35,0],[5,-20],[5,-10],[5,0]],
    "I":[[25,-40],[15,-40],[5,-40],[15,-30],[15,-20],[15,-10],[25,0],[15,0],[5,0]],
    "D":[[35,-30],[25,-40],[15,-40],[35,-20],[5,-40],[35,-10],[5,-30],[5,-20],[25,0],[5,-10],[15,0],[5,0]],
    "Y":[[35,-40],[35,-30],[5,-40],[25,-20],[5,-30],[15,-20],[20,-10],[20,0]]
}