export async function onProcessorWebhook(event) {
  if (event.type !== "capture.succeeded") return;
  const hold = await loadHoldByProcessorRef(event.captureId);
  if (hold.status === "captured") return;
  await markCaptured(hold.id, event);
}
