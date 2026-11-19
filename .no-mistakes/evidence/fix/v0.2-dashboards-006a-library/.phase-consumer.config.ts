import base from './playwright.config';
export default {...base, webServer: undefined, use:{...base.use,baseURL:"http://127.0.0.1:5197"}, reporter: [['list'], ['json', {outputFile:'~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N/consumer-results.json'}]], outputDir:'~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N/consumer-output', workers: 2};
