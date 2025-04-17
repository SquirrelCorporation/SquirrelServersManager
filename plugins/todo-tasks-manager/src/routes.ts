import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { RouteDefinition, PluginLogger } from './plugin-types';
import { ITodo } from './models/todo';
import mongoose from 'mongoose';

// Function to create routes with the Todo model and logger
export function createRoutes(TodoModel: Model<ITodo>, logger: PluginLogger): RouteDefinition[] {
  // Define the routes for the Todo API
  const routes: RouteDefinition[] = [
    {
      path: '/',
      method: 'get',
      handler: async (req: Request, res: Response) => {
        try {
          logger.info('Fetching all todos');
          const todos = await TodoModel.find().sort({ createdAt: -1 }).exec();
          logger.info(`Found ${todos.length} todos`);
          res.json({
            success: true,
            data: todos
          });
        } catch (error: any) {
          logger.error(`Failed to fetch todos: ${error.message}`);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch todos',
            error: error.message
          });
        }
      },
      description: 'Get all todos'
    },
    {
      path: '/:id',
      method: 'get',
      handler: async (req: Request, res: Response) => {
        try {
          const id = req.params.id;
          logger.info(`Fetching todo with ID: ${id}`);
          
          const todo = await TodoModel.findOne({ _id: id }).exec();
          
          if (!todo) {
            logger.warn(`Todo with ID ${id} not found`);
            return res.status(404).json({
              success: false,
              message: 'Todo not found'
            });
          }
          
          logger.info(`Found todo: ${todo.title}`);
          res.json({
            success: true,
            data: todo
          });
        } catch (error: any) {
          logger.error(`Failed to fetch todo: ${error.message}`);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch todo',
            error: error.message
          });
        }
      },
      description: 'Get a specific todo by ID'
    },
    {
      path: '/',
      method: 'post',
      handler: async (req: Request, res: Response) => {
        try {
          logger.info(`Creating new todo from request body ${JSON.stringify(req.body)}`);
          const todo = new TodoModel(req.body);
          await todo.save();
          logger.info(`Todo created with ID: ${todo._id}`);
          res.status(201).json({
            success: true,
            data: todo,
            message: 'Todo created successfully'
          });
        } catch (error: any) {
          logger.error(`Failed to create todo: ${error.message}`);
          res.status(400).json({
            success: false,
            message: 'Failed to create todo',
            error: error.message
          });
        }
      },
      description: 'Create a new todo'
    },
    {
      path: '/:id',
      method: 'put',
      handler: async (req: Request, res: Response) => {
        try {
          const id = req.params.id;
          logger.info(`Updating todo with ID: ${id}`);
          
          const todo = await TodoModel.findOne({ _id: id }).exec();
          
          if (!todo) {
            logger.warn(`Todo with ID ${id} not found for update`);
            return res.status(404).json({
              success: false,
              message: 'Todo not found'
            });
          }
          
          // Update the todo
          Object.assign(todo, req.body);
          await todo.save();
          
          logger.info(`Todo updated: ${todo.title}`);
          res.json({
            success: true,
            data: todo,
            message: 'Todo updated successfully'
          });
        } catch (error: any) {
          logger.error(`Failed to update todo: ${error.message}`);
          res.status(400).json({
            success: false,
            message: 'Failed to update todo',
            error: error.message
          });
        }
      },
      description: 'Update a todo by ID'
    },
    {
      path: '/:id',
      method: 'delete',
      handler: async (req: Request, res: Response) => {
        try {
          const id = req.params.id;
          logger.info(`Deleting todo with ID: ${id}`);
          
          const todo = await TodoModel.findOne({ _id: id }).exec();
          
          if (!todo) {
            logger.warn(`Todo with ID ${id} not found for deletion`);
            return res.status(404).json({
              success: false,
              message: 'Todo not found'
            });
          }
          
          // Delete the todo
          await todo.deleteOne();
          
          logger.info(`Todo deleted: ${todo.title}`);
          res.json({
            success: true,
            message: 'Todo deleted successfully'
          });
        } catch (error: any) {
          logger.error(`Failed to delete todo: ${error.message}`);
          res.status(500).json({
            success: false,
            message: 'Failed to delete todo',
            error: error.message
          });
        }
      },
      description: 'Delete a todo by ID'
    },
    {
      path: '/toggle/:id',
      method: 'patch',
      handler: async (req: Request, res: Response) => {
        try {
          const id = req.params.id;
          logger.info(`Toggling completion status for todo with ID: ${id}`);
          
          const todo = await TodoModel.findOne({ _id: id }).exec();
          
          if (!todo) {
            logger.warn(`Todo with ID ${id} not found for toggling status`);
            return res.status(404).json({
              success: false,
              message: 'Todo not found'
            });
          }
          
          todo.completed = !todo.completed;
          await todo.save();
          
          logger.info(`Todo ${todo._id} marked as ${todo.completed ? 'completed' : 'incomplete'}`);
          res.json({
            success: true,
            data: todo,
            message: `Todo marked as ${todo.completed ? 'completed' : 'incomplete'}`
          });
        } catch (error: any) {
          logger.error(`Failed to toggle todo status: ${error.message}`);
          res.status(500).json({
            success: false,
            message: 'Failed to toggle todo status',
            error: error.message
          });
        }
      },
      description: 'Toggle the completed status of a todo'
    }
  ];

  return routes;
} 