rm -rf dist
mkdir dist
npx tsc --outDir dist
cp package.json dist/package.json
cp .env.$NODE_ENV dist/
npm install --prefix dist --production