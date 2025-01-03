# Truchet Book

This booklet shows all 256 4x4 Truchet patterns with rotational symmetry.

This is a LaTeX learning project that uses 
- javascript to generate the patterns and the LaTeX code for each "tile family" page;
- the "Tufte book" class for formatting: https://tufte-latex.github.io/tufte-latex/

The latex file to be compiled is book.tex. The files main.tex and the .gtex ("generated tex") files are created by running js/index.js.

There are two GitHub actions that will generate the LaTeX files ("js build") and compile them ("latex compile"). 

The latest version of the booklet generated via the GitHub action is saved in the repo.