import fs from 'fs';
import path from 'path';

const src = "C:\\Users\\Jean\\.gemini\\antigravity\\brain\\9e5e32e2-8086-4a04-94a0-18a6c912ff5b\\app_screenshot_mobile_1777437835761.png";
const dest = path.join(process.cwd(), 'public', 'screenshot-mobile.png');

try {
    fs.copyFileSync(src, dest);
    console.log('Screenshot copied successfully');
} catch (err) {
    console.error('Error copying screenshot:', err);
}
