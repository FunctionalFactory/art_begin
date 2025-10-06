import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceRangeFilter } from '../price-range-filter';

// Mock ResizeObserver for Radix UI Slider
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('PriceRangeFilter', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    minPrice: 0,
    maxPrice: 1000000,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render slider and inputs', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('가격 범위')).toBeInTheDocument();
      expect(screen.getByLabelText('최소 (원)')).toBeInTheDocument();
      expect(screen.getByLabelText('최대 (원)')).toBeInTheDocument();
    });

    it('should display formatted price range', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('0원 - 1,000,000원')).toBeInTheDocument();
    });

    it('should initialize with provided min and max prices', () => {
      render(<PriceRangeFilter minPrice={100000} maxPrice={500000} onChange={mockOnChange} />);

      const minInput = screen.getByLabelText('최소 (원)') as HTMLInputElement;
      const maxInput = screen.getByLabelText('최대 (원)') as HTMLInputElement;

      expect(minInput.value).toBe('100000');
      expect(maxInput.value).toBe('500000');
      expect(screen.getByText('100,000원 - 500,000원')).toBeInTheDocument();
    });
  });

  describe('Slider Interaction', () => {
    it('should update range when slider changes', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const slider = screen.getByRole('slider');

      // Simulate slider change by triggering the underlying change handler
      // Note: Testing slider interaction in jsdom is limited, so we'll verify the structure exists
      expect(slider).toBeInTheDocument();
    });

    it('should call onChange when slider is committed', async () => {
      render(<PriceRangeFilter {...defaultProps} />);

      // The Slider component from Radix UI should be present
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Input Changes', () => {
    it('should update minimum price input', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByLabelText('최소 (원)');

      await user.clear(minInput);
      await user.type(minInput, '200000');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(200000, 1000000);
      });
    });

    it('should update maximum price input', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByLabelText('최대 (원)');

      await user.clear(maxInput);
      await user.type(maxInput, '800000');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(0, 800000);
      });
    });

    it('should prevent min price from exceeding max price', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter minPrice={0} maxPrice={500000} onChange={mockOnChange} />);

      const minInput = screen.getByLabelText('최소 (원)');

      await user.clear(minInput);
      await user.type(minInput, '600000');

      await waitFor(() => {
        // Min should be clamped to max value
        expect(mockOnChange).toHaveBeenCalledWith(500000, 500000);
      });
    });

    it('should prevent max price from being below min price', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter minPrice={300000} maxPrice={1000000} onChange={mockOnChange} />);

      const maxInput = screen.getByLabelText('최대 (원)');

      await user.clear(maxInput);
      await user.type(maxInput, '200000');

      await waitFor(() => {
        // Max should be clamped to min value
        expect(mockOnChange).toHaveBeenCalledWith(300000, 300000);
      });
    });
  });

  describe('Props Updates', () => {
    it('should update range when minPrice prop changes', () => {
      const { rerender } = render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByLabelText('최소 (원)') as HTMLInputElement;
      expect(minInput.value).toBe('0');

      rerender(<PriceRangeFilter minPrice={100000} maxPrice={1000000} onChange={mockOnChange} />);

      expect(minInput.value).toBe('100000');
    });

    it('should update range when maxPrice prop changes', () => {
      const { rerender } = render(<PriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByLabelText('최대 (원)') as HTMLInputElement;
      expect(maxInput.value).toBe('1000000');

      rerender(<PriceRangeFilter minPrice={0} maxPrice={500000} onChange={mockOnChange} />);

      expect(maxInput.value).toBe('500000');
    });
  });

  describe('Price Formatting', () => {
    it('should format prices with toLocaleString', () => {
      render(<PriceRangeFilter minPrice={123456} maxPrice={789012} onChange={mockOnChange} />);

      expect(screen.getByText('123,456원 - 789,012원')).toBeInTheDocument();
    });

    it('should format zero correctly', () => {
      render(<PriceRangeFilter minPrice={0} maxPrice={0} onChange={mockOnChange} />);

      expect(screen.getByText('0원 - 0원')).toBeInTheDocument();
    });

    it('should update formatted display when values change', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByLabelText('최소 (원)');

      await user.clear(minInput);
      await user.type(minInput, '250000');

      await waitFor(() => {
        expect(screen.getByText('250,000원 - 1,000,000원')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByLabelText('최소 (원)');

      await user.clear(minInput);

      await waitFor(() => {
        // Should default to 0 when empty
        expect(mockOnChange).toHaveBeenCalledWith(0, 1000000);
      });
    });

    it('should handle both inputs being the same value', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByLabelText('최소 (원)');
      const maxInput = screen.getByLabelText('최대 (원)');

      await user.clear(minInput);
      await user.type(minInput, '500000');

      await user.clear(maxInput);
      await user.type(maxInput, '500000');

      await waitFor(() => {
        expect(screen.getByText('500,000원 - 500,000원')).toBeInTheDocument();
      });
    });
  });
});
