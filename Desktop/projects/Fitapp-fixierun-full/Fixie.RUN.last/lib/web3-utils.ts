import { IProvider } from '@web3auth/base'
import { ethers } from 'ethers'

// Get Ethereum address from provider
export const getAddress = async (provider: IProvider): Promise&lt;string&gt; => {
  try {
    // TODO: Ensure `provider as any` is safe or find a more type-safe way to handle this.
    // Web3Auth's IProvider might not directly match ethers.providers.ExternalProvider.
    // Consider checking provider type or using a conditional cast if possible.
    const ethersProvider = new ethers.providers.Web3Provider(provider as any)
    const signer = ethersProvider.getSigner()
    const address = await signer.getAddress()
    return address
  } catch (error) {
    console.error('Error getting address:', error)
    // Re-throw the error so the caller can handle it or display a message
    throw error
  }
}

// Get user's balance
export const getBalance = async (provider: IProvider): Promise&lt;string&gt; => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider as any)
    const signer = ethersProvider.getSigner()
    const address = await signer.getAddress() // We need the address to get the balance
    const balance = await ethersProvider.getBalance(address)
    return ethers.utils.formatEther(balance)
  } catch (error) {
    console.error('Error getting balance:', error)
    throw error
  }
}

// Send a transaction
export const sendTransaction = async (
  provider: IProvider,
  to: string,
  amount: string // Amount should be in Ether, e.g., "0.1"
): Promise&lt;string&gt; => { // Returns the transaction hash
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider as any)
    const signer = ethersProvider.getSigner()
    
    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount), // Convert Ether string to Wei
    })
    
    return tx.hash
  } catch (error) {
    console.error('Error sending transaction:', error)
    throw error
  }
}

// Sign a message (useful for verifying ownership)
export const signMessage = async (provider: IProvider, message: string): Promise&lt;string&gt; => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider as any)
    const signer = ethersProvider.getSigner()
    const signature = await signer.signMessage(message)
    return signature
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
}

