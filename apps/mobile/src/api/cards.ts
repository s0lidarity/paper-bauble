import config from '../config';

export const uploadCard = async (uri: string) => {
    const formData = new FormData();
    
    // In React Native, FormData.append expects an object for file uploads
    formData.append('image', {
        uri,
        name: 'card-scan.jpg',
        type: 'image/jpeg',
    } as any);

    const response = await fetch(`${config.API_URL}/scan`, {
        method: 'POST',
        body: formData,
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
};