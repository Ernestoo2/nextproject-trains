import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateSelector from '../DateSelector';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import { addDays, format } from 'date-fns';

// Mock the store
jest.mock('@/store/trainSearchStore', () => ({
  useTrainSearchStore: jest.fn(),
}));

describe('DateSelector', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 21);

  const defaultProps = {
    selectedDate: format(tomorrow, 'yyyy-MM-dd'),
    onDateChange: jest.fn(),
    minDate: format(today, 'yyyy-MM-dd'),
    maxDate: format(maxDate, 'yyyy-MM-dd'),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock store implementation
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        date: format(tomorrow, 'yyyy-MM-dd'),
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: null,
    }));
  });

  it('renders correctly with initial props', () => {
    render(<DateSelector {...defaultProps} />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue(format(tomorrow, 'MMM dd, yyyy'))).toBeInTheDocument();
  });

  it('handles date selection correctly', async () => {
    render(<DateSelector {...defaultProps} />);
    
    const dateInput = screen.getByRole('textbox');
    const newDate = addDays(today, 2);
    
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, format(newDate, 'MMM dd, yyyy'));
    
    expect(defaultProps.onDateChange).toHaveBeenCalledWith(format(newDate, 'yyyy-MM-dd'));
  });

  it('disables input during loading', () => {
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        date: format(tomorrow, 'yyyy-MM-dd'),
      },
      setFilters: jest.fn(),
      isLoading: true,
      error: null,
    }));

    render(<DateSelector {...defaultProps} />);
    
    const dateInput = screen.getByRole('textbox');
    expect(dateInput).toBeDisabled();
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Invalid date selected';
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        date: format(tomorrow, 'yyyy-MM-dd'),
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: errorMessage,
    }));

    render(<DateSelector {...defaultProps} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('prevents selecting date before minDate', async () => {
    render(<DateSelector {...defaultProps} />);
    
    const dateInput = screen.getByRole('textbox');
    const pastDate = addDays(today, -1);
    
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, format(pastDate, 'MMM dd, yyyy'));
    
    expect(defaultProps.onDateChange).not.toHaveBeenCalled();
  });

  it('prevents selecting date after maxDate', async () => {
    render(<DateSelector {...defaultProps} />);
    
    const dateInput = screen.getByRole('textbox');
    const futureDate = addDays(today, 22);
    
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, format(futureDate, 'MMM dd, yyyy'));
    
    expect(defaultProps.onDateChange).not.toHaveBeenCalled();
  });

  it('validates date format', async () => {
    render(<DateSelector {...defaultProps} />);
    
    const dateInput = screen.getByRole('textbox');
    
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, 'invalid date');
    
    expect(defaultProps.onDateChange).not.toHaveBeenCalled();
  });
}); 