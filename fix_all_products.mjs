import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// Load credentials
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s]+)=(.+)$/);
    if (match) env[match[1]] = match[2].trim();
});

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
    console.log("🛠️  Starting Quick-Fix for all products...");
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        let count = 0;

        for (const productDoc of snapshot.docs) {
            const data = productDoc.data();
            let changed = false;
            const updates = {};

            // Convert images to Cloudinary Proxy
            if (data.images) {
                updates.images = data.images.map(url => {
                    if (url && url.includes('firebasestorage.googleapis.com')) {
                        changed = true;
                        return `https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
                    }
                    return url;
                });
            }

            // Also check videoUrl
            if (data.videoUrl && data.videoUrl.includes('firebasestorage.googleapis.com')) {
                changed = true;
                updates.videoUrl = `https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/${encodeURIComponent(data.videoUrl)}`;
            }

            if (changed) {
                await updateDoc(doc(db, 'products', productDoc.id), updates);
                console.log(`✅ Fixed: ${data.name}`);
                count++;
            }
        }
        console.log(`\n✨ DONE: ${count} products fixed. Refresh your site!`);
    } catch (err) {
        console.error("Fix failed:", err);
    }
    process.exit(0);
}

fix();
