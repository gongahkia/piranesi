all:config

config: 
	@echo "installing precommit hooks..."
	@pip3 install pre-commit
	@pre-commit install
	@pre-commit autoupdate
	@pre-commit run --all-files
	@echo "installing requirements..."
	@pip3 install -r requirements.txt