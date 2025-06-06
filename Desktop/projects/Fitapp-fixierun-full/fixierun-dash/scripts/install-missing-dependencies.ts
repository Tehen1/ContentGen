import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// Function to extract all import statements from a file
function extractImports(filePath: string): string[] {
  try {
    if (!fs.existsSync(filePath)) return []

    const content = fs.readFileSync(filePath, "utf8")
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^\s;]+|[^\s;,]+)\s+from\s+['"]([^'"]+)['"]/g

    const imports: string[] = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return []
  }
}

// Function to check if a package is a node module (not a local import)
function isNodeModule(importPath: string): boolean {
  return !importPath.startsWith(".") && !importPath.startsWith("@/")
}

// Function to recursively scan directory for TypeScript/JavaScript files
function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)

    if (fs.statSync(filePath).isDirectory()) {
      fileList = scanDirectory(filePath, fileList)
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Main function to find and install missing dependencies
async function findAndInstallMissingDependencies() {
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

  const installedDependencies = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ])

  // Scan all TypeScript/JavaScript files
  const allFiles = scanDirectory(path.join(process.cwd(), "app"))
    .concat(scanDirectory(path.join(process.cwd(), "components")))
    .concat(scanDirectory(path.join(process.cwd(), "lib")))

  // Extract all imports
  const allImports = allFiles.flatMap((file) => extractImports(file))

  // Filter to only node modules and remove duplicates
  const nodeModuleImports = [...new Set(allImports.filter(isNodeModule))]

  // Find missing dependencies
  const missingDependencies = nodeModuleImports.filter((dep) => {
    // Extract the package name (handle scoped packages and subpaths)
    const packageName = dep.startsWith("@") ? dep.split("/").slice(0, 2).join("/") : dep.split("/")[0]

    return !installedDependencies.has(packageName)
  })

  // Install missing dependencies
  if (missingDependencies.length > 0) {
    console.log("Installing missing dependencies:", missingDependencies.join(", "))

    try {
      execSync(`npm install ${missingDependencies.join(" ")}`, { stdio: "inherit" })
      console.log("Successfully installed missing dependencies")
    } catch (error) {
      console.error("Error installing dependencies:", error)
    }
  } else {
    console.log("No missing dependencies found")
  }
}

// Run the function
findAndInstallMissingDependencies().catch(console.error)
