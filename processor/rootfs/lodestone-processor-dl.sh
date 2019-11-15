#!/bin/bash

# retrieve the latest lodestone-fs-publisher release info
asset_url=$(curl -L -s https://api.github.com/repos/AnalogJ/lodestone-processor/releases/latest \
	| grep browser_download_url | grep 'lodestone-processor-linux-amd64' | cut -d '"' -f 4)

# download the lodestone-processor asset here.
curl -L -o /usr/bin/lodestone-processor $asset_url

# make lodestone-processor executable
chmod +x /usr/bin/lodestone-processor
/usr/bin/lodestone-processor --version
