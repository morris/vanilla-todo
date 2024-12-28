set -e
rm -rf coverage
c8 --src public --reporter text --reporter lcov playwright test --project Chromium $1
