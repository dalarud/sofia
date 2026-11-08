/** De fyra kollektionerna i ateljén. En vara i en kollektion har id:t "produkt~kollektion". */
export const COLLECTIONS: Record<string, string> = { skogen: "Skogen", sjon: "Sjön", berget: "Berget", angen: "Ängen" };

/** Delar upp ett id från varukorgen i produkt och kollektion. Ger null om kollektionen inte finns. */
export function splitItemId(id: string): { productId: string; collection?: string } | null {
  const [productId, key, ...rest] = id.split("~");
  if (rest.length || !productId) return null;
  if (key === undefined) return { productId };
  const collection = COLLECTIONS[key];
  return collection ? { productId, collection } : null;
}
