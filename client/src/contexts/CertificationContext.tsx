import React, { createContext, useContext, useState, useEffect } from 'react';

interface CertificationContextType {
  selectedCertification: string;
  setSelectedCertification: (cert: string) => void;
}

const CertificationContext = createContext<CertificationContextType | undefined>(undefined);

export function CertificationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCertification, setSelectedCertification] = useState('CAPM');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedCertification');
    if (stored) {
      setSelectedCertification(stored);
    }
  }, []);

  // Save to localStorage whenever it changes
  const handleSetCertification = (cert: string) => {
    setSelectedCertification(cert);
    localStorage.setItem('selectedCertification', cert);
  };

  return (
    <CertificationContext.Provider value={{ selectedCertification, setSelectedCertification: handleSetCertification }}>
      {children}
    </CertificationContext.Provider>
  );
}

export function useCertification() {
  const context = useContext(CertificationContext);
  if (!context) {
    throw new Error('useCertification must be used within CertificationProvider');
  }
  return context;
}
