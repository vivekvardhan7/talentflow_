import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Briefcase, Users, Building2, FileText, Moon, Sun } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

const Navigation = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Jobs', url: '/jobs', icon: Briefcase },
    { name: 'Candidates', url: '/candidates', icon: Users },
    { name: 'Assessments', url: '/assessments', icon: FileText },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <Link to="/dashboard" className="flex items-center gap-2 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-ring">
            <span className="text-base font-semibold font-gilroy tracking-wide">TalentFlow</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <div className="text-foreground/80">
            <span className="font-medium">Sai Vivek Tata</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navigation;
