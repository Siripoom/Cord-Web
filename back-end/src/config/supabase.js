// back-end/src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// สร้าง Supabase client สำหรับ backend (ใช้ service role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// สร้าง client สำหรับ public operations
const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const uploadToSupabase = async (file, filename) => {
  try {
    // Validate inputs
    if (!file || !file.buffer) {
      throw new Error("Invalid file object - missing buffer");
    }

    if (!filename) {
      throw new Error("Missing filename");
    }

    console.log("Starting Supabase upload:", {
      filename,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });

    const filePath = `song-images/${filename}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images") // bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL - แก้ไขการดึง URL
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    console.log("Supabase upload successful:", {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: publicUrl,
    });

    return {
      success: true,
      url: publicUrl,
      key: filePath,
      path: data.path,
      fullPath: data.fullPath,
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFromSupabase = async (filePath) => {
  try {
    // console.log("Deleting from Supabase:", filePath);

    const { data, error } = await supabase.storage
      .from("images")
      .remove([filePath]);

    if (error) {
      // console.error("Supabase delete error:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    // console.log("Supabase delete successful:", data);
    return { success: true, data };
  } catch (error) {
    // console.error("Supabase delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const testSupabaseConnection = async () => {
  try {
    // console.log("Testing Supabase connection...");

    // Test by listing files in the bucket
    const { data, error } = await supabase.storage
      .from("images")
      .list("song-images", {
        limit: 1,
      });

    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    // console.log("Supabase connection test successful");
    return {
      success: true,
      data: {
        bucketConnected: true,
        filesCount: data ? data.length : 0,
        supabaseUrl: process.env.SUPABASE_URL,
      },
    };
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return { success: false, error: error.message };
  }
};

// ฟังก์ชันใหม่สำหรับแก้ปัญหา CORS และ Public Access
export const fixSupabaseImageAccess = async () => {
  try {
    // ตรวจสอบ bucket policy
    const bucketName = "images";

    // อัพเดต bucket ให้เป็น public
    const { data, error } = await supabase.storage.updateBucket(bucketName, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    if (error) {
      console.error("Failed to update bucket:", error);
      return { success: false, error: error.message };
    }

    // console.log("Bucket updated successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fixing bucket access:", error);
    return { success: false, error: error.message };
  }
};

// Test connection on startup
(async () => {
  try {
    const result = await testSupabaseConnection();
    if (result.success) {
      // console.log("Supabase initialized successfully");

      // แก้ไข bucket access
      const fixResult = await fixSupabaseImageAccess();
      if (fixResult.success) {
        // console.log("Supabase bucket access fixed");
      }
    } else {
      console.error("Failed to initialize Supabase:", result.error);
    }
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
  }
})();

export default supabase;
