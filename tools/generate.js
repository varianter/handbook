const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const glob = require("glob-promise");

const format = require("date-fns/format");
const nb = require("date-fns/locale/nb");

const base = (...args) => path.join(__dirname, "..", ...args);
const layout = readSrc("layout.html");

const md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true
});
const markdownItTocAndAnchor = require("markdown-it-toc-and-anchor").default;

md.use(markdownItTocAndAnchor, {
  tocFirstLevel: 2,
  tocLastLevel: 2,
  anchorLink: true
});

glob(base("src", "pages", "*.md"))
  .then(function(files) {
    return Promise.all(
      files.map(function(file) {
        const base = path.basename(file, ".md");
        return renderMarkdown(base, base == "handbook" ? "index" : void 0);
      })
    );
  })
  .then(moveFiles);

function render(text) {
  const toc = new Promise(function(resolve, reject) {
    md.set({
      tocCallback: function(tocMarkdown, tocArray, tocHtml) {
        resolve(tocHtml);
      }
    });
  });
  const result = Promise.resolve(md.render(text));
  return Promise.all([toc, result]);
}

function readSrc(...filename) {
  return fs.readFileSync(base("src", ...filename)).toString("utf8");
}

function renderMarkdown(name, alias = name) {
  const { mtime: modified } = fs.statSync(base("src", "pages", `${name}.md`));

  return render(readSrc("pages", `${name}.md`)).then(function([toc, text]) {
    const result = layout
      .replace("{{CONTENT}}", text)
      .replace("{{TOC}}", toc)
      .replace("{{MODIFIED}}", modified)
      .replace("{{MODIFIED_STR}}", humanize(modified));

    fs.writeFileSync(base("docs", `${alias}.html`), result);
    console.log(`Created ${alias}.html`);
  });
}

function moveFiles() {
  copy(base("src", "static"), base("docs"), {
    overwrite: true
  })
    .then(function(r) {
      console.info(`Copied public files (${r.length} files)`);
    })
    .catch(function(error) {
      console.error("Error copying public files: " + error);
    });
}

function humanize(m) {
  var mdate = new Date(m);
  return format(mdate, "EEEE do MMMM, YYYY. HH:mm ", { locale: nb });
}
