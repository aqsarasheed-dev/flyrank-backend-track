export async function sendWebhookSafely(payload) {
  try {
    // Mocked webhook — in production this would be a real fetch() to a customer URL
    console.log("📨 Sending webhook (mocked):", JSON.stringify(payload));

    // Simulate occasional webhook failure to prove it doesn't break the submission
    if (Math.random() < 0.3) {
      throw new Error("Simulated webhook endpoint timeout");
    }

    console.log("✅ Webhook sent successfully");
    return { sent: true };
  } catch (err) {
    // CRITICAL: log the failure, but never throw — the submission must still succeed
    console.error(`🚨 ALERT: Webhook failed (submission still saved): ${err.message}`);
    return { sent: false, error: err.message };
  }
}