# Lodestone - Personal Document Search & Archive

> NOTE: Lodestone is a Work-in-Progress and is not production ready.


Lodestone is designed to be the modern and digital equivalent of a home filing cabinet.
If you've gone searching for something similar in the past, you might be familiar with terms like Electronic Document
Management System (EDMS), Document Management System (DMS) or Personal Archival.

Lodestone is designed around a handful of core features:

- **Full text document search** - It doesn't matter what format you're document is in, we should be able to parse it (using OCR) and let you search for the text.
- **Rich tagging** - Unlike a physical file cabinet where a document can only exist in one place, digital documents support tags, allowing you to create a flexible organizational structure that works for you.
- **Automated** - Document collection & OCR processing should be automatic. Just saving a file to your network drive should be enough to start document processing.
- **Non-destructive** - When Lodestone processes a document, the original file will be left untouched, exactly where you left it.

# Screenshot

![Dashboard](docs/screenshots/dashboard.png)

More screenshots available in the [docs/screenshots](docs/screenshots) directory.


# Installation
Lodestone is made up of a handful of open-source components, and as such its easiest to deploy using Docker/Docker Compose

```bash
docker-compose up
```



# What about..

As mentioned above, Lodestone isn't some magical new technology. EDMS and DMS systems have been around for a long time,
but unfortunately they all seem to miss one or more features that I think are required for a modern filing cabinet.

Here's some of my research, but you should take a look at them yourselves.

| Name  | Docker/Linux | Web UI | Modern UI | Tagging | Non-destructive | OCR | Watch Folder | Email Import |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [MayanEDMS](https://www.mayan-edms.com/) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| [Paperless](https://github.com/the-paperless-project/paperless) | :white_check_mark: | :white_check_mark: | :heavy_exclamation_mark: | :white_check_mark: | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: |



# Contributing

```bash
# run the following command in 1 terminal
docker-compose up -f docker-compose.dev.yml --force-recreate --build

# and the following in a different terminal
cd web && ng build --output-path ./dist --base-href "/" --prod --watch

```



# Notes:
If your documents already exist, you may need to touch the files in the watchfolder directory to trigger parsing by fascrawler.



# Logo
- [rock by Dobs from the Noun Project](https://thenounproject.com/term/rock/481051)



Rock
Mineral
Geode
Crystal
Mine
Gem
