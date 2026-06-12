import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  GET = 'get',
  WRITE = 'write'
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  // In development, error with details is very helpful
  throw new Error(JSON.stringify(errInfo));
}

interface AdminContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  customData: Record<string, any>;
  updateCustomData: (key: string, value: any) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customData, setCustomData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initial load from localStorage as fallback
    const savedData = localStorage.getItem('yohu_site_content');
    if (savedData) {
      try {
        setCustomData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local custom data", e);
      }
    }

    // Listen to firestore changes in real-time
    const path = 'settings/siteContent';
    const unsub = onSnapshot(doc(db, 'settings', 'siteContent'), (doc) => {
      if (doc.exists()) {
        const data = doc.data().content || {};
        setCustomData(data);
        localStorage.setItem('yohu_site_content', JSON.stringify(data));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  const updateCustomData = async (key: string, value: any) => {
    const newData = { ...customData, [key]: value };
    
    // Update local state and localStorage immediately for UX/Fallback
    setCustomData(newData);
    localStorage.setItem('yohu_site_content', JSON.stringify(newData));
    
    try {
      await setDoc(doc(db, 'settings', 'siteContent'), {
        content: newData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/siteContent');
    }
  };

  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      isEditMode, 
      setIsEditMode, 
      customData, 
      updateCustomData 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
