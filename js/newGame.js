var ctx = document.getElementById('my_canvas').getContext('2d');

var spikesTop = new Image();
spikesTop.src = 'images/spikesTop.png';

var spikesBottom = new Image();
spikesBottom.src = 'images/spikesBottom.png';

var spikesLeft;
var spikesRight;
var bot;
var leftSpikeAnimateInterval;
var rightSpikeAnimateInterval;

var level = 4;
var animateInterval;
var bot;
const FPS = 50;
const TOP_MARGIN=40;
const ACCELERATION = 0.4;
const MAX_YVEL = 8;
const WIDTH = ctx.canvas.width;
const HEIGHT = ctx.canvas.height;



var button = {
	space:{'pressed':false, 'released':true},
	enter:{'enter':false},
	esc:{'esc':false}
};

document.addEventListener('keyup',function(event){
	// 65 A, 37-left, 83-s 40-down, 68-d, 96-right, 87-w, 38-up

	switch(event.keyCode){
		case 32:
			button.space.released = true;
		break;
	}
});

document.addEventListener('keydown',function(event){
	// 65 A, 37-left, 83-s 40-down, 68-d, 96-right, 87-w, 38-up

	switch(event.keyCode){
		case 32:
			if(button.space.released == true){
				button.space.pressed = true;
				button.space.released = false;
			}
		break;
		case 13:
			button.enter.pressed = true;
			break;
		case 27:
			button.esc.pressed = true;
			clearInterval(animateInterval);
			break;
	}
});

