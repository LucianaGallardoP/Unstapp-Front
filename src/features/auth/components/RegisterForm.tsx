import { useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png';
import { useSetInitialPassword } from '../hooks/useSetInitialPassword';
import type { LoginResponse } from '../types/auth.dtos';
import { useLanguage } from '../../../store/languageContext';

interface RegisterFormProps {
  onLoginClick?: () => void;
}

const tokenParamNames = [
  'token',
  'Token',
  'resetToken',
  'ResetToken',
  'registrationToken',
  'RegistrationToken',
  'passwordToken',
  'PasswordToken',
  'setPasswordToken',
  'SetPasswordToken',
];

const normalizeToken = (value: string) => value.trim().replace(/ /g, '+');

const isLoginResponse = (response: unknown): response is LoginResponse => {
  return Boolean(
    response &&
    typeof response === 'object' &&
    'token' in response &&
    'userId' in response &&
    'fullName' in response
  );
};

const saveSessionIfPresent = (response: unknown) => {
  if (!isLoginResponse(response)) return;

  localStorage.setItem('unstapp_token', response.token);
  localStorage.setItem('unstapp_user_id', String(response.userId));
  localStorage.setItem('unstapp_user_name', response.fullName);
  localStorage.setItem('unstapp_user_roles', JSON.stringify(response.roles ?? []));
  localStorage.setItem('unstapp_token_expires_at', response.expiresAt);
  if (response.avatarUrl) {
    localStorage.setItem('unstapp_user_avatar_url', response.avatarUrl);
  } else {
    localStorage.removeItem('unstapp_user_avatar_url');
  }
};

const readTokenFromParams = (searchParams: URLSearchParams, hash: string, pathToken?: string) => {
  for (const name of tokenParamNames) {
    const value = searchParams.get(name);

    if (value) {
      return normalizeToken(value);
    }
  }

  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashQuery = cleanHash.includes('?') ? cleanHash.slice(cleanHash.indexOf('?') + 1) : cleanHash;
  const hashParams = new URLSearchParams(hashQuery);

  for (const name of tokenParamNames) {
    const value = hashParams.get(name);

    if (value) {
      return normalizeToken(value);
    }
  }

  return pathToken ? normalizeToken(decodeURIComponent(pathToken)) : '';
};

const isResetPasswordPath = (pathname: string) => {
  const normalizedPath = pathname.toLowerCase();

  return (
    normalizedPath.includes('reset-password') ||
    normalizedPath.includes('restablecer') ||
    normalizedPath.includes('cambiar-clave') ||
    normalizedPath.includes('cambiar-contrasena') ||
    normalizedPath.includes('cambiar-contraseña')
  );
};

export const RegisterForm = ({ onLoginClick }: RegisterFormProps) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ token?: string }>();
  const token = readTokenFromParams(searchParams, location.hash, params.token);
  const isPasswordReset = isResetPasswordPath(location.pathname);
  const { setInitialPassword, resetPassword, loading, error } = useSetInitialPassword();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    password: '',
    repeatPassword: ''
  });

  const passwordsDoNotMatch = Boolean(
    formData.password &&
    formData.repeatPassword &&
    formData.password !== formData.repeatPassword,
  );

  const isFormValid = Boolean(
    formData.password &&
    formData.repeatPassword &&
    formData.password === formData.repeatPassword &&
    token,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError(isPasswordReset ? t('auth.invalidResetToken') : t('auth.invalidToken'));
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      setLocalError(t('auth.passwordsDontMatch'));
      return;
    }

    try {
      const response = isPasswordReset
        ? await resetPassword({
            token,
            newPassword: formData.password,
          })
        : await setInitialPassword({
            token,
            password: formData.password,
            confirmPassword: formData.repeatPassword,
          });

      saveSessionIfPresent(response);
      setIsSuccess(true);
    } catch {
      // El error se maneja y se muestra mediante el hook.
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center w-full max-w-[400px]">
        <div className="w-full p-10 md:p-12 bg-white border border-gray-200 rounded-[2.5rem] flex flex-col items-center">
          <div className="mb-8 mt-4">
            <svg width="140" height="140" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#3B82F6"/>
              <path d="M52 83L97 38L120 60C118 78 107 94 92 105L52 83Z" fill="#2563EB" opacity="0.6"/>
              <path d="M52 83L31 62C28 59 28 54 31 51C34 48 39 48 42 51L52 61L86 27C89 24 94 24 97 27C100 30 100 35 97 38L52 83Z" fill="white"/>
            </svg>
          </div>

          <h1 className="text-[2.5rem] font-extrabold text-black text-center leading-tight mb-3">
            {t('auth.done')}
          </h1>
          <p className="text-gray-500 text-[16px] text-center mb-10 leading-snug">
            {t('auth.doneSubtitle')}
          </p>

          <Button 
            type="button" 
            fullWidth 
            className="hover:bg-[#122b54] py-3.5 mt-4" 
            onClick={() => navigate(isPasswordReset ? '/login' : '/feed')}
          > 
            <span className="flex items-center justify-center gap-2 w-full text-[16px]">
              {isPasswordReset ? t('login.submit') : t('auth.start')}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[400px]">
      <div className="w-full p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
        <div className="mb-6 flex justify-center">
          <img src={unstaLogo} alt="Logo UNSTA" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-[2.5rem] font-bold text-black text-center leading-tight mb-2">
          {isPasswordReset ? t('auth.resetPassword') : t('auth.createPassword')}
        </h1>
        <p className="text-gray-500 text-[15px] text-center mb-8 leading-snug">
          {isPasswordReset ? t('auth.resetPasswordSubtitle') : t('auth.createPasswordSubtitle')}
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {(error || localError) && (
            <div className="bg-[#FFF8E6] text-[#B38000] p-4 rounded-xl text-[14.5px] leading-snug font-medium text-center border border-[#FFE5B4]">
              {localError || error}
            </div>
          )}
          
          {!token && !isSuccess && (
            <div className="bg-[#FFF8E6] text-[#B38000] p-4 rounded-xl text-[14.5px] leading-snug font-medium text-center border border-[#FFE5B4]">
              {isPasswordReset ? t('auth.invalidResetToken') : t('auth.invalidToken')}
            </div>
          )}

          <div className="flex flex-col">
            <Input
              label={t('login.password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              className={showPassword ? 'placeholder-gray-400' : 'placeholder-gray-300 text-lg tracking-widest'}
              value={formData.password} 
              disabled={loading} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setLocalError(null);
                setFormData({ ...formData, password: e.target.value });
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#1E4E9D] hover:text-[#122b54] focus:outline-none"
                  disabled={loading}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              }
            />
          </div>

          <div className="flex flex-col">
            <Input
              label={t('auth.repeatPassword')}
              id="repeatPassword"
              type={showRepeatPassword ? 'text' : 'password'}
              placeholder="********"
              className={showRepeatPassword ? 'placeholder-gray-400' : 'placeholder-gray-300 text-lg tracking-widest'}
              value={formData.repeatPassword} 
              disabled={loading} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setLocalError(null);
                setFormData({ ...formData, repeatPassword: e.target.value });
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="text-[#1E4E9D] hover:text-[#122b54] focus:outline-none"
                  disabled={loading}
                  aria-label={showRepeatPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showRepeatPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              }
            />
            {passwordsDoNotMatch && (
              <p className="mt-2 text-center text-[13px] font-medium text-[#E7000B]">
                {t('auth.passwordsDontMatch')}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            fullWidth 
            className="mt-2 hover:bg-[#122b54]" 
            disabled={loading || !isFormValid}
          > 
            {loading ? (
              <span className="flex items-center gap-2">
                {t('auth.saving')}
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isPasswordReset ? t('auth.saveNewPassword') : t('auth.savePassword')}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            )}
          </Button>
        </form>
      </div>

      <div className="text-center mt-6">
        <span className="text-gray-500 text-[15px]">{t('auth.hasAccount')} </span>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onLoginClick) {
              onLoginClick();
            } else {
              navigate('/login');
            }
          }}
          className="text-[#1E4E9D] font-bold text-[15px] hover:text-[#122b54] hover:underline transition-all"
        >
          {t('login.submit')}
        </button>
      </div>
    </div>
  );
};
