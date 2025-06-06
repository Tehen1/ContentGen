import React from "react";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BikeCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageSrc: string;
  category: string;
  inStock: boolean;
}

export function BikeCard({
  id,
  name,
  price,
  description,
  imageSrc,
  category,
  inStock,
}: BikeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </AspectRatio>
        <div className="absolute top-2 right-2">
          <Badge variant={inStock ? "default" : "destructive"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge variant="outline">{category}</Badge>
        </div>
        <CardDescription className="text-lg font-bold">
          ${price.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="w-full" disabled={!inStock}>
          Add to Cart
        </Button>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

