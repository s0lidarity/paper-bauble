import { View, ViewProps } from 'react-native';
import { cn } from '../utils/cn';

export const Card =({ children, className, ...props}: ViewProps) => (
    <View className={cn("bg-white p-6 rounded-2xl shadow-sm border border-slate-200", className)} {...props}>
        {children}
    </View>
);