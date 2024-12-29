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

let sequences = allSequences(4);

let parents = [];
let children = [];
let childrenLabels = [];
let raw = "";

// Create all Truchet tiles from sequences and group them.
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
			childrenLabels.push([sequence]);
		} else {
				children[pindex].push(raw);
				childrenLabels[pindex].push(sequence);
		}
					
	} 
}


//let tab = doc.tabular(4,4,children[0]);

let mainDoc = new doc.LaTeXDoc();
let mainFile = 'main.tex';

for (let p = 0; p < 16; p++){

	let parent = parents.pop();
	let kids = children.pop();
	let kidLables = childrenLabels.pop();
	let docEnv = new doc.LaTeXDoc();
	
	docEnv.section(parent);

	let tab = new doc.LaTeXTabular(4,4,kids);
	let labelTab = new doc.LaTeXTabular(4,4,kidLables);
	docEnv.env().begin("center");
	docEnv.addContent(new doc.RawText(tab.build()));
	docEnv.addContent(new doc.RawText(labelTab.build()));
	docEnv.newPage();
	
	let childFile = ""+parent+".tex";
	mainDoc.input(childFile);

	fs.writeFile(childFile, docEnv.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 
}

fs.writeFile(mainFile, mainDoc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 
