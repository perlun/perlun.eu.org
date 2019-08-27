#!/bin/sh

IP=85.134.56.62

if [ -z `ssh-keygen -F $IP` ]; then
  ssh-keyscan -H $IP >> ~/.ssh/known_hosts
fi

rsync -e 'ssh -oBatchMode=yes' -gloprtv --delete ./_site/ www-data@$IP:perlun.eu.org
