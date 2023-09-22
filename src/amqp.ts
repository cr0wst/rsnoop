import { AMQPClient } from "@cloudamqp/amqp-client";
import { randomUUID } from "crypto";

export async function connect(rabbitConfig: any) {
  const uri = `${rabbitConfig.useSSL ? "amqps" : "amqp"}://${rabbitConfig.username}:${
    rabbitConfig.password
  }@${rabbitConfig.url}:${rabbitConfig.port}`;

  const amqp = new AMQPClient(uri);

  const conn = await amqp.connect();
  const channel = await conn.channel();

  return { amqp, conn, channel };
}

export async function createQueue(channel: any, rabbitConfig: any) {
  const queueName = `rabbit-snoop-${randomUUID().toString()}`;
  const queue = await channel.queue(queueName, { exclusive: true, autoDelete: true });

  for (const exchange of rabbitConfig.exchanges) {
    await queue.bind(exchange);
  }

  return queue;
}
