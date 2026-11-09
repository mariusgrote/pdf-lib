import fs from 'fs';
import { ParseSpeeds, PDFDocument, AFRelationship } from '../../src/index';
import type { PDFAttachment } from '../../src/api/PDFDocument';

const examplePngImageBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

const examplePngImage = `data:image/png;base64,${examplePngImageBase64}`;

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');

const hasAttachmentPdfBytes = fs.readFileSync(
  'assets/pdfs/examples/add_attachments.pdf',
);

describe('PDFDocument', () => {
  describe('getAttachments() method', () => {
    it('Can read attachments from an existing pdf file', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      const attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);
      const jpgAttachment = attachments.find(
        (attachment) => attachment.name === 'cat_riding_unicorn.jpg',
      )!;
      const pdfAttachment = attachments.find(
        (attachment) => attachment.name === 'us_constitution.pdf',
      )!;
      expect(pdfAttachment).toBeDefined();
      expect(jpgAttachment).toBeDefined();
      expect(jpgAttachment.description).toBe(
        'Cool cat riding a unicorn! 🦄🐈🕶️',
      );
      expect(pdfAttachment.description).toBe(
        'Constitution of the United States 🇺🇸🦅',
      );
      expect(jpgAttachment.mimeType).toBe('image/jpeg');
      expect(pdfAttachment.mimeType).toBe('application/pdf');
      expect(jpgAttachment.afRelationship).not.toBeDefined();
      expect(pdfAttachment.afRelationship).not.toBeDefined();
      const jpgAttachmentBytes = fs.readFileSync(
        'assets/images/cat_riding_unicorn.jpg',
      );
      const pdfAttachmentBytes = fs.readFileSync(
        'assets/pdfs/us_constitution.pdf',
      );
      expect(jpgAttachmentBytes).toEqual(Buffer.from(jpgAttachment.data));
      expect(pdfAttachmentBytes).toEqual(Buffer.from(pdfAttachment.data));
    });

    it('Can get saved and unsaved attachments', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      const haiku = `Cradled in silence,
      sunlight warms the fragile shell —
      breakfast is reborn.`;
      const creationDate = new Date(Date.now() - 60 * 60 * 1000);
      const modificationDate = new Date();
      await pdfDoc.attach(Buffer.from(haiku), 'haiku.txt', {
        mimeType: 'text/plain',
        description: '🥚 Haikus are short. So is the life of an egg. 🍳',
        afRelationship: AFRelationship.Supplement,
        creationDate,
        modificationDate,
      });
      await pdfDoc.attach(examplePngImage, 'example.png', {
        mimeType: 'image/png',
        description: 'An example image',
        afRelationship: AFRelationship.Alternative,
        creationDate,
        modificationDate,
      });

      const attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(4);
      const jpgAttachment = attachments.find(
        (attachment) => attachment.name === 'cat_riding_unicorn.jpg',
      )!;
      const pdfAttachment = attachments.find(
        (attachment) => attachment.name === 'us_constitution.pdf',
      )!;
      const txtAttachment = attachments.find(
        (attachment) => attachment.name === 'haiku.txt',
      )!;
      const pngAttachment = attachments.find(
        (attachment) => attachment.name === 'example.png',
      )!;
      expect(pdfAttachment).toBeDefined();
      expect(jpgAttachment).toBeDefined();
      expect(txtAttachment).toBeDefined();
      expect(jpgAttachment.description).toBe(
        'Cool cat riding a unicorn! 🦄🐈🕶️',
      );
      expect(pdfAttachment.description).toBe(
        'Constitution of the United States 🇺🇸🦅',
      );
      expect(txtAttachment.description).toBe(
        '🥚 Haikus are short. So is the life of an egg. 🍳',
      );
      expect(pngAttachment.description).toBe('An example image');
      expect(jpgAttachment.mimeType).toBe('image/jpeg');
      expect(pdfAttachment.mimeType).toBe('application/pdf');
      expect(txtAttachment.mimeType).toBe('text/plain');
      expect(pngAttachment.mimeType).toBe('image/png');
      expect(jpgAttachment.afRelationship).not.toBeDefined();
      expect(pdfAttachment.afRelationship).not.toBeDefined();
      expect(txtAttachment.afRelationship).toBe(AFRelationship.Supplement);
      expect(pngAttachment.afRelationship).toBe(AFRelationship.Alternative);
      const jpgAttachmentBytes = fs.readFileSync(
        'assets/images/cat_riding_unicorn.jpg',
      );
      const pdfAttachmentBytes = fs.readFileSync(
        'assets/pdfs/us_constitution.pdf',
      );
      expect(jpgAttachmentBytes).toEqual(Buffer.from(jpgAttachment.data));
      expect(pdfAttachmentBytes).toEqual(Buffer.from(pdfAttachment.data));
      expect(new TextDecoder().decode(txtAttachment.data)).toBe(haiku);
      const expectedImageBytes = Uint8Array.from(
        atob(examplePngImageBase64),
        (c) => c.charCodeAt(0),
      );
      expect(pngAttachment.data).toEqual(expectedImageBytes);
      expect(jpgAttachment.creationDate).toBeDefined();
      expect(pdfAttachment.creationDate).toBeDefined();
      expect(txtAttachment.creationDate).toBe(creationDate);
      expect(pngAttachment.creationDate).toBe(creationDate);
      expect(jpgAttachment.modificationDate).toBeDefined();
      expect(pdfAttachment.modificationDate).toBeDefined();
      expect(txtAttachment.modificationDate).toBe(modificationDate);
      expect(pngAttachment.modificationDate).toBe(modificationDate);
    });

    describe('allow attachment data to be passed in different formats', () => {
      let pdfDoc: PDFDocument;
      const mimeType = 'text/plain';
      const description = '🥚 Haikus are short. So is the life of an egg. 🍳';
      const attachment = `Cradled in silence,
  sunlight warms the fragile shell —
  breakfast is reborn.`;
      const afRelationship = AFRelationship.Alternative;
      let attachments: PDFAttachment[];

      beforeAll(async () => {
        const parseSpeed = ParseSpeeds.Fastest;
        pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
        const base64 = Buffer.from(attachment).toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        await pdfDoc.attach(dataUrl, 'string.txt', {
          mimeType,
          description,
          afRelationship,
        });

        await pdfDoc.attach(
          new TextEncoder().encode(attachment),
          'uint8array.txt',
          {
            mimeType,
            description,
            afRelationship,
          },
        );

        await pdfDoc.attach(Buffer.from(attachment), 'buffer.txt', {
          mimeType,
          description,
          afRelationship,
        });

        const pdfBytes = await pdfDoc.save();
        pdfDoc = await PDFDocument.load(pdfBytes);
        attachments = pdfDoc.getAttachments();
      });

      it('should attach 3 attachments', () => {
        expect(attachments).toHaveLength(3);
      });

      it('should attach data URL attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'string.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });

      it('should attach Uint8Array attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'uint8array.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });

      it('should attach buffer attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'buffer.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });
    });
  });
});
