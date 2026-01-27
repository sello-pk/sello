const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configuration
const SRC_DIR = path.join(__dirname, "../src");
const ASSETS_DIR = path.join(SRC_DIR, "assets");
const OUTPUT_DIR = path.join(__dirname, "..");

// File extensions to scan
const CODE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];
const ASSET_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".mp4",
  ".webm",
  ".pdf",
];

// Results storage
const usedAssets = new Set();
const assetHashes = new Map();
const duplicateAssets = new Map();
const unusedAssets = new Set();

/**
 * Calculate file hash for duplicate detection
 */
function calculateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract asset paths from file content
 */
function extractAssetPaths(content, filePath) {
  const assetPaths = [];

  // Match various import patterns
  const patterns = [
    // Static imports: import logo from '../assets/logo.png'
    /import\s+([a-zA-Z0-9_]+)\s+from\s+['"`]([^'"`]+assets\/[^'"`]+)['"`]/g,
    // Dynamic imports: require('../assets/image.jpg')
    /require\s*\(['"`]([^'"`]+assets\/[^'"`]+)['"`]/g,
    // Image src attributes: src="../assets/image.png"
    /src\s*=\s*['"`]([^'"`]+assets\/[^'"`]+)['"`]/g,
    // Background images: background-image: url('../assets/image.png')
    /background-image\s*:\s*url\(['"`]([^'"`]+assets\/[^'"`]+)['"`]/g,
    // Public folder references: /assets/image.png
    /['"`]\/assets\/[^'"`]+['"`]/g,
    // Assets object: assets.logo
    /assets\.[a-zA-Z0-9_]+\s*=\s*['"`]([^'"`]+)['"`]/g,
    // Import from assets: from '../assets/'
    /from\s+['"`]([^'"`]*assets\/[^'"`]+)['"`]/g,
    // Direct asset paths in quotes
    /['"`]assets\/[^'"`]+['"`]/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      let assetPath = match[1];

      // For import statements, use the second capture group if available
      if (match[2] && match[2].includes("assets/")) {
        assetPath = match[2];
      } else if (match[1] && match[1].includes("assets/")) {
        assetPath = match[1];
      }

      // Clean up the path
      assetPath = assetPath
        .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
        .replace(/^['"`]|['"`]$/g, "") // Remove any remaining quotes
        .replace(/^['"`]|['"`]$/g, "") // Remove any remaining quotes
        .replace(/['"`]/g, ""); // Remove all quotes

      // Normalize path
      if (assetPath.startsWith("/assets/")) {
        assetPath = assetPath.substring(1); // Remove leading /
      }

      if (assetPath.startsWith("assets/")) {
        assetPaths.push(assetPath);
      }
    }
  });

  return assetPaths;
}

/**
 * Scan all code files for asset usage
 */
function scanCodeFiles() {
  console.log("🔍 Scanning code files for asset usage...");

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (!["node_modules", ".git", "dist", "build"].includes(file)) {
          scanDirectory(filePath);
        }
      } else if (CODE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          const assetPaths = extractAssetPaths(content, filePath);

          assetPaths.forEach((assetPath) => {
            usedAssets.add(assetPath);
          });
        } catch (error) {
          console.warn(
            `Warning: Could not read file ${filePath}:`,
            error.message,
          );
        }
      }
    }
  }

  scanDirectory(SRC_DIR);
  console.log(`✅ Found ${usedAssets.size} asset references`);
}

/**
 * Scan assets directory and build hash map
 */
function scanAssets() {
  console.log("📁 Scanning assets directory...");

  function scanDirectory(dir, relativePath = "") {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativeFilePath = path.join(relativePath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath, relativeFilePath);
      } else if (ASSET_EXTENSIONS.some((ext) => file.endsWith(ext))) {
        const hash = calculateFileHash(filePath);
        if (hash) {
          assetHashes.set(relativeFilePath, hash);

          // Check for duplicates
          if (duplicateAssets.has(hash)) {
            duplicateAssets.get(hash).push(relativeFilePath);
          } else {
            duplicateAssets.set(hash, [relativeFilePath]);
          }
        }
      }
    }
  }

  scanDirectory(ASSETS_DIR);
  console.log(`✅ Found ${assetHashes.size} asset files`);
}

/**
 * Identify unused assets
 */
function identifyUnusedAssets() {
  console.log("🔍 Identifying unused assets...");

  for (const [assetPath] of assetHashes) {
    if (!usedAssets.has(assetPath)) {
      unusedAssets.add(assetPath);
    }
  }

  console.log(`✅ Found ${unusedAssets.size} unused assets`);
}

/**
 * Generate reports
 */
function generateReports() {
  console.log("📊 Generating reports...");

  // Unused assets report
  const unusedReport = {
    timestamp: new Date().toISOString(),
    totalAssets: assetHashes.size,
    usedAssets: usedAssets.size,
    unusedAssets: Array.from(unusedAssets).sort(),
    unusedCount: unusedAssets.size,
    unusedSize: Array.from(unusedAssets).reduce((total, asset) => {
      try {
        const filePath = path.join(ASSETS_DIR, asset);
        const stat = fs.statSync(filePath);
        return total + stat.size;
      } catch (error) {
        return total;
      }
    }, 0),
  };

  // Duplicate assets report
  const duplicateReport = {
    timestamp: new Date().toISOString(),
    duplicateGroups: Array.from(duplicateAssets.entries())
      .filter(([hash, files]) => files.length > 1)
      .map(([hash, files]) => ({
        hash,
        files: files.sort(),
        count: files.length,
      }))
      .sort((a, b) => b.count - a.count),
  };

  // Write reports
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "unused-assets.json"),
    JSON.stringify(unusedReport, null, 2),
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "duplicate-assets.json"),
    JSON.stringify(duplicateReport, null, 2),
  );

  console.log("📄 Reports generated:");
  console.log(
    `   - unused-assets.json (${unusedReport.unusedCount} files, ${(unusedReport.unusedSize / 1024 / 1024).toFixed(2)} MB)`,
  );
  console.log(
    `   - duplicate-assets.json (${duplicateReport.duplicateGroups.length} duplicate groups)`,
  );
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 Starting Asset Audit...\n");

  try {
    scanCodeFiles();
    scanAssets();
    identifyUnusedAssets();
    generateReports();

    console.log("\n✅ Asset audit completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Total assets: ${assetHashes.size}`);
    console.log(`   Used assets: ${usedAssets.size}`);
    console.log(`   Unused assets: ${unusedAssets.size}`);
    console.log(
      `   Duplicate groups: ${Array.from(duplicateAssets.values()).filter((files) => files.length > 1).length}`,
    );
  } catch (error) {
    console.error("❌ Error during asset audit:", error);
    process.exit(1);
  }
}

// Run the audit
if (require.main === module) {
  main();
}

module.exports = { main };
