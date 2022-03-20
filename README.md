# SOS-Tag API

## Getting started
First, you will need to clone the repository on your local machine :

```sh
$ git clone https://github.com/SOS-Tag/sos-tag-api.git
```

### Redis configuration
The project is using [Redis](https://redis.io/) when it comes to cache. In order to get it working, you will need to install it on your computer and have a Redis instance up and running. This Redis instance is necessary in development an testing mode. When it comes to production, the instance will be running and communicate with our application in a [Docker](https://www.docker.com/) container.

#### Windows

Dowload the [3.2.100 Redis release](https://github.com/microsoftarchive/redis/releases/tag/win-3.2.100) as a MSI (Microsoft System Installer) file. Execute it and just proceed to the installation by keeping the default checking (port 6379 and 100Mb of maximum memory limit).

You can check if the instance is correctly running in at least two ways:
* Go to `C:\Program Files/Redis`, execute the `redis-cli`, and run a ping (type `ping` in the newly created command prompt). You should have a `PONG` as a response, that indicates that the connection is alive.
* Or, open your tasks manager, go to the services tab and search for the Redis service. You should see the service with the `Running` status.

#### Mac OS

Mac users can install Redis using [Homebrew](https://brew.sh/index_fr).

If you do not have it installed on your computer, you can install it by running :

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then, to install Redis, simply run :

```sh
brew update
brew install redis
```

To start redis (and have it restart at login), run :

```sh
brew services start redis
```

You can check if the instance is correctly running by running:

```sh
 redis-cli ping
```

It should return a PONG, that indicates that the connection is alive.

## Branches

You should always respect the commits and branches patterns of the organization.

On this repository, the main branch should be a the version of the application currently in production.
The staging branch is the "pre-production" branch. It is a secure branch, where actions will be performed on any PR or merge request to ensure that the code respects the conventions we fixed and that all the tests are passing.
The development branches should be created from the staging branch (or from other development branches).

## Usage

Install all the dependencies that the API needs by running:

```sh
yarn install
```

### Scripts

To run the API in development mode, run:

```sh
yarn dev
```

The API will be running at [http://localhost:8080](http://localhost:8080).
The GraphQL sandbox (used for testing our queries and mutations) is accessible at [http://localhost:8080/graphql](http://localhost:8080/graphql). You will also have access to a detailed documentation and autocompletion.

To run all the tests (contain in [/src/__tests__](https://github.com/SOS-Tag/sos-tag-api/tree/main/src/__tests__)), run:

```sh
yarn test
```

To run eslint checks ([ESLint](https://eslint.org/) is a tool we use for our code patterns), run:

```sh
yarn lint
```

To proceed to eslint fixes, run :

```sh
yarn lint:fix
```

As the API is written in [TypeScript](https://www.typescriptlang.org/), we also use type definition for our environment variables. In order to generate the types, run:

```sh
yarn gen-env
```

The definition of our environment variables will be written in [/@types/env.d.ts](https://github.com/SOS-Tag/sos-tag-api/blob/main/%40types/env.d.ts).

### Database

The API uses a MongoDB cluster. To access to the GUI of the cluster ...

## Deployment

See the relevant [deployment documentation](https://github.com/SOS-Tag/sos-tag-api/blob/main/docs/deployment.md) for details about the deployment principles and workflow.

