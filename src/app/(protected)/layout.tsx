import ProtectedRoute from '@/components/ProtectedRoute';
import { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default Layout;