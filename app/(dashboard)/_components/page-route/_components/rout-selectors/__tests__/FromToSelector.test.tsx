import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FromToSelector from '../FromToSelector';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import type { Station } from '@/types/shared/trains';

// Mock the store
jest.mock('@/store/trainSearchStore', () => ({
  useTrainSearchStore: jest.fn(),
}));

describe('FromToSelector', () => {
  const mockStations: Station[] = [
    {
      _id: '1',
      stationName: 'Station A',
      stationCode: 'STA',
      city: 'City A',
      state: 'State A',
      region: 'Region A',
      address: 'Address A',
      facilities: [],
      platforms: 4,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '2',
      stationName: 'Station B',
      stationCode: 'STB',
      city: 'City B',
      state: 'State B',
      region: 'Region B',
      address: 'Address B',
      facilities: [],
      platforms: 4,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const defaultProps = {
    stations: mockStations,
    selectedFrom: '1',
    selectedTo: '2',
    onFromChange: jest.fn(),
    onToChange: jest.fn(),
    date: '2024-01-01',
    classType: 'FIRST_CLASS'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock store implementation
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        fromStation: mockStations[0],
        toStation: mockStations[1],
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: null,
    }));
  });

  it('renders correctly with initial props', () => {
    render(<FromToSelector {...defaultProps} />);
    
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Station A')).toBeInTheDocument();
    expect(screen.getByText('Station B')).toBeInTheDocument();
  });

  it('handles station selection correctly', async () => {
    render(<FromToSelector {...defaultProps} />);
    
    // Open from station dropdown
    const fromButton = screen.getByText('Station A');
    await userEvent.click(fromButton);
    
    // Select a different station
    const stationOption = screen.getByText('Station B');
    await userEvent.click(stationOption);
    
    expect(defaultProps.onFromChange).toHaveBeenCalledWith('2');
  });

  it('disables buttons during loading', () => {
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        fromStation: mockStations[0],
        toStation: mockStations[1],
      },
      setFilters: jest.fn(),
      isLoading: true,
      error: null,
    }));

    render(<FromToSelector {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to load stations';
    (useTrainSearchStore as unknown as jest.Mock).mockImplementation(() => ({
      filters: {
        fromStation: mockStations[0],
        toStation: mockStations[1],
      },
      setFilters: jest.fn(),
      isLoading: false,
      error: errorMessage,
    }));

    render(<FromToSelector {...defaultProps} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('prevents selecting same station for from and to', async () => {
    render(<FromToSelector {...defaultProps} />);
    
    // Open from station dropdown
    const fromButton = screen.getByText('Station A');
    await userEvent.click(fromButton);
    
    // Try to select the same station as 'to'
    const stationOption = screen.getByText('Station B');
    await userEvent.click(stationOption);
    
    expect(defaultProps.onFromChange).not.toHaveBeenCalled();
  });

  it('handles swap stations correctly', async () => {
    render(<FromToSelector {...defaultProps} />);
    
    const swapButton = screen.getByRole('button', { name: /swap/i });
    await userEvent.click(swapButton);
    
    expect(defaultProps.onFromChange).toHaveBeenCalledWith('2');
    expect(defaultProps.onToChange).toHaveBeenCalledWith('1');
  });
}); 