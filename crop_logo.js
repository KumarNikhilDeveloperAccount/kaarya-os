const sharp = require('sharp');
const path = require('path');

const imgPath = "c:\\Users\\nkash\\Downloads\\ChatGPT Image May 30, 2026, 02_47_22 AM.png";
const darkOutPath = "c:\\kaarya-os\\public\\logo-dark.png";
const lightOutPath = "c:\\kaarya-os\\public\\logo-light.png";

async function crop() {
    try {
        const metadata = await sharp(imgPath).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Crop top 35% for dark logo (assuming it's at the top)
        await sharp(imgPath)
            .extract({ left: 0, top: 0, width: width, height: Math.floor(height * 0.35) })
            .toFile(darkOutPath);
        
        // Crop middle 35-70% for light logo
        await sharp(imgPath)
            .extract({ left: 0, top: Math.floor(height * 0.35), width: width, height: Math.floor(height * 0.35) })
            .toFile(lightOutPath);
            
        console.log("Successfully cropped logos!");
    } catch (error) {
        console.error("Error cropping image:", error);
    }
}

crop();
