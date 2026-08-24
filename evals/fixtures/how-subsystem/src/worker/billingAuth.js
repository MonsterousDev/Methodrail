export async function onAuthorize(job) {
  const hold = await loadHold(job.holdId);
  const result = await processor.capture(hold.processorRef);
  await writeLedger(hold.orgId, result);
  await emit("billing.captured", { holdId: hold.id, orgId: hold.orgId });
}
