"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-translation"

interface MainNavProps {
  className?: string
  setIsOpen?: (open: boolean) => void
}

export function MainNav({ className, setIsOpen }: MainNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const mainNavItems = [
    { title: t("nav.features"), href: "/features" },
    { title: t("nav.howItWorks"), href: "/how-it-works" },
    { title: t("nav.nftBikes"), href: "/nft-bikes" },
    { title: t("nav.rewards"), href: "/rewards" },
    { title: t("nav.faq"), href: "/faq" },
    { title: t("nav.dashboard"), href: "/dashboard" },
    { title: t("nav.collection"), href: "/collection" },
    { title: t("nav.createNft"), href: "/create-nft" },
  ]

  return (
    <nav className={cn("flex items-center gap-4 text-sm", className)}>
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-primary",
            pathname === item.href ? "text-primary font-medium" : "text-muted-foreground",
          )}
          onClick={() => setIsOpen?.(false)}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
