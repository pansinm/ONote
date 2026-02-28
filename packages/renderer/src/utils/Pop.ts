export interface ShowToastParam {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  duration?: number;
}

type ToastCallback = (param: ShowToastParam) => void;

class Pop {
  private static toastCallback: ToastCallback | null = null;
  private static defaultDuration = 3000;
  private static defaultType: 'error' | 'success' | 'info' | 'warning' = 'info';

  static setToast(callback: ToastCallback | null) {
    this.toastCallback = callback;
  }

  static showToast(param: ShowToastParam) {
    if (!this.toastCallback) {
      console.warn('Pop.setToast not called, toast will not be displayed');
      return;
    }

    this.toastCallback({
      message: param.message,
      type: param.type ?? this.defaultType,
      duration: param.duration ?? this.defaultDuration,
    });
  }

  static setDefaultDuration(duration: number) {
    this.defaultDuration = duration;
  }

  static setDefaultType(type: 'error' | 'success' | 'info' | 'warning') {
    this.defaultType = type;
  }
}

export default Pop;
