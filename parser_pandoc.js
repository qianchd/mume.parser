module.exports = {
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {

      // align
      markdown = markdown.replace(/\\begin{aligned}([\s\S]*?)\\end{aligned}/gm, ($0) =>  "```math\n" + $0 + "\n```\n" );

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
      // figure and table and section
      markdown = markdown.replace(/\\ref{(eq|fig|tab|sec)(.*?)}/gm, "@$1$2");
      var reg_eq = /\\begin{equation}\\label{(.*?)}([\s\S]*?)\\end{equation}/gm;
      markdown = markdown.replace(reg_eq, "$$$$ $2 $$$$ {#$1}");
      
      // section
      function sec_rep(word, sec_type, sec_name, is_label, sec_label, text, html) {
        if(sec_type == "section") var res = "##" + sec_name;
        else if(sec_type == "subsection") var res = "###" + sec_name;
        else var res = "####" + sec_name;

        if(is_label == undefined) {
          return res;
        } else {
          res = res + " {#" + sec_label + "}";
          return res;
        }
      }
      markdown = markdown.replace(/\\(section|subsection)\{(.*?)\}(\\label\{(sec:.*?)\}){0,1}/gm, sec_rep);
      
      // citation
      function citep_rep(word, citetype, citekey, text, html) {
        citekey = citekey.replace(/,/g, ", @");
        if (citetype == "citep") {
          return "(@" + citekey + ")";
        } else {
          return "@" + citekey;
        }
      }
      markdown = markdown.replace(/\\(citep|citet){(.*?)}/gm, citep_rep);

      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {

      //theorem
      var thm =  /<p>\\begin\{(theorem|lemma|condition)\}((\[|<span)([\s\S]*?)(\]|<\/span>)){0,1}(\\label\{(\S*?)\}){0,1}([\s\S]*?)\\end\{(theorem|lemma|condition)\}<\/p>/gm;
      var thm_counter = 1;
      var lem_counter = 1;
      var cdt_counter = 1;
      function thm_rep(word, type, s2, s3, name, s4, label, label_name, text, html) {
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
        if (type == "condition") {
          var counter = cdt_counter;
          var typename = "Condition";
          ++lem_counter;
        }
        // text = text.replace(/<p.*?>|<\/p>/gm, "");
        // text = text.replace(/^\s*\n/gm, "");
        // return "<p id=\"" + typename+counter + "\" class=\"thm\"> TYPE:" + type +"\nS2:" + s2 + "\nNAME:" + name + "\nLABEL:" + label + "\nLABEL_NAME:" + label_name + "\nTEXT:" + text + "</p>";
        if (name == undefined) {
          return "<p id=\"" + typename+counter + "\" class=\"thm\">\
        " + typename +" "+ counter + ". " + text + "</p>";
        } else if(s3 == "<span") {
          return "<p id=\"" + typename+counter + "\" class=\"thm\">\
          " + typename +" "+ counter + ". "+ s2 + " " + text + "</p>";
        } else {
          return "<p id=\"" + typename+counter + "\" class=\"thm\">\
          " + typename +" "+ counter + ". ("+ name + ") " + text + "</p>";
        }
      }
      function getlabel (str) {
        var ref_word, ref_word_thm;
        var typename;
        var reg = /\\begin{(lemma|theorem|condition)}[\S\s]*?\\label{(\S*?)}/gm;
        var thm_counter = 0;
        var lem_counter = 0;
        var cdt_counter = 0;
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
            if(result[1] == "condition") {
              ++cdt_counter;
              typename = "Condition";
              counter = cdt_counter;
          }
            ref_word_thm = new RegExp("\\\\ref{" + result[2] + "}", "gm");
            str = str.replace(ref_word_thm, ($0) =>   "<a href=#" + typename+counter + ">" + counter + "</a>");
            //console.log(result);
        }
        return str;
    }
    html = getlabel(html);
    html = html.replace(
        thm, 
        thm_rep
    );

    // equation
    html = html.replace(/\\qquad{\((.*?)\)}\\\]<\/span><\/span>/gm, "\\tag{$1}\\\]<\/span><\/span>");

    // color
    html = html.replace(/{\\color{(.*?)}([\s\S]*?)% end of color }/gm, "<font color=\"$1\">$2</font>");

    return resolve(html)
    })
  },
  onWillTransformMarkdown: function (markdown) {
        return new Promise((resolve, reject) => {
            return resolve(markdown);
        });
    },
  onDidTransformMarkdown: function (markdown) {
      return new Promise((resolve, reject) => {
          return resolve(markdown);
      });
  }
}