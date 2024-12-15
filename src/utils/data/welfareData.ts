import { WelfareProgram, WelfareProgramsData } from "@/types/welfare";
import welfareData from '@/../private/data/welfare.json';

// Cache for better performance
const cache = new Map<string, any>();

class WelfareError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'WelfareError';
    }
}

// Error codes specific to welfare data
const WelfareErrorCodes = {
    INVALID_DATA: 'INVALID_DATA',
    INVALID_COORDINATES: 'INVALID_COORDINATES',
    NO_DATA: 'NO_DATA',
} as const;

// Utility type for welfare data returns
type WelfareReturn = {
    programs: WelfareProgramsData;
}

function validateWelfareProgram(program: any): WelfareProgram | null {
    if (!program || typeof program !== 'object') {
        return null;
    }

    // Clean up data by removing HTML tags and extra commas
    const cleanString = (str: string) => {
        return str?.replace(/<br>/g, '').replace(/,$/g, '').trim() || '';
    };

    // Clean up coordinates by keeping only the first dot
    const cleanCoordinate = (coord: string): string => {
        if (!coord) return '';
        const parts = coord.split('.');
        if (parts.length <= 2) return coord;
        return parts[0] + '.' + parts.slice(1).join('');
    };

    // Clean and validate coordinates
    const cleanLat = cleanCoordinate(program.latitude);
    const cleanLng = cleanCoordinate(program.longitude);
    const lat = parseFloat(cleanLat);
    const lng = parseFloat(cleanLng);

    // Return null for invalid coordinates instead of throwing error
    if (!isValidCoordinates(lat, lng)) {
        return null;
    }

    return {
        nama: program.nama || '',
        latitude: cleanLat,
        longitude: cleanLng,
        kelurahan: program.kelurahan || '',
        kecamatan: program.kecamatan || '',
        status_lahan: program.status_lahan || '',
        status_bangunan: program.status_bangunan || '',
        luas_bangunan: program.luas_bangunan || '',
        jenis_lantai: program.jenis_lantai || '',
        jenis_dinding: program.jenis_dinding || '',
        kondisi_dinding: program.kondisi_dinding || '',
        jenis_atap: program.jenis_atap || '',
        kondisi_atap: program.kondisi_atap || '',
        kamar: program.kamar || '',
        sumber_air: cleanString(program.sumber_air),
        memperoleh_air: cleanString(program.memperoleh_air),
        sumber_penerangan: program.sumber_penerangan || '',
        daya_terpasang: cleanString(program.daya_terpasang),
        bahan_bakar: cleanString(program.bahan_bakar),
        fasilitas_bab: program.fasilitas_bab || '',
        jenis_kloset: program.jenis_kloset || '',
        tpa_kloset: program.tpa_kloset || '',
        smartphone: program.smartphone || '',
        televisi: program.televisi || '',
        komputer: program.komputer || '',
        internet: program.internet || ''
    };
}

// Helper function to validate coordinates without throwing errors
function isValidCoordinates(lat: number, lng: number): boolean {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        return false;
    }
    if (lat < -90 || lat > 90) {
        return false;
    }
    if (lng < -180 || lng > 180) {
        return false;
    }
    return true;
}

export function getWelfareData(type: keyof WelfareReturn): WelfareReturn[keyof WelfareReturn] {
    const cacheKey = `welfare_${type}`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        switch (type) {
            case 'programs':
                if (!welfareData?.programs?.length) {
                    return { programs: [] };
                }
                const validPrograms = welfareData.programs
                    .map(program => validateWelfareProgram(program))
                    .filter((program): program is WelfareProgram => program !== null);

                const result = { programs: validPrograms };
                cache.set(cacheKey, result);
                return result;
            default:
                return { programs: [] };
        }
    } catch (error) {
        console.error('Error getting welfare data:', error);
        return { programs: [] };
    }
}

export function getNearbyWelfareData(latitude: number, longitude: number, radius: number = 500): WelfareProgramsData {
    try {
        validateCoordinates(latitude, longitude);
        validateRadius(radius);

        const data = getWelfareData('programs');
        if (!data) throw new WelfareError('No welfare data available', WelfareErrorCodes.NO_DATA);

        const getDistance = (lat2: number, lng2: number): number => {
            const R = 6371; // Earth's radius in km
            const lat1 = latitude * Math.PI / 180;
            const lat2Rad = lat2 * Math.PI / 180;
            const dLat = lat2Rad - lat1;
            const dLon = (lng2 - longitude) * Math.PI / 180;

            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2Rad) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

            return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        };

        const isPointInRadius = (lat: number, lng: number): boolean => {
            return getDistance(lat, lng) <= radius;
        };

        const filterByDistance = (item: WelfareProgram): boolean => {
            try {
                if (!item.latitude || !item.longitude) return false;
                return isPointInRadius(Number(item.latitude), Number(item.longitude));
            } catch {
                return false;
            }
        };

        return {
            programs: data.programs.filter(filterByDistance)
        };
    } catch (error) {
        console.error('Error getting nearby welfare data:', error);
        throw error instanceof WelfareError ? error : new WelfareError('Failed to get nearby welfare data', WelfareErrorCodes.INVALID_DATA);
    }
}

// Validation functions
function validateCoordinates(lat: number, lng: number): void {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        throw new WelfareError('Invalid coordinates: Values must be numbers', WelfareErrorCodes.INVALID_COORDINATES);
    }
    if (lat < -90 || lat > 90) {
        throw new WelfareError(`Invalid latitude: ${lat}. Must be between -90 and 90`, WelfareErrorCodes.INVALID_COORDINATES);
    }
    if (lng < -180 || lng > 180) {
        throw new WelfareError(`Invalid longitude: ${lng}. Must be between -180 and 180`, WelfareErrorCodes.INVALID_COORDINATES);
    }
}

function validateRadius(radius: number): void {
    if (radius <= 0 || isNaN(radius)) {
        throw new WelfareError('Radius must be positive', WelfareErrorCodes.INVALID_DATA);
    }
}
