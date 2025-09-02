import { ViewStyle, TextStyle } from 'react-native';

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  type?: "text" | "password" | "email" | "number";
  icon?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  error?: string;
}
  
  export interface SocialButtonProps {
    localImage?: any;  
    imageUrl?: string;
    onPress: () => void;
    disabled?: boolean;  
  }
  
  export interface ActionButtonProps {
    label: string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    variant?: 'primary' | 'outline'; // אופציונלי
  }