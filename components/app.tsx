'use client';

import { Toaster } from '@/components/ui/sonner';
import { Welcome } from '@/components/welcome';
import type { AppConfig } from '@/lib/types';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const { startButtonText } = appConfig;

  return (
    <main>
      <Welcome key="welcome" startButtonText={startButtonText} />
      <Toaster />
    </main>
  );
}
