import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  Building2Icon,
  Bolt,
  BarChart3Icon,
  CreditCardIcon,
  SettingsIcon,
  UserIcon,
  HelpCircleIcon,
  ReceiptIcon,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, navigate] = useLocation();

  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: HomeIcon,
    },
    {
      name: "Properties",
      href: "/properties",
      icon: Building2Icon,
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: Bolt,
    },
    {
      name: "Valuation",
      href: "/valuation",
      icon: BarChart3Icon,
    },
    {
      name: "Subscription",
      href: "/subscription",
      icon: CreditCardIcon,
    },
    {
      name: "Receipts",
      href: "/receipts",
      icon: ReceiptIcon,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: SettingsIcon,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserIcon,
    },
    {
      name: "Help",
      href: "/help",
      icon: HelpCircleIcon,
    },
  ];

  return (
    <div className={cn("pb-12 h-full bg-sidebar border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Equitystek
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
