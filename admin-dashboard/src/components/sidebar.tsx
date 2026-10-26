'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  MessageSquare,
  HandMetal,
  BarChart3,
  Settings,
  Bot,
  MessageCircle,
  FileText,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/handover', label: 'Handover Queue', icon: HandMetal },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/ai-settings', label: 'AI Settings', icon: Bot },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/audit', label: 'Audit Logs', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-gray-900">Fashion House</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
