"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileSearch,
  LayoutDashboard,
  Upload,
  FileText,
  GitCompare,
  MessageSquare,
  Calculator,
  Settings,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  Users,
  BarChart3,
  Search,
  FileStack,
  Shield,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload Contract" },
  { href: "/dashboard/contracts", icon: FileText, label: "My Contracts" },
  { href: "/dashboard/compare-contracts", icon: FileStack, label: "Compare Contracts" },
  { href: "/dashboard/search-venues", icon: Search, label: "Search Venues" },
  { href: "/dashboard/compare", icon: GitCompare, label: "Compare Venues" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Assistant" },
  { href: "/dashboard/budget", icon: Calculator, label: "Budget Planner" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

const adminNavItem = { href: "/dashboard/admin", icon: Shield, label: "Admin Panel" }

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileSearch className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ContractLens</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-border">
              <Link
                href={adminNavItem.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === adminNavItem.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <adminNavItem.icon className="h-5 w-5" />
                {adminNavItem.label}
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-border">
            <Link href="/help">
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
                Help & Support
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
