
import { Address } from "../models/address.model.js";

export const geocodeAddress = async (addressId) => {
 const farmerAddress = await Address.findOne({
  user: req.user._id,
  isDefault: true,
});

  if (!farmerAddress) {
    throw new Error("Address not found");
  }

  // Coordinates pehle se hain toh dobara API call nahi karni
  if (
    Number.isFinite(address.latitude) &&
    Number.isFinite(address.longitude)
  ) {
    return {
      latitude: address.latitude,
      longitude: address.longitude,
    };
  }

  const query = [
    address.villagename,
    address.near,
    address.distric,
    address.city,
    address.state,
    address.pincode,
    "India",
  ]
    .filter(Boolean)
    .join(", ");

  const url = new URL(
    "https://nominatim.openstreetmap.org/search"
  );

  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SmartMandiHackathon/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Geocoding service unavailable");
  }

  const results = await response.json();

  if (!results.length) {
    throw new Error("Address coordinates not found");
  }

  const latitude = Number(results[0].lat);
  const longitude = Number(results[0].lon);

  address.latitude = latitude;
  address.longitude = longitude;

  await address.save();

  return { latitude, longitude };
};
