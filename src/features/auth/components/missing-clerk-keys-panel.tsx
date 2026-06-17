export function MissingClerkKeysPanel() {
  return (
    <div className="rounded-lg border border-[#263244] bg-[#141A26] p-6 text-left">
      <h3 className="text-2xl font-semibold text-[#F8FAFC]">Connect Clerk keys</h3>
      <p className="mt-3 text-base leading-7 text-[#CBD5E1]">
        Add your Clerk development keys to <code className="text-[#00E5FF]">.env.local</code>,
        then restart the dev server to activate the hosted Clerk form.
      </p>
      <div className="mt-5 rounded-lg border border-[#263244] bg-[#0B0F19] p-4 text-sm text-[#CBD5E1]">
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...</p>
        <p>CLERK_SECRET_KEY=...</p>
      </div>
    </div>
  );
}
