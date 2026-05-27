/**
 * UMI Route Wrapper cho Bác sĩ thú y CMS
 * File này được khai báo trong routes.ts với wrappers: ['@/wrappers/VetAuth']
 */
import VetLayout from '@/layouts/VetLayout';
import React from 'react';

const VetAuth: React.FC<{ children: React.ReactNode; location?: any }> = ({ children, location }) => {
  return <VetLayout location={location}>{children}</VetLayout>;
};

export default VetAuth;
