# Rabbit Snoop

![NPM](https://img.shields.io/npm/l/%40cr0wst%2Frsnoop) ![npm](https://img.shields.io/npm/v/%40cr0wst%2Frsnoop) ![npm](https://img.shields.io/npm/dt/%40cr0wst/rsnoop)


[Rabbit Snoop (`rsnoop`)](https://www.npmjs.com/package/@cr0wst/rsnoop) is a CLI tool used for monitoring messages sent to [RabbitMQ](https://www.rabbitmq.com/) Exchanges.

![Screenshot of `rsnoop` in action](https://raw.githubusercontent.com/cr0wst/rsnoop/f8ae10fe29638f832ba97dd4c5815e58ab03a4c9/rsnoop-example.png)

> :exclamation: This tool is currently a work-in-progress and may undergo drastic changes in the future.

## Features

:pencil: **Zero Configuration**: `rsnoop` makes assumptions about your local RabbitMQ server, but you can override these assumptions with command line arguments.

:rainbow: **Colorized Output**: Messages are displayed with colorized output to enhance readability.

:broom: **Cleans Up After Itself**: `rsnoop` will clean up any temporary queues it created when it exits.

## Installation

You can install `rsnoop` from `npm` using the following command:

```bash
npm install -g @cr0wst/rsnoop
```

The beta tag points to the latest commit on the `main` branch. You can install it using the following command:

```bash
npm i -g @cr0wst/rsnoop@beta
```

## Usage

To view the list of available options for `rsnoop`, run the following command:

```bash
rsnoop -h
```

If run without arguments, `rsnoop` assumes the following defaults for your local RabbitMQ server:

- Host: `localhost`
- Port: `5672`
- Username: `guest`
- Password: `guest`
- Virtual Host: `/`
- Exchange: `amq.topic`

To connect to a remote server, use the following command:

```bash
rsnoop -e exchange_to_listen_to
```

If you specify multiple exchanges, then the temporary queue will bind to all of them:

```bash
rsnoop -e exchange_one exchange_two
```

## Issues

Please report any issues by opening a [Github Issue](https://github.com/cr0wst/rsnoop/issues/new).