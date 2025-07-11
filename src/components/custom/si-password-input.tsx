'use client';

import { useId, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { IconEye, IconEyeOff, IconShieldCancel, IconShieldCheck } from '@tabler/icons-react';

export default function SIPasswordInput({
  value,
  onChange,
  ...props
}: Readonly<React.InputHTMLAttributes<HTMLInputElement>>) {
  const id = useId();
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible(prevState => !prevState);

  // Use the external value if provided, otherwise use internal state
  const currentPassword = typeof value === 'string' ? value : password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'At least 8 characters', id: 'length' },
      { regex: /\d/, text: 'At least 1 number', id: 'number' },
      { regex: /[a-z]/, text: 'At least 1 lowercase letter', id: 'lowercase' },
      { regex: /[A-Z]/, text: 'At least 1 uppercase letter', id: 'uppercase' },
      {
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        text: 'At least 1 special character',
        id: 'special',
      },
    ];

    return requirements.map(req => ({
      met: req.regex.test(pass),
      text: req.text,
      id: req.id,
    }));
  };

  const strength = checkStrength(currentPassword);

  const strengthScore = useMemo(() => {
    return strength.filter(req => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-border';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-amber-500';
    if (score === 4) return 'bg-lime-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return 'Enter a password';
    if (score <= 2) return 'Weak password';
    if (score === 3) return 'Fair password';
    if (score === 4) return 'Good password';
    return 'Strong password';
  };

  return (
    <div>
      {/* Password input field with toggle visibility button */}

      <div className="relative">
        <Input
          id={id}
          className="pe-9"
          type={isVisible ? 'text' : 'password'}
          value={currentPassword}
          onChange={handleChange}
          aria-describedby={`${id}-description`}
          {...props}
        />
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <IconEyeOff size={16} aria-hidden="true" />
          ) : (
            <IconEye size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      <div className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full">
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 5) * 100}%` }}
          aria-hidden="true"
        ></div>
      </div>

      {/* Password strength description */}
      <p id={`${id}-description`} className="text-foreground mb-2 text-sm font-medium">
        {getStrengthText(strengthScore)}. Must contain:
      </p>

      {/* Password requirements list */}
      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map(req => (
          <li key={req.id} className="flex items-center gap-2">
            {req.met ? (
              <IconShieldCheck size={16} className="text-emerald-500" aria-hidden="true" />
            ) : (
              <IconShieldCancel size={16} className="text-muted-foreground/80" aria-hidden="true" />
            )}
            <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {req.text}
              <span className="sr-only">
                {req.met ? ' - Requirement met' : ' - Requirement not met'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
