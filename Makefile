BIN := node_modules/.bin
DTS := node/node

all: index.js index.d.ts
type_declarations: $(DTS:%=node_modules/type_declarations/%.d.ts)

node_modules/type_declarations/%.d.ts:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$*.d.ts > $@

$(BIN)/tsc:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc type_declarations
	$(BIN)/tsc -d
