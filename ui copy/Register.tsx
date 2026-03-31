import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../auth/useAuth';
import { apiFetchPublic } from '../../lib/api';
import { buildApiUrl } from '../../lib/apiConfig';

const registerVariants = cva('relative flex flex-col', {
  variants: {
    variant: {
      default: 'border-0',
    },
    backgroundColor: {
      light: 'bg-gradient-to-br from-blue-400/30 via-slate-600/30 to-slate-500/30',
      dark: 'bg-gradient-to-br from-indigo-950/80 via-blue-600/80 to-black/80',
    },
  },
  defaultVariants: {
    variant: 'default',
    backgroundColor: 'light',
  },
});

type FieldConfig = {
  type: string;
  placeholder: string;
};

type RegisterData = {
  h1: string;
  esc: string;
  btn: string;
  link: string;
  input: FieldConfig[];
};

type AuthUiState = 'verify' | 'register' | 'login' | 'forgotPassword' | 'resetPassword' | 'checkEmail';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

interface RegisterDataProps {
  data?: RegisterData;
  onClose?: () => void;
}

interface RegisterProps extends RegisterDataProps, VariantProps<typeof registerVariants> {}

const defaultData: RegisterData = {
  h1: 'Enter your email to start',
  esc: '✕',
  btn: 'Keep Going →',
  link: '',
  input: [{ type: 'email', placeholder: 'Email' }],
};

const reg: RegisterData = {
  h1: 'Register',
  esc: '←',
  btn: 'Register →',
  link: 'Already have an account ?',
  input: [
    { type: 'text', placeholder: 'Username' },
    { type: 'email', placeholder: 'Email' },
    { type: 'password', placeholder: 'Password' },
  ],
};

const log: RegisterData = {
  h1: 'Login',
  esc: '←',
  btn: 'Login →',
  link: "Don't have an account ?",
  input: [
    { type: 'email', placeholder: 'Email' },
    { type: 'password', placeholder: 'Password' },
  ],
};

const forgotPasswordData: RegisterData = {
  h1: 'Forgot password',
  esc: '←',
  btn: 'Send reset link →',
  link: '',
  input: [{ type: 'email', placeholder: 'Email' }],
};

const resetPasswordData: RegisterData = {
  h1: 'Reset password',
  esc: '←',
  btn: 'Reset password →',
  link: '',
  input: [
    { type: 'text', placeholder: 'Reset token' },
    { type: 'password', placeholder: 'New password' },
    { type: 'password', placeholder: 'Confirm password' },
  ],
};

const checkEmailData: RegisterData = {
  h1: 'Check your email',
  esc: '←',
  btn: 'Go to login →',
  link: '',
  input: [],
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractUserList(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.filter((item) => typeof item === 'object' && item !== null) as Array<Record<string, unknown>>;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const members = record['hydra:member'];
    if (Array.isArray(members)) {
      return members.filter((item) => typeof item === 'object' && item !== null) as Array<Record<string, unknown>>;
    }
  }

  return [];
}

function emailExistsInPayload(payload: unknown, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return extractUserList(payload).some((user) => String(user.email ?? '').toLowerCase() === normalizedEmail);
}

type ApiError = {
  error?: string;
  message?: string;
};

const EMAIL_VERIFICATION_STORAGE_KEY = 'sae-email-verification-status';

type PasswordStrength = 'bad' | 'acceptable' | 'good';

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return 'bad';
  }
  if (score <= 3) {
    return 'acceptable';
  }

  return 'good';
}

function getVerificationStatusStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>((acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function setEmailVerifiedStatus(email: string, isVerified: boolean) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  const store = getVerificationStatusStore();
  store[normalizedEmail] = isVerified;
  localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(store));
}

