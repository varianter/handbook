const fs = require("fs");
const path = require("path");
const glob = require("glob-promise");
const getSection = require("./lib/md-section");

const base = (...args) => path.join(__dirname, "..", ...args);

const mdToc = require("markdown-it")();
const marked = require("./lib/md");

const markdownItTocAndAnchor = require("markdown-it-toc-and-anchor").default;

function getToc(text) {
  return new Promise(function(resolve) {
    mdToc
      .use(markdownItTocAndAnchor, {
        tocFirstLevel: 2,
        tocLastLevel: 2,
        anchorLink: true,
        tocCallback: function(_, tocArray) {
          resolve(tocArray);
        }
      })
      .render(text);
  });
}

module.exports.getPage = async function getPage(name) {
  const p = base("src", `${name}.md`);
  const { mtime: modified } = fs.statSync(p);
  const raw = readSrc(p);
  const toc = await getToc(raw);

  return {
    modified,
    toc,
    raw,
    output: marked(raw)
  };
};

module.exports.pages = () =>
  glob(base("src", "*.md")).then(function(files) {
    return files.map(file => path.basename(file, ".md"));
  });

module.exports.getSection = function(raw, titleObject) {
  const text = getSection(raw, titleObject);
  return marked(text);
};

function readSrc(file) {
  return fs.readFileSync(file).toString("utf8");
}
