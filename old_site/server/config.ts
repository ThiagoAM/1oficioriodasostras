import fs from "fs";
import path from "path";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

export const config = {
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "barristar",
  },
  session: {
    secret: process.env.SESSION_SECRET || "barristar-law-firm-secret-key",
  },
};
