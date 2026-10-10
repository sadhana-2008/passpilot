import { ShieldAlert, ExternalLink } from "lucide-react";

export function FooterDisclaimer() {
  return (
    <footer className="h-8 shrink-0 bg-panel/90 border-t border-border px-4 flex items-center justify-between text-[11px] text-text-muted select-none z-10">
      <div className="flex items-center gap-2">
        <ShieldAlert size={13} className="text-issue shrink-0" />
        <span>
          <strong className="text-text-secondary font-medium">Guidance only.</strong> Always verify on the official{" "}
          <a
            href="https://passportindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-0.5"
          >
            Passport Seva / MEA portal
            <ExternalLink size={10} />
          </a>
          .
        </span>
      </div>
      <div className="flex items-center gap-3 hidden sm:flex">
        <span>DevFest 2026: Solving for Bharat</span>
        <span className="font-mono text-[10px]">PassPilot AI v0.3</span>
      </div>
    </footer>
  );
}
