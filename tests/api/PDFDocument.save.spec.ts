import fs from 'fs';
import { PDFDocument, StandardFonts } from '../../src/index';
import { PDFHeader } from '../../src/core';

const examplePngImageBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

const examplePngImage = `data:image/png;base64,${examplePngImageBase64}`;

const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');

const simplePdfBytes = fs.readFileSync('assets/pdfs/simple.pdf');

const v15PdfBytes = fs.readFileSync('assets/pdfs/v15xref.pdf');

const v14PdfBytes = fs.readFileSync('assets/pdfs/bixby_guide.pdf');

const v13PdfBytes = normalPdfBytes;

describe('PDFDocument', () => {
  describe('save() method', () => {
    it('can be called multiple times on the same PDFDocument with different changes', async () => {
      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedPng(examplePngImage);

      const noErrorFunc = async () => {
        const page1 = pdfDoc.addPage();
        page1.drawImage(embeddedImage);

        const pdfBytes1 = await pdfDoc.save();
        expect(pdfBytes1.byteLength).toBeGreaterThan(0);

        const page2 = pdfDoc.addPage();
        page2.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test');

        const pdfBytes2 = await pdfDoc.save();
        expect(pdfBytes2.byteLength).toBeGreaterThan(0);
        expect(pdfBytes2.byteLength).not.toEqual(pdfBytes1.byteLength);

        const pdfPage3 = pdfDoc.addPage();
        pdfPage3.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test 2. change');

        const pdfBytes3 = await pdfDoc.save();
        expect(pdfBytes3.byteLength).toBeGreaterThan(0);
        expect(pdfBytes3.byteLength).not.toEqual(pdfBytes2.byteLength);
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('returns the full pdf, when pdf not open for incremental update', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      const snapshot = pdfDoc.takeSnapshot();
      const page = pdfDoc.getPage(0);
      snapshot.markRefForSave(page.ref);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const firstFullPDF = await pdfDoc.save();
      expect(firstFullPDF.byteLength).toBeGreaterThan(
        simplePdfBytes.byteLength,
      );
      pdfDoc.takeSnapshot();
      const secondFullPDF = await pdfDoc.save();
      expect(secondFullPDF).toEqual(firstFullPDF);
    });

    it('returns the full pdf when open for incremental update', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const snapshot = pdfDoc.takeSnapshot();
      const page = pdfDoc.getPage(0);
      snapshot.markRefForSave(page.ref);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const firstFullPDF = await pdfDoc.save();
      expect(firstFullPDF.byteLength).toBeGreaterThan(
        simplePdfBytes.byteLength,
      );
      for (let bi = 0; bi < simplePdfBytes.byteLength; bi++) {
        expect(firstFullPDF[bi]).toBe(simplePdfBytes[bi]);
      }
      pdfDoc.takeSnapshot();
      const secondFullPDF = await pdfDoc.save();
      expect(secondFullPDF).toEqual(firstFullPDF);
    });

    it('respects PDF version when saving incrementally', async () => {
      const getIncrementedLastChunk = async (pdfBytes: Buffer) => {
        const pdfDoc = await PDFDocument.load(pdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(0);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });
        const incrementedPDFBytes = await pdfDoc.save();
        const str = Buffer.from(incrementedPDFBytes).toString();
        return str.substring(str.length - 512);
      };
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v13PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v14PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // 1.7 should use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(simplePdfBytes)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);

    it('objectStreams usage can be forced', async () => {
      const pdfDoc = await PDFDocument.load(v13PdfBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const incrementedPDFBytes = await pdfDoc.save({ useObjectStreams: true });
      const str = Buffer.from(incrementedPDFBytes).toString();
      expect(str.substring(str.length - 512)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);

    it('properly handles XRef Streams on full save', async () => {
      const pdfDoc = await PDFDocument.load(v15PdfBytes);
      const savedBytes = await pdfDoc.save();
      const str = Buffer.from(savedBytes).toString();
      expect(str.match(/XRef/g)?.length).toBe(1);

      // Round-trip: the saved bytes must produce a loadable PDF
      const reloaded = await PDFDocument.load(savedBytes);
      expect(reloaded.getPageCount()).toBe(pdfDoc.getPageCount());

      const noStmIB = await pdfDoc.save({ useObjectStreams: false });
      const noStrmStr = Buffer.from(noStmIB).toString();
      expect(noStrmStr.match(/XRef/g)).toBeNull();

      // Round-trip without object streams
      const reloaded2 = await PDFDocument.load(noStmIB);
      expect(reloaded2.getPageCount()).toBe(pdfDoc.getPageCount());
    });
  });

  describe('save() PDF header version', () => {
    it('bumps the header when rewriting a pre-1.5 document with object streams', async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      pdfDoc.context.header = PDFHeader.forVersion(1, 3);
      pdfDoc.addPage();

      const bytes = await pdfDoc.save({ rewrite: true });
      const text = Buffer.from(bytes).toString('latin1');

      // PDFStreamWriter emits a cross-reference stream (PDF 1.5+); the header
      // must be raised to match.
      expect(pdfDoc.context.header.getVersionString()).toBe('1.7');
      expect(text).toContain('%PDF-1.7');
      expect(text).toContain('/Type /XRef');
    });

    it('preserves a pre-1.5 header when object streams are not used', async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      pdfDoc.context.header = PDFHeader.forVersion(1, 4);
      pdfDoc.addPage();

      const bytes = await pdfDoc.save({ useObjectStreams: false });
      const text = Buffer.from(bytes).toString('latin1');

      expect(pdfDoc.context.header.getVersionString()).toBe('1.4');
      expect(text).toContain('%PDF-1.4');
      expect(text).not.toContain('/Type /XRef');
    });
  });
});