function isIntersecting(p1, p2, p3, p4) {
    function CCW(p1, p2, p3) {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}

ObstacleLeft = function(){
	this.spikes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	this.width = 30;
	this.height = 57;
	this.spikeImg = new Image();
	this.spikeImg.src = 'images/spikeLeft.png';
	this.animateInterval;
	this.animateCounter=0;
	this.x=0;

	this.render = function(){
		for(i = 0; i < 10; i++){
			if(this.spikes[i] == 1){
				ctx.drawImage(this.spikeImg, this.x, TOP_MARGIN + i*this.height, this.width, this.height);
			}
		}
	}

	this.generateSpikes = function(n){
		if(n > 9){
			n = 9;
		}
		var spikesGenerated = 0;
		for(i=0; i<10; i++){
			this.spikes[i]=0;
		}
		while(spikesGenerated < n){
			var rand = Math.abs(Math.floor(Math.random()*10-0.00000001));
			if(this.spikes[rand] != 1){
				this.spikes[rand] = 1;
				spikesGenerated++;
			}
		}	
	}

	this.isColliding = function(bot){
		// check for every spike
		if(bot.x > this.width){
			return false;
		}
		// -ve for below line (if first point is left one)
		// d=(x−x1)(y2−y1)−(y−y1)(x2−x1)
		for(i=0; i<10; i++){
			// check if there is a spike at that point
			if(this.spikes[i] != 1){
				continue;
			}

			if(bot.y > TOP_MARGIN + (i+1) * (this.height) || bot.y + bot.height < TOP_MARGIN + i * this.height){
				continue;
			}

			/*
			#............
			#.\..d2......
			#..\........
			#...\......
			#.../......
			#../........
			#./...d1.....
			*/

			var x1 = 0;
			var x2 = this.width;
			var y1 = TOP_MARGIN + (i+1) * this.height;
			var y2 = TOP_MARGIN + i * (this.height) +this.height/2;

			// d1 is for bottom line of spike
			// d1 is positive if bot is above the bottom side of spike
			var d1 = (bot.x - x1) * (y2 - y1) - (bot.y - y1) * (x2 - x1); 

			y1 = TOP_MARGIN + i*this.height;
			// d2 is for top line of spike
			// d2 is -ve if bot is below the top side of spike
			var d2 = (bot.x - x1) * (y2 - y1) - (bot.y + bot.height - y1) * (x2 - x1); 

			// bot is colliding with the spike if d1 is positive and d2 is negative

			if(d1 >=0 && d2 <= 0){
				return true;
			}
		}
		return false;
	}
	this.animate = function(){
		if(this.animateCounter == this.width * 2){
			clearInterval(this.animateInterval);
			this.animateCounter = 0;
			//this.x = 0;
			return;
		}
		if(this.animateCounter == this.width){
			this.generateSpikes();
		}
		if(this.animateCounter < this.width){
			this.x -= 1;
		}
		else{
			this.x += 1;
		}
		this.annimateCounter++;

	}
	this.newSpikes = function(){
		//this.animateInterval = setInterval(this.animate, 50);
		this.animateInterval = setInterval(animateLeft, 10);
	}
}

animateRight = function(){
	if(spikesRight.animateCounter == spikesRight.width * 2){
		clearInterval(spikesRight.animateInterval);
		spikesRight.animateCounter = 0;
		spikesRight.x = 0;
		return;
	}

	if((spikesRight.animateCounter == spikesRight.width)){
		spikesRight.generateSpikes(level);
	}
	if(spikesRight.animateCounter < spikesRight.width){
		spikesRight.x += 1;
	}
	else{
		spikesRight.x -= 1;
	}
	spikesRight.animateCounter++;
}

animateLeft = function(){
	if(spikesLeft.animateCounter == spikesLeft.width * 2){
		clearInterval(spikesLeft.animateInterval);
		spikesLeft.animateCounter = 0;
	 	spikesLeft.x = 0;
	}

	if(spikesLeft.animateCounter == spikesLeft.width){
		spikesLeft.generateSpikes(level);
	}
	if(spikesLeft.animateCounter < spikesLeft.width){
		spikesLeft.x -= 1;
	}
	else{
		spikesLeft.x += 1;
	}
	spikesLeft.animateCounter++;
}
ObstacleRight = function(){
	this.spikes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	this.width = 30;
	this.height = 57;
	this.spikeImg = new Image();
	this.spikeImg.src = 'images/spikeRight.png';
	this.animateInterval;
	this.animateCounter=0;
	this.x=0;

	this.render = function(){
		for(i = 0; i < 10; i++){
			if(this.spikes[i] == 1){
				ctx.drawImage(this.spikeImg, WIDTH - this.width + this.x, TOP_MARGIN + i*this.height, this.width, this.height);
			}
		}
	}

	this.generateSpikes = function(n){
		if(n > 9){
			n = 9;
		}
		var spikesGenerated = 0;
		for(i=0; i<10; i++){
			this.spikes[i]=0;
		}

		while(spikesGenerated < n){
			var rand = Math.abs(Math.floor(Math.random()*10-0.00000001));
			if(this.spikes[rand] != 1){
				this.spikes[rand] = 1;
				spikesGenerated++;
			}
		}	
	}

	this.isCollidingAdv = function(bot){

		if(bot.x + bot.width < WIDTH - this.width){
			return false;
		}

		for(i=0; i<10; i++){
			if(this.spikes[i] != 1){
				continue;
			}

			if(bot.y > TOP_MARGIN + (i+1) * (this.height) || bot.y + bot.height < TOP_MARGIN + i * this.height){
				continue;
			}

			var b1 = {'x':bot.x+bot.width, 'y':bot.y};
			var b2 = {'x':bot.x+bot.width, 'y':bot.y + bot.height};
			var sMid = {'x':WIDTH-this.width, 'y':TOP_MARGIN + i *(this.height) + this.height/2};
			var sTop = {'x':WIDTH, 'y':TOP_MARGIN + i * this.height};
			var sBottom = {'x':WIDTH, 'y':TOP_MARGIN + (i+1)*this.height};
			

/*

				  ctx.beginPath();
			      ctx.arc(sMid.x, sMid.y, 3, 0, 2 * Math.PI, false);
			      ctx.fillStyle = 'green';
			      ctx.fill();
			      ctx.lineWidth = 2;
			      ctx.strokeStyle = '#003300';
			      ctx.stroke();   

				  ctx.beginPath();
			      ctx.arc(b1.x, b1.y, 3, 0, 2 * Math.PI, false);
			      ctx.fillStyle = 'green';
			      ctx.fill();
			      ctx.lineWidth = 2;
			      ctx.strokeStyle = '#003300';
			      ctx.stroke();  

			      ctx.beginPath();
			      ctx.arc(sTop.x, sTop.y, 3, 0, 2 * Math.PI, false);
			      ctx.fillStyle = 'green';
			      ctx.fill();
			      ctx.lineWidth = 2;
			      ctx.strokeStyle = '#003300';
			      ctx.stroke();  

			      ctx.beginPath();
			      ctx.arc(sBottom.x, sBottom.y, 3, 0, 2 * Math.PI, false);
			      ctx.fillStyle = 'green';
			      ctx.fill();
			      ctx.lineWidth = 2;
			      ctx.strokeStyle = '#003300';
			      ctx.stroke();  
			*/

			if(isIntersecting(b1, b2, sTop, sMid) || isIntersecting(b1, b2, sBottom, sMid)){
				return true;
			}
		}
		return false;

	}
	this.isColliding = function(bot){
		// check for every spike
		if(bot.x + bot.width < WIDTH - this.width){
			return false;
		}
		// -ve for below line (if first point is left one)
		// d=(x−x1)(y2−y1)−(y−y1)(x2−x1)
		for(i=0; i<10; i++){
			// check if there is a spike at that point
			if(this.spikes[i] != 1){
				continue;
			}

			if(bot.y > TOP_MARGIN + (i+1) * (this.height) || bot.y + bot.height < TOP_MARGIN + i * this.height){
				continue;
			}


			var x1 = WIDTH;
			var x2 = WIDTH - this.width;
			var y1 = TOP_MARGIN + (i+1) * this.height;
			var y2 = TOP_MARGIN + i * (this.height) +this.height/2;

			// d1 is for bottom line of spike
			// d1 is negative if bot is above the bottom side of spike
			var d1 = (bot.x + bot.width - x1) * (y2 - y1) - (bot.y - y1) * (x2 - x1); 

			y1 = TOP_MARGIN + i*this.height;
			// d2 is for top line of spike
			// d2 is +ve if bot is below the top side of spike
			var d2 = (bot.x + bot.width - x1) * (y2 - y1) - (bot.y + bot.height - y1) * (x2 - x1); 

			// bot is colliding with the spike if d1 is -ve and d2 is +ve
			if(d1 <=0 && d2 >= 0){
				return true;
			}
		}
		return false;
	}

	this.newSpikes = function(){
		this.animateInterval = setInterval(animateRight, 10);
	}

}
Bot = function(x, y, direction){
	this.pause = true;
	this.x = x;
	this.y = y;
	this.lives = 1;
	this.dead = false;
	this.width = 20;
	this.height = 20;
	this.velX = 4;
	this.velY = 1;
	this.acceleration = ACCELERATION;
	this.direction = direction;
	this.img = new Image();
	this.img.src = 'images/bot.png';
	this.update = function(){
		var collision='none';
		if(bot.dead){
			clearInterval(animateInterval);
			return;
		}
		if(bot.pause){
			return;
		}
		if(this.direction=='left'){
			if(this.x <=0){
				this.direction = 'right';
				collision = 'left';
			}
			else{
				this.x -= this.velX;
			}
		}
		else{
			if(this.x + this.width >= WIDTH){
				this.direction = 'left';
				collision = 'right';
			}
			else{
				this.x += this.velX;
			}
		}

	this.y += this.velY;
	this.velY += this.acceleration;
	return collision;
	}
	this.render = function(){
		ctx.drawImage(bot.img, bot.x, bot.y, bot.width, bot.height);
	}
}

isCollidiingWithTopBottom = function(bot){
	if(bot.y < 40 || bot.y + bot.height > HEIGHT - 40){
		return true;
	}
	return false;
}

render = function(){

	ctx.save();
	// clear canvas
	ctx.clearRect(0,0,WIDTH,HEIGHT);

	// draw bot
	bot.render();
	
	// draw spikes
	spikesLeft.render();
	spikesRight.render();

	ctx.drawImage(spikesTop, 0, 20, WIDTH, 20);
	ctx.drawImage(spikesBottom, 0, HEIGHT - 40, WIDTH, 20);

	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect(0, 0, WIDTH, 20);
	ctx.fillRect(0, HEIGHT-20, WIDTH, 20);
	// draw top wall

	ctx.restore();
}
updateVariables = function(){
	// move bot
	var collisionWithWall = bot.update();

	if(collisionWithWall == 'left'){
		spikesLeft.newSpikes();
	}
	else if(collisionWithWall == 'right'){
		spikesRight.newSpikes();
	}
	if(spikesLeft.isColliding(bot)){
		console.log('hit');
		bot.dead = true;
	}

	if(spikesRight.isCollidingAdv(bot)){
		console.log('hit2');
		bot.dead = true;
	}

	if(isCollidiingWithTopBottom(bot)){
		console.log('hit3');
		bot.dead = true;
	}
	if(bot.dead){
		var elem = document.getElementById('playbutton');
	    if(elem != null){
	    	//elem.parentNode.removeChild(elem);
	    	elem.style.display = 'inline-block';
	    }
	}
}
handleEvents = function(){

	if(button.space.pressed == true){
		if(bot.pause){
			bot.pause = false;
		}
		else{
			bot.velY = -MAX_YVEL;
			button.space.pressed = false;
		}
	}
}
update = function(){
	handleEvents();
	updateVariables();
	render();
}
mainPage = function(){
	var elem = document.getElementById('playbutton');
    if(elem != null){
    	//elem.parentNode.removeChild(elem);
    	elem.style.display = 'none';
    }
	bot = new Bot(WIDTH/2 -10, 2*HEIGHT/3, 'left');
	spikesLeft = new ObstacleLeft();
	spikesRight = new ObstacleRight();
	spikesLeft.generateSpikes(5);
	spikesRight.generateSpikes(4);
	animateInterval = setInterval(update,1000/FPS);

}
// mainPage();