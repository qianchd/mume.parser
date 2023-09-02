# mume.parser
[markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) uses MathJax ver2 to rendering the equations with markdown-it. But auto-numbering is supported by version 3. The parser here is used to support equation numbering and crossref in MPE. Rendering engines *markdown-it* and *pandoc* are both supported. By now, developing the *pandoc* features are focused on.

The final scope of this parser is to lively rendering the *LaTex* file to HTML, *without any markdown-type code.* And hence one can directly write in *LateX* and preview it as markdown. 

Several enviroments are included.
- theorem and lemma
- align
- \\(section|subsection){sec_name}(\\label{sec:sec_lab}) => (#|##) sec_name {#sec:sec_lab}
- \\textit{text} and \\textbf{text} => *text* and **text**
- itemize => unnumbered list

Math shorthand.
- \\math(bf|bb|cal|scr){\[a-zA-Z\]} => \\(\[a-zA-Z\])(bf|bb|cal|scr).
- shorthand for mathrm: \\mathrm{#1} => \\#1, with #1 some user-defined symbols.
