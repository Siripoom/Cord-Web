import B2 from "backblaze-b2";
import dotenv from "dotenv";

dotenv.config();

// Debug: ตรวจสอบค่า environment variables
console.log("Backblaze B2 Native Config Debug:");
console.log(
  "BACKBLAZE_APPLICATION_KEY_ID:",
  process.env.BACKBLAZE_APPLICATION_KEY_ID ? "Set" : "Missing"
);
console.log(
  "BACKBLAZE_APPLICATION_KEY:",
  process.env.BACKBLAZE_APPLICATION_KEY ? "Set" : "Missing"
);
console.log("BACKBLAZE_BUCKET_ID:", process.env.BACKBLAZE_BUCKET_ID);
console.log("BACKBLAZE_BUCKET_NAME:", process.env.BACKBLAZE_BUCKET_NAME);

// Validate required environment variables
const requiredEnvVars = {
  BACKBLAZE_APPLICATION_KEY_ID: process.env.BACKBLAZE_APPLICATION_KEY_ID,
  BACKBLAZE_APPLICATION_KEY: process.env.BACKBLAZE_APPLICATION_KEY,
  BACKBLAZE_BUCKET_ID: process.env.BACKBLAZE_BUCKET_ID,
  BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Native Backblaze B2 configuration
const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY,
});

let authToken = null;
let uploadUrl = null;
let uploadAuthToken = null;
let apiUrl = null;
let downloadUrl = null;

// Authorize and get upload URL
const authorizeB2 = async () => {
  try {
    console.log("Authorizing with Backblaze B2...");
    const authResponse = await b2.authorize();

    authToken = authResponse.data.authorizationToken;
    apiUrl = authResponse.data.apiUrl;
    downloadUrl = authResponse.data.downloadUrl;

    console.log("B2 Authorization successful");
    console.log("API URL:", apiUrl);
    console.log("Download URL:", downloadUrl);

    // Get upload URL for the specific bucket
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_BUCKET_ID,
    });

    uploadUrl = uploadUrlResponse.data.uploadUrl;
    uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    console.log("Upload URL obtained successfully");
    console.log("Upload URL:", uploadUrl);

    return true;
  } catch (error) {
    console.error("Backblaze B2 authorization failed:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response?.data,
    });
    return false;
  }
};

