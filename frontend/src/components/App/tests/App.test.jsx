// import React from "react";
// import { render, screen } from "@testing-library/react";
// import App from "../App";

// // ⬇ Mock Outlet from react-router-dom
// jest.mock("react-router-dom", () => ({
//     Outlet: () => <div data-testid="outlet" />,
// }));

// // ⬇ Mock Zustand stores (modal + app store)
// jest.mock("../../../store/modalStore", () => ({
//     useModalStore: () => ({
//         networkModalOpen: false,
//         setNetworkModalOpen: jest.fn(),
//     }),
// }));

// jest.mock("../../../store/useAppStore", () => () => ({
//     setNftContract: jest.fn(),
//     setMarketplaceContract: jest.fn(),
//     setChainConfig: jest.fn(),
//     chainConfig: null,
// }));

// // ⬇ Mock useWallet hook
// jest.mock("../../../hooks/useWallet", () => () => ({
//     chainId: null,
//     isConnected: false,
//     activeChain: null,
// }));

// describe("App Component", () => {
//     test("renders without crashing", () => {
//         render(<App />);

//         // Header exists
//         expect(screen.getByRole("banner")).toBeInTheDocument();

//         // Footer exists
//         expect(screen.getByRole("contentinfo")).toBeInTheDocument();

//         // Outlet exists
//         expect(screen.getByTestId("outlet")).toBeInTheDocument();
//     });

//     test("does NOT show NetworkModal when networkModalOpen=false", () => {
//         render(<App />);

//         expect(screen.queryByText(/network/i)).not.toBeInTheDocument();
//     });
// });


import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '../App';

// --- Mocks ---
// Mock the child components to keep the test focused on App's logic and structure
jest.mock('../../Header/Header', () => () => <div data-testid="mock-header" />);
jest.mock('../../Footer/Footer', () => () => <div data-testid="mock-footer" />);
jest.mock('../../Modal/Modal', () => () => <div data-testid="mock-global-modal" />);
jest.mock('../../NetworkModal/NetworkModal', () => () => <div data-testid="mock-network-modal" />);

// Mock the utility function
jest.mock('../../../utils/networkUtils', () => ({
    getSupportedNetworkList: jest.fn(() => [{ id: 1, name: 'MockNet' }]),
}));

// Mock the zustand stores/hooks
const mockSetNetworkModalOpen = jest.fn();
jest.mock('../../../store/modalStore', () => ({
    useModalStore: jest.fn(() => ({
        networkModalOpen: false, // Default to closed for initial render test
        setNetworkModalOpen: mockSetNetworkModalOpen,
    })),
}));

const mockSetNftContract = jest.fn();
const mockSetMarketplaceContract = jest.fn();
const mockSetChainConfig = jest.fn();
jest.mock('../../../store/useAppStore', () => jest.fn(() => ({
    setNftContract: mockSetNftContract,
    setMarketplaceContract: mockSetMarketplaceContract,
    setChainConfig: mockSetChainConfig,
    chainConfig: null,
})));

// Mock the wallet hook
const mockUseWallet = jest.fn(() => ({
    chainId: null,
    isConnected: false,
    activeChain: null,
}));
jest.mock('../../../hooks/useWallet', () => mockUseWallet);

// Mock viem's getContract (necessary to prevent crash during effect execution)
jest.mock('viem', () => ({
    getContract: jest.fn(() => ({})),
}));

// --- Test Suite ---
describe('App Component', () => {
    // Helper function to render the component wrapped in Router
    const renderComponent = () => render(
        <Router>
            <App />
        </Router>
    );

    it('renders the core layout components correctly', () => {
        renderComponent();

        // Check if the Header, Footer, and Modals are rendered
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
        expect(screen.getByTestId('mock-global-modal')).toBeInTheDocument();

        // Check if the main content area has the correct CSS class for styling/structure
        const mainElement = screen.getByRole('main');
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toHaveClass('min-h-[calc(100vh-164px)]');
    });

    it('does not display the NetworkModal by default if networkModalOpen is false', () => {
        renderComponent();
        expect(screen.queryByTestId('mock-network-modal')).not.toBeInTheDocument();
    });

    it('displays the NetworkModal when networkModalOpen is true in the store', () => {
        // Override the mock implementation for this specific test case
        require('../../store/modalStore').useModalStore.mockImplementation(() => ({
            networkModalOpen: true,
            setNetworkModalOpen: mockSetNetworkModalOpen,
        }));

        renderComponent();
        expect(screen.getByTestId('mock-network-modal')).toBeInTheDocument();
    });

    /* 
     * NOTE: Testing the useEffect hooks that rely on useWallet and useAppStore 
     * requires more complex setup using `act` and potentially an actual state management 
     * library implementation rather than simple function mocks, as React batches updates
     * that trigger subsequent effects.
     * 
     * The tests above verify the structure and conditional rendering based on store state.
     */
});
