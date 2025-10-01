# Tubelight Navbar Component

## Overview
A beautiful animated navigation component with tubelight effects, built with Framer Motion and fully integrated with the existing theme system.

## Features
-  Smooth spring animations with Framer Motion
-  Responsive design (mobile icons, desktop labels)
-  Beautiful tubelight effect on active items
-  Theme-aware styling with dark/light mode
-  Backdrop blur and glass morphism effects
-  React Router integration

## Installation
The component is already installed and ready to use. Dependencies include:
- `framer-motion` - For smooth animations
- `lucide-react` - For icons
- `react-router-dom` - For navigation

## Usage

### Basic Usage
```tsx
import { NavBar } from '@/components/ui/tubelight-navbar'
import { Home, Users, Briefcase } from 'lucide-react'

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Jobs', url: '/jobs', icon: Briefcase },
  { name: 'Candidates', url: '/candidates', icon: Users }
]

function MyComponent() {
  return <NavBar items={navItems} />
}
```

### Props
- `items`: Array of navigation items with `name`, `url`, and `icon` properties
- `className`: Optional additional CSS classes

### Navigation Item Interface
```tsx
interface NavItem {
  name: string      // Display name
  url: string       // Route path
  icon: LucideIcon  // Lucide React icon component
}
```

## Demo
Visit `/tubelight-demo` to see the component in action with various examples.

## Integration
The component is integrated into the main Navigation component with a toggle button to switch between traditional and tubelight navigation styles.
