import { Home, Users, Briefcase, FileText, Building2 } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Jobs', url: '/jobs', icon: Briefcase },
    { name: 'Candidates', url: '/candidates', icon: Users },
    { name: 'Assessments', url: '/assessments', icon: FileText }
  ]

  return <NavBar items={navItems} />
}
