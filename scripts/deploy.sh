#!/bin/sh

IP=85.134.56.62

if [ -z `ssh-keygen -F $IP` ]; then
  ssh-keyscan -H $IP >> ~/.ssh/known_hosts
fi

# Reset all file & directory timestamps to beginning of epoch, to make
# rsync avoid treating all files as modified.
find _site -exec touch -t 197001010000 {} +

rsync -e 'ssh -oBatchMode=yes' -gloprtv --delete ./_site/ www-data@$IP:perlun.eu.org
