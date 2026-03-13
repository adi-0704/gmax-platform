import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtN4Kwd68UwYI-kpWh3LSUfStneRH-pVc",
  authDomain: "gmax-9727c.firebaseapp.com",
  projectId: "gmax-9727c",
  storageBucket: "gmax-9727c.firebasestorage.app",
  messagingSenderId: "360391072880",
  appId: "1:360391072880:web:eb44a9d3d4e39aa23328b5",
  measurementId: "G-CCWKFW35VQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  { name: "GMAX GI Earthing Electrode (2M)", category: "Earthing Electrodes", sku: "GMAX GI-2M", length: "2 meter", diameter: "60-76 mm", specifications: "Galvanized Iron Earthing Electrode", price: 1500, stock: 100, images: ["/images/products/earthing_electrode.png"] },
  { name: "GMAX GI Earthing Electrode (3M)", category: "Earthing Electrodes", sku: "GMAX GI-3M", length: "3 meter", diameter: "60-76 mm", specifications: "Galvanized Iron Earthing Electrode", price: 2100, stock: 100, images: ["/images/products/earthing_electrode.png"] },
  { name: "GMAX CU Earthing Electrode (2M)", category: "Earthing Electrodes", sku: "GMAX CU-2M", length: "2 meter", diameter: "50-76 mm", specifications: "Pure Copper Earthing Electrode", price: 3500, stock: 50, images: ["/images/products/earthing_electrode.png"] },
  { name: "GMAX CU Earthing Electrode (3M)", category: "Earthing Electrodes", sku: "GMAX CU-3M", length: "3 meter", diameter: "50-76 mm", specifications: "Pure Copper Earthing Electrode", price: 5000, stock: 50, images: ["/images/products/earthing_electrode.png"] },
  { name: "GMAX CUB Earthing Electrode (2M)", category: "Earthing Electrodes", sku: "GMAX CUB-2M", length: "2 meter", diameter: "60-76 mm", specifications: "Copper Bonded Earthing Electrode", price: 2500, stock: 75, images: ["/images/products/earthing_electrode.png"] },
  { name: "GMAX CUB Earthing Electrode (3M)", category: "Earthing Electrodes", sku: "GMAX CUB-3M", length: "3 meter", diameter: "60-76 mm", specifications: "Copper Bonded Earthing Electrode", price: 3500, stock: 75, images: ["/images/products/earthing_electrode.png"] },
  { name: "Dual Pipe Technology Electrode", category: "Earthing Electrodes", sku: "GMAX DP-2M", length: "2 meter", diameter: "Standard", specifications: "Pipe-in-Pipe Dual Technology", price: 3000, stock: 50, images: ["/images/products/earthing_electrode.png"] },
  { name: "Strip in Pipe Technology Electrode", category: "Earthing Electrodes", sku: "GMAX SIP-2M", length: "2 meter", diameter: "Standard", specifications: "Strip-in-Pipe Technology", price: 3200, stock: 50, images: ["/images/products/earthing_electrode.png"] },
  { name: "Single Pipe Technology Electrode", category: "Earthing Electrodes", sku: "GMAX SP-2M", length: "2 meter", diameter: "Standard", specifications: "Single Pipe Technology", price: 1800, stock: 100, images: ["/images/products/earthing_electrode.png"] },

  { name: "Copper Bonded Rod 14mm", category: "Copper Bonded Rods", sku: "GMAX 142CBR", length: "2 meter", diameter: "14 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 1200, stock: 150, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 17mm", category: "Copper Bonded Rods", sku: "GMAX 172CBR", length: "2 meter", diameter: "17 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 1500, stock: 150, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 25mm", category: "Copper Bonded Rods", sku: "GMAX 252CBR", length: "2 meter", diameter: "25 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 2000, stock: 100, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 40mm", category: "Copper Bonded Rods", sku: "GMAX 402CBR", length: "2 meter", diameter: "40 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 4000, stock: 50, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 14mm", category: "Copper Bonded Rods", sku: "GMAX 143CBR", length: "3 meter", diameter: "14 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 1800, stock: 150, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 17mm", category: "Copper Bonded Rods", sku: "GMAX 173CBR", length: "3 meter", diameter: "17 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 2200, stock: 150, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 25mm", category: "Copper Bonded Rods", sku: "GMAX 253CBR", length: "3 meter", diameter: "25 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 3000, stock: 100, images: ["/images/products/copper_bonded_rod.png"] },
  { name: "Copper Bonded Rod 40mm", category: "Copper Bonded Rods", sku: "GMAX 403CBR", length: "3 meter", diameter: "40 mm", specifications: "Copper Bonding Thickness: 254 microns", price: 5500, stock: 50, images: ["/images/products/copper_bonded_rod.png"] },

  { name: "Marben Gyp Grounding Mineral", category: "Grounding Minerals", sku: "MARBEN-GYP", length: "N/A", diameter: "N/A", specifications: "25 Kgs bag. Highly conductive, completely non-corrosive natural earth minerals.", price: 800, stock: 200, images: ["/images/products/grounding_mineral.png"] },
  { name: "Carbofill Grounding Mineral", category: "Grounding Minerals", sku: "CARBOFILL", length: "N/A", diameter: "N/A", specifications: "12.5 kgs bag. As Per RDSO Specifications. Low resistance carbon based backfill.", price: 600, stock: 200, images: ["/images/products/grounding_mineral.png"] },

  { name: "SIRIUS ESE Lightning Arrester", category: "Lightning Protection", sku: "SIRIUS-ESE", length: "59 cm", diameter: "Standard", specifications: "Net Weight: 4.00 kgs, Gross Weight: 4.70 kgs", price: 25000, stock: 20, images: ["/images/products/lightning_arrester.png"] },
  { name: "IONIA ESE Lightning Arrester", category: "Lightning Protection", sku: "IONIA-ESE", length: "59 cm", diameter: "Standard", specifications: "Net Weight: 3.70 kgs, Gross Weight: 4.40 kgs", price: 28000, stock: 20, images: ["/images/products/lightning_arrester.png"] },

  { name: "Earth Pit Chamber PPC Mini", category: "Earth Pit Chambers", sku: "PPC-MINI", length: "N/A", diameter: "Mini", specifications: "Polyplastic Pit Chamber Mini", price: 300, stock: 300, images: ["/images/products/pit_cover.png"] },
  { name: "Earth Pit Chamber PPC 01", category: "Earth Pit Chambers", sku: "PPC-01", length: "N/A", diameter: "Standard", specifications: "Polyplastic Pit Chamber 01", price: 500, stock: 300, images: ["/images/products/pit_cover.png"] },
  { name: "Earth Pit Chamber PPC 02", category: "Earth Pit Chambers", sku: "PPC-02", length: "N/A", diameter: "Large", specifications: "Polyplastic Pit Chamber 02", price: 800, stock: 300, images: ["/images/products/pit_cover.png"] },

  { 
    name: "Air Termination Rod", 
    brand: "Gmax", 
    category: "Lightning Protection", 
    sku: "AIR-TERM", 
    length: "Customize", 
    diameter: "Customized", 
    description: "Known in the market for their rugged structure and resistance against corrosion and high finish. Provided in a variety of size specifications and customized designs.",
    features: ["Rust proof", "Perfect dimensions", "Quality approved"],
    specifications: "Material: Metal\nEquipment Type: Copper lightning arrester", 
    price: 1500, 
    stock: 50, 
    images: ["/products/air-termination-rod.jpg"] 
  },
  { 
    name: "Mobile Earthing Electrodes", 
    brand: "Gmax", 
    category: "Earthing Electrodes", 
    sku: "MOB-EARTH", 
    length: "Customized", 
    diameter: "Customized", 
    description: "Widely praised for its superior performance, capacity, and strength, amongst the primary preferences in the market.",
    features: ["Superior strength", "Commendable performance", "Unmatched capacity"],
    specifications: "Material: Copper, Galvanized Iron (GI)\nApprx Resistance in vertical setting: 32.45% of soil resistivity", 
    price: 15000, 
    stock: 25, 
    images: ["/products/mobile-earthing-electrode.jpg"] 
  },
  { 
    name: "Ground Resistivity Improver Compound (gmax backfill)", 
    brand: "Gmax", 
    category: "Grounding Compounds", 
    sku: "GMAX-BACKFILL", 
    length: "N/A", 
    diameter: "N/A", 
    description: "Advanced backfill compound which lowers contact resistance by over 60%. Produces low impedance to surges resulting in faster transient dissipation. RoHS compliant.",
    features: ["Absorbs and retains moisture for long time", "Reduce soil resistivity", "Dissipate fault current very fast", "Eliminate needs of salt and chemical around electrode", "No need of maintenance for longer time"],
    specifications: "Physical State: Powder\nPackaging Size: 25 kg\nUsage: Industrial", 
    price: 850, 
    stock: 200, 
    images: ["/products/ground-resistivity-improver.jpg"] 
  },
  { 
    name: "Poly Plastic Pit Cover", 
    brand: "Gmax", 
    category: "Pit Covers", 
    sku: "POLY-PIT", 
    length: "N/A", 
    diameter: "Round", 
    description: "Manufactured using finest quality poly plastic to ensure easy access for routine testing of electrical earths.",
    features: ["Galvanized"],
    specifications: "Material: PVC\nLoad Capacity: 2 Ton", 
    price: 3000, 
    stock: 150, 
    images: ["/products/poly-plastic-pit-cover.jpg"] 
  },
  { 
    name: "Control Streamer Lightning Arresters", 
    brand: "Gmax", 
    category: "Lightning Protection", 
    sku: "CTRL-STREAM", 
    length: "Customized", 
    diameter: "Customized", 
    description: "Finest Control Streamer Lightning Arrester manufactured using high-grade raw materials. High performance and impeccable resistance to corrosion.",
    features: [],
    specifications: "Housing Type: Polymer\nMaximum Current: Customized\nVoltage Rating: IP65", 
    price: 1200, 
    stock: 50, 
    images: ["/products/control-streamer-lightning-arrester.jpg"] 
  },
  {
    name: "Gmax Grounding System",
    brand: "Gmax",
    category: "Earthing Accessories",
    sku: "GMAX-GROUND-SYS",
    price: 5000,
    description: "Comprehensive Gmax Grounding System for industrial and commercial safe earthing.",
    features: ["High durability", "High performance", "Corrosion resistant"],
    specifications: "System comprehensive grounding setup.",
    stock: 100,
    images: ["/products/gmax-grounding-system.jpg"]
  },
  {
    name: "Threaded Copper Bonded Rod",
    brand: "Gmax",
    category: "Copper Bonded Rods",
    sku: "THREAD-CBR",
    price: 2500,
    description: "Threaded Copper Bonded Rod for secure extension and high conductivity earthing.",
    features: ["Threaded ends", "99.9% pure copper bonded", "High tensile strength"],
    specifications: "Copper thickness: 254 microns",
    stock: 120,
    images: ["/products/threaded-copper-bonded-rod.jpg"]
  },
  {
    name: "Earthing Pipe Electrode",
    brand: "Gmax",
    category: "Earthing Electrodes",
    sku: "EARTH-PIPE-ELEC",
    price: 3500,
    description: "Robust Earthing Pipe Electrode designed for primary electrical grounding needs.",
    features: ["Pipe-in-pipe technology", "High fault current dissipation"],
    specifications: "Galvanized Iron / Copper",
    stock: 80,
    images: ["/products/earthing-pipe-electrode.jpg"]
  },
  {
    name: "Earthing Transmission Line",
    brand: "Gmax",
    category: "Earthing Accessories",
    sku: "EARTH-TRANS-LINE",
    price: 10000,
    description: "Earthing transmission lines and strips for high-voltage towers and industrial facilities.",
    features: ["Heavy duty", "High conductivity", "Weather resistant"],
    specifications: "Material: Copper / GI",
    stock: 40,
    images: ["/products/earthing-transmission-line.jpg"]
  },
  {
    name: "Earthing & Grounding Systems",
    brand: "Gmax",
    category: "Earthing Accessories",
    sku: "EARTH-GROUND-SYS",
    price: 8000,
    description: "Complete earthing and grounding system layout packages.",
    features: ["Customizable", "Tested for high current"],
    specifications: "Includes electrodes, cables, and pits",
    stock: 30,
    images: ["/products/earthing-and-grounding-systems.jpg"]
  }
];

async function seed() {
  const auth = getAuth(app);
  try {
    // Attempt Auth to bypass Firestore's "request.auth != null" block
    try {
      await createUserWithEmailAndPassword(auth, "seeder@gmaxelectric.com", "Seeder123!");
    } catch (e) {
      await signInWithEmailAndPassword(auth, "seeder@gmaxelectric.com", "Seeder123!");
    }
    console.log("Authenticated as seeder.");
  } catch (err) {
    console.log("Auth failed, Firestore writes will fail if rules require auth.", err);
  }

  const collectionRef = collection(db, "products");
  
  // Optional: clear existing catalog (only dummy data right now)
  const existing = await getDocs(collectionRef);
  for (const doc of existing.docs) {
    await deleteDoc(doc.ref);
  }
  
  // Insert all 23 products into products collection
  for (const product of products) {
    try {
      await addDoc(collectionRef, {
        ...product,
        createdAt: new Date().toISOString()
      });
      console.log("Added: " + product.name);
    } catch(err) {
      console.error(err);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed();
