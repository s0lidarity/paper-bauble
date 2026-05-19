import { useState } from 'react';
import { View, Image, Text, Button} from 'react-native';
import CameraCard from '../../src/components/scanner/CameraCard';

export default function ScanScreen(){
    const [imageUri, setImageUri] = useState<string | null>(null);
    if (imageUri) {
        return (
            <View className="flex-1 bg-slate-900 justify-center items-center p-4">
                <Image source= {{ uri: imageUri}} className="w-72 h-96 rounded-xl mb-6"/>
                <View className="flex-row space-x-4">
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