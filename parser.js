({
  onWillParseMarkdown: async function(markdown) {
    // align
    markdown = markdown.replace(/\\begin{(aligned|align)}([\s\S]*?)\\end{(aligned|align)}/gm, "```math\n\\begin{aligned}\n $2 \\end{aligned}\n```\n");

    //bf bb cal scr
    markdown = markdown.replace(/\\([a-zA-Z])(bf|bb|cal|scr)/gm, "\\math$2{$1}");

    // shorthands
    markdown = markdown.replace(/\\hM/gm, "\\widehat{\\mathcal{M}}");
    markdown = markdown.replace(/\\(cv|cvr)/gm, "\\mathrm{$1}");
    markdown = markdown.replace(/\\arg(min|max)/gm, "\\mathop{\\mathrm{arg$1}}");

    // textbf and textit
    function font_rep(word, texttype, maintext, text, html) {
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

    // equation
    var reg_eq = /\\begin{equation}\\label{(.*?)}([\s\S]*?)\\end{equation}/gm;
    var eq_counter = 0;
    while((result = reg_eq.exec(markdown)) != null) {
      ++eq_counter;
      ref_word = new RegExp("\\\\ref{" + result[1] + "}", "gm");
      markdown = markdown.replace(ref_word, ($0) => eq_counter);
      ref_word2 = new RegExp("\\\\begin{equation}\\\\label{" + result[1] + "}([\\s\\S]*?)\\\\end{equation}", "gm");
      markdown = markdown.replace(ref_word2, "\\begin{equation}$1 \\tag{"+ eq_counter + "}\\end{equation}");
    }

    // figure and table
    markdown = markdown.replace(/\\ref{(fig|tab)(.*?)}/gm, "@$1$2");

    return markdown;
  },

  onDidParseMarkdown: async function(html) {
    // theorem and lemma
    var thm =  /\\begin{(thm|lemma)}(\[(.*?)\]){0,1}(\\label{(.*?)}){0,1}([\s\S]*?)\\end{(thm|lemma)}/gm;
    var thm_counter = 1;
    var lem_counter = 1;
    function thm_rep(word, type, s2, name, label, label_name, text, html) {
      if (type == "thm") {
        var counter = thm_counter;
        var typename = "Theorem";
        ++thm_counter;
      }
      if (type == "lemma") {
        var counter = lem_counter;
        var typename = "Lemma";
        ++lem_counter;
      }
      if (name == undefined) {
        name = "";
      }
      text = text.replace(/<p.*?>|<\/p>/gm, ($1) => "");
      text = text.replace(/^\s*\n/gm, "");
      return "<div id=\"" + typename+counter + "\" class=\"theorem\">\n\
      <p> <span class=\"title\">" + typename +" "+ counter ++ + ". ("+ name +  ")</span>\
      <span class=\"thmtext\">" + text + "</span></p>\n</div>";
    }
    function getlabel (str) {
      var ref_word, ref_word_thm;
      var typename;
      var reg = /\\begin{(lemma|thm)}.*?\\label{(.*?)}/gm;
      var thm_counter = 0;
      var lem_counter = 0;
      var counter = 0;
      var result = null;
      while((result = reg.exec(str)) != null){
          if(result[1] == "thm") {
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
      var reg_sec = /\<p\>\\(section|subsection|subsubsection)\{(.*?)\}(\\label\{sec:(.*?)\}){0,1}\<\/p\>/gm;
      var sec_counter = 0;
      while((result = reg_sec.exec(str)) != null) {
        ++sec_counter;
        if(result[3] != undefined) {
          // ref_word = new RegExp(result[4], "gm");
          str = str.replace("\\ref{sec:" + result[4] + "}", sec_counter);
        }
      }
      function sec_rep(word, sec_type, sec_name, is_label, sec_label, text, html) {
        if(is_label == undefined) {
          if(sec_type == "section") return "<h2 class=\"mume-header\">" + sec_name + "</h2>";
          else if(sec_type == "subsection") return "<h3 class=\"mume-header\">" + sec_name + "</h3>";
          else return "<h4 class=\"mume-header\">" + sec_name + "</h4>";
        } else {
          if(sec_type == "section") return "<h2 class=\"mume-header\" id = \"" + sec_label + "\">" + sec_name + "</h2>";
          else if(sec_type == "subsection") return "<h3 class=\"mume-header\" id = \"" + sec_label + "\">" + sec_name + "</h3>";
          else return "<h4 class=\"mume-header\" id = \"" + sec_label + "\">" + sec_name + "</h4>";
        }
      }
      str = str.replace(/\<p\>\\(section|subsection)\{(.*?)\}(\\label\{(.*?)\}){0,1}\<\/p\>/gm, sec_rep);

      return str;
  }

  html = getlabel(html);

  html = html.replace(
      thm, 
      thm_rep
  );

  // color
  html = html.replace(/{\\color{(.*?)}([\s\S]*?)% end of color\n}/gm, "<font color=\"$1\">$2</font>");
  
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