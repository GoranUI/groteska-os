
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, TrendingUp, Receipt, Users, PiggyBank, FileText, Settings, Search, FolderOpen, Upload, Clock, Target, Brain, Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarInput,
} from "@/components/ui/sidebar";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Budget", href: "/budget", icon: Target },
  { name: "Goals", href: "/goals", icon: Trophy },
  { name: "Analytics", href: "/analytics", icon: Brain },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Time Tracker", href: "/time-tracker", icon: Clock, disabled: true },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Import", href: "/import", icon: Upload },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-sidebar border-none shadow-sm">
      <SidebarHeader className="p-6 border-none">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Stacks Flow</h2>
            <p className="text-xs text-muted-foreground">Finance management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  {item.disabled ? (
                    <div className="flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        end={item.href === "/"}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-none">
        <SidebarMenu>
          {bottomNavigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
