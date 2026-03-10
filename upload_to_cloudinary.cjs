const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

// Load env variables manually since dotenv might not be available
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s]+)=(.+)$/);
    if (match) env[match[1]] = match[2].trim();
});

const cloud_name = env.CLOUDINARY_CLOUD_NAME;
const api_key = env.CLOUDINARY_API_KEY;
const api_secret = env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
    console.error("Missing Cloudinary credentials in .env.local");
    process.exit(1);
}

function walkDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        if (file.startsWith('.')) return; // Skip hidden
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

function uploadToCloudinary(filePath) {
    return new Promise((resolve, reject) => {
        const relativePath = path.relative(path.join(__dirname, 'public'), filePath);
        // We use underscores to match what OptimizedImage component expects (publicIdBase)
        let public_id = 'TEFA/' + relativePath.split(path.sep).join('_');
        public_id = public_id.replace(/\.[^/.]+$/, "");

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${api_secret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const ext = path.extname(filePath).toLowerCase();
        let mime = 'image/jpeg';
        if (ext === '.webp') mime = 'image/webp';
        if (ext === '.png') mime = 'image/png';
        if (ext === '.avif') mime = 'image/avif';
        if (ext === '.svg') mime = 'image/svg+xml';

        const base64Data = fs.readFileSync(filePath).toString('base64');
        const dataURI = `data:${mime};base64,${base64Data}`;

        const postData = JSON.stringify({
            file: dataURI,
            api_key: api_key,
            timestamp: timestamp,
            signature: signature,
            public_id: public_id
        });

        const options = {
            hostname: 'api.cloudinary.com',
            port: 443,
            path: `/v1_1/${cloud_name}/image/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                const result = JSON.parse(data);
                if (result.error) {
                    console.error(`Error uploading ${filePath}:`, result.error.message);
                    reject(result.error);
                } else {
                    console.log(`Uploaded ${filePath} => ${result.secure_url}`);
                    resolve(result.secure_url);
                }
            });
        });

        req.on('error', error => {
            console.error(`Request error on ${filePath}:`, error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log("Starting secure upload to Cloudinary...");
    const assetsDir = path.join(__dirname, 'public', 'assets');
    const files = walkDir(assetsDir);
    const imageFiles = files.filter(f => /\.(webp|png|jpe?g|svg|avif)$/i.test(f));

    console.log(`Found ${imageFiles.length} images to upload.`);
    for (const file of imageFiles) {
        await uploadToCloudinary(file).catch(err => console.error(`Failed to upload ${file}`));
    }
    console.log("Done uploading.");
}

main();
