import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Componente reutilizable para inputs de formulario con estilo consistente
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = 'px-4 py-2.5 border rounded-lg',
}) => {
  return (
    <div className="w-4/5 flex flex-col">
      <label className="text-base font-semibold mb-2 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
};

interface ErrorMessageProps {
  message: string;
}

/**
 * Componente para mostrar mensajes de error de forma consistente
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="w-4/5 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm text-center">
      {message}
    </div>
  );
};

interface FormButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  loading?: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente para botones de formulario con estado de carga
 */
export const FormButton: React.FC<FormButtonProps> = ({
  type = 'submit',
  disabled = false,
  loading = false,
  loadingText,
  children,
  className = 'w-4/5 mt-6 bg-linear-to-r from-sky-600 to-blue-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50',
}) => {
  return (
    <button type={type} disabled={disabled || loading} className={className}>
      {loading ? loadingText : children}
    </button>
  );
};

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Componente para encabezado de formulario con título y subtítulo
 */
export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h2 className="text-4xl font-bold text-sky-700 mb-4 text-center">
        {title}
      </h2>
      <p className="text-gray-500 mb-10 text-center text-lg">{subtitle}</p>
    </>
  );
};

interface SwitchFormLinkProps {
  onClick: () => void;
  text: string;
  linkText: string;
}

/**
 * Componente para enlace de cambio entre formularios (Sign In/Sign Up)
 */
export const SwitchFormLink: React.FC<SwitchFormLinkProps> = ({
  onClick,
  text,
  linkText,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 text-sm font-semibold text-sky-600 hover:underline text-center w-full"
    >
      {text} {linkText}
    </button>
  );
};
