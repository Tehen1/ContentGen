'use client'

import { useState, useEffect } from 'react'
import { useWeb3Auth } from './web3auth-provider'
import { getBalance } from '@/lib/web3-utils'
import { User, Wallet, Copy, CheckCircle, CreditCard, ArrowRightLeft, QrCode } from 'lucide-react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { motion } from 'framer-motion'

export default function UserProfile() {
  const { user, provider, isAuthenticated, showWalletUI, showCheckout, showSwap, showWalletConnectScanner } = useWeb3Auth()
  const [balance, setBalance] = useState&lt;string&gt;('0')
  const [copied, setCopied] = useState(false)
  const [address, setAddress] = useState&lt;string&gt;('')

  useEffect(() => {
    const fetchData = async () => {
      if (provider && isAuthenticated) {
        try {
          // Get user's balance
          const bal = await getBalance(provider)
          setBalance(bal)
          
          // Get Ethereum address
          const ethersProvider = new ethers.providers.Web3Provider(provider as any)
          const signer = ethersProvider.getSigner()
          const addr = await signer.getAddress()
          setAddress(addr)
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        // Reset states if not authenticated
        setBalance('0')
        setAddress('')
      }
    }

    fetchData()
  }, [provider, isAuthenticated])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format address for display
  const formatDisplayAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (!isAuthenticated || !user) {
    return (
      &lt;div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg"&gt;
        &lt;div className="text-center py-4"&gt;
          &lt;User className="w-12 h-12 mx-auto text-gray-500 mb-2" /&gt;
          &lt;h3 className="text-xl font-cyber font-bold mb-2"&gt;Not Connected&lt;/h3&gt;
          &lt;p className="text-gray-400 text-sm"&gt;Connect your wallet to view your profile&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    )
  }

  return (
    &lt;div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg"&gt;
      &lt;div className="flex items-center mb-6"&gt;
        &lt;div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent/50 mr-4"&gt;
          {user.profileImage ? (
            &lt;Image 
              src={user.profileImage || "/placeholder.svg"} 
              alt={user.name || 'User'} 
              fill 
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            /&gt;
          ) : (
            &lt;div className="w-full h-full bg-accent/20 flex items-center justify-center"&gt;
              &lt;User className="w-8 h-8 text-accent" /&gt;
            &lt;/div&gt;
          )}
        &lt;/div&gt;
        &lt;div&gt;
          &lt;h3 className="text-xl font-cyber font-bold text-white"&gt;
            {user.name || user.email || 'Fixie Rider'}
          &lt;/h3&gt;
          &lt;p className="text-gray-400 text-sm"&gt;{user.email || 'No email provided'}&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="space-y-4"&gt;
        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="flex items-center justify-between mb-1"&gt;
            &lt;div className="text-sm text-gray-400 flex items-center"&gt;
              &lt;Wallet className="w-4 h-4 mr-1" /&gt; Wallet Address
            &lt;/div&gt;
            &lt;button 
              onClick={copyAddress} 
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="Copy wallet address"
            &gt;
              {copied ? (
                &lt;CheckCircle className="w-4 h-4" /&gt;
              ) : (
                &lt;Copy className="w-4 h-4" /&gt;
              )}
            &lt;/button&gt;
          &lt;/div&gt;
          &lt;div className="font-mono text-sm text-white break-all"&gt;
            {formatDisplayAddress(address)}
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="text-sm text-gray-400 mb-1"&gt;Balance&lt;/div&gt;
          &lt;div className="text-2xl font-cyber font-bold text-accent"&gt;
            {parseFloat(balance || "0").toFixed(4)} MATIC
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid grid-cols-2 gap-4"&gt;
          &lt;motion.button
            onClick={() => showWalletUI()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;Wallet className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Wallet UI&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showCheckout()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;CreditCard className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Top Up&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showSwap()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;ArrowRightLeft className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Swap&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showWalletConnectScanner()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;QrCode className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Connect&lt;/div&gt;
          &lt;/motion.button&gt;
        &lt;/div&gt;
        
        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="text-sm text-gray-400 mb-1"&gt;Login Method&lt;/div&gt;
          &lt;div className="text-white"&gt;
            {user.typeOfLogin === 'google' ? 'Google' : 
             user.typeOfLogin === 'facebook' ? 'Facebook' : 
             user.typeOfLogin === 'twitter' ? 'Twitter' : 
             user.typeOfLogin === 'email_passwordless' ? 'Email' : 
             user.typeOfLogin ? user.typeOfLogin.charAt(0).toUpperCase() + user.typeOfLogin.slice(1) : 
             'Web3Auth'}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useWeb3Auth } from './web3auth-provider'
import { getBalance } from '@/lib/web3-utils'
import { User, Wallet, Copy, CheckCircle, CreditCard, ArrowRightLeft, QrCode } from 'lucide-react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { motion } from 'framer-motion'

export default function UserProfile() {
  const { user, provider, isAuthenticated, showWalletUI, showCheckout, showSwap, showWalletConnectScanner } = useWeb3Auth()
  const [balance, setBalance] = useState&lt;string&gt;('0')
  const [copied, setCopied] = useState(false)
  const [address, setAddress] = useState&lt;string&gt;('')

  useEffect(() => {
    const fetchData = async () => {
      if (provider && isAuthenticated) {
        try {
          // Get user's balance
          const bal = await getBalance(provider)
          setBalance(bal)
          
          // Get Ethereum address
          const ethersProvider = new ethers.providers.Web3Provider(provider as any)
          const signer = ethersProvider.getSigner()
          const addr = await signer.getAddress()
          setAddress(addr)
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        // Reset states if not authenticated
        setBalance('0')
        setAddress('')
      }
    }

    fetchData()
  }, [provider, isAuthenticated])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format address for display
  const formatDisplayAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (!isAuthenticated || !user) {
    return (
      &lt;div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg"&gt;
        &lt;div className="text-center py-4"&gt;
          &lt;User className="w-12 h-12 mx-auto text-gray-500 mb-2" /&gt;
          &lt;h3 className="text-xl font-cyber font-bold mb-2"&gt;Not Connected&lt;/h3&gt;
          &lt;p className="text-gray-400 text-sm"&gt;Connect your wallet to view your profile&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    )
  }

  return (
    &lt;div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 border border-accent/30 shadow-lg"&gt;
      &lt;div className="flex items-center mb-6"&gt;
        &lt;div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent/50 mr-4"&gt;
          {user.profileImage ? (
            &lt;Image 
              src={user.profileImage || "/placeholder.svg"} 
              alt={user.name || 'User'} 
              fill 
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            /&gt;
          ) : (
            &lt;div className="w-full h-full bg-accent/20 flex items-center justify-center"&gt;
              &lt;User className="w-8 h-8 text-accent" /&gt;
            &lt;/div&gt;
          )}
        &lt;/div&gt;
        &lt;div&gt;
          &lt;h3 className="text-xl font-cyber font-bold text-white"&gt;
            {user.name || user.email || 'Fixie Rider'}
          &lt;/h3&gt;
          &lt;p className="text-gray-400 text-sm"&gt;{user.email || 'No email provided'}&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="space-y-4"&gt;
        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="flex items-center justify-between mb-1"&gt;
            &lt;div className="text-sm text-gray-400 flex items-center"&gt;
              &lt;Wallet className="w-4 h-4 mr-1" /&gt; Wallet Address
            &lt;/div&gt;
            &lt;button 
              onClick={copyAddress} 
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="Copy wallet address"
            &gt;
              {copied ? (
                &lt;CheckCircle className="w-4 h-4" /&gt;
              ) : (
                &lt;Copy className="w-4 h-4" /&gt;
              )}
            &lt;/button&gt;
          &lt;/div&gt;
          &lt;div className="font-mono text-sm text-white break-all"&gt;
            {formatDisplayAddress(address)}
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="text-sm text-gray-400 mb-1"&gt;Balance&lt;/div&gt;
          &lt;div className="text-2xl font-cyber font-bold text-accent"&gt;
            {parseFloat(balance || "0").toFixed(4)} MATIC
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid grid-cols-2 gap-4"&gt;
          &lt;motion.button
            onClick={() => showWalletUI()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;Wallet className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Wallet UI&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showCheckout()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;CreditCard className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Top Up&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showSwap()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;ArrowRightLeft className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Swap&lt;/div&gt;
          &lt;/motion.button&gt;
          
          &lt;motion.button
            onClick={() => showWalletConnectScanner()}
            className="bg-cyberpunk-dark/70 p-3 rounded-sm border border-accent/30 text-center hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          &gt;
            &lt;QrCode className="w-5 h-5 mx-auto mb-1 text-accent" /&gt;
            &lt;div className="text-xs text-white"&gt;Connect&lt;/div&gt;
          &lt;/motion.button&gt;
        &lt;/div&gt;
        
        &lt;div className="bg-cyberpunk-dark/50 p-4 rounded-sm border border-accent/20"&gt;
          &lt;div className="text-sm text-gray-400 mb-1"&gt;Login Method&lt;/div&gt;
          &lt;div className="text-white"&gt;
            {user.typeOfLogin === 'google' ? 'Google' : 
             user.typeOfLogin === 'facebook' ? 'Facebook' : 
             user.typeOfLogin === 'twitter' ? 'Twitter' : 
             user.typeOfLogin === 'email_passwordless' ? 'Email' : 
             user.typeOfLogin ? user.typeOfLogin.charAt(0).toUpperCase() + user.typeOfLogin.slice(1) : 
             'Web3Auth'}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}

