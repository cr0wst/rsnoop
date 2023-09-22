#! /usr/bin/env node

import { Command } from "commander";
import { runGui } from "./gui";

const VERSION = require("../package.json").version;

async function main() {
  const program = new Command();

  program.version(VERSION).description("A CLI for snooping on Rabbit Exchanges");

  program
    .option("-u, --url <url>", "The URL of the RabbitMQ server")
    .option("-p, --port <port>", "The port of the RabbitMQ server")
    .option("-U, --username <username>", "The username of the RabbitMQ server")
    .option("-P, --password <password>", "The password of the RabbitMQ server")
    .option("-v, --vhost <vhost>", "The vhost of the RabbitMQ server")
    .option("-e, --exchange <exchanges...>", "The exchange to snoop on")
    .option("-s, --ssl", "Use SSL")
    .action(runGui);

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
