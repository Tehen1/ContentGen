import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <span className="rounded-md bg-primary p-1">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </span>
        <span>FitTrack</span>
      </Link>
    </div>
  )
}
