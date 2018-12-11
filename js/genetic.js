var GeneticAlgorithm = function(max_units, top_units){
	this.max_units = max_units;
	this.top_units = top_units;
	
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	
	this.Population = [];
	
	this.SCALE_FACTOR = 200;
}

GeneticAlgorithm.prototype = {
	reset : function(){
		this.iteration = 1;
		this.mutateRate = 1; 
		
		this.best_population = 0;
		this.best_fitness = 0;
		this.best_score = 0;
	},
	
	createPopulation : function(){

		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){

			var newUnit = new synaptic.Architect.Perceptron(2, 6, 1);
			
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			this.Population.push(newUnit);
		}
	},
	
	activateBrain : function(bot, index){		
		var targetDeltaX = this.normalize(bot.hDistance, 450) * this.SCALE_FACTOR;
		
		var targetDeltaY = this.normalize(bot.vDistance, 570) * this.SCALE_FACTOR;

		//var targetVel = this.normalize(bot.velY, 25) * this.SCALE_FACTOR;
	
		//var inputs = [targetVel, targetDeltaX, targetDeltaY];
		var inputs = [targetDeltaX, targetDeltaY];
		
		var outputs = this.Population[index].activate(inputs);
			
		if (outputs[0] > 0.5) bot.flap();
	},
	
	evolvePopulation : function(){

		var Winners = this.selection();

		if (this.mutateRate == 1 && Winners[0].fitness < 0){ 
			this.createPopulation();
		} else {
			this.mutateRate = 0.2; 
		}
			
		for (var i=this.top_units; i<this.max_units; i++){
			var parentA, parentB, offspring;
				
			if (i == this.top_units){

				parentA = Winners[0].toJSON();
				parentB = Winners[1].toJSON();
				offspring = this.crossOver(parentA, parentB);

			} else if (i < this.max_units-2){
				parentA = this.getRandomUnit(Winners).toJSON();
				parentB = this.getRandomUnit(Winners).toJSON();
				offspring = this.crossOver(parentA, parentB);
				
			} else {
				offspring = this.getRandomUnit(Winners).toJSON();
			}

			offspring = this.mutation(offspring);
			
			var newUnit = synaptic.Network.fromJSON(offspring);
			newUnit.index = this.Population[i].index;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			this.Population[i] = newUnit;
		}
		
		if (Winners[0].fitness > this.best_fitness){
			this.best_population = this.iteration;
			this.best_fitness = Winners[0].fitness;
			this.best_score = Winners[0].score;
		}
		
		this.Population.sort(function(unitA, unitB){
			return unitA.index - unitB.index;
		});
	},

	selection : function(){
		var sortedPopulation = this.Population.sort(
			function(unitA, unitB){
				return unitB.fitness - unitA.fitness;
			}
		);
		
		for (var i=0; i<this.top_units; i++) this.Population[i].isWinner = true;
		
		return sortedPopulation.slice(0, this.top_units);
	},
	
	crossOver : function(parentA, parentB) {
		var cutPoint = this.random(0, parentA.neurons.length-1);
		
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return this.random(0, 1) == 1 ? parentA : parentB;
	},
	
	mutation : function (offspring){
		for (var i = 0; i < offspring.neurons.length; i++){
			offspring.neurons[i]['bias'] = this.mutate(offspring.neurons[i]['bias']);
		}
		
		for (var i = 0; i < offspring.connections.length; i++){
			offspring.connections[i]['weight'] = this.mutate(offspring.connections[i]['weight']);
		}
		
		return offspring;
	},
	
	mutate : function (gene){
		if (Math.random() < this.mutateRate) {
			var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
			gene *= mutateFactor;
		}
		
		return gene;
	},
	
	random : function(min, max){
		return Math.floor(Math.random()*(max-min+1) + min);
	},
	
	getRandomUnit : function(array){
		return array[this.random(0, array.length-1)];
	},
	
	normalize : function(value, max){
		if (value < -max) value = -max;
		else if (value > max) value = max;
		
		return (value/max);
	}
}