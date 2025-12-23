import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dashboard | Aether Link',
  description: 'Manage your Aether Link profile',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a', // brand-gray
                color: '#ffffff', // brand-text
                border: '1px solid #333333', // brand-border
                padding: '12px 24px',
                borderRadius: '16px',
                fontWeight: 500,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}