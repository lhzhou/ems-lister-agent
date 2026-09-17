import {
  buildWaybillTimelineView,
  wrapParagraphs,
  type WaybillTimelineEventView,
  type WaybillTimelineSource,
  type WaybillTimelineView,
} from "./waybill-timeline";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 32;
const HEADER_HEIGHT = 88;
const FOOTER_Y = 28;
const TABLE_HEADER_HEIGHT = 26;
const ROW_PAD_Y = 8;
const LINE_HEIGHT = 15;
const CELL_PAD_X = 8;
const SCALE = 2;

const COLUMNS = [
  { key: "time", label: "时间", width: 108 },
  { key: "title", label: "操作", width: 92 },
  { key: "org", label: "机构", width: 108 },
  { key: "duration", label: "耗时/停留", width: 108 },
  { key: "desc", label: "描述", width: PAGE_WIDTH - MARGIN_X * 2 - 108 - 92 - 108 - 108 },
] as const;

const COLORS = {
  page: "#ffffff",
  ink: "#1D2129",
  muted: "#666F80",
  faint: "#9E9E9E",
  line: "#E5E6EB",
  headerFill: "#FAFAFA",
  stripe: "#F4F6F8",
  primary: "#0F6B3D",
};

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC, sans-serif";

type PdfPage = {
  width: number;
  height: number;
  content: Uint8Array;
};

type RowLayout = {
  event: WaybillTimelineEventView;
  height: number;
  timeLines: string[];
  titleLines: string[];
  orgLines: string[];
  durationLines: string[];
  descLines: string[];
};

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function ascii(value: string) {
  return new TextEncoder().encode(value);
}

function padOffset(offset: number) {
  return String(offset).padStart(10, "0");
}

function measureWith(ctx: CanvasRenderingContext2D, font: string) {
  return (value: string) => {
    ctx.font = font;
    return ctx.measureText(value).width;
  };
}

function wrapCell(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const maxWidth = Math.max(24, width - CELL_PAD_X * 2);
  return wrapParagraphs(text, maxWidth, measureWith(ctx, "11px " + FONT_FAMILY));
}

function layoutRow(ctx: CanvasRenderingContext2D, event: WaybillTimelineEventView): RowLayout {
  const timeLines = wrapCell(ctx, event.time, COLUMNS[0].width);
  const titleLines = wrapCell(ctx, event.title, COLUMNS[1].width);
  const orgLines = wrapCell(ctx, event.org || "-", COLUMNS[2].width);
  const durationLines = wrapCell(ctx, event.durationLabel || "-", COLUMNS[3].width);
  const descLines = wrapCell(ctx, event.desc || "-", COLUMNS[4].width);
  const lineCount = Math.max(
    timeLines.length,
    titleLines.length,
    orgLines.length,
    durationLines.length,
    descLines.length,
    1,
  );
  return {
    event,
    height: ROW_PAD_Y * 2 + lineCount * LINE_HEIGHT,
    timeLines,
    titleLines,
    orgLines,
    durationLines,
    descLines,
  };
}

function paginateRows(ctx: CanvasRenderingContext2D, view: WaybillTimelineView) {
  const usableHeight = PAGE_HEIGHT - HEADER_HEIGHT - TABLE_HEADER_HEIGHT - FOOTER_Y - 18;
  const pages: RowLayout[][] = [[]];
  let used = 0;

  for (const event of view.events) {
    const row = layoutRow(ctx, event);
    if (used + row.height > usableHeight && pages[pages.length - 1].length > 0) {
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push(row);
    used += row.height;
  }

  return pages.filter((page) => page.length > 0);
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  view: WaybillTimelineView,
  pageIndex: number,
  pageCount: number,
) {
  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, 0, PAGE_WIDTH, 5);

  ctx.fillStyle = COLORS.ink;
  ctx.font = "700 18px " + FONT_FAMILY;
  ctx.fillText("运单轨迹", MARGIN_X, 32);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "11px " + FONT_FAMILY;
  ctx.textAlign = "right";
  ctx.fillText("第 " + (pageIndex + 1) + " / " + pageCount + " 页", PAGE_WIDTH - MARGIN_X, 32);
  ctx.textAlign = "left";

  const status = view.substatus ? `${view.statusLabel} / ${view.substatus}` : view.statusLabel;
  ctx.fillStyle = COLORS.ink;
  ctx.font = "12px " + FONT_FAMILY;
  ctx.fillText(`运单号：${view.waybillNo}    客户：${view.customerName}`, MARGIN_X, 54);
  ctx.fillText(`发件日期：${view.sentAt}    当前状态：${status}`, MARGIN_X, 72);
}

function drawFooter(ctx: CanvasRenderingContext2D, generatedAt: string) {
  ctx.fillStyle = COLORS.faint;
  ctx.font = "10px " + FONT_FAMILY;
  ctx.fillText("导出时间 " + generatedAt, MARGIN_X, PAGE_HEIGHT - 16);
}

function drawTableHeader(ctx: CanvasRenderingContext2D, y: number) {
  let x = MARGIN_X;
  ctx.fillStyle = COLORS.headerFill;
  ctx.fillRect(x, y, PAGE_WIDTH - MARGIN_X * 2, TABLE_HEADER_HEIGHT);
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, PAGE_WIDTH - MARGIN_X * 2, TABLE_HEADER_HEIGHT);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "600 11px " + FONT_FAMILY;
  for (const column of COLUMNS) {
    ctx.strokeRect(x, y, column.width, TABLE_HEADER_HEIGHT);
    ctx.fillText(column.label, x + CELL_PAD_X, y + 17);
    x += column.width;
  }
}

