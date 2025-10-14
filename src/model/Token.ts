import { Schema, model, InferSchemaType } from 'mongoose';

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

export type Token = InferSchemaType<typeof tokenSchema>;
const TokenModel = model<Token>('Token', tokenSchema);
export default TokenModel;
