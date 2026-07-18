async function provider1(ip, forceDown) {
  if (process.env.GEO_PROVIDER_1_DOWN === "true" || forceDown) {
    throw new Error("Provider 1 is down");
  }
  return { provider: "provider1", country: "PK", city: "Lahore", source: "mocked-provider-1" };
}

async function provider2(ip) {
  return { provider: "provider2", country: "Unknown", city: "Unknown", source: "mocked-provider-2-fallback" };
}

async function provider3(ip) {
  return { provider: "provider3", country: null, city: null, source: "mocked-provider-3-last-resort" };
}

export async function enrichWithGeo(ip, { forceProvider1Down = false } = {}) {
  const providers = [
    (ip) => provider1(ip, forceProvider1Down),
    provider2,
    provider3,
  ];

  for (const provider of providers) {
    try {
      return await provider(ip);
    } catch (err) {
      console.warn(`⚠️ Geo provider failed: ${err.message} — trying next in chain`);
      continue;
    }
  }

  return { provider: null, country: null, city: null, source: "all-providers-failed" };
}