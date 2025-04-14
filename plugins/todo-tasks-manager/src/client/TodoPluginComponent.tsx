import { Button, Checkbox, Input, List, Spin, message } from "antd";
import React, { useEffect, useState } from "react";

// Define the base URL for this specific plugin's backend API endpoints.
// This should match the base path registered by the plugin on the server.
const API_BASE_URL = "/api/plugins/todo-tasks-manager";

/**
 * Interface defining the structure of a Task object,
 * mirroring the data returned by the backend API.
 */
interface Task {
  _id: string; // MongoDB ObjectId typically represented as a string
  title: string; // The main text content of the task
  completed: boolean; // Status of the task
  description?: string; // Optional description field
  priority?: string; // Optional priority field
  dueDate?: string | null; // Optional due date field
}

/**
 * The main React functional component for the Todo List plugin UI.
 * This component fetches, displays, and manages todo tasks.
 */
const TodoPluginComponent: React.FC = () => {
  // --- State Management ---
  // State variable to hold the array of tasks fetched from the API.
  const [tasks, setTasks] = useState<Task[]>([]);
  // State variable to track if data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State variable to hold the text entered in the new task input field.
  const [newTaskText, setNewTaskText] = useState("");

  /**
   * Helper function to process the response from fetch API calls.
   * Checks for network errors, API-reported errors (via success flag),
   * and parses the JSON body.
   * @param response The Response object from a fetch call.
   * @returns A Promise resolving to the API result { success: boolean, data: any }.
   */
  const handleResponse = async (response: Response) => {
    // Check for HTTP errors (status code not in 200-299 range).
    if (!response.ok) {
      const errorData = await response.text(); // Try to get error message from body
      throw new Error(
        `API Error (${response.status}): ${errorData || response.statusText}`
      );
    }
    // Handle successful responses with no content (e.g., DELETE).
    if (response.status === 204) {
      return { success: true, data: null }; // Indicate success with null data
    }
    // Parse the JSON body for successful responses with content.
    const result = await response.json();
    // Check the application-level success flag within the JSON response.
    if (!result.success) {
      throw new Error(
        `API Operation Failed: ${result.message || "No error message provided"}`
      );
    }
    // Return the parsed result containing { success: true, data: ... }.
    return result;
  };

  // --- API Interaction Functions ---

  /**
   * Fetches the list of tasks from the backend API.
   * Updates the component's state with the fetched tasks or handles errors.
   */
  const loadTasks = async () => {
    setLoading(true); // Indicate loading started
    try {
      // Make GET request to the base API endpoint.
      const response = await fetch(`${API_BASE_URL}/`);
      // Process the response using the helper.
      const result = await handleResponse(response);
      // Update the tasks state with the data from the response, default to empty array if no data.
      setTasks(result.data || []);
    } catch (error: any) {
      // Log error to console and show user-friendly message.
      console.error("Fetch tasks error:", error);
      message.error(`Failed to load tasks: ${error.message}`);
      setTasks([]); // Reset tasks on error to avoid displaying stale data.
    } finally {
      // Ensure loading indicator is turned off regardless of success or failure.
      setLoading(false);
    }
  };

  /**
   * Hook to load tasks when the component mounts for the first time.
   * The empty dependency array [] ensures this runs only once on mount.
   */
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Handles adding a new task.
   * Sends a POST request to the backend with the new task title.
   * Updates the local state optimistically or on successful response.
   */
  const handleAddTask = async () => {
    // Basic validation: Don't add empty tasks.
    if (!newTaskText.trim()) return;
    try {
      // Make POST request to the base API endpoint.
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Indicate sending JSON data.
        },
        // Send the new task title in the request body.
        body: JSON.stringify({ title: newTaskText }),
      });
      // Process the response.
      const result = await handleResponse(response);
      // If the API returns the newly created task in `result.data`:
      if (result.data) {
        // Add the new task to the local state (optimistic update or based on response).
        setTasks([...tasks, result.data]);
        setNewTaskText(""); // Clear the input field.
        message.success("Task added"); // Show success message.
      } else {
        // Handle cases where the API confirms success but doesn't return the new task.
        message.warning("Task added, but no data returned from API.");
        setNewTaskText("");
        loadTasks(); // Refresh the entire list as a fallback.
      }
    } catch (error: any) {
      // Log error and show user-friendly message.
      console.error("Add task error:", error);
      message.error(`Failed to add task: ${error.message}`);
    }
  };

  /**
   * Handles toggling the completion status of a task.
   * Sends a PUT (or potentially PATCH) request to update the task on the backend.
   * Updates the local state optimistically.
   * @param id The ID (_id) of the task to toggle.
   * @param completed The new completion status (true/false).
   */
  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      // Make PUT request to the specific task endpoint (/plugins/todo-tasks-manager/:id).
      // Note: PATCH might be semantically better if only updating `completed`.
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the new completion status in the request body.
        body: JSON.stringify({ completed }),
      });
      // Check for errors in the response.
      await handleResponse(response);
      // Update the local state optimistically to reflect the change immediately.
      setTasks(
        tasks.map((task) => (task._id === id ? { ...task, completed } : task))
      );
      message.success("Task updated"); // Show success message.
    } catch (error: any) {
      // Log error and show user-friendly message.
      console.error("Update task error:", error);
      message.error(`Failed to update task: ${error.message}`);
      // TODO: Consider reverting the optimistic UI update on error or reloading tasks.
    }
  };

  /**
   * Handles deleting a task.
   * Sends a DELETE request to the backend.
   * Updates the local state upon successful deletion.
   * @param id The ID (_id) of the task to delete.
   */
  const handleDeleteTask = async (id: string) => {
    try {
      // Make DELETE request to the specific task endpoint (/plugins/todo-tasks-manager/:id).
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      // Check for errors (expecting 204 No Content on success).
      await handleResponse(response);
      // Remove the task from the local state.
      setTasks(tasks.filter((task) => task._id !== id));
      message.success("Task deleted"); // Show success message.
    } catch (error: any) {
      // Log error and show user-friendly message.
      console.error("Delete task error:", error);
      message.error(`Failed to delete task: ${error.message}`);
    }
  };

  // --- JSX Rendering ---

  return (
    // Basic container with styling for visual separation.
    <div
      style={{ border: "1px dashed green", padding: "15px", margin: "10px" }}
    >
      <h2>Todo List Plugin</h2>
      {/* Input field for adding new tasks */}
      <Input
        placeholder="New Task Title"
        value={newTaskText}
        onChange={(e) => setNewTaskText(e.target.value)}
        onPressEnter={handleAddTask} // Allow adding task by pressing Enter
        style={{
          marginBottom: "10px",
          width: "calc(100% - 80px)", // Adjust width to fit button
          marginRight: "8px",
        }}
      />
      {/* Button to trigger adding a new task */}
      <Button type="primary" onClick={handleAddTask}>
        Add Task
      </Button>
      {/* Display loading spinner while tasks are loading */}
      {loading ? (
        <Spin />
      ) : (
        /* Display the list of tasks */
        <List
          bordered // Add borders around the list and items
          dataSource={tasks} // Data source is the tasks state array
          // Function to render each item in the list
          renderItem={(item) => (
            <List.Item
              key={item._id} // Use the unique task _id as the key
              // Actions displayed on the right side of the list item
              actions={[
                <Button
                  danger // Red color for delete button
                  size="small"
                  onClick={() => handleDeleteTask(item._id)} // Call delete handler
                >
                  Delete
                </Button>,
              ]}
            >
              {/* Checkbox to display and toggle completion status */}
              <Checkbox
                checked={item.completed}
                onChange={(e) => handleToggleTask(item._id, e.target.checked)} // Call toggle handler
              >
                {/* Display the task title */}
                {item.title}
              </Checkbox>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default TodoPluginComponent;
