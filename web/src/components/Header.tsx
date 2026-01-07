'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container flex items-center justify-between py-4">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

function Logo() {
  return <h1 className="text-xl font-bold">Sistema Restaurante</h1>;
}

function Navigation() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/cardapios", label: "Cardápios" },
    { href: "/clientes", label: "Clientes" },
    { href: "/eventos", label: "Eventos" },
    { href: "/produtos", label: "Produtos" },
  ];

  return (
    <nav>
      <ul className="flex space-x-4">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="hover:text-gray-300">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
