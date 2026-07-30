import { config } from "../config/env";

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
    });

    const response = await fetch(
      `${config.nominatimBaseUrl}/search?${params.toString()}`,
      { headers: { "User-Agent": "track-connect/1.0" } }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}
