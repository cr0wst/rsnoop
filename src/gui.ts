import { appendMessage, init, updateConnectionDetails } from "./windowManager";
import { connect, createQueue } from "./amqp";
import { isValidJson } from "./utils";

export async function runGui(options: any) {
  init();
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

export async function runAmqpListener(rabbitConfig: any) {
  const { amqp, conn, channel } = await connect(rabbitConfig);
  const queue = await createQueue(channel, rabbitConfig);

  updateConnectionDetails({
    queue: queue.name,
    username: rabbitConfig.username,
    vhost: rabbitConfig.vhost,
    url: rabbitConfig.url,
    port: rabbitConfig.port,
    useSSL: rabbitConfig.useSSL,
    exchanges: rabbitConfig.exchanges,
  });

  await queue.subscribe({ noAck: true }, async (msg: any) => {
    const body = isValidJson(msg.bodyString())
      ? JSON.parse(msg.bodyString() ?? "")
      : msg.bodyString();
    const result = {
      timestamp: new Date().toISOString(),
      exchange: msg.exchange,
      headers: msg.properties.headers,
      body,
    };
    appendMessage(result);
  });
}

const EXAMPLE_MESSAGES = [
  // (Existing messages...)
  {
    exchange: "user_event_exchange",
    timestamp: "2021-09-22T12:00:00.000Z",
    headers: {
      event: "userLoggedIn",
      component: "authentication",
    },
    body: {
      username: "john_doe",
      email: "john_doe@example.com",
      firstName: "John",
      lastName: "Doe",
      age: 30,
      country: "USA",
      language: "English",
      status: "active",
      isAdmin: false,
      roles: ["user"],
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
  },
  {
    exchange: "payment_event_exchange",
    timestamp: "2021-09-23T15:30:00.000Z",
    headers: {
      event: "paymentDeclined",
      component: "paymentProcessing",
    },
    body: {
      amount: 120.75,
      paymentMethod: "Visa",
      currency: "USD",
      transactionID: "abc123xyz",
      customerID: "12345",
      billingAddress: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
      },
      items: [
        { id: "item1", name: "Product A", quantity: 2, price: 25.5 },
        { id: "item2", name: "Product B", quantity: 1, price: 30.25 },
      ],
      errorCode: "INVALID_CVV",
    },
  },
  {
    exchange: "user_event_exchange",
    timestamp: "2021-09-24T09:45:00.000Z",
    headers: {
      event: "userRegistered",
      component: "userManagement",
    },
    body: {
      username: "sara_smith",
      email: "sara_smith@example.com",
      firstName: "Sara",
      lastName: "Smith",
      age: 28,
      country: "Canada",
      language: "French",
      status: "active",
      isAdmin: false,
      roles: ["user"],
      preferences: {
        theme: "light",
        notifications: true,
      },
    },
  },
  {
    exchange: "payment_event_exchange",
    timestamp: "2021-09-25T14:20:00.000Z",
    headers: {
      event: "paymentRefunded",
      component: "paymentProcessing",
    },
    body: {
      amount: 50.0,
      paymentMethod: "MasterCard",
      currency: "EUR",
      transactionID: "xyz456abc",
      customerID: "54321",
      billingAddress: {
        street: "456 Oak St",
        city: "Somewhere",
        state: "NY",
        postalCode: "54321",
      },
      items: [{ id: "item3", name: "Product C", quantity: 3, price: 10.0 }],
      refundReason: "Product not as expected",
    },
  },
];
