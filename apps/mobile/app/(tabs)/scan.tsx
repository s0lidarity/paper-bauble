import { useState } from 'react';
import { View, Image, Button } from 'react-native';
import CameraCard from '../../src/components/scanner/CameraCard';

export default function ScanScreen(){
    const [imageUri, setImageUri] = useState<string | null>(null);
    if (imageUri) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <Image source={{ uri: imageUri }} style={{ width: 288, height: 384, borderRadius: 12, marginBottom: 24 }} />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Button title="Retake" onPress={() => setImageUri(null)} />
                    <Button title="Upload & Scan" onPress={() => 
                        console.log("sending to backend", imageUri)
                    } />
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