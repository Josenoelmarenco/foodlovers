import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../src/components/SearchBar';

describe('<SearchBar />', () => {
  it('fires onSubmit with the trimmed value when the form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);

    const input = screen.getByRole('searchbox');
    await userEvent.type(input, '  pizza  ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('pizza');
  });

  it('seeds the input with initialValue', () => {
    render(<SearchBar initialValue="ramen" onSubmit={() => {}} />);
    expect(screen.getByRole('searchbox')).toHaveValue('ramen');
  });
});
