#!/usr/bin/env node


const fs = require('fs');
let truchetModule = require('./js/tikZTruchet.js');
let doc = require('./js/latex-builders.js');
let tikz = require('./js/tikZBldr.js');

/**
 * 
 *  Utility functions
 * 
 * 
 */


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

function friezeDualFromSequence(sequence){
	let dual = [];
	let length = sequence.length;
	sequence = Array.from(sequence);
	for (let i=0; i<length;i++){
		dual += "" + (Number(sequence[length-i-1])+2)%4;
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
			"skew (-)",
			"skew (+)",
			"companion",	
			" ",
			this.dual,
			this.skewPositive, 
			this.skewNegative, 
			this.opp, 
			this.family,
			this.dualDiagram,
			this.skewNegativeDiagram, 
			this.skewPositiveDiagram, 
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
	
		truchetModule.truchet.start(0.4,4);
		tikz.reset();
		truchetFrom(this.family,truchetModule.truchet);
		this.familyDiagram  = truchetModule.truchet.tiles.latexGrid(true).build();	

		truchetModule.truchet.start(0.25,4);
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



/**
 * 
 *  INTRODUCTION 
 * 
 */

console.log("---------------------------");
console.log("Introduction: Truchet tiles");
console.log("---------------------------");
//create image for tile rotations
truchetModule.truchet.start(1,1);
let bigTiles = ['a','b','c','d'];
let bigTiles2 = ['a','b','c','d'];
let raw = "";


//set up folder for files
let folderName = 'intro_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}


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

/**
 * 
 * CHAPTER 1- Pattern families
 * 
 */

console.log("---------------------------");
console.log("Chapter 1: Pattern families");
console.log("---------------------------");
console.log("creating tile patterns and parent groupings");


//set up folder for files
folderName = 'ch1_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}


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
let mainFile = 'ch1_families.tex';

for (let p = 0; p < 8; p++){

	let tuple = tups[p];
	let docEnv = new doc.LaTeXDoc();
	
	docEnv.command("vspace","1cm",true);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.family +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{" + folderName+ "/parent-" + tuple.family+ ".gtex}}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering \\Large\n"+ tuple.labelGrid.build()+ "}\n"))
		.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{4pt}\n\\renewcommand{\\arraystretch}{2}"))
		.addContent(new doc.RawText(tuple.tileGrid.build()))
		.addContent(new doc.RawText("}"))
		.command(",")
		.command("newline")
		.command("vspace","1.2cm",true)
		.addContent(new doc.RawText("\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.rDFamily +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{" + folderName+ "/parent-" + tuple.rDFamily+ ".gtex}}\n"))
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

let selfDuals = new doc.LaTeXDoc();
let notSelfDuals = new doc.LaTeXDoc();

plist = allSequences(2); 

for (var i = 0; i < plist.length; i++){	
	var psequence = plist[i];
	var prel = new FamRel();
	prel.init(psequence);
	
	let relFile =  folderName+"/"+psequence+ "-relations.gtex";

	if (prel.family== prel.dual){
		selfDuals.input(relFile)
		.command(",")
		.command("newline")
		.command("vspace","1.2cm",true);

	} else {
		notSelfDuals.input(relFile)
		.command(",")
		.command("newline")
		.command("vspace","1.2cm",true);
	}
	
	fs.writeFile(relFile, prel.table(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 
}	


// console.log("creating a family relations page");

fs.writeFile("ch1_selfDuals.tex", selfDuals.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 

fs.writeFile("ch1_notSelfDuals.tex", notSelfDuals.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 


/**
 * 
 * CHAPTER 2 -- Uniform friezes
 * 
 */

console.log("--------------------------");
console.log("Chapter 2: Uniform friezes");
console.log("--------------------------");

//set up folder for files
folderName = 'ch2_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  		}
	}	catch (err) {
  		console.error(err);
}

parents = [];
parents2 = [];
children = []; //array of arrays grouped
childrenLabels = [];
let tuples = [];

class TileTup {

	constructor(){
		this.tile = "";
		this.code = "";
		this.family = "";
		this.dual = "";
		this.dualCode = "";
		this.dualFamily = "";
		this.frieze = "";
	}

	friezeDualTable(){

		let contents = [];
		let tab = "";
		if(this.code == this.dualCode){
			let skew = increment(shuffle(this.code));
			tikz.reset();
			truchetFrom(skew,truchetModule.truchet);
			let skewPick = truchetModule.truchet.tiles.latexGrid().build();
			contents = [
				skew,
				this.dualCode, 
				this.code, 
				skewPick,
				this.dual, 
				this.tile,
			];
		tab = new doc.LaTeXTabular(2,3,contents);
			
		} else {

			contents = [
				this.dualCode, 
				this.code, 
				this.dual, 
				this.tile,
				];
			tab = new doc.LaTeXTabular(2,2,contents);
		}
		return tab.build();
	}

}

//main tile generation
console.log("creating tile patterns and parent groupings");
truchetModule.truchet.start(0.25,4);

sequences = allSequences(4);


// Create all Truchet tiles from sequences and group them.
for (var i = 0; i < 16; i++){
	for (var j = 0; j < 16; j ++) {
		var sequence = sequences.pop();
		tikz.reset();
		truchetFrom(sequence,truchetModule.truchet);
		
		//get the basics of the tile tupple
		let tup = new TileTup();
		tup.tile = truchetModule.truchet.tiles.latexGrid().build();
		tup.code = sequence.slice();
		tup.family = parentFromSequence(sequence);
		tup.dualCode = friezeDualFromSequence(sequence);
		tup.dualFamily = parentFromSequence(tup.dualCode);

		
		
		//build the frieze
		let friezelist = [];
		for (let x= 0; x < 16; x++){ //duplicate each kid 16 times
			friezelist.push(tup.tile.slice());
		}
		let tab = new doc.LaTeXTabular(2,8,friezelist);
		tup.frieze = tab.build();

		//get the frieze dual
		tikz.reset();
		truchetFrom(tup.dualCode,truchetModule.truchet);
		tup.dual = truchetModule.truchet.tiles.latexGrid().build();


		var pindex = parents.indexOf(tup.family);
		if (pindex == -1){
			parents.push(tup.family.slice());
			parents2.push(tup.family.slice());
			children.push([tup.tile.slice()]);
			childrenLabels.push([sequence]);
			tuples.push([tup]);
		} else {
				children[pindex].push(tup.tile.slice());
				childrenLabels[pindex].push(sequence);
				tuples[pindex].push(tup);
		}
					
	} 
}


console.log("creating each frieze family 2-page spread");

let ch2Doc = new doc.LaTeXDoc();
let ch2File = 'ch2_friezes.tex';

let omitFamilies = [];
let friezeCount = 0;

for (let p = 0; p < 16; p++){

	let parent = parents.pop();
	let kids = tuples.pop(); //children.pop();
	
	let fam = kids[0].family;
	if (omitFamilies.indexOf(fam) > -1){
		console.log(" - ommitting from frieze list: " + fam);
		continue;
	}

	omitFamilies.push(kids[0].dualFamily);

	let docEnv = new doc.LaTeXDoc();

	//docEnv.section(parent);
	docEnv.command("vspace","1cm",true);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		//.command("newpage")
		.addContent(new doc.RawText("\n"))
		.section("Frieze patterns for family " + parent + " (secondary, "+ parentFromSequence(friezeDualFromSequence(parent))+")");
		
	let omitWithinFamily = [];
	for (let f=0; f< 16; f++){ //iterating over each chiled in the kids array
		
		let currentTup = kids[f]; 

		let code = currentTup.code;
			if (omitWithinFamily.indexOf(code) > -1){
				console.log(" -- ommitting from frieze list: " + code);
				continue;
			}

		omitWithinFamily.push(currentTup.dualCode);
		friezeCount++;

		docEnv.env().begin("center").addContent(new doc.RawText("\\marginnote[\\baselineskip]{" + currentTup.friezeDualTable() +"}\n"))
			.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{0pt}\n\\renewcommand{\\arraystretch}{0}"))
			.addContent(new doc.RawText(currentTup.frieze))
			.addContent(new doc.RawText("}"))
			.addContent(new doc.RawText("\n"))
			.command(",")
			.addContent(new doc.RawText("\n"))
			.command("newline")
			.command("vspace","0.2cm",true);	
			if (f==7){
				docEnv.addContent(new doc.RawText("\n"))
				.command("newpage")
				.addContent(new doc.RawText("\n"));
			}
		}
		
	docEnv.newPage();
	
	
	let childFile = folderName+"/frieze_"+parent+".gtex";
	ch2Doc.input(childFile);

	fs.writeFile(childFile, docEnv.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	});

	fs.writeFile(ch2File, ch2Doc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
});  
}

console.log("unique freizes: "+ friezeCount);


/**
 * 
 * CHAPTER 3 - Emergent tiles
 * 
 * 
 */

console.log("-------------------------");
console.log("Chapter 3: Emergent tiles");
console.log("-------------------------");

//set up folder for files
folderName = 'ch3_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}


function designSection3(allMainTiles, sectionFile){
let ch3Doc = new doc.LaTeXDoc();
for (let d=0; d < allMainTiles.length; d++ ){

	truchetModule.truchet.start(0.65,4);
	let patternList = [];
	let mainCode = allMainTiles[d];

	truchetFrom(mainCode,truchetModule.truchet);
	let mainTile = truchetModule.truchet.tiles.latexGrid().build().slice();
	for (let i=0; i<4; i++){
		patternList.push(mainTile.slice());
	}

	truchetModule.truchet.start(0.35,4);
	truchetFrom(mainCode,truchetModule.truchet);
	mainTile = truchetModule.truchet.tiles.latexGrid().build().slice();

	truchetModule.truchet.start(0.35,4);
	let skewCode = increment(shuffle(mainCode));
	truchetFrom(skewCode,truchetModule.truchet);
	let skewTile = truchetModule.truchet.tiles.latexGrid().build().slice();


	let tab = new doc.LaTeXTabular(2,2,patternList);


	let designFile = folderName+"/"+ mainCode +"-design.gtex";
	let mainFile =  folderName+"/"+mainCode+ "-alone.gtex";
	let skewFile =  folderName+"/"+skewCode+ "-alone.gtex";
	
	console.log("writing files: "+ designFile);
	fs.writeFile(designFile, tab.build(), function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});
	fs.writeFile(mainFile, mainTile, function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});
	fs.writeFile(skewFile, skewTile, function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});

	if (mainCode != skewCode){
		ch3Doc.subsection(mainCode + " with "+ skewCode);
	} else {
		ch3Doc.subsection(mainCode);
	}

	ch3Doc.addContent(new doc.RawText("\\marginnote[\\baselineskip]{\\centering\\input{"+mainFile+"}\\newline \n" +mainCode + "}"));
	
	if (skewCode != mainCode) {
		ch3Doc.addContent(new doc.RawText("\\marginnote[2\\baselineskip]{\\centering\\input{"+skewFile+"}\\newline \n" +skewCode + "}"));
	}
	ch3Doc.addContent(new doc.RawText("\n \\begin{center}\n"));
	ch3Doc.input(designFile);
	ch3Doc.addContent(new doc.RawText("\n \\end{center}\n"));
	ch3Doc.addContent(new doc.RawText("\n"))
}

