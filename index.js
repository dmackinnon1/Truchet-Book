#!/usr/bin/env node
/* Generates most diagrams in the introduction and first
 * chapter of Truchet Book.
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


function rotaDualFromSequence(sequence){
	let dual = [];
	let length = sequence.length;
	sequence = Array.from(sequence);
	for (let i=0; i<length;i++){
		dual += "" + (Number(sequence[i])+1)%4;
	} 
	return dual;
}

function parentRotaDual(sequence){
	let pd = parentFromSequence(sequence);
	let dual = [];
	let length = pd.length;
	//sequence = Array.from(pd);
	for (let i=0; i<length;i++){
		dual += "" + (Number(pd[i])+1)%2;
	} 
	return dual;
}

function shuffle(sequence){
	let seqArray =  Array.from(sequence);
	let shuffled = [0,0,0,0];
	shuffled[0] = seqArray[2];
	shuffled[1] = seqArray[0];
	shuffled[2] = seqArray[3];
	shuffled[3] = seqArray[1];
	let result = "";
	for (let i=0; i< seqArray.length;i++){
		result += "" + shuffled[i];
	} 
	return result;
}

function increment(sequence){

	let seqArray =  Array.from(sequence);
	let next = [0,0,0,0];
	let result = "";
	
	for (let i=0; i<sequence.length;i++){
		next[i] = (Number(seqArray[i]) + 1)%4;
	} 
	for (let i=0; i<sequence.length;i++){
		result += "" + next[i]; 
	} 

	return result;
}

//object for main family pages
class FamTup {

	constructor(){
		this.family = "";
		this.tileGrid = "";
		this.labelGrid ="";

		this.rDFamily = "";
		this.rDTileGrid = "";
		this.rDLabelGrid = ""
		
	}

}
//object for related families
class FamRel{

	constructor(){
		this.family = "";
		this.familyDiagram = ""
		this.opp = "";
		this.oppDiagram = "";
		this.skewPositive = "";
		this.skewPositiveDiagram = "";
		this.dual = "";
		this.dualDiagram= "";
		this.skewNegative = "";
		this.skewNegativeDiagram = "";

	}

	table(){

		let contents = [
			"dual",
			"skew negative",
			"skew positive",
			"opposite",	
			"signature",
			this.dual,
			this.skewPositive, 
			this.skewNegative, 
			this.opp, 
			this.family,
			this.dualDiagram,
			this.skewNegativeDiagram, 
			this.akewPositiveDiagram, 
			this.oppDiagram, 
			this.familyDiagram,
			];
		let tab = new doc.LaTeXTabular(3,5,contents);
		return tab.build();
	}

	init(psequence) {
		this.family = psequence;
		this.opp = parentFromSequence((increment(psequence.slice()))); //one increment
		this.skewPositive = parentFromSequence(increment(shuffle(psequence.slice()))); //one inc and one shuffle
		this.dual = parentFromSequence(increment(increment(shuffle(shuffle(psequence.slice()))))); //2 incs 2 shuffles
		this.skewNegative = parentFromSequence(increment(increment(increment(shuffle(shuffle(shuffle(psequence.slice()))))))); //3 of each
	
		tikz.reset();
		truchetFrom(this.family,truchetModule.truchet);
		this.familyDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();	

		tikz.reset();
		truchetFrom(this.opp,truchetModule.truchet);
		this.oppDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();

		tikz.reset();
		truchetFrom(this.skewPositive,truchetModule.truchet);
		this.skewPositiveDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();

		tikz.reset();
		truchetFrom(this.dual,truchetModule.truchet);
		this.dualDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();	

		tikz.reset();
		truchetFrom(this.skewNegative,truchetModule.truchet);
		this.skewNegativeDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();	

	}


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
let bigTiles2 = ['a','b','c','d'];
let raw = "";


let tileDoc = folderName +"/"+'tileList2.gtex'; //folderName +"/"+

for (let t1 = 0; t1 <4; t1 ++){
	truchetModule.truchet.tiles.tiles[0][0] = t1;
	raw = truchetModule.truchet.tiles.latexGrid().build();
	raw += "\n" + t1;
	tikz.reset();
	bigTiles[4-t1] = raw;
	bigTiles2[4-t1] = raw
}

let bigTilesRow = new doc.LaTeXTabular(2,2,bigTiles);//1,4

fs.writeFile(tileDoc, bigTilesRow.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 

bigTilesRow = new doc.LaTeXTabular(1,4,bigTiles2);//1,4
tileDoc = folderName +"/"+'tileList.gtex';

fs.writeFile(tileDoc, bigTilesRow.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 


//main tile generation
console.log("creating tile patterns and parent groupings");
truchetModule.truchet.start(0.5,4);

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

let mainFamList = ['0000','1000','0100','0010','0001','1100','1010','1001'];
let tups = [];

for(var i=0; i<8; i++){
	
	let tup = new FamTup();
	tup.family = mainFamList[i];
	var pindex = parents.indexOf(tup.family);
	tup.rDFamily = parentRotaDual(tup.family);
	var dindex = parents.indexOf(tup.rDFamily);

	tup.tileGrid = new doc.LaTeXTabular(4,4,children[pindex]);
	tup.labelGrid = new doc.LaTeXTabular(4,4,childrenLabels[pindex]);
	tup.rDTileGrid = new doc.LaTeXTabular(4,4,children[dindex]);
	tup.rDLabelGrid = new doc.LaTeXTabular(4,4,childrenLabels[dindex]);

	tups.push(tup);
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

for (let p = 0; p < 8; p++){

	let tuple = tups[p];
	//let parent = parents.pop();
	//let kids = children.pop();
	//let kidLables = childrenLabels.pop();
	let docEnv = new doc.LaTeXDoc();
	
	//docEnv.section(parent);
	docEnv.command("vspace","1cm",true);
	//let tab = new doc.LaTeXTabular(4,4,kids);
	//let labelTab = new doc.LaTeXTabular(4,4,kidLables);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.family +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{tiles/parent-" + tuple.family+ ".gtex}}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering \\Large\n"+ tuple.labelGrid.build()+ "}\n"))
		.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{4pt}\n\\renewcommand{\\arraystretch}{2}"))
		.addContent(new doc.RawText(tuple.tileGrid.build()))
		.addContent(new doc.RawText("}"))
		.command(",")
		.command("newline")
		.command("vspace","1.2cm",true)
		.addContent(new doc.RawText("\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.rDFamily +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{tiles/parent-" + tuple.rDFamily+ ".gtex}}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering \\Large\n"+ tuple.rDLabelGrid.build()+ "}\n"))
		.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{4pt}\n\\renewcommand{\\arraystretch}{2}"))
		.addContent(new doc.RawText(tuple.rDTileGrid.build()))
		.addContent(new doc.RawText("}"));			
	docEnv.newPage();
	
	
	let childFile = folderName+"/"+tuple.family+".gtex";
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

console.log("creating a set of family relation files");

plist = allSequences(2); 
truchetModule.truchet.start(0.25,4);

for (var i = 0; i < plist.length; i++){	
	var psequence = plist[i];
	var prel = new FamRel();
	prel.init(psequence);
	
	let relFile =  folderName+"/"+psequence+ "-relations.gtex";
	
	fs.writeFile(relFile, prel.table(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 

}





