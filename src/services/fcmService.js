import admin from 'firebase-admin';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Parse the JSON string from environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        logger.info('Firebase Admin initializing using environment variable');
    } else {
        // Fallback to the service account key JSON file
        const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH || path.join(__dirname, '../../healthconnect-7eaa6-firebase-adminsdk-fbsvc-4c44c5196c.json');
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        logger.info('Firebase Admin initializing using service account JSON file');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    logger.info('Firebase Admin initialized successfully');
} catch (error) {
    logger.error('Firebase initialization error: ' + error.message);
}

export const sendPushNotification = async (token, title, body, data = {}) => {
    if (!admin.apps.length) {
        logger.warn('Mock send push notification (admin not initialized)', { token, title });
        return;
    }

    const message = {
        notification: {
            title,
            body
        },
        data,
        token
    };

    try {
        const response = await admin.messaging().send(message);
        logger.info('Successfully sent message:', response);
        return response;
    } catch (error) {
        logger.error('Error sending message:', error);
        throw error;
    }
};


