:: Check if NodeJS is in the right version before running the program
@echo off
(node --version & echo.) >2 & (set /p ver=)<2

if NOT %ver:~1,2% == 18 (goto changenode) else (goto site)

:changenode
nvm use 18
:: Espera 1 segundo para as mudanças ficarem disponíveis
timeout /t 1

:site
npm run dev