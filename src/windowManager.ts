import blessed from "blessed";
import colorize from "json-colorizer";
import figlet from "figlet";
import { isValidJson } from "./utils";

// The screen object is the root node
const screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
  autoPadding: true,
});

// This list stores the messages that can be displayed in the details box.
const messageSelectionList = blessed.list({
  parent: screen,
  label: "Messages",
  width: "50%",
  height: "25%",
  top: 0,
  left: 0,
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
  border: {
    type: "line",
  },
  style: {
    selected: {
      inverse: true,
    },
  },
});

const connectionDetailsBox = blessed.box({
  parent: screen,
  label: "Connection Details",
  width: "50%",
  height: "25%",
  right: 0,
  top: 0,
  tags: true,
  border: {
    type: "line",
  },
});

// This box displays the details of the selected message.
const messageDetailsBox = blessed.box({
  parent: screen,
  top: "25%",
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  width: "100%",
  height: "70%",
});

const messageHeadersBox = blessed.box({
  parent: messageDetailsBox,
  label: "Headers",
  width: "50%",
  height: "100%",
  left: 0,
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  border: {
    type: "line",
  },
});

const messageBodyBox = blessed.box({
  parent: messageDetailsBox,
  label: "Body",
  width: "50%",
  height: "100%",
  right: 0,
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  border: {
    type: "line",
  },
});

const footer = blessed.box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: "100%",
  height: "shrink",
  tags: true,
  border: {
    type: "line",
  },
});

const instructions = blessed.text({
  parent: footer,
  left: 0,
  align: "left",
  content: "Press ESC to Quit",
});

const versionString = `rsnoop v${require("../package.json").version}`;
const version = blessed.text({
  parent: footer,
  align: "center",
  left: "center",
  content: versionString,
});

const url = blessed.text({
  parent: footer,
  align: "right",
  right: 0,
  content: `${require("../package.json").repository.url}`,
});

// Cache of messages to keep track of.
const messages: any[] = [];

export function init() {
  messageSelectionList.focus();

  // Quit on Escape, q, or Control-C.
  screen.key(["escape", "q", "C-c"], function (ch, key) {
    return process.exit(0);
  });

  messageSelectionList.on("select item", function (item: any, index: number) {
    const message = messages[index];
    messageHeadersBox.setContent(colorize(JSON.stringify(message.headers, null, 2)));
    messageBodyBox.setContent(colorize(JSON.stringify(message.body, null, 2)));

    screen.render();
  });

  screen.render();
}

export function appendMessage(message: any) {
  messages.push(message);
  messageSelectionList.addItem(buildMessageDisplayText(message));
  messageSelectionList.setScrollPerc(100);
  screen.render();
}

export function updateConnectionDetails(details: any) {
  const lines = [
    `{left}{bold}Queue:{/bold} ${details.queue}{/left}`,
    `{left}{bold}RabbitMQ:{/bold} ${details.useSSL ? "amqps" : "amqp"}://${
      details.username
    }:********@${details.url}:${details.port}${details.vhost}{/left}`,
    `{left}{bold}Exchanges:{/bold} ${details.exchanges.join(", ")}{/left}`,
  ];
  connectionDetailsBox.setContent(lines.join("\n"));
  screen.render();
}

function buildMessageDisplayText(message: any) {
  // Assuming `index` is the number you want to display
  const formattedIndex = messages.length.toString().padStart(3, "0"); // Pad with leading zeros

  return `${message.timestamp} {bold}${formattedIndex}{/bold} ${message.exchange}`;
}
