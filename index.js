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
		parent = "" + ((Number(sequence.pop()))%2 + parent);
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


//set up folder for files
const folderName = 'tiles';
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}


//create image for tile rotations
truchetModule.truchet.start(1,1);
let bigTiles = ['a','b','c','d'];
let raw = "";

let tileDoc = folderName +"/"+'tileList.gtex'; //folderName +"/"+

for (let t1 = 0; t1 <4; t1 ++){
	truchetModule.truchet.tiles.tiles[0][0] = t1;
	raw = truchetModule.truchet.tiles.latexGrid().build();
	raw += "\n" + t1;
	tikz.reset();
	bigTiles[4-t1] = raw;
}

let bigTilesRow = new doc.LaTeXTabular(1,4,bigTiles);

fs.writeFile(tileDoc, bigTilesRow.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 

//main tile generation

truchetModule.truchet.start(0.6,4);

let sequences = allSequences(4);

let parents = [];
let children = [];
let childrenLabels = [];


// Create all Truchet tiles from sequences and group them.
for (var i = 0; i < 16; i++){
	for (var j = 0; j < 16; j ++) {
		var sequence = sequences.pop();
		tikz.reset();
		truchetFrom(sequence,truchetModule.truchet);
		raw = truchetModule.truchet.tiles.latexGrid().build();
		var pindex = parents.indexOf(parentFromSequence(sequence));
		if (pindex == -1){
			parents.push(parentFromSequence(sequence));
			children.push([raw]);
			childrenLabels.push([sequence]);
		} else {
				children[pindex].push(raw);
				childrenLabels[pindex].push(sequence);
		}
					
	} 
}

// Create all parent tile patterns from sequences

for (var i = 0; i < 16; i++){	
	var psequence = parents[i];
	var pfile = folderName + "/parent-" + psequence +".gtex";
	tikz.reset();
	truchetFrom(psequence,truchetModule.truchet);
	raw = truchetModule.truchet.tiles.latexGrid(true).build();
	fs.writeFile(pfile, raw, function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 				
	 
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
	docEnv.command("vspace","0.5cm",true);
	let tab = new doc.LaTeXTabular(4,4,kids);
	let labelTab = new doc.LaTeXTabular(4,4,kidLables);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("\\marginnote{\\centering\\input{tiles/parent-" + parent+ ".gtex}}"))
		.addContent(new doc.RawText(tab.build()))
		.command(",")
		.command("newline")
		.addContent(new doc.RawText("\n"))
		.command("vspace","0.5cm",true)
		.addContent(new doc.RawText("{\\Large\n"))
		.addContent(new doc.RawText(labelTab.build()))
		.addContent(new doc.RawText("}\n"))
		.command(",")
		.command("newline")
		.addContent(new doc.RawText("\n"))
		.command("vspace","0.5cm",true)
		.command("input",tileDoc)
		.command(",")
		.command("newline")
		.command("vspace","0.2cm",true)
		.addContent(new doc.RawText("\\includegraphics[width=0.3\\linewidth]{tiles/rotationkey.png}"));		
	docEnv.newPage();
	
	
	let childFile = folderName+"/"+parent+".gtex";
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
