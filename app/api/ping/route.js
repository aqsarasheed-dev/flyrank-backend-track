
export async function GET() {
  return Response.json({ 
    message: 'pong',
    status: 'Server is alive!'
  });
}