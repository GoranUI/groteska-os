
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, TrendingUp, Receipt, Users, PiggyBank, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-gray-900 border-r border-gray-800">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-xl">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Financial Tracker</h2>
            <p className="text-xs text-gray-400">Multi-currency management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          <SidebarGroupContent className="p-4">
            <SidebarMenu className="space-y-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      end={item.href === "/"}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="mr-4 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
