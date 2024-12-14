export async function getIndonesianRegion(latitude: number, longitude: number): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id&addressdetails=1`
        );
        const data = await response.json();

        return data.display_name ? data.display_name : 'Unknown Location';
    } catch (error) {
        console.error('Error fetching region name:', error);
        return 'Unknown Location';
    }
}