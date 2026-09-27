/* Soft pools of warm light in the corners of the room, kept behind everything
   else so the page reads as one continuous scene. */
export function RoomGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute bottom-[12%] left-[8%] size-72 rounded-full bg-accent opacity-15 blur-[90px]" />
      <div className="absolute left-[30%] top-[6%] size-56 rounded-full bg-primary opacity-8 blur-[100px]" />
    </div>
  );
}
