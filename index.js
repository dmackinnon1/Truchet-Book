#!/usr/bin/env node

const fs = require('fs');
let truchetModule = require('./js/tikZTruchet.js');
let doc = require('./js/latex-builders.js');
let tikz = require('./js/tikZBldr.js');

function getTimestamp () {
  const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
  const d = new Date();
  
  return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}

console.log("creating single tile images");
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
console.log("creating tile patterns and parent groupings");
truchetModule.truchet.start(0.6,4);

let sequences = allSequences(4);

let parents = [];
let parents2 = [];
let children = []; //array of arrays grouped
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
			parents2.push(parentFromSequence(sequence));
			children.push([raw]);
			childrenLabels.push([sequence]);
		} else {
				children[pindex].push(raw);
				childrenLabels[pindex].push(sequence);
		}
					
	} 
}

// Create all parent tile patterns from sequences
console.log("creating parent tiles");
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


console.log("creating each family page");
let mainDoc = new doc.LaTeXDoc();
let mainFile = 'main.tex';

for (let p = 0; p < 16; p++){

	let parent = parents.pop();
	let kids = children.pop();
	let kidLables = childrenLabels.pop();
	let docEnv = new doc.LaTeXDoc();
	
	//docEnv.section(parent);
	docEnv.command("vspace","0.5cm",true);
	let tab = new doc.LaTeXTabular(4,4,kids);
	let labelTab = new doc.LaTeXTabular(4,4,kidLables);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		.addContent(new doc.RawText("\\marginnote[-2\\baselineskip]{\\centering\\fontsize{36}{40}\\selectfont" + parent +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{tiles/parent-" + parent+ ".gtex}}\n"))
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

console.log("creating a big table");

let children2 =[]; //just a straight array not grouped
truchetModule.truchet.start(0.15,4);
sequences = allSequences(4);


// Create all Truchet tiles from sequences and group them.
for (var i = 0; i < 256; i++){
	var sequence = sequences.pop();
	tikz.reset();
	truchetFrom(sequence,truchetModule.truchet);
	raw = truchetModule.truchet.tiles.latexGrid().build();
	children2.push(raw);
}

let tab2 = new doc.LaTeXTabular(16,16,children2);

let bigTable = folderName +"/"+'bigTable.gtex'; //folderName +"/"+


fs.writeFile(bigTable, tab2.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 

console.log("creating a single array of parent tiles");
truchetModule.truchet.start(0.15,4);

let plist = [];
for (var i = 0; i < 16; i++){	
	var psequence = parents2[i];
	tikz.reset();
	truchetFrom(psequence,truchetModule.truchet);
	raw = truchetModule.truchet.tiles.latexGrid(true).build();
	plist.push(raw);					 
}

let tab3 = new doc.LaTeXTabular(16,1,plist);

let parentTable = folderName +"/"+'parentTable.gtex'; //folderName +"/"+

fs.writeFile(parentTable, tab3.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 