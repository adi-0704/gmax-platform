import fs from 'fs';
import path from 'path';
import tesseract from 'tesseract.js';
import { Jimp } from 'jimp';

const brainDir = 'c:\\Users\\aditya tyagi\\.gemini\\antigravity\\brain\\2cdcf122-f860-4d26-aa26-310a139f2159';
const publicDir = 'c:\\Users\\aditya tyagi\\OneDrive\\Desktop\\antigravity\\gmax-platform\\frontend\\public\\products';

const filesToProcess = [
  'media__1772866396952.png',
  'media__1772866396982.png',
  'media__1772866397055.png',
  'media__1772866397076.png',
  'media__1772866397109.png'
];

const matchRules = [
  { keywords: ['resistivity', 'backfill', 'compound', 'gmax backfill'], target: 'ground-resistivity-improver.jpg' },
  { keywords: ['mobile', 'electrodes', 'earthing electrodes'], target: 'mobile-earthing-electrode.jpg' },
  { keywords: ['streamer', 'lightning', 'arresters', 'control'], target: 'control-streamer-lightning-arrester.jpg' },
  { keywords: ['poly', 'plastic', 'cover', 'pit'], target: 'poly-plastic-pit-cover.jpg' },
  { keywords: ['threaded', 'copper', 'bonded', 'rod'], target: 'threaded-copper-bonded-rod.jpg' }
];

async function processImages() {
  for (const file of filesToProcess) {
    const filePath = path.join(brainDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file}, not found.`);
      continue;
    }
    
    console.log(`Processing ${file}...`);
    
    try {
        const { data: { text } } = await tesseract.recognize(filePath, 'eng', { logger: m => {} });
        const lowerText = text.toLowerCase();
        
        // Find best match based on highest number of keyword matches
        let bestTarget = null;
        let maxMatches = 0;
        
        for (const rule of matchRules) {
            let matches = 0;
            for (const kw of rule.keywords) {
                if (lowerText.includes(kw)) matches++;
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestTarget = rule.target;
            }
        }
        
        if (bestTarget && maxMatches > 0) {
            console.log(` -> Matched with: ${bestTarget} (score: ${maxMatches})`);
            
            // Crop and save
            const image = await Jimp.read(filePath);
            // Example box: x: 15, y: 70, width: 310, height: 320
            image.crop({ x: 15, y: 70, w: 320, h: 320 });
            
            const outPath = path.join(publicDir, bestTarget);
            await image.write(outPath);
            console.log(` -> Successfully saved cropped image to ${bestTarget}`);
            
        } else {
            console.log(` -> Could not match OCR text for ${file}. Text preview: ${text.substring(0, 50)}...`);
        }
    } catch (err) {
        console.log(`Error processing ${file}: ${err.message}`);
    }
  }
}

processImages().then(() => console.log('Done')).catch(console.error);
