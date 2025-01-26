#!/usr/bin/env node

const fs = require('fs');
let truchetModule = require('./js/tikZTruchet.js');
let doc = require('./js/latex-builders.js');
let tikz = require('./js/tikZBldr.js');


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

		let contents = [
			"(" +this.dualFamily +")",
			"(" +this.family +")",
			this.dualCode, 
			this.code, 
			this.dual, 
			this.tile,
			"\\,",
			"\\,",
			"{\\footnotesize \\textit{secondary}}",
			"{\\footnotesize \\textit{primary}}",
			];
		let tab = new doc.LaTeXTabular(6,2,contents);
		return tab.build();
	}


}


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

function friezeDualFromSequence(sequence){
	let dual = [];
	let length = sequence.length;
	sequence = Array.from(sequence);
	for (let i=0; i<length;i++){
		dual += "" + (Number(sequence[length-i-1])+2)%4;
	} 
	return dual;
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



//main tile generation
console.log("creating tile patterns and parent groupings");
truchetModule.truchet.start(0.25,4);

let sequences = allSequences(4);

let parents = [];
let parents2 = [];
let children = []; //array of arrays grouped
let childrenLabels = [];
let tuples = [];

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

for (let p = 0; p < 16; p++){

	let parent = parents.pop();
	let kids = tuples.pop(); //children.pop();
	//let kidLables = childrenLabels.pop();
	let docEnv = new doc.LaTeXDoc();

	//docEnv.section(parent);
	docEnv.command("vspace","1cm",true);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		//.command("newpage")
		.addContent(new doc.RawText("\n"))
		.section("Frieze patterns for family " + parent);
		
	
	for (let f=0; f< 16; f++){ //iterating over each chiled in the kids array
		
		let currentTup = kids[f]; 
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

