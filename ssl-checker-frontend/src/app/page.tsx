import React from 'react';
import SSLChecker from '../components/SSLChecker';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <SSLChecker />
    </main>
  );
}