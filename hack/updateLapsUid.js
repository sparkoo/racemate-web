// updateLapsUid.js
// Script to batch update all documents in the 'laps' collection to add metadata.userUid
// Usage: node updateLapsUid.js

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the service account key JSON file
const serviceAccountPath = path.resolve(__dirname, '../.secret/racemate-3dc5c-firebase-adminsdk-fbsvc-53fc9c1e45.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateLapsUid() {
  const lapsRef = db.collection('laps');
  const snapshot = await lapsRef.get();

  const uid = 'Gl3zumYSwugd1FKsSfUA81jNPeD3';
  const batch = db.batch();
  let counter = 0;

  snapshot.forEach(doc => {
    batch.update(doc.ref, { userUid: uid, metadata: admin.firestore.FieldValue.delete() });
    counter++;
    // Firestore limits batches to 500 operations
    if (counter % 500 === 0) {
      batch.commit();
    }
  });

  await batch.commit();
  console.log('All lap documents updated with UID in metadata.');
}

updateLapsUid().catch(console.error);
