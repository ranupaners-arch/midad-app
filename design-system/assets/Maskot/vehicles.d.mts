import type { MascotConfig } from './mascot.mjs';
export type VehicleId = 'pinisi' | 'jong' | 'barge' | 'caravel' | 'baghlah' | 'boom' | 'sambuk' | 'qafilah' | 'felucca' | 'xebec';
export interface VehicleDef {
  /** [ar, id, en] */
  name: [string, string, string];
  region: string;
  sea: boolean;
}
export interface MidadVehiclesApi {
  ride(id: VehicleId, cfg: Partial<MascotConfig>, opts?: { cls?: string; attrs?: string }): string;
  V: Record<VehicleId, VehicleDef>;
}
export declare const MidadVehicles: MidadVehiclesApi;
export declare function isVehicleId(id: unknown): id is VehicleId;
export declare function rideVehicle(id: VehicleId, cfg: unknown, opts?: { cls?: string; attrs?: string }): string;
