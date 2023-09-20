#! /usr/bin/env node

import { Command } from "commander";
import { AMQPClient } from "@cloudamqp/amqp-client";
import { randomUUID } from "crypto";
import colorize from "json-colorizer";

async function main() {
  const program = new Command();
  program
    .version("0.0.1")
    .description("A CLI for snooping on Rabbit Exchanges")
    .option("-u, --url <url>", "The URL of the RabbitMQ server")
    .option("-p, --port <port>", "The port of the RabbitMQ server")
    .option("-U, --username <username>", "The username of the RabbitMQ server")
    .option("-P, --password <password>", "The password of the RabbitMQ server")
    .option("-v, --vhost <vhost>", "The vhost of the RabbitMQ server")
    .option("-e, --exchange <exchange>", "The exchange to snoop on")
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
    exchange: options.exchange ?? "amq.topic",
    routingKey: options.routingKey,
  });
}

async function runAmqpListener(rabbitConfig: any) {
  console.log("Connecting to RabbitMQ");
  const uri = `${rabbitConfig.useSSL ? "amqps" : "amqp"}://${rabbitConfig.username}:${
    rabbitConfig.password
  }@${rabbitConfig.url}:${rabbitConfig.port}`;
  const amqp = new AMQPClient(uri);

  const queueName = `rabbit-snoop-${randomUUID().toString()}`;
  const conn = await amqp.connect();
  const channel = await conn.channel();

  console.log(`Creating queue: ${queueName}`);

  const queue = await channel.queue(queueName, { exclusive: true, autoDelete: true });

  console.log(`Binding ${queueName} to ${rabbitConfig.exchange}`);
  await queue.bind(rabbitConfig.exchange, rabbitConfig.routingKey);

  const consumer = await queue.subscribe({ noAck: true }, async (msg) => {
    console.log("=".repeat(process.stdout.columns));
    console.log(new Date().toISOString());
    console.log("Headers");
    console.log(`${colorize(JSON.stringify(msg.properties.headers))}`);
    console.log("Body");
    console.log(`${colorize(msg.bodyToString() ?? "{}")}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
