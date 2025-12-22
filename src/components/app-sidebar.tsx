import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Send,
  Settings2,
  Square,
} from "lucide-react"

import { ROUTS } from "@/routes/routes" 

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
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


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      url: "#",
      icon: BookOpen,
      items: [],
    },
    {
      title: "Редагувати",
      url: "#",
      icon: Frame,
      items: [],
    },
{
  title: "Налаштування",
  url: "#", 
  icon: Settings2,
items: [
  { title: "Загальні", url: ROUTS.SETTINGS.GENERAL },
  { title: "Команда", url: ROUTS.SETTINGS.TEAM },
  { title: "Оплата", url: ROUTS.SETTINGS.BILLING },
  { title: "Обмеження", url: ROUTS.SETTINGS.LIMITS },
],


}

  ],
  navSecondary: [
    {
      title: "Подтримка",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Надіслати відгук",
      url: "#",
      icon: Send,
    },
  ],
  projects: [],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
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
