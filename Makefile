all: visible.d.ts index.js

.PHONY: type_declarations

type_declarations: type_declarations/DefinitelyTyped/node/node.d.ts

%.js: %.ts | node_modules/.bin/tsc type_declarations
	node_modules/.bin/tsc --module commonjs --target ES5 $<

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

visible.d.ts: index.ts type_declarations
	sed 's:^//// ::g' $< > module.ts
	node_modules/.bin/tsc --module commonjs --target ES5 --declaration module.ts
	# change the module name to a string and shave off the reference import line
	cat module.d.ts | \
		sed 's:export declare module visible:declare module "visible":' | \
		sed 's:type_declarations:../../type_declarations:' > $@
	# cleanup
	rm module.{ts,d.ts,js}
