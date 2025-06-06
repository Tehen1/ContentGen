import { execSync } from "child_process"

// Main function to run all fix scripts
async function fixAllIssues() {
  console.log("Starting to fix all issues...")

  try {
    // Run the scripts in sequence
    console.log("\n--- Installing Missing Dependencies ---")
    execSync("npx ts-node scripts/install-missing-dependencies.ts", { stdio: "inherit" })

    console.log("\n--- Checking Component Exports ---")
    execSync("npx ts-node scripts/check-component-exports.ts", { stdio: "inherit" })

    console.log("\n--- Fixing Missing Components ---")
    execSync("npx ts-node scripts/fix-missing-components.ts", { stdio: "inherit" })

    console.log("\n--- All issues fixed successfully ---")
  } catch (error) {
    console.error("Error fixing issues:", error)
  }
}

// Run the function
fixAllIssues().catch(console.error)
