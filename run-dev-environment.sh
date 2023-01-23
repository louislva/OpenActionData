#!/bin/bash

# This script runs three programs simultanously:
# the backend server ("cd webapp && npm run dev")
# the chrome extension ("cd chrome-extension && npm run watch")
# the tailwind css compiler ("cd chrome-extension && npm run watch-tailwind")

# The script should be executed from the root directory of the project

# Run the server
echo "Running the server"
cd webapp
npm run dev &

# Run the chrome extension
echo "Running the chrome extension"
cd ../chrome-extension
npm run watch &

# Run the tailwind css compiler
echo "Running the tailwind css compiler"
npm run watch-tailwind

wait