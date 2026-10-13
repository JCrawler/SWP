import React from 'react';

export const Footer: React.FC = () => (
  <footer className="border-t border-[#e3e0f5] bg-white py-4 text-center text-xs text-[#6b6580]">
    © {new Date().getFullYear()} · Created by{' '}
    <span className="font-semibold text-[#1e1b2e]">Jholichi S. Tempra</span>
  </footer>
);