function drawRow(ctx: CanvasRenderingContext2D, row: RowLayout, y: number, striped: boolean) {
  const tableWidth = PAGE_WIDTH - MARGIN_X * 2;
  if (striped) {
    ctx.fillStyle = COLORS.stripe;
    ctx.fillRect(MARGIN_X, y, tableWidth, row.height);
  }

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN_X, y, tableWidth, row.height);

  const cells = [row.timeLines, row.titleLines, row.orgLines, row.durationLines, row.descLines];
  let x = MARGIN_X;
  ctx.fillStyle = COLORS.ink;
  ctx.font = "11px " + FONT_FAMILY;
  COLUMNS.forEach((column, index) => {
    ctx.strokeRect(x, y, column.width, row.height);
    const lines = cells[index];
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, x + CELL_PAD_X, y + ROW_PAD_Y + 11 + lineIndex * LINE_HEIGHT);
    });
    x += column.width;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const binary = atob(dataUrl.split(",")[1] ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function createPageCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(PAGE_WIDTH * SCALE);
  canvas.height = Math.round(PAGE_HEIGHT * SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建 PDF 画布");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";
  return { canvas, ctx };
}

export function assembleJpegPagesPdf(pages: PdfPage[]) {
  const objects: Uint8Array[] = [
    ascii("<< /Type /Catalog /Pages 2 0 R >>"),
    ascii(
      "<< /Type /Pages /Kids [" +
        pages.map((_, index) => 3 + index * 2 + " 0 R").join(" ") +
        "] /Count " +
        pages.length +
        " >>",
    ),
  ];

  pages.forEach((page, index) => {
    const pageObject = 3 + index * 2;
    const imageObject = pageObject + 1;
    const contentObject = 3 + pages.length * 2 + index;
    objects.push(
      ascii(
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
          page.width.toFixed(2) +
          " " +
          page.height.toFixed(2) +
          "] /Resources << /XObject << /Im" +
          (index + 1) +
          " " +
          imageObject +
          " 0 R >> >> /Contents " +
          contentObject +
          " 0 R >>",
      ),
    );
    objects.push(
      concatBytes([
        ascii(
          "<< /Type /XObject /Subtype /Image /Width " +
            Math.round(page.width * SCALE) +
            " /Height " +
            Math.round(page.height * SCALE) +
            " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
            page.content.length +
            " >>\nstream\n",
        ),
        page.content,
        ascii("\nendstream"),
      ]),
    );
  });

  pages.forEach((page, index) => {
    const stream =
      "q\n" +
      page.width.toFixed(2) +
      " 0 0 " +
      page.height.toFixed(2) +
      " 0 0 cm\n/Im" +
      (index + 1) +
      " Do\nQ";
    objects.push(ascii("<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream"));
  });

  const chunks: Uint8Array[] = [ascii("%PDF-1.4\n")];
  const offsets = [0];
  let cursor = chunks[0].length;
  objects.forEach((object, index) => {
    offsets[index + 1] = cursor;
    const header = ascii(index + 1 + " 0 obj\n");
    const footer = ascii("\nendobj\n");
    chunks.push(header, object, footer);
    cursor += header.length + object.length + footer.length;
  });

  const xref =
    "xref\n0 " +
    (objects.length + 1) +
    "\n0000000000 65535 f \n" +
    offsets
      .slice(1)
      .map((offset) => padOffset(offset) + " 00000 n \n")
      .join("") +
    "trailer\n<< /Size " +
    (objects.length + 1) +
    " /Root 1 0 R >>\nstartxref\n" +
    cursor +
    "\n%%EOF";
  chunks.push(ascii(xref));
  return concatBytes(chunks);
}

export function renderWaybillTimelinePages(
  detail: WaybillTimelineSource,
  generatedAt = new Date().toLocaleString("zh-CN", { hour12: false }),
) {
  const view = buildWaybillTimelineView(detail);
  const measure = createPageCanvas();
  const eventPages = paginateRows(measure.ctx, view);
  const pageCount = Math.max(eventPages.length, 1);

  return Array.from({ length: pageCount }, (_, pageIndex) => {
    const { canvas, ctx } = createPageCanvas();
    drawHeader(ctx, view, pageIndex, pageCount);
    const tableY = HEADER_HEIGHT;
    drawTableHeader(ctx, tableY);
    const items = eventPages[pageIndex] ?? [];
    let y = tableY + TABLE_HEADER_HEIGHT;
    items.forEach((item, index) => {
      drawRow(ctx, item, y, index % 2 === 1);
      y += item.height;
    });
    if (items.length === 0) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "12px " + FONT_FAMILY;
      ctx.fillText("暂无轨迹节点", MARGIN_X + CELL_PAD_X, y + 28);
    }
    drawFooter(ctx, generatedAt);
    return {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      content: canvasToJpeg(canvas),
    };
  });
}

export function buildWaybillTimelinePdf(detail: WaybillTimelineSource, generatedAt?: string) {
  return assembleJpegPagesPdf(renderWaybillTimelinePages(detail, generatedAt));
}

export function downloadWaybillTimelinePdf(detail: WaybillTimelineSource) {
  const pdf = buildWaybillTimelinePdf(detail);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = detail.waybill.waybill_no + ".pdf";
  link.click();
  URL.revokeObjectURL(url);
}