fs.writeFile(sectionFile, ch3Doc.build(), function(err) {
   if(err) {
    	return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
});

}

//uniform patterns
let allMainTiles = ['2200','2020','0202','0022','2130', '0312','3201','1023','3311','3131','1313','1133'];
let ch3File = "ch3_selfdual_weak.tex";
designSection3(allMainTiles, ch3File);

allMainTiles = ['2310','0132','3021','1203'];
ch3File = "ch3_selfdual_strong.tex";
designSection3(allMainTiles, ch3File);




/**
 * 
 * CHAPTER 4 - Curved tiles
 * 
 * 
 */
console.log("-----------------------");
console.log("Chapter 4: Curved tiles");
console.log("-----------------------");

truchetModule.truchet.circles=true;

folderName = 'ch4_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}

tileDoc = folderName +"/"+'tileList2.gtex'; //folderName +"/"+

truchetModule.truchet.start(1.5,1);
bigTiles = ['a','b','c','d'];
bigTiles2 = ['a','b','c','d'];

for (let t1 = 0; t1 <4; t1 ++){
	truchetModule.truchet.tiles.tiles[0][0] = t1;
	raw = truchetModule.truchet.tiles.latexGrid().build();
	raw += "\n" + t1;
	tikz.reset();
	bigTiles[4-t1] = raw;
	bigTiles2[4-t1] = raw
}

