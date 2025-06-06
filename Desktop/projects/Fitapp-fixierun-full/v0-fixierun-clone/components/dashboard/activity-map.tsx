import Image from "next/image"

export function ActivityMap() {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-lg border">
      <Image src="/cycling-route-gps.png" alt="Map showing cycling route" fill className="object-cover" />
      <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
        12.4 km
      </div>
    </div>
  )
}
