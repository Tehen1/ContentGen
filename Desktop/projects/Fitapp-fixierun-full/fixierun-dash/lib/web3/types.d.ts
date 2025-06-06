import { Web3BaseProvider } from "web3-types"

interface Window {
  ethereum?: Web3BaseProvider & {
    isMetaMask?: boolean
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
  }
}
