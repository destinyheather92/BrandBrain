import { ImagePlus, Images, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Asset } from "../types/asset";

type AssetsShellProps = {
  accountControl: ReactNode;
  assets: Asset[];
};

export function AssetsShell({ accountControl, assets }: AssetsShellProps) {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#263244] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[#00E5FF] hover:text-[#4CF2FF]" href="/dashboard">
              Dashboard
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <div className="rounded-lg border border-[#263244] bg-[#141A26] p-2 text-[#00E5FF]">
                <Images aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#F8FAFC]">Assets</h1>
                <p className="mt-1 text-sm text-[#CBD5E1]">
                  Reusable brand images, generated visuals, logos, and upload-ready files.
                </p>
              </div>
            </div>
          </div>
          {accountControl ? <div className="self-start md:self-auto">{accountControl}</div> : null}
        </header>

        <section className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-[#263244] bg-[#141A26] p-5" aria-label="Upload intake">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                  <UploadCloud aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#F8FAFC]">UploadThing-ready intake</h2>
                  <p className="mt-1 text-sm text-[#94A3B8]">Storage model is ready for live uploads.</p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-dashed border-[#263244] bg-[#0B0F19] p-5 text-sm leading-6 text-[#CBD5E1]">
                Uploaded logos, photos, and brand files will land here after UploadThing keys are configured.
              </div>
            </section>

            <section className="rounded-lg border border-[#263244] bg-[#141A26] p-5" aria-label="Asset stats">
              <p className="text-sm font-semibold text-[#F8FAFC]">Library Status</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#263244] pb-3">
                  <dt className="text-[#94A3B8]">Saved assets</dt>
                  <dd className="font-semibold text-[#F8FAFC]">{assets.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#94A3B8]">Generated images</dt>
                  <dd className="font-semibold text-[#F8FAFC]">
                    {assets.filter((asset) => asset.kind === "generated-image").length}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>

          <section className="min-w-0" aria-label="Asset library">
            {assets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {assets.map((asset) => (
                  <AssetCard asset={asset} key={asset.id} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-96 items-center justify-center rounded-lg border border-[#263244] bg-[#141A26] p-6 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#263244] bg-[#1C2433] text-[#00E5FF]">
                    <ImagePlus aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#F8FAFC]">No assets yet</h2>
                  <p className="mt-2 max-w-sm text-sm text-[#CBD5E1]">
                    Generated images and uploaded brand files will appear here.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#263244] bg-[#141A26]">
      <div className="relative aspect-[4/3] bg-[#0B0F19]">
        <Image
          alt={asset.name}
          className="object-cover"
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 90vw"
          src={asset.sourceUrl}
          unoptimized
        />
      </div>
      <div className="grid gap-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold text-[#F8FAFC]">{asset.name}</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{formatAssetKind(asset.kind)}</p>
        </div>
        <div className="grid gap-2 text-sm text-[#CBD5E1]">
          {asset.brandName ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Brand</span>
              <span className="truncate font-medium text-[#F8FAFC]">{asset.brandName}</span>
            </div>
          ) : null}
          {asset.projectTitle ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Project</span>
              <span className="truncate font-medium text-[#F8FAFC]">{asset.projectTitle}</span>
            </div>
          ) : null}
          {asset.provider ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#94A3B8]">Provider</span>
              <span className="font-medium text-[#F8FAFC]">{formatProvider(asset.provider)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatAssetKind(kind: Asset["kind"]): string {
  return kind
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatProvider(provider: NonNullable<Asset["provider"]>): string {
  return provider[0]?.toUpperCase() + provider.slice(1);
}
