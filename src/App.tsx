import { Card } from './components/ui/Card'

export default function App() {
  return (
    <div className="font-body bg-bg min-h-screen p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <Card
          variant="programme"
          title="Stay Strong"
          description="Building strength and confidence in the over-60s."
          badge="60+ · Strength Training"
          href="/programmes-events#stay-strong"
        />
        <Card
          variant="event"
          title="Stay Strong Taster Session"
          date="2026-06-07"
          time="10:00am"
          location="Mold Leisure Centre"
          price={0}
          description="Come and try our Stay Strong programme for free."
        />
        <Card
          variant="team"
          name="Team Member"
          role="Director"
        />
      </div>
    </div>
  )
}
