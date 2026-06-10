import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/trading', label: 'Trading' },
    { href: '/gaming', label: 'Gaming' },
    { href: '/learning', label: 'Learning' },
    { href: '/governance', label: 'Governance' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sticky top-0 z-40">
      <div className="container flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl">
          🚀 SKYCOIN4444
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} md:flex gap-6`}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
