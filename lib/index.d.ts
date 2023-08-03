export declare function salleLibres(salle: string, date: number): Promise<{
    state: string;
    until: any;
}>;
export declare function salleEvents(salle: string, date: number): Promise<any[]>;
export declare function convert_unix_to_local(unix: number): Date;
export declare function getSalles(): Promise<any>;
