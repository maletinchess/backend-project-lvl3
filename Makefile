install:
	npm ci

publish:
	npm publish --dry-run

test-coverage:
	NODE_OPTIONS=--experimental-vm-modules npx jest --coverage

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest

lint:
	npx eslint .

.PHONY: test
