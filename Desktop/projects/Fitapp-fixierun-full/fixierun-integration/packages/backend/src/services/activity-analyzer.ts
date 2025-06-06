import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"

interface AnalyzerOptions {
  timePeriod?: "day" | "week" | "month" | "year" | "all"
  activities?: string[]
  detailed?: boolean
  outputDir?: string
}

export class ActivityAnalyzerService {
  private pythonPath: string
  private scriptPath: string

  constructor() {
    // Paths will be configured based on deployment environment
    this.pythonPath = process.env.PYTHON_PATH || "python3"
    this.scriptPath = path.join(process.cwd(), "packages/analyzer/run_analyzer.py")
  }

  async analyzeActivity(
    userId: string,
    locationData: any,
    options: AnalyzerOptions = {},
  ): Promise<{ metrics: any; visualizationPaths: string[] }> {
    // Create temporary file for location data
    const tempDataPath = path.join(process.cwd(), "temp", `${userId}-location-data.json`)
    const outputDir = options.outputDir || path.join(process.cwd(), "temp", `${userId}-visualizations`)

    await fs.mkdir(path.dirname(tempDataPath), { recursive: true })
    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(tempDataPath, JSON.stringify(locationData))

    // Build command arguments
    const args = [this.scriptPath, "--input", tempDataPath, "--output", outputDir]

    if (options.timePeriod) args.push("--time-period", options.timePeriod)
    if (options.activities) args.push("--activities", options.activities.join(","))
    if (options.detailed) args.push("--detailed")

    // Execute Python script
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, args)
      let stdout = ""
      let stderr = ""

      process.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      process.stderr.on("data", (data) => {
        stderr += data.toString()
      })

      process.on("close", async (code) => {
        if (code !== 0) {
          reject(new Error(`Analyzer process exited with code ${code}: ${stderr}`))
          return
        }

        try {
          // Read metrics from output file
          const metricsPath = path.join(outputDir, "metrics.json")
          const metrics = JSON.parse(await fs.readFile(metricsPath, "utf8"))

          // Get visualization file paths
          const files = await fs.readdir(outputDir)
          const visualizationPaths = files
            .filter((file) => file.endsWith(".png") || file.endsWith(".svg"))
            .map((file) => path.join(outputDir, file))

          resolve({ metrics, visualizationPaths })
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}
