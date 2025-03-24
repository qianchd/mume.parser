({

  onWillParseMarkdown: async function(markdown) {
    function replaceSubstring(originalString, startIndex, endIndex, newSubstring) {
      return originalString.substring(0, startIndex) + newSubstring + originalString.substring(endIndex);
    };
    markdown = markdown.replace(/[\s\S]*\\title{(.*?)}[\s\S]*\\maketitle/, "<h1 class=\"mume-header\">$1</h1>");

    markdown = markdown.replace(/\\vspace{(.*)?}/gm, "<p style=\"margin:$1 $1 0 0;\"></p>")

    markdown = markdown.replace(/^[ \t]+|%.*|(\\bibliography[\s\S]*)?\\end{document}/gm, "")

    // markdown = markdown.replace("align*", "aligned")
    
    // align, equation label and auto-numbering
    let env_list = ["equation", "equation*", "align*", "theorem", "lemma", "proof"];
    var reg_eq = /\\begin{(equation|equation\*|align\*|theorem|lemma|proof)}(\[(.*?)\]){0,1}(\\label{(.*?)})?([\s\S]*?)\\end{(\1)}(\s\n)(.*)/gmd;
    var counter = 0;
    var eq_counter = 0;
    var thm_counter = 0;
    var lem_counter = 0;
    var sec_counter = 0;
    var subsec_counter = 0;
    var subsubsec_counter = 0;
    var env_idx = 0;
    var thetag = "";
    var typename = "";
    let label_list = [];
    let number_list = [];
    while((result = reg_eq.exec(markdown)) != null) {
      xxxx = "";
      if (result[1] == "equation") counter = ++eq_counter;
      if (result[1] == "theorem") counter = ++thm_counter;
      if (result[1] == "lemma") counter = ++lem_counter;
      if (result[4] != undefined) {
        label_list.push(result[5]);
        number_list.push(counter);
      }

      env_idx = env_list.indexOf(result[1]);
      if(env_idx <= 2) {
        if (result[4] != undefined) {
          thetag = " \\tag{" + eq_counter + "} ";
        } else {
          thetag = "";
        }

        xxxx = "\\begin{" + result[1] + "} " + result[6] + thetag + "\\end{" + result[1] +"}";
        if(result[9] != "") {
          xxxx = "```math \n" + xxxx +"\n```\n" + "noindent:" + result[9] + "\n";
        } else {
          xxxx = "```math \n" + xxxx +"\n```\n";
        }
      } else if(env_idx <= 5) {
        if (result[1] == "theorem") {
          typename = "Theorem";
        }
        if (result[1] == "lemma") {
          typename = "Lemma";
        }
        if (result[1] == "proof") {
          typename = "Proof";
        }
        if (result[2] != undefined) {
          thmname = result[3];
        } else {
          thmname = "";
        }
        xxxx = "begin" + typename + "thmcounter" + counter  + "thmname" + thmname + "thmbody" + result[6] + "end" + typename + "\n";
      }
      markdown = replaceSubstring(markdown, result.indices[0][0], result.indices[0][1], xxxx);
      reg_eq.lastIndex = result.indices[0][0] + 10;
    }

    let pattern = label_list.map((label) => {
      // 对标签字符串进行转义，防止正则表达式中的特殊字符干扰
      return label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|");
    let regex = new RegExp("\\\\ref{(" + pattern + ")?}", "gm");
    markdown = markdown.replace(regex, (match, label) => {
      // 找到标签在 label_list 中的索引
      const index = number_list[label_list.indexOf(label)];
      // 返回对应的序号（从1开始）
      return `${index}`;
    });

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
    function replaceSubstring(originalString, startIndex, endIndex, newSubstring) {
      return originalString.substring(0, startIndex) + newSubstring + originalString.substring(endIndex);
    };

    function getlabel (str) {
      var result = null;
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


  function thm_mod(word, thmtype, thmnum, thmname, thmbody) {
    if(thmtype == "Proof") {
      if(thmname == "") {
        return "<div class=\"proof\">\n\
                    <p> <span class=\"thmtitle\" style=\"font-style: italic;\">" + thmtype +".</span>\
                    <span class=\"proofbody\">" + thmbody + "<span style=\"float: right;\">&#9744</span></span></p>\n</div>";
      } else {
        return "<div class=\"proof\">\n\
                    <p> <span class=\"thmtitle\" style=\"font-style: italic;\">" + thmname + ".</span>\
                    <span class=\"proofbody\">" + thmbody + "<span style=\"float: right;\">&#9744</span></span></p>\n</div>";
      }
    }
    if(thmname == "") {
      return "<div id=\"" + thmtype+thmnum + "\" class=\"theorem\">\n\
                  <p> <span class=\"thmtitle\" style=\"font-weight: bold;\">" + thmtype +" "+ thmnum + ".</span>\
                  <span class=\"thmbody\">" + thmbody + "</span></p>\n</div>";
    } else {
      return "<div id=\"" + thmtype+thmnum + "\" class=\"theorem\">\n\
                  <p> <span class=\"thmtitle\" style=\"font-weight: bold;\">" + thmtype +" "+ thmnum + "." + "(" + thmname + ")</span>\
                  <span class=\"thmbody\">" + thmbody + "</span></p>\n</div>";
    }
  }

  html = html.replace(/begin(Theorem|Lemma|Proof)thmcounter([0-9]*?)thmname(.*?)thmbody([\s\S]*?)end\1/gm, thm_mod);
  

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
