import { ImagePlaceholder } from './components/ui/ImagePlaceholder'
import { StatCard } from './components/ui/StatCard'

export default function App() {
  return (
    <div className="font-body bg-bg min-h-screen p-8 space-y-8">
      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <StatCard value="1,200+" label="Participants supported" />
        <StatCard value="340+" label="Sessions delivered" />
        <StatCard value="3" label="Active programmes" />
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <ImagePlaceholder aspectRatio="video" />
        <ImagePlaceholder aspectRatio="square" />
        <ImagePlaceholder aspectRatio="4/3" label="Team photo coming soon" />
      </div>
    </div>
  )
}
