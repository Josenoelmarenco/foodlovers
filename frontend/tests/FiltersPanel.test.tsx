import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltersPanel } from '../src/components/FiltersPanel';

describe('<FiltersPanel />', () => {
  it('reports a cuisine change to its parent', async () => {
    const onChange = vi.fn();
    render(<FiltersPanel value={{}} onChange={onChange} />);

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /cuisine/i }),
      'Italian',
    );

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cuisine: 'Italian' }));
  });

  it('renders a "Clear all" affordance only when at least one filter is active', () => {
    const { rerender } = render(<FiltersPanel value={{}} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();

    rerender(<FiltersPanel value={{ cuisine: 'Italian' }} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });
});
