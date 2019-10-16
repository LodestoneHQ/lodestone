#!/bin/bash

# retrieve the latest lodestone-fs-publisher release info
asset_url=$(curl -L -s https://api.github.com/repos/AnalogJ/lodestone-fs-publisher/releases/latest \
	| grep browser_download_url | grep 'lodestone-fs-publisher-linux-amd64' | cut -d '"' -f 4)

# download the lodestone-fs-publisher asset here.
curl -L -o /usr/bin/lodestone-fs-publisher $asset_url

# make lodestone-fs-publisher executable
chmod +x /usr/bin/lodestone-fs-publisher
