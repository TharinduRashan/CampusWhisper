import { Toaster } from 'react-hot-toast'

/** Drop-in Toaster configured for the CampusWhisper design system. */
export default function Toast() {
  return (
    <Toaster
      position="bottom-center"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1a1a24',
          color: '#e2e2f0',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxWidth: '360px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#0f0f14' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#0f0f14' },
          duration: 5000,
        },
        loading: {
          iconTheme: { primary: '#7c3aed', secondary: '#0f0f14' },
        },
      }}
    />
  )
}
