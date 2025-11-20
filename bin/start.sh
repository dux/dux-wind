#!/bin/bash

# Start a simple Ruby web server serving the root directory
echo "Starting Ruby web server on http://localhost:8000"
echo "Visit http://localhost:8000 (auto-redirects to example)"
echo "Direct example: http://localhost:8000/example/"
ruby -run -e httpd . -p 8000