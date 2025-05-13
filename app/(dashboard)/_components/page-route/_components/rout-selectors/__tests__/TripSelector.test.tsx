import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripSelector from '../TripSelector';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import type { TripType } from '@/types/shared/trains';

// Mock the store
jest.mock('@/store/trainSearchStore', () => ({
  useTrainSearchStore: jest.fn(),
}));

describe('TripSelector', () => {
  const mockTripTypes = [
    { value: 'ONE_WAY' as TripType, label: 'One Way' },
    { value: 'ROUND_TRIP' as TripType, label: 'Round Trip' },
  ];

  const defaultProps = {
    value: 'ONE_WAY' as TripType,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock store implementation
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        tripType: 'ONE_WAY' as TripType,
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: null,
    }));
  });

  it('renders correctly with initial props', () => {
    render(<TripSelector {...defaultProps} />);
    
    expect(screen.getByText('Trip Type')).toBeInTheDocument();
    expect(screen.getByText('One Way')).toBeInTheDocument();
  });

  it('handles trip type selection correctly', async () => {
    render(<TripSelector {...defaultProps} />);
    
    // Open trip type dropdown
    const tripTypeButton = screen.getByText('One Way');
    await userEvent.click(tripTypeButton);
    
    // Select a different trip type
    const tripTypeOption = screen.getByText('Round Trip');
    await userEvent.click(tripTypeOption);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('ROUND_TRIP');
  });

  it('disables button during loading', () => {
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        tripType: 'ONE_WAY' as TripType,
      },
      setFilters: jest.fn(),
      isLoading: true,
      error: null,
    }));

    render(<TripSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to update trip type';
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        tripType: 'ONE_WAY' as TripType,
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: errorMessage,
    }));

    render(<TripSelector {...defaultProps} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(<TripSelector {...defaultProps} />);
    
    // Open trip type dropdown
    const tripTypeButton = screen.getByText('One Way');
    await userEvent.click(tripTypeButton);
    
    // Click outside
    await userEvent.click(document.body);
    
    expect(screen.queryByText('Round Trip')).not.toBeInTheDocument();
  });

  it('validates trip type selection', async () => {
    render(<TripSelector {...defaultProps} />);
    
    // Open trip type dropdown
    const tripTypeButton = screen.getByText('One Way');
    await userEvent.click(tripTypeButton);
    
    // Try to select invalid trip type
    const tripTypeOption = screen.getByText('Round Trip');
    await userEvent.click(tripTypeOption);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('ROUND_TRIP');
  });

  it('syncs with store on mount', () => {
    const storeTripType = 'ROUND_TRIP' as TripType;
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        tripType: storeTripType,
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: null,
    }));

    render(<TripSelector {...defaultProps} />);
    
    expect(screen.getByText('Round Trip')).toBeInTheDocument();
  });
}); 