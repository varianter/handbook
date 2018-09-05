#!/usr/bin/env node

const PromptList = require("prompt-list");
const chalk = require("chalk");

const { pages, getPage, getSection } = require("./data");
const help = require("./lib/help");

const option = process.argv[2] || "handbook";

pages()
  .then(async function(res) {
    const helpText = help(res);

    if (option === "-h" || option === "--help") {
      console.log(helpText);
      process.exit(0);
    }

    if (!res.includes(option)) {
      console.log(
        chalk.red(`Fant ikke siden ${option}
----------------------
`)
      );
      console.log(helpText);
      process.exit(1);
    }

    const page = await getPage(option);
    const allChoice = "Hele greia";

    const choices = [allChoice].concat(
      page.toc.filter(i => i.level === 2).map(i => i.content)
    );

    const promptList = new PromptList({
      name: "sections",
      default: 0,
      message: "Hva vil du lese mer om?",
      choices
    });
    const choice = await promptList.run();

    if (choice == allChoice || !choice) {
      printMd(page.output);
      process.exit(0);
    }

    const titleObject = page.toc.find(i => i.content === choice);
    printMd(
      chalk.magenta.underline.bold("# Variant Håndbok\n\n") +
        getSection(page.raw, titleObject)
    );

    function printMd(res) {
      console.log("\n" + res);
    }
  })
  .catch(console.error);