export const uploadToBackblaze = async (file, filename) => {
  try {
    // Validate inputs
    if (!file || !file.buffer) {
      throw new Error("Invalid file object - missing buffer");
    }

    if (!filename) {
      throw new Error("Missing filename");
    }

    console.log("Starting B2 upload:", {
      filename,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });

    // Ensure we're authorized
    if (!authToken || !uploadUrl) {
      console.log("No auth token or upload URL, authorizing...");
      const authorized = await authorizeB2();
      if (!authorized) {
        throw new Error("Failed to authorize with Backblaze B2");
      }
    }

    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: uploadAuthToken,
      fileName: `song-images/${filename}`,
      data: file.buffer,
      mime: file.mimetype || "image/jpeg",
      info: {
        "uploaded-by": "chord-style-app",
        "upload-time": new Date().toISOString(),
        "original-name": filename,
      },
    });

    // Generate public URL - ใช้ format ที่ถูกต้องสำหรับ public bucket
    let publicUrl;

    // ลองหลายรูปแบบ URL
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME;
    const fileName = uploadResponse.data.fileName; // song-images/filename.jpg

    // Format 1: Standard B2 public URL
    publicUrl = `${downloadUrl}/file/${bucketName}/${fileName}`;

    // Format 2: Alternative format (ถ้า downloadUrl ไม่มี /file)
    if (!downloadUrl.includes("/file")) {
      publicUrl = `${downloadUrl}/file/${bucketName}/${fileName}`;
    }

    console.log("B2 upload successful:", {
      fileId: uploadResponse.data.fileId,
      fileName: uploadResponse.data.fileName,
      bucketName: bucketName,
      downloadUrl: downloadUrl,
      publicUrl: publicUrl,
      contentLength: uploadResponse.data.contentLength,
      contentSha1: uploadResponse.data.contentSha1,
    });

    // ทดสอบ URL ที่สร้างขึ้น
    console.log("Testing generated URL:", publicUrl);

    try {
      const testResponse = await fetch(publicUrl, { method: "HEAD" });
      console.log("URL test result:", {
        url: publicUrl,
        status: testResponse.status,
        ok: testResponse.ok,
        headers: {
          "content-type": testResponse.headers.get("content-type"),
          "content-length": testResponse.headers.get("content-length"),
        },
      });
    } catch (testError) {
      console.error("URL test failed:", testError.message);

      // ลอง URL format อื่น
      const alternativeUrl = `https://f004.backblazeb2.com/file/${bucketName}/${fileName}`;
      console.log("Trying alternative URL:", alternativeUrl);

      try {
        const altTestResponse = await fetch(alternativeUrl, { method: "HEAD" });
        if (altTestResponse.ok) {
          console.log("Alternative URL works:", alternativeUrl);
          publicUrl = alternativeUrl;
        }
      } catch (altError) {
        console.error("Alternative URL also failed:", altError.message);
      }
    }

    return {
      success: true,
      url: publicUrl,
      key: `song-images/${filename}`,
      fileId: uploadResponse.data.fileId,
      contentLength: uploadResponse.data.contentLength,
    };
  } catch (error) {
    console.error("B2 upload error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response?.data,
    });

    // If upload URL expired, try to re-authorize
    if (error.code === "bad_auth_token" || error.status === 401) {
      console.log("Auth token expired, re-authorizing...");
      const authorized = await authorizeB2();
      if (authorized) {
        console.log("Re-authorization successful, retrying upload...");
        // Retry upload once
        return uploadToBackblaze(file, filename);
      }
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// เพิ่มฟังก์ชันสำหรับสร้าง signed URL (สำหรับ private bucket)
export const getSignedUrl = async (fileName, validDurationInSeconds = 3600) => {
  try {
    if (!authToken) {
      await authorizeB2();
    }

    const signedUrlResponse = await b2.getDownloadAuthorization({
      bucketId: process.env.BACKBLAZE_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: validDurationInSeconds,
    });

    const signedUrl = `${downloadUrl}/file/${process.env.BACKBLAZE_BUCKET_NAME}/${fileName}?Authorization=${signedUrlResponse.data.authorizationToken}`;

    return {
      success: true,
      url: signedUrl,
      expiresAt: new Date(Date.now() + validDurationInSeconds * 1000),
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFromBackblaze = async (key, fileId = null) => {
  try {
    if (!authToken) {
      console.log("No auth token for delete, authorizing...");
      await authorizeB2();
    }

    // If we don't have fileId, we need to find it
    if (!fileId) {
      console.log("No fileId provided, searching for file...");
      const filename = key.replace("song-images/", "");

      try {
        const fileListResponse = await b2.listFileNames({
          bucketId: process.env.BACKBLAZE_BUCKET_ID,
          startFileName: key,
          maxFileCount: 1,
        });

        if (
          fileListResponse.data.files &&
          fileListResponse.data.files.length > 0
        ) {
          const file = fileListResponse.data.files.find(
            (f) => f.fileName === key
          );
          if (file) {
            fileId = file.fileId;
            console.log("Found fileId:", fileId);
          }
        }
      } catch (listError) {
        console.error("Error finding file for deletion:", listError);
      }
    }

    if (!fileId) {
      console.log("Could not find fileId for deletion, file may not exist");
      return { success: true, message: "File not found or already deleted" };
    }

    const deleteResponse = await b2.deleteFileVersion({
      fileId: fileId,
      fileName: key,
    });

    console.log("B2 delete successful:", deleteResponse.data);
    return { success: true };
  } catch (error) {
    console.error("B2 delete error:", error);
    console.error("Delete error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response?.data,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

export const testBackblazeConnection = async () => {
  try {
    console.log("Testing Backblaze B2 connection...");
    const authorized = await authorizeB2();
    if (authorized) {
      // Try to list buckets
      const bucketsResponse = await b2.listBuckets();
      const bucket = bucketsResponse.data.buckets.find(
        (b) => b.bucketName === process.env.BACKBLAZE_BUCKET_NAME
      );

      if (bucket) {
        console.log("B2 connection test successful");
        console.log("Found bucket:", {
          bucketId: bucket.bucketId,
          bucketName: bucket.bucketName,
          bucketType: bucket.bucketType,
        });

        return {
          success: true,
          data: {
            bucket: {
              bucketId: bucket.bucketId,
              bucketName: bucket.bucketName,
              bucketType: bucket.bucketType,
            },
            authToken: authToken ? "Set" : "Missing",
            uploadUrl: uploadUrl ? "Set" : "Missing",
            apiUrl: apiUrl,
            downloadUrl: downloadUrl,
          },
        };
      } else {
        throw new Error(
          `Bucket '${process.env.BACKBLAZE_BUCKET_NAME}' not found`
        );
      }
    } else {
      throw new Error("Authorization failed");
    }
  } catch (error) {
    console.error("B2 connection test failed:", error);
    return { success: false, error: error.message };
  }
};

// Initialize authorization on startup
(async () => {
  try {
    await authorizeB2();
    console.log("Backblaze B2 initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Backblaze B2:", error);
  }
})();

export default b2;