bigTilesRow = new doc.LaTeXTabular(2,2,bigTiles);//1,4

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


function designSection4(allMainTiles, sectionFile){
let ch4Doc = new doc.LaTeXDoc();
for (let d=0; d < allMainTiles.length; d++ ){

	truchetModule.truchet.start(0.65,4);
	let patternList = [];
	let mainCode = allMainTiles[d];

	truchetFrom(mainCode,truchetModule.truchet);
	let mainTile = truchetModule.truchet.tiles.latexGrid().build().slice();
	for (let i=0; i<4; i++){
		patternList.push(mainTile.slice());
	}

	truchetModule.truchet.start(0.35,4);
	truchetFrom(mainCode,truchetModule.truchet);
	mainTile = truchetModule.truchet.tiles.latexGrid().build().slice();


	let tab = new doc.LaTeXTabular(2,2,patternList);

	let designFile = folderName+"/"+ mainCode +"-design.gtex";
	let mainFile =  folderName+"/"+mainCode+ "-alone.gtex";
	
	console.log("writing files: "+ designFile);
	fs.writeFile(designFile, tab.build(), function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});
	fs.writeFile(mainFile, mainTile, function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});

	ch4Doc.subsection(mainCode);
	
	ch4Doc.addContent(new doc.RawText("\\marginnote[\\baselineskip]{\\centering\\input{"+mainFile+"}\\newline \n" +mainCode + "}"));
	
	ch4Doc.addContent(new doc.RawText("\n \\begin{center}\n"));
	ch4Doc.input(designFile);
	ch4Doc.addContent(new doc.RawText("\n \\end{center}\n"));
	ch4Doc.addContent(new doc.RawText("\n"))
}

