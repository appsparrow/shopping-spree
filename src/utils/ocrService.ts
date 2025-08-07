import Tesseract from 'tesseract.js';

export interface PriceTagInfo {
  productName?: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}

export class OCRService {
  static async extractPriceTagInfo(imageFile: File): Promise<PriceTagInfo> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m)
      });

      console.log('OCR Text:', text);
      
      const result: PriceTagInfo = {};
      
      // Extract prices (looking for $XX.XX or XX.XX patterns)
      const priceRegex = /\$?(\d+\.?\d{0,2})/g;
      const prices: number[] = [];
      let match;
      
      while ((match = priceRegex.exec(text)) !== null) {
        const price = parseFloat(match[1]);
        if (price > 0 && price < 10000) { // reasonable price range
          prices.push(price);
        }
      }
      
      // Sort prices to get lowest and highest
      if (prices.length > 0) {
        prices.sort((a, b) => a - b);
        result.price = prices[0]; // Take lowest price
        
        if (prices.length > 1) {
          result.originalPrice = prices[prices.length - 1]; // Take highest as original
          result.discount = Math.round(((result.originalPrice - result.price) / result.originalPrice) * 100);
        }
      }
      
      // Extract brand names (common brand patterns)
      const brandPatterns = [
        /NIKE/i, /ADIDAS/i, /PUMA/i, /REEBOK/i, /UNDER ARMOUR/i,
        /ZARA/i, /H&M/i, /UNIQLO/i, /GAP/i, /LEVI'S/i,
        /POLO/i, /TOMMY/i, /CALVIN KLEIN/i, /GUESS/i,
        /SAMSUNG/i, /APPLE/i, /SONY/i, /LG/i
      ];
      
      for (const pattern of brandPatterns) {
        const brandMatch = text.match(pattern);
        if (brandMatch) {
          result.brand = brandMatch[0].toUpperCase();
          break;
        }
      }
      
      // Extract product name (first few capitalized words)
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      for (const line of lines) {
        const words = line.trim().split(/\s+/);
        if (words.length >= 2 && words.length <= 5) {
          const capitalizedWords = words.filter(word => 
            /^[A-Z]/.test(word) && word.length > 2 && !/^\$/.test(word)
          );
          if (capitalizedWords.length >= 2) {
            result.productName = capitalizedWords.join(' ');
            break;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }
}