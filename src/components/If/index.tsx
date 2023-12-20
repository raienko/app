import React from 'react';

export type IfProps = {
  children?: React.ReactNode;
  condition?: any;
};

export default function If({children, condition}: IfProps) {
  if (!condition) {
    return null;
  }
  return <>{children}</>;
}
