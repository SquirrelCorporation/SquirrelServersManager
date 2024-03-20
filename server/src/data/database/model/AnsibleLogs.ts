import {model, Schema} from "mongoose";

export const DOCUMENT_NAME = 'AnsibleLog';
export const COLLECTION_NAME = 'ansiblelogs';

export default interface AnsibleLog {
    ident: string;
    content?: string;
    stdout?: string;
    logRunnerId?: string;
    createdAt?: Date;
}

const schema = new Schema<AnsibleLog>(
    {
        ident: {
            type: Schema.Types.String,
            required: true,
        },
        content: {
            type: Schema.Types.String,
            required: false,
        },
        stdout: {
            type: Schema.Types.String,
            required: false,
        },
        logRunnerId: {
            type: Schema.Types.String,
            required: false,
        }
    },
    {
        versionKey: false,
        timestamps: true
    },
);

export const AnsibleLogModel = model<AnsibleLog>(DOCUMENT_NAME, schema, COLLECTION_NAME);
