# Todo Tasks Manager Plugin

A simple plugin for managing todo tasks with its own MongoDB database.

## Features

- Create, read, update, and delete todo tasks
- Mark tasks as completed/incomplete
- Set priority levels (low, medium, high)
- Set due dates for tasks
- Filter tasks by status (all, active, completed)
- Responsive UI
- Integrated logging through the plugin system

## Installation

1. Make sure MongoDB is running and accessible
2. Build the plugin:
   ```bash
   cd plugins/todo-tasks-manager
   npm install
   npm run build
   ```
3. Restart the Squirrel Servers Manager

## Usage

Access the Todo Tasks Manager at:
```
http://your-server-url/static-plugins/todo-tasks-manager/
```

The API endpoints are available at:
```
http://your-server-url/plugins/todo-tasks-manager/
```

## API Endpoints

- `GET /plugins/todo-tasks-manager/` - Get all todos
- `GET /plugins/todo-tasks-manager/:id` - Get a specific todo by ID
- `POST /plugins/todo-tasks-manager/` - Create a new todo
- `PUT /plugins/todo-tasks-manager/:id` - Update a todo by ID
- `DELETE /plugins/todo-tasks-manager/:id` - Delete a todo by ID
- `PATCH /plugins/todo-tasks-manager/toggle/:id` - Toggle the completed status of a todo

## Development

To work on this plugin:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the TypeScript compiler in watch mode:
   ```bash
   npm run watch
   ```

3. Make your changes to the TypeScript files in the `src` directory
4. The compiled JavaScript will be output to the `dist` directory

## Database

This plugin uses a MongoDB database named `todo_plugin`. The database connection is provided by the plugin system based on the configuration in the manifest.json file.

## Logging

The plugin uses the logger provided by the plugin system. All plugin activities are logged with appropriate log levels (info, warn, error, debug) and include the plugin name as a prefix for easy identification in the server logs. 