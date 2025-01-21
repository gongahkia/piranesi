all:config

init: 
	@echo "installing precommit hooks..."
	@pip3 install pre-commit
	@pre-commit install
	@pre-commit autoupdate
	@pre-commit run --all-files

start:
	@echo "booting up the venv..."
	@python3 -m venv myenv
	@echo "now run 'source myenv/bin/activate'..."

config:
	@echo "installing requirements..."
	@pip3 install -r requirements.txt