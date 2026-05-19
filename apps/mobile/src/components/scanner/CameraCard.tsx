import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

// Define styles using StyleSheet.create for better reliability and explicit control
const cameraOverlayStyles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject, // Covers the entire parent
        zIndex: 10, // Ensures it's above the camera view
        elevation: 10, // For Android layering
        justifyContent: 'space-between', // Distributes content vertically
        alignItems: 'center',
        // We don't need a background color here as the camera is the background
    },
    alignmentFrameContainer: {
        flex: 1, // Takes up available vertical space
        justifyContent: 'center', // Centers content vertically within this container
        alignItems: 'center', // Centers content horizontally within this container
    },
    alignmentFrame: {
        width: 288, // w-72 (72 * 4 = 288)
        height: 384, // h-96 (96 * 4 = 384)
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#fbbf24', // yellow-400
        borderRadius: 12, // rounded-xl
        backgroundColor: 'rgba(0,0,0,0.2)', // black/20
    },
    promptText: {
        color: '#ffffff', // text-white
        fontWeight: 'bold', // font-bold
        marginTop: 16, // mt-4 (4 * 4 = 16)
        textAlign: 'center',
        paddingHorizontal: 40, // px-10 (10 * 4 = 40)
    },
    captureButtonContainer: {
        position: 'absolute', // Absolute position to ensure it's at the bottom
        bottom: 60, // Adjust as needed to clear the tab bar
        width: '100%',
        alignItems: 'center',
    },
    captureButtonOuter: {
        width: 80, // w-20 (20 * 4 = 80)
        height: 80, // h-20
        backgroundColor: '#ffffff', // bg-white
        borderRadius: 40, // rounded-full (half of width/height)
        borderWidth: 4,
        borderColor: '#cbd5e1', // slate-300
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 56, // w-14 (14 * 4 = 56)
        height: 56, // h-14
        backgroundColor: '#ffffff', // bg-white
        borderRadius: 28, // rounded-full
        borderColor: '#94a3b8', // slate-400
    },
});

export default function CameraCard({ onPictureTaken }: { onPictureTaken: (uri: string) => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    
    if (!permission){
        return <View className="flex-1 bg-slate-900"/>;
    }

    if(!permission.granted){
        return(
            <View className="flex-1 justify-center items-center bg-slate-50 p-6">
                <Text className="text-center text-slate-700 mb-4 font-medium">
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant Camera Permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const options = { quality: 0.8, skipProcessing: false};
                const photo = await cameraRef.current.takePictureAsync(options);
                if(photo?.uri){
                    onPictureTaken(photo.uri);
                }
                
            } catch (e) {
                console.error("Error taking picture: ", e);
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />
            
            {/* UI Overlay Container */}
            <View style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10 }]} pointerEvents="box-none">
                {/* Alignment Frame and Prompt */}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
                    <View className="w-72 h-96 border-2 border-dashed border-yellow-400 rounded-xl bg-black/20" />
                    <Text className="text-yellow font-bold mt-4 text-center px-10">
                        Please align your deck within the frame
                    </Text>
                </View>

                {/* Capture Button - Absolutely positioned to stay above the tab bar */}
                <View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }} pointerEvents="box-none">
                    <TouchableOpacity 
                        onPress={takePicture}
                        className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 justify-center items-center active:bg-slate-200">
                        <View className="w-14 h-14 bg-white rounded-full border-slate-400" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

};
