import { useState, type FormEvent } from 'react';

interface Props {
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  size?: 'sm' | 'lg';
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search a dish, e.g. pizza, ramen, burger…',
  onSubmit,
  size = 'lg',
}: Props) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  const inputClasses =
    size === 'lg'
      ? 'h-14 px-5 text-lg'
      : 'h-10 px-4 text-sm';

  const buttonClasses =
    size === 'lg' ? 'h-14 px-6 text-base' : 'h-10 px-4 text-sm';

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <label htmlFor="search-input" className="sr-only">
        Search dishes
      </label>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full flex-1 rounded-2xl border border-neutral-300 bg-white shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none ${inputClasses}`}
        autoComplete="off"
      />
      <button
        type="submit"
        className={`rounded-2xl bg-brand-500 font-semibold text-white shadow-sm transition hover:bg-brand-600 ${buttonClasses}`}
      >
        Search
      </button>
    </form>
  );
}
