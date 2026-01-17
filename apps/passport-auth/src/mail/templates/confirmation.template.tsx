import {
  Html,
  Head,
  Body,
  Text,
  Heading,
  Tailwind,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  domain: string;
  token: string;
}

export const ConfirmationTemplate = ({ domain, token }: Props) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body>
          <Heading className="text-2xl font-bold mb-4">
            Подтверждение аккаунта
          </Heading>
          <Text className="mb-4">
            Спасибо за регистрацию! Пожалуйста, подтвердите ваш аккаунт, нажав
            на кнопку ниже:
          </Text>
          <Link
            href={`${domain}/auth/confirm?token=${token}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Подтвердить аккаунт
          </Link>
          <Text className="mt-4">
            Если вы не регистрировались на нашем сайте, просто проигнорируйте
            это письмо.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
};
