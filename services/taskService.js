import * as taskRepository from "@/repositories/postgresRepository";

export async function getAllTasks() {
  console.log("📋 Service: fetching all tasks...");
  return taskRepository.findAll();
}

export async function getTaskById(id) {
  console.log(`📋 Service: fetching task ${id}...`);
  const task = await taskRepository.findById(id);
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }
  return task;
}

export async function createTask(data) {
  if (!data.title) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }
  console.log("📋 Service: creating task...");
  return taskRepository.create(data);
}