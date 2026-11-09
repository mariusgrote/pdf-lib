import fontkit from '@cantoo/fontkit';
import fs from 'fs';
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFNumber,
  StandardFonts,
} from '../../src/index';

const examplePngImageBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

const examplePngImage = `data:image/png;base64,${examplePngImageBase64}`;

const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');

const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');

const simplePdfBytes = fs.readFileSync('assets/pdfs/simple.pdf');

const simpleStreamsPdfBytes = fs.readFileSync('assets/pdfs/simple_streams.pdf');

const v14PdfBytes = fs.readFileSync('assets/pdfs/bixby_guide.pdf');

const v13PdfBytes = normalPdfBytes;

describe('PDFDocument', () => {
  describe('saveIncremental() method', () => {
    it('can be used with different pages', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('can be used with object-stream PDFs', async () => {
      const noErrorFunc = async () => {
        const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes);
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

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('saves deleted objects', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markDeletedRef(page.ref);
        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
          useObjectStreams: false,
        });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(Buffer.from(pdfIncrementalBytes).toString()).toMatch(
          `xref\n0 1\n${page.ref.objectNumber.toString().padStart(10, '0')} 65535 f \n${page.ref.objectNumber.toString()} 1\n0000000000 00001 f`,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('respects PDF version for XREF generation', async () => {
      const getIncrementedLastChunk = async (pdfBytes: Buffer) => {
        const pdfDoc = await PDFDocument.load(pdfBytes);
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
        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        const str = Buffer.from(pdfIncrementalBytes).toString();
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
      const pdfDoc = await PDFDocument.load(v13PdfBytes);
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
      const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
        useObjectStreams: true,
      });
      const str = Buffer.from(pdfIncrementalBytes).toString();
      expect(str.substring(str.length - 512)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);
  });

  describe('commit() method', () => {
    it('allows multiple incremental updates without reloading', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      page.drawText('First update', {
        x: 50,
        y: 200,
        size: 30,
        font: timesRomanFont,
      });
      const firstCommit = await pdfDoc.commit();
      expect(firstCommit.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);
      expect(
        Array.from(firstCommit.slice(0, simplePdfBytes.byteLength)),
      ).toEqual(Array.from(simplePdfBytes));

      page.drawText('Second update', {
        x: 50,
        y: 160,
        size: 30,
        font: timesRomanFont,
      });
      const secondCommit = await pdfDoc.commit();
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);
      expect(Array.from(secondCommit.slice(0, firstCommit.byteLength))).toEqual(
        Array.from(firstCommit),
      );

      page.drawText('Third update', {
        x: 50,
        y: 120,
        size: 30,
        font: timesRomanFont,
      });
      const thirdCommit = await pdfDoc.commit();
      expect(thirdCommit.byteLength).toBeGreaterThan(secondCommit.byteLength);
      expect(Array.from(thirdCommit.slice(0, secondCommit.byteLength))).toEqual(
        Array.from(secondCommit),
      );

      const finalDoc = await PDFDocument.load(thirdCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('throws error if document was not loaded with forIncrementalUpdate', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      await expect(pdfDoc.commit()).rejects.toThrow(
        'commit() requires the document to be loaded with forIncrementalUpdate: true',
      );
    });

    it('works with newly created documents after first save', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage();
      const firstSave = await pdfDoc.save();

      const loadedDoc = await PDFDocument.load(firstSave, {
        forIncrementalUpdate: true,
      });
      loadedDoc.getPage(0).drawText('Update after creation');
      const committed = await loadedDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(firstSave.byteLength);
    });

    it('replaces existing context snapshot after commit', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const initialSnapshot = pdfDoc.takeSnapshot();
      pdfDoc.context.snapshot = initialSnapshot;

      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      pdfDoc.getPage(0).drawText('Test using existing snapshot', {
        x: 50,
        y: 200,
        size: 20,
        font: timesRomanFont,
      });

      const originalTakeSnapshot = pdfDoc.takeSnapshot.bind(pdfDoc);
      let takeSnapshotCalled = false;
      pdfDoc.takeSnapshot = function () {
        takeSnapshotCalled = true;
        return originalTakeSnapshot();
      };

      const committed = await pdfDoc.commit();

      expect(takeSnapshotCalled).toBe(true);
      expect(committed.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);
      expect(pdfDoc.context.snapshot).toBeDefined();
      expect(pdfDoc.context.snapshot).not.toBe(initialSnapshot);
    });

    it('does not create duplicate font objects on multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      page.drawText('First commit', {
        x: 50,
        y: 200,
        size: 20,
        font: timesRomanFont,
      });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Second commit', {
        x: 50,
        y: 160,
        size: 20,
        font: timesRomanFont,
      });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(4);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);
    });

    it('does not create duplicate image objects on multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const originalPageCount = pdfDoc.getPageCount();
      const page = pdfDoc.getPage(0);
      const pngImage = await pdfDoc.embedPng(examplePngImage);

      page.drawImage(pngImage, { x: 50, y: 400, width: 50, height: 50 });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawImage(pngImage, { x: 150, y: 400, width: 50, height: 50 });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(3);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(originalPageCount);
    });

    it('handles adding pages between commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const initialPageCount = pdfDoc.getPageCount();

      pdfDoc.getPage(0).drawText('Before adding page');
      const firstCommit = await pdfDoc.commit();

      const newPage = pdfDoc.addPage();
      newPage.drawText('New page content', { x: 50, y: 700 });
      const secondCommit = await pdfDoc.commit();

      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(initialPageCount + 1);
    });

    it('handles removing pages between commits', async () => {
      const createDoc = await PDFDocument.create();
      createDoc.addPage();
      createDoc.addPage();
      createDoc.addPage();
      const multiPagePdfBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(multiPagePdfBytes, {
        forIncrementalUpdate: true,
      });
      expect(pdfDoc.getPageCount()).toBe(3);

      pdfDoc.getPage(0).drawText('First page');
      await pdfDoc.commit();

      pdfDoc.removePage(2);
      const secondCommit = await pdfDoc.commit();

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(2);
    });

    it('works correctly with PDFs using object streams', async () => {
      const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Object streams test', { x: 50, y: 200 });
      const firstCommit = await pdfDoc.commit();

      expect(firstCommit.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      expect(
        Array.from(firstCommit.slice(0, simpleStreamsPdfBytes.byteLength)),
      ).toEqual(Array.from(simpleStreamsPdfBytes));

      pdfDoc
        .getPage(0)
        .drawText('Second object streams update', { x: 50, y: 160 });
      const secondCommit = await pdfDoc.commit();

      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('produces valid XREF chain after multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);

      page.drawText('Commit 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      page.drawText('Commit 2', { x: 50, y: 650 });
      const commit2 = await pdfDoc.commit();

      page.drawText('Commit 3', { x: 50, y: 600 });
      const commit3 = await pdfDoc.commit();

      page.drawText('Commit 4', { x: 50, y: 550 });
      const commit4 = await pdfDoc.commit();

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
      expect(commit3.byteLength).toBeGreaterThan(commit2.byteLength);
      expect(commit4.byteLength).toBeGreaterThan(commit3.byteLength);

      const finalDoc = await PDFDocument.load(commit4);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());

      const doc1 = await PDFDocument.load(commit1);
      const doc2 = await PDFDocument.load(commit2);
      const doc3 = await PDFDocument.load(commit3);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc3.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('tracks metadata changes between commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.setTitle('First Title');
      pdfDoc.setAuthor('First Author');
      const firstCommit = await pdfDoc.commit();

      pdfDoc.setTitle('Second Title');
      pdfDoc.setAuthor('Second Author');
      const secondCommit = await pdfDoc.commit();

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getTitle()).toBe('Second Title');
      expect(finalDoc.getAuthor()).toBe('Second Author');

      const intermediateDoc = await PDFDocument.load(firstCommit);
      expect(intermediateDoc.getTitle()).toBe('First Title');
      expect(intermediateDoc.getAuthor()).toBe('First Author');
    });

    it('does not duplicate custom fonts on multiple commits', async () => {
      const customFontBytes = fs.readFileSync(
        'assets/fonts/ubuntu/Ubuntu-R.ttf',
      );
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(customFontBytes);
      const page = pdfDoc.getPage(0);

      page.drawText('Custom font first', {
        x: 50,
        y: 200,
        size: 20,
        font: customFont,
      });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Custom font second', {
        x: 50,
        y: 160,
        size: 20,
        font: customFont,
      });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(4);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('handles commit with no changes gracefully', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Initial change');
      const firstCommit = await pdfDoc.commit();
      const secondCommit = await pdfDoc.commit();

      const doc1 = await PDFDocument.load(firstCommit);
      const doc2 = await PDFDocument.load(secondCommit);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(secondCommit.byteLength).toBeGreaterThanOrEqual(
        firstCommit.byteLength,
      );
    });

    it('save() still works correctly after commit()', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Before commit');
      await pdfDoc.commit();

      pdfDoc.getPage(0).drawText('After commit', { y: 100 });
      const regularSave = await pdfDoc.save();
      const rewriteSave = await pdfDoc.save({ rewrite: true });

      const doc1 = await PDFDocument.load(regularSave);
      const doc2 = await PDFDocument.load(rewriteSave);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('commit() after save() works correctly', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Before save');
      const savedBytes = await pdfDoc.save();

      pdfDoc.getPage(0).drawText('After save, before commit', { y: 100 });
      const committed = await pdfDoc.commit();

      const doc1 = await PDFDocument.load(savedBytes);
      const doc2 = await PDFDocument.load(committed);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(committed.byteLength).toBeGreaterThan(0);
    });

    it('handles multiple fonts embedded before first commit', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);

      page.drawText('Times Roman', { x: 50, y: 700, font: timesRoman });
      page.drawText('Helvetica', { x: 50, y: 650, font: helvetica });
      page.drawText('Courier', { x: 50, y: 600, font: courier });
      await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Times Roman 2', { x: 50, y: 500, font: timesRoman });
      page.drawText('Helvetica 2', { x: 50, y: 450, font: helvetica });
      page.drawText('Courier 2', { x: 50, y: 400, font: courier });
      await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(5);

      const finalBytes = await pdfDoc.save();
      const finalDoc = await PDFDocument.load(finalBytes);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('handles drawing on different pages between commits', async () => {
      const createDoc = await PDFDocument.create();
      createDoc.addPage();
      createDoc.addPage();
      createDoc.addPage();
      const multiPageBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(multiPageBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Page 1 - Commit 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      pdfDoc.getPage(1).drawText('Page 2 - Commit 2', { x: 50, y: 700 });
      const commit2 = await pdfDoc.commit();

      pdfDoc.getPage(2).drawText('Page 3 - Commit 3', { x: 50, y: 700 });
      const commit3 = await pdfDoc.commit();

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
      expect(commit3.byteLength).toBeGreaterThan(commit2.byteLength);

      const finalDoc = await PDFDocument.load(commit3);
      expect(finalDoc.getPageCount()).toBe(3);
    });

    it('preserves signature field widgets after incremental updates', async () => {
      const signaturePdfBytes = fs.readFileSync(
        'assets/pdfs/with_signature.pdf',
      );
      const pdfDoc = await PDFDocument.load(signaturePdfBytes, {
        forIncrementalUpdate: true,
      });

      const originalLength = signaturePdfBytes.byteLength;

      pdfDoc.getPage(0).drawText('Incremental update preserving signature', {
        x: 50,
        y: 50,
      });
      const committed = await pdfDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(originalLength);
      expect(Array.from(committed.slice(0, originalLength))).toEqual(
        Array.from(signaturePdfBytes),
      );

      const reloadedDoc = await PDFDocument.load(committed);
      expect(reloadedDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('preserves bytes exactly for signature validity', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Update 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      for (let i = 0; i < simplePdfBytes.byteLength; i++) {
        expect(commit1[i]).toBe(simplePdfBytes[i]);
      }

      pdfDoc.getPage(0).drawText('Update 2', { x: 50, y: 650 });
      const commit2 = await pdfDoc.commit();

      for (let i = 0; i < commit1.byteLength; i++) {
        expect(commit2[i]).toBe(commit1[i]);
      }

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
    });

    it('tracks PDFArray modifications for incremental saves', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const pageDict = page.node;
      const context = pdfDoc.context;

      const annotDict = context.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [100, 100, 200, 200],
        Contents: 'Test annotation',
      });
      const annotRef = context.register(annotDict);

      const annotsArray = context.obj([annotRef]);
      const annotsRef = context.register(annotsArray);
      pageDict.set(PDFName.of('Annots'), annotsRef);

      const committed = await pdfDoc.commit();

      const reloaded = await PDFDocument.load(committed);
      const reloadedPage = reloaded.getPage(0);
      const reloadedAnnots = reloadedPage.node.lookup(
        PDFName.of('Annots'),
        PDFArray,
      );
      expect(reloadedAnnots).toBeDefined();
      expect(reloadedAnnots.size()).toBe(1);
    });

    it('tracks PDFArray.push() for existing arrays', async () => {
      const createDoc = await PDFDocument.create();
      const createPage = createDoc.addPage();
      const createContext = createDoc.context;

      const initialAnnot = createContext.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [10, 10, 50, 50],
        Contents: 'Initial',
      });
      const initialRef = createContext.register(initialAnnot);
      const annotsArray = createContext.obj([initialRef]);
      const annotsRef = createContext.register(annotsArray);
      createPage.node.set(PDFName.of('Annots'), annotsRef);

      const initialBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(initialBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const pageDict = page.node;
      const context = pdfDoc.context;

      const existingAnnots = pageDict.lookup(PDFName.of('Annots'), PDFArray);
      expect(existingAnnots).toBeDefined();
      expect(existingAnnots.size()).toBe(1);

      const newAnnot = context.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [100, 100, 150, 150],
        Contents: 'New annotation',
      });
      const newRef = context.register(newAnnot);
      existingAnnots.push(newRef);

      const committed = await pdfDoc.commit();

      const reloaded = await PDFDocument.load(committed);
      const reloadedAnnots = reloaded
        .getPage(0)
        .node.lookup(PDFName.of('Annots'), PDFArray);
      expect(reloadedAnnots).toBeDefined();
      expect(reloadedAnnots.size()).toBe(2);
    });

    it('tracks PDFStream content updates for incremental saves', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      page.drawText('Modified stream content', { x: 50, y: 300 });

      const committed = await pdfDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);

      const reloaded = await PDFDocument.load(committed);
      expect(reloaded.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('throws error for encrypted PDFs with forIncrementalUpdate', async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes1, {
          forIncrementalUpdate: true,
        }),
      ).rejects.toThrow();
    });

    it('tracks inline array modifications for incremental saves', async () => {
      // Create a simple PDF
      const createDoc = await PDFDocument.create();
      createDoc.addPage([200, 200]);
      const initialBytes = await createDoc.save();

      // Load for incremental update
      const pdfDoc = await PDFDocument.load(initialBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);

      // Get the MediaBox (inline array, not registered as indirect object)
      const mediaBox = page.node.lookup(PDFName.MediaBox, PDFArray);
      expect(mediaBox).toBeDefined();

      // Verify it's NOT registered (inline)
      const ref = pdfDoc.context.getRef(mediaBox);
      expect(ref).toBeUndefined();

      // Modify it directly
      mediaBox.set(2, PDFNumber.of(300)); // Change width
      mediaBox.set(3, PDFNumber.of(400)); // Change height

      // Commit
      const committed = await pdfDoc.commit();

      // Reload and verify changes were saved
      const reloaded = await PDFDocument.load(committed);
      const reloadedMediaBox = reloaded
        .getPage(0)
        .node.lookup(PDFName.MediaBox, PDFArray);
      expect(reloadedMediaBox.lookup(2, PDFNumber).asNumber()).toBe(300);
      expect(reloadedMediaBox.lookup(3, PDFNumber).asNumber()).toBe(400);
    });
  });

  describe('load({forIncrementalUpdate}) cycle', () => {
    it('can be used with different pages', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(pageIndex);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.save();
        const rewritedBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simplePdfBytes.byteLength,
        );
        expect(rewritedBytes.byteLength).toBeGreaterThan(0);
        expect(rewritedBytes.byteLength).toBeLessThan(
          pdfIncrementalBytes.byteLength,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('can be used with object-stream PDFs', async () => {
      const noErrorFunc = async () => {
        const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes, {
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

        const pdfIncrementalBytes = await pdfDoc.save();
        const pdfRewriteBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
        expect(pdfRewriteBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('registers deleted objects', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      let page = pdfDoc.getPage(0);
      const delONum = page.ref.objectNumber;
      const delOGen = (page.ref.generationNumber + 1).toString();
      pdfDoc.context.delete(page.ref);
      page = pdfDoc.getPage(1);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });

      const pdfIncrementalBytes = await pdfDoc.save({
        useObjectStreams: false,
      });
      const pdfRewriteBytes = await pdfDoc.save({
        rewrite: true,
        useObjectStreams: false,
      });
      expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      expect(pdfRewriteBytes.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      // first element in table must point to deleted page, deleted page must have next gen number
      const rex = new RegExp(
        `xref[\n|\r\n]0 .*[\n|\r\n]${delONum.toString().padStart(10, '0')} 65535 f[\\s\\S]*0000000000 ${delOGen.padStart(5, '0')} f`,
      );
      expect(Buffer.from(pdfIncrementalBytes).toString()).toMatch(rex);
    });

    it('produces same output than manual incremental update', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markObjForSave(pdfDoc.catalog);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
          useObjectStreams: false,
        });
        const finalPdfBytes = Buffer.concat([
          Uint8Array.from(simplePdfBytes),
          Uint8Array.from(pdfIncrementalBytes),
        ]);
        const pdfSaveBytes = Buffer.from(
          await pdfDoc.save({ useObjectStreams: false }),
        );
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(finalPdfBytes.byteLength).toBe(pdfSaveBytes.byteLength);
        expect(finalPdfBytes).toEqual(pdfSaveBytes);
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });
  });

  describe('load({forIncrementalUpdate}) cycle with default save options', () => {
    it('produces an incremental update no larger than a full save', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        const finalPdfBytes = Buffer.concat([
          Uint8Array.from(simplePdfBytes),
          Uint8Array.from(pdfIncrementalBytes),
        ]);
        const pdfSaveBytes = await pdfDoc.save();
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(finalPdfBytes.byteLength).toBeLessThanOrEqual(
          pdfSaveBytes.byteLength,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });
  });
});
