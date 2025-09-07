import { verify } from 'hcaptcha';
import ApiError from './ApiError.js';

/**
 * Verify hCaptcha token
 * @param {string} token - The hCaptcha token to verify
 * @param {string} remoteip - The user's IP address (optional)
 * @returns {Promise<boolean>} - Returns true if verification is successful
 */
export const verifyHCaptcha = async (token, remoteip = null) => {
    if (!token) {
        throw new ApiError(400, "Captcha token is required");
    }

    const secret = process.env.HCAPTCHA_SECRET_KEY;
    if (!secret) {
        throw new ApiError(500, "hCaptcha secret key not configured");
    }

    try {
        const data = await verify(secret, token);
        
        if (data.success === true) {
            console.log('hCaptcha verification successful!',);
            return true;
        } else {
            console.log('hCaptcha verification failed', );
            throw new ApiError(400, "Captcha verification failed");
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('hCaptcha verification error');
        throw new ApiError(500, "Captcha verification service unavailable");
    }
};
