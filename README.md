# mume.parser

This patch is an interesting experiment about live-updating pure tex code using markdown engines in vscode, with the help of the nice feature about user-defined parser in the extension [markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced).


[markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) uses MathJax ver2 to rendering the equations with markdown-it. But auto-numbering is supported by version 3. 

The parser.js here is used to support equation numbering and crossref in MPE with both KaTeX and MathJax. Rendering engines *markdown-it* and *pandoc* are both supported. The default *markdown-it* engine with KaTeX for math is recommended.

The final scope of this parser is to lively rendering the *LaTex* file to HTML, *without any markdown-type code.* And hence one can directly write in *LateX* and preview it as markdown. 

By now, several enviroments are included.
- theorem and lemma
- align
- \\(section|subsection|subsubsection){sec_name}(\\label{sec:sec_lab}) => (#|##) sec_name {#sec:sec_lab}
- \\textit{text} and \\textbf{text} => *text* and **text**
- itemize => unnumbered list
- \\color
- a simplest figure environment.
- bib citations are only supported by pandoc parser. TODO: figure out how to adopt *citeproc* in *markdown-it*.

Some useful features
- add math shorthands using the KaTeX macros in `config.js`
- removing texts before maketitle and after bib to the end. It makes the live update work.
- Number and Cross-reference of sections, equations, theorems, lemmas...

Though the parser is still in development, it is now usable. The only thing haven't been touched is the table environment. I think it is now handily useful and a good start point for further development.

## Usage

To use this patch in your vscode, you need to 
1. install the extension [markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced)
2. Add the "tex" extension to the `markdown-preview-enhanced.markdownFileExtensions` in the settings.json file **in** your vscode.
3. `shift+alt+p", then search the command `Markdown Preview Enhanced: Customize CSS (Global)` and `Markdown Preview Enhanced: Extend Parser`; copy the `config.js` and `parser.js` file into your folder.

Then, open the "sample.tex" file in the vscode,  `shift+alt+p", then run the command `Markdown Preview Enhanced: Open Preview to the Side`. The tex file will lively compile via the markdown-it engine with KaTeX.
