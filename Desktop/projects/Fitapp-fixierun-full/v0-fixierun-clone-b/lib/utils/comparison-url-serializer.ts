import { ComparisonRecord } from "@/lib/stores/comparison-store"
import { NFT } from "@/lib/nft/types"

interface UrlParams {
  nfts?: string[]
  period?: string
  metrics?: string[]
  timeframe?: {
    start: number
    end: number
  }
}

export class ComparisonUrlSerializer {
  private static validateNftIds(ids: string[]): boolean {
    return ids.every(id => /^\d+$/.test(id))
  }

  private static validatePeriod(period: string): boolean {
    return /^\d+[dwmy]$/.test(period) // d=days, w=weeks, m=months, y=years
  }

  private static validateMetrics(metrics: string[]): boolean {
    const validMetrics = ["speed", "endurance", "earnings"]
    return metrics.every(m => validMetrics.includes(m))
  }

  static serializeToUrl(params: UrlParams): string {
    const searchParams = new URLSearchParams()
    
    if (params.nfts?.length) {
      searchParams.set("nfts", params.nfts.join(","))
    }
    
    if (params.period) {
      searchParams.set("period", params.period)
    }
    
    if (params.metrics?.length) {
      searchParams.set("metrics", params.metrics.join(","))
    }
    
    if (params.timeframe) {
      searchParams.set("start", params.timeframe.start.toString())
      searchParams.set("end", params.timeframe.end.toString())
    }
    
    return `${window.location.pathname}?${searchParams.toString()}`
  }

  static parseUrlParams(url: string): UrlParams {
    const searchParams = new URLSearchParams(url.split("?")[1] || "")
    const params: UrlParams = {}

    const nfts = searchParams.get("nfts")?.split(",")
    if (nfts?.length && this.validateNftIds(nfts)) {
      params.nfts = nfts
    }

    const period = searchParams.get("period")
    if (period && this.validatePeriod(period)) {
      params.period = period
    }

    const metrics = searchParams.get("metrics")?.split(",")
    if (metrics?.length && this.validateMetrics(metrics)) {
      params.metrics = metrics
    }

    const start = searchParams.get("start")
    const end = searchParams.get("end")
    if (start && end) {
      params.timeframe = {
        start: parseInt(start),
        end: parseInt(end)
      }
    }

    return params
  }

  static createShareableUrl(
    comparison: ComparisonRecord,
    nfts: NFT[],
    selectedMetrics: string[] = ["speed", "endurance", "earnings"]
  ): string {
    return this.serializeToUrl({
      nfts: comparison.nfts,
      metrics: selectedMetrics,
      timeframe: {
        start: comparison.timestamp,
        end: Date.now()
      }
    })
  }

  // Helper function to generate print-friendly data from URL params
  static getPrintData(params: UrlParams, nfts: NFT[]): {
    timestamp: string
    nftDetails: Array<{
      id: string
      name: string
      metrics: Record<string, number | string>
    }>
    period: string
  } {
    const nftDetails = (params.nfts || []).map(id => {
      const nft = nfts.find(n => n.tokenId === id)
      if (!nft) return null

      const metrics: Record<string, number | string> = {}
      nft.attributes.forEach(attr => {
        if (params.metrics?.includes(attr.trait_type.toLowerCase())) {
          metrics[attr.trait_type] = attr.value
        }
      })

      return {
        id,
        name: nft.name,
        metrics
      }
    }).filter(Boolean)

    return {
      timestamp: new Date().toISOString(),
      nftDetails: nftDetails as Array<{
        id: string
        name: string
        metrics: Record<string, number | string>
      }>,
      period: params.period || "30d"
    }
  }
}

