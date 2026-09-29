import { GameCanvas } from '../../features/game/GameCanvas';

export const metadata = {
  title: 'Playing | Neon Rush',
};

export default function GamePage() {
  return (
    <main className="w-full h-screen bg-black m-0 p-0 overflow-hidden">
      <GameCanvas />
    </main>
  );
}
