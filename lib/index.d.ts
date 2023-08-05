export declare function salleLibres(salle: string, date: number): Promise<{
    error: string;
    state?: undefined;
    until?: undefined;
} | {
    state: string;
    until: any;
    error?: undefined;
}>;
export declare function salleEvents(salle: string, date: number): Promise<any[]>;
export declare function convert_unix_to_local(unix: number): Date;
export declare function getSalles(): Promise<any>;
