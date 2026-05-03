import { Button } from './components/ui/Button'
import { Badge } from './components/ui/Badge'

export default function App() {
  return (
    <div className="font-body bg-bg min-h-screen p-8 space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-2">
        <Badge>Stay Strong</Badge>
        <Badge>All Abilities · Running</Badge>
      </div>
    </div>
  )
}
