all: usage

usage:
	@echo "run-dev-db - starts postgres development database"
	@echo "run-test-db - starts postgres test database"

run-dev-db:
	env $(cat .env) docker-compose up --build

run-test-db:
	env $(cat .env.testing) docker-compose up --build
