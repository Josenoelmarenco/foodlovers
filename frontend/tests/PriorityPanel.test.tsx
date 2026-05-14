import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriorityPanel } from '../src/components/PriorityPanel';

describe('<PriorityPanel />', () => {
  it('rebalances other sliders proportionally when one changes', () => {
    const onChange = vi.fn();
    render(
      <PriorityPanel
        value={{ price: 1 / 3, speed: 1 / 3, quality: 1 / 3 }}
        onChange={onChange}
      />,
    );

    // The label contains both "Price" and the live percentage, so we look up
    // the slider by its ARIA role + accessible name (regex substring match).
    const priceSlider = screen.getByRole('slider', { name: /price/i });
    fireEvent.change(priceSlider, { target: { value: '0.6' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0];
    expect(next.price).toBeCloseTo(0.6, 5);
    const sum = next.price + next.speed + next.quality;
    expect(sum).toBeCloseTo(1, 5);
    // Other two were equal before → should remain equal after rebalancing.
    expect(next.speed).toBeCloseTo(next.quality, 5);
  });

  it('Reset button restores even weighting', () => {
    const onChange = vi.fn();
    render(
      <PriorityPanel value={{ price: 0.8, speed: 0.1, quality: 0.1 }} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onChange).toHaveBeenCalledWith({
      price: 1 / 3,
      speed: 1 / 3,
      quality: 1 / 3,
    });
  });
});
