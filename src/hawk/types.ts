export interface GPSID {
  item: GPS;
}

export interface GPS {
  name: string;
  dt_server: string;
  dt_tracker: string;
  lat: string;
  lng: string;
  altitude: string;
  angle: string;
  speed: string;
  params: Params;
  loc_valid: string;
  odometer: string;
  engine_hours: string;
  last_img_file: string;
}

export interface Params {
  acc: string;
  arm: string;
  pwrcut: string;
  shock: string;
}

export interface HawkParams {
  [key: string]: string;
}

export interface HawkUserObject {
  group_name: string | null;
  imei: string;
  protocol: string;
  net_protocol: string;
  ip: string;
  port: string;
  active: string;
  expire: string;
  expire_dt: string;
  dt_server: string;
  dt_tracker: string;
  lat: string;
  lng: string;
  altitude: string;
  angle: string;
  speed: string;
  params: HawkParams;
  loc_valid: string;
  dt_last_stop: string;
  dt_last_idle: string;
  dt_last_move: string;
  name: string;
  device: string;
  sim_number: string;
  model: string;
  vin: string;
  plate_number: string;
  odometer: string;
  engine_hours: string;
  custom_fields: any[];
}
