# mume.parser
[markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) uses MathJax ver2 to rendering the equations. But auto-numbering is supported by version 3. The parser here is used to support equation numbering and crossref in MPE. 

Several enviroments are included.
- theorem and lemma
- align

Math shorthand.
- \\math(bf|bb|cal|scr){[a-zA-Z]} => \[a-zA-Z](bf|bb|cal|scr)
