import mongoose from "mongoose";
const { connection } = mongoose;
import Trip from "../models/Trip.js";
import { notifyUser } from "../sockets/trip.handlers.js";
import socketInstance from "../sockets/socketInstance.js";
import User from "../models/User.js";


export const findNearbyDrivers = async (coordinates, excludedDrivers = [], maxDistance = 5000) => {
  console.log('Buscando conductores cercanos...', coordinates, excludedDrivers, maxDistance);
  return await User.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates },
        distanceField: 'distance',
        spherical: true,
        maxDistance,
        query: {
          role: 'driver',
          _id: { $nin: excludedDrivers },
          // isOnline: true,
          driverStatus: 'available'
        }
      }
    },
    { $limit: 5 },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicleInfo'
      }
    },
    {
      $addFields: {
        hasVehicle: { $gt: [{ $size: "$vehicleInfo" }, 0] }
      }
    },
    { $unwind: { path: '$vehicleInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        username: 1,
        email: 1,
        phone: 1,
        rating: 1,
        distance: 1,
        'location.coordinates': 1,
        'vehicleInfo.model': 1,
        'vehicleInfo.license': 1,
        'vehicleInfo.type': 1,
        'vehicleInfo.passengerCapacity': 1
      }
    }
  ]);
};

export const createTripRequest = async (userId, driverId, tripData) => {
  try {

    const [trip] = await Trip.create([{
      user: userId,
      driver: driverId,
      pickup: tripData.starLocation,
      destination: tripData.endLocation,
      price: tripData.price,
      status: 'pending',
      requestedAt: new Date()
    }]);

    return trip;
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Failed to create trip: ' + error.message);
  }
};

export const rejectPendingTrip = async (io, tripId, driverId, by, reason) => {
  try {
    const updatedTrip = await Trip.findOneAndUpdate(
      {
        _id: tripId,
        status: 'pending'
      },
      {
        status: 'rejected',
        rejectedDrivers: [driverId],
        reassignmentAttempts: +1,
        cancellationDetails: {
          cancelledBy: by,
          reason: reason,
          timestamp: new Date()
        },
        driver: null,
        timeout: true
      },
      {
        new: true,
        maxTimeMS: 5000 // Timeout para la operación
      }
    );

    if (!updatedTrip) {
      console.warn(`Viaje ${tripId} no estaba pendiente o ya no existe`);
      return null;
    }

    // Notificar al usuario
    notifyUser(io, updatedTrip.user, {
      tripId: updatedTrip._id,
      driver: null,
      type: 'trip_status',
      status: 'rejected',
      reason: reason,
      timeoutId: updatedTrip.timeoutId,
    });

    return updatedTrip;
  } catch (error) {
    console.error(`Error al rechazar viaje ${tripId}:`, error);
    throw error; // O manejar según tu lógica
  }
}