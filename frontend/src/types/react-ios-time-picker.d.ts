// declare module 'react-ios-time-picker';
declare module 'react-ios-time-picker' {
    import * as React from 'react';
  
    export interface TimePickerProps {
      value: string;
      onChange: (value: string) => void;
      theme?: string;
      color?: string;
      className?: string; // ← これを追加
    }
  
    const TimePicker: React.FC<TimePickerProps>;
  
    export default TimePicker;
  }
  