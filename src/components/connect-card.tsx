/* The quiet edge overlay for the scene. Searching the network and entering an
   address are offered as two equal ways in, with the search first because it
   asks the least of someone who does not know their bridge address. */
export function ConnectCard() {
  return (
    <div className="card w-full max-w-md bg-base-200/90 backdrop-blur-sm">
      <div className="card-body gap-0">
        <h1 className="font-display text-3xl">
          Connect to a Philips Hue bridge
        </h1>
        <button
          type="button"
          className="btn btn-primary btn-lg mt-7 w-full"
          disabled
        >
          Search my network
        </button>
        <p className="mt-3 text-sm text-base-content/50">
          Finds bridges on the network this computer is already using.
        </p>
        <div className="divider my-6 text-base-content/40">or</div>
        <form className="flex flex-col gap-4">
          <label className="floating-label">
            <span>Bridge address</span>
            <input
              type="text"
              name="bridge"
              placeholder="192.168.1.2"
              className="input input-lg w-full"
            />
          </label>
          <button type="submit" className="btn btn-secondary btn-lg" disabled>
            Connect to this address
          </button>
        </form>
        <p className="mt-3 text-sm text-base-content/50">
          Use this when you already know where your bridge lives.
        </p>
      </div>
    </div>
  );
}
