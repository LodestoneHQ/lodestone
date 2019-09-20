# Design Document

> NOTE: Lodestone is a Work-in-Progress and is not production ready.
>
> If you want to be a tester/developer, please fill out this Google Form with your contact information: https://forms.gle/u1RXnbocbFWqfxGb9

## Components

Lodestone is made up of a handful of components, each isolated to its own Docker container.
At runtime each component is started by docker-compose, and glued together into a single application via a [reverse proxy](https://github.com/AnalogJ/lodestone/issues/31).

- **ElasticSearch cluster** - acts as data storage for all document content.
- **Collector - Filesystem Watcher** - filesystem watcher that continuously watches directories for new files to process
- **Collector - Email Watcher** - email watcher that continuously watches an inbox for new emails
- **Storage** - S3 compatible blob storage api that can be used to serve files (and thumbnails) via the UI
- **Queue** - used to coordinate and schedule Collectors
- **Web** - Static frontend for user to interact with
- **API** - extendable API layer used by Web component. Used to control all other components
- **Reverse Proxy** - Front door for application

## Routing

Components that support HTTP are available at the following routes.

- `/es`
- `/collector/email`
- `/collector/fs`
- `/storage`
- `/web`
- `/api/v1`

## Api




