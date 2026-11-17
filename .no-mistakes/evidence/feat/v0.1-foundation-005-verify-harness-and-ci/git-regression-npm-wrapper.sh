#!/bin/sh
/opt/homebrew/bin/npm "$@"
result=$?
if [ "$result" -eq 0 ] && [ "$1" = "install" ] && [ -f node_modules/@tensquads/ui/packages/ui/dist/tokens/index.js ]; then
 printf '%s\n' 'import "missing-consumer-dependency-for-validation";' > node_modules/@tensquads/ui/packages/ui/dist/tokens/index.js
 printf '%s\n' 'Injected a missing transitive import into the disposable consumer installation.'
fi
exit "$result"
