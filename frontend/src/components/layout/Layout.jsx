import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function Layout({ children }) {
  return (
    <div className="flex h-dvh bg-background overflow-hidden text-textMain">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        <TopNavbar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
