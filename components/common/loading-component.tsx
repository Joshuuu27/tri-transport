import { Spinner } from "@/components/ui/spinner"

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-background to-background/80">
      <Spinner className="size-12 text-primary" />
      <div className="flex flex-col items-center gap-2">
        {/* <h2 className="text-xl font-semibold text-foreground">Loading...</h2> */}
        {/* <p className="text-sm text-muted-foreground">Verifying your session./..</p> */}
      </div>
    </div>
  )
}
