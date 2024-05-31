import {model, Schema} from "mongoose";

export const DOCUMENT_NAME = 'AnsibleTaskStatus';
export const COLLECTION_NAME = 'ansibletaskstatuses';

export default interface AnsibleTaskStatus {
    ident: string;
    status?: string;
    createdAt?: Date;
}

const schema = new Schema<AnsibleTaskStatus>(
    {
        ident: {
            type: Schema.Types.String,
            required: true,
        },
        status: {
            type: Schema.Types.String,
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true
    },
);

export const AnsibleTaskStatusModel = model<AnsibleTaskStatus>(DOCUMENT_NAME, schema, COLLECTION_NAME);
