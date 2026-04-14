import { AddRiotAccount } from "./_components/addRiotAccount";

export default function RiotPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-4">
        <AddRiotAccount />
      </div>
    </div>
  );
}
