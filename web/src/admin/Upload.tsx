"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Förminskar foton i webbläsaren så att de går snabbt att skicka, även på mobilen. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 600_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function ReceiptUpload() {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [state, setState] = useState<{ busy: boolean; msg?: string; err?: string }>({ busy: false });
  const [over, setOver] = useState(false);

  async function send(list: FileList | null) {
    if (!list?.length) return;
    setState({ busy: true, msg: list.length === 1 ? "Sparar kvittot…" : `Sparar ${list.length} kvitton…` });
    const form = new FormData();
    for (const f of Array.from(list)) form.append("file", await shrink(f));
    const res = await fetch("/api/admin/kvitton", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setState({ busy: false, err: data.error ?? "Det gick inte att spara. Försök igen." }); return; }
    setState({ busy: false, msg: data.ids.length === 1 ? "Sparat! Det ligger nu bland kvittona att bokföra." : `Sparat ${data.ids.length} kvitton!` });
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div className="a-stack" id="ny">
      <label className={`drop${over ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); send(e.dataTransfer.files); }}>
        <input ref={input} type="file" accept="image/*,application/pdf" multiple onChange={(e) => send(e.target.files)} disabled={state.busy} />
        <span className="a-btn a-btn--big" aria-hidden="true">{state.busy ? "Sparar…" : "Fota eller välj kvitton"}</span>
        <span className="a-muted a-small">På mobilen öppnas kameran. På datorn kan du dra hit bilder eller PDF:er. Du behöver inte fylla i något nu.</span>
      </label>
      {state.err ? <p className="a-banner a-banner--warn" role="alert">{state.err}</p> : state.msg ? <p className="a-banner" role="status">{state.msg}</p> : null}
    </div>
  );
}
