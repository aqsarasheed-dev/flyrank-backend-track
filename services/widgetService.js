import * as widgetRepository from "@/repositories/widgetRepository";

export async function createWidget(ownerId, { type, copy, fields, targeting }) {
  if (!type || !copy || !fields) {
    const error = new Error("type, copy, and fields are required");
    error.statusCode = 400;
    throw error;
  }
  return widgetRepository.createWidget({ ownerId, type, copy, fields, targeting });
}

export async function listMyWidgets(ownerId) {
  return widgetRepository.findWidgetsByOwner(ownerId);
}

async function getOwnedWidget(id, ownerId) {
  const widget = await widgetRepository.findWidgetById(id);
  if (!widget) {
    const error = new Error("Widget not found");
    error.statusCode = 404;
    throw error;
  }
  if (widget.owner_id !== ownerId) {
    const error = new Error("Forbidden — you don't own this widget");
    error.statusCode = 403;
    throw error;
  }
  return widget;
}

export async function getMyWidget(id, ownerId) {
  return getOwnedWidget(id, ownerId);
}

export async function updateMyWidget(id, ownerId, { copy, fields, targeting }) {
  await getOwnedWidget(id, ownerId); // throws 404/403 if not owned
  return widgetRepository.updateWidget(id, { copy, fields, targeting });
}

export async function deleteMyWidget(id, ownerId) {
  await getOwnedWidget(id, ownerId);
  return widgetRepository.deleteWidget(id);
}