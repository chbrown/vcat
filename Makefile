BIN := node_modules/.bin

all: index.js index.d.ts .npmignore .gitignore

.npmignore: tsconfig.json
	echo index.ts Makefile tsconfig.json | tr ' ' '\n' > $@

.gitignore: tsconfig.json
	echo index.js index.d.ts | tr ' ' '\n' > $@

$(BIN)/tsc:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d
