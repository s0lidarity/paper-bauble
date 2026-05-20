import '@testing-library/jest-native/extend-expect';

// Mocking expo-constants to control the base URL in tests
jest.mock('expo-constants', () => ({
    expoConfig: {
        hostUri: 'localhost:8081',
    },
}));

// Mocking expo-camera since it relies on native hardware
jest.mock('expo-camera', () => ({
    CameraView: 'CameraView',
    useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

// Global fetch mock for API testing
global.fetch = jest.fn();

// Mock useColorScheme to prevent theme-related updates after teardown
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    default: jest.fn(() => 'light'),
}));