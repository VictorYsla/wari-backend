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
