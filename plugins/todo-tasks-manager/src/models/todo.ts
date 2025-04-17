import mongoose, { Document, Schema, Connection, Model } from 'mongoose';

// Define the Todo interface
export interface ITodo extends Document<string> {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Todo schema
const todoSchema = new Schema<ITodo>({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
todoSchema.pre('save', function(next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

// Create a model factory function that takes a connection
export function createTodoModel(connection: Connection): Model<ITodo> {
  return connection.model<ITodo>('Todo', todoSchema);
} 