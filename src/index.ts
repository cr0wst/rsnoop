#! /usr/bin/env node

import { Command } from "commander";
import { AMQPClient } from "@cloudamqp/amqp-client";
import { randomUUID } from "crypto";
import colorize from "json-colorizer";
import chalk from "chalk";
import figlet from "figlet";

async function main() {
  console.log(chalk.bold(figlet.textSync("rsnoop", { horizontalLayout: "full", font: "Basic" })));
  const program = new Command();
  program
    .version("1.1.0")
    .description("A CLI for snooping on Rabbit Exchanges")
    .option("-u, --url <url>", "The URL of the RabbitMQ server")
    .option("-p, --port <port>", "The port of the RabbitMQ server")
    .option("-U, --username <username>", "The username of the RabbitMQ server")
    .option("-P, --password <password>", "The password of the RabbitMQ server")
    .option("-v, --vhost <vhost>", "The vhost of the RabbitMQ server")
    .option("-e, --exchange <exchanges...>", "The exchange to snoop on")
    .option("-r, --routing-key <routingKey>", "The routing key to snoop on")
    .option("-s, --ssl", "Use SSL")
    .parse(process.argv);

  const options = program.opts();

  await runAmqpListener({
    useSSL: options.ssl ?? false,
    url: options.url ?? "localhost",
    username: options.username ?? "guest",
    password: options.password ?? "guest",
    port: options.port ?? options.ssl ? 5671 : 5672,
    vhost: options.vhost ?? "/",
    exchanges: options.exchange || ["amq.topic"],
  });
}

async function runAmqpListener(rabbitConfig: any) {
  const uri = `${rabbitConfig.useSSL ? "amqps" : "amqp"}://${rabbitConfig.username}:${
    rabbitConfig.password
  }@${rabbitConfig.url}:${rabbitConfig.port}`;

  const amqp = new AMQPClient(uri);

  const queueName = `rabbit-snoop-${randomUUID().toString()}`;

  console.log(`Establishing Connection to ${rabbitConfig.url}:${rabbitConfig.port}`);
  const conn = await amqp.connect();
  const channel = await conn.channel();

  console.log(`Creating Queue ${queueName}`);

  const queue = await channel.queue(queueName, { exclusive: true, autoDelete: true });

  for (const exchange of rabbitConfig.exchanges) {
    console.log(`Binding Queue: ${queueName} to Exchange: ${exchange}`);
    await queue.bind(exchange);
  }

  console.log("-".repeat(process.stdout.columns));
  await queue.subscribe({ noAck: true }, async (msg) => {
    const body = isValidJson(msg.bodyString())
      ? JSON.parse(msg.bodyString() ?? "")
      : msg.bodyString();
    const result = {
      headers: msg.properties.headers,
      body,
    };
    console.log(
      `${chalk.bold(
        `[${msg.exchange}] [Message ${msg.deliveryTag}]`
      )} @ ${new Date().toISOString()}`
    );
    console.log(`${colorize(JSON.stringify(result))}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

function isValidJson(str: string | null) {
  if (str === null) return false;

  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
