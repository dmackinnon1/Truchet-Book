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



//main tile generation
console.log("creating tile patterns and parent groupings");
truchetModule.truchet.start(0.25,4);

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

// // Create all parent tile patterns from sequences
// console.log("creating parent tiles");
// for (var i = 0; i < 16; i++){	
// 	var psequence = parents[i];
// 	var pfile = folderName + "/parent-" + psequence +".gtex";
// 	tikz.reset();
// 	truchetFrom(psequence,truchetModule.truchet);
// 	raw = truchetModule.truchet.tiles.latexGrid(true).build();
// 	fs.writeFile(pfile, raw, function(err) {
//     if(err) {
//         return console.log("There was an error" + err);
//         console.log("exiting");
// 		process.exit(1);
//     }
// 	}); 				
	 
// }


console.log("creating each family page");

for (let p = 0; p < 16; p++){

	let parent = parents.pop();
	let kids = children.pop();
	let kidLables = childrenLabels.pop();
	let docEnv = new doc.LaTeXDoc();

	//docEnv.section(parent);
	docEnv.command("vspace","1cm",true);
	docEnv.env().begin("center")
		.addContent(new doc.RawText("% file generated at " + getTimestamp() + "\n"))
		.command("newpage")
		.addContent(new doc.RawText("\n"))
		.section(parent);
		// .addContent(new doc.RawText("\\marginnote[-2\\baselineskip]{\\centering\\fontsize{36}{40}\\selectfont" + parent +"\\par}\n"))
		// .addContent(new doc.RawText("\\marginnote[3\\baselineskip]{\\centering\\input{tiles/parent-" + parent+ ".gtex}}\n"));

	
	for (let f=0; f< 16; f++){ //iterating over each chiled in the kids array
		let friezelist = []	;
		for (let x= 0; x < 16; x++){ //duplicate each kid 16 times
			friezelist.push(kids[f]);
		}
		let tab = new doc.LaTeXTabular(2,8,friezelist);
		docEnv.env().begin("center").addContent(new doc.RawText("\\marginnote[3\\baselineskip]{" + kids[f] +"}\n"))
			.addContent(new doc.RawText("{\\setlength{\\tabcolsep}{0pt}\n\\renewcommand{\\arraystretch}{0}"))
			.addContent(new doc.RawText(tab.build()))
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
	

	fs.writeFile(childFile, docEnv.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
	}); 
}

