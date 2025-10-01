import React from 'react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { BarChart3, Briefcase, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TubelightNavbarDemo = () => {
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Jobs', url: '/jobs', icon: Briefcase },
    { name: 'Candidates', url: '/candidates', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Logo Header */}
      <div className="pt-16 pb-2 flex justify-center">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TalentFlow
          </span>
        </div>
      </div>

      {/* Tubelight Navigation */}
      <NavBar items={navItems} />
      
      {/* Demo Content */}
      <div className="pt-4 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Tubelight Navbar
            </h1>
            <p className="text-muted-foreground text-lg">
              Primary navigation with Dashboard, Jobs, Candidates, and Theme toggle
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  What makes this navbar special
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Smooth spring animations with Framer Motion</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Responsive design (mobile icons, desktop labels)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Beautiful tubelight effect on active items</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Fixed positioning at the top of the screen</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Animated theme toggle with fade effects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Backdrop blur and glass morphism effects</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigation Items</CardTitle>
                <CardDescription>
                  Current navigation structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Dashboard - Overview and metrics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>Jobs - Manage job postings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Candidates - View all candidates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs">/</span>
                  </div>
                  <span>Theme Toggle - Switch between dark and light</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Try switching between different pages and themes to see the smooth animations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TubelightNavbarDemo;