async function readJsonSafe(response: Response): Promise<unknown | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getErrorMessage(status: number, payload: unknown) {
  const data = (payload && typeof payload === 'object' ? payload : null) as ApiError | null;
  const message = data?.error || data?.message || '';

  if (status === 400) {
    return message || 'Invalid data (check email, username, and password).';
  }
  if (status === 401) {
    return message || 'Invalid credentials.';
  }
  if (status === 409) {
    return message || 'Email or username is already used.';
  }
  if (status >= 500) {
    return 'Server error, please try again later.';
  }

  return message || 'An error occurred.';
}

async function checkEmailExists(email: string) {
  const encodedEmail = encodeURIComponent(email.trim());
  const response = await fetch(buildApiUrl(`/users?email=${encodedEmail}`), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Email verification failed with status ${response.status}`);
  }

  const byEmail = (await response.json()) as unknown;
  return emailExistsInPayload(byEmail, email);
}

export default function Register({ data, onClose, variant, backgroundColor }: RegisterProps) {
  const [uiState, setUiState] = useState<AuthUiState>('verify');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  const currentData = useMemo(() => {
    if (data) {
      return data;
    }
    if (uiState === 'forgotPassword') {
      return forgotPasswordData;
    }
    if (uiState === 'resetPassword') {
      return resetPasswordData;
    }
    if (uiState === 'checkEmail') {
      return checkEmailData;
    }
    if (uiState === 'login') {
      return log;
    }
    if (uiState === 'register') {
      return reg;
    }
    return defaultData;
  }, [data, uiState]);

  const resetToVerify = () => {
    setUiState('verify');
    setPassword('');
    setUsername('');
    setResetToken('');
    setResetPassword('');
    setResetPasswordConfirm('');
    setInfoMessage(null);
    setError(null);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    const verifiedFlag = searchParams.get('verified');
    if (verifiedFlag !== '1') {
      return;
    }

    const verifiedEmail = searchParams.get('email');
    if (verifiedEmail) {
      setEmail(verifiedEmail);
    }

    setUiState('login');
    setInfoMessage('Email verifie avec succes. Vous pouvez maintenant vous connecter.');
    setError(null);

    const next = new URLSearchParams(searchParams);
    next.delete('verified');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      return;
    }

    setResetToken(tokenFromUrl.trim());
    setUiState('resetPassword');
    setInfoMessage('Definissez votre nouveau mot de passe.');
    setError(null);

    const next = new URLSearchParams(searchParams);
    next.delete('token');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePrimarySubmit = async () => {
    setInfoMessage(null);
    setError(null);

    if (uiState === 'verify') {
      const normalizedEmail = email.trim();
      if (!isValidEmail(normalizedEmail)) {
        setError('Please provide a valid email address.');
        return;
      }

      try {
        setIsLoading(true);
        const exists = await checkEmailExists(normalizedEmail);
        setUiState(exists ? 'login' : 'register');
      } catch {
        setError('Unable to verify this email right now.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (uiState === 'login') {
      if (!password.trim()) {
        setError('Please enter your password.');
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      try {
        setIsLoading(true);
        await login({ identifier: normalizedEmail, password });
        navigate(redirectTo, { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (uiState === 'forgotPassword') {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        setError('Please provide a valid email address.');
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiFetchPublic(buildApiUrl('/request-password-reset'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        const payload = await readJsonSafe(response);
        if (!response.ok) {
          throw new Error(getErrorMessage(response.status, payload));
        }

        const responseMessage =
          payload && typeof payload === 'object' && 'message' in payload
            ? String((payload as Record<string, unknown>).message ?? '')
            : 'Si cet email existe, un lien de reinitialisation a ete envoye.';

        setUiState('resetPassword');
        setInfoMessage(`${responseMessage} Collez le token recu par email pour continuer.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to request password reset.';
        setError(message);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (uiState === 'resetPassword') {
      const trimmedToken = resetToken.trim();
      const trimmedPassword = resetPassword.trim();
      const trimmedConfirm = resetPasswordConfirm.trim();

      if (!trimmedToken) {
        setError('Please provide the reset token.');
        return;
      }

      if (!trimmedPassword) {
        setError('Please provide a new password.');
        return;
      }

      if (trimmedPassword !== trimmedConfirm) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiFetchPublic(buildApiUrl('/reset-password'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: trimmedToken,
            password: trimmedPassword,
          }),
        });

        const payload = await readJsonSafe(response);
        if (!response.ok) {
          throw new Error(getErrorMessage(response.status, payload));
        }

        setUiState('login');
        setPassword('');
        setResetPassword('');
        setResetPasswordConfirm('');
        setResetToken('');
        setInfoMessage('Mot de passe reinitialise avec succes. Vous pouvez maintenant vous connecter.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to reset password.';
        setError(message);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (uiState === 'checkEmail') {
      setUiState('login');
      setInfoMessage('Vous pouvez maintenant vous connecter une fois votre email valide.');
      return;
    }


    if (!username.trim() || !password.trim()) {
      setError('Please fill username and password.');
      return;
    }

    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const registerResponse = await apiFetchPublic(buildApiUrl('/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      if (!registerResponse.ok) {
        const errorPayload = await readJsonSafe(registerResponse);
        throw new Error(getErrorMessage(registerResponse.status, errorPayload));
      }

      setEmailVerifiedStatus(normalizedEmail, false);
      setUiState('checkEmail');
      setPassword('');
      setInfoMessage('Inscription reussie. Verifiez votre email via le lien recu, puis revenez vous connecter.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to register.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handlePrimarySubmit();
  };

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordStrengthUi =
    passwordStrength === 'bad'
      ? {
          label: 'Mauvais',
          textClass: 'text-red-600',
          barClass: 'bg-red-500',
          widthClass: 'w-1/3',
        }
      : passwordStrength === 'acceptable'
      ? {
          label: 'Acceptable',
          textClass: 'text-yellow-600',
          barClass: 'bg-yellow-400',
          widthClass: 'w-2/3',
        }
      : {
          label: 'Bon',
          textClass: 'text-green-600',
          barClass: 'bg-green-500',
          widthClass: 'w-full',
        };

  const formHeightClass =
    uiState === 'verify'
      ? 'min-h-[281px]'
      : uiState === 'register'
      ? 'min-h-[518px]'
      : uiState === 'forgotPassword'
      ? 'min-h-[334px]'
      : uiState === 'resetPassword'
      ? 'min-h-[470px]'
      : uiState === 'checkEmail'
      ? 'min-h-[300px]'
      : 'min-h-[334px]';

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        registerVariants({ variant, backgroundColor }),
        'relative w-[325px] rounded-[10px] bg-[#ececec] px-5 pt-4 pb-6',
        formHeightClass,
      )}
    >
      <button
        type='button'
        onClick={uiState === 'verify' ? handleClose : resetToVerify}
        className='absolute left-4 top-4 text-[34px] leading-none text-black transition-opacity hover:opacity-70'
        aria-label={uiState === 'verify' ? 'Close' : 'Back'}
      >
        {uiState === 'verify' ? '✕' : '←'}
      </button>

      <h1 className='mt-[40px] mb-[10px] text-center text-[36px] font-medium leading-[41px] text-black'>
        {currentData.h1}
      </h1>

      {infoMessage && <p className='mx-auto mb-3 w-[285px] text-xs text-blue-700'>{infoMessage}</p>}

      <div className='mx-auto mb-2 w-[285px] space-y-[10px]'>
        {currentData.input.map((inputProps, index) => {
          const fieldKey = inputProps.placeholder.toLowerCase();
          const isEmailField = fieldKey.includes('email');
          const isUsernameField = fieldKey.includes('username');
          const isPasswordField = fieldKey.includes('password');
          const isTokenField = fieldKey.includes('reset token');
          const isConfirmPasswordField = fieldKey.includes('confirm password');

          const value = isEmailField
            ? email
            : isUsernameField
            ? username
            : isConfirmPasswordField
            ? resetPasswordConfirm
            : isTokenField
            ? resetToken
            : isPasswordField
            ? uiState === 'resetPassword'
              ? resetPassword
              : password
            : '';

          const isEmailReadOnly = isEmailField && !['verify', 'forgotPassword'].includes(uiState);

          return (
            <div key={`${inputProps.placeholder}-${index}`}>
              <input
                type={inputProps.type}
                placeholder={inputProps.placeholder}
                value={value}
                onChange={(event) => {
                  if (isEmailField) {
                    setEmail(event.target.value);
                  } else if (isUsernameField) {
                    setUsername(event.target.value);
                  } else if (isConfirmPasswordField) {
                    setResetPasswordConfirm(event.target.value);
                  } else if (isTokenField) {
                    setResetToken(event.target.value);
                  } else if (isPasswordField) {
                    if (uiState === 'resetPassword') {
                      setResetPassword(event.target.value);
                    } else {
                      setPassword(event.target.value);
                    }
                  }
                }}
                readOnly={isEmailReadOnly}
                className={cn(
                  'h-[43px] w-full rounded-[10px] border border-[#c7c7c7] px-5 text-[26px] leading-[30px] text-black placeholder:text-[#7b7b7b] focus:border-[#b0b0b0] focus:outline-none',
                  isEmailReadOnly ? 'bg-[#dddddd] text-[#6b6b6b] cursor-not-allowed' : 'bg-[#ececec]'
                )}
              />

              {(uiState === 'register' || uiState === 'resetPassword') &&
                isPasswordField &&
                !isConfirmPasswordField &&
                (uiState === 'resetPassword' ? resetPassword.length : password.length) > 0 && (
                <div className='mt-2'>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-gray-300'>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        uiState === 'resetPassword'
                          ? getPasswordStrength(resetPassword) === 'bad'
                            ? 'bg-red-500 w-1/3'
                            : getPasswordStrength(resetPassword) === 'acceptable'
                            ? 'bg-yellow-400 w-2/3'
                            : 'bg-green-500 w-full'
                          : cn(passwordStrengthUi.barClass, passwordStrengthUi.widthClass)
                      )}
                    />
                  </div>
                  {uiState === 'register' ? (
                    <p className={cn('mt-1 text-xs font-medium', passwordStrengthUi.textClass)}>
                      Robustesse du mot de passe : {passwordStrengthUi.label}
                    </p>
                  ) : (
                    <p
                      className={cn(
                        'mt-1 text-xs font-medium',
                        getPasswordStrength(resetPassword) === 'bad'
                          ? 'text-red-600'
                          : getPasswordStrength(resetPassword) === 'acceptable'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      )}
                    >
                      Robustesse du mot de passe :
                      {' '}
                      {getPasswordStrength(resetPassword) === 'bad'
                        ? 'Mauvais'
                        : getPasswordStrength(resetPassword) === 'acceptable'
                        ? 'Acceptable'
                        : 'Bon'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {uiState === 'login' && (
        <button
          type='button'
          onClick={() => {
            setUiState('forgotPassword');
            setPassword('');
            setError(null);
            setInfoMessage(null);
          }}
          className='mx-auto mb-3 block w-[285px] text-left text-[20px] leading-[24px] text-[#53B0F8] underline'
        >
          Mot de passe oublie ?
        </button>
      )}

      {error && <p className='mx-auto mb-3 w-[285px] text-xs text-red-600'>{error}</p>}

      <button
        type='submit'
        disabled={isLoading}
        className='mx-auto flex h-[43px] w-[285px] items-center justify-center rounded-[10px] bg-[#EA4098] text-[33px] leading-[38px] text-white transition-colors hover:bg-[#d7378a] disabled:opacity-60'
      >
        {isLoading ? 'Loading...' : currentData.btn}
      </button>

      {currentData.link && (
        <button
          type='button'
          className='mx-auto mt-[10px] block w-[285px] text-left text-[26px] leading-[30px] text-[#53B0F8] underline'
          onClick={() => setUiState(uiState === 'login' ? 'register' : 'login')}
        >
          {currentData.link}
        </button>
      )}
    </form>
  );
}