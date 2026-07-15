import { getAllTasks, createTask } from "@/services/taskService";

export async function GET() {
  try {
    const tasks = await getAllTasks();
    return Response.json({ success: true, data: tasks });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return Response.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}