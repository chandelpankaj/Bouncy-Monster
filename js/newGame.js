var ctx = document.getElementById('my_canvas').getContext('2d');

var spikesTop = new Image();
spikesTop.src = 'images/spikesTop.png';

var FPS= 50;
var started = false;
var spikesBottom = new Image();
spikesBottom.src = 'images/spikesBottom.png';
var GA;
var maxBots = 10;
var spikesLeft;
var spikesRight; 
var bot =[];
var leftSpikeAnimateInterval;
var rightSpikeAnimateInterval;

var level = 9;
var animateInterval;
const TOP_MARGIN=40;
const ACCELERATION = 0.4;
const MAX_YVEL = 8;
const WIDTH = ctx.canvas.width;
const HEIGHT = ctx.canvas.height;
const PLAY_WIDTH = 450;
const PLAY_HEIGHT = 650;

var score = 0;
var highScore = 0;

speedup = function(n){
	if(n==1){
		return;
	}
	FPS = Math.ceil(FPS*n);
	clearInterval(animateInterval);
	animateInterval=setInterval(update, 1000/FPS)
}

var button = {
	space:{'pressed':false, 'released':true},
	enter:{'enter':false},
	esc:{'esc':false}
};

document.addEventListener('keypress', function(event){
	switch(event.keyCode){
		case 97:
			bot[0].flap();
			break;
		case 115:
			bot[1].flap();
			break;
		case 100:
			bot[2].flap();
			break;
		case 102:
			bot[3].flap();
			break;
		case 103:
			bot[4].flap();
			break;
	}
})
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


