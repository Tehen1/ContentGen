"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>We encountered an error while loading the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Error: {error.message || "Unknown error"}</p>
            {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
