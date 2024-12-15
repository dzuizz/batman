export interface WelfareProgram {
    nama: string,
    latitude: string,
    longitude: string,
    kelurahan: string,
    kecamatan: string,
    status_lahan: string,
    status_bangunan: string,
    luas_bangunan: string,
    jenis_lantai: string,
    jenis_dinding: string,
    kondisi_dinding: string,
    jenis_atap: string,
    kondisi_atap: string,
    kamar: string,
    sumber_air: string,
    memperoleh_air: string,
    sumber_penerangan: string,
    daya_terpasang: string,
    bahan_bakar: string,
    fasilitas_bab: string,
    jenis_kloset: string,
    tpa_kloset: string,
    smartphone: string,
    televisi: string,
    komputer: string,
    internet: string,
    id: number
}

export interface WelfareProgramsData {
    programs: WelfareProgram[];
}
