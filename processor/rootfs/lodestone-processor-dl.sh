#!/bin/bash

# retrieve the latest lodestone-fs-publisher release info
thumb_url=$(curl -L -s https://api.github.com/repos/AnalogJ/lodestone-processor/releases/latest \
	| grep browser_download_url | grep 'lodestone-thumbnail-processor-linux-amd64' | cut -d '"' -f 4)

doc_url=$(curl -L -s https://api.github.com/repos/AnalogJ/lodestone-processor/releases/latest \
	| grep browser_download_url | grep 'lodestone-document-processor-linux-amd64' | cut -d '"' -f 4)

email_url=$(curl -L -s https://api.github.com/repos/AnalogJ/lodestone-publisher/releases/latest \
	| grep browser_download_url | grep 'lodestone-email-publisher-linux-amd64' | cut -d '"' -f 4)

# download the lodestone-processor asset here.
curl -L -o /usr/bin/lodestone-thumbnail-processor $thumb_url
curl -L -o /usr/bin/lodestone-document-processor $doc_url
curl -L -o /usr/bin/lodestone-email-publisher $email_url

# make lodestone binaries executable
chmod +x /usr/bin/lodestone-thumbnail-processor
chmod +x /usr/bin/lodestone-document-processor
chmod +x /usr/bin/lodestone-email-publisher

# ensure that the required dependencies are available (imagemagick for thumbnail-processor and tika for document-processor)
pkg-config --cflags --libs MagickWand

/usr/bin/lodestone-thumbnail-processor --version
/usr/bin/lodestone-document-processor --version
/usr/bin/lodestone-email-publisher --version
