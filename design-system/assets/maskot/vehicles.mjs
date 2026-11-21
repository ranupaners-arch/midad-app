// Midad — kendaraan hijrah sebagai ES module. vehicles.js tetap sumber gambarnya.
import { validateMascotConfig } from './mascot.mjs';
import './vehicles.js';

/** @type {import('./vehicles.mjs').MidadVehiclesApi} */
export const MidadVehicles = globalThis.MidadVehicles;

/** @param {string} id */
export const isVehicleId = (id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(MidadVehicles.V, id);

/**
 * Maskot pengguna menaiki kendaraan. Id yang tidak dikenal jatuh ke 'baghlah'.
 * @param {import('./vehicles.mjs').VehicleId} id
 * @param {unknown} cfg
 * @param {Record<string, unknown>} [opts]
 */
export function rideVehicle(id, cfg, opts) {
  return MidadVehicles.ride(isVehicleId(id) ? id : 'baghlah', validateMascotConfig(cfg), opts);
}
