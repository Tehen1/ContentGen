import fs from "fs"
import path from "path"

// Function to extract all import statements from a file
function extractComponentImports(filePath: string): { source: string; imports: string[] }[] {
  try {
    if (!fs.existsSync(filePath)) return []

    const content = fs.readFileSync(filePath, "utf8")

    // Match import statements for components
    const importRegex = /import\s+(?:{([^}]*)}|([^\s{},]+))\s+from\s+['"]([^'"]+)['"]/g

    const imports: { source: string; imports: string[] }[] = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const source = match[3]

      // Skip node modules
      if (!source.startsWith(".") && !source.startsWith("@/")) continue

      // Handle default and named imports
      const defaultImport = match[2]
      const namedImports = match[1] ? match[1].split(",").map((s) => s.trim()) : []

      // Filter out type imports
      const componentImports = [
        ...(defaultImport ? [defaultImport] : []),
        ...namedImports.filter((imp) => !imp.startsWith("type ")),
      ].filter(Boolean)

      if (componentImports.length > 0) {
        imports.push({
          source,
          imports: componentImports,
        })
      }
    }

    return imports
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return []
  }
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

// Function to resolve the actual file path from an import path
function resolveImportPath(importPath: string, currentFilePath: string): string | null {
  try {
    // Handle @/ imports (assuming they start from the project root)
    if (importPath.startsWith("@/")) {
      const rootRelativePath = importPath.replace("@/", "")

      // Try different extensions
      const extensions = [".tsx", ".ts", ".jsx", ".js"]
      for (const ext of extensions) {
        const fullPath = path.join(process.cwd(), rootRelativePath + ext)
        if (fs.existsSync(fullPath)) {
          return fullPath
        }
      }

      // Try as directory with index file
      for (const ext of extensions) {
        const indexPath = path.join(process.cwd(), rootRelativePath, `index${ext}`)
        if (fs.existsSync(indexPath)) {
          return indexPath
        }
      }
    }
    // Handle relative imports
    else if (importPath.startsWith(".")) {
      const currentDir = path.dirname(currentFilePath)
      const relativePath = path.join(currentDir, importPath)

      // Try different extensions
      const extensions = [".tsx", ".ts", ".jsx", ".js"]
      for (const ext of extensions) {
        const fullPath = relativePath + ext
        if (fs.existsSync(fullPath)) {
          return fullPath
        }
      }

      // Try as directory with index file
      for (const ext of extensions) {
        const indexPath = path.join(relativePath, `index${ext}`)
        if (fs.existsSync(indexPath)) {
          return indexPath
        }
      }
    }

    return null
  } catch (error) {
    console.error(`Error resolving import path ${importPath}:`, error)
    return null
  }
}

// Function to check if a component is exported from a file
function checkComponentExports(filePath: string, componentNames: string[]): string[] {
  try {
    if (!fs.existsSync(filePath)) return componentNames

    const content = fs.readFileSync(filePath, "utf8")

    const missingExports: string[] = []

    for (const componentName of componentNames) {
      // Check for default export
      const defaultExportRegex = new RegExp(
        `export\\s+default\\s+(?:function\\s+)?${componentName}|export\\s+default\\s+${componentName}`,
      )

      // Check for named export
      const namedExportRegex = new RegExp(
        `export\\s+(?:function\\s+)?${componentName}\\s*\\(|export\\s+\\{[^}]*\\b${componentName}\\b[^}]*\\}`,
      )

      if (!defaultExportRegex.test(content) && !namedExportRegex.test(content)) {
        missingExports.push(componentName)
      }
    }

    return missingExports
  } catch (error) {
    console.error(`Error checking exports in ${filePath}:`, error)
    return componentNames
  }
}

// Main function to check for missing component exports
async function checkMissingComponentExports() {
  // Scan all TypeScript/JavaScript files
  const allFiles = scanDirectory(path.join(process.cwd(), "app"))
    .concat(scanDirectory(path.join(process.cwd(), "components")))
    .concat(scanDirectory(path.join(process.cwd(), "lib")))

  const missingComponents: { importFile: string; componentFile: string | null; components: string[] }[] = []

  // Check each file for component imports
  for (const file of allFiles) {
    const componentImports = extractComponentImports(file)

    for (const { source, imports } of componentImports) {
      const resolvedPath = resolveImportPath(source, file)

      if (!resolvedPath) {
        missingComponents.push({
          importFile: file,
          componentFile: null,
          components: imports,
        })
        continue
      }

      const missingExports = checkComponentExports(resolvedPath, imports)

      if (missingExports.length > 0) {
        missingComponents.push({
          importFile: file,
          componentFile: resolvedPath,
          components: missingExports,
        })
      }
    }
  }

  // Report missing components
  if (missingComponents.length > 0) {
    console.log("Missing component exports found:")

    for (const { importFile, componentFile, components } of missingComponents) {
      console.log(`\nIn file: ${importFile}`)

      if (componentFile) {
        console.log(`Component file exists: ${componentFile}`)
        console.log(`Missing exports: ${components.join(", ")}`)
      } else {
        console.log(`Component file not found for imports: ${components.join(", ")}`)
      }
    }
  } else {
    console.log("No missing component exports found")
  }

  return missingComponents
}

// Run the function
checkMissingComponentExports().catch(console.error)
