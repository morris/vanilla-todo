set -e
rm -rf coverage
COVERAGE=true playwright test $1
c8 report --src public --reporter text --reporter lcov
