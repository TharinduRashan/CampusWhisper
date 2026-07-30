export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-400 text-sm font-medium mb-4">
          <span className="size-2 rounded-full bg-primary-400 animate-pulse" />
          Building in progress
        </div>
        <h1 className="text-5xl font-bold gradient-text">CampusWhisper</h1>
        <p className="text-ink-muted text-lg max-w-md mx-auto">
          Anonymous campus discussions for verified university students.
        </p>
        <p className="text-ink-subtle text-sm">Phase 1 complete ✓</p>
      </div>
    </main>
  )
}
