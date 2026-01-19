import * as React from "react"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Bot,
  Activity,
  Frame,
  LifeBuoy,
  Send,
  Settings2,
  Square,
  Users,
} from "lucide-react"

import { ROUTS } from "@/routes/routes" 
import { apiService } from "@/api/api"
import { Quries } from "@/api/quries"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  })

  const getUserId = () => {
    const storedId = localStorage.getItem("userId");
    if (storedId) return storedId;

    // fallback: decode JWT if userId не сохранился отдельно
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
      const [, payload] = raw.split(".");
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const data = JSON.parse(json);
      return data?.id || data?.userId || data?.sub || null;
    } catch (e) {
      console.warn("Failed to decode token for userId", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        const response = await apiService.get(Quries.API.USERS.GET_BY_ID(userId));

        if (response) {
          const name = response.firstName && response.lastName
            ? `${response.firstName} ${response.lastName}`
            : response.firstName || response.lastName || response.email || "User";

          setUserData({
            name,
            email: response.email || "user@example.com",
            avatar: response.avatarUrl || "/avatars/shadcn.jpg",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, [])

  const data = {
    user: userData,
    navMain: [
      {
        title: "Початкова",
        url: ROUTS.HOME,
        icon: Square,
        isActive: true,
        items: [],
      },
      {
        title: "Мій облік",
        url: "/account",
        icon: Bot,
        items: [],
      },
      {
        title: "Збережене",
        url: "/saved",
        icon: BookOpen,
        items: [],
      },
      {
        title: "Підписки",
        url: ROUTS.FOLLOWERS,
        icon: Users,
        items: [],
      },
      {
        title: "Редагувати",
        title: "Налаштування",
        url: "#", 
        icon: Settings2,
        items: [
          { title: "Загальні", url: ROUTS.SETTINGS.GENERAL },
          { title: "Безпека", url: ROUTS.SETTINGS.SECURITY },
        ],
      },
      {
        title: "Підтримка",
        url: "#",
        icon: LifeBuoy,
        items: [
          { title: "FAQ", url: ROUTS.SUPPORT.FAQ },
          { title: "Звіт про проблему", url: ROUTS.SUPPORT.REPORT_BUG },
          { title: "Про нас", url: ROUTS.SUPPORT.ABOUT },
        ],
      }
    ],
    navSecondary: [],
    projects: [],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FitForge</span>
                  <span className="truncate text-xs text-muted-foreground">Community</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}