import cloudinary from "./cloudnairy.js";
import fs from "fs";

const uploadcloudnairy = async (localFilePath) => {

    // cloudinary.config({
    //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //     api_key: process.env.CLOUDINARY_API_KEY,
    //     api_secret: process.env.CLOUDINARY_API_SECRET,
    // });

    // console.log("CONFIG:", cloudinary.config());

    try {

        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                    resource_type: "image",
            }
        );
        fs.unlinkSync(localFilePath)

        return response;

    } catch (error) {

        console.log(error);

        return null;
    }
};
//const deletefromCloudnairy

// export const Deletefromcloudnair=async (public_id) => {
//     try{
//         if(!public_id) return null;
//      const response = await cloudinary.v2.uploader.destroy(public_id);
//       return response;
//     }catch(error){
//           console.log(error); 
//         return null;
//     }
    
// }
export const Deletefromcloudnair = async (public_id) => {
    try {
        if (!public_id) return null;

        const response = await cloudinary.uploader.destroy(public_id);

        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default uploadcloudnairy;