#!/usr/bin/env node

const fs = require('fs');
let truchetModule = require('./js/tikZTruchet.js');
let doc = require('./js/latex-builders.js');
let tikz = require('./js/tikZBldr.js');


function allSequences(max){
	let list = [];
	for (let d1=0;d1<max; d1++){
		for (let d2=0;d2<max; d2++){
			for (let d3=0;d3<max; d3++){
				for (let d4=0;d4<max; d4++){
					let pattern = "" + d1+d2+d3+d4;
					list.push(pattern);
				}
			}
		}
	}
	return list;
}

function parentFromSequence(sequence){
	let parent = "";
	let length = sequence.length;
	sequence = Array.from(sequence);
	for (let i=0; i<length;i++){
		parent += "" + ((Number(sequence.pop()))%2);
	} 
	return parent;
}

function truchetFrom(sequence, theTruchet){
	let sarray = Array.from(sequence)
	console.log(sequence);
	theTruchet.tiles.tiles[0][0] = parseInt(sarray[0]);
	theTruchet.tiles.applyRules(0,0);
	theTruchet.tiles.tiles[0][1] = parseInt(sarray[1]);
	theTruchet.tiles.applyRules(0,1);
	theTruchet.tiles.tiles[1][0] = parseInt(sarray[2]);
	theTruchet.tiles.applyRules(1,0);
	theTruchet.tiles.tiles[1][1] = parseInt(sarray[3]);
	theTruchet.tiles.applyRules(1,1);
}


truchetModule.truchet.start(0.5,4);
truchetModule.truchet.tiles.applyAll();
truchetFrom("0123",truchetModule.truchet);


let sequences = allSequences(4);
	/*
	for (var i=0; i<256; i++){
		let pattern = truchetFrom(sequences.pop(),truchet);
		truchetList += "</br>" + pattern;
	}
	*/

let parents = [];
let children = [];
let raw = "";

for (var i = 0; i < 16; i++){
	for (var j = 0; j < 16; j ++) {
		var sequence = sequences.pop();
		tikz.reset();
		truchetFrom(sequence,truchetModule.truchet);
		raw = truchetModule.truchet.tiles.latexGrid().build();
		var pindex = parents.indexOf(parentFromSequence(sequence));
		if (pindex == -1){
			tikz.reset();
			parents.push(parentFromSequence(sequence));
			children.push([raw]);
		} else {
				children[pindex].push(raw);
		}
					
	} 
}

let tab = doc.tabular(4,4,children[0]);

let docEnv = doc.defaultPackages()
	.command("pagestyle","empty",true)
	.package("tikz").env()
	.begin("document");
docEnv.env().begin("center").command("Huge","Truchet Test2", true);

//docEnv.addContent(truchetModule.truchet.tiles.latexGrid());

//docEnv.addContent("Hello World");
docEnv.addContent(doc.rawText(tab.build()));

//write out the puzzle file
let mainFile = 'main.tex';
fs.writeFile(mainFile, doc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 
console.log('wrote  file at ' + mainFile);