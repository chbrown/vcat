BIN := node_modules/.bin

all: index.js index.d.ts

$(BIN)/tsc:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d
