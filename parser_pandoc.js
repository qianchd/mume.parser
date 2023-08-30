module.exports = {
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {
      markdown = markdown.replace(/\\begin{aligned}([\s\S]*?)\\end{aligned}/gm, ($0) =>  "```math\n" + $0 + "\n```\n" );
      markdown = markdown.replace(/\\([a-zA-Z])(bf|bb|cal|scr)/gm, "\\math$2{$1}");
      markdown = markdown.replace(/\\hM/gm, "\\widehat{\\mathcal{M}}");
      markdown = markdown.replace(/\\(cv|cvr)/gm, "\\mathrm{$1}");
      markdown = markdown.replace(/\\section{(.*?)}/gm, "## $1");
      markdown = markdown.replace(/\\subsection{(.*?)}/gm, "### $1");
      markdown = markdown.replace(/\\arg(min|max)/gm, "\\mathop{\\mathrm{arg$1}}");
      function citep_rep(word, citetype, citekey, text, html) {
        citekey = citekey.replace(/,/g, ",@");
        if (citetype == "citep") {
          return "(@" + citekey + ")";
        } else {
          return "@" + citekey;
        }
      }
      markdown = markdown.replace(/\\(citep|citet){(.*?)}/gm, citep_rep);
      markdown = markdown.replace(/\\ref{(.*?)}/gm, "@$1");

      var reg_eq = /\\begin{equation}\\label{(.*?)}([\s\S]*?)\\end{equation}/gm;
      markdown = markdown.replace(reg_eq, "$$$$ $2 $$$$ {#$1}");

      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {
      var thm =  /<p>\\begin{(thm|lemma)}({(.*?)}){0,1}(\\label{(.*?)}){0,1}<br>([\s\S]*?)\\end{(thm|lemma)}<\/p>/gm;
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
        <p class=\"title\">" + typename +" "+ counter ++ + ". "+ name +  "</p>\
        <p class=\"thmtext\">" + text + "</p>\n</div>";
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
        // var reg_eq = /\\begin{equation}\\label{(.*?)}([\s\S]*?)\\end{equation}/gm;
        // var eq_counter = 0;
        // while((result = reg_eq.exec(str)) != null){
        //   ++eq_counter;
        //   ref_word = new RegExp("\\\\ref{" + result[1] + "}", "gm");
        //   str = str.replace(ref_word, ($0) => eq_counter);
        //   ref_word2 = new RegExp("\\\\begin{equation}\\\\label{" + result[1] + "}([\\s\\S]*?)\\\\end{equation}", "gm");
        //   str = str.replace(ref_word2, "\\begin{equation}$1 \\tag{"+ eq_counter + "}\\end{equation}");
        // }
        return str;
    }

    html = getlabel(html);

    html = html.replace(
        thm, 
        thm_rep
    );

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