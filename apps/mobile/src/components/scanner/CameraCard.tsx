import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

// Explicit StyleSheet to bypass NativeWind issues in experimental RN 0.81
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
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        padding: 24,
    },
    permissionText: {
        textAlign: 'center',
        color: '#334155', // slate-700
        marginBottom: 16,
        fontWeight: '500',
    }
});

export default function CameraCard({ onPictureTaken }: { onPictureTaken: (uri: string) => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    
    if (!permission){
        return <View style={{ flex: 1, backgroundColor: '#0f172a' }} />;
    }

    if(!permission.granted){
        return(
            <View style={cameraOverlayStyles.permissionContainer}>
                <Text style={cameraOverlayStyles.permissionText}>
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
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />
            <View style={cameraOverlayStyles.overlayContainer} pointerEvents="box-none">
                <View style={cameraOverlayStyles.alignmentFrameContainer} pointerEvents="none">
                    <View style={cameraOverlayStyles.alignmentFrame} />
                    <Text style={cameraOverlayStyles.promptText}>Please align your deck within the frame</Text>
                </View>
                <View style={cameraOverlayStyles.captureButtonContainer} pointerEvents="box-none">
                    <TouchableOpacity onPress={takePicture} style={cameraOverlayStyles.captureButtonOuter}>
                        <View style={cameraOverlayStyles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
