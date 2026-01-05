/**
 * @file SignInForm.tsx
 * @description Componente SignInForm - Formulario de inicio de sesión
 *
 * Formulario para autenticación de usuarios ya registrados.
 * Permite acceder con username/email y contraseña.
 *
 * Características:
 * - Input para username/email
 * - Input para contraseña (enmascarado)
 * - Validación de campos
 * - Mensajes de error específicos
 * - Loading state durante autenticación
 * - Enlace a registro para nuevos usuarios
 * - Recuperación de contraseña (opcional)
 * - Submit al presionar Enter
 * - Integración con Redux/authService
 *
 * Estados:
 * - username: Valor del input usuario
 * - password: Valor del input contraseña
 * - loading: Enviando al servidor
 * - error: Mensaje de error si falla
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires react
 * @requires ../services/authService
 * @requires ../hooks
 * @module client/components/SignInForm
 * @see SignUpForm
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

interface SignInFormProps {
  onSwitch?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { values: formData, handleChange } = useFormInput({
    username: '',
    password: '',
  });
  const { loading, error, startLoading, stopLoading, handleError, clearError } =
    useLoadingError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();

    try {
      const response = await authService.login(formData);
      authService.saveUser(response.user);
      if (response.token) authService.saveToken(response.token);
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
        title={t('signIn.title', 'Sign In')}
        subtitle={t('signIn.subtitle', 'Access your account to explore more.')}
      />

      <form
        className="w-full flex flex-col items-center gap-5"
        onSubmit={handleSubmit}
      >
        {error && <ErrorMessage message={error} />}

        <FormInput
          label={t('signIn.usernameLabel', 'Username')}
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder={t('signIn.usernamePlaceholder', 'Enter your username')}
        />

        <FormInput
          label={t('signIn.passwordLabel', 'Password')}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder={t('signIn.passwordPlaceholder', 'Enter your password')}
        />

        <FormButton
          loading={loading}
          loadingText={t('signIn.loadingButton', 'Loading...')}
        >
          {t('signIn.signInButton', 'Sign In')}
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

export default SignInForm;
