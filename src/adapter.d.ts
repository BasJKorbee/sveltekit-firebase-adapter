import { Builder } from '@sveltejs/kit';
import { HttpsOptions } from 'firebase-functions/lib/v2/providers/https';
export declare type AdapterOptions = {
    outDir?: string;
    functionName?: string;
    version?: 'v1' | 'v2';
    nodeVersion?: '14' | '16' | '18';
    functionOptions?: HttpsOptions;
};
export default function (options?: AdapterOptions): {
    name: string;
    adapt: (builder: Builder) => Promise<void>;
};
