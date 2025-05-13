import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PassengerClassSelector from '../PassengerClassSelector';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import type { TrainClass, PassengerDetails } from '@/types/shared/trains';

// Mock the store
jest.mock('@/store/trainSearchStore', () => ({
  useTrainSearchStore: jest.fn(),
}));

describe('PassengerClassSelector', () => {
  const mockClasses: TrainClass[] = [
    {
      _id: '1',
      className: 'First Class',
      classCode: 'FC',
      classType: 'FIRST_CLASS',
      basePrice: 1000,
      isActive: true,
      capacity: 50,
      amenities: ['WiFi', 'Meals'],
      description: 'Luxury travel experience'
    },
    {
      _id: '2',
      className: 'Second Class',
      classCode: 'SC',
      classType: 'STANDARD',
      basePrice: 500,
      isActive: true,
      capacity: 100,
      amenities: ['Basic'],
      description: 'Standard travel experience'
    }
  ];

  const defaultProps = {
    availableClasses: mockClasses,
    selectedClass: '1',
    passengerCounts: {
      classType: 'FIRST_CLASS',
      adultCount: 1,
      childCount: 0,
      infantCount: 0
    },
    onClassSelect: jest.fn(),
    onPassengerCountChange: jest.fn(),
    maxPassengersPerBooking: 6
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock store implementation
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        classType: 'FIRST_CLASS',
        passengers: {
          adultCount: 1,
          childCount: 0,
          infantCount: 0
        }
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: null,
    }));
  });

  it('renders correctly with initial props', () => {
    render(<PassengerClassSelector {...defaultProps} />);
    
    expect(screen.getByText('Class')).toBeInTheDocument();
    expect(screen.getByText('First Class')).toBeInTheDocument();
    expect(screen.getByText('1 Adult')).toBeInTheDocument();
  });

  it('handles class selection correctly', async () => {
    render(<PassengerClassSelector {...defaultProps} />);
    
    // Open class dropdown
    const classButton = screen.getByText('First Class');
    await userEvent.click(classButton);
    
    // Select a different class
    const classOption = screen.getByText('Second Class');
    await userEvent.click(classOption);
    
    expect(defaultProps.onClassSelect).toHaveBeenCalledWith('2');
  });

  it('handles passenger count changes correctly', async () => {
    render(<PassengerClassSelector {...defaultProps} />);
    
    // Increase adults count
    const increaseAdultsButton = screen.getByRole('button', { name: /increase adults/i });
    await userEvent.click(increaseAdultsButton);
    
    expect(defaultProps.onPassengerCountChange).toHaveBeenCalledWith({
      adultCount: 2,
      childCount: 0,
      infantCount: 0
    });
  });

  it('disables buttons during loading', () => {
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        classType: 'FIRST_CLASS',
        passengers: {
          adultCount: 1,
          childCount: 0,
          infantCount: 0
        }
      },
      setFilters: jest.fn(),
      isLoading: true,
      error: null,
    }));

    render(<PassengerClassSelector {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to update class';
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        classType: 'FIRST_CLASS',
        passengers: {
          adultCount: 1,
          childCount: 0,
          infantCount: 0
        }
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: errorMessage,
    }));

    render(<PassengerClassSelector {...defaultProps} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('enforces minimum adult count', async () => {
    render(<PassengerClassSelector {...defaultProps} />);
    
    // Try to decrease adults below 1
    const decreaseAdultsButton = screen.getByRole('button', { name: /decrease adults/i });
    await userEvent.click(decreaseAdultsButton);
    
    expect(defaultProps.onPassengerCountChange).not.toHaveBeenCalled();
  });

  it('enforces maximum passengers per booking', async () => {
    const propsWithMaxPassengers = {
      ...defaultProps,
      passengerCounts: {
        classType: 'FIRST_CLASS',
        adultCount: 6,
        childCount: 0,
        infantCount: 0
      }
    };

    render(<PassengerClassSelector {...propsWithMaxPassengers} />);
    
    // Try to increase any passenger count
    const increaseAdultsButton = screen.getByRole('button', { name: /increase adults/i });
    await userEvent.click(increaseAdultsButton);
    
    expect(defaultProps.onPassengerCountChange).not.toHaveBeenCalled();
  });

  it('enforces maximum infants per adult', async () => {
    const propsWithMaxInfants = {
      ...defaultProps,
      passengerCounts: {
        classType: 'FIRST_CLASS',
        adultCount: 1,
        childCount: 0,
        infantCount: 1
      }
    };

    render(<PassengerClassSelector {...propsWithMaxInfants} />);
    
    // Try to increase infants
    const increaseInfantsButton = screen.getByRole('button', { name: /increase infants/i });
    await userEvent.click(increaseInfantsButton);
    
    expect(defaultProps.onPassengerCountChange).not.toHaveBeenCalled();
  });
}); 