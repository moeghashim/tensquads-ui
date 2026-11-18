import base from './playwright.config';
export default {...base, reporter: [['line']], workers: 2, outputDir: '~/.no-mistakes/evidence/01M7QZPFSSNC2R9TG3030PVBWN/playwright', webServer: {...base.webServer, command:'npm --prefix apps/preview run preview'}};