fs.writeFile(sectionFile, ch4Doc.build(), function(err) {
   if(err) {
    	return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
});

}

//uniform patterns
//allMainTiles = ['2200','0313','2130','3201','2023','2012','2313','0113'];
allMainTiles=['0313'];
let ch4File = "ch4_curved_selections.tex";
designSection4(allMainTiles, ch4File);


/**
 * All curved families
 * 
 */

truchetModule.truchet.start(0.5,4);

 sequences = allSequences(4);

 parents = [];
 parents2 = [];
 children = []; //array of arrays grouped
 childrenLabels = [];


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

 mainFamList = ['0000','1000','0100','0010','0001','1100','1010','1001'];
 tups = [];

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
mainDoc = new doc.LaTeXDoc();
mainFile = 'ch4_families.tex';

for (let p = 0; p < 8; p++){

	let tuple = tups[p];
	let docEnv = new doc.LaTeXDoc();
	
	docEnv.command("vspace","1cm",true);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.family +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{" + folderName+ "/parent-" + tuple.family+ ".gtex}}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering \\Large\n"+ tuple.labelGrid.build()+ "}\n"))
		.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{4pt}\n\\renewcommand{\\arraystretch}{2}"))
		.addContent(new doc.RawText(tuple.tileGrid.build()))
		.addContent(new doc.RawText("}"))
		.command(",")
		.command("newline")
		.command("vspace","1.2cm",true)
		.addContent(new doc.RawText("\n"))
		.addContent(new doc.RawText("\\marginnote{\\centering\\fontsize{36}{40}\\selectfont" + tuple.rDFamily +"\\par}\n"))
		.addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{" + folderName+ "/parent-" + tuple.rDFamily+ ".gtex}}\n"))
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


/**
 * 
 * CHAPTER 5- Some designs
 * 
 * 
 */
console.log("-----------------------");
console.log("Chapter 5: Some designs");
console.log("-----------------------");

truchetModule.truchet.circles=false;

//set up folder for files
folderName = 'ch5_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
  		if (!fs.existsSync(folderName)) {
    	fs.mkdirSync(folderName);
  	}
	}	catch (err) {
  		console.error(err);
	}

truchetModule.truchet.start(0.25,4);

