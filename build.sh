#!/bin/bash

echo "Building for production..."
meteor build ../output/ --architecture os.linux.x86_64 --server-only