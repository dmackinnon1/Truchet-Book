#!/usr/bin/env node
/* Generates most diagrams in the third chapter of
 * Truchet Book. 
 */
const fs = require('fs');
let truchetModule = require('./js/tikZTruchet.js');
let doc = require('./js/latex-builders.js');
let tikz = require('./js/tikZBldr.js');


function getTimestamp () {
  const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
  const d = new Date();
  
  return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


function truchetFrom(sequence, theTruchet){
	let sarray = Array.from(sequence)
	theTruchet.tiles.tiles[0][0] = parseInt(sarray[0]);
	theTruchet.tiles.applyRules(0,0);
	theTruchet.tiles.tiles[0][1] = parseInt(sarray[1]);
	theTruchet.tiles.applyRules(0,1);
	theTruchet.tiles.tiles[1][0] = parseInt(sarray[2]);
	theTruchet.tiles.applyRules(1,0);
	theTruchet.tiles.tiles[1][1] = parseInt(sarray[3]);
	theTruchet.tiles.applyRules(1,1);
}


//set up folder for files
const folderName = 'tiles';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}

console.log("building pattern 1");
truchetModule.truchet.start(0.25,4);
let foreground = "2123";
let background = "3331";
let patternList = [];

tikz.reset();
truchetFrom(background,truchetModule.truchet);
let backTile = truchetModule.truchet.tiles.latexGrid().build().slice();
for (let i=0; i<16; i++){
	patternList.push(backTile.slice());
}
tikz.reset();
truchetFrom(foreground,truchetModule.truchet);
let foreTile = truchetModule.truchet.tiles.latexGrid().build().slice();


patternList[5] = foreTile.slice();
patternList[6] = foreTile.slice();
patternList[9] = foreTile.slice();
patternList[10] = foreTile.slice();

console.log(patternList[0]);
console.log("-----");
console.log(patternList[6]);

let tab = new doc.LaTeXTabular(4,4,patternList);


let designFile = folderName+"/"+foreground+ "-" + background +"-design.gtex";

console.log("writing file: "+ designFile);
fs.writeFile(designFile, tab.build(), function(err) {
   if(err) {
    	return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
});