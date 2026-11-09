import fs from 'fs';
import { PDFDocument } from '../../src/index';

const simplePdfBytes = fs.readFileSync('assets/pdfs/simple.pdf');

const simpleStreamsPdfBytes = fs.readFileSync('assets/pdfs/simple_streams.pdf');

describe('PDFDocument', () => {
  describe('largestObjectNumber detection', () => {
    it('loads pdfs with XREF streams', async () => {
      const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes);
      expect(pdfDoc.context.largestObjectNumber).toBe(8);
    });

    it('loads pdfs without XREF streams', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      expect(pdfDoc.context.largestObjectNumber).toBe(8);
    });

    it('preserves deleted objects numbers if open for update', async () => {
      const pdfBytes = fs.readFileSync(
        './assets/pdfs/with_update_sections.pdf',
      );
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: false,
      });
      expect(pdfDoc.context.largestObjectNumber).toBeGreaterThanOrEqual(131);
      const pdfUpdDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: true,
      });
      expect(pdfUpdDoc.context.largestObjectNumber).toBe(334);
    });

    it('keeps largestObjectNumber across linearized sections with smaller final Size', async () => {
      const pdfBytes = fs.readFileSync(
        './assets/pdfs/linearized_with_object_streams.pdf',
      );
      const pdfUpdDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: true,
        updateMetadata: false,
      });

      const finalSize = pdfUpdDoc.context.trailerInfo.Size!.asNumber();
      // This fixture's final trailer Size is lower than the true max object number.
      // largestObjectNumber must not be collapsed to that smaller Size-1.
      expect(pdfUpdDoc.context.largestObjectNumber).toBeGreaterThan(
        finalSize - 1,
      );
      expect(pdfUpdDoc.context.largestObjectNumber).toBe(85334);

      // The final XRef stream omits Root/Info/ID; they must be kept from earlier sections.
      expect(pdfUpdDoc.context.trailerInfo.Root).toBeTruthy();
      expect(pdfUpdDoc.context.trailerInfo.Info).toBeTruthy();
      expect(pdfUpdDoc.context.trailerInfo.ID).toBeTruthy();
    }, 30000);
  });
});
