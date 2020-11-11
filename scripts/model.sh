#!/usr/bin/env bash

echo "Generating English model..."
./generate-model.sh

echo "Merging result with en-US.base.json..."
./merge-model.js

echo "Copying result to each English locale..."
./copy-english-files.js
