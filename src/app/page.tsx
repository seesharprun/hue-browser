export default function HomePage() {
  return (
    <main className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hue Browser</h1>
          <p className="py-6">
            Manage Philips Hue bridges, rooms, and devices from one dashboard.
          </p>
          <button type="button" className="btn btn-primary" disabled>
            Connect a bridge
          </button>
        </div>
      </div>
    </main>
  );
}
