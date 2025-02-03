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


truchetModule.truchet.start(0.25,4);

function designSection(allForegrounds, allBackgrounds, sectionFile){

let ch3Doc = new doc.LaTeXDoc();
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
		ch3Doc.section("Design using " + foreground);
	}
	else{
		ch3Doc.section("Design using " + foreground + " and " + background);
	}
	ch3Doc.addContent(new doc.RawText("\\marginnote[2\\baselineskip]{\\centering\\input{"+foreFile+"}\\newline \n" +foreground + "}"));
	ch3Doc.addContent(new doc.RawText("\\marginnote[2\\baselineskip]{\\centering\\input{"+backFile+"}\\newline \n" +background + "}"));
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
let allForegrounds = ['2200','2020','0202','0022','2130','0312','3201','1023','3311','3131','1313','1133'];
let allBackgrounds = ['2200','2020','0202','0022','2130','0312','3201','1023','3311','3131','1313','1133'];
let ch3File = "uniform-designs.tex";
designSection(allForegrounds, allForegrounds, ch3File);


//uniform patterns
allForegrounds = ['2310','0132','3021','1203'];
allBackgrounds = ['2310','0132','3021','1203'];
ch3File = "strongly-uniform-designs.tex";
designSection(allForegrounds, allForegrounds, ch3File);


//op-duals
allForegrounds = ['2222','2002','2332','2112','3223','3003','3333','3113'];
allBackgrounds = ['0000','0220','0110','0330','1001','1221','1111','1331'];
ch3File = "op-dual-designs.tex";
designSection(allForegrounds, allForegrounds, ch3File);

//some duals
allForegrounds = ['2201','2003','0210','2301','2331','2113','3211','1013'];
allBackgrounds = ['3200','1220','2302','3201','3110','1330','3301','1323'];
ch3File = "designs.tex";
designSection(allForegrounds, allForegrounds, ch3File);