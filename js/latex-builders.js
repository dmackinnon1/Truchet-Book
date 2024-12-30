"use strict";
/**
* Builders to be used for LaTeX construction.
*
*/

class LaTeXEnv {

	constructor(l=null){
		this.label = l;
		this.b = null;
		this.content = [];
		this.parent = null;
	}
	
	begin(tag){
		this.b = tag;
		return this;
	}
	
	p(text){
		this.content.push(new LaTeXParagraph(text));
		return this;
	}

	env(label){
		let environ = new LaTeXEnv(label);
		this.content.push(environ);
		return environ;
	}

	command(c,a, nl=false){
		this.content.push(new LaTeXCommand(c,a, nl));
		return this;
	}

	build(){
		let result = "";
		if (this.label != null){
			result += "%" + this.label + " \n";
		}
		if (this.b !== null){
			result += "\\begin{" + this.b + "}\n";			
		}
		for (let i in this.content){
			result += this.content[i].build();
		}
		if (this.b !== null){
			result += "\\end{" + this.b + "}\n";			
		}
		return result;
	}
	addContent(toAdd){
		this.content.push(toAdd);
		return this;
	}
	marginNote(note, offset=null){
		let s = new LaTeXCommand("marginnote", note, true);
		this.addContent(s);
		return this;
	}
}

class LaTeXCommand{
	constructor(c, a=null, nl=false){
		this.command = c;
		this.argument = a;
		this.newline = nl;
		this.optionals = [];
	}

	addOptional(key,value){
		this.optionals.push(""+key + "=" + "value");
	}

	build(){
		let result = "\\" + this.command;
		
		if (this.optionals.length >0){
			result += "" + this.optionals;
		}

		if (this.argument !== null){
			result += "{" + this.argument + "}";
		}

		if (this.newline){
			result +="\n";
		}
		return result;
	}

}

class RawText{
	constructor(text){
		this.content = text;
	}
	build(){
		return this.content;
	}
}

class LaTeXTabular{
	constructor(rows, columns, list ){
		this.rows = rows;
		this.columns = columns;
		this.list = list;
	}

	build(){
		
		let result = "\\begin{tabular}{";
		for (let i= 0; i< this.columns; i++){
			result += "c";
		}
		result += "} \n";
		for(let i = 0 ; i < this.rows; i++){
			for(let j = 0 ; j < this.columns; j++){
				result += this.list.pop();
				if (j != this.columns -1){
					result += " & ";
				}
			}
			result += "\\\\ \n ";
		}
		result += "\\end{tabular} \n";
		return result;
	}
}


class LaTeXParagraph {
	constructor(t, lb=false){
		this.text = t;
		this.linebreak = lb;
		return this;		
	}

	build(){
		let result = ""
		if (this.linebreak){
			result += "\n";
		}
		result += this.text;
		if (this.linebreak){
			result += "\\\\";
			result += "\n ";
		}
		return result;
	}
}

class LaTeXDoc {

	constructor(dc = "article", omitFrontMatter=true){
		this.content = [];
		this.packages = [];
		this.documentclass = dc;
		this.omitFrontMatter = omitFrontMatter;
	}

	marginNote(note, offset=null){
		let s = new LaTeXCommand("marginnote", note, true);
		this.addContent(s);
		return this;
	}

	section(title){
		let s = new LaTeXCommand("section", title, true);
		this.addContent(s);
		return this;
	}

	input(fileName){
		let s = new LaTeXCommand("input", fileName, true);
		this.addContent(s);
		return this;
	}

	chapter(title){
		let s = new LaTeXCommand("chapter", title, true);
		this.addContent(s);
		return this;
	}

	tabular(r,c, tda){
		return new LaTeXTabular(r,c,tda);
	}

	rawText(content){
		return new RawText(content);
	}

	newPage(){
		let s = new LaTeXCommand("newpage", null, true);
		this.addContent(s);
		return this;
	}
	
	clear(){
		this.content = [];
		this.packages = [];
	}
	env(label){
		let environ = new LaTeXEnv(label);
		this.content.push(environ);
		environ.parent = this;
		return environ;
	}
	p(content, lb=false){
		this.content.push();
		return this;
	}
	command(c,a){
		this.content.push(new LaTeXCommand(c,a));
		return this;
	}

	package(name, arg = null){
		this.packages.push(new LaTeXPackage(name,arg));
		return this;
	}

	defaultPackages(){
		this.package("inputenc","utf8");
		return this;
	}

	frontMatter(){
		if (this.omitFrontMatter) return "";
		let fm = "\\documentclass{" + this.documentclass + "}\n";
		for (let i in this.packages){
			fm += this.packages[i].build() + "\n";
		}
		return fm;
	}

	build(){
		let result = this.frontMatter();
		for (let i in this.content){
			result += this.content[i].build() + "\n";
		}
		return result;
	}

	addContent(toAdd){
		this.content.push(toAdd);
		return this;
	}

}
class LaTeXPackage {
	constructor(n, a = null){
		this.name = n;
		this.argument = a;
	}
	build(){
		let result = "\\usepackage";
		if (this.argument != null){
			result += "["+this.argument +"]";
		}
		result += "{" + this.name + "}";
		return result;
	}
}

//for node export
try{
    module.exports.LaTeXDoc = LaTeXDoc;
    module.exports.LaTeXTabular = LaTeXTabular;
    module.exports.RawText = RawText;
} catch(err){
    console.log("non-node execution context");
}