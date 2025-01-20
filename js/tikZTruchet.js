"use strict";
let tikz = require('./tikZBldr.js');

var truchet = {};
truchet.tiles = null;
truchet.border = false;

truchet.start = function(size, rows) {
	tikz.scale = size;
	truchet.tiles = new Tiles(size,rows);
	truchet.tiles.init();
	tikz.reset();
};


truchet.ruleNone = function(i,j, t) {
	//do nothing
};

truchet.ruleRotate = function(i,j,t) {
	var x = t.rows -1 -i;
	var y = t.rows -1 -j;
	t.tiles[j][x] = (t.tiles[i][j] + 1) % 4;
	t.tiles[x][y] = (t.tiles[i][j] + 2) % 4;
	t.tiles[y][i] = (t.tiles[i][j] + 3) % 4;
	return;	
};

truchet.ruleReflect = function(i,j,t) {
	var x = t.rows -1 -i;
	var y = t.rows -1 -j;
	var c = t.tiles[i][j];
	if (c %2 ==0) {
		t.tiles[i][y] = (c + 1) % 4;
		t.tiles[x][j] = (c + 3) % 4;
		t.tiles[x][y] = (c +2) % 4;
	} else {
		t.tiles[i][y] = (c + 3) % 4;
		t.tiles[x][j] = (c + 1) % 4;
		t.tiles[x][y] = (c +2) % 4;
	}		
	return;	
};

truchet.rule = truchet.ruleRotate;

class TileWrapper {
	constructor(tiles, row, column){
		this.tiles = tiles;
		this.row = row;
		this.column = column;
	}
	set(value){
		this.tiles.tiles[this.row,this.column] = value;
	}
	toString(){
		return "" + this.tiles.tiles[this.row,this.column];
	}
	row(){
		return this.row;
	}
	column(){
		return this.column;
	}
}

class Tiles {

	constructor(size, rows) {
		this.size = size;
		this.rows = rows;
		this.cols = rows;
		this.tiles = [];
	}

	init() {
		for (var i = 0; i < this.rows; i++){
			this.tiles[i] = [];
			for (var j = 0; j < this.cols; j ++) {
				this.tiles[i].push(0); 
			} 
		}	
	}

	copyFromOther(other){

		for (var i = 0; i < other.rows; i++){
			for (var j = 0; j < other.cols; j ++) {
				this.tiles[i][j] = other.tiles[i][j];
			} 
		}	

	}
	
	distance(another) {
		if (another.rows !== this.rows && another.cols !== this.cols) {
			console.log("programming error - comparing incompatable tiles");
			return;
		}
		var total = 0;
		for (var i = 0; i < this.rows ;i++){
			for (var j = 0; j < this.cols ; j++) {
				var a = this.tiles[i][j];
				var b = another.tiles[i][j];
				if (a<=b) total += b-a;
				else total += (4-a)+b;
			}
		}
		return total;
	}

	latexGrid(diagonal = false) {
		//if (this.rows>1){
			tikz.drawGrid(0,-1,this.rows, this.rows-1);
		//}
		for (var i = 0; i < this.rows; i++){
			for (var j = 0; j < this.cols; j ++) {
				this.latexTile(i,j,this.tiles[i][j],tikz,diagonal);
			} 
		}
		return tikz;	

	}

	latexTile(i,j,k,builder, diagonal=false){
		if (diagonal){
			builder.drawDiagonal(i,j,k);
		} else {
			builder.drawTriangle(i,j,k);
		}

	}
	

	rotate(i,j) {
		this.tiles[i][j] = (this.tiles[i][j] + 1) % 4;
	}

	applyRules(i,j){
		truchet.rule(i,j,this);
			
	}

	applyAll() {
		for(var i = 0; i <this.rows; i++){
			for (var j = 0; j<this.rows; j++){
				this.applyRules(i,j);
			}
		}
	}

	randomizeTile() {
		var r = randomInt(this.rows);
		var c = randomInt(this.cols);
		this.rotate(r,c);
		this.applyRules(r,c);				
	}

};


function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};


try{
    module.exports.truchet = truchet; 
} catch(err){
    console.log("non-node execution context");
}