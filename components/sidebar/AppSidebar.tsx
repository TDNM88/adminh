"use client"

import React from "react"
import {
  Home,
  Users,
  Clock,
  CreditCard,
  ArrowUpDown,
  Settings,
  BarChart,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define page types
export type PageType = 
  | "dashboard"
  | "customers"
  | "order-history"
  | "trading-sessions"
  | "deposit-requests"
  | "withdrawal-requests"
  | "settings"

// Define menu items
export const menuItems = [
  {
    id: 'dashboard' as PageType,
    title: 'Dashboard',
    icon: Home,
  },
  {
    id: 'customers' as PageType,
    title: 'Khách hàng',
    icon: Users,
  },
  {
    id: 'order-history' as PageType,
    title: 'Lịch sử đơn hàng',
    icon: Clock,
  },
  {
    id: 'trading-sessions' as PageType,
    title: 'Phiên giao dịch',
    icon: BarChart,
  },
  {
    id: 'deposit-requests' as PageType,
    title: 'Yêu cầu nạp tiền',
    icon: CreditCard,
  },
  {
    id: 'withdrawal-requests' as PageType,
    title: 'Yêu cầu rút tiền',
    icon: ArrowUpDown,
  },
  {
    id: 'settings' as PageType,
    title: 'Cài đặt',
    icon: Settings,
  },
]

interface AppSidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function AppSidebar({ currentPage, setCurrentPage }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPage === item.id}
                    className={currentPage === item.id ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className="flex items-center gap-3 w-full text-left"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
