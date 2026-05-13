export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white">
        <div>
          <span className="text-xl font-semibold tracking-tight">RPLMS</span>
        </div>
        <div className="space-y-3">
          <blockquote className="text-2xl font-light leading-relaxed text-zinc-100">
            &ldquo;From idea to publication — managed in one place.&rdquo;
          </blockquote>
          <p className="text-sm text-zinc-400">
            Research Paper Lifecycle Management System
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          Built for researchers, supervisors, and academic labs.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
