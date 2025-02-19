export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  type?: "text" | "password" | "email" | "number";
  icon?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
}
  
  export interface SocialButtonProps {
    imageUrl: string;
    onPress: () => void;
  }
  
  export interface ActionButtonProps {
    label: string;
    onPress: () => void;
  }