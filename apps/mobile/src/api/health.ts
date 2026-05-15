import { useQuery } from "@tanstack/react-query";
import Constants from 'expo-constants';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if(!localhost){
        return 'https://paper-bauble-api.fly.dev';
    }
    return `http://${localhost}:8080`;
};

export const useHealthCheck = () => {
    return useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/health`);
            if (!response.ok){
                throw new Error('Network response was not ok'); 
            }
            return response.json();
        }
    });
};