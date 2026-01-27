const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configuration
const SRC_DIR = path.join(__dirname, "../src");
const ASSETS_DIR = path.join(SRC_DIR, "assets");
const OUTPUT_DIR = path.join(__dirname, "..");
const ASSETS_JS_PATH = path.join(SRC_DIR, "assets/assets.js");

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
 * Extract asset paths from assets.js file
 */
function extractAssetsFromAssetsJS() {
  console.log("🔍 Scanning assets.js for asset usage...");

  try {
    const content = fs.readFileSync(ASSETS_JS_PATH, "utf8");

    // Match import statements: import logo from './images/logo.png'
    const importPattern =
      /import\s+([a-zA-Z0-9_]+)\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importPattern.exec(content)) !== null) {
      const assetPath = match[2];
      if (assetPath.startsWith("./")) {
        const normalizedPath = assetPath.substring(2); // Remove './'
        usedAssets.add(normalizedPath);
      }
    }

    console.log(`✅ Found ${usedAssets.size} asset references from assets.js`);
  } catch (error) {
    console.warn("Warning: Could not read assets.js:", error.message);
  }
}

/**
 * Scan assets directory and build hash map
 */
function scanAssets() {
  console.log("📁 Scanning assets directory...");

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

  function scanDirectory(dir, relativePath = "") {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativeFilePath = path.join(relativePath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath, relativePath);
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

  // Show top unused assets by size
  const unusedWithSizes = Array.from(unusedAssets)
    .map((asset) => {
      try {
        const filePath = path.join(ASSETS_DIR, asset);
        const stat = fs.statSync(filePath);
        return {
          path: asset,
          size: stat.size,
          sizeKB: (stat.size / 1024).toFixed(2),
        };
      } catch (error) {
        return { path: asset, size: 0, sizeKB: "0" };
      }
    })
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  console.log("\n📋 Top 10 largest unused assets:");
  unusedWithSizes.forEach((asset, index) => {
    console.log(`   ${index + 1}. ${asset.path} (${asset.sizeKB} KB)`);
  });
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 Starting Simple Asset Audit...\n");

  try {
    extractAssetsFromAssetsJS();
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

    console.log("\n💡 Recommendation:");
    if (unusedAssets.size > 0) {
      console.log("   - Consider removing unused assets to reduce bundle size");
      console.log("   - Move unused assets to a backup folder before deletion");
      console.log("   - Focus on large unused assets first for maximum impact");
    }
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
