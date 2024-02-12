const admin = require('firebase-admin');

const serviceAccount = require('./ecovoyage-6ee0d-firebase-adminsdk-x6ce8-1cee5487dc');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://ecovoyage-6ee0d.appspot.com',
});

const storage = admin.storage();
const bucket = storage.bucket();

module.exports = {
    bucket,
    uploadFileToFirebase: (file, fileName) => {
        return new Promise((resolve, reject) => {
            const fileUpload = bucket.file(fileName);
            const blobStream = fileUpload.createWriteStream();

            blobStream.on("finish", () => {
                const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name
                    }/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
                resolve(fileUrl);
            });

            blobStream.on("error", (error) => {
                reject(error);
            });

            blobStream.end(file.buffer);
        });
    },
};
