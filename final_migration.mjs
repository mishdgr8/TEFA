import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

// Load env variables
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

// TELL CLOUDINARY TO GRAB THE URL DIRECTLY
async function uploadToCloudinary(fileUrl, isVideo = false) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const public_id = `TEFA/migrated_${crypto.randomBytes(4).toString('hex')}`;
        const resource_type = isVideo ? 'video' : 'image';

        // Signed request to Cloudinary sending only the URL
        const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const postData = JSON.stringify({
            file: fileUrl,  // Sending the URL directly
            api_key: env.CLOUDINARY_API_KEY,
            timestamp: timestamp,
            signature: signature,
            public_id: public_id
        });

        const options = {
            hostname: 'api.cloudinary.com',
            port: 443,
            path: `/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (creq) => {
            let data = '';
            creq.on('data', d => data += d);
            creq.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.secure_url) resolve(result.secure_url);
                    else {
                        // If Cloudinary fails to fetch from the URL, it might be the 402/400 block
                        reject(new Error(result.error?.message || 'Cloudinary Grab Failed'));
                    }
                } catch (e) {
                    reject(new Error(`Invalid response: ${data.substring(0, 50)}`));
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runMigration() {
    process.stdout.write("🚀 Starting Direct-URL Migration...\n");
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        let migratedCount = 0;

        for (const productDoc of snapshot.docs) {
            const data = productDoc.data();
            let changed = false;
            const updates = {};

            if (data.images) {
                const newImages = [];
                for (const url of data.images) {
                    if (url && (url.includes('firebasestorage') || url.includes('image/fetch'))) {
                        // Extract the original FIREBASE URL if it was already proxied
                        let sourceUrl = url;
                        if (url.includes('image/fetch')) {
                            const fetchParts = url.split('f_auto,q_auto/');
                            if (fetchParts.length > 1) {
                                sourceUrl = decodeURIComponent(fetchParts[1]);
                            }
                        }

                        process.stdout.write(`☁️  Grab for: ${data.name}... `);
                        try {
                            const newUrl = await uploadToCloudinary(sourceUrl);
                            newImages.push(newUrl);
                            changed = true;
                            process.stdout.write("✅\n");
                        } catch (e) {
                            process.stdout.write(`❌ (${e.message})\n`);
                            newImages.push(url);
                        }
                    } else {
                        newImages.push(url);
                    }
                }
                if (changed) updates.images = newImages;
            }

            if (data.videoUrl && (data.videoUrl.includes('firebasestorage') || data.videoUrl.includes('video/upload/f_auto,q_auto/'))) {
                let vSourceUrl = data.videoUrl;
                if (vSourceUrl.includes('video/upload/f_auto,q_auto/')) {
                    const vParts = vSourceUrl.split('f_auto,q_auto/');
                    if (vParts.length > 1) vSourceUrl = decodeURIComponent(vParts[1]);
                }

                process.stdout.write(`🎥 Video grab for: ${data.name}... `);
                try {
                    const newVideoUrl = await uploadToCloudinary(vSourceUrl, true);
                    updates.videoUrl = newVideoUrl;
                    changed = true;
                    process.stdout.write("✅\n");
                } catch (e) {
                    process.stdout.write(`❌ (${e.message})\n`);
                }
            }

            if (changed) {
                await updateDoc(doc(db, 'products', productDoc.id), updates);
                migratedCount++;
            }
        }
        process.stdout.write(`\n✨ DONE: ${migratedCount} products moved to permanent Cloudinary storage.\n`);
    } catch (err) {
        console.error("Migration fatal error:", err);
    }
    process.exit(0);
}

runMigration();
