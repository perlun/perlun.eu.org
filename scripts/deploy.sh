#!/bin/bash

set -eu -o pipefail

TARGET_HOST=perlun.eu.org

if [ -z `ssh-keygen -F $TARGET_HOST` ]; then
  ssh-keyscan -H $TARGET_HOST >> ~/.ssh/known_hosts
fi

# Reset all file & directory timestamps to beginning of epoch, to make
# rsync avoid treating all files as modified.
find _site -exec touch -t 197001010000 {} +

rsync -e 'ssh -oBatchMode=yes' -gloprtv --delete ./_site/ www-data@$TARGET_HOST:perlun.eu.org
