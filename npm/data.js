const { getHeadlines, getSection } = require("@variant/md-section");
const glob = require("glob-promise");
const path = require("path");
const fs = require("fs");

const base = (...args) => path.join(__dirname, "..", ...args);

const marked = require("./lib/md");

module.exports.getPage = function getPage(name) {
  const p = base("src", "pages", `${name}.md`);
  const { mtime: modified } = fs.statSync(p);
  const raw = readSrc(p);
  const toc = getHeadlines(raw);

  return {
    modified,
    toc,
    raw,
    output: marked(raw)
  };
};

module.exports.pages = () =>
  glob(base("src", "pages", "*.md")).then(function(files) {
    return files.map(file => path.basename(file, ".md"));
  });

module.exports.getSection = function(raw, titleObject) {
  const text = getSection(raw, titleObject);
  return marked(text);
};

function readSrc(file) {
  return fs.readFileSync(file).toString("utf8");
}
