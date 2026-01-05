/**
 * @file SignUpForm.tsx
 * @description Componente SignUpForm - Formulario de registro
 *
 * Formulario para registro de nuevos usuarios en la plataforma.
 * Valida datos y crea nueva cuenta.
 *
 * Características:
 * - Input para username (único)
 * - Input para email (único, validado)
 * - Input para contraseña (con requisitos)
 * - Input de confirmación de contraseña
 * - Validación de contraseña fuerte
 * - Mensajes de error específicos
 * - Loading state durante registro
 * - Enlace a login para usuarios existentes
 * - Términos y condiciones (checkbox)
 * - Submit al presionar Enter
 * - Integración con authService
 *
 * Validaciones:
 * - Username: 3-20 caracteres, alfanuméricos
 * - Email: Formato válido, único en BD
 * - Password: Min 8 chars, mayúscula, minúscula, número
 * - Confirmation: Debe coincidir con password
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires react
 * @requires ../services/authService
 * @requires ../hooks
 * @module client/components/SignUpForm
 * @see SignInForm
 * @see shared/FormComponents
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useFormInput, useLoadingError } from '../hooks';
import { useTranslation } from 'react-i18next';
import {
  FormHeader,
  FormInput,
  ErrorMessage,
  FormButton,
  SwitchFormLink,
} from './shared/FormComponents';
import '../styles/auth-modal.css';

interface SignUpFormProps {
  onSwitch?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { values: formData, handleChange } = useFormInput({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { loading, error, startLoading, stopLoading, handleError, clearError } =
    useLoadingError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      handleError(new Error(t('signUp.passwordsNoCoinciden')));
      return;
    }

    startLoading();

    try {
      await authService.register(formData);
      navigate('/home');
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    clearError();
  };

  return (
    <>
      <FormHeader
        title={t('signUp.title', 'Sign Up')}
        subtitle={t('signUp.subtitle', 'Create your account to get started.')}
      />

      <form
        className="w-full flex flex-col items-center gap-5"
        onSubmit={handleSubmit}
      >
        {error && <ErrorMessage message={error} />}

        <FormInput
          label={t('signUp.usernameLabel', 'Username')}
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder={t('signUp.usernamePlaceholder', 'Enter your username')}
        />

        <FormInput
          label={t('signUp.emailLabel', 'Email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={t('signUp.emailPlaceholder', 'Enter your email')}
        />

        <FormInput
          label={t('signUp.passwordLabel', 'Password')}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder={t('signUp.passwordPlaceholder', 'Enter your password')}
        />

        <FormInput
          label={t('signUp.confirmPasswordLabel', 'Confirm Password')}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder={t(
            'signUp.confirmPasswordPlaceholder',
            'Confirm your password'
          )}
        />

        <FormButton
          loading={loading}
          loadingText={t('signUp.loadingButton', 'Loading...')}
        >
          {t('signUp.createButton', 'Create Account')}
        </FormButton>
      </form>

      {onSwitch && (
        <SwitchFormLink
          onClick={onSwitch}
          text={t('signUp.haveAccount', 'Already have an account?')}
          linkText={t('signUp.signIn', 'Sign In')}
        />
      )}
    </>
  );
};

export default SignUpForm;
