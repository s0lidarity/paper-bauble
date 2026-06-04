import { useState } from 'react';
import { View, Image, Button, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraCard from '../../src/components/scanner/CameraCard';
import { uploadCard } from '../../src/api/cards';

export default function ScanScreen(){
    const [imageUri, setImageUri] = useState<string | null>(null);
    if (imageUri) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <Image source={{ uri: imageUri }} style={{ width: 288, height: 384, borderRadius: 12, marginBottom: 24 }} />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Button title="Retake" onPress={() => setImageUri(null)} />
                    <Button title="Upload & Scan" onPress={async () => {
                        try {
                            // Compress and resize the image before uploading to ensure it is < 5MB.
                            // 2000px width is a good balance for Tesseract OCR accuracy and file size.
                            const manipulatedImage = await ImageManipulator.manipulate(imageUri)
                                .resize({ width: 2000 })
                                .saveAsync({ compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });

                            const result = await uploadCard(manipulatedImage.uri);
                            console.log("Upload successful:", result);
                            // You can navigate or update state here
                        } catch (error) {
                            Alert.alert("Upload Failed", "There was an error scanning your card.");
                        }
                    }} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <CameraCard onPictureTaken={(uri) => setImageUri(uri)} />
        </View>
    );
}