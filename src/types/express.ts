export type ExpressStatus = 'pending' | 'in_transit' | 'delivering' | 'delivered' | 'exception';

export type VIPLevel = 'normal' | 'vip_government' | 'vip_enterprise' | 'vip_confidential' | 'vip_fresh';

export interface LogisticsNode {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  status: ExpressStatus;
  operator?: string;
  phone?: string;
  vehicleNo?: string;
  facilityType?: 'hub' | 'airport' | 'branch' | 'courier' | 'locker' | 'recipient';
}

export interface CourierInfo {
  name: string;
  phone: string;
  workId: string;
  rating: number;
  avatar: string;
  currentLocation: string;
  vehicleType: string;
}

export interface ElectronicPOD {
  signeeName: string;
  signeePhoneMasked: string;
  signTime: string;
  signType: '本人签收' | '前台代签' | '家人代收' | '智能快递柜签收' | '单位收发室';
  signatureImageUrl?: string;
  receiptNumber: string;
  courierWorkId: string;
  courierName: string;
  sealText: string;
}

export interface ReminderConfig {
  enableSMS: boolean;
  smsPhone: string;
  enableWeChat: boolean;
  wechatId: string;
  enableBrowserPush: boolean;
  enableVoiceCall: boolean;
  events: {
    outForDelivery: boolean;
    approaching: boolean;
    delivered: boolean;
    exception: boolean;
    lockerDeposit: boolean;
  };
  doNotDisturb: boolean;
  dndStart: string;
  dndEnd: string;
}

export interface NotificationLog {
  id: string;
  packageId: string;
  trackingNumber: string;
  title: string;
  message: string;
  time: string;
  channel: 'SMS' | 'WECHAT' | 'BROWSER' | 'VOICE';
  status: 'sent' | 'delivered' | 'read';
  eventType: 'outForDelivery' | 'approaching' | 'delivered' | 'exception' | 'lockerDeposit';
}

export interface ExpressPackage {
  id: string;
  trackingNumber: string;
  vipLevel: VIPLevel;
  vipLabel: string;
  serviceType: '特快专递(EMS)' | '极速鲜冷链' | '重点政务公文' | '高价值保价速递' | '考录录取通知书';
  itemName: string;
  itemWeight: string;
  declaredValue?: number;
  status: ExpressStatus;
  statusText: string;
  origin: {
    city: string;
    sender: string;
    phoneMasked: string;
    address: string;
  };
  destination: {
    city: string;
    recipient: string;
    phoneMasked: string;
    phoneFull: string;
    address: string;
  };
  sendTime: string;
  estimatedDeliveryTime: string;
  isUrgent: boolean;
  temperature?: string;
  humidity?: string;
  nodes: LogisticsNode[];
  courier?: CourierInfo;
  pod?: ElectronicPOD;
  reminderConfig: ReminderConfig;
}

export interface UserInfo {
  empId: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatarUrl?: string;
  lastLoginTime?: string;
  token?: string;
  tokenExpiresAt?: number | string;
  tokenType?: string;
  serviceAccountId?: string;
  companyName?: string;
  tenants?: any[];
}


