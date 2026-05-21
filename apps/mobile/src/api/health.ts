import { useQuery } from "@tanstack/react-query";
import Constants from 'expo-constants';

export interface HealthResponse {
    status: string;
    db: string;
    env?: string;
}

const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if(!localhost){
        return 'https://paper-bauble-api.onrender.com';
    }
    return `http://${localhost}:8080`;
};

export const useHealthCheck = () => {
    return useQuery<HealthResponse>({
        queryKey: ['health'],
        queryFn: async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/health`);
            if (!response.ok){
                throw new Error('Network response was not ok'); 
            }
            return (await response.json()) as HealthResponse;
        }
    });
};