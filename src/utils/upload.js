import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const chatStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'health_connect_chat',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'm4a', 'mp3', 'wav', 'aac'],
    },
});

const recordStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'health_connect_records',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
});

const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'health_connect_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }],
    },
});

export const uploadChat = multer({ storage: chatStorage });
export const uploadRecord = multer({ storage: recordStorage });
export const uploadProfile = multer({ storage: profileStorage });

export default uploadChat;
