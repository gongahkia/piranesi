all:config

config: 
	@echo "installing precommit hooks..."
	@pip3 install pre-commit
	@pre-commit install
	@pre-commit autoupdate
	@pre-commit run --all-files