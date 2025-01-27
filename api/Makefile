first_setup: ;
	brew install node@20
	brew link --overwrite node@20
	brew install postgresql@15
	brew link --overwrite postgresql@15
	brew install docker
	brew install docker-compose
	brew install speakeasy-api/homebrew-tap/speakeasy
	git config core.ignorecase false
	npm install -g pnpm || true
	code --install-extension bradlc.vscode-tailwindcss
	code --install-extension dbaeumer.vscode-eslint
	code --install-extension eamodio.gitlens
	code --install-extension esbenp.prettier-vscode
	code --install-extension ms-azuretools.vscode-docker
	code --install-extension ms-vscode-remote.remote-containers
	code --install-extension ms-vscode.makefile-tools
	code --install-extension ms-vsliveshare.vsliveshare
	code --install-extension PKief.material-icon-theme
	code --install-extension Prisma.prisma
	code --install-extension yoavbls.pretty-ts-errors
	cp .env.example .env
	pnpm add -g pnpm
	pnpm i
	docker-compose up -d
	pnpm run db:dump
	pnpm run start:dev

clean : ;
	rm -rf node_modules
	rm -rf dist