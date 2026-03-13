import fs from 'fs';
import path from 'path';
import tesseract from 'tesseract.js';
import { Jimp } from 'jimp';

const brainDir = 'c:\\Users\\aditya tyagi\\.gemini\\antigravity\\brain\\2cdcf122-f860-4d26-aa26-310a139f2159';
const publicDir = 'c:\\Users\\aditya tyagi\\OneDrive\\Desktop\\antigravity\\gmax-platform\\frontend\\public\\products';

const matchRules = [
  { keywords: ['resistivity', 'backfill', 'compound', 'gmax backfill'], target: 'ground-resistivity-improver.jpg' },
  { keywords: ['mobile', 'electrodes', 'earthing electrodes'], target: 'mobile-earthing-electrode.jpg' },
  { keywords: ['air', 'termination', 'rod', 'lightning'], target: 'air-termination-rod.jpg' },
  { keywords: ['control', 'streamer'], target: 'control-streamer-lightning-arrester.jpg' },
  { keywords: ['poly', 'plastic', 'cover', 'pit'], target: 'poly-plastic-pit-cover.jpg' },
  { keywords: ['grounding', 'system', 'systems', 'comprehensive'], target: 'gmax-grounding-system.jpg' },
  { keywords: ['threaded', 'copper', 'bonded', 'rod'], target: 'threaded-copper-bonded-rod.jpg' },
  { keywords: ['earthing', 'pipe', 'electrode'], target: 'earthing-pipe-electrode.jpg' },
  { keywords: ['transmission', 'line', 'lines', 'strips'], target: 'earthing-transmission-line.jpg' },
  { keywords: ['earthing', '&', 'grounding', 'comprehensive', 'layout'], target: 'earthing-and-grounding-systems.jpg' }
];

async function processImages() {
  const allFiles = fs.readdirSync(brainDir);
  const mediaFiles = allFiles.filter(f => f.startsWith('media__'));
  
  // Track mapped targets so we don't overwrite if we find a better match
  const processedTargets = new Set();
  
  for (const file of mediaFiles) {
    const filePath = path.join(brainDir, file);
    
    console.log(`Processing ${file}...`);
    
    try {
        const { data: { text } } = await tesseract.recognize(filePath, 'eng', { logger: m => {} });
        const lowerText = text.toLowerCase();
        
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
        
        if (bestTarget && maxMatches > 0 && !processedTargets.has(bestTarget)) {
            console.log(` -> Matched with: ${bestTarget} (score: ${maxMatches})`);
            
            // Crop and save
            const image = await Jimp.read(filePath);
            // Dynamic check, maybe the image is narrow or wide, let's use the basic crop
            // Example box: x: 15, y: 70, width: 310, height: 320
            image.crop({ x: 15, y: 70, w: 320, h: 320 });
            
            const outPath = path.join(publicDir, bestTarget);
            await image.write(outPath);
            console.log(` -> Successfully saved cropped image to ${outPath}`);
            processedTargets.add(bestTarget);
            
        } else {
            console.log(` -> Could not match OCR text or already processed for ${file}.`);
        }
    } catch (err) {
        console.log(`Error processing ${file}: ${err.message}`);
    }
  }
}

processImages().then(() => console.log('Done')).catch(console.error);
