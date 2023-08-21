/// <reference types="node" />
import './shims';
import { SSRManifest } from '@sveltejs/kit';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { IncomingHttpHeaders, OutgoingHttpHeader, OutgoingHttpHeaders } from 'http';
declare module 'express' {
    interface Request {
        method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        headers: IncomingHttpHeaders;
        url: string;
        body: unknown;
        statusCode: number;
    }
    interface Response {
        statusCode: number;
        end: (chunk?: unknown, cb?: () => void) => void;
        writeHead: (statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | string) => this;
    }
}
export declare function init(manifest: SSRManifest): (request: ExpressRequest, response: ExpressResponse) => void | Promise<void>;
