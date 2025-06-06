import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VerifiedMarkIcon } from "@radix-ui/react-icons"
import SafeBikeImage from "./ui/safe-bike-image"

interface CustomNFTShowcaseProps {
  imageUrl: string
  title: string
  description: string
  creatorName: string
  creatorVerified: boolean
  price: string
  buttonText: string
  className?: string
}

const CustomNFTShowcase: React.FC<CustomNFTShowcaseProps> = ({
  imageUrl,
  title,
  description,
  creatorName,
  creatorVerified,
  price,
  buttonText,
  className,
}) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          By {creatorName} {creatorVerified && <VerifiedMarkIcon />}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <SafeBikeImage src={imageUrl} alt={title} width={300} height={200} className="object-contain" />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div>{price}</div>
        <Button>{buttonText}</Button>
      </CardFooter>
    </Card>
  )
}

export default CustomNFTShowcase
