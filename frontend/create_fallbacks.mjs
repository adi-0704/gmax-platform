import fs from 'fs';
import path from 'path';

const publicDir = 'c:\\Users\\aditya tyagi\\OneDrive\\Desktop\\antigravity\\gmax-platform\\frontend\\public';
const sourceImage = path.join(publicDir, 'images', 'products', 'product_placeholder.png');
const targetDir = path.join(publicDir, 'products');

const files = [
  'air-termination-rod.jpg',
  'mobile-earthing-electrode.jpg',
  'ground-resistivity-improver.jpg',
  'poly-plastic-pit-cover.jpg',
  'control-streamer-lightning-arrester.jpg',
  'gmax-grounding-system.jpg',
  'threaded-copper-bonded-rod.jpg',
  'earthing-pipe-electrode.jpg',
  'earthing-transmission-line.jpg',
  'earthing-and-grounding-systems.jpg'
];

if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

files.forEach(file => {
  const targetPath = path.join(targetDir, file);
  fs.copyFileSync(sourceImage, targetPath);
  console.log('Created placeholder:', targetPath);
});
