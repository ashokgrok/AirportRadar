import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { SEEDED_ROLES } from '../data/kpiLibrary';

interface AuthContextType {
  currentUser: UserRole;
  setCurrentUser: (user: UserRole) => void;
  switchRoleById: (roleId: string) => void;
  allRoles: UserRole[];
  isLoggedIn: boolean;
  login: (roleId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserRole>(() => {
    const saved = localStorage.getItem('aionos_active_role');
    const matched = saved ? SEEDED_ROLES.find(r => r.id === saved) : null;
    // Default to AOCC Duty Manager for rich live-ops exploration, or CEO
    return matched || SEEDED_ROLES[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    localStorage.setItem('aionos_active_role', currentUser.id);
  }, [currentUser]);

  const switchRoleById = (roleId: string) => {
    const found = SEEDED_ROLES.find(r => r.id === roleId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
    }
  };

  const login = (roleId: string) => {
    switchRoleById(roleId);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRoleById,
        allRoles: SEEDED_ROLES,
        isLoggedIn,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
