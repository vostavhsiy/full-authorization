import {
  Html,
  Head,
  Body,
  Tailwind,
  Heading,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  domain: string;
  token: string;
}

export const ResetPasswordTemplate = ({ domain, token }: Props) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body>
          <Heading className="text-2xl font-bold mb-4">Сброс пароля</Heading>
          <Text className="mb-4">
            Для сброса пароля, пожалуйста, нажмите на кнопку ниже:
          </Text>
          <a
            href={`${domain}/auth/reset-password?token=${token}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Сбросить пароль
          </a>
          <Text className="mt-4">
            Если вы не запрашивали сброс пароля на нашем сайте, просто
            проигнорируйте это письмо.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
};
