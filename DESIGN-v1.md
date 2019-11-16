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

## API

We have a couple of different options for our API design, `Unified`, `Direct/Component` or `Framework` API

### Unified

- We can create a comprehensive API that wraps all the functionality of our components (storage/collectors/elasticsearch),
providing a unified API that we can then iterate on
- Components with their own HTTP API's are placed under the `/api/v1/<component_name>` prefix.

    - `/api/v1/elasticsearch`
    - `/api/v1/collector/email`
    - `/api/v1/collector/fs`
    - `/api/v1/collector/queue`

- Other components that do not have an API (but need to be available via HTTP) can be accessed via top level paths

    - `/web`
    - `/storage`

- Any components that do not support a path prefix will need to have a API translation endpoint.

### Direct
While the Unified API looks nice, under the hood we're basically just adding an API layer that's passing requests to underlying components
We could just have the webapp interact with each component directly. No API necessary.

- `/elasticsearch`
- `/collector/email`
- `/collector/fs`
- `/storage`
- `/web`

### Framework
We can also use a Framework API layer, something like [Kuzzle](https://kuzzle.io/products/by-features/database-and-search-api/)
Kuzzle will wrap Elasticsearch, provide a user management system, a pluggable API layer and notification/event system.

https://loopback.io/doc/en/community/Elasticsearch-connector.html
https://github.com/nodefony/nodefony
https://moleculer.services


## Storage

Lodestone pledges to keep your files safe and leave them untouched. However file storage needs to take into account
multiple file types and sources:

- `read-only` - raw documents & files
- `write-once` - files added via email or manually via the Web UI
- `read-write` - thumbnails (re)created via collector for display in Web UI.

In addition, the files need to be accessible via the Web UI, so they need to be served via web server.

This can be done a couple of different ways:

1. Nginx container serving static content
2. Minio container with an S3 compatible API + content server.

Minio supports [WORM (Write-Once-Read-Multiple)](https://docs.min.io/docs/minio-server-configuration-guide.html#Worm) which
means that we can ensure that files written by the UI/Email are not modified.
However this would require the docker filesystem mount is `read-write` not `read-only`.

## Publisherr - Filesystem

1. `fscrawler`
    - **Pros**
        - implemented and working
        - automatically creates ES schema
        - automatic OCR using Tika
    - **Cons**
        - does not have a good status API
        - ignores files that already exist in filestore before process starts
        - unsure how to scale horizontally
2. custom using `Tika`
    - **Pros**
        - flexible, we can build it to our needs
        - Status API
        - Queue integration to scale FS watcher seperate from document OCR worker
        - file system watcher would automatically processes any documents already existing in FS when started
    - **Cons**
        - does not exist, requires development
        - more complex
        - potentially more processor intensive
        - requires a Queuing system
        - need to create an ES schema ourselves, write ES integration code ourselves.

    - **References**
        - https://docs.filerun.com/docker-tika
        - https://github.com/radovskyb/watcher/issues/66
        - https://github.com/paulmillr/chokidar

Supported Formats:

    - "*/*.doc"
    - "*/*.docx"
    - "*/*.xls"
    - "*/*.xlsx"
    - "*/*.ppt"
    - "*/*.pptx"
    - "*/*.pages"
    - "*/*.numbers"
    - "*/*.key"
    - "*/*.pdf"
    - "*/*.rtf"
    - "*/*.jpg"
    - "*/*.jpeg"
    - "*/*.png"
    - "*/*.tiff"
    - "*/*.tif"

Excluded Formats

    # mostly taken from https://github.com/github/gitignore/tree/master/Global
    - "*/.gitignore"
    - "*/.DS_Store"
    - "*/._*"
    - "*/.Spotlight-V100"
    - "*/.TemporaryItems"
    - "*/.Trashes"
    - "*/Thumbs.db"
    - "*/Thumbs.db:encryptable"
    - "*/$RECYCLE.BIN"
    - "*/*.lnk"


## Web
- https://github.com/elastic/search-ui
- https://swiftype.com/search-ui

## Dev Components

There are a handful of components that are necessary during development.

- **ElasticSearch Admin**
    - Kibana
    - [ElasticSearch Head](http://mobz.github.io/elasticsearch-head/)
    - [DejaVu](https://github.com/appbaseio/dejavu)


