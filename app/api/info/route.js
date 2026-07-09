export async function GET() {
  return Response.json({ 
    name: 'FlyRank Backend',
    version: '1.0.0',
    framework: 'Next.js',
    status: 'Running smoothly!'
  });
}