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

setup();

async function setup() {
  const files = await glob(base("src", "pages", "*.md"));
  const filteredFiles = files.map(file => {
    const base = path.basename(file, ".md");
    return [base, base == "handbook" ? "index" : base];
  });

  const pages = await compileAll(filteredFiles);
  const nav = createNav(pages);

  await Promise.all(pages.map(page => createOutputFile(nav, page)));

  return moveFiles();
}

async function compileAll(pages) {
  let output = [];
  for (let [name, alias] of pages) {
    let [toc, text] = await render(readSrc("pages", `${name}.md`));
    output.push({
      name,
      alias,
      toc,
      text,
      title: getTitle(text, name)
    });
  }
  return output;
}

function getTitle(text, name) {
  const res = /<h1.*>([^<]+)<\/h1>/gi.exec(text);
  if (!res) return name;
  return res[1];
}

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

async function createOutputFile(nav, { name, text, alias, toc }) {
  const { mtime: modified } = fs.statSync(base("src", "pages", `${name}.md`));
  const result = layout
    .replace("{{CONTENT}}", text)
    .replace("{{TOC}}", toc)
    .replace("{{NAV}}", nav)
    .replace("{{MODIFIED}}", modified)
    .replace("{{MODIFIED_STR}}", humanize(modified));

  fs.writeFileSync(base("docs", `${alias}.html`), result);
  console.log(`Created ${alias}.html`);
}

async function moveFiles() {
  try {
    const r = await copy(base("src", "static"), base("docs"), {
      overwrite: true
    });

    console.info(`Copied public files (${r.length} files)`);
  } catch (error) {
    console.error("Error copying public files: " + error);
  }
}

function humanize(m) {
  var mdate = new Date(m);
  return format(mdate, "EEEE do MMMM, yyyy. HH:mm ", { locale: nb });
}

function createNav(pages) {
  return `
    <ul class="markdownIt-TOC">
      ${pages
        .map(function({ alias, title }) {
          return `<li><a href="./${alias}.html">${title}</a></li>`;
        })
        .join("\n")}
    </ul>
  `;
}
