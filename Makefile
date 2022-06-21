install:
	npm install

publish:
	npm publish --dry-run

test-coverage:
	npm test -- --coverage --coverageProvider=v8

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest

lint:
	npx eslint .

.PHONY: test
