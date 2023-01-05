declare function salleLibres(salles: string[], callback: Function, date?: number, results?: {}, db?: any): any;
declare function salleEvents(salles: string[], callback: Function, date?: number, results?: {}, db?: any): any;
declare function convert_unix_to_local(unix: number, local?: string): string;
export default class {
    salles: any;
    database: any;
    loaded: Promise<unknown>[];
    salleEvents: typeof salleEvents;
    salleLibres: typeof salleLibres;
    convert_unix_to_local: typeof convert_unix_to_local;
    constructor(salles: any, database_file: string);
}
export {};
