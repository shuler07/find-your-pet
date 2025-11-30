import { DEBUG } from "./data";

const API_KEY = import.meta.env.VITE_IMAGE_UPLOADER_API_KEY;

export async function UploadImage(img) {
    try {
        const body = new FormData();
        body.append("key", API_KEY);
        body.append("image", img);
    
        const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body
        });
    
        const data = await response.json();
        if (DEBUG) console.debug("Uploading image. Data received:", data);
    
        return data;
    } catch (error) {
        console.error("Uploading image. Error occured:", error);
        return { error: true };
    }
};