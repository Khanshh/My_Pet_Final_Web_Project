/**
 * Wrapper cho Vet CMS pages — UMI sử dụng file này như một HOC
 * truyền children (page content) vào VetLayout
 */
import VetLayout from '@/layouts/VetLayout';
import React from 'react';

const VetWrapper: React.FC<{ children: React.ReactNode; location?: any }> = ({ children, location }) => {
  return <VetLayout location={location}>{children}</VetLayout>;
};

export default VetWrapper;
