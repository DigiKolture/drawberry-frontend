export interface ToastDataType {
  action: string;
  actionName: string;
  body: any;
}

export interface ToastState {
  visible: boolean;
  message: string;
  type: string;
  data: ToastDataType;
}
