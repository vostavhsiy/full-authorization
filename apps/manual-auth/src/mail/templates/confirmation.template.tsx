import { Html, Head, Body } from '@react-email/components';
import * as React from 'react';

interface Props {
  domain: string;
  token: string;
}

export const ConfirmationTemplate = ({ domain, token }: Props) => {
  return (
    <Html>
      <Head />
      <Body></Body>
    </Html>
  );
};
