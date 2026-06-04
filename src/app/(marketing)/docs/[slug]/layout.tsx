import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocSlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1280px] mx-auto px-7 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
        <aside className="hidden lg:block">
          <DocsSidebar />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
