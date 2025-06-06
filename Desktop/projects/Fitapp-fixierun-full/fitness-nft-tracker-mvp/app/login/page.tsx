"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("token", data.token)
        router.push("/")
      } else {
        alert("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-gray-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-white">Login</h1>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </div>
  )
}

