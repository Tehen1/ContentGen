import React from "react";
import { BikeCard } from "@/components/custom/bike-card";

// Sample bike data
const bikes = [
  {
    id: "bike-1",
    name: "Mountain Explorer Pro",
    price: 1299.99,
    description: "A rugged mountain bike designed for challenging trails and off-road adventures. Features premium suspension and durable construction.",
    imageSrc: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
    category: "Mountain",
    inStock: true,
  },
  {
    id: "bike-2",
    name: "Urban Commuter",
    price: 899.99,
    description: "Perfect for city riding with lightweight frame and comfortable seating position. Includes fenders and rack mounts.",
    imageSrc: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=2022&auto=format&fit=crop",
    category: "City",
    inStock: true,
  },
  {
    id: "bike-3",
    name: "Road Racer Elite",
    price: 2499.99,
    description: "Professional-grade road bike with carbon frame and precision components for maximum speed and efficiency.",
    imageSrc: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=2070&auto=format&fit=crop",
    category: "Road",
    inStock: false,
  },
  {
    id: "bike-4",
    name: "Cruiser Comfort",
    price: 599.99,
    description: "Relaxed beach cruiser with wide tires and upright seating position for casual, comfortable rides.",
    imageSrc: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070&auto=format&fit=crop",
    category: "Cruiser",
    inStock: true,
  },
];

export default function BikesPage() {
  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Featured Bikes</h1>
        <p className="text-muted-foreground">
          Explore our collection of premium bikes for every riding style.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {bikes.map((bike) => (
          <BikeCard
            key={bike.id}
            id={bike.id}
            name={bike.name}
            price={bike.price}
            description={bike.description}
            imageSrc={bike.imageSrc}
            category={bike.category}
            inStock={bike.inStock}
          />
        ))}
      </div>
    </div>
  );
}

