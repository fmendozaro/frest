echo 'Installing dependencies'
npm install
echo 'Building static assets'
npm run build
python -m SimpleHTTPServer 8082