const marked = require("marked");
const TerminalRenderer = require("marked-terminal");

marked.setOptions({
  renderer: new TerminalRenderer({
    html() {
      return "";
    }
  })
});

module.exports = marked;
