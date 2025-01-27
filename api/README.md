## Description

KohortPay is a social payment platform. This API is a REST API written in Typescript using the [Nest](https://github.com/nestjs/nest) framework.
The database is postgresql with a Redis for queue management.

## Installation

# First setup

```bash
$ make first_setup
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test
```

## Other commands

```bash
# lint
$ pnpm run lint
```

```bash
# lint fix
$ pnpm run lint:fix
```

```bash
# format
$ pnpm run format
```

```bash
# download a dump from staging and load it to local db
$ pnpm run db:dump
```

```bash
# load current dump to local db
$ pnpm run db:load
```

```bash
# generate prisma types
$ pnpm run type:generate
```

```bash
# generate prisma migration
$ pnpm run migrate
```

```bash
# generate json file from openapi
$ pnpm run openapi:generate-json
```

```bash
# generate json-full file from openapi
$ pnpm run openapi:generate-json-full
```

```bash
# generate yaml file from openapi.json
$ pnpm run openapi:generate-yaml
```

```bash
# generate yaml file from openapi-full.json
$ pnpm run openapi:generate-yaml-full
```

```bash
# generate typescript sdk
$ pnpm run speakeasy:generate-sdk/typescript
```

```bash
# generate php sdk
$ pnpm run speakeasy:generate-sdk/php
```

## Auth

Several auth system are available depending on the route you are reaching.

- Public routes (`IsPublic()`) are available to anyone
- Public protected routes (`AllowPublicKey()`) are read only and can be accessed with Bearer auth and public key.
- Protected routes are available through 1. Bearer auth with SK or 2.clerk JWT + organization and livemode in the header.
- Private routes (`IsMasterKeyProtected()`) are only available with Basic auth with master key and the master key is safely stored as an env variable.

## Deployment and development process

Deployment on Heroku is automatic. Please follow the [documentation](https://www.notion.so/kohortpay/Development-Release-process-WIP-439e1485526547ab840178e92ca6c4e9?pvs=4)

## Third parties

- Activity feeds: [Getstream](https://getstream.io/activity-feeds/docs/node/?language=javascript)
- CI: [Github Actions](https://docs.github.com/en/actions)
- Emails: [Resend](https://resend.com/docs)
- Formatting: [Prettier](https://prettier.io/)
- Infrastructure: [Heroku](https://devcenter.heroku.com/categories/reference)
- Linting: [ESLint](https://eslint.org/)
- Queues: [BullMQ](https://github.com/taskforcesh/bullmq) and [Bull-board](https://github.com/felixmosh/bull-board) for the UI
- ORM: [Prisma](https://www.prisma.io/docs)
- Payment: [Stripe](https://stripe.com/docs)
- SDK: [Speakeasy](https://www.speakeasyapi.dev/docs)
- User management: [Clerk](https://clerk.com/docs)
- Webhooks: [Svix](https://docs.svix.com/)
