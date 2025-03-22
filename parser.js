({
  onWillParseMarkdown: async function(markdown) {
    markdown = markdown.replace(/[\s\S]*\\title{(.*?)}[\s\S]*\\maketitle/, "<h1 class=\"mume-header\">$1</h1>");

    markdown = markdown.replace(/\\vspace{(.*)?}/gm, "<p style=\"margin:$1 $1 0 0;\"></p>")

    markdown = markdown.replace(/%.*|(\\bibliography[\s\S]*)?\\end{document}/gm, "")

    // markdown = markdown.replace("align*", "aligned")
    
    // align, equation label and auto-numbering
    var reg_eq = /\\begin{equation}(\\label{(.*?)})?([\s\S]*?)\\end{equation}/gm;
    var eq_counter = 0;
    while((result = reg_eq.exec(markdown)) != null) {
      ++eq_counter;
      if (result[1] != undefined) {
        ref_word = new RegExp("\\\\ref{" + result[2] + "}", "gm");
        markdown = markdown.replace(ref_word, ($0) => eq_counter);
        ref_word2 = new RegExp("\\\\begin{equation}\\\\label{" + result[2] + "}([\\s\\S]*?)\\\\end{equation}", "gm");
        markdown = markdown.replace(ref_word2, "\\begin{equation} $1 \\tag{"+ eq_counter + "}\\end{equation}");
      }
    }

    function eq_rep_with_indent_marker(word, eq_type, eq_text, eq_type2, indent_marker) {
      if(eq_type != eq_type2) {
        return "ERROR: begin and end no match!!!!!!!!!\n" + indent_marker
      }
      if(indent_marker != "") {
        return "```math \n \\begin{" + eq_type + "} " + eq_text + "\\end{" + eq_type + "}\n```\n" + "noindent:" + indent_marker
      } else {
        return "```math \n \\begin{" + eq_type + "} " + eq_text + "\\end{" + eq_type + "}\n```\n"
      }
    }

    markdown = markdown.replace(/\\begin{(equation|equation\*|align|align\*)}([\s\S]*?)\\end{(equation|equation\*|align|align\*)}(\n|\s)(.*?)/gm, eq_rep_with_indent_marker);


    // markdown = markdown.replace(/\\begin{(align)}([\s\S]*?)\\end{(align)}\s(.*)/gm, "xxx $4 xxx");

    //bf bb cal scr
    // markdown = markdown.replace(/\\([a-zA-Z])(bf|bb|cal|scr)/gm, "\\math$2{$1}");

    // shorthands
    // markdown = markdown.replace(/\\arg(min|max)/gm, "\\mathop{\\mathrm{arg$1}}");

    // textbf and textit
    function font_rep(word, texttype, maintext) {
      if(texttype == "it") return "*" + maintext + "*";
      else return "**" + maintext + "**";
    }
    markdown = markdown.replace(/\\text(it|bf){(.*?)}/gm, font_rep);

    // itemize
    function itemize_rep(word, item_text, html) {
      item_text = item_text.replace(/\\item/gm, "\n -");
      return item_text;
    }
    markdown = markdown.replace(/\\begin{itemize}([\s\S]*?)\\end{\itemize}/gm, itemize_rep);

    // figure and table
    markdown = markdown.replace(/\\ref{(fig|tab)(.*?)}/gm, "@$1$2");


    return markdown;
  },

  onDidParseMarkdown: async function(html) {
    // theorem and lemma
    var thm =  /\\begin{(theorem|lemma)}(\[(.*?)\]){0,1}(\\label{(.*?)}){0,1}([\s\S]*?)\\end{(theorem|lemma)}/gm;
    var thm_counter = 1;
    var lem_counter = 1;
    function thm_rep(word, type, _, name, label, label_name, text) {
      if (type == "theorem") {
        var counter = thm_counter;
        var typename = "Theorem";
        ++thm_counter;
      }
      if (type == "lemma") {
        var counter = lem_counter;
        var typename = "Lemma";
        ++lem_counter;
      }

      text = text.replace(/<p.*?>|<\/p>|^\s*\n/gm, "");

      if (name == undefined) {
        return "<div id=\"" + typename+counter + "\" class=\"theorem\">\n\
      <p> <span class=\"thmtitle\" style=\"font-weight: bold;\">" + typename +" "+ counter ++ + ".</span>\
      <span class=\"thmtext\">" + text + "</span></p>\n</div>";
      } else {
        return "<div id=\"" + typename+counter + "\" class=\"theorem\">\n\
      <p> <span class=\"thmtitle\"  style=\"font-weight: bold;\">" + typename +" "+ counter ++ + ". ("+ name +  ")</span>\
      <span class=\"thmtext\">" + text + "</span></p>\n</div>";
      }
    }

    function replaceSubstring(originalString, startIndex, endIndex, newSubstring) {
      return originalString.substring(0, startIndex) + newSubstring + originalString.substring(endIndex);
    }


    function getlabel (str) {
      var ref_word, ref_word_thm;
      var typename;
      var reg = /\\begin{(lemma|theorem)}.*?\\label{(.*?)}/gm;
      var thm_counter = 0;
      var lem_counter = 0;
      var counter = 0;
      var result = null;
      while((result = reg.exec(str)) != null){
          if(result[1] == "theorem") {
              ++thm_counter;
              typename = "Theorem";
              counter = thm_counter;
          }
          if(result[1] == "lemma") {
              ++lem_counter;
              typename = "Lemma";
              counter = lem_counter;
          }
          ref_word = new RegExp("\\\\ref{" + result[2] + "}", "gm");
          ref_word_thm = new RegExp("\\\\thmref{" + result[2] + "}", "gm");
          str = str.replace(ref_word_thm, ($0) =>   typename + " " + "<a href=#" + typename+counter + ">" + counter + "</a>");
          str = str.replace(ref_word, ($0) => counter);
          //console.log(result);
      }

      // section
      // var reg_sec = /\<p\>\\(section|subsection|subsubsection)\{(.*?)\}(\\label\{sec:(.*?)\}){0,1}\<\/p\>/gm;
      var reg_sec = /\\(section|subsection|subsubsection)\{(.*?)\}(\\label\{sec:(.*?)\}){0,1}/gmd;
      var sec_counter = 0;
      var subsec_counter = 0;
      var subsubsec_counter = 0;

      while((result = reg_sec.exec(str)) != null) {
        if(result[1] == "section") {
          ++sec_counter;
          subsec_counter = 0;
          subsubsec_counter = 0;
          str = str.replace("\\ref\{sec:" + result[4] + "\}", sec_counter);
          str = replaceSubstring(str, result.indices[0][0], result.indices[0][1], "<h2 class=\"mume-header\">" + sec_counter + ". " + result[2] + "</h2>")
        } else if(result[1] == "subsection") {
          ++subsec_counter;
          subsubsec_counter = 0;
          str = str.replace("\\ref\{sec:" + result[4] + "\}", sec_counter + "." + subsec_counter);
          str = replaceSubstring(str, result.indices[0][0], result.indices[0][1], "<h3 class=\"mume-header\">" + sec_counter + "." + subsec_counter + ". " + result[2] + "</h3>")
        } else if(result[1] == "subsubsection") {
          ++subsubsec_counter;
          str = str.replace("\\ref\{sec:" + result[4] + "\}", sec_counter + "." + subsec_counter + "." + subsubsec_counter);
          str = replaceSubstring(str, result.indices[0][0], result.indices[0][1], "<h4 class=\"mume-header\">" + sec_counter + "." + subsec_counter + "." + subsubsec_counter + ". " + result[2] + "</h4>")
        }
      }

      return str;
  }

  html = getlabel(html);

  html = html.replace(
      thm, 
      thm_rep
  );

  

  // html = html.replace(/(p \S{22})noindent:/gm, "<p class=\"noindent\">xxx $1 xxx");

  html = html.replace(/<p( data-source-line=\"([0-9]{0,5})\"){0,1}>noindent\:/gm, "<p class=\"noindent\">")

  // color
  // html = html.replace(/{\\color{(.*?)}([\s\S]*?)% end of color\n}/gm, "<font color=\"$1\">$2</font>");


    return html;
  },
  
  onWillTransformMarkdown: async function(markdown) {
    return markdown;
  },
  
  onDidTransformMarkdown: async function(markdown) {
    return markdown;
  },

  processWikiLink: function({text, link}) {
    return { 
      text,  
      link: link ? link : text.endsWith('.md') ? text : `${text}.md`,
    };
  }
})
