import axios from 'axios';
import FormData from 'form-data';
import stream from 'stream';

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Upload a file to Pinata (IPFS)
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - The IPFS CID
 */
export const uploadToPinata = async (fileBuffer, fileName) => {
    if (!PINATA_JWT) {
        console.warn('⚠️ PINATA_JWT not configured. Using mock CID.');
        return 'Qm_MOCK_CID_' + Math.random().toString(36).substring(7);
    }

    try {
        const formData = new FormData();

        // Create a stream from the buffer for FormData
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        formData.append('file', bufferStream, {
            filename: fileName,
        });

        const metadata = JSON.stringify({
            name: `SIIEC_EVIDENCE_${Date.now()}_${fileName}`,
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 1,
        });
        formData.append('pinataOptions', options);

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                ...formData.getHeaders()
            }
        });

        console.log(`✓ File ${fileName} pinned to IPFS: ${res.data.IpfsHash}`);
        return res.data.IpfsHash;

    } catch (error) {
        console.error('Error uploading to Pinata:', error?.response?.data || error.message);
        throw new Error('Failed to upload evidence to secure storage');
    }
};
