BIN := node_modules/.bin
DTS := node/node

all: visible.d.ts index.js
type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)

$(BIN)/tsc:
	npm install

%.js: %.ts $(BIN)/tsc type_declarations
	$(BIN)/tsc --module commonjs --target ES5 $<

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/chbrown/DefinitelyTyped/master/$* > $@

visible.d.ts: index.ts $(BIN)/tsc
	sed 's:^//// ::g' $< > module.ts
	$(BIN)/tsc --module commonjs --target ES5 --declaration module.ts
	# change the module name to a string and shave off the reference import line
	cat module.d.ts | \
		sed 's:export declare module visible:declare module "visible":' | \
		sed 's:type_declarations:../../type_declarations:' > $@
	# cleanup
	rm module.{ts,d.ts,js}