function drawLine(ax, ay, bx, by, width=1){
	ctx.beginPath();
	ctx.lineWidth=width;
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
}
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

		for(i=0;i<9;i++){
			if(this.spikes[i]==0){
				this.spikes[i+1]=0;
				break;
			}
		}
		if(this.spikes[9]==0){
			this.spikes[8]=0;
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
		this.animateInterval = setInterval(animateLeft, 10*50/FPS);
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
		spikesLeft.x -= 2;
	}
	else{
		spikesLeft.x += 2;
	}
	spikesLeft.animateCounter+=2;
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
				ctx.drawImage(this.spikeImg, PLAY_WIDTH - this.width + this.x, TOP_MARGIN + i*this.height, this.width, this.height);
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

		for(i=0;i<9;i++){
			if(this.spikes[i]==0){
				this.spikes[i+1]=0;
				break;
			}
		}
		if(this.spikes[9]==0){
			this.spikes[8]=0;
		}

	}

	this.isCollidingAdv = function(bot){

		if(bot.x + bot.width < PLAY_WIDTH - this.width){
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
			var sMid = {'x':PLAY_WIDTH-this.width, 'y':TOP_MARGIN + i *(this.height) + this.height/2};
			var sTop = {'x':PLAY_WIDTH, 'y':TOP_MARGIN + i * this.height};
			var sBottom = {'x':PLAY_WIDTH, 'y':TOP_MARGIN + (i+1)*this.height};
			

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
		if(bot.x + bot.width < PLAY_WIDTH - this.width){
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


			var x1 = PLAY_WIDTH;
			var x2 = PLAY_WIDTH - this.width;
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
		this.animateInterval = setInterval(animateRight, 10*50/FPS);
	}

}

verticalDistanceFromSpike = function(y, spikeNo){
	var spikeMid = (TOP_MARGIN + (spikeNo+1) * spikesLeft.height);
	var dist = y - spikeMid;
	return dist;
}

getNearestGap = function(py, direction){
	var minSpike = -1;
	if(direction == 'left'){
		var minDist = 99999;
		for(spike=0;spike<10;spike++){
			if(spikesLeft.spikes[spike] ==1){
				continue;
			}

			var distance = verticalDistanceFromSpike(py, spike);

			if(Math.abs(distance) < Math.abs(minDist)){
				minDist = distance;
				minSpike = spike;
				break;
			}
		}
	}
	else{
		var minDist = 99999;
		for(spike=0;spike<10;spike++){
			if(spikesRight.spikes[spike] ==1){
				continue;
			}

			var distance = verticalDistanceFromSpike(py, spike);

			if(Math.abs(distance) < Math.abs(minDist)){
				minDist = distance;
				minSpike = spike;
				break;
			}
		}

	}

	return minSpike;
}

horizontalDistance = function(px, direction){

	if(direction=='left'){
		return px;
	}
	else{
		return (PLAY_WIDTH - px);
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
	this.fitness_curr = 0;
	this.score_curr =0;
	this.direction = direction;
	this.img = new Image();
	this.img.src = 'images/bot.png';
	this.nearestGap = getNearestGap(this.y, this.direction);
	this.hDistance = horizontalDistance(this.x + this.height/2 , this.direction);
	this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
	this.waitingTime=0;

	this.flap = function(){
		this.velY = -MAX_YVEL;
	}
	this.update = function(){
		var collision='none';
		if(this.dead){
			return;
		}
		if(this.pause){
			return;
		}
		if(this.direction=='left'){
			if(this.x <=0){
				this.direction = 'right';
				collision = 'left';
				//this.nearestGap = getNearestGap(this.y, 'right');
				//this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
				this.score_curr++;
				this.waitingTime = Math.ceil((spikesRight.width-this.width/2)/this.velX);
			}
			else{
				this.x -= this.velX;
			}
		}
		else{
			if(this.x + this.width >= PLAY_WIDTH){
				this.direction = 'left';
				collision = 'right';

				//this.nearestGap = getNearestGap(this.y, 'left');
				//this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
				this.score_curr++;
				this.waitingTime = Math.ceil((spikesRight.width-this.width/2)/this.velX);
			}
			else{
				this.x += this.velX;
			}
		}
		this.fitness_curr++;
		this.y += this.velY;
		this.velY += this.acceleration;

		if(this.waitingTime==0){
			this.nearestGap = getNearestGap(this.y, this.direction);
			this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
			this.hDistance = horizontalDistance(this.x + this.width/2 , this.direction) + spikesLeft.width;
		}
		else{
			this.waitingTime--;
			this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
			if(this.direction == 'right'){
				this.hDistance = spikesLeft.width - (this.x + this.width/2);
			}
			else{
				this.hDistance = spikesLeft.width - horizontalDistance(this.x + this.width/2, 'right');
			}
		}
		
		//console.log(this.hDistance);
		//this.vDistance = verticalDistanceFromSpike(this.y, this.nearestGap);
		
		return collision;
	}
	this.render = function(){
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

		//draw line to nearest gap
		var sign = 1;
		if(this.direction == 'left'){
			sign = -1;
		}

		//horizontal line
		drawLine(this.x + this.height/2, this.y - this.vDistance, this.x + this.height/2 + sign * this.hDistance, this.y - this.vDistance);
		
		//vertical line
		drawLine(this.x + this.height/2, this.y, this.x + this.height/2, this.y - this.vDistance);

	}
}

isCollidiingWithTopBottom = function(bot){
	if(bot.y < 20 || bot.y + bot.height > HEIGHT - 20){
		return true;
	}
	return false;
}

drawScore = function(x, y, s){
	ctx.save();
	ctx.font = "20px Comic Sans MS";
	ctx.fillStyle = "white";
	ctx.textAlign="left";
	ctx.fillText(s , x, y); 
	ctx.restore();
}

render = function(){

	ctx.save();
	// clear canvas
	ctx.clearRect(0, 0, WIDTH, PLAY_HEIGHT);

	// draw seperation line
	drawLine(PLAY_WIDTH, 0, PLAY_WIDTH, HEIGHT, 3);

	// draw bot

	for(b=0;b<maxBots;b++){
		if(!bot[b].dead)
			bot[b].render();
	}
	
	// draw spikes
	spikesLeft.render();
	spikesRight.render();

	ctx.drawImage(spikesTop, 0, 0, PLAY_WIDTH, 20);
	ctx.drawImage(spikesBottom, 0, PLAY_HEIGHT - 20, PLAY_WIDTH, 20);

	ctx.fillStyle = 'rgba(0,0,0,1)';

	ctx.clearRect(PLAY_WIDTH + 1, 0, WIDTH, HEIGHT);


	//ctx.fillRect(0, 0, PLAY_WIDTH, 20);
	//ctx.fillRect(0, PLAY_HEIGHT-20, PLAY_WIDTH, 20);
	//drawScore(10, 17,"Score: "+ score);
	//drawScore(PLAY_WIDTH - 180, 17, "High Score: " + highScore);
	// draw top wall
	ctx.restore();
}

updateVariables = function(){
	// move bot
	var collisionWithWall = 'none';
	for(b=0;b<maxBots;b++){
		if(bot[b].dead){
			continue;
		}
		var collision = bot[b].update();

		GA.activateBrain(bot[b], b);

		if(collisionWithWall != 'none'){
			continue;
		}
		collisionWithWall = collision;
	}

	if(collisionWithWall == 'left'){
		score += 5;
		if(score > highScore)
			highScore = score;
		spikesLeft.newSpikes();

		/*if(score % 1000==0 && level < 8){
			level += 1;
		}*/
	}
	else if(collisionWithWall == 'right'){
		score += 5;
		if(score > highScore)
			highScore = score;
		spikesRight.newSpikes();

		/*if(score % 1000==0 && level < 8){
			level += 1;
		}*/
	}

	//console.log(bot[0].y - bot[0].vDistance);
	for(b=0;b<maxBots;b++){

		if(bot[b].dead){
			continue;
		}
		if(spikesLeft.isColliding(bot[b]) || spikesRight.isCollidingAdv(bot[b]) || isCollidiingWithTopBottom(bot[b])){
			//console.log('bot['+i+'] hit left wall');
			bot[b].dead = true;

			GA.Population[b].fitness = bot[b].fitness_curr;
			GA.Population[b].score = bot[b].score_curr;
		}

	}
	

	var allDead = true;

	for(i=0;i<maxBots;i++){
		if(!bot[i].dead){
			allDead = false;
			break;
		}
	}

	if(allDead){
		GA.evolvePopulation();
		GA.iteration++;
		document.getElementById("generation").innerHTML = "Generation : " + GA.iteration;
		if(GA.iteration % 200==0 && level < 8){
			level += 1;
		}
		//score = 0;
		/*var elem = document.getElementById('playbutton');
	    if(elem != null){
	    	//elem.parentNode.removeChild(elem);
	    	elem.style.display = 'inline-block';
	    }

		clearInterval(animateInterval);*/
		bot = [];
		for(i=0;i<maxBots;i++){
    		bot[i] = new Bot(PLAY_WIDTH/2-10, PLAY_HEIGHT/2 - Math.floor(maxBots/2) * 50 + i*50 + 50, 'left');
    	}

	}
}

handleEvents = function(){
	if(button.space.pressed == true || started){
		for(i=0;i<maxBots;i++){
			if(bot[i].pause){
				bot[i].pause = false;
			}
		}
		button.space.pressed = false;
		started = true;
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


	GA = new GeneticAlgorithm(10, 4);
	GA.reset();
	GA.createPopulation();
    //create spikes
	spikesLeft = new ObstacleLeft();
	spikesRight = new ObstacleRight();
	spikesLeft.generateSpikes(level);
	spikesRight.generateSpikes(level);

    //create bots
    for(i=0;i<maxBots;i++){
    	bot[i] = new Bot(PLAY_WIDTH/2-10, PLAY_HEIGHT/2 - Math.floor(maxBots/2) * 50 + i*50 + 50, 'left');
    }

	animateInterval = setInterval(update,1000/FPS);

}
// mainPage();