function designSection(allForegrounds, allBackgrounds, sectionFile){

let ch5Doc = new doc.LaTeXDoc();
for (let d=0; d < allForegrounds.length; d++ ){
	let patternList = [];

	let background = allBackgrounds[d];
	let foreground = allForegrounds[d];

	tikz.reset();
	truchetFrom(background,truchetModule.truchet);
	let backTile = truchetModule.truchet.tiles.latexGrid().build().slice();
	for (let i=0; i<64; i++){
		patternList.push(backTile.slice());
	}
	tikz.reset();
	truchetFrom(foreground,truchetModule.truchet);
	let foreTile = truchetModule.truchet.tiles.latexGrid().build().slice();


	patternList[18] = foreTile.slice();
	patternList[19] = foreTile.slice();
	patternList[20] = foreTile.slice();
	patternList[21] = foreTile.slice();

	patternList[26] = foreTile.slice();
	patternList[27] = foreTile.slice();
	patternList[28] = foreTile.slice();
	patternList[29] = foreTile.slice();

	patternList[34] = foreTile.slice();
	patternList[35] = foreTile.slice();
	patternList[36] = foreTile.slice();
	patternList[37] = foreTile.slice();

	patternList[42] = foreTile.slice();
	patternList[43] = foreTile.slice();
	patternList[44] = foreTile.slice();
	patternList[45] = foreTile.slice();


	let tab = new doc.LaTeXTabular(8,8,patternList);


	let designFile = folderName+"/"+foreground+ "-" + background +"-design.gtex";
	let foreFile =  folderName+"/"+foreground+ "-alone.gtex";
	let backFile =  folderName+"/"+background+ "-alone.gtex";
	
	console.log("writing files: "+ designFile);
	fs.writeFile(designFile, tab.build(), function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});
	fs.writeFile(foreFile, foreTile, function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});
	fs.writeFile(backFile, backTile, function(err) {
   		if(err) {
    		return console.log("There was an error" + err);
        	console.log("exiting");
			process.exit(1);
    	}
	});

	if (foreground == background){
		ch5Doc.subsection("Design using " + foreground);
	}
	else{
		ch5Doc.subsection("Design using " + foreground + " and " + background);
	}
	ch5Doc.addContent(new doc.RawText("\\marginnote[2\\baselineskip]{\\centering\\input{"+foreFile+"}\\newline \n" +foreground + "}"));
	
	if(foreground != background){
		ch5Doc.addContent(new doc.RawText("\\marginnote[2\\baselineskip]{\\centering\\input{"+backFile+"}\\newline \n" +background + "}"));
	}
	ch5Doc.addContent(new doc.RawText("\n \\begin{center}\n"));
	ch5Doc.input(designFile);
	ch5Doc.addContent(new doc.RawText("\n \\end{center}\n"));
	ch5Doc.addContent(new doc.RawText("\n"))
}

fs.writeFile(sectionFile, ch5Doc.build(), function(err) {
   if(err) {
    	return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
});

}


//uniform patterns
let allForegrounds = ['2200','0202','2130','3201','3311'];
let allBackgrounds = ['2200','0202','2130','3201','3311'];
let ch5File = "ch5_uniform-designs.tex";
designSection(allForegrounds, allForegrounds, ch5File);


//uniform patterns
allForegrounds = ['2310','3021'];
allBackgrounds = ['2310','3021'];
ch5File = "ch5_strongly-uniform-designs.tex";
designSection(allForegrounds, allForegrounds, ch5File);


//op-duals
allForegrounds = ['2222','2002','2332','2112','3223','3003','3333','3113'];
allBackgrounds = ['0000','0220','0110','0330','1001','1221','1111','1331'];
ch5File = "ch5_op-dual-designs.tex";
designSection(allForegrounds, allBackgrounds, ch5File);

//some duals
allForegrounds = ['2201','2003','0210','2301','2331','2113','3211','1013'];
allBackgrounds = ['3200','1220','2302','3210','3110','1330','3301','1323'];
ch5File = "ch5_dual-designs.tex";
designSection(allForegrounds, allBackgrounds, ch5File);


//contrasting
allForegrounds = ['2312','0312','0221','2201','0120','2003','2330','0312'];
allBackgrounds = ['2310','0132','1203','2012','2012','2220','2130','0310'];
ch5File = "ch5_contrasting-designs.tex";
designSection(allForegrounds, allBackgrounds, ch5File);


