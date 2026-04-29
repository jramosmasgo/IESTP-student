import fs from 'fs';
import path from 'path';

const src = "C:\\Users\\Jean\\.gemini\\antigravity\\brain\\9e5e32e2-8086-4a04-94a0-18a6c912ff5b\\iestp_pwa_icon_square_1777437281849.png";
const dest1 = path.join(process.cwd(), 'public', 'icon-512.png');
const dest2 = path.join(process.cwd(), 'public', 'icon-192.png');

try {
    fs.copyFileSync(src, dest1);
    fs.copyFileSync(src, dest2);
    console.log('Icons copied successfully');
} catch (err) {
    console.error('Error copying icons:', err);
}
