import { describe, expect, it } from "vitest";
import { ACC, compact, expenseRows, isBalanced, payoutRows, reverseRows, saleRows, stripeFeeRows, vatSettlementRows } from "../src/lib/rules";
import { balances, incomeStatement, vatReport } from "../src/lib/reports";
import { sieText } from "../src/lib/sie";
import { kr, parseKr, vatFromGross } from "../src/lib/money";

describe("moms och belopp", () => {
  it("räknar ut momsen i ett pris inklusive moms", () => {
    expect(vatFromGross(12500, 25)).toBe(2500);
    expect(vatFromGross(19500, 25)).toBe(3900);
    expect(vatFromGross(10600, 6)).toBe(600);
    expect(vatFromGross(10000, 0)).toBe(0);
  });
  it("tolkar belopp som Sofia skriver", () => {
    expect(parseKr("1 995,50")).toBe(199550);
    expect(parseKr("199.5 kr")).toBe(19950);
    expect(parseKr("")).toBeNull();
    expect(parseKr("abc")).toBeNull();
  });
  it("visar belopp på svenska", () => {
    expect(kr(199500).replace(/\s/g, " ")).toBe("1 995 kr");
  });
});

describe("försäljning", () => {
  it("bokför en order med vara, frakt och presentkort via Stripe", () => {
    const rows = saleRows([
      { grossOre: 59500, vatRate: 25, kind: "goods" },
      { grossOre: 6900, vatRate: 25, kind: "shipping" },
      { grossOre: 50000, vatRate: 25, kind: "gift" },
    ], ACC.stripe);
    expect(isBalanced(rows)).toBe(true);
    const b = balances(rows);
    expect(b.get(1580)).toBe(59500 + 6900 + 50000);
    expect(b.get(3001)).toBe(-47600);
    expect(b.get(3521)).toBe(-5520);
    expect(b.get(2611)).toBe(-(11900 + 1380));
    expect(b.get(2420)).toBe(-50000); // presentkortet är en skuld utan moms
  });
  it("bokför en kursplats som tjänst", () => {
    const rows = saleRows([{ grossOre: 65000, vatRate: 25, kind: "service" }], ACC.stripe);
    expect(balances(rows).get(3041)).toBe(-52000);
    expect(balances(rows).get(2611)).toBe(-13000);
  });
});

describe("kvitton", () => {
  it("bokför ett kvitto betalt från företagskontot", () => {
    const rows = expenseRows({ grossOre: 25000, vatOre: 5000, account: 4010, paidWith: "foretag" });
    expect(isBalanced(rows)).toBe(true);
    expect(balances(rows).get(4010)).toBe(20000);
    expect(balances(rows).get(2641)).toBe(5000);
    expect(balances(rows).get(1930)).toBe(-25000);
  });
  it("bokför ett kvitto som Sofia betalat privat som egen insättning", () => {
    const rows = expenseRows({ grossOre: 10600, vatOre: 600, account: 5800, paidWith: "privat" });
    expect(balances(rows).get(2018)).toBe(-10600);
  });
  it("vägrar orimliga belopp", () => {
    expect(() => expenseRows({ grossOre: 0, vatOre: 0, account: 4010, paidWith: "foretag" })).toThrow();
    expect(() => expenseRows({ grossOre: 100, vatOre: 100, account: 4010, paidWith: "foretag" })).toThrow();
  });
});

describe("Stripe och rättelser", () => {
  it("avgift och utbetalning nollar fordran på Stripe", () => {
    const all = [...saleRows([{ grossOre: 19500, vatRate: 25, kind: "goods" }], ACC.stripe), ...stripeFeeRows(475), ...payoutRows(19025)];
    expect(balances(all).get(1580)).toBe(0);
    expect(balances(all).get(1930)).toBe(19025);
    expect(balances(all).get(6570)).toBe(475);
  });
  it("en rättelse tar ut originalet", () => {
    const orig = expenseRows({ grossOre: 25000, vatOre: 5000, account: 4010, paidWith: "foretag" });
    const all = [...orig, ...reverseRows(orig)];
    expect([...balances(all).values()].every((v) => v === 0)).toBe(true);
  });
  it("compact slår ihop konton", () => {
    expect(compact([{ account: 1930, debitOre: 100, creditOre: 0 }, { account: 1930, debitOre: 0, creditOre: 40 }])).toEqual([{ account: 1930, debitOre: 60, creditOre: 0 }]);
  });
});

describe("rapporter", () => {
  const rows = [
    ...saleRows([{ grossOre: 59500, vatRate: 25, kind: "goods" }, { grossOre: 65000, vatRate: 25, kind: "service" }], ACC.stripe),
    ...expenseRows({ grossOre: 25000, vatOre: 5000, account: 4010, paidWith: "foretag" }),
    ...expenseRows({ grossOre: 10600, vatOre: 600, account: 5800, paidWith: "privat" }),
  ];
  it("momsrapporten följer rutorna i momsdeklarationen", () => {
    const r = vatReport(rows);
    expect(r.ruta05).toBe(47600 + 52000);
    expect(r.ruta10).toBe(11900 + 13000);
    expect(r.ruta48).toBe(5600);
    expect(r.ruta49).toBe(24900 - 5600);
  });
  it("momsavräkningen nollar momskontona", () => {
    const settle = vatSettlementRows(balances(rows));
    expect(isBalanced(settle)).toBe(true);
    const after = balances([...rows, ...settle]);
    expect(after.get(2611)).toBe(0);
    expect(after.get(2641)).toBe(0);
    expect(after.get(2650)).toBe(-(24900 - 5600));
  });
  it("resultatet är intäkter minus kostnader", () => {
    const r = incomeStatement(rows);
    expect(r.income).toBe(99600);
    expect(r.costs).toBe(20000 + 10000);
    expect(r.result).toBe(69600);
  });
});

describe("SIE-export", () => {
  it("skriver verifikationer och saldon i SIE 4", () => {
    const text = sieText({
      companyName: "Studio Dalarud", orgNr: "19900101-1234", year: 2026, generated: "2026-12-31",
      accounts: [{ number: 1930, name: "Företagskonto" }, { number: 4010, name: "Inköp material och varor" }, { number: 2641, name: "Debiterad ingående moms" }],
      openingBalances: new Map([[1930, 100000]]),
      verifications: [{ number: 1, date: "2026-11-02", text: 'Kvitto "Lera"', rows: expenseRows({ grossOre: 25000, vatOre: 5000, account: 4010, paidWith: "foretag" }) }],
    });
    expect(text).toContain("#SIETYP 4");
    expect(text).toContain("#ORGNR 199001011234");
    expect(text).toContain("#IB 0 1930 1000.00");
    expect(text).toContain("#UB 0 1930 750.00");
    expect(text).toContain("#RES 0 4010 200.00");
    expect(text).toContain('#VER "A" 1 20261102 "Kvitto \\"Lera\\"" 20261102');
    expect(text).toContain("#TRANS 1930 {} -250.00");
    expect(text.includes("\r\n")).toBe(true);
  });
});
