export default defineEventHandler(() => {
  return {
    ok: true,
    service: "studio_app",
    timestamp: new Date().toISOString()
  };
});
